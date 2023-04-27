import { debounce } from './debounce';
import {
  formatTime,
  formatDate,
  getContrastingTextColor,
  trimContent,
} from './helpers';

import { parseBoolean } from './string';
import { sortAsc, quantile, clamp, getQuantileIntervals } from './math';
import {
  getFirstName,
  getLastName,
  getMessageVariables,
  capitalizeName,
  replaceVariablesInMessage,
  getUndefinedVariablesInMessage,
} from './canned';

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
  getFirstName,
  getLastName,
  getMessageVariables,
  capitalizeName,
  replaceVariablesInMessage,
  getUndefinedVariablesInMessage,
};
