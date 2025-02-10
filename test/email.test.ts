import { getRecipients } from '../src';
import {
  MessageType,
  IncomingEmailMessage,
  OutgoingEmailMessage,
} from '../src/types/message';

const createIncomingEmail = ({
  from = [],
  cc = [],
  bcc = [],
}: {
  from?: string[];
  cc?: string[];
  bcc?: string[];
}) => {
  return {
    message_type: MessageType.INCOMING,
    content_attributes: {
      email: { from, cc, bcc },
    },
  } as IncomingEmailMessage;
};

const createOutgoingEmail = ({
  to = [],
  cc = [],
  bcc = [],
}: {
  to?: string[];
  cc?: string[];
  bcc?: string[];
}) => {
  return {
    message_type: MessageType.OUTGOING,
    content_attributes: {
      to_emails: to,
      cc_emails: cc,
      bcc_emails: bcc,
    },
  } as OutgoingEmailMessage;
};

describe('getRecipients', () => {
  const conversationContact = 'contact@example.com';
  const inboxEmail = 'inbox@example.com';
  const forwardToEmail = 'forwardto@example.com';

  describe('No Last Email', () => {
    test('should return empty arrays when lastEmail is null', () => {
      const result = getRecipients(
        null as any,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      expect(result.to).toEqual([]);
      expect(result.cc).toEqual([]);
      expect(result.bcc).toEqual([]);
    });

    test('should return empty arrays when lastEmail is undefined', () => {
      const result = getRecipients(
        undefined as any,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      expect(result.to).toEqual([]);
      expect(result.cc).toEqual([]);
      expect(result.bcc).toEqual([]);
    });
  });

  describe('Incoming Email', () => {
    describe('Single Recipient', () => {
      test('should add the sender to the "to" field', () => {
        const fromEmail = 'sender@example.com';
        const lastEmail = createIncomingEmail({ from: [fromEmail] });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.to).toEqual([fromEmail]);
      });
    });

    describe('Multiple Recipients', () => {
      test('should add all senders to the "to" field', () => {
        const fromEmails = ['sender1@example.com', 'sender2@example.com'];
        const lastEmail = createIncomingEmail({ from: fromEmails });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.to).toEqual(fromEmails);
      });
    });

    describe('Conversation Contact Handling', () => {
      test('should NOT add conversationContact to "cc" if they sent the last email', () => {
        const fromEmail = conversationContact;
        const lastEmail = createIncomingEmail({ from: [fromEmail] });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.cc).toEqual([]); // Should be empty because conversationContact is the sender
      });

      test('should add conversationContact to "cc" if they did NOT send the last email', () => {
        const fromEmail = 'sender@example.com';
        const lastEmail = createIncomingEmail({ from: [fromEmail] });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.cc).toContain(conversationContact); // Should contain conversationContact
      });
    });

    describe('CC Recipients', () => {
      test('should add emails in the "cc" field to the "cc" array', () => {
        const ccEmails = ['cc1@example.com', 'cc2@example.com'];
        const lastEmail = createIncomingEmail({
          from: ['sender@example.com'],
          cc: ccEmails,
        });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.cc).toEqual(expect.arrayContaining(ccEmails));
        expect(result.cc.length).toBeGreaterThanOrEqual(ccEmails.length); // Ensure we have at least the ccEmails
      });
    });

    describe('BCC Recipients', () => {
      test('should add emails in the "bcc" field to the "bcc" array', () => {
        const bccEmails = ['bcc1@example.com', 'bcc2@example.com'];
        const lastEmail = createIncomingEmail({
          from: ['sender@example.com'],
          bcc: bccEmails,
        });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.bcc).toEqual(expect.arrayContaining(bccEmails));
        expect(result.bcc.length).toBeGreaterThanOrEqual(bccEmails.length);
      });

      test('should remove conversationContact from "bcc" if present', () => {
        const bccEmails = ['bcc1@example.com', conversationContact];
        const lastEmail = createIncomingEmail({
          from: ['sender@example.com'],
          bcc: bccEmails,
        });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.bcc).not.toContain(conversationContact);
      });
    });

    describe('From is Null', () => {
      test('should not error when from is null', () => {
        // @ts-ignore
        const lastEmail = createIncomingEmail({ from: null });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.to).toEqual([]); // Should be empty since there's no sender
      });
    });
  });

  describe('Outgoing Email', () => {
    describe('Single Recipient', () => {
      test('should add the recipient to the "to" field', () => {
        const toEmail = 'recipient@example.com';
        const lastEmail = createOutgoingEmail({ to: [toEmail] });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.to).toEqual([toEmail]);
      });
    });

    describe('Multiple Recipients', () => {
      test('should add all recipients to the "to" field', () => {
        const toEmails = ['recipient1@example.com', 'recipient2@example.com'];
        const lastEmail = createOutgoingEmail({ to: toEmails });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.to).toEqual(toEmails);
      });
    });

    describe('CC Recipients', () => {
      test('should add emails in the "cc_emails" field to the "cc" array', () => {
        const ccEmails = ['cc1@example.com', 'cc2@example.com'];
        const lastEmail = createOutgoingEmail({
          to: ['recipient@example.com'],
          cc: ccEmails,
        });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.cc).toEqual(expect.arrayContaining(ccEmails));
        expect(result.cc.length).toBeGreaterThanOrEqual(ccEmails.length);
      });
    });

    describe('BCC Recipients', () => {
      test('should add emails in the "bcc_emails" field to the "bcc" array', () => {
        const bccEmails = ['bcc1@example.com', 'bcc2@example.com'];
        const lastEmail = createOutgoingEmail({
          to: ['recipient@example.com'],
          bcc: bccEmails,
        });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.bcc).toEqual(expect.arrayContaining(bccEmails));
        expect(result.bcc.length).toBeGreaterThanOrEqual(bccEmails.length);
      });

      test('should remove conversationContact from "bcc" if present', () => {
        const bccEmails = ['bcc1@example.com', conversationContact];
        const lastEmail = createOutgoingEmail({
          to: ['recipient@example.com'],
          bcc: bccEmails,
        });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.bcc).not.toContain(conversationContact);
      });
    });

    describe('To is Null', () => {
      test('should not error when to is null', () => {
        // @ts-ignore
        const lastEmail = createOutgoingEmail({ to: null });
        const result = getRecipients(
          lastEmail,
          conversationContact,
          inboxEmail,
          forwardToEmail
        );
        expect(result.to).toEqual([]); // Should be empty since there's no recipient
      });
    });
  });

  describe('Email Filtering', () => {
    test('should remove inboxEmail from "cc"', () => {});
    test('should remove forwardToEmail from "cc"', () => {});
    test('should remove emails matching the reply UUID pattern from "cc"', () => {});
  });

  describe('Deduplication', () => {
    test('should deduplicate emails in the "to" field', () => {});
    test('should deduplicate emails in the "cc" field', () => {});
    test('should deduplicate emails in the "bcc" field', () => {});
  });

  describe('Complex Scenarios', () => {
    test('should handle a complex scenario with multiple recipients, conversationContact, inboxEmail, and forwardToEmail correctly', () => {});
  });
});
