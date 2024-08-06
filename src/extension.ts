import vscode, { ExtensionContext } from 'vscode';

import { activate as activateAPI } from './api';
import { activate as activateBuild } from './build';
import { activate as activateDebug } from './debug';
import { activate as activateNextError } from './next-error';
import { activate as activateRefresh } from './refresh';
import { activate as activateShare } from './share';
import { activate as activateSnippets } from './snippet';
import { activate as activateSubscriptions } from './subscriptions';
import { activate as activateTransform } from './transform';
import { activate as activateClearSecrets } from './clear-secrets';
import { activate as activateImport } from './import';
import { activate as activatePreview } from './preview';
import { activate as activateLanguageClient } from './language-client';

export function activate(context: ExtensionContext) {
  activateRefresh(context);
  activateSubscriptions(context);

  activateLanguageClient(context);

  activateDebug(context);
  activateBuild(context);
  activateTransform(context);
  activateNextError(context);

  activateAPI(context);
  activateSnippets(context);
  activateShare(context);
  activateClearSecrets(context);
  activateImport(context);
  activatePreview(context);
}

export function deactivate() { }
