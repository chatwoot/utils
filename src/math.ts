/**
 * Sorts an array of numbers in ascending order.
 * @param {number[]} arr - The array of numbers to be sorted.
 * @returns {number[]} - The sorted array.
 */
export function sortAsc(arr: number[]) {
  // .slice() is used to create a copy of the array so that the original array is not mutated
  return arr.slice().sort((a, b) => a - b);
}

/**
 * Calculates the quantile value of an array at a specified percentile.
 * @param {number[]} arr - The array of numbers to calculate the quantile value from.
 * @param {number} q - The percentile to calculate the quantile value for.
 * @returns {number} - The quantile value.
 */
export function quantile(arr: number[], q: number) {
  const sorted = sortAsc(arr); // Sort the array in ascending order
  return _quantileForSorted(sorted, q); // Calculate the quantile value
}

/**
 * Clamps a value between a minimum and maximum range.
 * @param {number} min - The minimum range.
 * @param {number} max - The maximum range.
 * @param {number} value - The value to be clamped.
 * @returns {number} - The clamped value.
 */
export function clamp(min: number, max: number, value: number) {
  if (value < min) {
    return min;
  }
  if (value > max) {
    return max;
  }
  return value;
}

/**
 * This method assumes the the array provided is already sorted in ascending order.
 * It's a helper method for the quantile method and should not be exported as is.
 *
 * @param {number[]} arr - The array of numbers to calculate the quantile value from.
 * @param {number} q - The percentile to calculate the quantile value for.
 * @returns {number} - The quantile value.
 */
function _quantileForSorted(sorted: number[], q: number) {
  const clamped = clamp(0, 1, q); // Clamp the percentile between 0 and 1
  const pos = (sorted.length - 1) * clamped; // Calculate the index of the element at the specified percentile
  const base = Math.floor(pos); // Find the index of the closest element to the specified percentile
  const rest = pos - base; // Calculate the decimal value between the closest elements

  // Interpolate the quantile value between the closest elements
  // Most libraries don't to the interpolation, but I'm just having fun here
  // also see https://en.wikipedia.org/wiki/Quantile#Estimating_quantiles_from_a_sample
  if (sorted[base + 1] !== undefined) {
    // in case the position was a integer, the rest will be 0 and the interpolation will be skipped
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }

  // Return the closest element if there is no interpolation possible
  return sorted[base];
}

/**
 * Calculates the quantile values for an array of intervals.
 * @param {number[]} data - The array of numbers to calculate the quantile values from.
 * @param {number[]} intervals - The array of intervals to calculate the quantile values for.
 * @returns {number[]} - The array of quantile values for the intervals.
 */
export const getQuantileIntervals = (data: number[], intervals: number[]) => {
  // Sort the array in ascending order before looping through the intervals.
  // depending on the size of the array and the number of intervals, this can speed up the process by at least twice
  // for a random array of 100 numbers and 5 intervals, the speedup is 3x
  // P.S. .slice() is used to create a copy of the array so that the original array is not mutated
  const sorted = sortAsc(data.slice());

  return intervals.map(interval => {
    return _quantileForSorted(sorted, interval);
  });
};
