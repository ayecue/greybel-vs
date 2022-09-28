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
  ProviderResult,
  TextDocument,
  Uri
} from 'vscode';

import { LookupHelper, TypeInfoWithDefinition } from './helper/lookup-type';
import { PseudoFS } from './resource';

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
    provideHover(
      document: TextDocument,
      position: Position,
      _token: CancellationToken
    ): ProviderResult<Hover> {
      const helper = new LookupHelper(document);
      const astResult = helper.lookupAST(position);

      if (!astResult) {
        return;
      }

      const typeInfo = helper.lookupTypeInfo(astResult);

      if (!typeInfo) {
        if (astResult.closest.type === ASTType.ImportCodeExpression) {
          // shows link to importCode resource
          const hoverText = new MarkdownString('');
          const importAst = astResult.closest as ASTImportCodeExpression;
          const gameDir = importAst.gameDirectory;
          const fileDir = importAst.fileSystemDirectory;
          let output = [];

          if (fileDir) {
            const rootDir = Uri.joinPath(Uri.file(document.fileName), '..');
            const target = Uri.joinPath(rootDir, fileDir);

            output = [
              `[Imports file "${PseudoFS.basename(
                target.fsPath
              )}" inside this code](${target.toString(true)})`,
              '***',
              'Click the link above to open the file.',
              '',
              'Use the build command to create an installer',
              'file which will bundle all dependencies.'
            ];
          } else {
            output = [
              `Imports game file "${gameDir}" inside this code`,
              '***',
              'WARNING: There is no actual file path',
              'therefore this will be ignored while building.',
              '',
              'Following example shows how to enable inclusion when building.',
              '',
              '**Example:**',
              '```',
              'import_code("/ingame/path":"/relative/physical/path")',
              '```'
            ];
          }

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

          const rootDir = Uri.joinPath(Uri.file(document.fileName), '..');
          const target = Uri.joinPath(rootDir, fileDir);

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

        return;
      }

      const hoverText = new MarkdownString('');

      if (typeInfo instanceof TypeInfoWithDefinition) {
        const defintion = typeInfo.definition;
        const args = defintion.arguments || [];
        const example = defintion.example || [];
        const returnValues = formatTypes(defintion.returns) || 'null';
        let headline;

        if (args.length === 0) {
          headline = `(${typeInfo.type}) ${typeInfo.label} (): ${returnValues}`;
        } else {
          const argValues = args
            .map(
              (item) =>
                `${item.label}${item.opt ? '?' : ''}: ${formatType(item.type)}${
                  item.default ? ` = ${item.default}` : ''
                }`
            )
            .join(', ');

          headline = `(${typeInfo.type}) ${typeInfo.label} (${argValues}): ${returnValues}`;
        }

        const output = ['```', headline, '```', '***', defintion.description];

        if (example.length > 0) {
          output.push(...['#### Examples:', '```', ...example, '```']);
        }

        hoverText.appendMarkdown(output.join('\n'));

        return new Hover(hoverText);
      }

      hoverText.appendCodeblock(
        `${typeInfo.label}: ${formatTypes(typeInfo.type)}`
      );
      return new Hover(hoverText);
    }
  });
}
