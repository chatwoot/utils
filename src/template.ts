import { extractFilenameFromUrl } from './url';
import {
  TemplateButtonParam,
  TwilioContentTemplate,
  TwilioProcessedParams,
  WhatsAppMessageTemplate,
  WhatsAppProcessedParams,
  WhatsAppTemplateComponent,
} from './types/template';

// Header formats that carry a media attachment.
export const MEDIA_FORMATS = ['IMAGE', 'VIDEO', 'DOCUMENT'];

export const COMPONENT_TYPES = {
  HEADER: 'HEADER',
  BODY: 'BODY',
  BUTTONS: 'BUTTONS',
} as const;

// Component types that can't be sent from the composer.
const UNSUPPORTED_COMPONENT_TYPES = [
  'LIST',
  'PRODUCT',
  'CATALOG',
  'CALL_PERMISSION_REQUEST',
];

const TWILIO_MEDIA_TEMPLATE_TYPE = 'media';
const VARIABLE_REGEX = /{{([^}]+)}}/g;

export const findComponentByType = <
  T extends WhatsAppTemplateComponent['type']
>(
  template: WhatsAppMessageTemplate,
  type: T
): Extract<WhatsAppTemplateComponent, { type: T }> | undefined =>
  template.components?.find(component => component.type === type) as
    | Extract<WhatsAppTemplateComponent, { type: T }>
    | undefined;

// Strips the surrounding braces from a `{{token}}` match.
export const processVariable = (str: string): string =>
  str.replace(/{{|}}/g, '');

const isCsatTemplate = (name: string): boolean =>
  name.startsWith('customer_satisfaction_survey');

// Ordered, de-duplicated list of variable tokens found in a body string.
export const extractVariables = (body: string): string[] => {
  if (!body) return [];
  const regex = new RegExp(VARIABLE_REGEX.source, 'g');
  const seen = new Set<string>();
  const ordered: string[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(body)) !== null) {
    const key = match[1].trim();
    if (!seen.has(key)) {
      seen.add(key);
      ordered.push(key);
    }
  }
  return ordered;
};

// Replaces `{{token}}` occurrences with values, keeping the token when unset.
export const renderTemplatePreview = (
  body: string,
  values: Record<string, string>
): string => {
  if (!body) return '';
  return body.replace(VARIABLE_REGEX, (_match, rawKey) => {
    const key = rawKey.trim();
    const value = values[key];
    return value && value.length > 0 ? value : `{{${key}}}`;
  });
};

/**
 * Whether a WhatsApp template can be sent from the composer:
 *  - requires status + components
 *  - status (case-insensitive) === 'approved'
 *  - category !== 'AUTHENTICATION'
 *  - name does not start with 'customer_satisfaction_survey'
 *  - no LIST/PRODUCT/CATALOG/CALL_PERMISSION_REQUEST component and no LOCATION header
 */
export const isSendableTemplate = (
  template: WhatsAppMessageTemplate
): boolean => {
  if (!template || !template.status || !template.components) return false;
  if (template.status.toLowerCase() !== 'approved') return false;
  if (template.category === 'AUTHENTICATION') return false;
  if (template.name && isCsatTemplate(template.name)) return false;

  const hasUnsupportedComponents = template.components.some(
    component =>
      UNSUPPORTED_COMPONENT_TYPES.indexOf(component.type) !== -1 ||
      (component.type === 'HEADER' && component.format === 'LOCATION')
  );
  if (hasUnsupportedComponents) return false;

  return true;
};

export const hasMediaHeader = (template: WhatsAppMessageTemplate): boolean => {
  const header = findComponentByType(template, 'HEADER');
  return header?.format ? MEDIA_FORMATS.indexOf(header.format) !== -1 : false;
};

export const isDocumentHeader = (
  template: WhatsAppMessageTemplate
): boolean => {
  const header = findComponentByType(template, 'HEADER');
  return header?.format?.toLowerCase() === 'document';
};

export const getMediaType = (template: WhatsAppMessageTemplate): string => {
  const header = findComponentByType(template, 'HEADER');
  return header?.format ? header.format.toLowerCase() : '';
};

const bodyHasVariables = (template: WhatsAppMessageTemplate): boolean => {
  const body = findComponentByType(template, 'BODY');
  return body ? body.text.match(VARIABLE_REGEX) !== null : false;
};

// Collects the URL/COPY_CODE buttons that require a user-supplied parameter,
// preserving their positional index (sparse array).
const buildButtonParams = (
  template: WhatsAppMessageTemplate
): TemplateButtonParam[] | undefined => {
  const buttonComponents = (template.components || []).filter(
    component => component.type === 'BUTTONS'
  );
  const buttons: TemplateButtonParam[] = [];
  let found = false;
  buttonComponents.forEach(component => {
    if (component.type !== 'BUTTONS' || !component.buttons) return;
    component.buttons.forEach((button, index) => {
      if (button.type === 'URL' && button.url && button.url.includes('{{')) {
        const buttonVars = button.url.match(VARIABLE_REGEX) || [];
        if (buttonVars.length > 0) {
          found = true;
          buttons[index] = {
            type: 'url',
            parameter: '',
            url: button.url,
            variables: buttonVars.map(processVariable),
          };
        }
      }
      if (button.type === 'COPY_CODE') {
        found = true;
        buttons[index] = { type: 'copy_code', parameter: '' };
      }
    });
  });
  return found ? buttons : undefined;
};

/**
 * Builds the empty WhatsApp processed_params scaffold for a template: body keys,
 * a media header block, and the button parameters that need filling.
 */
export const buildWhatsAppProcessedParams = (
  template: WhatsAppMessageTemplate
): WhatsAppProcessedParams => {
  const params: WhatsAppProcessedParams = {};

  const body = findComponentByType(template, 'BODY');
  if (!body) return params;

  const matchedVariables = body.text.match(VARIABLE_REGEX);
  if (matchedVariables) {
    const bodyParams: Record<string, string> = {};
    matchedVariables.forEach(variable => {
      bodyParams[processVariable(variable)] = '';
    });
    params.body = bodyParams;
  }

  if (hasMediaHeader(template)) {
    const format = getMediaType(template);
    params.header = { media_url: '', media_type: format };
    if (format === 'document') params.header.media_name = '';
  }

  const buttons = buildButtonParams(template);
  if (buttons) params.buttons = buttons;

  return params;
};

/**
 * Whether every required WhatsApp input has been filled. A template with no body
 * variables and no media header is considered complete even if it has buttons
 * (mirrors the composer's validation).
 */
export const isWhatsAppComplete = (
  template: WhatsAppMessageTemplate,
  processedParams: WhatsAppProcessedParams
): boolean => {
  const hasVariables = bodyHasVariables(template);
  const media = hasMediaHeader(template);

  if (!hasVariables && !media) return true;

  if (media && !processedParams.header?.media_url) return false;

  if (hasVariables && processedParams.body) {
    const hasEmptyBodyVariable = Object.keys(processedParams.body).some(
      key => !processedParams.body?.[key]
    );
    if (hasEmptyBodyVariable) return false;
  }

  if (processedParams.buttons) {
    const hasEmptyButtonParameter = processedParams.buttons.some(
      button => button && !button.parameter
    );
    if (hasEmptyButtonParameter) return false;
  }

  return true;
};

export const isTwilioMediaTemplate = (
  template: TwilioContentTemplate
): boolean => template.template_type === TWILIO_MEDIA_TEMPLATE_TYPE;

export const getTwilioMediaUrl = (template: TwilioContentTemplate): string =>
  template.types?.['twilio/media']?.media?.[0] ?? '';

// The variable token (e.g. '1') embedded in a Twilio media URL, if any.
export const getTwilioMediaVariableKey = (
  template: TwilioContentTemplate
): string | null => {
  if (!isTwilioMediaTemplate(template)) return null;
  const mediaUrl = getTwilioMediaUrl(template);
  if (!mediaUrl) return null;
  return mediaUrl.match(/{{(\d+)}}/)?.[1] ?? null;
};

// Builds the empty Twilio processed_params: one key per body variable plus the
// media variable when present.
export const buildTwilioProcessedParams = (
  template: TwilioContentTemplate
): TwilioProcessedParams => {
  const params: TwilioProcessedParams = {};
  extractVariables(template.body || '').forEach(variable => {
    params[variable] = '';
  });
  const mediaKey = getTwilioMediaVariableKey(template);
  if (mediaKey) params[mediaKey] = '';
  return params;
};

export const isTwilioComplete = (
  template: TwilioContentTemplate,
  processedParams: TwilioProcessedParams
): boolean => {
  const variables = extractVariables(template.body || '');
  const mediaKey = getTwilioMediaVariableKey(template);

  if (variables.length === 0 && !mediaKey) return true;
  if (variables.some(variable => !processedParams[variable])) return false;
  if (mediaKey && !processedParams[mediaKey]) return false;
  return true;
};

// Reduces the Twilio media variable value to a filename before sending.
export const applyTwilioMediaFilename = (
  template: TwilioContentTemplate,
  processedParams: TwilioProcessedParams
): TwilioProcessedParams => {
  const mediaKey = getTwilioMediaVariableKey(template);
  const result = { ...processedParams };
  if (mediaKey && result[mediaKey]) {
    result[mediaKey] = extractFilenameFromUrl(result[mediaKey]);
  }
  return result;
};
