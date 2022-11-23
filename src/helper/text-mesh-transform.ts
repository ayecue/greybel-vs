import ansiStyles from 'ansi-styles';
import cssColorNames from 'css-color-names';
import transform, { Tag, TagRecord } from 'text-mesh-transformer';

const hasOwnProperty = Object.prototype.hasOwnProperty;

function useColor(color: string | undefined, content: string): string {
  if (!color) return content;

  const cssColorMap = cssColorNames as { [key: string]: string };

  if (hasOwnProperty.call(cssColorMap, color)) {
    const item = cssColorMap[color];
    color = item;
  }

  const ansiColorCode = ansiStyles.hexToAnsi256(color);
  const open = ansiStyles.color.ansi256(ansiColorCode);
  const close = ansiStyles.color.close;

  return `${open}${content}${close}`;
}

function useBgColor(color: string | undefined, content: string): string {
  if (!color) return content;

  const cssColorMap = cssColorNames as { [key: string]: string };

  if (hasOwnProperty.call(cssColorMap, color)) {
    const item = cssColorMap[color];
    color = item;
  }

  const ansiColorCode = ansiStyles.hexToAnsi256(color);
  const open = ansiStyles.bgColor.ansi256(ansiColorCode);
  const close = ansiStyles.bgColor.close;

  return `${open}${content}${close}`;
}

function wrapWithTag(openTag: TagRecord, content: string): string {
  switch (openTag.tag) {
    case Tag.Color:
      return useColor(openTag.value, content);
    case Tag.Underline:
      return `${ansiStyles.underline.open}${content}${ansiStyles.underline.close}`;
    case Tag.Italic:
      return `${ansiStyles.italic.open}${content}${ansiStyles.italic.close}`;
    case Tag.Bold:
      return `${ansiStyles.bold.open}${content}${ansiStyles.bold.close}`;
    case Tag.Strikethrough:
      return `${ansiStyles.strikethrough.open}${content}${ansiStyles.strikethrough.close}`;
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
