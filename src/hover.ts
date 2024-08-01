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
import {
  SignatureDefinitionTypeMeta,
  SignatureDefinitionBaseType
} from 'meta-utils';

import { LookupHelper } from './helper/lookup-type';
import { PseudoFS, tryToGetPath } from './helper/fs';
import { createHover, formatTypes } from './helper/tooltip';

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
        const rootDir = importAst.directory.startsWith('/') ? vscode.workspace.workspaceFolders[0]?.uri : Uri.joinPath(document.uri, '..');
        const target = Uri.joinPath(rootDir, importAst.directory);
        const output = [
          `[Imports file "${PseudoFS.basename(
            target.path
          )}" inside this code](${target.toString()})`,
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

        const rootDir = fileDir.startsWith('/') ? vscode.workspace.workspaceFolders[0]?.uri : Uri.joinPath(document.uri, '..');
        const result = Uri.joinPath(rootDir, fileDir);
        const resultAlt = Uri.joinPath(rootDir, `${fileDir}`);
        const target = await tryToGetPath(result, resultAlt);

        const output = [
          `[Inserts file "${PseudoFS.basename(
            target.path
          )}" inside this code when building](${target.toString()})`,
          '***',
          'Click the link above to open the file.'
        ];

        hoverText.appendMarkdown(output.join('\n'));

        return new Hover(hoverText);
      }

      const entity = await helper.lookupTypeInfo(astResult);

      if (!entity) {
        return;
      }

      if (entity.isCallable()) {
        return createHover(entity);
      }

      const hoverText = new MarkdownString('');
      const metaTypes = Array.from(entity.types).map(SignatureDefinitionTypeMeta.parse);
      let label = `(${entity.kind}) ${entity.label}: ${formatTypes(metaTypes)}`;

      if (entity.types.has(SignatureDefinitionBaseType.Map)) {
        const records: Record<string, string> = {};

        for (const [key, item] of entity.values) {
          const metaTypes = Array.from(item.types).map(SignatureDefinitionTypeMeta.parse)
          records[key.slice(2)] = formatTypes(metaTypes);
        }

        label += ' ' + JSON.stringify(records, null, 2);
      }

      hoverText.appendCodeblock(
        label
      );

      return new Hover(hoverText);
    }
  });
}
