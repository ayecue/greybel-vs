import EventEmitter from 'events';
import { ASTChunkGreyScript, Parser } from 'greyscript-core';
import LRU from 'lru-cache';
import { ASTBaseBlockWithScope } from 'miniscript-core';
import vscode, { TextDocument, Uri } from 'vscode';

import { tryToGetPath } from './fs';
import typeManager from './type-manager';

export interface ParseResultOptions {
  documentManager: DocumentParseQueue;
  content: string;
  textDocument: TextDocument;
  document: ASTBaseBlockWithScope | null;
  errors: Error[];
}

export class ParseResult {
  documentManager: DocumentParseQueue;
  content: string;
  textDocument: TextDocument;
  document: ASTBaseBlockWithScope | null;
  errors: Error[];

  private dependencies?: string[];

  constructor(options: ParseResultOptions) {
    this.documentManager = options.documentManager;
    this.content = options.content;
    this.textDocument = options.textDocument;
    this.document = options.document;
    this.errors = options.errors;
  }

  async getDependencies(): Promise<string[]> {
    if (this.document == null) {
      return [];
    }

    if (this.dependencies) {
      return this.dependencies;
    }

    const rootChunk = this.document as ASTChunkGreyScript;
    const rootPath = Uri.joinPath(this.textDocument.uri, '..');
    const nativeImports = rootChunk.nativeImports
      .filter((nativeImport) => nativeImport.directory)
      .map((nativeImport) => Uri.joinPath(rootPath, nativeImport.directory));
    const importsAndIncludes = await Promise.all([
      ...rootChunk.imports
        .filter((nonNativeImport) => nonNativeImport.path)
        .map((nonNativeImport) => {
          const target = Uri.joinPath(rootPath, nonNativeImport.path);
          const altTarget = Uri.joinPath(
            rootPath,
            `${nonNativeImport.path}.src`
          );
          return tryToGetPath(target, altTarget);
        }),
      ...rootChunk.includes
        .filter((includeImport) => includeImport.path)
        .map((includeImport) => {
          const target = Uri.joinPath(rootPath, includeImport.path);
          const altTarget = Uri.joinPath(rootPath, `${includeImport.path}.src`);
          return tryToGetPath(target, altTarget);
        })
    ]);
    const dependencies: Set<string> = new Set([
      ...nativeImports.map((uri) => uri.toString(true)),
      ...importsAndIncludes.map((uri) => uri.toString(true))
    ]);

    this.dependencies = Array.from(dependencies);

    return this.dependencies;
  }

  async getImports(): Promise<ParseResult[]> {
    if (this.document == null) {
      return [];
    }

    const imports: Set<ParseResult> = new Set();
    const visited: Set<string> = new Set([
      this.textDocument.uri.toString(true)
    ]);
    const traverse = async (rootResult: ParseResult) => {
      const dependencies = await rootResult.getDependencies();

      for (const dependency of dependencies) {
        if (visited.has(dependency)) continue;

        const item = await this.documentManager.open(Uri.parse(dependency));

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

  async getDirtyFiles(includeImports?: boolean): Promise<ParseResult[]> {
    const results: ParseResult[] = [];

    if (this.textDocument.isDirty) results.push(this);
    if (includeImports) {
      const imports = await this.getImports();
      results.push(...imports.filter((it) => it.textDocument.isDirty));
    }

    return results;
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
    const key = document.uri.toString(true);

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
      typeManager.analyze(document.uri.toString(true), chunk);

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

      typeManager.analyze(document.uri.toString(true), strictChunk);

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
    const fileUri = document.uri.toString(true);
    const content = document.getText();

    if (this.queue.has(fileUri)) {
      return false;
    }

    if (this.results.get(fileUri)?.content === content) {
      return false;
    }

    this.queue.set(fileUri, {
      document,
      createdAt: Date.now()
    });

    return true;
  }

  async open(target: Uri): Promise<ParseResult | null> {
    try {
      const textDocument = await vscode.workspace.openTextDocument(target);
      return this.get(textDocument);
    } catch (err) {
      return null;
    }
  }

  get(document: TextDocument): ParseResult {
    return (
      this.results.get(document.uri.toString(true)) || this.refresh(document)
    );
  }

  next(document: TextDocument, timeout: number = 5000): Promise<ParseResult> {
    const me = this;

    if (me.queue.has(document.uri.toString(true))) {
      return new Promise((resolve) => {
        const onTimeout = () => {
          me.removeListener('parsed', onParse);
          resolve(me.get(document));
        };
        const onParse = (evDocument: TextDocument) => {
          if (evDocument.uri.toString(true) === document.uri.toString(true)) {
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
    this.results.delete(document.uri.toString());
    this.emit('cleared', document);
  }
}

export default new DocumentParseQueue();
