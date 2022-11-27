import vscode, {
  ExtensionContext
} from 'vscode';
import * as Snippets from 'greybel-mock-environment/dist/data/scripts';

const CodeSnippets = Snippets as {
  [key: string]: string
};

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'greybel.snippets',
      async (query: string): Promise<void> => {
        const names = Object.keys(CodeSnippets);
        const item = await vscode.window.showQuickPick(names);

        if (item && hasOwnProperty.call(CodeSnippets, item)) {
          const document = await vscode.workspace.openTextDocument({
            language: 'greyscript',
            content: CodeSnippets[item]
          });

          vscode.window.showTextDocument(document);

          return;
        }

        vscode.window.showErrorMessage(`Cannot find snippet. Available snippets: ${names.join(', ')}`);
      }
    )
  );
}
