import { AnotherAnsiProvider, CommandType, EscapeSequence } from 'another-ansi';
import EventEmitter from 'events';
import vscode, { Terminal } from 'vscode';

const provider = new AnotherAnsiProvider(EscapeSequence.Hex);
const normalize = (v: string) =>
  v.replace(/\\n/g, '\n').replace(/(?<!\r)\n/g, '\r\n');

export default class PseudoTerminal {
  private terminal: Terminal;
  private writeEmitter: vscode.EventEmitter<string>;
  private emitter: EventEmitter;
  private closed: boolean;

  // eslint-disable-next-line no-use-before-define
  static activeTerminals: Set<PseudoTerminal> = new Set<PseudoTerminal>();

  static getActiveTerminal(): PseudoTerminal {
    return this.activeTerminals.values().next().value;
  }

  public constructor(name: string) {
    this.emitter = new EventEmitter();
    this.writeEmitter = new vscode.EventEmitter<string>();
    this.closed = false;
    this.terminal = vscode.window.createTerminal({
      name,
      pty: {
        onDidWrite: this.writeEmitter.event,
        open: () => {
          /* noop */
        },
        close: () => {
          this.closed = true;
          this.emitter.emit('close');
        },
        handleInput: (input: string) => {
          this.emitter.emit('input', input);
        }
      }
    });

    PseudoTerminal.activeTerminals.add(this);
  }

  waitForInput(isPassword: boolean = false): Promise<string> {
    if (this.closed) return Promise.resolve('');

    this.focus();

    return new Promise((resolve) => {
      let buffer = '';
      const clear = () => {
        this.writeEmitter.fire('\r\n');
        this.emitter.removeListener('close', onClose);
        this.emitter.removeListener('input', onInput);
      };
      const onClose = () => {
        clear();
        resolve('');
      };
      const onInput = (input: string) => {
        const code = input.charCodeAt(0);

        switch (code) {
          // enter
          case 13: {
            clear();
            resolve(buffer);
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

      this.emitter.addListener('close', onClose);
      this.emitter.addListener('input', onInput);
    });
  }

  waitForKeyPress(): Promise<string> {
    if (this.closed) return Promise.resolve(String.fromCharCode(13));

    this.focus();

    return new Promise((resolve) => {
      const clear = () => {
        this.emitter.removeListener('close', onClose);
        this.emitter.removeListener('input', onInput);
      };
      const onInput = (input: string) => {
        clear();
        resolve(input);
      };
      const onClose = () => {
        clear();
        resolve('');
      };

      this.emitter.addListener('input', onInput);
      this.emitter.addListener('close', onClose);
    });
  }

  focus() {
    this.terminal.show(false);
  }

  hide() {
    this.terminal.hide();
  }

  print(message: string, newline: boolean = true) {
    this.writeEmitter.fire(`${normalize(message)}\r${newline ? '\n' : ''}`);
    this.terminal.show();
  }

  replace(message: string) {
    this.writeEmitter.fire(`${normalize(message)}\r`);
    this.terminal.show();
  }

  clear() {
    this.writeEmitter.fire(provider.command(CommandType.Clear));
  }

  dispose() {
    PseudoTerminal.activeTerminals.delete(this);
    this.terminal.dispose();
  }
}
