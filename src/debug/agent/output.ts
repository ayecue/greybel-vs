import EventEmitter from "events";
import PseudoTerminal from "../pseudo-terminal";
import { getPreviewInstance } from "../../preview";
import transform from '../../helper/text-mesh-transform';
import { KeyEvent } from "greybel-interpreter";
import transformStringToKeyEvent from "../../helper/transform-string-to-key-event";

export class OutputHandler {
  static previousTerminal: PseudoTerminal | null;

  private _sessionHandler: EventEmitter;
  private _terminal: PseudoTerminal;
  private _hideUnsupportedTags: boolean;

  constructor(sessionHandler: EventEmitter, hideUnsupportedTags: boolean) {
    this._sessionHandler = sessionHandler;
    OutputHandler.previousTerminal?.dispose();
    this._terminal = new PseudoTerminal('greybel');
    this._hideUnsupportedTags = hideUnsupportedTags;
    OutputHandler.previousTerminal = this._terminal;
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

  waitForKeyPress(message: string): PromiseLike<KeyEvent> {
    getPreviewInstance().input(message);

    const transformed = transform(message, this._hideUnsupportedTags).replace(
      /\\n/g,
      '\n'
    );

    this._terminal.print(transformed, false);

    return PseudoTerminal.getActiveTerminal()
      .waitForKeyPress(this._sessionHandler)
      .then((key) => {
        return transformStringToKeyEvent(key);
      });
  }

  get terminal(): PseudoTerminal {
    return this._terminal;
  }
}