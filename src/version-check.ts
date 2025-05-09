import vscode from 'vscode';
import { ContextAgent, GameAgent } from "greyhack-message-hook-client";

const LATEST_MESSAGE_HOOK_VERSION = '1.1.4';

export function isNotOutdated(myVersion: string, minimumVersion: string = LATEST_MESSAGE_HOOK_VERSION): boolean {
  const v1 = myVersion.split(".");
  const v2 = minimumVersion.split(".");
  const minLength = Math.min(v1.length, v2.length);

  for (let i = 0; i < minLength; i++) {
    const a = +v1[i];
    const b = +v2[i];
      if(a > b) {
          return true;
      }
      if(a < b) {
          return false;
      }           
  }

  return v1.length >= v2.length;
}

interface HealthCheckResult {
  active: boolean;
  isSessionActive: boolean;
  isSingleplayer: boolean;
  pluginVersion: string;
  gameVersion: string;
  error?: string;
}

async function performHealthCheck(agentCls: any, port: number): Promise<HealthCheckResult> {
  try {
    const agent = new agentCls({
      warn: () => { },
      error: () => { },
      info: () => { },
      debug: () => { }
    }, port);
    const response = await agent.healthcheck();

    await agent.dispose();

    return response;
  } catch (err) {
    return {
      active: false,
      isSessionActive: false,
      isSingleplayer: false,
      pluginVersion: "0.0.0",
      gameVersion: "0.0.0",
      error: err.message
    };
  }
}
  

async function checkContextAgentHealth(): Promise<HealthCheckResult> {
  const config = vscode.workspace.getConfiguration('greybel');
  const port = config.get<number>('interpreter.port');

  return await performHealthCheck(ContextAgent, port);
}

async function checkGameAgentHealth(): Promise<HealthCheckResult> {
  const config = vscode.workspace.getConfiguration('greybel');
  const port = config.get<number>('createIngame.port');

  return await performHealthCheck(GameAgent, port);
}

function analyzeHealth(/*gameClient: HealthCheckResult,*/ contextClient: HealthCheckResult) {
  if (!isNotOutdated(contextClient.pluginVersion) && contextClient.error == null) {
    vscode.window.showWarningMessage(`Context Agent is outdated! Version: ${contextClient.pluginVersion}, Minimum Version: ${LATEST_MESSAGE_HOOK_VERSION}`);
  }

  /*if (!isNotOutdated(gameClient.pluginVersion) && gameClient.error == null) {
    vscode.window.showWarningMessage(`Game Agent is outdated! Version: ${gameClient.pluginVersion}, Minimum Version: ${LATEST_MESSAGE_HOOK_VERSION}`);
  }*/
}

export function activate() {
  const job = async () => {
    const [contextAgentVersion /*, gameAgentVersion*/] = await Promise.all([
      checkContextAgentHealth(),
      //checkGameAgentHealth()
    ]);

    analyzeHealth(/*gameAgentVersion,*/ contextAgentVersion);
  }

  setTimeout(job, 5000);
}