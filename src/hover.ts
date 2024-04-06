import {
  ASTFeatureImportExpression,
  ASTType as ASTTypeExtended
} from 'greybel-core';
import { ASTImportCodeExpression, ASTType } from 'greyscript-core';
import vscode, {
  CancellationToken,
  ExtensionContext,
  Hover,
  MarkdownString,
  Position,
  TextDocument,
  Uri
} from 'vscode';

import { LookupHelper } from './helper/lookup-type';
import { TypeInfoWithDefinition } from './helper/type-manager';
import { createHover } from './helper/tooltip';
import { PseudoFS, tryToGetPath } from './helper/fs';

function formatType(type: string): string {
  const segments = type.split(':');
  if (segments.length === 1) {
    return segments[0];
  }
  return `${segments[0]}<${segments[1]}>`;
}

function formatTypes(types: string[] = []): string {
  return types.map(formatType).join(' or ');
}

export function activate(_context: ExtensionContext) {
  vscode.languages.registerHoverProvider('greyscript', {
    async provideHover(
      document: TextDocument,
      position: Position,
      _token: CancellationToken
    ): Promise<Hover> {
      const helper = new LookupHelper(document);
      const astResult = helper.lookupAST(position);

      if (!astResult) {
        return;
      }

      if (astResult.closest.type === ASTType.ImportCodeExpression) {
        // shows link to importCode resource
        const hoverText = new MarkdownString('');
        const importAst = astResult.closest as ASTImportCodeExpression;
        const rootDir = importAst.directory.startsWith('/') ? vscode.workspace.workspaceFolders[0]?.uri : Uri.joinPath(Uri.file(document.fileName), '..');
        const target = Uri.joinPath(rootDir, importAst.directory);
        const output = [
          `[Imports file "${PseudoFS.basename(
            target.fsPath
          )}" inside this code](${target.toString(true)})`,
          '***',
          'Click the link above to open the file.',
          '',
          'Use the build command to create an installer',
          'file which will bundle all dependencies.'
        ];

        hoverText.appendMarkdown(output.join('\n'));

        return new Hover(hoverText);
      } else if (
        astResult.closest.type === ASTTypeExtended.FeatureImportExpression ||
        astResult.closest.type === ASTTypeExtended.FeatureIncludeExpression
      ) {
        // shows link to import/include resource
        const hoverText = new MarkdownString('');
        const importCodeAst = astResult.closest as ASTFeatureImportExpression;
        const fileDir = importCodeAst.path;

        const rootDir = fileDir.startsWith('/') ? vscode.workspace.workspaceFolders[0]?.uri : Uri.joinPath(Uri.file(document.fileName), '..');
        const result = Uri.joinPath(rootDir, fileDir).fsPath;
        const target = Uri.file(await tryToGetPath(result, `${result}.src`));

        const output = [
          `[Inserts file "${PseudoFS.basename(
            target.fsPath
          )}" inside this code when building](${target.toString(true)})`,
          '***',
          'Click the link above to open the file.'
        ];

        hoverText.appendMarkdown(output.join('\n'));

        return new Hover(hoverText);
      }

      const typeInfo = await helper.lookupTypeInfo(astResult);

      if (!typeInfo) {
        return;
      }

      const hoverText = new MarkdownString('');

      if (
        typeInfo instanceof TypeInfoWithDefinition &&
        typeInfo.type.length === 1
      ) {
        return createHover(typeInfo);
      }

      hoverText.appendCodeblock(
        `(${typeInfo.kind}) ${typeInfo.label}: ${formatTypes(typeInfo.type)}`
      );

      return new Hover(hoverText);
    }
  });
}
