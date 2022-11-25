import { LoggingDebugSession } from '@vscode/debugadapter';

import PseudoTerminal from '../helper/pseudo-terminal';

export interface MessageBufferItem {
  message: string;
  line?: number;
}

export enum MessageCodes {
  Clear = '\x1b[2J\x1b[3J\x1b[;H',
  NewLine = '\r\n'
}

export default class MessageQueue {
  private buffer: MessageBufferItem[];
  private pending: boolean;
  private ending: boolean;
  private session: LoggingDebugSession;
  terminal: PseudoTerminal;

  public constructor(session: LoggingDebugSession) {
    this.buffer = [];
    this.pending = false;
    this.ending = false;
    this.session = session;
    this.terminal = new PseudoTerminal('greybel');
  }

  private digest() {
    const me = this;
    const item = me.buffer.shift();

    if (!item) {
      me.pending = false;
      return;
    }

    me.pending = true;
    me.terminal.print(item.message);

    process.nextTick(() => {
      me.digest();
    });
  }

  clear() {
    this.terminal.clear();
  }

  private update() {
    const me = this;

    if (me.ending || me.pending) {
      return;
    }

    me.digest();
  }

  public print(item: MessageBufferItem): MessageQueue {
    const me = this;

    if (typeof item !== 'object') {
      return me;
    }

    me.buffer.push(item);
    me.update();

    return me;
  }

  public end(): MessageQueue {
    const me = this;

    if (me.ending) {
      return me;
    }

    me.ending = true;

    if (!me.pending && me.buffer.length > 0) {
      me.digest();
    }

    me.terminal.dispose();

    return me;
  }
}
