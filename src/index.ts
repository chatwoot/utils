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

import { getRecipients } from './email';

import { parseBoolean, splitWords } from './string';
import {
  sortAsc,
  quantile,
  clamp,
  getQuantileIntervals,
  calculateCenterOffset,
  applyRotationTransform,
  normalizeToPercentage,
} from './math';
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
  calculateCenterOffset,
  applyRotationTransform,
  normalizeToPercentage,
  getUndefinedVariablesInMessage,
  parseBoolean,
  splitWords,
  quantile,
  replaceVariablesInMessage,
  sortAsc,
  splitName,
  trimContent,
  downloadFile,
  getFileInfo,
  getRecipients,
};
