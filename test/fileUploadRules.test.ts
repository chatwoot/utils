import {
  INBOX_TYPES,
  getAllowedFileTypesByChannel,
  getMaxUploadSizeByChannel,
} from '../src/fileUploadRules';

describe('uploadRules helper', () => {
  describe('getAllowedFileTypesByChannel', () => {
    it('returns default accept list when no params are provided', () => {
      const accept = getAllowedFileTypesByChannel();
      expect(typeof accept).toBe('string');
      expect(accept).toContain('image/*');
      expect(accept).toContain('audio/*');
      expect(accept).toContain('video/*');
      expect(accept).toContain('text/plain');
      expect(accept).toContain('application/json');
      expect(accept).toContain('.3gpp');
    });

    it('returns WhatsApp specific accept list', () => {
      const accept = getAllowedFileTypesByChannel({
        channelType: INBOX_TYPES.WHATSAPP,
      });
      expect(accept).toContain('image/jpeg');
      expect(accept).toContain('image/png');
      expect(accept).toContain('video/3gp');
      expect(accept).toContain('video/mp4');
      expect(accept).toContain('audio/aac');
      expect(accept).toContain('text/plain');
      expect(accept).toContain('application/pdf');

      expect(accept).not.toContain('image/*');
      expect(accept).not.toContain('application/json');
      expect(accept).not.toContain('.3gpp');
      expect(accept).not.toContain('image/gif');
    });

    it('returns Instagram specific accept list', () => {
      const accept = getAllowedFileTypesByChannel({
        channelType: INBOX_TYPES.INSTAGRAM,
      });
      expect(accept).toContain('image/png');
      expect(accept).toContain('image/jpeg');
      expect(accept).toContain('image/gif');
      expect(accept).toContain('video/mp4');
      expect(accept).toContain('video/webm');
      expect(accept).toContain('audio/mp4');
    });

    it('returns Line specific accept list', () => {
      const accept = getAllowedFileTypesByChannel({
        channelType: INBOX_TYPES.LINE,
      });
      expect(accept).toContain('image/png');
      expect(accept).toContain('image/jpeg');
      expect(accept).toContain('video/mp4');

      expect(accept).not.toContain('application/pdf');
    });

    it('returns Twilio WhatsApp accept list', () => {
      const accept = getAllowedFileTypesByChannel({
        channelType: INBOX_TYPES.TWILIO,
        medium: 'whatsapp',
      });
      expect(accept).toContain('image/png');
      expect(accept).toContain('image/jpeg');
      expect(accept).toContain('video/mp4');
      expect(accept).toContain('audio/ogg');
      expect(accept).toContain('audio/opus');
      expect(accept).toContain('application/pdf');

      expect(accept).not.toContain('audio/mp3');
    });

    it('falls back to default accept list for Twilio SMS (no mimeGroups)', () => {
      const accept = getAllowedFileTypesByChannel({
        channelType: INBOX_TYPES.TWILIO,
        medium: 'sms',
      });
      expect(accept).toContain('image/*');
      expect(accept).toContain('.3gpp');
    });

    it('handles empty object parameter', () => {
      const accept = getAllowedFileTypesByChannel({});
      expect(accept).toContain('image/*');
      expect(accept).toContain('.3gpp');
    });
  });

  describe('getMaxUploadSizeByChannel', () => {
    it('returns default max (40MB) when no params are provided', () => {
      expect(getMaxUploadSizeByChannel()).toBe(40);
    });

    it('returns default max (40MB) for default channel and any mime', () => {
      expect(getMaxUploadSizeByChannel({ mime: 'image/png' })).toBe(40);
    });

    it('returns WhatsApp category-specific limits', () => {
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: 'image/png',
        })
      ).toBe(5);
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: 'video/mp4',
        })
      ).toBe(16);
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: 'audio/ogg',
        })
      ).toBe(16);
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: 'application/pdf',
        })
      ).toBe(100);
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: 'text/plain',
        })
      ).toBe(100);
    });

    it('returns Instagram category-specific limits', () => {
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.INSTAGRAM,
          mime: 'image/jpeg',
        })
      ).toBe(16);
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.INSTAGRAM,
          mime: 'video/mp4',
        })
      ).toBe(25);
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.INSTAGRAM,
          mime: 'audio/wav',
        })
      ).toBe(25);
    });

    it('returns Line image limit and falls back to default for video', () => {
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.LINE,
          mime: 'image/png',
        })
      ).toBe(10);
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.LINE,
          mime: 'video/mp4',
        })
      ).toBe(40); // fallback to default max
    });

    it('returns Twilio WhatsApp node max (5MB) for any category', () => {
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.TWILIO,
          medium: 'whatsapp',
          mime: 'image/png',
        })
      ).toBe(5);
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.TWILIO,
          medium: 'whatsapp',
          mime: 'application/pdf',
        })
      ).toBe(5);
    });

    it('returns Twilio SMS node max (5MB) when medium is sms', () => {
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.TWILIO,
          medium: 'sms',
        })
      ).toBe(5);
    });

    it('handles invalid MIME types gracefully', () => {
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: 'invalid',
        })
      ).toBe(40);

      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: '',
        })
      ).toBe(40);

      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: undefined,
        })
      ).toBe(40);
    });

    it('handles unknown MIME type categories', () => {
      expect(
        getMaxUploadSizeByChannel({
          channelType: INBOX_TYPES.WHATSAPP,
          mime: 'unknown/type',
        })
      ).toBe(40); // 'unknown' is not in DOC_HEADS, so category is 'unknown', falls back to default
    });

    it('handles empty object parameter', () => {
      expect(getMaxUploadSizeByChannel({})).toBe(40);
    });
  });
});
