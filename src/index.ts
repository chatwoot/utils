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
  extractVariables,
  renderTemplatePreview,
  renderTemplateLabel,
  buildPreviewSegments,
  isSendableTemplate,
  hasMediaHeader,
  isDocumentHeader,
  getMediaType,
  getHeaderSubtitle,
  normalizeWhatsApp,
  normalizeTwilio,
  getTemplates,
  filterTemplatesByQuery,
  createEmptyFormState,
  isTemplateComplete,
  buildTemplateParams,
  renderTemplateMessage,
  buildTemplateSendPayload,
  MEDIA_FORMATS,
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
  extractVariables,
  renderTemplatePreview,
  renderTemplateLabel,
  buildPreviewSegments,
  isSendableTemplate,
  hasMediaHeader,
  isDocumentHeader,
  getMediaType,
  getHeaderSubtitle,
  normalizeWhatsApp,
  normalizeTwilio,
  getTemplates,
  filterTemplatesByQuery,
  createEmptyFormState,
  isTemplateComplete,
  buildTemplateParams,
  renderTemplateMessage,
  buildTemplateSendPayload,
  MEDIA_FORMATS,
};

export type {
  WhatsAppTemplateHeaderFormat,
  WhatsAppTemplateButton,
  WhatsAppTemplateComponent,
  WhatsAppMessageTemplate,
  TwilioContentTemplate,
  TwilioContentTemplates,
  TemplatePlatform,
  NormalizedTemplateHeader,
  NormalizedTemplateButton,
  NormalizedTemplate,
  TemplateButtonParam,
  WhatsAppProcessedParams,
  TwilioProcessedParams,
  TemplateSendParams,
  TemplateFormState,
} from './types/template';

export type { PreviewSegment } from './template';
