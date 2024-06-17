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
import {
  SignatureDefinitionFunction,
  SignatureDefinitionFunctionArg,
  SignatureDefinitionTypeMeta
} from 'meta-utils';
import { PseudoFS, tryToGetPath } from './helper/fs';

function formatTypes(types: SignatureDefinitionTypeMeta[] = []): string {
  return types.map((item) => item.toString().replace(',', '٫')).join(' or ');
}

function formatDefaultValue(value: number | string): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return value.toString();
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

      const entity = await helper.lookupTypeInfo(astResult);

      if (!entity) {
        return;
      }

      if (entity.isCallable()) {
        const info: MarkdownString[] = [];

        for (const definition of entity.signatureDefinitions) {
          const fnDef = definition as SignatureDefinitionFunction;
          const hoverText = new MarkdownString('');
          const args = fnDef.getArguments() || [];
          const example = fnDef.getExample() || [];
          const returnValues = formatTypes(fnDef.getReturns()) || 'null';
          let headline;

          if (args.length === 0) {
            headline = `(${entity.kind}) ${entity.label} (): ${returnValues}`;
          } else {
            const argValues = args
              .map(
                (item: SignatureDefinitionFunctionArg) =>
                  `${item.getLabel()}${item.isOptional() ? '?' : ''}: ${formatTypes(item.getTypes())}${item.getDefault() ? ` = ${formatDefaultValue(item.getDefault().value)}` : ''
                  }`
              )
              .join(', ');

            headline = `(${entity.kind}) ${entity.label} (${argValues}): ${returnValues}`;
          }

          const output = ['```', headline, '```', '***', fnDef.getDescription()];

          if (example.length > 0) {
            output.push(...['#### Examples:', '```', ...example, '```']);
          }

          hoverText.appendMarkdown(output.join('\n'));
          info.push(hoverText);
        }

        return new Hover(info);
      }

      const hoverText = new MarkdownString('');
      const metaTypes = Array.from(entity.types).map(SignatureDefinitionTypeMeta.parse)

      hoverText.appendCodeblock(
        `(${entity.kind}) ${entity.label}: ${formatTypes(metaTypes)}`
      );

      return new Hover(hoverText);
    }
  });
}
