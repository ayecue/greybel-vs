import { parse } from 'comment-parser';
import { SignatureDefinitionArg } from 'meta-utils';
import {
  Hover,
  MarkdownString,
  ParameterInformation,
  SignatureInformation
} from 'vscode';

import { TypeInfoWithDefinition } from './type-manager';

const formatType = (type: string): string => {
  const segments = type.split(':');
  if (segments.length === 1) {
    return segments[0];
  }
  return `${segments[0]}<${segments[1]}>`;
};

const formatTypes = (types: string[] = []): string => {
  return types.map(formatType).join(' or ');
};

const useCommentDefinitionOrDefault = (
  item: TypeInfoWithDefinition
): TypeInfoWithDefinition => {
  const commentDefs = parse(`/**
    ${item.definition.description}
  */`);
  const [commentDef] = commentDefs;

  if (commentDef.tags.length > 0) {
    const commentDescription =
      commentDef.tags.find((it) => it.tag === 'description')?.description ??
      commentDef.description ??
      '';
    const commentArgs: SignatureDefinitionArg[] = commentDef.tags
      .filter((it) => it.tag === 'param')
      .map((it) => ({
        label: it.name,
        type: it.type.split('|').join(' or '),
        opt: it.optional
      }));
    const commentReturnValues = commentDef.tags.find(
      (it) => it.tag === 'return'
    ) ?? { type: 'any' };

    return new TypeInfoWithDefinition(item.label, ['function'], {
      arguments: commentArgs,
      returns: commentReturnValues.type.split('|'),
      description: commentDescription
    });
  }

  return item;
};

export const createTooltipHeader = (item: TypeInfoWithDefinition) => {
  const definition = item.definition;
  const args = definition.arguments || [];
  const returnValues = formatTypes(definition.returns) || 'null';

  if (args.length === 0) {
    return `(${item.kind}) ${item.label} (): ${returnValues}`;
  }

  const argValues = args
    .map(
      (item) =>
        `${item.label}${item.opt ? '?' : ''}: ${formatType(item.type)}${
          item.default ? ` = ${item.default}` : ''
        }`
    )
    .join(', ');

  return `(${item.kind}) ${item.label} (${argValues}): ${returnValues}`;
};

export const createTooltipBody = (item: TypeInfoWithDefinition) => {
  const definition = item.definition;
  const output = [definition.description];
  const example = definition.example || [];

  if (example.length > 0) {
    output.push(...['#### Examples:', '```', ...example, '```']);
  }

  return output.join('\n');
};

export const createSignatureInfo = (
  item: TypeInfoWithDefinition
): SignatureInformation => {
  const typeInfo = useCommentDefinitionOrDefault(item);
  const label = createTooltipHeader(typeInfo);
  const signatureInfo = new SignatureInformation(label);
  const args = typeInfo.definition.arguments ?? [];
  const text = new MarkdownString('');

  text.appendMarkdown(createTooltipBody(typeInfo));

  signatureInfo.parameters = args.map((argItem: SignatureDefinitionArg) => {
    return new ParameterInformation(
      `${argItem.label}${argItem.opt ? '?' : ''}: ${argItem.type}`
    );
  });
  signatureInfo.documentation = text;

  return signatureInfo;
};

export const createHover = (item: TypeInfoWithDefinition): Hover => {
  const typeInfo = useCommentDefinitionOrDefault(item);
  const text = new MarkdownString('');
  const label = createTooltipHeader(typeInfo);
  const description = createTooltipBody(typeInfo);
  const output = ['```', label, '```', '***', description];

  text.appendMarkdown(output.join('\n'));

  return new Hover(text);
};
