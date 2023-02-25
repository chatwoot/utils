import { quantile, getQuantileIntervals } from '../../src';

describe('quantile', () => {
  it('returns the correct quantile value for an array of numbers', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(quantile(arr, 0.25)).toBe(3.25);
    expect(quantile(arr, 0.5)).toBe(5.5);
    expect(quantile(arr, 0.75)).toBe(7.75);
  });

  it('returns the correct quantile value for an array of numbers with duplicates', () => {
    const arr = [1, 2, 2, 3, 4, 5, 6, 7, 8, 8, 9, 10];
    expect(quantile(arr, 0.25)).toBe(2.75);
    expect(quantile(arr, 0.5)).toBe(5.5);
    expect(quantile(arr, 0.75)).toBe(8);
  });

  it('returns the correct quantile value for an array of numbers with even length', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    expect(quantile(arr, 0.25)).toBe(3.75);
    expect(quantile(arr, 0.5)).toBe(6.5);
    expect(quantile(arr, 0.75)).toBe(9.25);
  });

  it('returns the first element for a quantile of 0', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(quantile(arr, 0)).toBe(1);
  });

  it('returns the last element for a quantile of 1', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(quantile(arr, 1)).toBe(10);
  });

  it('returns the correct quantile value for an array with only one element', () => {
    const arr = [1];
    expect(quantile(arr, 0.5)).toBe(1);
  });

  it('returns the correct quantile value for an empty array', () => {
    const arr = [] as number[];
    expect(quantile(arr, 0.5)).toBeUndefined();
  });

  it('clamps the percentile between 0 and 1', () => {
    const arr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    expect(quantile(arr, -1)).toBe(1);
    expect(quantile(arr, 1.5)).toBe(10);
  });
});

describe('getQuantileIntervals', () => {
  const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

  it('returns an array of quantile values for each interval', () => {
    const intervals = [0, 0.25, 0.5, 0.75, 1];
    const expected = [1, 3.25, 5.5, 7.75, 10];
    expect(getQuantileIntervals(data, intervals)).toEqual(expected);
  });

  it('handles duplicate intervals', () => {
    const intervals = [0, 0.25, 0.25, 0.5, 0.75, 0.75, 1];
    const expected = [1, 3.25, 3.25, 5.5, 7.75, 7.75, 10];
    expect(getQuantileIntervals(data, intervals)).toEqual(expected);
  });

  it('handles intervals that are outside the range of the data', () => {
    const intervals = [-0.1, 0.5, 1.1];
    const expected = [1, 5.5, 10];
    expect(getQuantileIntervals(data, intervals)).toEqual(expected);
  });

  it('handles empty arrays', () => {
    const intervals = [0, 0.5, 1];
    expect(getQuantileIntervals([], intervals)).toEqual([
      undefined,
      undefined,
      undefined,
    ]);
  });

  it('handles arrays with a single element', () => {
    const intervals = [0, 0.5, 1];
    expect(getQuantileIntervals([1], intervals)).toEqual([1, 1, 1]);
  });
});
