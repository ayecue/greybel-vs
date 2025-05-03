import {
  KeyEvent,
  OutputHandler,
  PrintOptions,
  UpdateOptions,
  VM
} from 'greybel-interpreter';

import PseudoTerminal from '../pseudo-terminal';
import transform from '../../helper/text-mesh-transform';
import transformStringToKeyEvent from '../../helper/transform-string-to-key-event';
import { getPreviewInstance } from '../../preview';

export class VSOutputHandler extends OutputHandler {
  static previousTerminal: PseudoTerminal | null;

  private _terminal: PseudoTerminal;
  private _hideUnsupportedTags: boolean;

  constructor(hideUnsupportedTags: boolean) {
    super();

    VSOutputHandler.previousTerminal?.dispose();

    this._terminal = new PseudoTerminal('greybel');
    this._hideUnsupportedTags = hideUnsupportedTags;

    VSOutputHandler.previousTerminal = this._terminal;
    this._terminal.focus();
  }

  private processLine(text: string): string {
    return transform(text, this._hideUnsupportedTags).replace(/\\n/g, '\n');
  }

  print(
    _vm: VM,
    message: string,
    { appendNewLine = true, replace = false }: Partial<PrintOptions> = {}
  ) {
    getPreviewInstance().print(message, { appendNewLine, replace });
    const transformed = this.processLine(message);

    if (replace) {
      this._terminal.replace(transformed);
      return;
    }

    this._terminal.print(transformed, appendNewLine);
  }

  update(
    _vm: VM,
    message: string,
    { appendNewLine = false, replace = false }: Partial<UpdateOptions> = {}
  ) {
    const transformed = this.processLine(message);

    if (replace) {
      getPreviewInstance().updateLast(message);
      this._terminal.updateLast(transformed);
      return;
    }

    getPreviewInstance().write(message);
    this._terminal.print(transformed, appendNewLine);
  }

  clear() {
    getPreviewInstance().clear();
    this._terminal.clear();
  }

  progress(vm: VM, timeout: number): PromiseLike<void> {
    const startTime = Date.now();
    const max = 20;

    getPreviewInstance().print(`[${'-'.repeat(max)}]`);
    this._terminal.print(`[${'-'.repeat(max)}]`);

    return new Promise((resolve, _reject) => {
      const onExit = () => {
        clearInterval(interval);
        resolve();
      };
      const interval = setInterval(() => {
        const currentTime = Date.now();
        const elapsed = currentTime - startTime;

        if (elapsed > timeout) {
          getPreviewInstance().updateLast(`[${'#'.repeat(max)}]`);
          getPreviewInstance().write(`\n`);
          this._terminal.updateLast(`[${'#'.repeat(max)}]`);
          vm.getSignal().removeListener('exit', onExit);
          clearInterval(interval);
          resolve();
          return;
        }

        const elapsedPercentage = (100 * elapsed) / timeout;
        const progress = Math.floor((elapsedPercentage * max) / 100);
        const right = max - progress;

        getPreviewInstance().updateLast(
          `[${'#'.repeat(progress)}${'-'.repeat(right)}]`
        );
        this._terminal.updateLast(
          `[${'#'.repeat(progress)}${'-'.repeat(right)}]`
        );
      });

      vm.getSignal().once('exit', onExit);
    });
  }

  waitForInput(
    vm: VM,
    isPassword: boolean,
    message: string
  ): PromiseLike<string> {
    getPreviewInstance().input(message);

    const transformed = transform(message, this._hideUnsupportedTags).replace(
      /\\n/g,
      '\n'
    );

    this._terminal.print(transformed, false);

    return PseudoTerminal.getActiveTerminal().waitForInput(
      vm.getSignal(),
      message,
      isPassword
    );
  }

  waitForKeyPress(vm: VM, message: string): PromiseLike<KeyEvent> {
    getPreviewInstance().input(message);

    const transformed = transform(message, this._hideUnsupportedTags).replace(
      /\\n/g,
      '\n'
    );

    this._terminal.print(transformed, false);

    return PseudoTerminal.getActiveTerminal()
      .waitForKeyPress(vm.getSignal())
      .then((key) => {
        return transformStringToKeyEvent(key);
      });
  }

  get terminal(): PseudoTerminal {
    return this._terminal;
  }
}
