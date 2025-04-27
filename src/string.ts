/**
 * Function that parses a string boolean value and returns the corresponding boolean value
 * @param {string | number} candidate - The string boolean value to be parsed
 * @return {boolean} - The parsed boolean value
 */

export function parseBoolean(candidate: string | number) {
  try {
    // lowercase the string, so TRUE becomes true
    const candidateString = String(candidate).toLowerCase();

    // wrap in boolean to ensure that the return value
    // is a boolean even if values like 0 or 1 are passed
    return Boolean(JSON.parse(candidateString));
  } catch (error) {
    return false;
  }
}

/**
 * Splits a string into an array of words, respecting quoted phrases.
 * Handles comma-separated values where phrases in double quotes are treated as a single unit,
 * even if they contain commas.
 *
 * This is basically CSV parsing, if we find this to be cumbersome to maintain,
 * we can consider using a dedicated CSV parsing library.
 *
 * Example: '"apple, banana", cherry' => ['apple, banana', 'cherry']
 *
 * @param {string} candidate - The input string to split
 * @return {string[]} - Array of split words/phrases
 */
export function splitWords(candidate: string): string[] {
  // Handle empty input case
  if (!candidate) return [''];

  const result = [];
  let currentWord = '';
  let inQuotes = false; // Tracks whether we're currently inside a quoted section

  // Process the string character by character:
  // 1. Toggle quote state when we encounter double quotes (") - marking quoted sections
  //    Quotes themselves are not included in the final words
  // 2. When we hit a comma outside quotes, it's treated as a word separator:
  //    - Current word is trimmed and added to results array
  //    - Current word buffer is reset for the next word
  // 3. Inside quoted sections, commas are treated as regular characters (part of the word)
  // 4. All other characters are added to the current word being built
  for (let i = 0; i < candidate.length; i++) {
    const char = candidate[i];

    if (char === '"') {
      inQuotes = !inQuotes;
      continue; // Skip adding the quote character to the result
    }

    if (char === ',' && !inQuotes) {
      result.push(currentWord.trim()); // Add the completed word to results
      currentWord = ''; // Reset for the next word
      continue;
    }

    currentWord += char;
  }

  // Check for mismatched quotes
  if (inQuotes) {
    throw new Error('Mismatched quotes in input string');
  }

  // Don't forget to add the last word if there is one
  if (currentWord.trim()) {
    result.push(currentWord.trim());
  }

  return result;
}
