import EventEmitter from 'events';
import { ASTChunkAdvanced, Parser } from 'greybel-core';
import { ASTBase } from 'greyscript-core';
import LRU from 'lru-cache';
import vscode, { TextDocument } from 'vscode';

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
    this.interval = null;
    this.parseTimeout = parseTimeout;
  }

  private resume() {
    if (this.queue.size === 0 || this.interval !== null) {
      return;
    }

    const next = () => {
      const currentTime = Date.now();

      for (const item of this.queue.values()) {
        if (currentTime - item.createdAt > this.parseTimeout) {
          this.refresh(item.document);
        }
      }

      if (this.queue.size > 0) {
        this.interval = setTimeout(next, DOCUMENT_PARSE_QUEUE_INTERVAL);
        return;
      }

      this.interval = null;
    };

    this.interval = setTimeout(next, DOCUMENT_PARSE_QUEUE_INTERVAL);
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
    const chunk = parser.parseChunk();

    if ((chunk as ASTChunkAdvanced).body?.length > 0) {
      return {
        content,
        textDocument: document,
        document: chunk,
        errors: parser.errors
      };
    }

    try {
      const strictParser = new Parser(document.getText());
      const strictChunk = strictParser.parseChunk();

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

    this.resume();

    return true;
  }

  async open(target: string): Promise<ParseResult> {
    const textDocument = await vscode.workspace.openTextDocument(target);
    return this.get(textDocument);
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
