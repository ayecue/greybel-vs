import EventEmitter from 'events';
import { ASTChunkAdvanced, Parser } from 'greybel-core';
import { ASTBase } from 'greyscript-core';
import LRU from 'lru-cache';
import vscode, { TextDocument, Uri } from 'vscode';

import typeManager from './type-manager';

export interface ParseResult {
  content: string;
  textDocument: TextDocument;
  document: ASTBase | null;
  errors: Error[];
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
    const chunk = parser.parseChunk() as ASTChunkAdvanced;

    if (chunk.body?.length > 0) {
      typeManager.analyze(document, chunk);

      return {
        content,
        textDocument: document,
        document: chunk,
        errors: parser.errors
      };
    }

    try {
      const strictParser = new Parser(document.getText());
      const strictChunk = strictParser.parseChunk() as ASTChunkAdvanced;

      typeManager.analyze(document, strictChunk);

      return {
        content,
        textDocument: document,
        document: strictChunk,
        errors: []
      };
    } catch (err: any) {
      return {
        content,
        textDocument: document,
        document: null,
        errors: [err]
      };
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
      const textDocument = await vscode.workspace.openTextDocument(target);
      return this.get(textDocument);
    } catch (err) {
      return null;
    }
  }

  get(document: TextDocument): ParseResult {
    return this.results.get(document.fileName) || this.refresh(document);
  }

  async getImportsOf(document: TextDocument): Promise<ParseResult[]> {
    const rootResult = this.get(document);

    if (rootResult.document === null) {
      return [];
    }

    const visited: Set<string> = new Set([document.fileName]);
    const imports: Set<ParseResult> = new Set();
    const traverse = async (rootResult: ParseResult) => {
      const rootChunk = rootResult.document as ASTChunkAdvanced;
      const rootPath = Uri.joinPath(
        Uri.file(rootResult.textDocument.fileName),
        '..'
      );
      const dependencies: Set<string> = new Set([
        ...rootChunk.nativeImports
          .filter((nativeImport) => nativeImport.directory)
          .map(
            (nativeImport) =>
              Uri.joinPath(rootPath, nativeImport.directory).fsPath
          )
          .filter((importPath) => !visited.has(importPath)),
        ...rootChunk.imports
          .filter((nonNativeImport) => nonNativeImport.path)
          .map(
            (nonNativeImport) =>
              Uri.joinPath(rootPath, nonNativeImport.path).fsPath
          )
          .filter((importPath) => !visited.has(importPath)),
        ...rootChunk.includes
          .filter((includeImport) => `${includeImport.path}.src`)
          .map(
            (includeImport) =>
              Uri.joinPath(rootPath, `${includeImport.path}.src`).fsPath
          )
          .filter((importPath) => !visited.has(importPath))
      ]);

      for (const dependency of dependencies) {
        if (visited.has(dependency)) continue;

        const item = await this.open(dependency);

        visited.add(dependency);

        if (item === null) continue;

        imports.add(item);

        if (item.document !== null) {
          await traverse(item);
        }
      }
    };

    await traverse(rootResult);

    return Array.from(imports);
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
