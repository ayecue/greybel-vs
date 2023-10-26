import { KeyEvent } from 'greybel-interpreter';

// Ansi KeyCodes
export enum KeyCode {
  Return = 13,
  Escape = 27,
  Space = 32,
  Tab = 9,
  Up = 38,
  Right = 39,
  Left = 37,
  Down = 40,
  Backspace = 8,
  Insert = 45,
  Home = 36,
  End = 35,
  PageDown = 34,
  PageUp = 33,
  Delete = 46,
  F1 = 112,
  F2 = 113,
  F3 = 114,
  F4 = 115,
  F5 = 116,
  F6 = 117,
  F7 = 118,
  F8 = 119,
  F9 = 120,
  F10 = 121,
  F11 = 122,
  F12 = 123
}

export interface KeyCodeItem {
  sequence: string;
  keyCode: number;
  code: string;
}

export const keyCodes: KeyCodeItem[] = [
  {
    sequence: [27, 91, 65].join(';'),
    keyCode: KeyCode.Up,
    code: 'ArrowUp'
  },
  {
    sequence: [27, 91, 67].join(';'),
    keyCode: KeyCode.Right,
    code: 'ArrowRight'
  },
  {
    sequence: [27, 91, 68].join(';'),
    keyCode: KeyCode.Left,
    code: 'ArrowLeft'
  },
  {
    sequence: [27, 91, 66].join(';'),
    keyCode: KeyCode.Down,
    code: 'ArrowDown'
  },
  {
    sequence: [27].join(';'),
    keyCode: KeyCode.Escape,
    code: 'Escape'
  },
  {
    sequence: [13].join(';'),
    keyCode: KeyCode.Return,
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
    sequence: [45].join(';'),
    keyCode: KeyCode.Insert,
    code: 'Insert'
  },
  {
    sequence: [36].join(';'),
    keyCode: KeyCode.Home,
    code: 'Home'
  },
  {
    sequence: [35].join(';'),
    keyCode: KeyCode.End,
    code: 'End'
  },
  {
    sequence: [34].join(';'),
    keyCode: KeyCode.PageDown,
    code: 'PageDown'
  },
  {
    sequence: [33].join(';'),
    keyCode: KeyCode.PageUp,
    code: 'PageUp'
  },
  {
    sequence: [46].join(';'),
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

export default function transformStringToKeyEvent(key: string): KeyEvent {
  const sequence = key
    .toUpperCase()
    .split('')
    .map((v: string) => v.charCodeAt(0))
    .join(';');
  const create = (keyCode: number, code: string): KeyEvent => ({
    keyCode,
    code
  });
  const keyCodeItem = keyCodes.find(
    (v: KeyCodeItem) => v.sequence === sequence
  );

  if (keyCodeItem) {
    return create(keyCodeItem.keyCode, keyCodeItem.code);
  }

  return create(key.toUpperCase().charCodeAt(0), key);
}
