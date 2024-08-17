import { ExtensionContext } from 'vscode';

import { activate as activateAPI } from './api';
import { activate as activateNextError } from './next-error';
import { activate as activateRefresh } from './refresh';
import { activate as activateShare } from './share';
import { activate as activateSnippets } from './snippet';
import { activate as activateSubscriptions } from './subscriptions';
import { activate as activateTransform } from './transform';
import { activate as activateLanguageClient } from './language-client-web';

export function activate(context: ExtensionContext) {
  activateRefresh(context);
  activateSubscriptions(context);

  activateLanguageClient(context);

  activateTransform(context);
  activateNextError(context);

  activateAPI(context);
  activateSnippets(context);
  activateShare(context);
}

export function deactivate() { }
