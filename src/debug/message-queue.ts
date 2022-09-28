import { LoggingDebugSession, OutputEvent } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';

export interface MessageBufferItem {
  message: string;
  line?: number;
}

export default class MessageQueue {
  private buffer: MessageBufferItem[];
  private pending: boolean;
  private ending: boolean;
  private session: LoggingDebugSession;

  public constructor(session: LoggingDebugSession) {
    this.buffer = [];
    this.pending = false;
    this.ending = false;
    this.session = session;
  }

  private digest() {
    const me = this;
    const item = me.buffer.shift();

    if (!item) {
      me.pending = false;
      return;
    }

    me.pending = true;

    const e: DebugProtocol.OutputEvent = new OutputEvent(
      `${item.message}\n`,
      'stdout'
    );

    e.body.line = item.line;

    me.session.sendEvent(e);

    process.nextTick(() => {
      me.digest();
    });
  }

  clear() {
    this.print({ message: '\n'.repeat(20) });
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

    return me;
  }
}
