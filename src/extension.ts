import { ExtensionContext } from 'vscode';

import { activate as activateAutocomplete } from './autocomplete';
import { activate as activateBuild } from './build';
import { activate as activateDebug } from './debug';
import { activate as activateDiagnostic } from './diagnostic';
import { activate as activateHover } from './hover';
import { activate as activateNextError } from './next-error';
import { activate as activateRefresh } from './refresh';
import { activate as activateTransform } from './transform';

export function activate(context: ExtensionContext) {
  activateRefresh(context);
  activateHover(context);
  activateAutocomplete(context);
  activateDebug(context);
  activateBuild(context);
  activateTransform(context);
  activateNextError(context);
  activateDiagnostic(context);
}

export function deactivate() {}
