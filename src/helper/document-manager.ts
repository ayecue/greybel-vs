import EventEmitter from 'events';
import { ASTChunkGreyScript, Parser } from 'greyscript-core';
import { LRUCache as LRU } from 'lru-cache';
import { ASTBaseBlockWithScope } from 'miniscript-core';
import vscode, { TextDocument, Uri } from 'vscode';

import { FileSystemManager, GlobalFileSystemManager } from './fs';
import { parseFileExtensions } from './parse-file-extensions';

export interface ParseResultOptions {
  documentManager: DocumentParseQueue;
  content: string;
  textDocument: TextDocument;
  document: ASTBaseBlockWithScope | null;
  errors: Error[];
}

export class DocumentURIBuilder {
  readonly workspaceFolderUri: Uri | null;
  readonly rootPath: Uri;
  readonly fileExtensions: string[];

  private fileManager: FileSystemManager;

  static async fromTextDocument(
    textDocument: TextDocument
  ): Promise<DocumentURIBuilder> {
    const workspaceFolderUri = GlobalFileSystemManager.getWorkspaceFolderUri(
      textDocument.uri
    );

    return new DocumentURIBuilder(
      Uri.joinPath(textDocument.uri, '..'),
      workspaceFolderUri
    );
  }

  constructor(
    rootPath: Uri,
    workspaceFolderUri: Uri = null,
    fileManager: FileSystemManager = GlobalFileSystemManager
  ) {
    const config = vscode.workspace.getConfiguration('greybel');

    this.fileManager = fileManager;
    this.workspaceFolderUri = workspaceFolderUri;
    this.rootPath = rootPath;
    this.fileExtensions = parseFileExtensions(
      config.get<string>('fileExtensions')
    ) || ['gs', 'ms', 'src'];
  }

  private getFromWorkspaceFolder(path: string): Uri {
    if (this.workspaceFolderUri == null) {
      console.warn(
        'Workspace folders are not available. Falling back to only relative paths.'
      );
      return Uri.joinPath(this.rootPath, path);
    }

    return Uri.joinPath(this.workspaceFolderUri, path);
  }

  private getFromRootPath(path: string): Uri {
    return Uri.joinPath(this.rootPath, path);
  }

  private getAlternativePaths(path: string): Uri[] {
    if (path.startsWith('/')) {
      return this.fileExtensions.map((ext) => {
        return this.getFromWorkspaceFolder(`${path}.${ext}`);
      });
    }
    return this.fileExtensions.map((ext) => {
      return this.getFromRootPath(`${path}.${ext}`);
    });
  }

  private getOriginalPath(path: string): Uri {
    if (path.startsWith('/')) {
      return this.getFromWorkspaceFolder(path);
    }
    return this.getFromRootPath(path);
  }

  async getPathUseReturnOriginal(path: string): Promise<Uri | null> {
    return (await this.getPath(path)) ?? this.getOriginalPath(path);
  }

  getPath(path: string): Promise<Uri | null> {
    return this.fileManager.findExistingPath(
      this.getOriginalPath(path),
      ...this.getAlternativePaths(path)
    );
  }
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

  getDirectory(): Uri {
    return Uri.joinPath(this.textDocument.uri, '..');
  }

  private async getNativeImports(
    workspaceFolderUri: Uri = null
  ): Promise<Uri[]> {
    if (this.document == null) {
      return [];
    }

    const rootChunk = this.document as ASTChunkGreyScript;
    const rootPath = this.getDirectory();
    const builder = new DocumentURIBuilder(rootPath, workspaceFolderUri);

    return Promise.all(
      rootChunk.nativeImports
        .filter((nativeImport) => nativeImport.directory && nativeImport.eval)
        .map(async (nativeImport) => {
          return builder.getPathUseReturnOriginal(nativeImport.directory);
        })
    );
  }

  private async getImportsAndIncludes(
    workspaceFolderUri: Uri = null
  ): Promise<Uri[]> {
    if (this.document == null) {
      return [];
    }

    const rootChunk = this.document as ASTChunkGreyScript;
    const rootPath = this.getDirectory();
    const builder = new DocumentURIBuilder(rootPath, workspaceFolderUri);
    const getPath = (path: string) => {
      return builder.getPathUseReturnOriginal(path);
    };

    return await Promise.all([
      ...rootChunk.imports
        .filter((nonNativeImport) => nonNativeImport.path)
        .map((nonNativeImport) => getPath(nonNativeImport.path)),
      ...rootChunk.includes
        .filter((includeImport) => includeImport.path)
        .map((includeImport) => getPath(includeImport.path))
    ]);
  }

  async getDependencies(): Promise<string[]> {
    if (this.document == null) {
      return [];
    }

    if (this.dependencies) {
      return this.dependencies;
    }

    const workspaceFolder = vscode.workspace.getWorkspaceFolder(
      this.textDocument.uri
    );
    const nativeImports = await this.getNativeImports(workspaceFolder?.uri);
    const importsAndIncludes = await this.getImportsAndIncludes(
      workspaceFolder?.uri
    );
    const dependencies: Set<string> = new Set([
      ...nativeImports.map((it) => it.toString()),
      ...importsAndIncludes.map((it) => it.toString())
    ]);

    this.dependencies = Array.from(dependencies);

    return this.dependencies;
  }

  async getImports(): Promise<ParseResult[]> {
    if (this.document == null) {
      return [];
    }

    const imports: Set<ParseResult> = new Set();
    const visited: Set<string> = new Set([this.textDocument.uri.toString()]);
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

export interface ScheduledItem {
  document: TextDocument;
  createdAt: number;
}

export const DOCUMENT_PARSE_QUEUE_INTERVAL = 1000;
export const DOCUMENT_PARSE_QUEUE_PARSE_TIMEOUT = 2500;

export class DocumentParseQueue extends EventEmitter {
  results: LRU<string, ParseResult>;

  private scheduledItems: Map<string, ScheduledItem>;
  private interval: NodeJS.Timeout | null;
  private readonly parseTimeout: number;

  constructor(parseTimeout: number = DOCUMENT_PARSE_QUEUE_PARSE_TIMEOUT) {
    super();
    this.results = new LRU({
      ttl: 1000 * 60 * 20,
      ttlAutopurge: true
    });
    this.scheduledItems = new Map();
    this.interval = setInterval(
      () => this.tick(),
      DOCUMENT_PARSE_QUEUE_INTERVAL
    );
    this.parseTimeout = parseTimeout;
  }

  private tick() {
    const currentTime = Date.now();

    for (const item of this.scheduledItems.values()) {
      if (currentTime - item.createdAt > this.parseTimeout) {
        this.refresh(item.document);
      }
    }
  }

  refresh(document: TextDocument): ParseResult {
    const key = document.uri.toString();

    if (!this.scheduledItems.has(key) && this.results.has(key)) {
      return this.results.get(key)!;
    }

    const result = this.create(document);
    this.results.set(key, result);
    this.emit('parsed', document, result);
    this.scheduledItems.delete(key);

    return result;
  }

  private create(document: TextDocument): ParseResult {
    const content = document.getText();
    const parser = new Parser(content, {
      unsafe: true
    });
    const chunk = parser.parseChunk() as ASTChunkGreyScript;

    return new ParseResult({
      documentManager: this,
      content,
      textDocument: document,
      document: chunk,
      errors: [...parser.lexer.errors, ...parser.errors]
    });
  }

  update(document: TextDocument): boolean {
    const fileUri = document.uri.toString();
    const content = document.getText();

    if (this.scheduledItems.has(fileUri)) {
      return false;
    }

    if (this.results.get(fileUri)?.content === content) {
      return false;
    }

    this.scheduledItems.set(fileUri, {
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
    return this.results.get(document.uri.toString()) || this.refresh(document);
  }

  getLatest(
    document: TextDocument,
    timeout: number = 5000
  ): Promise<ParseResult> {
    const me = this;

    if (me.scheduledItems.has(document.uri.toString())) {
      return new Promise((resolve) => {
        const onTimeout = () => {
          me.removeListener('parsed', onParse);
          resolve(me.get(document));
        };
        const onParse = (evDocument: TextDocument) => {
          if (evDocument.uri.toString() === document.uri.toString()) {
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
