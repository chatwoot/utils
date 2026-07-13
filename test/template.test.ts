import {
  MEDIA_FORMATS,
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
} from '../src/template';
import {
  WhatsAppMessageTemplate,
  TwilioContentTemplate,
} from '../src/types/template';

const whatsAppTemplate = (
  overrides: Partial<WhatsAppMessageTemplate> = {}
): WhatsAppMessageTemplate => ({
  name: 'order_update',
  status: 'approved',
  category: 'MARKETING',
  language: 'en',
  components: [{ type: 'BODY', text: 'Hi {{1}}, your order {{2}} shipped.' }],
  ...overrides,
});

const twilioTemplate = (
  overrides: Partial<TwilioContentTemplate> = {}
): TwilioContentTemplate => ({
  content_sid: 'HX1',
  friendly_name: 'media_demo',
  language: 'en',
  status: 'approved',
  template_type: 'media',
  body: 'Hi {{1}}',
  types: { 'twilio/media': { media: ['https://x.com/{{2}}'] } },
  ...overrides,
});

describe('#processVariable / #extractVariables', () => {
  it('strips braces', () => {
    expect(processVariable('{{contact.name}}')).toBe('contact.name');
  });

  it('returns ordered, de-duplicated variable keys', () => {
    expect(
      extractVariables('Hi {{name}}, again {{name}} and {{ order }}')
    ).toEqual(['name', 'order']);
    expect(extractVariables('')).toEqual([]);
  });
});

describe('#renderTemplatePreview', () => {
  it('fills values and keeps placeholders for missing ones', () => {
    expect(
      renderTemplatePreview('Hi {{name}}, order {{id}}', { name: 'Sam' })
    ).toBe('Hi Sam, order {{id}}');
  });
});

describe('#findComponentByType', () => {
  it('finds a component by its type', () => {
    const template = whatsAppTemplate({
      components: [
        { type: 'HEADER', format: 'IMAGE' },
        { type: 'BODY', text: 'hi' },
      ],
    });
    expect(findComponentByType(template, 'HEADER')?.type).toBe('HEADER');
    expect(findComponentByType(template, 'BUTTONS')).toBeUndefined();
  });
});

describe('#isSendableTemplate', () => {
  it('accepts an approved, supported template (case-insensitive)', () => {
    expect(isSendableTemplate(whatsAppTemplate())).toBe(true);
    expect(isSendableTemplate(whatsAppTemplate({ status: 'APPROVED' }))).toBe(
      true
    );
  });

  it('rejects non-approved, authentication, csat and unsupported templates', () => {
    expect(isSendableTemplate(whatsAppTemplate({ status: 'PENDING' }))).toBe(
      false
    );
    expect(
      isSendableTemplate(whatsAppTemplate({ category: 'AUTHENTICATION' }))
    ).toBe(false);
    expect(
      isSendableTemplate(
        whatsAppTemplate({ name: 'customer_satisfaction_survey_1' })
      )
    ).toBe(false);
    expect(
      isSendableTemplate(
        whatsAppTemplate({
          components: [
            { type: 'HEADER', format: 'LOCATION' },
            { type: 'BODY', text: 'hi' },
          ],
        })
      )
    ).toBe(false);
  });
});

describe('#hasMediaHeader / #getMediaType / #isDocumentHeader', () => {
  it('detects media headers and their type', () => {
    const image = whatsAppTemplate({
      components: [
        { type: 'HEADER', format: 'IMAGE' },
        { type: 'BODY', text: 'hi' },
      ],
    });
    expect(MEDIA_FORMATS).toContain('IMAGE');
    expect(hasMediaHeader(image)).toBe(true);
    expect(getMediaType(image)).toBe('image');
    expect(isDocumentHeader(image)).toBe(false);

    const text = whatsAppTemplate({
      components: [
        { type: 'HEADER', format: 'TEXT', text: 'Hello' },
        { type: 'BODY', text: 'hi' },
      ],
    });
    expect(hasMediaHeader(text)).toBe(false);
  });

  it('flags document headers', () => {
    const doc = whatsAppTemplate({
      components: [
        { type: 'HEADER', format: 'DOCUMENT' },
        { type: 'BODY', text: 'hi' },
      ],
    });
    expect(isDocumentHeader(doc)).toBe(true);
  });
});

describe('#buildWhatsAppProcessedParams', () => {
  it('builds the empty scaffold with body, media header and sparse buttons', () => {
    const params = buildWhatsAppProcessedParams(
      whatsAppTemplate({
        components: [
          { type: 'HEADER', format: 'DOCUMENT' },
          { type: 'BODY', text: 'Hi {{1}}' },
          {
            type: 'BUTTONS',
            buttons: [
              { type: 'URL', text: 'Track', url: 'https://x.com/{{1}}' },
              { type: 'COPY_CODE', text: 'Copy' },
              { type: 'QUICK_REPLY', text: 'Yes' },
            ],
          },
        ],
      })
    );
    expect(params).toEqual({
      body: { '1': '' },
      header: { media_url: '', media_type: 'document', media_name: '' },
      buttons: [
        {
          type: 'url',
          parameter: '',
          url: 'https://x.com/{{1}}',
          variables: ['1'],
        },
        { type: 'copy_code', parameter: '' },
      ],
    });
  });

  it('returns an empty object when there is no body component', () => {
    expect(
      buildWhatsAppProcessedParams(whatsAppTemplate({ components: [] }))
    ).toEqual({});
  });
});

describe('#isWhatsAppComplete', () => {
  const template = whatsAppTemplate({
    components: [
      { type: 'HEADER', format: 'IMAGE' },
      { type: 'BODY', text: 'Hi {{1}}' },
      { type: 'BUTTONS', buttons: [{ type: 'COPY_CODE', text: 'Copy' }] },
    ],
  });

  it('requires body, media and button values', () => {
    const params = buildWhatsAppProcessedParams(template);
    expect(isWhatsAppComplete(template, params)).toBe(false);
    params.body!['1'] = 'Sam';
    params.header!.media_url = 'https://x.com/a.png';
    params.buttons![0].parameter = 'CODE';
    expect(isWhatsAppComplete(template, params)).toBe(true);
  });

  it('is complete when there are no variables and no media header', () => {
    const plain = whatsAppTemplate({
      components: [{ type: 'BODY', text: 'Thanks for reaching out.' }],
    });
    expect(isWhatsAppComplete(plain, buildWhatsAppProcessedParams(plain))).toBe(
      true
    );
  });
});

describe('twilio helpers', () => {
  it('identifies media templates and their media variable key', () => {
    const template = twilioTemplate();
    expect(isTwilioMediaTemplate(template)).toBe(true);
    expect(getTwilioMediaUrl(template)).toBe('https://x.com/{{2}}');
    expect(getTwilioMediaVariableKey(template)).toBe('2');
    expect(
      getTwilioMediaVariableKey(twilioTemplate({ template_type: 'text' }))
    ).toBeNull();
  });

  it('builds the empty processed_params for body + media variables', () => {
    expect(buildTwilioProcessedParams(twilioTemplate())).toEqual({
      '1': '',
      '2': '',
    });
  });

  it('validates completeness', () => {
    const template = twilioTemplate();
    const params = buildTwilioProcessedParams(template);
    expect(isTwilioComplete(template, params)).toBe(false);
    params['1'] = 'Sam';
    params['2'] = 'https://x.com/photo.png';
    expect(isTwilioComplete(template, params)).toBe(true);
  });

  it('is complete when there are no variables and no media', () => {
    const plain = twilioTemplate({
      template_type: 'text',
      body: 'hello',
      types: {},
    });
    expect(isTwilioComplete(plain, buildTwilioProcessedParams(plain))).toBe(
      true
    );
  });

  it('reduces the media variable value to a filename on send', () => {
    const template = twilioTemplate();
    const params = { '1': 'Sam', '2': 'https://x.com/path/photo.png?token=1' };
    expect(applyTwilioMediaFilename(template, params)).toEqual({
      '1': 'Sam',
      '2': 'photo.png',
    });
  });
});
