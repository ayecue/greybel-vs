import { LoggingDebugSession } from '@vscode/debugadapter';
import vscode, {
  DebugAdapterDescriptorFactory,
  ExtensionContext,
  ProviderResult,
  Uri,
  workspace
} from 'vscode';

import { AgentDebugSession } from './agent/session';
import { GreybelDebugSession } from './local/session';
import { getLaunchResourceUri } from '../helper/launch-uri';

export enum InterpreterEnvironmentType {
  Mock = 'Mock',
  Ingame = 'In-Game'
}

export function getSession(): LoggingDebugSession {
  const config = vscode.workspace.getConfiguration('greybel');
  const environmentType = config.get<InterpreterEnvironmentType>(
    'interpreter.environmentType'
  );

  if (environmentType === InterpreterEnvironmentType.Ingame) {
    return new AgentDebugSession();
  }

  return new GreybelDebugSession();
}

export function activate(
  context: ExtensionContext,
  factory?: DebugAdapterDescriptorFactory
) {
  const runFile = (resource: Uri | undefined, isDebug: boolean): Thenable<boolean> => {
    if (!resource) {
      vscode.window.showErrorMessage('Cannot run file. Resource is undefined.');
      return Promise.resolve(false);
    }

    return vscode.debug.startDebugging(
      workspace.getWorkspaceFolder(resource),
      {
        type: 'greyscript',
        name: 'Run File',
        request: 'launch',
        program: resource.toString()
      },
      { noDebug: true }
    );
  };

  const runFileFromContext = (resource: Uri = vscode.window.activeTextEditor.document.uri): Thenable<boolean> => {
    return runFile(resource, false);
  };

  const runFileFromContextDebug = (resource: Uri = vscode.window.activeTextEditor.document.uri): Thenable<boolean> => {
    return runFile(resource, true);
  };

  const runRootFile = (resource: Uri = vscode.window.activeTextEditor.document.uri): Thenable<boolean> => {
    const config = vscode.workspace.getConfiguration('greybel');
    const targetResource = getLaunchResourceUri(config.get<string>('rootFile'), resource);
    return runFile(targetResource, false);
  };

  const runRootFileDebug = (resource: Uri = vscode.window.activeTextEditor.document.uri): Thenable<boolean> => {
    const config = vscode.workspace.getConfiguration('greybel');
    const targetResource = getLaunchResourceUri(config.get<string>('rootFile'), resource);
    return runFile(targetResource, true);
  };

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'greybel.debug.runFileFromContext', runFileFromContext
    ),
    vscode.commands.registerCommand(
      'greybel.debug.debugFileFromContext', runFileFromContextDebug
    ),
    vscode.commands.registerCommand(
      'greybel.debug.runRootFile', runRootFile
    ),
    vscode.commands.registerCommand(
      'greybel.debug.debugRootFile', runRootFileDebug
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'greybel.debug.getProgramName',
      async (_config) => {
        const target = vscode.window.activeTextEditor?.document.uri.toString();

        if (target) {
          return target;
        }

        const rootPath = vscode.workspace.rootPath;

        if (!rootPath) {
          const value = await vscode.window.showInputBox({
            placeHolder: 'Please enter the full file path',
            value: 'test.src'
          });

          if (!value) {
            return;
          }

          return value;
        }

        const value = await vscode.window.showInputBox({
          placeHolder:
            'Please enter the name of a src file in the workspace folder',
          value: 'test.src'
        });

        if (!value) {
          return;
        }

        return Uri.joinPath(Uri.file(rootPath), value).toString();
      }
    )
  );

  if (!factory) {
    factory = new InlineDebugAdapterFactory();
  }

  context.subscriptions.push(
    vscode.debug.registerDebugAdapterDescriptorFactory('greyscript', factory)
  );
  if ('dispose' in factory) {
    context.subscriptions.push(factory as Record<'dispose', any>);
  }
}

class InlineDebugAdapterFactory
  implements vscode.DebugAdapterDescriptorFactory
{
  createDebugAdapterDescriptor(
    _session: vscode.DebugSession
  ): ProviderResult<vscode.DebugAdapterDescriptor> {
    return new vscode.DebugAdapterInlineImplementation(getSession());
  }
}
