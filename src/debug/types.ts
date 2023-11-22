import { LoggingDebugSession } from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { Instruction } from 'greybel-interpreter';

export interface DebugSessionLike extends LoggingDebugSession {
  threadID: number;
  lastInstruction: Instruction | undefined;
  breakpoints: Map<string, DebugProtocol.Breakpoint[]>;
}
