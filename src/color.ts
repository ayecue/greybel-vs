import { ASTChunk, ASTLiteral, ASTBase, ASTType } from 'greyscript-core';
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
import colorConvert from 'color-convert';
import documentParseQueue from './helper/document-manager';

export function activate(_context: ExtensionContext) {
  vscode.languages.registerColorProvider('greyscript', {
    provideColorPresentations(
      color: Color,
      _context: { document: TextDocument, range: Range },
      _token: CancellationToken
    ): ProviderResult<ColorPresentation[]> {
      return [{
        label: `#${colorConvert.rgb.hex(color.red * 255, color.green * 255, color.blue * 255)}`
      }];
    },

    provideDocumentColors(document: TextDocument, _token: CancellationToken): ProviderResult<ColorInformation[]> {
      const parseResult = documentParseQueue.get(document);
      const chunk = parseResult.document as ASTChunk;
      const allAvailableStrings = chunk
        .literals
        .filter((literal: ASTBase) => (literal as ASTLiteral).type === ASTType.StringLiteral) as ASTLiteral[];
      const result: ColorInformation[] = [];

      for (let index = 0; index < allAvailableStrings.length; index++) {
        const strLiteral = allAvailableStrings[index];

        if (!strLiteral.start) continue;
        
        const start = strLiteral.start;
        const lines = strLiteral.value.toString().split('\n');

        for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
          const line = lines[lineIndex];
          const regexp = new RegExp('<(?:mark|color)=([^>]+)>', 'ig');
          let match;

          while (match = regexp.exec(line)) {
            const [markup, value] = match;

            if (value.startsWith('#')) {
              const [red, green, blue] = colorConvert.hex.rgb(value.slice(1));
              const colorStartIndex = match.index + markup.indexOf('#');
              const colorEndIndex = colorStartIndex + value.length;
              const colorStart = new Position(start.line + lineIndex - 1, start.character + colorStartIndex);
              const colorEnd = new Position(start.line + lineIndex - 1, start.character + colorEndIndex);

              result.push({
                range: new Range(colorStart, colorEnd),
                color: new Color(red / 255, green  / 255, blue  / 255, 0)
              });
            }
          }
        }
      }
      
      return result;
    },
  });
}
