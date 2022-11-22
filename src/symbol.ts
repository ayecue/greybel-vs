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

      const root = parseResult.document as ASTChunk;
      const scopes: ASTBaseBlockWithScope[] = [root, ...root.scopes];
      const result: SymbolInformation[] = [];

      for (const item of scopes) {
        for (const assignmentItem of item.assignments) {
          const assignment = assignmentItem as ASTAssignmentStatement;
          const current = ASTStringify(assignment.variable);

          if (!assignment.variable.start || !assignment.variable.end) {
            continue;
          }

          const start = new Position(
            assignment.variable.start.line,
            assignment.variable.start.character
          );
          const end = new Position(
            assignment.variable.end.line,
            assignment.variable.end.character
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
    }
  });
}
