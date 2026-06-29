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
} from '../src/template';
import {
  NormalizedTemplate,
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

describe('#extractVariables', () => {
  it('returns ordered, de-duplicated variable keys', () => {
    expect(
      extractVariables('Hi {{name}}, again {{name}} and {{ order }}')
    ).toEqual(['name', 'order']);
  });

  it('returns an empty array for empty input', () => {
    expect(extractVariables('')).toEqual([]);
  });
});

describe('#renderTemplatePreview / #renderTemplateLabel', () => {
  it('fills provided values and keeps placeholders for missing ones', () => {
    expect(
      renderTemplatePreview('Hi {{name}}, order {{id}}', { name: 'Sam' })
    ).toBe('Hi Sam, order {{id}}');
  });

  it('renders labels with spaced braces', () => {
    expect(renderTemplateLabel('Hi {{name}}')).toBe('Hi { name }');
  });
});

describe('#buildPreviewSegments', () => {
  it('marks filled and unfilled segments', () => {
    expect(buildPreviewSegments('Hi {{name}}!', { name: 'Sam' })).toEqual([
      { text: 'Hi ', filled: false },
      { text: 'Sam', filled: true },
      { text: '!', filled: false },
    ]);
  });
});

describe('#isSendableTemplate', () => {
  it('accepts an approved, supported template', () => {
    expect(isSendableTemplate(whatsAppTemplate())).toBe(true);
  });

  it('rejects non-approved templates (case-insensitive)', () => {
    expect(isSendableTemplate(whatsAppTemplate({ status: 'PENDING' }))).toBe(
      false
    );
    expect(isSendableTemplate(whatsAppTemplate({ status: 'APPROVED' }))).toBe(
      true
    );
  });

  it('rejects authentication, csat, and unsupported components', () => {
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

describe('#normalizeWhatsApp', () => {
  it('extracts body, header, actions and button params', () => {
    const normalized = normalizeWhatsApp(
      whatsAppTemplate({
        components: [
          { type: 'HEADER', format: 'IMAGE' },
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
    expect(normalized.body).toBe('Hi {{1}}');
    expect(normalized.variables).toEqual(['1']);
    expect(hasMediaHeader(normalized)).toBe(true);
    expect(getMediaType(normalized)).toBe('image');
    expect(getHeaderSubtitle(normalized)).toBe('Image Header');
    expect(normalized.actions).toEqual(['Track', 'Copy', 'Yes']);
    expect(normalized.buttons).toEqual([
      { index: 0, type: 'url', url: 'https://x.com/{{1}}', variables: ['1'] },
      { index: 1, type: 'copy_code' },
    ]);
  });
});

describe('#normalizeTwilio', () => {
  const twilio: TwilioContentTemplate = {
    contentSid: 'HX1',
    friendlyName: 'media_demo',
    language: 'en',
    status: 'approved',
    templateType: 'media',
    body: 'Hi {{1}}',
    types: { 'twilio/media': { media: ['https://x.com/{{2}}'] } },
  };

  it('returns null for non-approved templates (case-sensitive)', () => {
    expect(normalizeTwilio({ ...twilio, status: 'Approved' })).toBeNull();
  });

  it('extracts media variable key for media templates', () => {
    const normalized = normalizeTwilio(twilio)!;
    expect(normalized.isMediaTemplate).toBe(true);
    expect(normalized.mediaVariableKey).toBe('2');
    expect(normalized.templateMediaUrl).toBe('https://x.com/{{2}}');
  });
});

describe('#getTemplates / #filterTemplatesByQuery', () => {
  it('combines sendable whatsapp and approved twilio templates', () => {
    const templates = getTemplates(
      [whatsAppTemplate(), whatsAppTemplate({ status: 'pending' })],
      [
        {
          contentSid: 'HX1',
          friendlyName: 'twilio_one',
          language: 'en',
          status: 'approved',
          body: 'hi',
        },
      ]
    );
    expect(templates.map(t => t.name)).toEqual(['order_update', 'twilio_one']);
    expect(filterTemplatesByQuery(templates, 'twilio')).toHaveLength(1);
    expect(filterTemplatesByQuery(templates, '')).toHaveLength(2);
  });
});

describe('#isTemplateComplete', () => {
  it('requires body, media and button inputs for whatsapp', () => {
    const template: NormalizedTemplate = {
      id: 'a',
      name: 'a',
      platform: 'whatsapp',
      language: 'en',
      body: 'Hi {{1}}',
      variables: ['1'],
      header: { format: 'IMAGE' },
      buttons: [{ index: 0, type: 'copy_code' }],
    };
    const state = createEmptyFormState();
    expect(isTemplateComplete(template, state)).toBe(false);
    state.bodyValues['1'] = 'Sam';
    state.mediaUrl = 'https://x.com/a.png';
    state.buttonValues[0] = 'CODE';
    expect(isTemplateComplete(template, state)).toBe(true);
  });

  it('is complete when twilio has no variables and no media', () => {
    const template: NormalizedTemplate = {
      id: 'b',
      name: 'b',
      platform: 'twilio',
      language: 'en',
      body: 'hello',
      variables: [],
    };
    expect(isTemplateComplete(template, createEmptyFormState())).toBe(true);
  });
});

describe('#buildTemplateParams / #buildTemplateSendPayload', () => {
  it('builds nested whatsapp processed params with sparse buttons', () => {
    const template: NormalizedTemplate = {
      id: 'a',
      name: 'order_update',
      platform: 'whatsapp',
      language: 'en',
      category: 'MARKETING',
      namespace: 'ns',
      body: 'Hi {{1}}',
      variables: ['1'],
      header: { format: 'DOCUMENT' },
      buttons: [
        { index: 1, type: 'url', url: 'https://x.com/{{1}}', variables: ['1'] },
      ],
    };
    const state = createEmptyFormState();
    state.bodyValues['1'] = 'Sam';
    state.mediaUrl = 'https://x.com/invoice.pdf';
    state.mediaName = 'invoice.pdf';
    state.buttonValues[1] = 'TRACK';

    const params = buildTemplateParams(template, state);
    expect(params).toEqual({
      name: 'order_update',
      category: 'MARKETING',
      language: 'en',
      namespace: 'ns',
      processed_params: {
        body: { '1': 'Sam' },
        header: {
          media_url: 'https://x.com/invoice.pdf',
          media_type: 'document',
          media_name: 'invoice.pdf',
        },
        buttons: [
          undefined,
          {
            type: 'url',
            parameter: 'TRACK',
            url: 'https://x.com/{{1}}',
            variables: ['1'],
          },
        ],
      },
    });
    expect(isDocumentHeader(template)).toBe(true);
  });

  it('builds flat twilio params and resolves media filename', () => {
    const template: NormalizedTemplate = {
      id: 'b',
      name: 'media_demo',
      platform: 'twilio',
      language: 'en',
      body: 'Hi {{1}}',
      variables: ['1'],
      isMediaTemplate: true,
      mediaVariableKey: '2',
    };
    const state = createEmptyFormState();
    state.bodyValues['1'] = 'Sam';
    state.mediaUrl = 'https://x.com/path/photo.png?token=1';

    const payload = buildTemplateSendPayload(template, state);
    expect(payload.message).toBe('Hi Sam');
    expect(payload.templateParams.processed_params).toEqual({
      '1': 'Sam',
      '2': 'photo.png',
    });
  });
});

describe('#renderTemplateMessage', () => {
  it('injects twilio media url into the rendered message', () => {
    const template: NormalizedTemplate = {
      id: 'b',
      name: 'b',
      platform: 'twilio',
      language: 'en',
      body: 'See {{2}}',
      variables: [],
      mediaVariableKey: '2',
    };
    const state = createEmptyFormState();
    state.mediaUrl = 'https://x.com/a.png';
    expect(renderTemplateMessage(template, state)).toBe(
      'See https://x.com/a.png'
    );
  });
});
