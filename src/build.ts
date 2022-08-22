import {
  BuildType,
  Transpiler,
  TranspilerParseResult
} from 'greybel-transpiler';
// @ts-ignore: No type definitions
import { TextEncoderLite as TextEncoder } from 'text-encoder-lite';
import vscode, {
  ExtensionContext,
  TextEditor,
  TextEditorEdit,
  Uri
} from 'vscode';

import { PseudoFS, TranspilerResourceProvider } from './resource';

function createContentHeader(): string {
  return ['s=get_shell', 'c=s.host_computer', 'h=home_dir', 'p=@push'].join(
    '\n'
  );
}

function isRootDirectory(target: string): boolean {
  return /^(\.|\/)$/.test(target);
}

function createFolderLine(folder: string): string[] {
  const parent = PseudoFS.dirname(folder);
  const target = PseudoFS.basename(folder);
  let output: string[] = [];

  if (isRootDirectory(target)) {
    return output;
  }

  if (isRootDirectory(parent)) {
    output = output.concat([
      'd=c.File(h+"/' + target + '")',
      'if (d == null) then c.create_folder(h,"/' + target + '")'
    ]);
  } else {
    output = output.concat([
      'd=c.File(h+"' + parent + '/' + target + '")',
      'if (d == null) then c.create_folder(h+"' +
        parent +
        '", "/' +
        target +
        '")'
    ]);
  }

  return output;
}

function createFileLine(file: string, isNew?: boolean): string {
  const base = PseudoFS.basename(file);
  const folder = PseudoFS.dirname(file);
  let output = createFolderLine(folder);

  if (isNew) {
    if (isRootDirectory(folder)) {
      output = output.concat([
        'print("Creating "+h+"/' + base + '")',
        'c.touch(h,"' + base + '")',
        'f=c.File(h+"/' + base + '")',
        'l=[]'
      ]);
    } else {
      output = output.concat([
        'print("Creating "+h+"' + folder + '/' + base + '")',
        'c.touch(h+"' + folder + '", "' + base + '")',
        'f=c.File(h+"' + folder + '/' + base + '")',
        'l=[]'
      ]);
    }
  } else {
    if (isRootDirectory(folder)) {
      output = output.concat([
        'f = c.File(h + "/' + base + '")',
        'if (f == null) then',
        'c.touch(h, "' + base + '")',
        'f = c.File(h + "/' + base + '")',
        'end if',
        'l = f.get_content.split(char(10))'
      ]);
    } else {
      output = output.concat([
        'f=c.File(h+"' + folder + '/' + base + '")',
        'if (f == null) then',
        'c.touch(h+"' + folder + '", "' + base + '")',
        'f=c.File(h+"' + folder + '/' + base + '")',
        'end if',
        'l=f.get_content.split(char(10))'
      ]);
    }
  }

  return output.join('\n');
}

function createCodeInsertLine(line: string): string {
  const parsed = line
    .replace(/"/g, '""')
    .replace(/^import_code\(/i, 'import" + "_" + "code(');

  return 'p(l, "' + parsed + '")';
}

function createSetContentLine(): string {
  return 'f.set_content(l.join(char(10)))';
}

function createImportList(
  parseResult: TranspilerParseResult,
  mainTarget: string
): any[] {
  const pseudoRoot = PseudoFS.dirname(mainTarget) || '';
  const list = [
    {
      filepath: mainTarget,
      pseudoFilepath: PseudoFS.basename(mainTarget),
      content: parseResult[mainTarget]
    }
  ];
  const imports = Object.entries(parseResult).map(([target, code]) => {
    return {
      filepath: target,
      pseudoFilepath: target.replace(pseudoRoot, '').replace(PseudoFS.sep, '/'),
      content: code
    };
  });

  return list.concat(imports);
}

function createInstaller(
  parseResult: TranspilerParseResult,
  mainTarget: string,
  targetRoot: Uri,
  maxWords: number
): void {
  const importList = createImportList(parseResult, mainTarget);
  const maxWordsWithBuffer = maxWords - 1000;
  let installerSplits = 0;
  let content = createContentHeader();
  let item = importList.shift();
  const createInstallerFile = function () {
    if (content.length === 0) {
      return;
    }

    const target = Uri.joinPath(
      targetRoot,
      './build/installer' + installerSplits + '.src'
    );

    vscode.workspace.fs.writeFile(target, new TextEncoder().encode(content));
    installerSplits++;
  };
  const openFile = function (file: string) {
    const preparedLine = '\n' + createFileLine(file, true);
    const newContent = content + preparedLine;

    if (newContent.length > maxWordsWithBuffer) {
      createInstallerFile();
      content = createContentHeader() + '\n' + createFileLine(file, true);
    } else {
      content = newContent;
    }
  };
  const addLine = function (file: string, line: string) {
    const preparedLine = '\n' + createCodeInsertLine(line);
    const newContent = content + preparedLine;

    if (newContent.length > maxWordsWithBuffer) {
      content += '\n' + createSetContentLine();
      createInstallerFile();
      content = createContentHeader() + '\n' + createFileLine(file);
      addLine(file, line);
    } else {
      content = newContent;
    }
  };

  while (item) {
    const lines = item.content.split('\n');
    let line = lines.shift();

    openFile(item.pseudoFilepath);

    while (line) {
      addLine(item.pseudoFilepath, line);
      line = lines.shift();
    }

    content += '\n' + createSetContentLine();

    item = importList.shift();
  }

  createInstallerFile();
}

export function activate(context: ExtensionContext) {
  async function build(
    editor: TextEditor,
    _edit: TextEditorEdit,
    _args: any[]
  ) {
    if (editor.document.isDirty) {
      const isSaved = await editor.document.save();

      if (!isSaved) {
        vscode.window.showErrorMessage(
          'You cannot build a file which does not exist in the file system.',
          { modal: false }
        );
        return;
      }
    }

    try {
      const config = vscode.workspace.getConfiguration('greybel');
      const target = editor.document.fileName;
      const environmentVariablesFromConfig =
        config.get<object>('transpiler.environmentVariables') || {};
      const excludedNamespacesFromConfig =
        config.get<string[]>('transpiler.excludedNamespaces') || [];
      let buildType = BuildType.DEFAULT;

      if (config.get('transpiler.uglify')) {
        buildType = BuildType.UGLIFY;
      } else if (config.get('transpiler.beautify')) {
        buildType = BuildType.BEAUTIFY;
      }

      const result = await new Transpiler({
        target,
        resourceHandler: new TranspilerResourceProvider().getHandler(),
        buildType,
        environmentVariables: new Map(
          Object.entries(environmentVariablesFromConfig)
        ),
        disableLiteralsOptimization: config.get('transpiler.dlo'),
        disableNamespacesOptimization: config.get('transpiler.dno'),
        excludedNamespaces: excludedNamespacesFromConfig
      }).parse();

      const rootPath = vscode.workspace.rootPath
        ? Uri.file(vscode.workspace.rootPath)
        : Uri.joinPath(Uri.file(editor.document.fileName), '..');
      const buildPath = Uri.joinPath(rootPath, './build');
      const targetRoot = Uri.joinPath(Uri.file(target), '..');

      try {
        await vscode.workspace.fs.delete(buildPath, { recursive: true });
      } catch (err) {
        console.warn(err);
      }

      await vscode.workspace.fs.createDirectory(buildPath);

      Object.entries(result).forEach(([file, code]) => {
        const relativePath = file.replace(targetRoot.fsPath, '.');
        const fullPath = Uri.joinPath(buildPath, relativePath);
        vscode.workspace.fs.writeFile(fullPath, new TextEncoder().encode(code));
      });

      if (config.get('installer')) {
        vscode.window.showInformationMessage('Creating installer.', {
          modal: false
        });
        createInstaller(result, target, rootPath, 75000);
      }

      vscode.window.showInformationMessage(
        `Build done. Available [here](${buildPath.toString(true)}).`,
        { modal: false }
      );
    } catch (err: any) {
      vscode.window.showErrorMessage(err.message, { modal: false });
    }
  }

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand('greybel.build', build)
  );
}
