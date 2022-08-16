import { LoggingDebugSession, OutputEvent } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';

export default class MessageQueue {
  private buffer: string[];
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
    const message = me.buffer.shift();

    if (!message) {
      me.pending = false;
      return;
    }

    me.pending = true;

    const e: DebugProtocol.OutputEvent = new OutputEvent(`${message}\n`);
    me.session.sendEvent(e);

    process.nextTick(() => {
      me.digest();
    });
  }

  private update() {
    const me = this;

    if (me.ending || me.pending) {
      return;
    }

    me.digest();
  }

  public print(message: string): MessageQueue {
    const me = this;

    if (typeof message !== 'string') {
      return me;
    }

    me.buffer.push(message);
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
