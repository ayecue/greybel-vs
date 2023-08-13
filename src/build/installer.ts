import { TranspilerParseResult } from 'greybel-transpiler';
// @ts-ignore: No type definitions
import { TextEncoderLite as TextEncoder } from 'text-encoder-lite';
import vscode, { Uri } from 'vscode';

import { createBasePath } from '../helper/create-base-path';

type ImportItem = {
  filepath: string;
  ingameFilepath: string;
  content: string;
};

interface InstallerFileOptions {
  maxChars: number;
  previous?: InstallerFile;
}

class InstallerFile {
  readonly maxChars: number;

  private items: ImportItem[];
  private buffer: string;
  private previous: InstallerFile | null;

  constructor(options: InstallerFileOptions) {
    this.maxChars = options.maxChars;
    this.buffer = this.createContentHeader();
    this.items = [];
    this.previous = options.previous ?? null;
  }

  private createContentHeader(): string {
    return [
      's=get_shell',
      'c=s.host_computer',
      'p=@push',
      'm=function(t,z,r)',
      'x=t.split("/")[1:]',
      'e=x.pop',
      'for y in x',
      'if (__y_idx==0) then continue',
      'c.create_folder("/"+x[:__y_idx].join("/"),y)',
      'end for',
      'c.touch("/"+x.join("/"),e)',
      'j=c.File(t)',
      'if r then',
      'j.set_content(z)',
      'print("New file """+t+""" got created.")',
      'else',
      'j.set_content(j.get_content+z)',
      'print("Content got appended to """+t+""".")',
      'end if',
      'end function',
      ''
    ].join(';');
  }

  insert(item: ImportItem): boolean {
    const isNew = !this.previous?.items.includes(item);
    const remaining = this.maxChars - this.buffer.length;
    let line = `m("${item.ingameFilepath}","${item.content}",${
      isNew ? '1' : '0'
    });`;

    if (remaining > line.length) {
      this.buffer += line;
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

    line = `m("${item.ingameFilepath}","${content}",${isNew ? '1' : '0'});`;
    this.buffer += line;
    this.items.push(item);

    item.content = item.content.slice(diff);
    return false;
  }

  getCode(): string {
    return this.buffer;
  }
}

export interface InstallerOptions {
  target: string;
  ingameDirectory: string;
  buildPath: Uri;
  result: TranspilerParseResult;
  maxChars: number;
}

class Installer {
  private importList: ImportItem[];
  private target: string;
  private ingameDirectory: string;
  private buildPath: Uri;
  private maxChars: number;

  private files: InstallerFile[];
  private createdFiles: string[];

  constructor(options: InstallerOptions) {
    this.target = options.target;
    this.ingameDirectory = options.ingameDirectory;
    this.buildPath = options.buildPath;
    this.maxChars = options.maxChars - 1000;
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
      const ingameFilepath = `${this.ingameDirectory}${createBasePath(
        rootTarget,
        target,
        ''
      )}`;
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

  async build() {
    let file = new InstallerFile({
      maxChars: this.maxChars
    });
    this.files.push(file);

    for (const item of this.importList) {
      let done = false;

      while (!done) {
        done = file.insert(item);

        if (!done) {
          file = new InstallerFile({
            maxChars: this.maxChars,
            previous: file
          });
          this.files.push(file);
        }
      }
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
