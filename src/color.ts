import colorConvert from 'color-convert';
import {
  ASTBase,
  ASTChunk,
  ASTLiteral,
  ASTPosition,
  ASTType
} from 'miniscript-core';
import vscode, {
  CancellationToken,
  Color,
  ColorInformation,
  ColorPresentation,
  ExtensionContext,
  Position,
  ProviderResult,
  Range,
  TextDocument
} from 'vscode';

import documentParseQueue from './helper/document-manager';

enum ColorType {
  Black = 'black',
  Blue = 'blue',
  Green = 'green',
  Orange = 'orange',
  Purple = 'purple',
  Red = 'red',
  White = 'white',
  Yellow = 'yellow'
}

const ColorMap: {
  [key in ColorType]: string;
} = {
  black: '#000000',
  blue: '#0000FF',
  green: '#00FF00',
  orange: '#FF8800',
  purple: '#CC8899',
  red: '#FF0000',
  white: '#FFFFFF',
  yellow: '#FFFF00'
};

const createColorRegExp = () => new RegExp(`(?:mark|color)=(${Object.keys(ColorMap).join('|')}|(?:#[0-9a-f]{6}|#[0-9a-f]{3}))`, 'ig');

const hasOwnProperty = Object.prototype.hasOwnProperty;

export function activate(_context: ExtensionContext) {
  vscode.languages.registerColorProvider('greyscript', {
    provideColorPresentations(
      color: Color,
      _context: { document: TextDocument; range: Range },
      _token: CancellationToken
    ): ProviderResult<ColorPresentation[]> {
      return [
        {
          label: `#${colorConvert.rgb.hex(
            color.red * 255,
            color.green * 255,
            color.blue * 255
          )}`
        }
      ];
    },

    async provideDocumentColors(
      document: TextDocument,
      _token: CancellationToken
    ): Promise<ColorInformation[]> {
      const parseResult = await documentParseQueue.next(document);
      const chunk = parseResult.document as ASTChunk;
      const allAvailableStrings = chunk.literals.filter(
        (literal: ASTBase) =>
          (literal as ASTLiteral).type === ASTType.StringLiteral
      ) as ASTLiteral[];
      const result: ColorInformation[] = [];
      const getRange = ({
        match,
        markup,
        value,
        astPosition,
        lineIndex
      }: {
        match: RegExpExecArray;
        markup: string;
        value: string;
        astPosition: ASTPosition;
        lineIndex: number;
      }): Range => {
        const colorStartIndex = match.index + markup.indexOf('=') + 1;
        const colorEndIndex = colorStartIndex + value.length;
        const line = (astPosition.line - 1) + lineIndex;
        let start = colorStartIndex;
        let end = colorEndIndex;

        if (lineIndex === 0) {
          start += astPosition.character;
          end += astPosition.character;
        }

        const colorStart = new Position(line, start);
        const colorEnd = new Position(line, end);

        return new Range(colorStart, colorEnd);
      };

      for (let index = 0; index < allAvailableStrings.length; index++) {
        const strLiteral = allAvailableStrings[index];

        if (!strLiteral.start) continue;

        const start = strLiteral.start;
        const lines = strLiteral.value.toString().split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          const regexp = createColorRegExp();
          let match;

          while ((match = regexp.exec(line))) {
            const [markup, value] = match;
            const range = getRange({
              match,
              markup,
              value,
              astPosition: start,
              lineIndex
            });

            if (value.startsWith('#')) {
              const [red, green, blue] = colorConvert.hex.rgb(value.slice(1));

              result.push({
                range,
                color: new Color(red / 255, green / 255, blue / 255, 1)
              });
            } else if (hasOwnProperty.call(ColorMap, value)) {
              const [red, green, blue] = colorConvert.hex.rgb(
                ColorMap[value as ColorType].slice(1)
              );

              result.push({
                range,
                color: new Color(red / 255, green / 255, blue / 255, 1)
              });
            } else {
              result.push({
                range,
                color: new Color(0, 0, 0, 1)
              });
            }
          }
        }
      }

      return result;
    }
  });
}
