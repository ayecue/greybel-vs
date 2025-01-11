export const parseEnvVars = (
  environmentVariablesObj: object
): Map<string, string> => {
  const map = new Map<string, string>();
  const entries = Object.entries(environmentVariablesObj);

  for (const [key, value] of entries) {
    if (typeof value === 'object') {
      map.set(key, JSON.stringify(value));
      continue;
    }

    map.set(key, value);
  }

  return map;
};
