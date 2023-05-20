import { TranspilerParseResult } from 'greybel-transpiler';
import path from 'path';
// @ts-ignore: No type definitions
import { TextEncoderLite as TextEncoder } from 'text-encoder-lite';
import vscode, { Uri } from 'vscode';

import { PseudoFS } from '../resource';

type ImportItem = {
  filepath: string;
  ingameFilepath: string;
  content: string;
};

class Installer {
  private importList: ImportItem[];
  private target: string;
  private buildPath: Uri;
  private maxChars: number;

  private segments: string[];
  private buffer: string;

  constructor(
    target: string,
    buildPath: Uri,
    result: TranspilerParseResult,
    maxChars: number
  ) {
    this.importList = this.createImportList(target, result);
    this.target = target;
    this.buildPath = buildPath;
    this.maxChars = maxChars - 1000;
    this.segments = [];
    this.buffer = this.createContentHeader();
  }

  private createContentHeader(): string {
    return ['s=get_shell', 'c=s.host_computer', 'h=home_dir', 'p=@push'].join(
      '\n'
    );
  }

  private isRootDirectory(target: string): boolean {
    return /^(\.|\/)$/.test(target);
  }

  private createFolderLine(folder: string): string[] {
    const parent = path.dirname(folder);
    const target = path.basename(folder);
    let output: string[] = [];

    if (this.isRootDirectory(target)) {
      return output;
    }

    if (this.isRootDirectory(parent)) {
      output = output.concat([
        'd=c.File(h+"/' + target + '")',
        'if (d == null) then c.create_folder(h,"/' + target + '")'
      ]);
    } else {
      output = output.concat([
        'd=c.File(h+"' + parent + '/' + target + '")',
        'if (d == null) then c.create_folder(h+"' +
          parent +
          '","/' +
          target +
          '")'
      ]);
    }

    return output;
  }

  private createFileLine(file: string, isNew?: boolean): string {
    const base = path.basename(file);
    const folder = path.dirname(file);
    let output = this.createFolderLine(folder);

    if (isNew) {
      if (this.isRootDirectory(folder)) {
        output = output.concat([
          'print("Creating "+h+"/' + base + '")',
          'c.touch(h,"' + base + '")',
          'f=c.File(h+"/' + base + '")',
          'l=[]'
        ]);
      } else {
        output = output.concat([
          'print("Creating "+h+"' + folder + '/' + base + '")',
          'c.touch(h+"' + folder + '","' + base + '")',
          'f=c.File(h+"' + folder + '/' + base + '")',
          'l=[]'
        ]);
      }
    } else {
      if (this.isRootDirectory(folder)) {
        output = output.concat([
          'f=c.File(h+"/' + base + '")',
          'if (f == null) then',
          'c.touch(h,"' + base + '")',
          'f=c.File(h+"/' + base + '")',
          'end if',
          'l=f.get_content.split(char(10))'
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

  private createCodeInsertLine(line: string): string {
    const parsed = line
      .replace(/"/g, '""')
      .replace(/^import_code\(/i, 'import"+"_"+"code(');

    return 'p(l,"' + parsed + '")';
  }

  private createSetContentLine(): string {
    return 'f.set_content(l.join(char(10)))';
  }

  private async createInstallerFile(): Promise<void> {
    if (this.buffer.length === 0) {
      return;
    }

    const target = Uri.joinPath(
      this.buildPath,
      './build/installer' + this.segments.length + '.src'
    );

    await vscode.workspace.fs.writeFile(
      target,
      new TextEncoder().encode(this.buffer)
    );
  }

  private async openFile(file: string): Promise<void> {
    const preparedLine = '\n' + this.createFileLine(file, true);
    const newContent = this.buffer + preparedLine;

    if (newContent.length > this.maxChars) {
      await this.createInstallerFile();
      this.segments.push(this.buffer);

      this.buffer =
        this.createContentHeader() + '\n' + this.createFileLine(file, true);
    } else {
      this.buffer = newContent;
    }
  }

  private async addLine(file: string, line: string): Promise<void> {
    const preparedLine = '\n' + this.createCodeInsertLine(line);
    const newContent = this.buffer + preparedLine;

    if (newContent.length > this.maxChars) {
      this.buffer += '\n' + this.createSetContentLine();
      await this.createInstallerFile();
      this.segments.push(this.buffer);

      this.buffer =
        this.createContentHeader() + '\n' + this.createFileLine(file);
      await this.addLine(file, line);
    } else {
      this.buffer = newContent;
    }
  }

  private createImportList(
    target: string,
    parseResult: TranspilerParseResult
  ): ImportItem[] {
    const pseudoRoot = PseudoFS.dirname(target) || '';
    const imports = Object.entries(parseResult).map(([target, code]) => {
      return {
        filepath: target,
        ingameFilepath: target
          .replace(pseudoRoot, '')
          .replace(PseudoFS.sep, '/'),
        content: code
      };
    });

    return imports;
  }

  async build() {
    for (const item of this.importList) {
      const lines = item.content.split('\n');
      let line = lines.shift();

      await this.openFile(item.ingameFilepath);

      while (line !== undefined) {
        await this.addLine(item.ingameFilepath, line);
        line = lines.shift();
      }

      this.buffer += '\n' + this.createSetContentLine();
    }

    await this.createInstallerFile();
  }
}

export const createInstaller = async (
  target: string,
  buildPath: Uri,
  result: TranspilerParseResult,
  maxChars: number
): Promise<void> => {
  const installer = new Installer(target, buildPath, result, maxChars);
  await installer.build();
};
