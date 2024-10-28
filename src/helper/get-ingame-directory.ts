import vscode, { Uri, WorkspaceConfiguration } from 'vscode';

export const getIngameDirectory = async (
  config: WorkspaceConfiguration
): Promise<Uri> => {
  if (config.get<boolean>('transpiler.ingameDirectoryPrompt')) {
    const customDir = await vscode.window.showInputBox({
      title: 'Enter ingame directory',
      ignoreFocusOut: true
    });

    if (customDir == null || customDir === '') {
      return Uri.file(config.get<string>('transpiler.ingameDirectory'));
    }

    return Uri.file(customDir);
  }

  return Uri.file(config.get<string>('transpiler.ingameDirectory'));
};
