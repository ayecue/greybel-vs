import { LoggingDebugSession } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { OperationContext } from 'greybel-interpreter';

export interface DebugSessionLike extends LoggingDebugSession {
  threadID: number;
  lastContext: OperationContext | undefined;
  breakpoints: Map<string, DebugProtocol.Breakpoint[]>;
}
