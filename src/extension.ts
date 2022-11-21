import vscode, { ExtensionContext } from 'vscode';

import { activate as activateAPI } from './api';
import { activate as activateAutocomplete } from './autocomplete';
import { activate as activateBuild } from './build';
import { activate as activateDebug } from './debug';
import { activate as activateDefinition } from './definition';
import { activate as activateDiagnostic } from './diagnostic';
import { activate as activateHover } from './hover';
import { activate as activateNextError } from './next-error';
import { activate as activateRefresh } from './refresh';
import { activate as activateSubscriptions } from './subscriptions';
import { activate as activateTransform } from './transform';

export function activate(context: ExtensionContext) {
  const config = vscode.workspace.getConfiguration('greybel');

  activateRefresh(context);
  activateSubscriptions(context);

  if (config.get<boolean>('hoverdocs')) {
    activateHover(context);
  }

  if (config.get<boolean>('autocomplete')) {
    activateAutocomplete(context);
  }

  activateDebug(context);
  activateBuild(context);
  activateTransform(context);
  activateNextError(context);
  activateDefinition(context);

  if (config.get<boolean>('diagnostic')) {
    activateDiagnostic(context);
  }

  activateAPI(context);
}

export function deactivate() {}
