import EventEmitter from 'events';
import { ASTBase, Parser } from 'greybel-core';
import { TextDocument } from 'vscode';

export interface ParseResult {
  document: ASTBase | null;
  errors: Error[];
}

export interface QueueItem {
  document: TextDocument;
  createdAt: number;
}

export const DOCUMENT_PARSE_QUEUE_INTERVAL = 1000;
export const DOCUMENT_PARSE_QUEUE_PARSE_TIMEOUT = 5000;

export class DocumentParseQueue extends EventEmitter {
  results: Map<string, ParseResult>;

  private queue: Map<string, QueueItem>;
  private interval: NodeJS.Timeout | null;
  private readonly parseTimeout: number;

  constructor(parseTimeout: number = DOCUMENT_PARSE_QUEUE_PARSE_TIMEOUT) {
    super();
    this.results = new Map();
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
    try {
      const strictParser = new Parser(document.getText());
      const strictChunk = strictParser.parseChunk();

      return {
        document: strictChunk,
        errors: []
      };
    } catch (err: any) {
      return {
        document: null,
        errors: [err]
      };
    }
  }

  update(document: TextDocument): boolean {
    const fileName = document.fileName;

    if (this.queue.has(fileName)) {
      return false;
    }

    this.queue.set(fileName, {
      document,
      createdAt: Date.now()
    });

    this.resume();

    return true;
  }

  get(document: TextDocument): ParseResult {
    return this.results.get(document.fileName) || this.refresh(document);
  }

  clear(document: TextDocument): void {
    this.results.delete(document.fileName);
    this.emit('cleared', document);
  }
}

export default new DocumentParseQueue();
