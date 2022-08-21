import {
  ASTAssignmentStatement,
  ASTBase,
  ASTCallExpression,
  ASTCallStatement,
  ASTChunk,
  ASTFunctionStatement,
  ASTIdentifier,
  ASTIndexExpression,
  ASTLiteral,
  ASTMemberExpression
} from 'greybel-core';
import { ASTType } from 'greyscript-core';
import {
  getDefinition,
  getDefinitions,
  SignatureDefinition,
  SignatureDefinitionArg
} from 'greyscript-meta';
import { Position, TextDocument } from 'vscode';

import * as ASTScraper from './ast-scraper';
import ASTStringify from './ast-stringify';
import { getDocumentAST } from './document-manager';

export class TypeInfo {
  label: string;
  type: string[];

  constructor(label: string, type: string[]) {
    this.label = label;
    this.type = type;
  }
}

export class TypeInfoWithDefinition extends TypeInfo {
  definition: SignatureDefinition;

  constructor(label: string, type: string[], definition: SignatureDefinition) {
    super(label, type);
    this.definition = definition;
  }
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

  findAllAvailableIdentifier(outer: LookupOuter): string[] {
    const me = this;
    const root = me.lookupScope(outer);

    if (!root) {
      return [];
    }

    const identifier = [];

    identifier.push(
      ...ASTScraper.findEx((item: ASTBase, level: number) => {
        if (item.type === ASTType.FunctionDeclaration && level > 0) {
          return {
            skip: true
          };
        } else if (item.type === ASTType.AssignmentStatement) {
          return {
            valid: true
          };
        }
      }, root)
    );

    me.lookupScopes(outer).forEach((scope) => {
      identifier.push(
        ...ASTScraper.findEx((item: ASTBase, level: number) => {
          if (item.type === ASTType.FunctionDeclaration && level > 0) {
            return {
              skip: true
            };
          } else if (item.type === ASTType.AssignmentStatement) {
            return {
              valid: true
            };
          }
        }, scope)
      );
    });

    return identifier.map((item: ASTBase) => {
      return ASTStringify((item as ASTAssignmentStatement).variable);
    });
  }

  findAllAssignmentsOfIdentifier(
    identifier: string,
    root: ASTBase,
    end?: Position
  ): ASTBase[] {
    return ASTScraper.findEx((item: ASTBase, level: number) => {
      if (end && item.start.line - 1 >= end.line) {
        return {
          exit: true
        };
      }

      if (item.type === ASTType.FunctionDeclaration && level > 0) {
        return {
          skip: true
        };
      } else if (item.type === ASTType.AssignmentStatement) {
        const { variable, init } = item as ASTAssignmentStatement;
        const identifierName = ASTStringify(variable);
        const initName = ASTStringify(init);

        if (identifierName === identifier && initName !== identifier) {
          return {
            valid: true
          };
        }
      }
    }, root);
  }

  lookupAssignment(outer: LookupOuter): ASTAssignmentStatement | null {
    // lookup closest wrapping assignment
    for (let index = outer.length - 1; index >= 0; index--) {
      const type = outer[index]?.type;

      if (type === ASTType.AssignmentStatement) {
        return outer[index] as ASTAssignmentStatement;
      }
    }

    return null;
  }

  lookupScope(outer: LookupOuter): ASTBase | null {
    // lookup closest wrapping scope
    for (let index = outer.length - 1; index >= 0; index--) {
      const type = outer[index]?.type;

      if (type === ASTType.FunctionDeclaration || type === ASTType.Chunk) {
        return outer[index];
      }
    }

    return null;
  }

  lookupScopes(outer: LookupOuter): ASTBase[] {
    const result: ASTBase[] = [];

    // lookup closest wrapping scope
    for (let index = outer.length - 1; index >= 0; index--) {
      const type = outer[index]?.type;

      if (type === ASTType.FunctionDeclaration || type === ASTType.Chunk) {
        result.push(outer[index]);
      }
    }

    return result;
  }

  lookupAST(position: Position): LookupASTResult | null {
    const me = this;
    const chunk = getDocumentAST(me.document) as ASTChunk;

    // gather all wrapping ASTs
    const outer = ASTScraper.findEx((item: ASTBase, _level: number) => {
      const startLine = item.start.line - 1;
      const startCharacter = item.start.character - 1;
      const endLine = item.end.line - 1;
      const endCharacter = item.end.character - 1;

      if (startLine > position.line) {
        return {
          exit: true
        };
      }

      if (startLine === position.line && endLine === position.line) {
        return {
          valid:
            startLine <= position.line &&
            startCharacter <= position.character &&
            endLine >= position.line &&
            endCharacter >= position.character
        };
      } else if (startLine === position.line) {
        return {
          valid:
            startLine <= position.line &&
            startCharacter <= position.character &&
            endLine >= position.line
        };
      } else if (endLine === position.line) {
        return {
          valid:
            startLine <= position.line &&
            endLine >= position.line &&
            endCharacter >= position.character
        };
      }

      return {
        valid: startLine <= position.line && endLine >= position.line
      };
    }, chunk) as LookupOuter;
    // get closest AST
    const closest = outer.pop();

    // nothing to get info for
    if (!closest) {
      return null;
    }

    return {
      closest,
      outer
    };
  }

  lookupIdentifier(root: ASTBase): ASTBase | null {
    // non greey identifier to string method; can be used instead of ASTStringify
    const me = this;

    switch (root.type) {
      case ASTType.CallStatement:
        return me.lookupIdentifier((root as ASTCallStatement).expression);
      case ASTType.CallExpression:
        return me.lookupIdentifier((root as ASTCallExpression).base);
      case ASTType.Identifier:
        return root;
      case ASTType.MemberExpression:
        return me.lookupIdentifier((root as ASTMemberExpression).identifier);
      case ASTType.IndexExpression:
        return me.lookupIdentifier((root as ASTIndexExpression).index);
      default:
        return null;
    }
  }

  lookupBase(node: ASTBase | null = null): ASTBase | null {
    switch (node?.type) {
      case ASTType.MemberExpression:
        return (node as ASTMemberExpression).base;
      case ASTType.IndexExpression:
        return (node as ASTIndexExpression).base;
      case ASTType.CallExpression:
        return (node as ASTCallExpression).base;
      default:
        return null;
    }
  }

  resolvePath(item: ASTBase, _outer: LookupOuter): TypeInfo | null {
    const me = this;
    let base: ASTBase | null = item;
    const traversalPath = [];

    // prepare traversal path
    while (base) {
      if (base.type === ASTType.CallExpression) {
        base = me.lookupBase(base);
        continue;
      }

      const identifer = me.lookupIdentifier(base);
      traversalPath.unshift(identifer || base);

      base = me.lookupBase(base);
    }

    // retreive type
    let origin;
    let currentMetaInfo = null;

    while ((origin = traversalPath.shift())) {
      switch (origin.type) {
        case ASTType.Identifier: {
          const identifer = origin as ASTIdentifier;
          const name = identifer.name;

          // resolve first identifier
          if (!currentMetaInfo) {
            currentMetaInfo = me.resolveIdentifier(identifer);
            break;
          }

          // get signature
          let definitions = null;

          if (currentMetaInfo instanceof TypeInfoWithDefinition) {
            const definition = currentMetaInfo.definition;

            definitions = getDefinitions(definition.returns);
          } else {
            definitions = getDefinitions(currentMetaInfo.type);
          }

          if (name in definitions) {
            const defintion = definitions[name];
            currentMetaInfo = new TypeInfoWithDefinition(
              name,
              ['function'],
              defintion
            );
            break;
          }

          // todo add retrieval for object/lists
          return null;
        }
        case ASTType.IndexExpression: {
          // add index
          console.log('not yet supported');
          return null;
        }
        default: {
          if (!currentMetaInfo) {
            currentMetaInfo = me.resolveDefault(origin);
            break;
          }
          return null;
        }
      }
    }

    return currentMetaInfo;
  }

  resolveIdentifier(
    item: ASTIdentifier,
    outer: LookupOuter = []
  ): TypeInfo | null {
    const me = this;
    const previous = outer.length > 0 ? outer[outer.length - 1] : undefined;
    const name = item.name;
    const root = me.lookupScope(outer);

    // resolve path
    if (
      previous?.type === ASTType.MemberExpression ||
      previous?.type === ASTType.IndexExpression
    ) {
      return me.resolvePath(previous, outer.slice(0, -1));
      // special behavior for params
    } else if (name === 'params') {
      return new TypeInfo(name, ['list']);
    }

    // check for default namespace
    const defaultDef = getDefinition(['general'], name);

    if (defaultDef) {
      return new TypeInfoWithDefinition(name, ['function'], defaultDef);
    }

    if (!root) {
      return new TypeInfo(name, ['any']);
    }

    // get arguments if inside function
    if (root.type === ASTType.FunctionDeclaration) {
      const fnBlockMeta = me.resolveFunctionDeclaration(
        root as ASTFunctionStatement
      );

      if (!fnBlockMeta) {
        return new TypeInfo(name, ['any']);
      }

      const args = fnBlockMeta.definition.arguments || [];

      for (const argMeta of args) {
        if (argMeta.label === name) {
          return new TypeInfo(argMeta.label, [argMeta.type]);
        }
      }
    }

    // gather all available assignments in scope with certain namespace
    const assignments = this.findAllAssignmentsOfIdentifier(
      name,
      root,
      new Position(item.end.line, item.end.character)
    );
    const lastAssignment = assignments.pop();

    if (lastAssignment) {
      const { init } = lastAssignment as ASTAssignmentStatement;
      const initMeta = me.lookupTypeInfo({
        closest: init,
        outer: [root, lastAssignment]
      });

      if (initMeta instanceof TypeInfoWithDefinition) {
        return new TypeInfo(name, initMeta.definition.returns);
      }

      return initMeta || new TypeInfo(name, ['any']);
    }

    return null;
  }

  resolveFunctionDeclaration(
    item: ASTFunctionStatement,
    outer: LookupOuter = []
  ): TypeInfoWithDefinition | null {
    const me = this;
    const previous = outer.length > 0 ? outer[outer.length - 1] : undefined;
    let name = null;

    if (previous?.type === ASTType.AssignmentStatement) {
      name = ASTStringify((previous as ASTAssignmentStatement).variable);
    }

    return new TypeInfoWithDefinition(name || 'anonymous', ['function'], {
      arguments: item.parameters.map((arg: ASTBase) => {
        if (arg.type === ASTType.Identifier) {
          return {
            label: ASTStringify(arg),
            type: 'any'
          } as SignatureDefinitionArg;
        }

        const assignment = arg as ASTAssignmentStatement;

        return {
          label: ASTStringify(assignment.variable),
          type:
            me.lookupTypeInfo({ closest: assignment.init, outer: [] })
              ?.type[0] || 'any'
        };
      }),
      returns: ['any'],
      description: 'This is a custom method.'
    });
  }

  resolveCallStatement(
    item: ASTCallStatement,
    outer: LookupOuter = []
  ): TypeInfo | null {
    const { expression } = item;
    return this.lookupTypeInfo({ closest: expression, outer });
  }

  resolveCallExpression(
    item: ASTCallExpression,
    outer: LookupOuter = []
  ): TypeInfo | null {
    const { base } = item;
    const newOuter = outer.concat([item]);
    return this.lookupTypeInfo({ closest: base, outer: newOuter });
  }

  resolveDefault(item: ASTBase): TypeInfo | null {
    switch (item.type) {
      case ASTType.StringLiteral:
        return new TypeInfo((item as ASTLiteral).raw.toString(), ['string']);
      case ASTType.NumericLiteral:
        return new TypeInfo((item as ASTLiteral).raw.toString(), ['number']);
      case ASTType.BooleanLiteral:
        return new TypeInfo((item as ASTLiteral).raw.toString(), ['boolean']);
      case ASTType.MapConstructorExpression:
        return new TypeInfo('{}', ['map:any']);
      case ASTType.ListConstructorExpression:
        return new TypeInfo('[]', ['list:any']);
      case ASTType.BinaryExpression:
        return new TypeInfo('Binary expression', ['number']);
      case ASTType.LogicalExpression:
        return new TypeInfo('Logical expression', ['boolean']);
      default:
        return null;
    }
  }

  lookupTypeInfo({ closest, outer }: LookupASTResult): TypeInfo | null {
    const me = this;

    switch (closest.type) {
      case ASTType.Identifier:
        return me.resolveIdentifier(closest as ASTIdentifier, outer);
      case ASTType.MemberExpression:
      case ASTType.IndexExpression:
        return me.resolvePath(closest, outer);
      case ASTType.FunctionDeclaration:
        return me.resolveFunctionDeclaration(
          closest as ASTFunctionStatement,
          outer
        );
      case ASTType.CallStatement:
        return me.resolveCallStatement(closest as ASTCallStatement, outer);
      case ASTType.CallExpression:
        return me.resolveCallExpression(closest as ASTCallExpression, outer);
      case ASTType.StringLiteral:
      case ASTType.NumericLiteral:
      case ASTType.BooleanLiteral:
      case ASTType.MapConstructorExpression:
      case ASTType.ListConstructorExpression:
        return me.resolveDefault(closest);
      default:
        return null;
    }
  }

  lookupType(position: Position): TypeInfo | null {
    const me = this;
    const astResult = me.lookupAST(position);

    // nothing to get info for
    if (!astResult) {
      return null;
    }

    return me.lookupTypeInfo(astResult);
  }
}
