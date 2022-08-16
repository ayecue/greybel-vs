import vscode, { ExtensionContext, TextEditor, TextEditorEdit } from 'vscode';

import { createDocumentAST } from './helper/document-manager';

export function activate(context: ExtensionContext) {
  async function refresh(
    editor: TextEditor,
    _edit: TextEditorEdit,
    _args: any[]
  ) {
    createDocumentAST(editor.document);
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.refresh', refresh)
  );
}
