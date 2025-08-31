import { Instruction } from 'greybel-interpreter';
import { ASTRange } from 'miniscript-core';
import vscode, { Position, Range, Uri } from 'vscode';

export type CustomError = {
  message: string;
  range?: ASTRange;
  target: string;
  stack?: string;
  stackTrace?: Instruction[];
};

const getRangeFromCustomError = (err: CustomError): Range => {
  if (err.range) {
    return new Range(
      new Position(err.range.start.line - 1, err.range.start.character - 1),
      new Position(err.range.end.line - 1, err.range.end.character - 1)
    );
  } else if (err.stackTrace) {
    const item = err.stackTrace[0].source;

    if (item.path === 'internal') {
      return new Range(new Position(0, 0), new Position(0, 0));
    }

    return new Range(
      new Position(item.start.line - 1, item.start.character - 1),
      new Position(item.end.line - 1, item.end.character - 1)
    );
  }

  return null;
};

export const showCustomErrorMessage = (err: CustomError): void => {
  const range = getRangeFromCustomError(err);

  if (range) {
    const errTarget = Uri.parse(err.target);

    vscode.window
      .showErrorMessage(
        `Unexpected error: ${err.message} at ${errTarget}:${range.start.line}:${range.start.character}`,
        { modal: false },
        'Go to error'
      )
      .then(async (selection) => {
        if (selection === 'Go to error') {
          const textDocument =
            await vscode.workspace.openTextDocument(errTarget);

          vscode.window.showTextDocument(textDocument, {
            selection: range
          });
        }
      });
  } else {
    vscode.window.showErrorMessage(
      `Unexpected error: ${err.message}\n${err.stack}`,
      { modal: false }
    );
  }
};
