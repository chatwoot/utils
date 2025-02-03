import { debounce } from './debounce';
import {
  formatTime,
  formatDate,
  getContrastingTextColor,
  trimContent,
  convertSecondsToTimeUnit,
  fileNameWithEllipsis,
  splitName,
  downloadFile,
  getFileInfo,
} from './helpers';

import { parseBoolean } from './string';
import { sortAsc, quantile, clamp, getQuantileIntervals } from './math';
import {
  getMessageVariables,
  replaceVariablesInMessage,
  getUndefinedVariablesInMessage,
} from './canned';

import { createTypingIndicator } from './typingStatus';

import { evaluateSLAStatus } from './sla';

export {
  clamp,
  convertSecondsToTimeUnit,
  createTypingIndicator,
  debounce,
  evaluateSLAStatus,
  fileNameWithEllipsis,
  formatDate,
  formatTime,
  getContrastingTextColor,
  getMessageVariables,
  getQuantileIntervals,
  getUndefinedVariablesInMessage,
  parseBoolean,
  quantile,
  replaceVariablesInMessage,
  sortAsc,
  splitName,
  trimContent,
  downloadFile,
  getFileInfo,
};
