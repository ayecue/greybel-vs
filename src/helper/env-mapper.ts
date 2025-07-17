import { escapeMSString } from './escape-ms-string.js';
import { Uri, workspace } from 'vscode';
import { GlobalFileSystemManager } from './fs.js';

function readVarLines(
  varLines: string[],
  map: { [key: string]: string }
): { [key: string]: string } {
  if (map == null) map = {};

  let line;

  for (line of varLines) {
    line = line.trim();
    if (line === '' || line[0] === '#') continue;
    const eqIndex = line.indexOf('=');
    if (eqIndex === -1) continue;
    const name = line.substring(0, eqIndex).trim();
    const value = line.substring(eqIndex + 1);

    if (name && value) {
      map[name] = value;
    }
  }

  return map;
}

async function loadConfigFile(
  filepath: Uri,
  map: { [key: string]: string }
): Promise<{ [key: string]: string }> {
  const content = await GlobalFileSystemManager.tryToDecode(filepath);

  if (content == null) {
    return map;
  }

  return readVarLines(content.split('\n'), map);
}

const parseEnvJSONValue = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
};

const parseEnvJSONValueEscaped = (value: any): string => {
  return escapeMSString(parseEnvJSONValue(value));
};

const parseEnvJSON = (
  environmentVariablesObj: object,
  escape: boolean = false
): Record<string, string> => {
  const map: Record<string, string> = {};
  const entries = Object.entries(environmentVariablesObj);
  const parse = escape ? parseEnvJSONValueEscaped : parseEnvJSONValue;

  for (const [key, value] of entries) {
    map[key] = parse(value);
  }

  return map;
};

export class EnvironmentVariablesManager {
  map: { [key: string]: string };

  constructor() {
    this.map = {};
  }

  injectFromJSON(json: object, escape?: boolean): void {
    this.map = { ...parseEnvJSON(json, escape), ...this.map };
  }

  async injectFromWorkspace(targetUri: Uri, relativePathToEnv: string | undefined): Promise<void> {
    if (relativePathToEnv == null) {
      return;
    }

    const workspaceFolder = workspace.getWorkspaceFolder(targetUri);

    if (workspaceFolder) {
      const envFilePath = Uri.joinPath(workspaceFolder.uri, relativePathToEnv);
      await loadConfigFile(envFilePath, this.map);
    }
  }

  async load(envFiles?: Uri[], envVars?: string[]): Promise<{ [key: string]: string }> {
    const me = this;

    if (envFiles) {
      await Promise.all(
        envFiles.map(async (filePath) => loadConfigFile(filePath, me.map))
      );
    }

    if (envVars) me.map = readVarLines(envVars, me.map);

    return me.map;
  }

  get(key: string): string | null {
    const me = this;
    const varExists = key in me.map;
    if (varExists) return me.map[key];
    return null;
  }

  toMap(escape: boolean = false): Map<string, string> {
    const entries = Object.entries(this.map);

    if (escape) {
      return new Map(
        entries.map(([key, value]) => [key, escapeMSString(value)])
      );
    }

    return new Map(entries);
  }

  copy(): Record<string, string> {
    return { ...this.map };
  }
}
