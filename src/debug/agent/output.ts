import EventEmitter from "events";
import PseudoTerminal from "../pseudo-terminal";
import { getPreviewInstance } from "../../preview";
import transform from '../../helper/text-mesh-transform';
import { KeyEvent } from "greybel-interpreter";
import { transformInputToIngameKeyCodeValue } from "../../helper/key-event";

export class OutputHandler {
  private _sessionHandler: EventEmitter;
  private _terminal: PseudoTerminal;
  private _hideUnsupportedTags: boolean;

  constructor(sessionHandler: EventEmitter, hideUnsupportedTags: boolean) {
    this._sessionHandler = sessionHandler;
    PseudoTerminal.activeTerminal?.dispose();
    this._terminal = new PseudoTerminal('greybel');
    this._hideUnsupportedTags = hideUnsupportedTags;
    this._terminal.focus();
  }

  processLine(text: string): string {
    return transform(text, this._hideUnsupportedTags).replace(/\\n/g, '\n');
  }

  print(
    message: string,
    replace = false,
    appendNewLine = true
  ) {
    getPreviewInstance().print(message, { appendNewLine, replace });
    const transformed = this.processLine(message);

    if (replace) {
      this._terminal.replace(transformed);
      return;
    }

    this._terminal.print(transformed, appendNewLine);
  }

  clear() {
    getPreviewInstance().clear();
    this._terminal.clear();
  }

  waitForInput(
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
      this._sessionHandler,
      message,
      isPassword
    );
  }

  waitForKeyPress(message: string): PromiseLike<string> {
    getPreviewInstance().input(message);

    const transformed = transform(message, this._hideUnsupportedTags).replace(
      /\\n/g,
      '\n'
    );

    this._terminal.print(transformed, false);

    return PseudoTerminal.getActiveTerminal()
      .waitForKeyPress(this._sessionHandler)
      .then((key) => {
        return transformInputToIngameKeyCodeValue(key);
      });
  }

  get terminal(): PseudoTerminal {
    return this._terminal;
  }
}