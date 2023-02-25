import { clamp } from '../../src';

describe('clamp', () => {
  it('should return the minimum range when the value is less than the minimum range', () => {
    const min = 0;
    const max = 10;
    const value = -1;
    const expectedOutput = 0;
    const result = clamp(min, max, value);
    expect(result).toEqual(expectedOutput);
  });

  it('should return the maximum range when the value is greater than the maximum range', () => {
    const min = 0;
    const max = 10;
    const value = 11;
    const expectedOutput = 10;
    const result = clamp(min, max, value);
    expect(result).toEqual(expectedOutput);
  });

  it('should return the value when it is within the range of minimum and maximum', () => {
    const min = 0;
    const max = 10;
    const value = 5;
    const expectedOutput = 5;
    const result = clamp(min, max, value);
    expect(result).toEqual(expectedOutput);
  });

  it('should clamp negative numbers to the minimum range', () => {
    const min = -10;
    const max = 10;
    const value = -20;
    const expectedOutput = -10;
    const result = clamp(min, max, value);
    expect(result).toEqual(expectedOutput);
  });

  it('should clamp positive numbers to the maximum range', () => {
    const min = -10;
    const max = 10;
    const value = 20;
    const expectedOutput = 10;
    const result = clamp(min, max, value);
    expect(result).toEqual(expectedOutput);
  });

  it('should clamp numbers within the range to themselves', () => {
    const min = -10;
    const max = 10;
    const value = 0;
    const expectedOutput = 0;
    const result = clamp(min, max, value);
    expect(result).toEqual(expectedOutput);
  });

  it('should handle the case where the minimum and maximum values are the same', () => {
    const min = 5;
    const max = 5;
    const value = 3;
    const expectedOutput = 5;
    const result = clamp(min, max, value);
    expect(result).toEqual(expectedOutput);
  });
});
