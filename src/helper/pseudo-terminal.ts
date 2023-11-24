import { AnotherAnsiProvider, CommandType, EscapeSequence } from 'another-ansi';
import ansiEscapes from 'ansi-escapes';
import EventEmitter from 'events';
import { VM } from 'greybel-interpreter';
import vscode, { Terminal } from 'vscode';

const provider = new AnotherAnsiProvider(EscapeSequence.Hex);
const normalize = (v: string) => v.replace(/(?<!\r)\n/g, '\r\n');

export enum PseudoTerminalInputKey {
  Enter = '%0D',
  Backspace = '%7F',
  ArrowLeft = '%1B%5BD',
  ArrowRight = '%1B%5BC',
  ArrowUp = '%1B%5BA',
  ArrowDown = '%1B%5BB'
}

export default class PseudoTerminal {
  private terminal: Terminal;
  private writeEmitter: vscode.EventEmitter<string>;
  private emitter: EventEmitter;
  private closed: boolean;
  previousLinesCount: number;

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
    this.previousLinesCount = 0;

    PseudoTerminal.activeTerminals.add(this);
  }

  waitForInput(vm: VM, isPassword: boolean = false): PromiseLike<string> {
    if (this.closed) return Promise.resolve('');

    this.focus();

    return new Promise((resolve) => {
      const buffer: string[] = [];
      let cursorIndex = 0;

      const clear = () => {
        this.writeEmitter.fire('\r\n');
        vm.getSignal().removeListener('exit', onExit);
        this.emitter.removeListener('close', onClose);
        this.emitter.removeListener('input', onInput);
      };
      const onExit = () => {
        clear();
        resolve('');
      };
      const onClose = () => {
        clear();
        resolve('');
      };
      const onInput = (input: string) => {
        const code = encodeURI(input);

        switch (code) {
          // enter
          case PseudoTerminalInputKey.Enter: {
            clear();
            resolve(buffer.join(''));
            break;
          }
          // backspace
          case PseudoTerminalInputKey.Backspace:
            if (buffer.length > 0) {
              buffer.splice(cursorIndex - 1, 1);
              this.writeEmitter.fire(ansiEscapes.cursorMove(-cursorIndex));

              cursorIndex--;
              this.writeEmitter.fire(
                (isPassword ? buffer.map(() => '*') : buffer).join('') + ' '
              );
              this.writeEmitter.fire(
                ansiEscapes.cursorMove(-buffer.length - 1 + cursorIndex)
              );
            }
            break;
          case PseudoTerminalInputKey.ArrowLeft:
            if (cursorIndex > 0) {
              cursorIndex--;
              this.writeEmitter.fire(ansiEscapes.cursorMove(-1));
            }
            break;
          case PseudoTerminalInputKey.ArrowRight:
            if (cursorIndex < buffer.length) {
              cursorIndex++;
              this.writeEmitter.fire(ansiEscapes.cursorMove(1));
            }
            break;
          case PseudoTerminalInputKey.ArrowDown:
          case PseudoTerminalInputKey.ArrowUp:
            break;
          default: {
            buffer.splice(cursorIndex, 0, input);
            this.writeEmitter.fire(ansiEscapes.cursorMove(-cursorIndex));

            cursorIndex++;
            this.writeEmitter.fire(
              (isPassword ? buffer.map(() => '*') : buffer).join('')
            );
            this.writeEmitter.fire(
              ansiEscapes.cursorMove(-buffer.length + cursorIndex)
            );
          }
        }
      };

      vm.getSignal().once('exit', onExit);
      this.emitter.addListener('close', onClose);
      this.emitter.addListener('input', onInput);
    });
  }

  waitForKeyPress(vm: VM): PromiseLike<string> {
    if (this.closed) return Promise.resolve(String.fromCharCode(13));

    this.focus();

    return new Promise((resolve) => {
      const clear = () => {
        vm.getSignal().removeListener('exit', onExit);
        this.emitter.removeListener('close', onClose);
        this.emitter.removeListener('input', onInput);
      };
      const onExit = () => {
        clear();
        resolve('');
      };
      const onInput = (input: string) => {
        clear();
        resolve(input);
      };
      const onClose = () => {
        clear();
        resolve('');
      };

      vm.getSignal().once('exit', onExit);
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
    const normalized = normalize(message);

    this.previousLinesCount += normalized.split('\n').length;
    if (newline) this.previousLinesCount++;

    this.writeEmitter.fire(`${normalized}${newline ? '\r\n' : ''}`);
    this.terminal.show();
  }

  updateLast(message: string) {
    this.writeEmitter.fire(ansiEscapes.eraseLines(2));
    this.previousLinesCount -= 2;
    this.print(message);
  }

  replace(message: string) {
    this.writeEmitter.fire(ansiEscapes.eraseLines(this.previousLinesCount));
    this.previousLinesCount = 0;
    this.print(message);
  }

  clear() {
    this.writeEmitter.fire(provider.command(CommandType.Clear));
  }

  dispose() {
    PseudoTerminal.activeTerminals.delete(this);
    this.terminal.dispose();
  }
}
