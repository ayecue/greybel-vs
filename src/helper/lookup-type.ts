import { ASTChunkAdvanced } from 'greybel-core';
import {
  ASTAssignmentStatement,
  ASTBase,
  ASTBaseBlockWithScope,
  ASTChunk,
  ASTFunctionStatement,
  ASTIdentifier,
  ASTType
} from 'greyscript-core';
import { Position, TextDocument } from 'vscode';

import transformASTToNamespace from './ast-namespace';
import * as ASTScraper from './ast-scraper';
import transformASTToString from './ast-stringify';
import documentParseQueue from './document-manager';
import typeManager, { lookupBase, TypeInfo, TypeMap } from './type-manager';
import {
  isGlobalsContextNamespace,
  removeContextPrefixInNamespace,
  removeGlobalsContextPrefixInNamespace
} from './utils';

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
    root: ASTBase
  ): ASTAssignmentStatement[] {
    const identiferWithoutPrefix = removeContextPrefixInNamespace(identifier);
    const assignments = this.lookupAssignments(root);
    const result: ASTAssignmentStatement[] = [];

    for (const item of assignments) {
      const current = removeContextPrefixInNamespace(
        transformASTToNamespace(item.variable)
      );

      if (current === identiferWithoutPrefix) {
        result.push(item);
      }
    }

    if (root instanceof ASTChunk) {
      const scopes: ASTBaseBlockWithScope[] = [root, ...root.scopes];

      for (const item of scopes) {
        for (const assignmentItem of item.assignments) {
          const assignment = assignmentItem as ASTAssignmentStatement;
          const current = transformASTToNamespace(assignment.variable);

          if (!isGlobalsContextNamespace(current)) {
            continue;
          }

          if (
            removeGlobalsContextPrefixInNamespace(current) ===
            identiferWithoutPrefix
          ) {
            result.push(assignment);
          }
        }
      }
    }

    return result;
  }

  lookupAssignments(item: ASTBase): ASTAssignmentStatement[] {
    // lookup closest wrapping assignment
    const scopes = this.lookupScopes(item);
    const result: ASTAssignmentStatement[] = [];

    for (const scope of scopes) {
      result.push(...(scope.assignments as ASTAssignmentStatement[]));
    }

    return result;
  }

  findAllAvailableIdentifier(item: ASTBase): string[] {
    const scopes = this.lookupScopes(item);
    const result: string[] = [];
    const outerScope = scopes.length > 1 ? scopes[1] : null;
    const globalScope = scopes[scopes.length - 1];

    for (const scope of scopes) {
      for (const namespace of scope.namespaces) {
        const current = removeContextPrefixInNamespace(namespace);
        result.push(current);

        if (scope === globalScope || isGlobalsContextNamespace(namespace)) {
          result.push(`globals.${current}`);
        }

        if (scope === outerScope) {
          result.push(`outer.${current}`);
        }
      }
    }

    return Array.from(new Set(result));
  }

  findAllAvailableIdentifierRelatedToPosition(item: ASTBase): string[] {
    const scopes = this.lookupScopes(item);
    const result: string[] = [];
    const rootScope = scopes.shift();
    const outerScope = scopes.length > 0 ? scopes[0] : null;
    const globalScope =
      scopes.length > 0 ? scopes[scopes.length - 1] : rootScope;

    if (rootScope) {
      if (rootScope instanceof ASTFunctionStatement) {
        for (const parameter of rootScope.parameters) {
          if (parameter instanceof ASTAssignmentStatement) {
            result.push((parameter.variable as ASTIdentifier).name);
          } else if (parameter instanceof ASTIdentifier) {
            result.push(parameter.name);
          }
        }
      }

      for (const assignmentItem of rootScope.assignments) {
        const assignment = assignmentItem as ASTAssignmentStatement;

        if (assignment.end!.line >= item.end!.line) break;

        const current = removeContextPrefixInNamespace(
          transformASTToString(assignment.variable)
        );
        result.push(current, `locals.${current}`);

        if (rootScope === globalScope) {
          result.push(`globals.${current}`);
        }
      }
    }

    for (const scope of scopes) {
      for (const namespace of scope.namespaces) {
        const current = removeContextPrefixInNamespace(namespace);
        result.push(current);

        if (scope === globalScope || isGlobalsContextNamespace(namespace)) {
          result.push(`globals.${current}`);
        }

        if (scope === outerScope) {
          result.push(`outer.${current}`);
        }
      }
    }

    return Array.from(new Set(result));
  }

  lookupScope(item: ASTBase): ASTBaseBlockWithScope | null {
    return item.scope || null;
  }

  lookupScopes(item: ASTBase): ASTBaseBlockWithScope[] {
    const result: ASTBaseBlockWithScope[] = [];
    let current = item.scope;

    if (item instanceof ASTBaseBlockWithScope) {
      result.push(item);
    }

    while (current) {
      result.push(current);
      current = current.scope;
    }

    return result;
  }

  lookupGlobalScope(item: ASTBase): ASTChunkAdvanced {
    let result: ASTBaseBlockWithScope = null;
    let current = item.scope;

    if (item instanceof ASTBaseBlockWithScope) {
      result = item;
    }

    while (current) {
      result = current;
      current = current.scope;
    }

    return result as ASTChunkAdvanced;
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

  lookupBasePath(item: ASTBase): TypeInfo | null {
    const base = lookupBase(item);
    const typeMap = typeManager.get(this.document);

    if (typeMap && base) {
      return typeMap.resolvePath(base);
    }

    return null;
  }

  async buildTypeMap(): Promise<TypeMap> {
    const typeMap = typeManager.get(this.document);

    if (!typeMap) {
      return null;
    }

    const externalTypeMaps = [];
    const allImports = await documentParseQueue.get(this.document).getImports();

    for (const item of allImports) {
      const { document, textDocument } = item;

      if (!document) {
        continue;
      }

      const typeMap = typeManager.get(textDocument);

      if (typeMap) {
        externalTypeMaps.push(typeMap);
      }
    }

    return typeMap.fork(...externalTypeMaps);
  }

  async lookupTypeInfo({
    closest,
    outer
  }: LookupASTResult): Promise<TypeInfo | null> {
    const typeMap = await this.buildTypeMap();

    if (typeMap === null) {
      return null;
    }

    const previous = outer.length > 0 ? outer[outer.length - 1] : undefined;

    if (
      previous?.type === ASTType.MemberExpression ||
      (previous?.type === ASTType.IndexExpression &&
        closest.type === ASTType.StringLiteral)
    ) {
      return typeMap.resolvePath(previous);
    }

    return typeMap.resolve(closest);
  }

  lookupType(position: Position): Promise<TypeInfo | null> {
    const me = this;
    const astResult = me.lookupAST(position);

    // nothing to get info for
    if (!astResult) {
      return null;
    }

    return me.lookupTypeInfo(astResult);
  }
}
