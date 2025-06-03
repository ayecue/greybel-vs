import vscode from 'vscode';
import { parseFileExtensions } from './parse-file-extensions';
import { getBuildOutputUri, getBuildRootUri, getPotentialBuildTargetUri } from './build-uri';
import EventEmitter from 'events';
import { wait } from './wait';

function runWithinTime<T>(
  promise: Promise<T>,
  timeout: number
): Promise<T> {
  return Promise.race([
    wait(timeout).then(() => Promise.reject(new Error('Exceeded time!'))),
    promise
  ]);
}

class SyncProcess extends EventEmitter {
  static readonly SYNC_TIMEOUT = 5 * 60 * 1000; // 5 minutes

  private _buildCommand: () => Promise<void>;
  private _delay: number;
  private _timeout: NodeJS.Timeout | null;
  private _pending: boolean;
  private _completed: boolean;

  constructor(buildCommand: () => Promise<void>, delay: number = 1000) {
    super();
    this._buildCommand = buildCommand;
    this._delay = delay;
    this._pending = false;
    this._timeout = null;
    this._completed = false;
  }

  public run(): void {
    if (this._pending) {
      return;
    }

    if (this._completed) {
      return;
    }

    clearTimeout(this._timeout);

    this._timeout = setTimeout(async () => {
      let success = false;

      try {
        this._pending = true;
        this.emit('started');
        await runWithinTime(this._buildCommand(), SyncProcess.SYNC_TIMEOUT);
        success = true;
      } catch (error) {
        this.emit('error', error);
      } finally {
        this._pending = false;
        this._completed = true;
        this.emit('completed', success);
      }
    }, this._delay);
  }

  public isCompleted(): boolean {
    return this._completed;
  }

  public dispose(): void {
    this.removeAllListeners();
    this._buildCommand = null;

    if (this._timeout) {
      clearTimeout(this._timeout);
      this._timeout = null;
    }
  }
}

export class Watcher {
  private _pattern: RegExp;
  private _watcher: vscode.FileSystemWatcher | null;
  private _fileExtensions: string[];
  private _watching: boolean;
  private _buildCommand: () => Promise<void>;
  private _syncProcess: SyncProcess | null;
  private _pendingChanges: number;

  constructor(buildCommand: () => Promise<void>) {
    const config = vscode.workspace.getConfiguration('greybel');

    this._fileExtensions = parseFileExtensions(config.get<string>('fileExtensions')) || ['src', 'gs', 'ms'];
    this._pattern = new RegExp(`\\.(${this._fileExtensions.join('|')})$`);
    this._watcher = null;
    this._watching = false;
    this._syncProcess = null;
    this._pendingChanges = 0;
    this._buildCommand = buildCommand;

    this.listenForActivation();
  }

  private listenForActivation(): void {
    const configChangeCallback = (event: vscode.ConfigurationChangeEvent) => {
      const currentWatchState = vscode.workspace.getConfiguration('greybel')?.get<boolean>('transpiler.watch');

      if (currentWatchState && currentWatchState != this._watching) {
        this._watching = true;
        this.start();
      } else if (!currentWatchState && currentWatchState != this._watching) {
        this._watching = false;
        this.dispose();
      }
    };

    vscode.workspace.onDidChangeConfiguration(configChangeCallback);
    this._watching = vscode.workspace.getConfiguration('greybel')?.get<boolean>('transpiler.watch') ?? false;
  }

  public start(): this {
    if (this._watcher) {
      return this;
    }

    if (!this._watching) {
      return this;
    }

    this._watcher = vscode.workspace.createFileSystemWatcher('**/*');
    this._watcher.onDidChange(this.onDidChange.bind(this));
    this._watcher.onDidCreate(this.onDidChange.bind(this));
    this._watcher.onDidDelete(this.onDidChange.bind(this));

    return this;
  }

  private async onDidChange(uri: vscode.Uri): Promise<void> {
    if (!this._pattern.test(uri.fsPath)) {
      return;
    }

    const targetFilePath = vscode.workspace.getConfiguration('greybel')?.get<string>('rootFile');

    if (targetFilePath == null) {
      return;
    }

    const targetUri = getPotentialBuildTargetUri(targetFilePath, uri);

    if (targetUri == null) {
      return;
    }

    const rootPathUri = getBuildRootUri(targetUri);
    const buildPath = getBuildOutputUri(rootPathUri);

    if (uri.fsPath.startsWith(buildPath.fsPath)) {
      return;
    }

    this._pendingChanges++;
    this.triggerSync();
  }

  private triggerSync() {
    if (this._syncProcess) {
      this._syncProcess.run();
    } else if (this._pendingChanges > 0) {
      this._syncProcess = new SyncProcess(this._buildCommand);
      this._syncProcess.on('started', () => {
        this._pendingChanges = 0;
      });
      this._syncProcess.on('error', (err) => {
       console.error(`An error occurred during the sync process due to: ${err.message}`);
      });
      this._syncProcess.on('completed', () => {
        this._syncProcess.dispose();
        this._syncProcess = null;
        this.triggerSync();
      });
      this._syncProcess.run();
    }
  }

  public dispose(): void {
    if (this._watcher) {
      this._watcher.dispose();
      this._watcher = null;
    }
  }
}