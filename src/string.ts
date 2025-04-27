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
  let inQuotes = false;  // Tracks whether we're currently inside a quoted section
  
  // Process the string character by character
  for (let i = 0; i < candidate.length; i++) {
    const char = candidate[i];
    
    // Toggle our "inside quotes" state when we encounter a quote character
    if (char === '"') {
      inQuotes = !inQuotes;
      continue;  // Skip adding the quote character to the result
    }
    
    // Only treat commas as delimiters when not inside quotes
    if (char === ',' && !inQuotes) {
      result.push(currentWord.trim());  // Add the completed word to results
      currentWord = '';  // Reset for the next word
      continue;
    }
    
    // For all other characters, add to the current word
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
