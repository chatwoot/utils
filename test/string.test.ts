import { parseBoolean, splitWords } from '../src';

describe('#parseBoolean', () => {
  test('returns true for input "true"', () => {
    expect(parseBoolean('true')).toBe(true);
    expect(parseBoolean('TRUE')).toBe(true);
    expect(parseBoolean('True')).toBe(true);
  });

  test('returns false for input "false"', () => {
    expect(parseBoolean('false')).toBe(false);
    expect(parseBoolean('FALSE')).toBe(false);
    expect(parseBoolean('False')).toBe(false);
  });

  test('returns true for input "1"', () => {
    expect(parseBoolean(1)).toBe(true);
    expect(parseBoolean('1')).toBe(true);
  });

  test('returns false for input "0"', () => {
    expect(parseBoolean(0)).toBe(false);
    expect(parseBoolean('0')).toBe(false);
  });

  test('returns false for input "non-boolean value"', () => {
    expect(parseBoolean('non-boolean value')).toBe(false);
  });

  test('returns false for input "null"', () => {
    // @ts-ignore
    expect(parseBoolean(null)).toBe(false);
  });

  test('returns false for input "undefined"', () => {
    // @ts-ignore
    expect(parseBoolean(undefined)).toBe(false);
  });
});

describe('#splitWords', () => {
  test('returns an array of words for input "apple,banana,cherry"', () => {
    expect(splitWords('apple,banana,cherry')).toEqual([
      'apple',
      'banana',
      'cherry',
    ]);
  });

  test('returns an empty array for input ""', () => {
    expect(splitWords('')).toEqual(['']);
  });

  test('returns an array with a single word for input "apple"', () => {
    expect(splitWords('apple')).toEqual(['apple']);
  });

  test('allows phrases without double quotes', () => {
    expect(splitWords('apple banana, cherry')).toEqual([
      'apple banana',
      'cherry',
    ]);
  });

  test('allows phrases with double quotes', () => {
    expect(splitWords('"apple banana", cherry')).toEqual([
      'apple banana',
      'cherry',
    ]);
  });

  test('allows phrases with double quotes and commas', () => {
    expect(splitWords('"apple, banana", cherry')).toEqual([
      'apple, banana',
      'cherry',
    ]);
  });

  test('throws error for mismatched quotes', () => {
    expect(() => splitWords('"apple, banana, cherry')).toThrow(
      'Mismatched quotes in input string'
    );
  });

  test('preserves trailing empty field when input ends with a delimiter', () => {
    expect(splitWords('apple,banana,')).toEqual(['apple', 'banana', '']);
    expect(splitWords('apple,')).toEqual(['apple', '']);
    expect(splitWords(',')).toEqual(['', '']);
  });
});
