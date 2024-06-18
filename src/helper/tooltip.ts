import {
  SignatureDefinitionFunction,
  SignatureDefinitionFunctionArg,
  SignatureDefinitionTypeMeta
} from 'meta-utils';
import { IEntity } from 'miniscript-type-analyzer';
import {
  Hover,
  MarkdownString,
  ParameterInformation,
  SignatureInformation
} from 'vscode';

export function formatTypes(types: SignatureDefinitionTypeMeta[] = []): string {
  return types.map((item) => item.toString().replace(',', '٫')).join(' or ');
}

export function formatDefaultValue(value: number | string): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }
  return value.toString();
}

export const createTooltipHeader = (
  item: IEntity,
  definition: SignatureDefinitionFunction
) => {
  const args = definition.getArguments() || [];
  const returnValues = formatTypes(definition.getReturns()) || 'null';

  if (args.length === 0) {
    return `(${item.kind}) ${item.label} (): ${returnValues}`;
  }

  const argValues = args
    .map(
      (item) =>
        `${item.getLabel()}${item.isOptional() ? '?' : ''}: ${formatTypes(
          item.getTypes()
        )}${
          item.getDefault()
            ? ` = ${formatDefaultValue(item.getDefault().value)}`
            : ''
        }`
    )
    .join(', ');

  return `(${item.kind}) ${item.label} (${argValues}): ${returnValues}`;
};

export const appendTooltipHeader = (
  text: MarkdownString,
  item: IEntity,
  definition: SignatureDefinitionFunction
) => {
  text.appendCodeblock(createTooltipHeader(item, definition));
  text.appendMarkdown('***\n');
};

export const appendTooltipBody = (
  text: MarkdownString,
  definition: SignatureDefinitionFunction
) => {
  const example = definition.getExample() || [];

  text.appendMarkdown(definition.getDescription() + '\n');

  if (example.length > 0) {
    text.appendMarkdown('#### Examples:\n');
    text.appendCodeblock(example.join('\n'));
  }
};

export const createSignatureInfo = (item: IEntity): SignatureInformation[] => {
  const signatureInfos: SignatureInformation[] = [];

  for (const definition of item.signatureDefinitions) {
    const fnDef = definition as SignatureDefinitionFunction;
    const label = createTooltipHeader(item, fnDef);
    const signatureInfo = new SignatureInformation(label);
    const args = fnDef.getArguments() ?? [];
    const text = new MarkdownString('');

    appendTooltipBody(text, fnDef);

    signatureInfo.parameters = args.map(
      (argItem: SignatureDefinitionFunctionArg) => {
        return new ParameterInformation(
          `${argItem.getLabel()}${argItem.isOptional() ? '?' : ''}: ${argItem
            .getTypes()
            .join(' or ')}`
        );
      }
    );
    signatureInfo.documentation = text;

    signatureInfos.push(signatureInfo);
  }

  return signatureInfos;
};

export const createHover = (item: IEntity): Hover => {
  const texts: MarkdownString[] = [];

  for (const definition of item.signatureDefinitions) {
    const text = new MarkdownString('');
    const fnDef = definition as SignatureDefinitionFunction;

    appendTooltipHeader(text, item, fnDef);
    appendTooltipBody(text, fnDef);

    texts.push(text);
  }

  return new Hover(texts);
};
