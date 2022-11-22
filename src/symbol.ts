import {
  ASTAssignmentStatement,
  ASTBaseBlockWithScope,
  ASTChunk
} from 'greyscript-core';
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

import ASTStringify from './helper/ast-stringify';
import documentParseQueue from './helper/document-manager';

const findAllAssignments = (
  root: ASTChunk,
  document: TextDocument,
  isValid: (c: string) => boolean = () => true
): SymbolInformation[] => {
  const scopes: ASTBaseBlockWithScope[] = [root, ...root.scopes];
  const result: SymbolInformation[] = [];

  for (const item of scopes) {
    for (const assignmentItem of item.assignments) {
      const assignment = assignmentItem as ASTAssignmentStatement;
      const current = ASTStringify(assignment.variable);

      if (!isValid(current)) {
        continue;
      }

      if (!assignment.variable.start || !assignment.variable.end) {
        continue;
      }

      const start = new Position(
        assignment.variable.start.line - 1,
        assignment.variable.start.character - 1
      );
      const end = new Position(
        assignment.variable.end.line - 1,
        assignment.variable.end.character - 1
      );
      result.push({
        name: current,
        containerName: current,
        kind: SymbolKind.Variable,
        location: new Location(document.uri, new Range(start, end))
      });
    }
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

      return findAllAssignments(parseResult.document as ASTChunk, document);
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
            parseResult.document as ASTChunk,
            document,
            (name: string) => name.includes(query)
          )
        );
      }

      return result;
    }
  });
}
