import { CompletionItem } from '@vscode/debugadapter';
import { Operator as GreybelOperators } from 'greybel-core/dist/types/operators';
import { Operator } from 'miniscript-core';
import { CompletionItemKind } from 'vscode';

export const AVAILABLE_OPERATORS: CompletionItem[] = [
  Operator.Plus,
  Operator.Asterik,
  Operator.Minus,
  Operator.Slash,
  Operator.Power,
  Operator.Modulo,
  Operator.LessThan,
  Operator.GreaterThan,
  Operator.LessThanOrEqual,
  Operator.GreaterThanOrEqual,
  Operator.NotEqual,
  Operator.Equal,
  Operator.AddShorthand,
  Operator.SubtractShorthand,
  Operator.MultiplyShorthand,
  Operator.DivideShorthand,
  GreybelOperators.BitwiseAnd,
  GreybelOperators.BitwiseOr,
  GreybelOperators.LeftShift,
  GreybelOperators.RightShift,
  GreybelOperators.UnsignedRightShift,
  Operator.Assign,
  Operator.Reference
].map((item: string) => new CompletionItem(item, CompletionItemKind.Operator));
