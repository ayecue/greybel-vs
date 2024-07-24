import { TranspilerParseResult } from 'greybel-transpiler';
// @ts-ignore: No type definitions
import { TextEncoderLite as TextEncoder } from 'text-encoder-lite';
import vscode, { Uri } from 'vscode';

import { createBasePath } from '../helper/create-base-path';
import { generateAutoCompileCode } from './auto-compile-helper';

type ImportItem = {
  filepath: string;
  ingameFilepath: string;
  content: string;
};

interface InstallerFileOptions {
  rootDirectory: string;
  contentHeader: string;
  maxChars: number;
  previous?: InstallerFile;
}

class InstallerFile {
  readonly maxChars: number;

  private rootDirectory: string;
  private items: ImportItem[];
  private buffer: string;
  private previous: InstallerFile | null;

  constructor(options: InstallerFileOptions) {
    this.rootDirectory = options.rootDirectory;
    this.maxChars = options.maxChars;
    this.buffer = options.contentHeader;
    this.items = [];
    this.previous = options.previous ?? null;
  }

  insert(item: ImportItem): boolean {
    const isNew = !this.previous?.items.includes(item);
    const remaining = this.getRemainingSpace();
    const filePath = `${this.rootDirectory}${item.ingameFilepath}`;
    let line = `m("${filePath}","${item.content}",${isNew ? '1' : '0'});d`;

    if (remaining > line.length) {
      this.buffer += line.slice(0, -1);
      this.items.push(item);
      item.content = '';
      return true;
    }

    let diff = item.content.length + (remaining - line.length);

    if (diff <= 0) {
      return false;
    }

    let content = item.content.slice(0, diff);
    const endingQuotes = content.match(/"+$/)?.[0];

    if (endingQuotes && endingQuotes.length % 2 === 1) {
      content = item.content.slice(0, --diff);
    }

    line = `m("${filePath}","${content}",${isNew ? '1' : '0'});d`;
    this.buffer += line;
    this.items.push(item);

    item.content = item.content.slice(diff);
    return false;
  }

  appendCode(content: string) {
    const remaining = this.getRemainingSpace();

    if (remaining > content.length) {
      this.buffer += content;
      return true;
    }

    return false;
  }

  getCode(): string {
    return this.buffer;
  }

  getRemainingSpace(): number {
    return this.maxChars - this.buffer.length;
  }
}

export interface InstallerOptions {
  target: string;
  ingameDirectory: string;
  buildPath: Uri;
  result: TranspilerParseResult;
  maxChars: number;
  autoCompile: boolean;
}

class Installer {
  private importList: ImportItem[];
  private target: string;
  private ingameDirectory: string;
  private buildPath: Uri;
  private maxChars: number;
  private autoCompile: boolean;

  private files: InstallerFile[];
  private createdFiles: string[];

  constructor(options: InstallerOptions) {
    this.target = options.target;
    this.ingameDirectory = options.ingameDirectory.trim().replace(/\/$/i, '');
    this.buildPath = options.buildPath;
    this.maxChars = options.maxChars;
    this.autoCompile = options.autoCompile;
    this.files = [];
    this.importList = this.createImportList(options.target, options.result);
    this.createdFiles = [];
  }

  private async createInstallerFiles(): Promise<void> {
    await Promise.all(
      this.files.map(async (file, index) => {
        const target = Uri.joinPath(
          this.buildPath,
          './build/installer' + index + '.src'
        );

        this.createdFiles.push(target.toString());

        await vscode.workspace.fs.writeFile(
          target,
          new TextEncoder().encode(file.getCode())
        );
      })
    );
  }

  private createImportList(
    rootTarget: string,
    parseResult: TranspilerParseResult
  ): ImportItem[] {
    const imports = Object.entries(parseResult).map(([target, code]) => {
      const ingameFilepath = createBasePath(rootTarget, target, '');

      return {
        filepath: target,
        ingameFilepath,
        content: code
          .replace(/"/g, '""')
          .replace(/import_code\(/gi, 'import"+"_"+"code(')
      };
    });

    return imports;
  }

  createContentHeader(): string {
    return [
      's = get_shell',
      'c = s.host_computer',
      'm = function(filePath, content, isNew)',
      '	segments = filePath.split("/")[1 : ]',
      '	fileName = segments.pop',
      '	for segment in segments',
      '		parentPath = "/" + segments[ : __segment_idx].join("/")',
      '		folderName = segment',
      '		folderPath = parentPath + "/" + folderName',
      '		folderHandle = c.File(folderPath)',
      '		if folderHandle == null then',
      '			result = c.create_folder(parentPath, folderName) == 1',
      '			if result != 1 then exit("Could not create folder in """ + folderPath + """ due to: " + result)',
      '			print("New folder """ + folderPath + """ got created.")',
      '		end if',
      '		if not folderHandle.is_folder then exit("Entity at """ + folderPath + """ is not a folder thus installation got aborted.")',
      '	end for',
      '	parentPath = "/" + segments.join("/")',
      '	result = c.touch(parentPath, fileName)',
      '	if result != 1 then exit("Could not create file in """ + filePath + """ due to: " + result)',
      '	fileEntity = c.File(filePath)',
      '	if fileEntity == null then exit("Unable to get file at """ + filePath + """ thus installation got aborted.")',
      '	if isNew then',
      '		fileEntity.set_content(content)',
      '		print("New file """ + filePath + """ got created.")',
      '	else',
      '		fileEntity.set_content(fileEntity.get_content + content)',
      '		print("Content got appended to """ + filePath + """.")',
      '	end if',
      'end function',
      'd = function',
      '	c.File(program_path).delete',
      'end function',
      ''
    ].map((line) => line.trim()).join(';');
  }

  createContentFooterAutoCompile(): string[] {
    if (this.autoCompile) {
      const rootRef = this.importList.find(
        (item) => item.filepath === this.target
      );

      return generateAutoCompileCode(
        this.ingameDirectory,
        rootRef.ingameFilepath,
        this.importList.map((it) => it.ingameFilepath)
      ).split(';');
    }

    return [];
  }

  createContentFooter(): string {
    return ['d', ...this.createContentFooterAutoCompile(), ''].join(';');
  }

  async build() {
    let file = new InstallerFile({
      rootDirectory: this.ingameDirectory,
      contentHeader: this.createContentHeader(),
      maxChars: this.maxChars
    });
    this.files.push(file);

    for (const item of this.importList) {
      let done = false;

      while (!done) {
        done = file.insert(item);

        if (!done) {
          file = new InstallerFile({
            rootDirectory: this.ingameDirectory,
            contentHeader: this.createContentHeader(),
            maxChars: this.maxChars,
            previous: file
          });
          this.files.push(file);
        }
      }
    }

    const contentFooter = this.createContentFooter();

    if (!file.appendCode(contentFooter)) {
      file = new InstallerFile({
        rootDirectory: this.ingameDirectory,
        contentHeader: contentFooter,
        maxChars: this.maxChars,
        previous: file
      });
      this.files.push(file);
    }

    await this.createInstallerFiles();
  }
}

export const createInstaller = async (
  options: InstallerOptions
): Promise<void> => {
  const installer = new Installer(options);
  await installer.build();
};
