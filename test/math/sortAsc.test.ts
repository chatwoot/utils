import { sortAsc } from '../../src';

describe('sortAsc', () => {
  it('should return an empty array when given an empty array', () => {
    const input = [] as number[];
    const expectedOutput = [] as number[];
    const result = sortAsc(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should return the same array when given an array with only one element', () => {
    const input = [1];
    const expectedOutput = [1];
    const result = sortAsc(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should sort an array of positive numbers in ascending order', () => {
    const input = [5, 1, 4, 2, 3];
    const expectedOutput = [1, 2, 3, 4, 5];
    const result = sortAsc(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should sort an array of negative numbers in ascending order', () => {
    const input = [-5, -1, -4, -2, -3];
    const expectedOutput = [-5, -4, -3, -2, -1];
    const result = sortAsc(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should sort an array of mixed positive and negative numbers in ascending order', () => {
    const input = [5, -1, 4, -2, 3];
    const expectedOutput = [-2, -1, 3, 4, 5];
    const result = sortAsc(input);
    expect(result).toEqual(expectedOutput);
  });

  it('should not mutate the original array', () => {
    const input = [5, 1, 4, 2, 3];
    const expectedOutput = [1, 2, 3, 4, 5];
    const result = sortAsc(input);
    expect(result).toEqual(expectedOutput);
    expect(input).toEqual([5, 1, 4, 2, 3]);
  });
});
