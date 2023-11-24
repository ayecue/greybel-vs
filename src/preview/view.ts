import { Tag, TagRecordOpen, transform } from 'text-mesh-transformer';

import { Stdout } from './utils/stdout';

function wrapWithTag(openTag: TagRecordOpen, content: string): string {
  switch (openTag.type) {
    case Tag.Space:
      return `<span style="margin-left:${openTag.attributes.value}px;">${content}</span>`;
    case Tag.MSpace:
      return `<span style="letter-spacing:${openTag.attributes.value}px;">${content}</span>`;
    case Tag.Color:
      return `<span style="color:${openTag.attributes.value};">${content}</span>`;
    case Tag.Underline:
      return `<span style="text-decoration:underline;">${content}</span>`;
    case Tag.Italic:
      return `<span style="font-style:italic;">${content}</span>`;
    case Tag.Bold:
      return `<span style="font-weight:bold;">${content}</span>`;
    case Tag.Strikethrough:
      return `<span style="text-decoration:line-through;">${content}</span>`;
    case Tag.Mark:
      return `<span style="background-color:${openTag.attributes.value};">${content}</span>`;
    case Tag.Lowercase:
      return `<span style="text-transform:lowercase;">${content}</span>`;
    case Tag.Uppercase:
      return `<span style="text-transform:uppercase;">${content}</span>`;
    case Tag.Align:
      return `<span style="text-align:${openTag.attributes.value};display:block;">${content}</span>`;
    case Tag.CSpace:
      return `<span style="letter-spacing:${openTag.attributes.value};">${content}</span>`;
    case Tag.LineHeight:
      return `<span style="line-height:${openTag.attributes.value};">${content}</span>`;
    case Tag.Margin:
      return `<span style="margin:0 ${openTag.attributes.value};">${content}</span>`;
    case Tag.NoBR:
      return `<nobr>${content}</nobr>`;
    case Tag.Sprite:
      return `<span style="color:${openTag.attributes.color};">&#9608</span>`;
    case Tag.Pos:
      return `<span style="position:relative;left:${openTag.attributes.value}px;">${content}</span>`;
    case Tag.Size:
      return `<span style="font-size:${openTag.attributes.value}px;">${content}</span>`;
    case Tag.VOffset:
      return `<span style="position:relative;bottom:${openTag.attributes.value}px;display:block;height:0px;">${content}</span>`;
    case Tag.Indent:
      return `<span style="margin-left:${openTag.attributes.value};">${content}</span>`;
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
  const messageBox = document.getElementById('preview');
  const out = new Stdout(messageBox);

  globalThis.addEventListener('message', (event) => {
    const payload = event.data as Message;

    switch (payload.type) {
      case 'clear': {
        out.clear();
        return;
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
        } else {
          out.write(transformed);
        }
        return;
      }
      case 'update-last': {
        const updateLastPayload = payload as UpdateLastMessage;
        out.updateLast(updateLastPayload.message);
        return;
      }
      case 'write': {
        const writePayload = payload as WriteMessage;
        out.write(writePayload.message);
      }
    }
  });
}

main();
