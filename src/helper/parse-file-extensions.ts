export function parseFileExtensions(extensions: string): string[] | null {
  if (typeof extensions === 'string') {
    return extensions.split(',').map((ext) => ext.trim()).filter((ext) => ext !== '');  
  }

  return null;
}