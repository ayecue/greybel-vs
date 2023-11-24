import { Tag, TagRecordOpen, transform } from 'text-mesh-transformer';

import { Stdout } from './utils/stdout';

function parsePixelOrEmValue(value: string) {
  if (value.endsWith('em')) {
    return value;
  } else if (value.endsWith('px')) {
    return value;
  }

  return `${value}px`;
}

function parseNumber(value: string, defaultNumber: number = 1) {
  try {
    return parseFloat(value);
  } catch (err: any) {
    return defaultNumber;
  }
}

function wrapWithTag(openTag, content) {
  switch (openTag.type) {
    case Tag.Space:
      return `<span class="space" style="margin-left:${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.MSpace:
      return `<span class="msspace" style="letter-spacing:${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.Color:
      return `<span class="color" style="color:${openTag.attributes.value};">${content}</span>`;
    case Tag.Underline:
      return `<span class="underline">${content}</span>`;
    case Tag.Italic:
      return `<span class="italic">${content}</span>`;
    case Tag.Bold:
      return `<span class="bold">${content}</span>`;
    case Tag.Strikethrough:
      return `<span class="strikethrough">${content}</span>`;
    case Tag.Mark:
      return `<span class="mark" style="background-color:${openTag.attributes.value};">${content}</span>`;
    case Tag.Lowercase:
      return `<span class="lowercase">${content}</span>`;
    case Tag.Uppercase:
      return `<span class="uppercase">${content}</span>`;
    case Tag.Align:
      return `<span class="align" style="text-align:${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.CSpace:
      return `<span class="cspace" style="letter-spacing:${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.LineHeight:
      return `<span class="lineheight" style="line-height:${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.Margin:
      return `<span class="margin" style="margin:0 ${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.NoBR:
      return `<nobr>${content}</nobr>`;
    case Tag.Sprite:
      return `<span class="sprite" style="background-color:${openTag.attributes.color};">X</span>`;
    case Tag.Pos:
      return `<span class="pos" style="margin-left:${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.Size:
      return `<span class="size" style="font-size:${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.Scale:
      return `<span class="scale" style="transform:scale(${parseNumber(openTag.attributes.value)});">${content}</span>`;
    case Tag.VOffset:
      return `<span class="voffset" style="transform:translate(0px,${parsePixelOrEmValue(openTag.attributes.value)});">${content}</span>`;
    case Tag.Indent:
      return `<span class="indent" style="margin-left:${parsePixelOrEmValue(openTag.attributes.value)};">${content}</span>`;
    case Tag.Rotate:
      return `<span class="rotate" style="rotate:${openTag.attributes.value}deg;">${content}</span>`;
  }

  if (openTag.attributes.value) {
    return `&lt${openTag.type}&#61;${openTag.attributes.value}&gt;${content}&lt/${openTag.type}&gt;`;
  }

  return `&lt${openTag.type}&gt;${content}&lt/${openTag.type}&gt;`;
}

interface Message {
  type: 'print' | 'clear' | 'write' | 'update-last';
}

interface PrintMessage {
  type: 'print';
  message: string;
  appendNewLine: boolean;
  replace: boolean;
}

interface WriteMessage {
  type: 'write';
  message: string;
}

interface UpdateLastMessage {
  type: 'update-last';
  message: string;
}

function main() {
  const rootNode = document.getElementById('root');
  const messageBox = document.getElementById('preview');
  const out = new Stdout(messageBox);

  globalThis.addEventListener('message', (event) => {
    const payload = event.data as Message;

    switch (payload.type) {
      case 'clear': {
        out.clear();
        rootNode.scrollTo(0, 0);
        break;
      }
      case 'print': {
        const printPayload = payload as PrintMessage;
        const transformed = transform(
          printPayload.message,
          (openTag: TagRecordOpen, content: string): string => {
            return wrapWithTag(openTag, content);
          }
        ).replace(/\\n/g, '\n');

        if (printPayload.replace) {
          out.replace(transformed + '\n');
        } else if (printPayload.appendNewLine) {
          out.write(transformed + '\n');
          rootNode.scrollTo(0, messageBox.scrollHeight);
        } else {
          out.write(transformed);
          rootNode.scrollTo(0, messageBox.scrollHeight);
        }
        break;
      }
      case 'update-last': {
        const updateLastPayload = payload as UpdateLastMessage;
        out.updateLast(updateLastPayload.message);
        break;
      }
      case 'write': {
        const writePayload = payload as WriteMessage;
        out.write(writePayload.message);
        rootNode.scrollTo(0, messageBox.scrollHeight);
        break;
      }
    }
  });
}

main();
