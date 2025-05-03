import { ExtensionContext } from 'vscode';

import { activate as activateAPI } from './api';
import { activate as activateBuild } from './build';
import { activate as activateDebug } from './debug';
import { activate as activateNextError } from './next-error';
import { activate as activateRefresh } from './refresh';
import { activate as activateShare } from './share';
import { activate as activateSnippets } from './snippet';
import { activate as activateSubscriptions } from './subscriptions';
import { activate as activateTransform } from './transform';
import { activate as activateImport } from './import';
import { activate as activatePreview } from './preview';
import { activate as activateLanguageClient } from './language-client';
import { activate as activateVersionCheck } from './version-check';

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
  activateImport(context);
  activatePreview(context);
  activateVersionCheck();
}

export function deactivate() { }
