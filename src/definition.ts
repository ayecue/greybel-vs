import { ASTChunkAdvanced } from 'greybel-core';
import { ASTBase, ASTIdentifier, ASTMemberExpression } from 'greyscript-core';
import vscode, {
  CancellationToken,
  DefinitionLink,
  ExtensionContext,
  Position,
  Range,
  TextDocument,
  Uri
} from 'vscode';

import ASTStringify from './helper/ast-stringify';
import documentParseQueue, { ParseResult } from './helper/document-manager';
import { LookupHelper } from './helper/lookup-type';

const findAllDefinitions = (
  helper: LookupHelper,
  identifer: string,
  root: ASTBase
): DefinitionLink[] => {
  const assignments = helper.findAllAssignmentsOfIdentifier(identifer, root);
  const definitions: DefinitionLink[] = [];

  for (const assignment of assignments) {
    if (!assignment.start || !assignment.end) {
      continue;
    }

    const start = new Position(
      assignment.start.line - 1,
      assignment.start.character - 1
    );
    const end = new Position(
      assignment.end.line - 1,
      assignment.end.character - 1
    );
    const definitionLink: DefinitionLink = {
      targetUri: helper.document.uri,
      targetRange: new Range(start, end)
    };

    definitions.push(definitionLink);
  }

  return definitions;
};

const findAllImports = async (
  rootFile: string,
  chunk: ASTChunkAdvanced
): Promise<ParseResult[]> => {
  const dependencies: Set<string> = new Set([
    ...chunk.nativeImports
      .filter((nativeImport) => nativeImport.fileSystemDirectory)
      .map((nativeImport) => {
        const rootDir = Uri.joinPath(Uri.file(rootFile), '..');
        return Uri.joinPath(rootDir, nativeImport.fileSystemDirectory).fsPath;
      }),
    ...chunk.imports
      .filter((nonNativeImport) => nonNativeImport.path)
      .map((nonNativeImport) => {
        const rootDir = Uri.joinPath(Uri.file(rootFile), '..');
        return Uri.joinPath(rootDir, nonNativeImport.path).fsPath;
      })
  ]);

  return Promise.all(
    Array.from(dependencies).map(async (path) => documentParseQueue.open(path))
  );
};

export function activate(_context: ExtensionContext) {
  vscode.languages.registerDefinitionProvider('greyscript', {
    async provideDefinition(
      document: TextDocument,
      position: Position,
      _token: CancellationToken
    ): Promise<DefinitionLink[]> {
      const helper = new LookupHelper(document);
      const astResult = helper.lookupAST(position);

      if (!astResult) {
        return [];
      }

      const { outer, closest } = astResult;

      if (!(closest instanceof ASTIdentifier)) {
        return [];
      }

      const previous = outer.length > 0 ? outer[outer.length - 1] : undefined;
      let identifer = closest.name;

      if (previous && previous instanceof ASTMemberExpression) {
        identifer = ASTStringify(previous);
      }

      const definitions = findAllDefinitions(helper, identifer, closest.scope!);
      const chunk = helper.lookupScopes(closest).pop() as ASTChunkAdvanced;
      const allImports = await findAllImports(document.fileName, chunk);

      for (const item of allImports) {
        const { document, textDocument } = item;

        if (!document) {
          continue;
        }

        const helper = new LookupHelper(textDocument);
        const subDefinitions = findAllDefinitions(helper, identifer, document);

        definitions.push(...subDefinitions);
      }

      return definitions;
    }
  });
}
