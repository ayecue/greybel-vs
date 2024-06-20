import {
  ASTAssignmentStatement
} from 'miniscript-core';
import vscode, {
  CancellationToken,
  ExtensionContext,
  Location,
  Position,
  ProviderResult,
  Range,
  SymbolInformation,
  SymbolKind,
  TextDocument
} from 'vscode';

import documentParseQueue from './helper/document-manager';
import typeManager from './helper/type-manager';
import { getSymbolItemKind } from './helper/kind';
import { createExpressionId } from 'miniscript-type-analyzer';

const findAllAssignments = (
  document: TextDocument,
  query: string
): SymbolInformation[] => {
  const typeDoc = typeManager.get(document.uri.fsPath);
  const assignments = typeDoc.resolveAllAssignmentsWithQuery(query);
  const result: SymbolInformation[] = [];

  for (const assignmentItem of assignments) {
    const assignment = assignmentItem as ASTAssignmentStatement;
    const entity = typeDoc.resolveNamespace(assignment.variable, true);
    const label = entity?.label ?? createExpressionId(assignmentItem.variable);
    const kind = entity?.kind ? getSymbolItemKind(entity.kind) : SymbolKind.Variable;

    const start = new Position(
      assignment.variable.start.line - 1,
      assignment.variable.start.character - 1
    );
    const end = new Position(
      assignment.variable.end.line - 1,
      assignment.variable.end.character - 1
    );

    result.push({
      name: label,
      containerName: label,
      kind,
      location: new Location(document.uri, new Range(start, end))
    });
  }

  return result;
};

export function activate(_context: ExtensionContext) {
  vscode.languages.registerDocumentSymbolProvider('greyscript', {
    provideDocumentSymbols(
      document: TextDocument,
      _token: CancellationToken
    ): ProviderResult<SymbolInformation[]> {
      const parseResult = documentParseQueue.get(document);

      if (!parseResult.document) {
        return [];
      }

      return findAllAssignments(document, '');
    }
  });

  vscode.languages.registerWorkspaceSymbolProvider({
    provideWorkspaceSymbols(
      query: string,
      _token: CancellationToken
    ): ProviderResult<SymbolInformation[]> {
      const result: SymbolInformation[] = [];

      for (const document of vscode.workspace.textDocuments) {
        const parseResult = documentParseQueue.get(document);

        if (!parseResult.document) {
          continue;
        }

        result.push(
          ...findAllAssignments(
            document,
            query
          )
        );
      }

      return result;
    }
  });
}
