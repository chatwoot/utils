import { parseBoolean } from '../src';

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
