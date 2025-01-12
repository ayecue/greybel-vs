import { escapeMSString } from "./escape-ms-string";

const parseEnvVarsValue = (value: any): string => {
  if (typeof value === 'string') {
    return value;
  }

  return JSON.stringify(value);
}

const parseEnvVarsValueEscaped = (value: any): string => {
  return escapeMSString(parseEnvVarsValue(value));
}

export const parseEnvVars = (
  environmentVariablesObj: object,
  escape: boolean = false
): Map<string, string> => {
  const map = new Map<string, string>();
  const entries = Object.entries(environmentVariablesObj);
  const parse = escape ? parseEnvVarsValueEscaped : parseEnvVarsValue;

  for (const [key, value] of entries) {
    map.set(key, parse(value));
  }

  return map;
};
