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
    test('should return empty arrays when lastEmail is null', () => {});
    test('should return empty arrays when lastEmail is undefined', () => {});
  });

  describe('Incoming Email', () => {
    describe('Single Recipient', () => {
      test('should add the sender to the "to" field', () => {});
    });

    describe('Multiple Recipients', () => {
      test('should add all senders to the "to" field', () => {});
    });

    describe('Conversation Contact Handling', () => {
      test('should NOT add conversationContact to "cc" if they sent the last email', () => {});
      test('should add conversationContact to "cc" if they did NOT send the last email', () => {});
    });

    describe('CC Recipients', () => {
      test('should add emails in the "cc" field to the "cc" array', () => {});
    });

    describe('BCC Recipients', () => {
      test('should add emails in the "bcc" field to the "bcc" array', () => {});
      test('should remove conversationContact from "bcc" if present', () => {});
    });

    describe('From is Null', () => {
      test('should not error when from is null', () => {});
    });
  });

  describe('Outgoing Email', () => {
    describe('Single Recipient', () => {
      test('should add the recipient to the "to" field', () => {});
    });

    describe('Multiple Recipients', () => {
      test('should add all recipients to the "to" field', () => {});
    });

    describe('CC Recipients', () => {
      test('should add emails in the "cc_emails" field to the "cc" array', () => {});
    });

    describe('BCC Recipients', () => {
      test('should add emails in the "bcc_emails" field to the "bcc" array', () => {});
      test('should remove conversationContact from "bcc" if present', () => {});
    });

    describe('To is Null', () => {
      test('should not error when to is null', () => {});
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
