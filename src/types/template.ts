// Neutral WhatsApp/Twilio template types shared by web and mobile.
// Shapes follow the backend API contract: raw templates in, processed_params out.

export type WhatsAppTemplateHeaderFormat =
  | 'TEXT'
  | 'IMAGE'
  | 'VIDEO'
  | 'DOCUMENT'
  | 'LOCATION';

export type WhatsAppTemplateButton = {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE' | string;
  text?: string;
  url?: string;
  phone_number?: string;
  example?: string[];
};

export type WhatsAppTemplateComponent =
  | {
      type: 'HEADER';
      format?: WhatsAppTemplateHeaderFormat;
      text?: string;
      example?: Record<string, unknown>;
    }
  | { type: 'BODY'; text: string; example?: Record<string, unknown> }
  | { type: 'FOOTER'; text: string }
  | { type: 'BUTTONS'; buttons: WhatsAppTemplateButton[] };

export interface WhatsAppMessageTemplate {
  id?: string;
  name: string;
  status: string;
  category: string;
  language: string;
  namespace?: string;
  components: WhatsAppTemplateComponent[];
  parameter_format?: 'POSITIONAL' | 'NAMED';
}

export interface TwilioContentTemplate {
  content_sid: string;
  friendly_name: string;
  language: string;
  category?: string;
  status: string;
  template_type?: string;
  media_type?: string;
  body: string;
  variables?: Record<string, string>;
  types?: Record<string, { media?: string[] } & Record<string, unknown>>;
}

export interface TwilioContentTemplates {
  templates?: TwilioContentTemplate[];
}

// A single WhatsApp button parameter inside processed_params.buttons.
export interface TemplateButtonParam {
  type: 'url' | 'copy_code';
  parameter: string;
  url?: string;
  variables?: string[];
}

// WhatsApp processed_params: nested body / header / buttons.
export interface WhatsAppProcessedParams {
  body?: Record<string, string>;
  header?: {
    media_url: string;
    media_type: string;
    media_name?: string;
  };
  buttons?: TemplateButtonParam[];
}

// Twilio processed_params: a flat map keyed by variable token.
export type TwilioProcessedParams = Record<string, string>;

export type ProcessedParams = WhatsAppProcessedParams | TwilioProcessedParams;
