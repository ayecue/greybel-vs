import {
  ASTAssignmentStatement,
  ASTBase,
  ASTBaseBlockWithScope,
  ASTChunk,
  ASTIndexExpression,
  ASTMemberExpression,
  ASTType
} from 'miniscript-core';
import {
  CompletionItem,
  Document as TypeDocument,
  IEntity
} from 'miniscript-type-analyzer';
import { Position, TextDocument } from 'vscode';

import * as ASTScraper from './ast-scraper';
import documentParseQueue from './document-manager';
import typeManager, { lookupBase } from './type-manager';

export async function buildTypeDocument(
  document: TextDocument,
  refs: Map<string, TypeDocument | null> = new Map()
): Promise<TypeDocument> {
  if (refs.has(document.fileName)) {
    return refs.get(document.fileName);
  }

  const typeDoc = typeManager.get(document);

  refs.set(document.fileName, null);

  if (!typeDoc) {
    return null;
  }

  const externalTypeDocs = [];
  const allImports = await documentParseQueue.get(document).getImports();

  await Promise.all(
    allImports.map(async (item) => {
      const { document, textDocument } = item;

      if (!document) {
        return;
      }

      const itemTypeDoc = await buildTypeDocument(textDocument, refs);

      if (itemTypeDoc === null) return;
      externalTypeDocs.push(itemTypeDoc);
    })
  );

  const mergedTypeDoc = typeDoc.merge(...externalTypeDocs);
  refs.set(document.fileName, mergedTypeDoc);
  return mergedTypeDoc;
}

export type LookupOuter = ASTBase[];

export interface LookupASTResult {
  closest: ASTBase;
  outer: LookupOuter;
}

export class LookupHelper {
  readonly document: TextDocument;

  constructor(document: TextDocument) {
    this.document = document;
  }

  findAllAssignmentsOfIdentifier(
    identifier: string,
    root: ASTBaseBlockWithScope
  ): ASTAssignmentStatement[] {
    return typeManager
      .get(this.document)
      .getScopeContext(root)
      .aggregator.resolveAvailableAssignmentsWithQuery(identifier);
  }

  findAllAssignmentsOfItem(
    item: ASTBase,
    root: ASTBaseBlockWithScope
  ): ASTAssignmentStatement[] {
    return typeManager
      .get(this.document)
      .getScopeContext(root)
      .aggregator.resolveAvailableAssignments(item);
  }

  findAllAvailableIdentifierInRoot(): Map<string, CompletionItem> {
    return typeManager
      .get(this.document)
      .getRootScopeContext()
      .scope.getAllIdentifier();
  }

  findAllAvailableIdentifier(
    root: ASTBaseBlockWithScope
  ): Map<string, CompletionItem> {
    return typeManager
      .get(this.document)
      .getScopeContext(root)
      .scope.getAllIdentifier();
  }

  findAllAvailableIdentifierRelatedToPosition(
    item: ASTBase
  ): Map<string, CompletionItem> {
    const typeDoc = typeManager.get(this.document);
    const result: Map<string, CompletionItem> = new Map();
    const assignments = Array.from(
      typeDoc
        .getScopeContext(item.scope)
        .scope.locals.getAllIdentifier()
        .entries()
    )
      .map(([key, item]) => {
        return {
          identifier: key,
          ...item
        };
      })
      .sort((a, b) => a.line - b.line);

    for (let index = 0; index < assignments.length; index++) {
      const assignment = assignments[index];

      if (assignment.line >= item.end!.line) break;
      result.set(assignment.identifier, {
        kind: assignment.kind,
        line: assignment.line
      });
    }

    if (item.scope.scope) {
      const outerAssignments = typeDoc
        .getScopeContext(item.scope.scope)
        .scope.getAllIdentifier();

      for (const assignment of outerAssignments) {
        result.set(...assignment);
      }
    }

    return result;
  }

  lookupAST(position: Position): LookupASTResult | null {
    const me = this;
    const chunk = documentParseQueue.get(me.document).document as ASTChunk;
    const lineItems = chunk.lines.get(position.line + 1);

    if (!lineItems) {
      return null;
    }

    for (let index = 0; index < lineItems.length; index++) {
      const lineItem = lineItems[index];
      const outer = ASTScraper.findEx((item: ASTBase, _level: number) => {
        const startLine = item.start!.line - 1;
        const startCharacter = item.start!.character - 1;
        const endLine = item.end!.line - 1;
        const endCharacter = item.end!.character - 1;

        if (startLine > position.line) {
          return {
            exit: true
          };
        }

        if (startLine < endLine) {
          return {
            valid:
              (position.line > startLine && position.line < endLine) ||
              (position.line === startLine &&
                startCharacter <= position.character) ||
              (position.line === endLine && endCharacter >= position.character)
          };
        }

        return {
          valid:
            startLine <= position.line &&
            startCharacter <= position.character &&
            endLine >= position.line &&
            endCharacter >= position.character
        };
      }, lineItem) as LookupOuter;
      // get closest AST
      const closest = outer.pop();

      // nothing to get info for
      if (!closest) {
        continue;
      }

      return {
        closest,
        outer
      };
    }

    return null;
  }

  async lookupBasePath(item: ASTBase): Promise<IEntity | null> {
    const typeDoc = await this.buildTypeMap();

    if (typeDoc === null) {
      return null;
    }

    const base = lookupBase(item);

    if (base) {
      return typeDoc.resolveNamespace(base);
    }

    return null;
  }

  async buildTypeMap(): Promise<TypeDocument> {
    return await buildTypeDocument(this.document);
  }

  async lookupTypeInfo({
    closest,
    outer
  }: LookupASTResult): Promise<IEntity | null> {
    const typeDoc = await this.buildTypeMap();

    if (typeDoc === null) {
      return null;
    }

    const previous = outer.length > 0 ? outer[outer.length - 1] : undefined;

    if (
      previous?.type === ASTType.MemberExpression &&
      closest === (previous as ASTMemberExpression).identifier
    ) {
      return typeDoc.resolveType(previous, true);
    } else if (
      previous?.type === ASTType.IndexExpression &&
      closest === (previous as ASTIndexExpression).index &&
      closest.type === ASTType.StringLiteral
    ) {
      return typeDoc.resolveType(previous, true);
    }

    return typeDoc.resolveType(closest, true);
  }

  lookupType(position: Position): Promise<IEntity | null> {
    const me = this;
    const astResult = me.lookupAST(position);

    // nothing to get info for
    if (!astResult) {
      return null;
    }

    return me.lookupTypeInfo(astResult);
  }
}
