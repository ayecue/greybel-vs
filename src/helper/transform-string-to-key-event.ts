import { KeyCode } from 'greybel-gh-mock-intrinsics';
import { KeyEvent } from 'greybel-interpreter';

export interface KeyCodeItem {
  sequence: string;
  keyCode: number;
  code: string;
}

export const keyCodes: KeyCodeItem[] = [
  {
    sequence: [27, 91, 65].join(';'),
    keyCode: KeyCode.UpArrow,
    code: 'ArrowUp'
  },
  {
    sequence: [27, 91, 67].join(';'),
    keyCode: KeyCode.RightArrow,
    code: 'ArrowRight'
  },
  {
    sequence: [27, 91, 68].join(';'),
    keyCode: KeyCode.LeftArrow,
    code: 'ArrowLeft'
  },
  {
    sequence: [27, 91, 66].join(';'),
    keyCode: KeyCode.DownArrow,
    code: 'ArrowDown'
  },
  {
    sequence: [27].join(';'),
    keyCode: KeyCode.Escape,
    code: 'Escape'
  },
  {
    sequence: [13].join(';'),
    keyCode: KeyCode.Enter,
    code: 'Enter'
  },
  {
    sequence: [32].join(';'),
    keyCode: KeyCode.Space,
    code: 'Space'
  },
  {
    sequence: [9].join(';'),
    keyCode: KeyCode.Tab,
    code: 'Tab'
  },
  {
    sequence: [127].join(';'),
    keyCode: KeyCode.Backspace,
    code: 'Backspace'
  },
  {
    sequence: [27, 91, 50, 126].join(';'),
    keyCode: KeyCode.Insert,
    code: 'Insert'
  },
  {
    sequence: [27, 91, 72].join(';'),
    keyCode: KeyCode.Home,
    code: 'Home'
  },
  {
    sequence: [27, 91, 70].join(';'),
    keyCode: KeyCode.End,
    code: 'End'
  },
  {
    sequence: [27, 91, 54, 126].join(';'),
    keyCode: KeyCode.PageDown,
    code: 'PageDown'
  },
  {
    sequence: [27, 91, 53, 126].join(';'),
    keyCode: KeyCode.PageUp,
    code: 'PageUp'
  },
  {
    sequence: [27, 91, 51, 126].join(';'),
    keyCode: KeyCode.Delete,
    code: 'Delete'
  },
  {
    sequence: [27, 79, 80].join(';'),
    keyCode: KeyCode.F1,
    code: 'F1'
  },
  {
    sequence: [27, 79, 81].join(';'),
    keyCode: KeyCode.F2,
    code: 'F2'
  },
  {
    sequence: [27, 79, 82].join(';'),
    keyCode: KeyCode.F3,
    code: 'F3'
  },
  {
    sequence: [27, 79, 83].join(';'),
    keyCode: KeyCode.F4,
    code: 'F4'
  },
  {
    sequence: [27, 91, 49, 53, 126].join(';'),
    keyCode: KeyCode.F5,
    code: 'F5'
  },
  {
    sequence: [27, 91, 49, 55, 126].join(';'),
    keyCode: KeyCode.F6,
    code: 'F6'
  },
  {
    sequence: [27, 91, 49, 56, 126].join(';'),
    keyCode: KeyCode.F7,
    code: 'F7'
  },
  {
    sequence: [27, 91, 49, 57, 126].join(';'),
    keyCode: KeyCode.F8,
    code: 'F8'
  },
  {
    sequence: [27, 91, 50, 48, 126].join(';'),
    keyCode: KeyCode.F9,
    code: 'F9'
  },
  {
    sequence: [27, 91, 50, 49, 126].join(';'),
    keyCode: KeyCode.F10,
    code: 'F10'
  },
  {
    sequence: [27, 91, 50, 51, 126].join(';'),
    keyCode: KeyCode.F11,
    code: 'F11'
  },
  {
    sequence: [27, 91, 50, 52, 126].join(';'),
    keyCode: KeyCode.F12,
    code: 'F12'
  }
];

export default function transformStringToKeyEvent(input: string): KeyEvent {
  const sequence = input
    .split('')
    .map((v: string) => v.charCodeAt(0))
    .join(';');
  const keyCodeItem = keyCodes.find(
    (v: KeyCodeItem) => v.sequence === sequence
  );

  if (keyCodeItem) {
    return {
      keyCode: keyCodeItem.keyCode,
      code: keyCodeItem.code
    };
  }

  return {
    code: input
  };
}
