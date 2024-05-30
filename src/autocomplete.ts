import {
  ASTBase,
  ASTCallExpression,
  ASTIndexExpression,
  ASTMemberExpression
} from 'miniscript-core';
import {
  SignatureDefinitionContainer
} from 'meta-utils';
import { greyscriptMeta } from 'greyscript-meta';
import vscode, {
  CancellationToken,
  CompletionContext,
  CompletionItem,
  CompletionItemKind,
  CompletionList,
  ExtensionContext,
  Position,
  SignatureHelp,
  SignatureHelpContext,
  TextDocument
} from 'vscode';

import { AVAILABLE_CONSTANTS } from './autocomplete/constants';
import { AVAILABLE_KEYWORDS } from './autocomplete/keywords';
import { AVAILABLE_OPERATORS } from './autocomplete/operators';
import transformASTToString from './helper/ast-stringify';
import documentParseQueue from './helper/document-manager';
import { LookupHelper } from './helper/lookup-type';
import { TypeInfo, TypeInfoWithDefinition } from './helper/type-manager';
import { createSignatureInfo } from './helper/tooltip';

export const convertDefinitionsToCompletionList = (
  definitions: SignatureDefinitionContainer
): CompletionItem[] => {
  const completionItems: CompletionItem[] = [];
  const keys = Object.keys(definitions);

  for (let index = 0; index < keys.length; index++) {
    completionItems.push(
      new CompletionItem(keys[index], CompletionItemKind.Function)
    );
  }

  return completionItems;
};

export const getCompletionList = (
  helper: LookupHelper,
  item: ASTBase
): CompletionItem[] => {
  const typeInfo = helper.lookupBasePath(item);

  if (typeInfo instanceof TypeInfoWithDefinition) {
    const definitions = greyscriptMeta.getDefinitions(typeInfo.returns);
    const completionItems: CompletionItem[] = [
      ...convertDefinitionsToCompletionList(definitions)
    ];

    if (completionItems.length > 0) {
      return completionItems;
    }
  } else if (typeInfo instanceof TypeInfo) {
    const definitions = greyscriptMeta.getDefinitions(typeInfo.type);
    const completionItems: CompletionItem[] = [
      ...convertDefinitionsToCompletionList(definitions)
    ];

    if (completionItems.length > 0) {
      return completionItems;
    }
  }

  return [];
};

export const getDefaultCompletionList = (): CompletionItem[] => {
  const defaultDefinitions = greyscriptMeta.getDefinitions(['general']);

  return [
    ...AVAILABLE_KEYWORDS,
    ...AVAILABLE_OPERATORS,
    ...AVAILABLE_CONSTANTS,
    ...convertDefinitionsToCompletionList(defaultDefinitions)
  ];
};

export function activate(_context: ExtensionContext) {
  vscode.languages.registerCompletionItemProvider('greyscript', {
    async provideCompletionItems(
      document: TextDocument,
      position: Position,
      _token: CancellationToken,
      _ctx: CompletionContext
    ) {
      documentParseQueue.refresh(document);

      const helper = new LookupHelper(document);
      const astResult = helper.lookupAST(position);
      const completionItems: CompletionItem[] = [];
      let base = '';

      if (astResult) {
        const { closest } = astResult;

        if (
          closest instanceof ASTMemberExpression
        ) {
          base = transformASTToString(closest.base);
          completionItems.push(...getCompletionList(helper, closest));
        } else if (
          closest instanceof ASTIndexExpression
        ) {
          base = transformASTToString(closest.base);
          completionItems.push(...getCompletionList(helper, closest));
        } else {
          completionItems.push(...getDefaultCompletionList());
        }
      } else {
        completionItems.push(...getDefaultCompletionList());
      }

      if (!astResult) {
        return new CompletionList(completionItems);
      }

      const existingProperties = new Set([
        ...completionItems.map((item) => item.label)
      ]);
      const allImports = await documentParseQueue.get(document).getImports();

      // filter for existing base
      if (base.length > 0) {
        const baseStart = `${base}.`;
        const basePattern = new RegExp(`^${base}\\.`);

        // get all identifer available in imports
        for (const item of allImports) {
          const { document } = item;

          if (!document) {
            continue;
          }

          completionItems.push(
            ...helper
              .findAllAvailableIdentifier(document)
              .filter(
                (property: string) =>
                  property.startsWith(baseStart) &&
                  !existingProperties.has(property)
              )
              .map((property: string) => {
                const remainingValue = property.replace(basePattern, '');
                existingProperties.add(remainingValue);
                return new CompletionItem(
                  remainingValue,
                  CompletionItemKind.Variable
                );
              })
          );
        }

        // get all identifer available in scope
        completionItems.push(
          ...helper
            .findAllAvailableIdentifierRelatedToPosition(astResult.closest)
            .filter(
              (property: string) =>
                property.startsWith(baseStart) &&
                !existingProperties.has(property)
            )
            .map((property: string) => {
              const remainingValue = property.replace(basePattern, '');
              existingProperties.add(remainingValue);
              return new CompletionItem(
                remainingValue,
                CompletionItemKind.Variable
              );
            })
        );

        return new CompletionList(completionItems);
      }

      // get all identifer available in imports
      for (const item of allImports) {
        const { document } = item;

        if (!document) {
          continue;
        }

        completionItems.push(
          ...helper
            .findAllAvailableIdentifier(document)
            .filter((property: string) => !existingProperties.has(property))
            .map((property: string) => {
              existingProperties.add(property);
              return new CompletionItem(property, CompletionItemKind.Variable);
            })
        );
      }

      // get all identifer available in scope
      completionItems.push(
        ...helper
          .findAllAvailableIdentifierRelatedToPosition(astResult.closest)
          .filter((property: string) => !existingProperties.has(property))
          .map((property: string) => {
            existingProperties.add(property);
            return new CompletionItem(property, CompletionItemKind.Variable);
          })
      );

      return new CompletionList(completionItems);
    }
  }, '.');

  vscode.languages.registerSignatureHelpProvider(
    'greyscript',
    {
      async provideSignatureHelp(
        document: TextDocument,
        position: Position,
        _token: CancellationToken,
        _ctx: SignatureHelpContext
      ): Promise<SignatureHelp> {
        documentParseQueue.refresh(document);
        const helper = new LookupHelper(document);
        const astResult = helper.lookupAST(position);

        if (!astResult) {
          return;
        }

        // filter out root call expression for signature
        let rootCallExpression: ASTCallExpression | undefined;

        if (astResult.closest.type === 'CallExpression') {
          rootCallExpression = astResult.closest as ASTCallExpression;
        } else {
          for (let index = astResult.outer.length - 1; index >= 0; index--) {
            const current = astResult.outer[index];

            if (current.type === 'CallExpression') {
              rootCallExpression = current as ASTCallExpression;
              break;
            }
          }
        }

        if (!rootCallExpression) {
          return;
        }

        const root = helper.lookupScope(astResult.closest);
        const item = await helper.lookupTypeInfo({
          closest: rootCallExpression,
          outer: root ? [root] : []
        });

        if (!item || !(item instanceof TypeInfoWithDefinition)) {
          return;
        }

        // figure out argument position
        const astArgs = rootCallExpression.arguments;
        const selectedIndex = astArgs.findIndex((argItem: ASTBase) => {
          const leftIndex = argItem.start!.character - 1;
          const rightIndex = argItem.end!.character;

          return (
            leftIndex <= position.character && rightIndex >= position.character
          );
        });

        const signatureHelp = new SignatureHelp();

        signatureHelp.activeParameter =
          selectedIndex === -1 ? 0 : selectedIndex;
        signatureHelp.signatures = [];
        signatureHelp.activeSignature = 0;
        signatureHelp.signatures.push(createSignatureInfo(item));

        return signatureHelp;
      }
    },
    ',',
    '('
  );
}
