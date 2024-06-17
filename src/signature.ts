import {
  ASTBase,
  ASTCallExpression,
  ASTType
} from 'miniscript-core';
import {
  SignatureDefinitionFunction,
  SignatureDefinitionFunctionArg,
  SignatureDefinitionBaseType,
} from 'meta-utils';
import vscode, {
  CancellationToken,
  ExtensionContext,
  ParameterInformation,
  Position,
  SignatureHelp,
  SignatureHelpContext,
  SignatureInformation,
  TextDocument
} from 'vscode';

import documentParseQueue from './helper/document-manager';
import { LookupASTResult, LookupHelper } from './helper/lookup-type';

const getClosestCallExpression = (astResult: LookupASTResult): ASTCallExpression | null => {
  if (astResult.closest.type === ASTType.CallExpression) {
    return astResult.closest as ASTCallExpression;
  }

  for (let index = astResult.outer.length - 1; index >= 0; index--) {
    const current = astResult.outer[index];

    if (current.type === ASTType.CallExpression) {
      return current as ASTCallExpression;
    }
  }

  return null;
};

export function activate(_context: ExtensionContext) {
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
        const { closest } = astResult;
        const closestCallExpr = getClosestCallExpression(astResult);

        if (closestCallExpr === null) {
          return;
        }

        const item = await helper.lookupTypeInfo({
          closest: closestCallExpr.base,
          outer: closest.scope ? [closest.scope] : []
        });

        if (!item || !item.isCallable()) {
          return;
        }

        // figure out argument position
        const astArgs = closestCallExpr.arguments;
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

        const fnDef = item.signatureDefinitions.first() as SignatureDefinitionFunction;
        const args = fnDef.getArguments() || [];
        const returnValues = fnDef.getReturns().join(' or ') || 'null';
        const argValues = args
          .map(
            (item: SignatureDefinitionFunctionArg) =>
              `${item.getLabel()}${item.isOptional() ? '?' : ''}: ${item.getTypes().join(' or ')}`
          )
          .join(', ');
        const signatureInfo = new SignatureInformation(
          `(${SignatureDefinitionBaseType.Function}) ${item.label} (${argValues}): ${returnValues}`
        );
        const params: ParameterInformation[] = args.map(
          (argItem: SignatureDefinitionFunctionArg) => {
            return new ParameterInformation(
              `${argItem.getLabel()}${argItem.isOptional() ? '?' : ''}: ${argItem.getTypes().join(' or ')}`
            );
          }
        );

        signatureInfo.parameters = params;
        signatureHelp.signatures.push(signatureInfo);

        return signatureHelp;
      }
    },
    ',',
    '('
  );
}
