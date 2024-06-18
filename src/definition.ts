import {
  ASTBaseBlockWithScope,
  ASTMemberExpression,
  ASTBase
} from 'miniscript-core';
import vscode, {
  CancellationToken,
  DefinitionLink,
  ExtensionContext,
  Position,
  Range,
  TextDocument
} from 'vscode';

import documentParseQueue from './helper/document-manager';
import { LookupHelper } from './helper/lookup-type';

const findAllDefinitions = (
  helper: LookupHelper,
  item: ASTBase,
  root: ASTBaseBlockWithScope
): DefinitionLink[] => {
  const assignments = helper.findAllAssignmentsOfItem(item, root);
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

      const previous = outer.length > 0 ? outer[outer.length - 1] : undefined;
      let target: ASTBase = closest;

      if (previous) {
        if (
          previous instanceof ASTMemberExpression &&
          previous.identifier === closest
        ) {
          target = previous;
        }
      }

      const definitions = findAllDefinitions(helper, target, target.scope!);
      const allImports = await documentParseQueue.get(document).getImports();

      for (const item of allImports) {
        const { document, textDocument } = item;

        if (!document) {
          continue;
        }

        const helper = new LookupHelper(textDocument);
        const subDefinitions = findAllDefinitions(helper, target, document);

        definitions.push(...subDefinitions);
      }

      return definitions;
    }
  });
}
