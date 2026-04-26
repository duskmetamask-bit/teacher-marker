import { readFileSync } from 'fs';
import { join } from 'path';

const AC9_VALID_PATH = join(process.cwd(), 'lib', 'curriculum', 'ac9-code-validation.md');

const VALID_CODES = new Set(
  readFileSync(AC9_VALID_PATH, 'utf-8')
    .match(/AC9[A-Z][F0-6][A-Z]{2}\d{2}/g) || []
);

/**
 * Extract all AC9 codes from a text string.
 * Format: AC9 + version letter + year digit + learning area letters + strand letter + 2-digit number
 * e.g. AC9E4LY01, AC9M5N02, AC9SC3S01
 */
export function extractCodes(text: string): string[] {
  const matches = text.match(/AC9[A-Z]\d[A-Z]{2}\d{2}/g) || [];
  return [...new Set(matches)];
}

/**
 * Split codes into valid and invalid based on the AC9 validation file.
 */
export function validateCodes(codes: string[]): { valid: string[]; invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];
  for (const code of codes) {
    if (VALID_CODES.has(code)) valid.push(code);
    else invalid.push(code);
  }
  return { valid, invalid };
}

/**
 * Returns true if the text contains any invalid AC9 codes.
 */
export function hasInvalidCodes(text: string): boolean {
  const codes = extractCodes(text);
  return codes.some(code => !VALID_CODES.has(code));
}

/**
 * Validate a full text and return a summary with valid/invalid codes.
 */
export function validateFromText(text: string): { valid: string[]; invalid: string[] } {
  return validateCodes(extractCodes(text));
}