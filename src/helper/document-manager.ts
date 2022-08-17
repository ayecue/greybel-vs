import { ASTBase, ASTChunkAdvanced, Parser } from 'greybel-core';
import { TextDocument } from 'vscode';

const activeDocumentASTMap: Map<string, ASTBase> = new Map();
const lastErrorsMap: Map<string, Error[]> = new Map();

export function createDocumentAST(document: TextDocument): {
  chunk: ASTBase;
  errors: Error[];
} {
  const content = document.getText();
  const parser = new Parser(content, {
    unsafe: true
  });
  const chunk = parser.parseChunk();

  if ((chunk as ASTChunkAdvanced).body?.length > 0) {
    activeDocumentASTMap.set(document.fileName, chunk);
    lastErrorsMap.set(document.fileName, parser.errors);
  } else {
    try {
      const strictParser = new Parser(document.getText());
      const strictChunk = strictParser.parseChunk();

      activeDocumentASTMap.set(document.fileName, strictChunk);
      lastErrorsMap.set(document.fileName, []);
    } catch (err: any) {
      lastErrorsMap.set(document.fileName, [err]);
    }
  }

  return {
    chunk,
    errors: parser.errors
  };
}

export function clearDocumentAST(document: TextDocument): void {
  activeDocumentASTMap.delete(document.fileName);
  lastErrorsMap.delete(document.fileName);
}

export function getLastDocumentASTErrors(document: TextDocument): Error[] {
  return (
    lastErrorsMap.get(document.fileName) || createDocumentAST(document).errors
  );
}

export function getDocumentAST(document: TextDocument): ASTBase {
  return (
    activeDocumentASTMap.get(document.fileName) ||
    createDocumentAST(document).chunk
  );
}
