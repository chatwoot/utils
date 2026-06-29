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
  phoneNumber?: string;
  example?: string[];
};

export type WhatsAppTemplateComponent =
  | {
      type: 'HEADER';
      format?: WhatsAppTemplateHeaderFormat;
      text?: string;
      example?: { headerHandle?: string[]; headerText?: string[] };
    }
  | {
      type: 'BODY';
      text: string;
      example?: {
        bodyText?: string[][];
        bodyTextNamedParams?: { paramName: string; example: string }[];
      };
    }
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
  parameterFormat?: 'POSITIONAL' | 'NAMED';
}

export interface TwilioContentTemplate {
  contentSid: string;
  friendlyName: string;
  language: string;
  category?: string;
  status: string;
  templateType?: string;
  mediaType?: string;
  body: string;
  variables?: Record<string, string>;
  types?: Record<string, { media?: string[] } & Record<string, unknown>>;
}

export interface TwilioContentTemplates {
  templates?: TwilioContentTemplate[];
}

export type TemplatePlatform = 'whatsapp' | 'twilio';

export interface NormalizedTemplateHeader {
  format: WhatsAppTemplateHeaderFormat;
  text?: string;
}

// Button parameters that the in-conversation form collects values for: only URL
// buttons that embed a `{{ }}` variable and COPY_CODE buttons require a parameter.
export interface NormalizedTemplateButton {
  index: number;
  type: 'url' | 'copy_code';
  url?: string;
  variables?: string[];
}

export interface NormalizedTemplate {
  id: string;
  name: string;
  platform: TemplatePlatform;
  language: string;
  category?: string;
  namespace?: string;
  body: string;
  variables: string[];
  parameterFormat?: 'POSITIONAL' | 'NAMED';
  header?: NormalizedTemplateHeader;
  actions?: string[];
  buttons?: NormalizedTemplateButton[];
  // Twilio media templates carry the media variable inside `types['twilio/media']`
  // rather than in a header component.
  isMediaTemplate?: boolean;
  mediaVariableKey?: string | null;
  templateMediaUrl?: string;
}

export interface TemplateButtonParam {
  type: 'url' | 'copy_code';
  parameter: string;
  url?: string;
  variables?: string[];
}

// WhatsApp payload shape: nested body/header/buttons.
export interface WhatsAppProcessedParams {
  body?: Record<string, string>;
  header?: {
    media_url: string;
    media_type: string;
    media_name?: string;
  };
  buttons?: TemplateButtonParam[];
}

// Twilio payload shape: a flat map keyed by variable token.
export type TwilioProcessedParams = Record<string, string>;

export interface TemplateSendParams {
  name: string;
  category?: string;
  language: string;
  namespace?: string;
  processed_params: WhatsAppProcessedParams | TwilioProcessedParams;
}

// Mutable form state collected by the in-conversation template form.
export interface TemplateFormState {
  // body variable values keyed by variable token
  bodyValues: Record<string, string>;
  // WhatsApp media header URL / Twilio media variable value
  mediaUrl: string;
  // WhatsApp document header filename (optional)
  mediaName: string;
  // WhatsApp button parameters keyed by button index
  buttonValues: Record<number, string>;
}
