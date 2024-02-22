import { debounce } from './debounce';
import {
  formatTime,
  formatDate,
  getContrastingTextColor,
  trimContent,
  convertSecondsToTimeUnit,
} from './helpers';

import { parseBoolean } from './string';
import { sortAsc, quantile, clamp, getQuantileIntervals } from './math';
import {
  getMessageVariables,
  replaceVariablesInMessage,
  getUndefinedVariablesInMessage,
} from './canned';

import { createTypingIndicator } from './typingStatus';

export {
  debounce,
  formatTime,
  formatDate,
  getContrastingTextColor,
  trimContent,
  parseBoolean,
  sortAsc,
  quantile,
  clamp,
  getQuantileIntervals,
  getMessageVariables,
  replaceVariablesInMessage,
  getUndefinedVariablesInMessage,
  createTypingIndicator,
  convertSecondsToTimeUnit,
};
