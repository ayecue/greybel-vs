import picocolors from 'picocolors';
import transform, { Tag, TagRecord } from 'text-mesh-transformer';

function picoColor(color: string | undefined, content: string): string {
  switch (color) {
    case 'black':
      return picocolors.black(content);
    case 'red':
      return picocolors.red(content);
    case 'green':
      return picocolors.green(content);
    case 'yellow':
      return picocolors.yellow(content);
    case 'blue':
      return picocolors.blue(content);
    case 'magenta':
      return picocolors.magenta(content);
    case 'cyan':
      return picocolors.cyan(content);
    case 'white':
      return picocolors.white(content);
    case 'gray':
      return picocolors.gray(content);
  }

  return content;
}

function picoBgColor(color: string | undefined, content: string): string {
  switch (color) {
    case 'black':
      return picocolors.bgBlack(content);
    case 'red':
      return picocolors.bgRed(content);
    case 'green':
      return picocolors.bgGreen(content);
    case 'yellow':
      return picocolors.bgYellow(content);
    case 'blue':
      return picocolors.bgBlue(content);
    case 'magenta':
      return picocolors.bgMagenta(content);
    case 'cyan':
      return picocolors.bgCyan(content);
    case 'white':
      return picocolors.bgWhite(content);
  }

  return content;
}

function wrapWithTag(openTag: TagRecord, content: string): string {
  switch (openTag.tag) {
    case Tag.Color:
      return picoColor(openTag.value, content);
    case Tag.Underline:
      return picocolors.underline(content);
    case Tag.Italic:
      return picocolors.italic(content);
    case Tag.Bold:
      return picocolors.bold(content);
    case Tag.Strikethrough:
      return picocolors.strikethrough(content);
    case Tag.Mark:
      return picoBgColor(openTag.value, content);
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
