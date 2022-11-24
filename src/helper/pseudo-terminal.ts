import vscode, { Terminal } from 'vscode';

export enum MessageCodes {
  Clear = '\x1b[2J\x1b[3J\x1b[;H',
  NewLine = '\r\n'
}

export default class PseudoTerminal {
  private terminal: Terminal;
  private writeEmitter: vscode.EventEmitter<string>;

  public constructor(name: string) {
    this.writeEmitter = new vscode.EventEmitter<string>();
    this.terminal = vscode.window.createTerminal({
      name,
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
          console.log(_data);
        }
      }
    });
    this.terminal.show(true);
  }

  print(message: string) {
    this.writeEmitter.fire(`${message}${MessageCodes.NewLine}`);
  }

  clear() {
    this.writeEmitter.fire(MessageCodes.Clear);
  }

  dispose() {
    this.terminal.dispose();
  }
}
