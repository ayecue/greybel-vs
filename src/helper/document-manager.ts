import EventEmitter from 'events';
import { ASTChunkGreyScript, Parser } from 'greyscript-core';
import LRU from 'lru-cache';
import { ASTBase } from 'miniscript-core';
import vscode, { TextDocument, Uri } from 'vscode';

import { tryToGetPath } from './fs';
import typeManager from './type-manager';

export interface ParseResultOptions {
  documentManager: DocumentParseQueue;
  content: string;
  textDocument: TextDocument;
  document: ASTBase | null;
  errors: Error[];
}

export class ParseResult {
  documentManager: DocumentParseQueue;
  content: string;
  textDocument: TextDocument;
  document: ASTBase | null;
  errors: Error[];

  private dependencies?: string[];

  constructor(options: ParseResultOptions) {
    this.documentManager = options.documentManager;
    this.content = options.content;
    this.textDocument = options.textDocument;
    this.document = options.document;
    this.errors = options.errors;
  }

  getDependencies(): string[] {
    if (this.document == null) {
      return [];
    }

    if (this.dependencies) {
      return this.dependencies;
    }

    const rootChunk = this.document as ASTChunkGreyScript;
    const rootPath = Uri.joinPath(Uri.file(this.textDocument.fileName), '..');
    const dependencies: Set<string> = new Set([
      ...rootChunk.nativeImports
        .filter((nativeImport) => nativeImport.directory)
        .map(
          (nativeImport) =>
            Uri.joinPath(rootPath, nativeImport.directory).fsPath
        ),
      ...rootChunk.imports
        .filter((nonNativeImport) => nonNativeImport.path)
        .map(
          (nonNativeImport) =>
            Uri.joinPath(rootPath, nonNativeImport.path).fsPath
        ),
      ...rootChunk.includes
        .filter((includeImport) => includeImport.path)
        .map(
          (includeImport) => Uri.joinPath(rootPath, includeImport.path).fsPath
        )
    ]);

    this.dependencies = Array.from(dependencies);

    return this.dependencies;
  }

  async getImports(): Promise<ParseResult[]> {
    if (this.document == null) {
      return [];
    }

    const imports: Set<ParseResult> = new Set();
    const visited: Set<string> = new Set([this.textDocument.fileName]);
    const traverse = async (rootResult: ParseResult) => {
      const dependencies = rootResult.getDependencies();

      for (const dependency of dependencies) {
        if (visited.has(dependency)) continue;

        const item = await this.documentManager.open(dependency);

        visited.add(dependency);

        if (item === null) continue;

        imports.add(item);

        if (item.document !== null) {
          await traverse(item);
        }
      }
    };

    await traverse(this);

    return Array.from(imports);
  }
}

export interface QueueItem {
  document: TextDocument;
  createdAt: number;
}

export const DOCUMENT_PARSE_QUEUE_INTERVAL = 1000;
export const DOCUMENT_PARSE_QUEUE_PARSE_TIMEOUT = 2500;

export class DocumentParseQueue extends EventEmitter {
  results: LRU<string, ParseResult>;

  private queue: Map<string, QueueItem>;
  private interval: NodeJS.Timeout | null;
  private readonly parseTimeout: number;

  constructor(parseTimeout: number = DOCUMENT_PARSE_QUEUE_PARSE_TIMEOUT) {
    super();
    this.results = new LRU({
      ttl: 1000 * 60 * 20,
      ttlAutopurge: true
    });
    this.queue = new Map();
    this.interval = setInterval(
      () => this.tick(),
      DOCUMENT_PARSE_QUEUE_INTERVAL
    );
    this.parseTimeout = parseTimeout;
  }

  private tick() {
    const currentTime = Date.now();

    for (const item of this.queue.values()) {
      if (currentTime - item.createdAt > this.parseTimeout) {
        this.refresh(item.document);
      }
    }
  }

  refresh(document: TextDocument): ParseResult {
    const key = document.fileName;

    if (!this.queue.has(key) && this.results.has(key)) {
      return this.results.get(key)!;
    }

    const result = this.create(document);
    this.results.set(key, result);
    this.emit('parsed', document, result);
    this.queue.delete(key);

    return result;
  }

  private create(document: TextDocument): ParseResult {
    const content = document.getText();
    const parser = new Parser(content, {
      unsafe: true
    });
    const chunk = parser.parseChunk() as ASTChunkGreyScript;

    if (chunk.body?.length > 0) {
      typeManager.analyze(document, chunk);

      return new ParseResult({
        documentManager: this,
        content,
        textDocument: document,
        document: chunk,
        errors: [...parser.lexer.errors, ...parser.errors]
      });
    }

    try {
      const strictParser = new Parser(document.getText());
      const strictChunk = strictParser.parseChunk() as ASTChunkGreyScript;

      typeManager.analyze(document, strictChunk);

      return new ParseResult({
        documentManager: this,
        content,
        textDocument: document,
        document: strictChunk,
        errors: []
      });
    } catch (err: any) {
      return new ParseResult({
        documentManager: this,
        content,
        textDocument: document,
        document: null,
        errors: [err]
      });
    }
  }

  update(document: TextDocument): boolean {
    const fileName = document.fileName;
    const content = document.getText();

    if (this.queue.has(fileName)) {
      return false;
    }

    if (this.results.get(fileName)?.content === content) {
      return false;
    }

    this.queue.set(fileName, {
      document,
      createdAt: Date.now()
    });

    return true;
  }

  async open(target: string): Promise<ParseResult | null> {
    try {
      const actualPath = await tryToGetPath(target, `${target}.src`);
      const textDocument = await vscode.workspace.openTextDocument(actualPath);
      return this.get(textDocument);
    } catch (err) {
      return null;
    }
  }

  get(document: TextDocument): ParseResult {
    return this.results.get(document.fileName) || this.refresh(document);
  }

  next(document: TextDocument, timeout: number = 5000): Promise<ParseResult> {
    const me = this;

    if (me.queue.has(document.fileName)) {
      return new Promise((resolve) => {
        const onTimeout = () => {
          me.removeListener('parsed', onParse);
          resolve(me.get(document));
        };
        const onParse = (evDocument: TextDocument) => {
          if (evDocument.fileName === document.fileName) {
            me.removeListener('parsed', onParse);
            clearTimeout(timer);
            resolve(me.get(document));
          }
        };
        const timer = setTimeout(onTimeout, timeout);

        me.addListener('parsed', onParse);
      });
    }

    return Promise.resolve(me.get(document));
  }

  clear(document: TextDocument): void {
    this.results.delete(document.fileName);
    this.emit('cleared', document);
  }
}

export default new DocumentParseQueue();
