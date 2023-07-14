import { BreakpointEvent, StoppedEvent } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { Debugger, OperationContext } from 'greybel-interpreter';
import { Uri } from 'vscode';

import { GreybelDebugSession } from './session';

export class GrebyelDebugger extends Debugger {
  session: GreybelDebugSession;

  constructor(session: GreybelDebugSession) {
    super();
    this.session = session;
  }

  getBreakpoint(operationContext: OperationContext): boolean {
    const uri = Uri.file(operationContext.target);
    const breakpoints = this.session.breakpoints.get(uri.fsPath) || [];
    const actualBreakpoint = breakpoints.find(
      (bp: DebugProtocol.Breakpoint) => {
        return bp.line === operationContext.stackTrace[0]?.item?.start.line;
      }
    ) as DebugProtocol.Breakpoint;

    if (actualBreakpoint) {
      actualBreakpoint.verified = true;
      this.session.sendEvent(new BreakpointEvent('changed', actualBreakpoint));
      this.setBreakpoint(true);
    }

    return super.getBreakpoint(operationContext);
  }

  interact(operationContext: OperationContext) {
    this.session.lastContext = operationContext;
    this.session.sendEvent(
      new StoppedEvent('breakpoint', GreybelDebugSession.threadID)
    );
  }
}

export class GrebyelPseudoDebugger extends Debugger {
  getBreakpoint(_operationContext: OperationContext): boolean {
    return false;
  }

  interact(_operationContext: OperationContext) {}
}
