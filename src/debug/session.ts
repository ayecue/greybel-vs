import {
  Breakpoint,
  BreakpointEvent,
  InitializedEvent,
  LoggingDebugSession,
  Scope,
  Source,
  StackFrame,
  StoppedEvent,
  TerminatedEvent,
  Thread
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { init as initGHIntrinsics } from 'greybel-gh-mock-intrinsics';
import {
  ContextType,
  CustomFunction,
  CustomString,
  CustomValue,
  Debugger,
  Defaults,
  HandlerContainer,
  Interpreter,
  OperationContext
} from 'greybel-interpreter';
import { init as initIntrinsics } from 'greybel-intrinsics';
import vscode from 'vscode';

import { InterpreterResourceProvider, PseudoFS } from '../resource';
import MessageQueue from './message-queue';

const hasOwnProperty = Object.prototype.hasOwnProperty;

interface ILaunchRequestArguments extends DebugProtocol.LaunchRequestArguments {
  program: string;
  noDebug?: boolean;
}

interface IRuntimeStackFrame {
  index: number;
  name: string;
  file: string;
  line: number;
  column?: number;
}

interface IRuntimeStack {
  count: number;
  frames: IRuntimeStackFrame[];
}

export class GreybelDebugSession extends LoggingDebugSession {
  public static threadID = 1;
  public lastContext: OperationContext | undefined;
  public breakpoints: Map<string, DebugProtocol.Breakpoint[]> = new Map();

  private _runtime: Interpreter;
  private _breakpointIncrement: number = 0;
  private _restart: boolean = false;
  private _messageQueue: MessageQueue | null;

  public constructor() {
    super('greybel-debug.txt');

    // this debugger uses zero-based lines and columns
    const me = this;
    const vsAPI = new Map();

    vsAPI.set(
      'print',
      CustomFunction.createExternal(
        'print',
        (
          _ctx: OperationContext,
          _self: CustomValue,
          args: Map<string, CustomValue>
        ): Promise<CustomValue> => {
          me._messageQueue?.print(args.get('value')?.toString() || '');
          return Promise.resolve(Defaults.Void);
        }
      ).addArgument('value')
    );

    vsAPI.set(
      'exit',
      CustomFunction.createExternal(
        'exit',
        (
          _ctx: OperationContext,
          _self: CustomValue,
          args: Map<string, CustomValue>
        ): Promise<CustomValue> => {
          me._messageQueue?.print(args.get('value')?.toString() || '');
          me._runtime.exit();
          return Promise.resolve(Defaults.Void);
        }
      ).addArgument('value')
    );

    vsAPI.set(
      'user_input',
      CustomFunction.createExternal(
        'user_input',
        async (
          _ctx: OperationContext,
          _self: CustomValue,
          args: Map<string, CustomValue>
        ): Promise<CustomValue> => {
          const message = args.get('message')?.toString();
          // const isPassword = args.get('isPassword')?.toTruthy();

          return new Promise((resolve) => {
            vscode.window
              .showInputBox({
                title: 'user_input',
                prompt: message,
                ignoreFocusOut: true
              })
              .then(
                (value: any) => {
                  resolve(new CustomString(value.toString()));
                },
                (_value: any) => {
                  resolve(Defaults.Void);
                }
              );
          });
        }
      )
        .addArgument('message')
        .addArgument('isPassword')
        .addArgument('anyKey')
    );

    me.setDebuggerLinesStartAt1(false);
    me.setDebuggerColumnsStartAt1(false);

    this._messageQueue = null;
    this._runtime = new Interpreter({
      handler: new HandlerContainer({
        resourceHandler: new InterpreterResourceProvider()
      }),
      debugger: new GrebyelDebugger(me),
      api: initIntrinsics(initGHIntrinsics(vsAPI))
    });
  }

  /**
   * The 'initialize' request is the first request called by the frontend
   * to interrogate the features the debug adapter provides.
   */
  protected initializeRequest(
    response: DebugProtocol.InitializeResponse,
    _args: DebugProtocol.InitializeRequestArguments
  ): void {
    // build and return the capabilities of this debug adapter:
    response.body = response.body || {};

    // the adapter implements the configurationDone request.
    response.body.supportsConfigurationDoneRequest = false;

    // make VS Code use 'evaluate' when hovering over source
    response.body.supportsEvaluateForHovers = false;

    // make VS Code show a 'step back' button
    response.body.supportsStepBack = false;

    // make VS Code support data breakpoints
    response.body.supportsDataBreakpoints = false;

    // make VS Code support completion in REPL
    response.body.supportsCompletionsRequest = false;
    response.body.completionTriggerCharacters = ['.', '['];

    // make VS Code send cancel request
    response.body.supportsCancelRequest = false;

    // make VS Code send the breakpointLocations request
    response.body.supportsBreakpointLocationsRequest = true;

    // make VS Code provide "Step in Target" functionality
    response.body.supportsStepInTargetsRequest = false;

    // the adapter defines two exceptions filters, one with support for conditions.
    response.body.supportsExceptionFilterOptions = false;
    response.body.exceptionBreakpointFilters = [];

    // make VS Code send exceptionInfo request
    response.body.supportsExceptionInfoRequest = false;

    // make VS Code send setVariable request
    response.body.supportsSetVariable = false;

    // make VS Code send setExpression request
    response.body.supportsSetExpression = false;

    // make VS Code send disassemble request
    response.body.supportsDisassembleRequest = false;
    response.body.supportsSteppingGranularity = false;
    response.body.supportsInstructionBreakpoints = false;

    // make VS Code able to read and write variable memory
    response.body.supportsReadMemoryRequest = false;
    response.body.supportsWriteMemoryRequest = false;

    response.body.supportsRestartRequest = true;

    this.sendResponse(response);

    // since this debug adapter can accept configuration requests like 'setBreakpoint' at any time,
    // we request them early by sending an 'initializeRequest' to the frontend.
    // The frontend will end the configuration sequence by calling 'configurationDone' request.
    this.sendEvent(new InitializedEvent());
  }

  protected async launchRequest(
    response: DebugProtocol.LaunchResponse,
    args: ILaunchRequestArguments
  ): Promise<void> {
    const me = this;

    me._runtime.setTarget(args.program);
    me._runtime.setDebugger(
      args.noDebug ? new GrebyelPseudoDebugger() : new GrebyelDebugger(me)
    );

    me._restart = false;
    me._messageQueue = new MessageQueue(me);

    // start the program in the runtime
    try {
      const params = await vscode.window.showInputBox({
        title: 'Enter execution parameters'
      });
      const paramSegments =
        params && params.length > 0 ? params.split(' ') : [];

      me._runtime.params = paramSegments;
      await me._runtime.run();
      me.sendResponse(response);
    } catch (err: any) {
      const opc =
        me._runtime.apiContext.getLastActive() || me._runtime.globalContext;

      if (opc.stackItem) {
        me.sendErrorResponse(response, {
          id: 1001,
          format: `Runtime error: ${err.message} at line ${opc.stackItem.start.line}:${opc.stackItem.start.character} in ${opc.target}`,
          showUser: true
        });
      } else if (hasOwnProperty.call(err, 'line')) {
        const line = err.line;

        me.sendErrorResponse(response, {
          id: 1001,
          format: `Parsing error: ${err.message} at line ${line} in ${opc.target}`,
          showUser: true
        });
      } else if (hasOwnProperty.call(err, 'token')) {
        const line = err.token.line;

        me.sendErrorResponse(response, {
          id: 1001,
          format: `Parsing error: ${err.message} at line ${line} in ${opc.target}`,
          showUser: true
        });
      } else {
        me.sendErrorResponse(response, {
          id: 1001,
          format: `Unexpected error: ${err.message} in ${opc.target}`,
          showUser: true
        });
      }
    }

    me._messageQueue.end();
    me._messageQueue = null;

    if (me._restart) {
      return me.launchRequest(response, args);
    }

    me.sendEvent(new TerminatedEvent());
  }

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    // runtime supports no threads so just return a default thread.
    response.body = {
      threads: [new Thread(GreybelDebugSession.threadID, 'thread 1')]
    };
    this.sendResponse(response);
  }

  protected scopesRequest(
    response: DebugProtocol.ScopesResponse,
    _args: DebugProtocol.ScopesArguments
  ): void {
    response.body = {
      scopes: [new Scope('Current scope', 1, true)]
    };
    this.sendResponse(response);
  }

  protected async variablesRequest(
    response: DebugProtocol.VariablesResponse,
    _args: DebugProtocol.VariablesArguments,
    _request?: DebugProtocol.Request
  ): Promise<void> {
    const me = this;
    const opc = me._runtime.globalContext.getLastActive();
    const variables: DebugProtocol.Variable[] = [];
    const setVariables = (current: OperationContext, ref: number) => {
      current.scope.value.forEach((item: any, name: string) => {
        const v: DebugProtocol.Variable = {
          name,
          value: item.toString(),
          type: item.getType(),
          variablesReference: ref,
          evaluateName: '$' + name
        };

        variables.push(v);
      });
    };

    if (opc && opc.type !== ContextType.Global) {
      setVariables(opc, 1);
    }

    setVariables(me._runtime.globalContext, 1);

    response.body = {
      variables
    };
    this.sendResponse(response);
  }

  protected continueRequest(
    response: DebugProtocol.ContinueResponse,
    _args: DebugProtocol.ContinueArguments
  ): void {
    this._runtime.debugger.setBreakpoint(false);
    this.sendResponse(response);
  }

  protected nextRequest(
    response: DebugProtocol.NextResponse,
    _args: DebugProtocol.NextArguments
  ): void {
    this._runtime.debugger.next();
    this.sendResponse(response);
  }

  protected async disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    _args: DebugProtocol.DisconnectArguments,
    _request?: DebugProtocol.Request
  ): Promise<void> {
    this._runtime.debugger.setBreakpoint(false);

    try {
      await this._runtime.exit();
    } catch (err: any) {
      console.warn(`WARNING: ${err.message}`);
    }

    this.sendResponse(response);
    this.shutdown();
  }

  protected pauseRequest(
    response: DebugProtocol.PauseResponse,
    _args: DebugProtocol.PauseArguments,
    _request?: DebugProtocol.Request
  ): void {
    this._runtime.debugger.setBreakpoint(true);
    this.sendResponse(response);
  }

  protected async restartRequest(
    response: DebugProtocol.RestartResponse,
    _args: DebugProtocol.RestartArguments,
    _request?: DebugProtocol.Request
  ): Promise<void> {
    this._runtime.debugger.setBreakpoint(false);

    try {
      this._restart = true;
      await this._runtime.exit();
    } catch (err: any) {
      console.warn(`WARNING: ${err.message}`);
    }

    this.sendResponse(response);
  }

  protected async terminateRequest(
    response: DebugProtocol.TerminateResponse,
    _args: DebugProtocol.TerminateArguments,
    _request?: DebugProtocol.Request
  ): Promise<void> {
    this._runtime.debugger.setBreakpoint(false);

    try {
      await this._runtime.exit();
    } catch (err: any) {
      console.warn(`WARNING: ${err.message}`);
    }

    this.sendResponse(response);
  }

  protected async evaluateRequest(
    response: DebugProtocol.EvaluateResponse,
    args: DebugProtocol.EvaluateArguments
  ): Promise<void> {
    try {
      await this._runtime.injectInLastContext(args.expression);

      response.body = {
        result: `Execution of ${args.expression} was successful.`,
        variablesReference: 0
      };
    } catch (err: any) {
      response.body = {
        result: err.toString(),
        variablesReference: 0
      };
    }

    this.sendResponse(response);
  }

  public getStack(): IRuntimeStack {
    const me = this;
    const frames: IRuntimeStackFrame[] = [];
    const last = me._runtime.apiContext.getLastActive();
    let index = 0;
    let current = last;

    while (current) {
      const stackItem = current.stackItem;

      if (stackItem) {
        const stackFrame: IRuntimeStackFrame = {
          index: index++,
          name: stackItem.type, // use a word of the line as the stackframe name
          file: current.target,
          line: stackItem.start.line,
          column: 0
        };

        frames.push(stackFrame);
      }

      current = current.previous;
    }

    return {
      frames,
      count: frames.length
    };
  }

  protected stackTraceRequest(
    response: DebugProtocol.StackTraceResponse,
    _args: DebugProtocol.StackTraceArguments
  ): void {
    const me = this;
    const stk = me.getStack();

    response.body = {
      stackFrames: stk.frames.map((f, _ix) => {
        const sf: DebugProtocol.StackFrame = new StackFrame(
          f.index,
          f.name,
          new Source(PseudoFS.basename(f.file), f.file),
          f.line,
          f.column
        );

        return sf;
      }),
      // 4 options for 'totalFrames':
      // omit totalFrames property: 	// VS Code has to probe/guess. Should result in a max. of two requests
      totalFrames: stk.count // stk.count is the correct size, should result in a max. of two requests
      // totalFrames: 1000000 			// not the correct size, should result in a max. of two requests
      // totalFrames: endFrame + 20 	// dynamically increases the size with every requested chunk, results in paging
    };
    this.sendResponse(response);
  }

  protected async setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): Promise<void> {
    const me = this;
    const path = args.source.path as string;
    const clientLines = args.lines || [];

    const actualBreakpoints0 = clientLines.map((line: number) => {
      const bp = new Breakpoint(
        false,
        line,
        0,
        new Source(path, path)
      ) as DebugProtocol.Breakpoint;
      bp.id = me._breakpointIncrement++;
      return bp;
    });
    const actualBreakpoints = await Promise.all<DebugProtocol.Breakpoint>(
      actualBreakpoints0
    );

    me.breakpoints.set(path, actualBreakpoints);

    response.body = {
      breakpoints: actualBreakpoints
    };

    this.sendResponse(response);
  }

  protected breakpointLocationsRequest(
    response: DebugProtocol.BreakpointLocationsResponse,
    args: DebugProtocol.BreakpointLocationsArguments,
    _request?: DebugProtocol.Request
  ): void {
    if (args.source.path) {
      const breakpoints = this.breakpoints.get(args.source.path) || [];
      const actualBreakpoint = breakpoints.find(
        (bp: DebugProtocol.Breakpoint) => {
          return bp.line === args.line;
        }
      ) as DebugProtocol.Breakpoint;

      if (actualBreakpoint) {
        response.body = {
          breakpoints: [
            {
              line: args.line
            }
          ]
        };

        this.sendResponse(response);
        return;
      }
    }

    response.body = {
      breakpoints: []
    };

    this.sendResponse(response);
  }
}

class GrebyelDebugger extends Debugger {
  session: GreybelDebugSession;

  constructor(session: GreybelDebugSession) {
    super();
    this.session = session;
  }

  getBreakpoint(operationContext: OperationContext): boolean {
    const breakpoints =
      this.session.breakpoints.get(operationContext.target) || [];
    const actualBreakpoint = breakpoints.find(
      (bp: DebugProtocol.Breakpoint) => {
        return bp.line === operationContext.stackItem?.start.line;
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

class GrebyelPseudoDebugger extends Debugger {
  getBreakpoint(_operationContext: OperationContext): boolean {
    return false;
  }

  interact(_operationContext: OperationContext) {}
}
