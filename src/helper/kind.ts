import { CompletionItemKind as EntityCompletionItemKind } from 'miniscript-type-analyzer';
import { CompletionItemKind, SymbolKind } from 'vscode';

export const getCompletionItemKind = (
  kind: EntityCompletionItemKind
): CompletionItemKind => {
  switch (kind) {
    case EntityCompletionItemKind.Constant:
      return CompletionItemKind.Constant;
    case EntityCompletionItemKind.Variable:
      return CompletionItemKind.Variable;
    case EntityCompletionItemKind.Expression:
      return CompletionItemKind.Variable;
    case EntityCompletionItemKind.Function:
      return CompletionItemKind.Function;
    case EntityCompletionItemKind.ListConstructor:
    case EntityCompletionItemKind.MapConstructor:
    case EntityCompletionItemKind.Literal:
    case EntityCompletionItemKind.Unknown:
      return CompletionItemKind.Value;
  }
};

export const getSymbolItemKind = (
  kind: EntityCompletionItemKind
): SymbolKind => {
  switch (kind) {
    case EntityCompletionItemKind.Constant:
      return SymbolKind.Constant;
    case EntityCompletionItemKind.Variable:
      return SymbolKind.Variable;
    case EntityCompletionItemKind.Expression:
      return SymbolKind.Variable;
    case EntityCompletionItemKind.Function:
      return SymbolKind.Function;
    case EntityCompletionItemKind.ListConstructor:
      return SymbolKind.Array;
    case EntityCompletionItemKind.MapConstructor:
      return SymbolKind.Object;
    case EntityCompletionItemKind.Literal:
    case EntityCompletionItemKind.Unknown:
      return SymbolKind.Variable;
  }
};
