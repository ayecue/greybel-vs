import { AnotherAnsiProvider, CommandType, EscapeSequence } from 'another-ansi';
import EventEmitter from 'events';
import vscode, { Terminal } from 'vscode';

const provider = new AnotherAnsiProvider(EscapeSequence.Hex);

export default class PseudoTerminal {
  private terminal: Terminal;
  private writeEmitter: vscode.EventEmitter<string>;
  private emitter: EventEmitter;

  // eslint-disable-next-line no-use-before-define
  static activeTerminals: Set<PseudoTerminal> = new Set<PseudoTerminal>();

  static getActiveTerminal(): PseudoTerminal {
    return this.activeTerminals.values().next().value;
  }

  public constructor(name: string) {
    this.emitter = new EventEmitter();
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
        handleInput: (input: string) => {
          this.emitter.emit('input', input);
        }
      }
    });

    PseudoTerminal.activeTerminals.add(this);
  }

  waitForInput(isPassword: boolean = false): Promise<string> {
    return new Promise((resolve) => {
      let buffer = '';
      const callback = (input: string) => {
        const code = input.charCodeAt(0);

        switch (code) {
          // enter
          case 13: {
            resolve(buffer);
            this.emitter.removeListener('input', callback);
            break;
          }
          // backspace
          case 127:
            if (buffer.length > 0) {
              buffer = buffer.substr(0, buffer.length - 1);
              this.writeEmitter.fire(provider.command(CommandType.Backspace));
            }
            break;
          default: {
            buffer += input;
            this.writeEmitter.fire(isPassword ? '*' : input);
          }
        }
      };

      this.emitter.addListener('input', callback);
    });
  }

  waitForKeyPress(): Promise<string> {
    return new Promise((resolve) => {
      this.emitter.once('input', resolve);
    });
  }

  focus() {
    this.terminal.show(false);
  }

  print(message: string, newline: boolean = true) {
    this.writeEmitter.fire(`${message}\r${newline ? '\n' : ''}`);
  }

  replace(message: string) {
    this.writeEmitter.fire(`${message}\r`);
  }

  clear() {
    this.writeEmitter.fire(provider.command(CommandType.Clear));
  }

  dispose() {
    PseudoTerminal.activeTerminals.delete(this);
    this.terminal.dispose();
  }
}
