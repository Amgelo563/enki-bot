export class MarkdownSanitizer {
  protected static UnderscorePattern = /_+(\w+)_+/g;

  protected static AsteriskPattern = /\*+(\w+)\*+/g;

  protected static StrikethroughPattern = /~+(\w+)~+/g;

  protected static InlineCodePattern = /`+(\w+)`+/g;

  protected static HeaderPattern = /(^|\s+)#+\s+/g;

  public static sanitize(text: string): string {
    const patterns = [
      MarkdownSanitizer.UnderscorePattern,
      MarkdownSanitizer.AsteriskPattern,
      MarkdownSanitizer.StrikethroughPattern,
      MarkdownSanitizer.InlineCodePattern,
    ];

    let result = text.replaceAll(MarkdownSanitizer.HeaderPattern, '');
    for (const pattern of patterns) {
      result = MarkdownSanitizer.stripSurrounding(result, pattern);
    }

    return result;
  }

  protected static stripSurrounding(input: string, regex: RegExp): string {
    let result = input;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(result)) !== null) {
      result = result.replace(match[0], match[1]);
    }

    return result;
  }
}
