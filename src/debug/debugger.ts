import { BreakpointEvent, StoppedEvent } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { Debugger, VM } from 'greybel-interpreter';
import { Uri } from 'vscode';

import { DebugSessionLike } from './types';

export class GrebyelDebugger extends Debugger {
  session: DebugSessionLike;

  constructor(session: DebugSessionLike) {
    super();
    this.session = session;
  }

  getBreakpoint(vm: VM): boolean {
    const currentInstruction = vm.getFrame().getCurrentInstruction();
    const uri = Uri.parse(currentInstruction.source.path);
    const breakpoints = this.session.breakpoints.get(uri.toString()) || [];
    const actualBreakpoint = breakpoints.find(
      (bp: DebugProtocol.Breakpoint) => {
        return bp.line === currentInstruction?.source.start.line;
      }
    ) as DebugProtocol.Breakpoint;

    if (actualBreakpoint) {
      actualBreakpoint.verified = true;
      this.session.sendEvent(new BreakpointEvent('changed', actualBreakpoint));
      this.setBreakpoint(true);
    }

    return super.getBreakpoint(vm);
  }

  interact(vm: VM) {
    this.session.lastInstruction = vm.getFrame().getCurrentInstruction();
    this.session.sendEvent(
      new StoppedEvent('breakpoint', this.session.threadID)
    );
  }
}

export class GrebyelPseudoDebugger extends Debugger {
  getBreakpoint(_vm: VM): boolean {
    return false;
  }

  interact(_vm: VM) { }
}
