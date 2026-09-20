/**
 * Parses a raw multiline string into a clean list of values.
 * - Splits by newlines
 * - Trims leading and trailing whitespace on each line
 * - Ignores empty lines
 */
export function parseNumbers(text: string): string[] {
  if (!text) return [];

  return text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}
