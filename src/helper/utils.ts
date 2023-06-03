export const CONTEXT_PREFIX_PATTERN = /^(globals|locals|outer)\./;
export const removeContextPrefixInNamespace = (namespace: string): string =>
  namespace.replace(CONTEXT_PREFIX_PATTERN, '');

export const GLOBALS_CONTEXT_PREFIX_PATTERN = /^globals\./;
export const isGlobalsContextNamespace = (namespace: string): boolean =>
  GLOBALS_CONTEXT_PREFIX_PATTERN.test(namespace);
export const removeGlobalsContextPrefixInNamespace = (
  namespace: string
): string => namespace.replace(GLOBALS_CONTEXT_PREFIX_PATTERN, '');

export const LOCALS_CONTEXT_PREFIX_PATTERN = /^locals\./;
export const isLocalsContextNamespace = (namespace: string): boolean =>
  LOCALS_CONTEXT_PREFIX_PATTERN.test(namespace);
export const removeLocalsContextPrefixInNamespace = (
  namespace: string
): string => namespace.replace(LOCALS_CONTEXT_PREFIX_PATTERN, '');

export const OUTER_CONTEXT_PREFIX_PATTERN = /^outer\./;
export const isOuterContextNamespace = (namespace: string): boolean =>
  OUTER_CONTEXT_PREFIX_PATTERN.test(namespace);
export const removeOuterContextPrefixInNamespace = (
  namespace: string
): string => namespace.replace(OUTER_CONTEXT_PREFIX_PATTERN, '');
