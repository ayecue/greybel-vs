import {
  ASTChunkAdvanced,
} from 'greybel-core';
import { ASTBase, ASTIdentifier, ASTMemberExpression } from 'greyscript-core';
import vscode, {
  CancellationToken,
  DefinitionLink,
  ExtensionContext,
  Position,
  TextDocument,
  Range,
  Uri
} from 'vscode';

import { LookupHelper } from './helper/lookup-type';
import ASTStringify from './helper/ast-stringify';
import documentParseQueue, { ParseResult } from './helper/document-manager';

const findAllDefinitions = (helper: LookupHelper, identifer: string, root: ASTBase): DefinitionLink[] => {
  const assignments = helper.findAllAssignmentsOfIdentifier(identifer, root);
  const definitions: DefinitionLink[] = [];

  for (const assignment of assignments) {
    if (!assignment.start || !assignment.end) {
      continue;
    }

    const start = new Position(assignment.start.line - 1, assignment.start.character - 1);
    const end = new Position(assignment.end.line - 1, assignment.end.character - 1);
    const definitionLink: DefinitionLink = {
      targetUri: helper.document.uri,
      targetRange: new Range(start, end)
    };

    definitions.push(definitionLink);
  }

  return definitions;
}

const findAllImports = async (rootFile: string, chunk: ASTChunkAdvanced): Promise<{
  parseResult: ParseResult,
  doc: TextDocument
}[]> => {
  const textDocumentDefers: Thenable<TextDocument>[] = [
    ...chunk.nativeImports
      .filter((nativeImport) => nativeImport.fileSystemDirectory)
      .map((nativeImport) => {
        const rootDir = Uri.joinPath(Uri.file(rootFile), '..');
        const target = Uri.joinPath(rootDir, nativeImport.fileSystemDirectory);
        return vscode.workspace.openTextDocument(target);
      }),
    ...chunk.imports
      .filter((nonNativeImport) => nonNativeImport.path)
      .map((nonNativeImport) => {
        const rootDir = Uri.joinPath(Uri.file(rootFile), '..');
        const target = Uri.joinPath(rootDir, nonNativeImport.path);
        return vscode.workspace.openTextDocument(target);
      })
  ];

  const allDocuments = await Promise.all(textDocumentDefers);
  const uniqueDocs = Array.from(allDocuments.reduce((result, doc) => {
    if (result.has(doc.uri)) {
      return result;
    }

    result.set(doc.uri, doc);
    return result;
  }, new Map()).values());

  return Promise.all(uniqueDocs.map(async (doc) => {
    const parseResult = await documentParseQueue.get(doc);

    return {
      parseResult,
      doc
    };
  }));
}


export function activate(_context: ExtensionContext) {
  vscode.languages.registerDefinitionProvider('greyscript', {
    async provideDefinition(
      document: TextDocument,
      position: Position,
      _token: CancellationToken
    ): Promise<DefinitionLink[]> {
      const helper = new LookupHelper(document);
      const astResult = helper.lookupAST(position);

      if (!astResult) {
        return [];
      }

      const { outer, closest } = astResult;

      if (!(closest instanceof ASTIdentifier)) {
        return [];
      }

      const previous = outer.length > 0 ? outer[outer.length - 1] : undefined;
      let identifer = closest.name;
      
      if (previous && previous instanceof ASTMemberExpression) {
        identifer = ASTStringify(previous);
      }

      const definitions = findAllDefinitions(helper, identifer, closest.scope!);
      const chunk = helper.lookupScopes(closest).pop() as ASTChunkAdvanced;
      const allImports = await findAllImports(document.fileName, chunk);

      for (const item of allImports) {
        const { parseResult, doc } = item;

        if (!parseResult.document) {
          continue;
        }

        const helper = new LookupHelper(doc);
        const subDefinitions = findAllDefinitions(helper, identifer, parseResult.document);

        definitions.push(...subDefinitions);
      }

      return definitions;
    }
  });
}
