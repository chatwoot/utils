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
  formatNumber,
} from './helpers';

import {
  toURL,
  isSameHost,
  isValidDomain,
  extractFilenameFromUrl,
} from './url';

import { getRecipients } from './email';

import { parseBoolean, sanitizeTextForRender } from './string';
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

import { coerceToDate } from './date';
import {
  getAllowedFileTypesByChannel,
  getMaxUploadSizeByChannel,
} from './fileUploadRules';

import {
  MEDIA_FORMATS,
  COMPONENT_TYPES,
  findComponentByType,
  processVariable,
  extractVariables,
  renderTemplatePreview,
  isSendableTemplate,
  hasMediaHeader,
  isDocumentHeader,
  getMediaType,
  buildWhatsAppProcessedParams,
  isWhatsAppComplete,
  isTwilioMediaTemplate,
  getTwilioMediaUrl,
  getTwilioMediaVariableKey,
  buildTwilioProcessedParams,
  isTwilioComplete,
  applyTwilioMediaFilename,
} from './template';

export {
  clamp,
  coerceToDate,
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
  quantile,
  replaceVariablesInMessage,
  sanitizeTextForRender,
  sortAsc,
  splitName,
  toURL,
  isSameHost,
  isValidDomain,
  extractFilenameFromUrl,
  trimContent,
  downloadFile,
  getFileInfo,
  getRecipients,
  formatNumber,
  getAllowedFileTypesByChannel,
  getMaxUploadSizeByChannel,
  MEDIA_FORMATS,
  COMPONENT_TYPES,
  findComponentByType,
  processVariable,
  extractVariables,
  renderTemplatePreview,
  isSendableTemplate,
  hasMediaHeader,
  isDocumentHeader,
  getMediaType,
  buildWhatsAppProcessedParams,
  isWhatsAppComplete,
  isTwilioMediaTemplate,
  getTwilioMediaUrl,
  getTwilioMediaVariableKey,
  buildTwilioProcessedParams,
  isTwilioComplete,
  applyTwilioMediaFilename,
};

export * from './types/template';
