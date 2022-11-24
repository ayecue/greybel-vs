import { LoggingDebugSession } from '@vscode/debugadapter';
import vscode, { Terminal } from 'vscode';

export interface MessageBufferItem {
  message: string;
  line?: number;
}

export enum MessageCodes {
  Clear = '\x1b[2J\x1b[3J\x1b[;H',
  NewLine = '\r\n'
}

export default class MessageQueue {
  private buffer: MessageBufferItem[];
  private pending: boolean;
  private ending: boolean;
  private session: LoggingDebugSession;
  private terminal: Terminal;
  private writeEmitter: vscode.EventEmitter<string>;

  public constructor(session: LoggingDebugSession) {
    this.buffer = [];
    this.pending = false;
    this.ending = false;
    this.session = session;
    this.writeEmitter = new vscode.EventEmitter<string>();
    this.terminal = vscode.window.createTerminal({
      name: `greybel`,
      pty: {
        onDidWrite: this.writeEmitter.event,
        open: () => {
          /* noop */
        },
        close: () => {
          /* noop */
        },
        handleInput: (_data: string) => {
          /* noop */
        }
      }
    });
    this.terminal.show(true);
  }

  private digest() {
    const me = this;
    const item = me.buffer.shift();

    if (!item) {
      me.pending = false;
      return;
    }

    me.pending = true;
    me.writeEmitter.fire(`${item.message}${MessageCodes.NewLine}`);

    process.nextTick(() => {
      me.digest();
    });
  }

  clear() {
    this.writeEmitter.fire(MessageCodes.Clear);
  }

  private update() {
    const me = this;

    if (me.ending || me.pending) {
      return;
    }

    me.digest();
  }

  public print(item: MessageBufferItem): MessageQueue {
    const me = this;

    if (typeof item !== 'object') {
      return me;
    }

    me.buffer.push(item);
    me.update();

    return me;
  }

  public end(): MessageQueue {
    const me = this;

    if (me.ending) {
      return me;
    }

    me.ending = true;

    if (!me.pending && me.buffer.length > 0) {
      me.digest();
    }

    me.terminal.dispose();

    return me;
  }
}
