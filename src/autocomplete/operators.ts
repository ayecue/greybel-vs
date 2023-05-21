import { CompletionItem } from '@vscode/debugadapter';
import { Operator } from 'greyscript-core';
import { CompletionItemKind } from 'vscode';

export const AVAILABLE_OPERATORS: CompletionItem[] = [
  Operator.Plus,
  Operator.Asterik,
  Operator.Minus,
  Operator.Slash,
  Operator.Power,
  Operator.PercentSign,
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
  Operator.BitwiseAnd,
  Operator.BitwiseOr,
  Operator.LeftShift,
  Operator.RightShift,
  Operator.UnsignedRightShift,
  Operator.Assign,
  Operator.Reference
].map((item: string) => new CompletionItem(item, CompletionItemKind.Operator));
