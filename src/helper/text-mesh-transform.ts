import {
  AnotherAnsiProvider,
  EscapeSequence,
  ModifierType
} from 'another-ansi';
import cssColorNames from 'css-color-names';
import transform, { Tag, TagRecord } from 'text-mesh-transformer';

const hasOwnProperty = Object.prototype.hasOwnProperty;
const provider = new AnotherAnsiProvider(EscapeSequence.Hex);

export function useColor(color: string | undefined, content: string): string {
  if (!color) return content;

  const cssColorMap = cssColorNames as { [key: string]: string };

  if (hasOwnProperty.call(cssColorMap, color)) {
    const item = cssColorMap[color];
    color = item;
  }

  return provider.colorWithHex(color, content);
}

export function useBgColor(color: string | undefined, content: string): string {
  if (!color) return content;

  const cssColorMap = cssColorNames as { [key: string]: string };

  if (hasOwnProperty.call(cssColorMap, color)) {
    const item = cssColorMap[color];
    color = item;
  }

  return provider.bgColorWithHex(color, content);
}

function wrapWithTag(openTag: TagRecord, content: string): string {
  switch (openTag.tag) {
    case Tag.Color:
      return useColor(openTag.value, content);
    case Tag.Underline:
      return provider.modify(ModifierType.Underline, content);
    case Tag.Italic:
      return provider.modify(ModifierType.Italic, content);
    case Tag.Bold:
      return provider.modify(ModifierType.Bold, content);
    case Tag.Strikethrough:
      return provider.modify(ModifierType.Strikethrough, content);
    case Tag.Mark:
      return useBgColor(openTag.value, content);
    case Tag.Lowercase:
      return content.toLowerCase();
    case Tag.Uppercase:
      return content.toLowerCase();
  }

  if (openTag.value) {
    return `<${openTag.tag}=${openTag.value}>${content}</${openTag.tag}>`;
  }

  return `<${openTag.tag}>${content}</${openTag.tag}>`;
}

export default function (message: string): string {
  return transform(message, (openTag: TagRecord, content: string): string => {
    return wrapWithTag(openTag, content);
  });
}
