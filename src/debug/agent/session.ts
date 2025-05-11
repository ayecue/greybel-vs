import {
  Breakpoint,
  InitializedEvent,
  LoggingDebugSession,
  Scope,
  Source,
  StackFrame,
  TerminatedEvent,
  Thread
} from '@vscode/debugadapter';
import { DebugProtocol } from '@vscode/debugprotocol';
import { ModifierType } from 'another-ansi';
import vscode, { Uri } from 'vscode';

import { PseudoFS } from '../../helper/fs';
import { showCustomErrorMessage } from '../../helper/show-custom-error';
import { ansiProvider, useColor } from '../../helper/text-mesh-transform';
import { getPreviewInstance } from '../../preview';
import { DebugSessionLike } from '../types';
import { SessionHandler } from './handler';
import { VersionManager } from '../../helper/version-manager';

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

export class AgentDebugSession
  extends LoggingDebugSession
  implements DebugSessionLike {
  public threadID: number;
  public breakpoints: Map<string, DebugProtocol.Breakpoint[]> = new Map();

  private _runtime: SessionHandler;
  private _breakpointIncrement: number = 0;
  private _restart: boolean = false;
  private _environmentVariables: Record<string, string>;

  private _useDefaultArgs: boolean = false;
  private _defaultArgs: string = '';
  private _silenceErrorPopups: boolean = false;
  private 

  public constructor() {
    super('agent-debug.txt');

    // this debugger uses zero-based lines and columns
    const me = this;
    const config = vscode.workspace.getConfiguration('greybel');
    const hideUnsupportedTextMeshProRichTextTags =
      config.get<boolean>(
        'interpreter.hideUnsupportedTextMeshProRichTextTags'
      ) ?? false;
    const port =
      config.get<number>(
        'interpreter.port'
      );

    me.setDebuggerLinesStartAt1(false);
    me.setDebuggerColumnsStartAt1(false);

    this.threadID = Math.random() * 0x7fffffff;
    this._useDefaultArgs = config.get<boolean>('interpreter.useDefaultArgs');
    this._defaultArgs = config.get<string>('interpreter.defaultArgs');
    this._silenceErrorPopups = config.get<boolean>(
      'interpreter.silenceErrorPopups'
    );
    this._runtime = new SessionHandler(this, port, hideUnsupportedTextMeshProRichTextTags);
    this._environmentVariables = config.get<Record<string, string>>('interpreter.environmentVariables') || {};

    VersionManager.triggerContextAgentHealthcheck(port);
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
    const uri = Uri.parse(args.program);

    getPreviewInstance().clear();
    me._restart = false;

    // start the program in the runtime
    try {
      const params = this._useDefaultArgs
        ? this._defaultArgs
        : await vscode.window.showInputBox({
          title: 'Enter execution parameters',
          ignoreFocusOut: true
        });
      const paramSegments =
        params && params.length > 0 ? params.split(' ') : [];

      await me._runtime.start(uri, paramSegments, !args.noDebug, this._environmentVariables);
      await me._runtime.waitForFinished();

      me.sendResponse(response);
    } catch (err: any) {
      this._runtime.outputHandler.terminal.print(
        useColor(
          'red',
          `${ansiProvider.modify(ModifierType.Bold, 'Unexpected error')}: ${err.message
          }\n${err.stack}`
        )
      );

      if (!this._silenceErrorPopups) {
        showCustomErrorMessage(err);
      }
    }

    if (me._restart) {
      return me.launchRequest(response, args);
    }

    me.sendEvent(new TerminatedEvent());
  }

  protected threadsRequest(response: DebugProtocol.ThreadsResponse): void {
    // runtime supports no threads so just return a default thread.
    response.body = {
      threads: [new Thread(this.threadID, 'thread 1')]
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
    const breakpoint = me._runtime.getLastBreakpoint();
    const variables: DebugProtocol.Variable[] = [];
    const setVariables = (current: Record<string, string>, ref: number) => {
      Object.entries(current).forEach(([key, value]) => {
        const v: DebugProtocol.Variable = {
          name: key,
          value: value.toString(),
          type: typeof value,
          variablesReference: ref,
          evaluateName: '$' + key
        };

        variables.push(v);
      });
    };

    setVariables(breakpoint.variables, 0);

    response.body = {
      variables
    };
    this.sendResponse(response);
  }

  protected async continueRequest(
    response: DebugProtocol.ContinueResponse,
    _args: DebugProtocol.ContinueArguments
  ): Promise<void> {
    await this._runtime.setDebugMode(false);
    this.sendResponse(response);
  }

  protected async nextRequest(
    response: DebugProtocol.NextResponse,
    _args: DebugProtocol.NextArguments
  ): Promise<void> {
    await this._runtime.goToNextLine();
    this.sendResponse(response);
  }

  protected async disconnectRequest(
    response: DebugProtocol.DisconnectResponse,
    _args: DebugProtocol.DisconnectArguments,
    _request?: DebugProtocol.Request
  ): Promise<void> {
    await this._runtime.setDebugMode(false);

    try {
      await this._runtime.stop();
    } catch (err: any) {
      console.warn(`WARNING: ${err.message}`);
    }

    this.sendResponse(response);
    this.shutdown();
  }

  protected async pauseRequest(
    response: DebugProtocol.PauseResponse,
    _args: DebugProtocol.PauseArguments,
    _request?: DebugProtocol.Request
  ): Promise<void> {
    await this._runtime.setDebugMode(true);
    this.sendResponse(response);
  }

  protected async restartRequest(
    response: DebugProtocol.RestartResponse,
    _args: DebugProtocol.RestartArguments,
    _request?: DebugProtocol.Request
  ): Promise<void> {
    await this._runtime.setDebugMode(false);

    try {
      this._restart = true;
      await this._runtime.stop();
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
    await this._runtime.setDebugMode(false);

    try {
      await this._runtime.stop();
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
      await this._runtime.injectCode(args.expression);

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
    const breakpoint = me._runtime.getLastBreakpoint();

    for (let index = breakpoint.stacktrace.length - 1; index >= 0; index--) {
      const current = breakpoint.stacktrace[index];

      const stackFrame: IRuntimeStackFrame = {
        index,
        name: current.name, // use a word of the line as the stackframe name
        file: current.filepath, // source.path is fileUrl
        line: current.lineNum,
        column: 0
      };

      frames.unshift(stackFrame);
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
      totalFrames: stk.count
    };

    this.sendResponse(response);
  }

  protected async setBreakPointsRequest(
    response: DebugProtocol.SetBreakpointsResponse,
    args: DebugProtocol.SetBreakpointsArguments
  ): Promise<void> {
    const me = this;
    const uri = Uri.file(args.source.path);
    const clientLines = args.lines || [];

    const actualBreakpoints0 = clientLines.map((line: number) => {
      const bp = new Breakpoint(
        false,
        line,
        0,
        new Source(uri.toString(), uri.toString())
      ) as DebugProtocol.Breakpoint;
      bp.id = me._breakpointIncrement++;
      return bp;
    });
    const actualBreakpoints = await Promise.all<DebugProtocol.Breakpoint>(
      actualBreakpoints0
    );

    me.breakpoints.set(uri.toString(), actualBreakpoints);

    response.body = {
      breakpoints: actualBreakpoints
    };

    this.sendResponse(response);
  }

  protected
  LocationsRequest(
    response: DebugProtocol.BreakpointLocationsResponse,
    args: DebugProtocol.BreakpointLocationsArguments,
    _request?: DebugProtocol.Request
  ): void {
    if (args.source.path) {
      const uri = Uri.file(args.source.path);
      const breakpoints = this.breakpoints.get(uri.toString()) || [];
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

  protected stepInRequest(
    _response: DebugProtocol.StepInResponse,
    _args: DebugProtocol.StepInArguments,
    _request?: DebugProtocol.Request | undefined
  ): void {
    vscode.window.showErrorMessage('Step in is not supported.');
  }

  protected stepOutRequest(
    _response: DebugProtocol.StepOutResponse,
    _args: DebugProtocol.StepOutArguments,
    _request?: DebugProtocol.Request | undefined
  ): void {
    vscode.window.showErrorMessage('Step out is not supported.');
  }

  protected stepBackRequest(
    _response: DebugProtocol.StepBackResponse,
    _args: DebugProtocol.StepBackArguments,
    _request?: DebugProtocol.Request | undefined
  ): void {
    vscode.window.showErrorMessage('Step back is not supported.');
  }
}
