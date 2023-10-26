import vscode, { ExtensionContext } from 'vscode';

import { activate as activateAPI } from './api';
import { activate as activateAutocomplete } from './autocomplete';
import { activate as activateBuild } from './build';
import { activate as activateColor } from './color';
import { activate as activateDebug } from './debug';
import { activate as activateDefinition } from './definition';
import { activate as activateDiagnostic } from './diagnostic';
import { activate as activateHover } from './hover';
import { activate as activateNextError } from './next-error';
import { activate as activateRefresh } from './refresh';
import { activate as activateShare } from './share';
import { activate as activateSnippets } from './snippet';
import { activate as activateSubscriptions } from './subscriptions';
import { activate as activateSymbol } from './symbol';
import { activate as activateTransform } from './transform';
import { activate as activateClearSecrets } from './clear-secrets';
import { activate as activateImport } from './import';

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
  activateSymbol(context);

  if (config.get<boolean>('diagnostic')) {
    activateDiagnostic(context);
  }

  activateAPI(context);
  activateSnippets(context);
  activateColor(context);
  activateShare(context);
  activateClearSecrets(context);
  activateImport(context)
}

export function deactivate() {}
