import {
  AnotherAnsiProvider,
  EscapeSequence,
  ModifierType
} from 'another-ansi';
import cssColorNames from 'css-color-names';
import { Tag, TagRecordOpen, transform } from 'text-mesh-transformer';

const hasOwnProperty = Object.prototype.hasOwnProperty;
export const ansiProvider = new AnotherAnsiProvider(EscapeSequence.Hex);

export function useColor(color: string | undefined, content: string): string {
  if (!color) return content;

  const cssColorMap = cssColorNames as { [key: string]: string };

  if (hasOwnProperty.call(cssColorMap, color)) {
    const item = cssColorMap[color];
    color = item;
  }

  return ansiProvider.colorWithHex(color, content);
}

export function useBgColor(color: string | undefined, content: string): string {
  if (!color) return content;

  const cssColorMap = cssColorNames as { [key: string]: string };

  if (hasOwnProperty.call(cssColorMap, color)) {
    const item = cssColorMap[color];
    color = item;
  }

  return ansiProvider.bgColorWithHex(color, content);
}

function wrapWithTag(
  openTag: TagRecordOpen,
  content: string,
  hideUnsupportedTags: boolean
): string {
  switch (openTag.type) {
    case Tag.Color:
      return useColor(openTag.attributes.value, content);
    case Tag.Underline:
      return ansiProvider.modify(ModifierType.Underline, content);
    case Tag.Italic:
      return ansiProvider.modify(ModifierType.Italic, content);
    case Tag.Bold:
      return ansiProvider.modify(ModifierType.Bold, content);
    case Tag.Strikethrough:
      return ansiProvider.modify(ModifierType.Strikethrough, content);
    case Tag.Mark:
      return useBgColor(openTag.attributes.value, content);
    case Tag.Lowercase:
      return content.toLowerCase();
    case Tag.Uppercase:
      return content.toLowerCase();
  }

  if (hideUnsupportedTags) {
    return content;
  }
  if (openTag.attributes.value) {
    return `<${openTag.type}=${openTag.attributes.value}>${content}</${openTag.type}>`;
  }

  return `<${openTag.type}>${content}</${openTag.type}>`;
}

export default function (
  message: string,
  hideUnsupportedTags: boolean = false
): string {
  return transform(
    message,
    (openTag: TagRecordOpen, content: string): string => {
      return wrapWithTag(openTag, content, hideUnsupportedTags);
    }
  );
}
