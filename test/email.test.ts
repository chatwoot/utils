import { getRecipients } from '../src';
import {
  MessageType,
  IncomingEmailMessage,
  OutgoingEmailMessage,
} from '../src/types/message';

describe('getRecipients', () => {
  const conversationContact = 'contact@example.com';
  const inboxEmail = 'inbox@example.com';
  const forwardToEmail = 'forward@example.com';

  const createIncomingEmail = ({
    emailAttributes,
  }: {
    emailAttributes: Record<string, any>;
  }) => {
    return {
      message_type: MessageType.INCOMING,
      content_attributes: {
        email: emailAttributes,
      },
    } as IncomingEmailMessage;
  };

  const createOutgoingEmail = ({
    to,
    cc,
    bcc,
  }: {
    to?: string[];
    cc?: string[];
    bcc?: string[];
  }) => {
    return {
      message_type: MessageType.OUTGOING,
      content_attributes: {
        to_emails: to || [],
        cc_emails: cc || [],
        bcc_emails: bcc || [],
      },
    } as OutgoingEmailMessage;
  };

  const replyUUIDEmail =
    'reply+123e4567-e89b-12d3-a456-426614174000@example.com';

  test('should return empty recipients when no lastEmail is provided', () => {
    const result = getRecipients(
      // @ts-ignore
      null,
      conversationContact,
      inboxEmail,
      forwardToEmail
    );
    expect(result).toEqual({ to: [], cc: [], bcc: [] });
  });

  describe('Incoming messages', () => {
    test('should reply to sender if incoming and add conversation contact to CC when sender is different', () => {
      const emailAttributes = {
        from: ['sender@example.com'],
        to: ['recipient1@example.com'],
        cc: ['cc1@example.com'],
        bcc: ['bcc1@example.com', conversationContact],
      };

      const lastEmail = createIncomingEmail({
        emailAttributes,
      });

      const result = getRecipients(
        lastEmail,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      // "to" list should include sender
      expect(result.to).toEqual(['sender@example.com']);
      // "cc" list: original cc plus conversationContact (since not sender)
      expect(new Set(result.cc)).toEqual(
        new Set([
          'cc1@example.com',
          conversationContact,
        ])
      );
      // "bcc" list: conversationContact filtered out plus any other
      expect(result.bcc).toEqual(['bcc1@example.com']);
    });

    test('should not add conversation contact to CC if sender is the conversation contact', () => {
      const emailAttributes = {
        from: [conversationContact],
        to: ['contact@example.com'], // also same as conversationContact added in cc below
        cc: ['ccFromEmail@example.com'],
        bcc: ['bcc1@example.com'],
      };

      const lastEmail = createIncomingEmail({
        emailAttributes,
      });

      const result = getRecipients(
        lastEmail,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      // To should be conversationContact (reply to sender)
      expect(result.to).toEqual([conversationContact]);
      // CC should only include those from cc but not conversationContact since it was sender
      expect(result.cc).toEqual(['ccFromEmail@example.com']);
      // BCC remains filtered, conversationContact is not present
      expect(result.bcc).toEqual(['bcc1@example.com']);
    });
  });

  describe('Outgoing messages', () => {
    test('should reply to last recipient if outgoing and add conversation contact to CC', () => {
      const lastEmail = createOutgoingEmail({
        to: ['recipient2@example.com'],
        cc: ['cc2@example.com'],
        bcc: ['bcc2@example.com', conversationContact],
      });

      const result = getRecipients(
        lastEmail,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      // "to" should include the last recipient
      expect(result.to).toEqual(['recipient2@example.com']);
      // "cc" should include original cc, emailAttributes.to and the conversation contact (since not sender)
      expect(new Set(result.cc)).toEqual(
        new Set([
          'cc2@example.com',
          'recipient2@example.com',
          conversationContact,
        ])
      );
      // Bcc: conversation contact removed
      expect(result.bcc).toEqual(['bcc2@example.com']);
    });
  });

  describe('Filtering logic', () => {
    test('should remove inbox and forward emails from cc', () => {
      const emailAttributes = {
        from: ['someone@example.com'],
        to: ['target@example.com'],
        cc: [inboxEmail, forwardToEmail, 'keep@example.com'],
      };

      const lastEmail = createIncomingEmail({
        emailAttributes,
      });

      const result = getRecipients(
        lastEmail,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      // cc should filter out inboxEmail and forwardToEmail, but includes conversation contact.
      expect(new Set(result.cc)).toEqual(
        new Set([
          'keep@example.com',
          conversationContact,
        ])
      );
    });

    test('should remove emails matching replyUUID pattern from cc', () => {
      const emailAttributes = {
        from: ['someone@example.com'],
        to: ['target@example.com'],
        cc: [replyUUIDEmail, 'valid@example.com'],
      };

      const lastEmail = createIncomingEmail({
        emailAttributes,
      });

      const result = getRecipients(
        lastEmail,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      // replyUUIDEmail should be removed from cc.
      expect(result.cc).toEqual(
        expect.arrayContaining([
          'valid@example.com',
          conversationContact,
        ])
      );
      expect(result.cc).not.toContain(replyUUIDEmail);
    });

    test('should deduplicate email addresses across each recipient list', () => {
      const emailAttributes = {
        from: [conversationContact, conversationContact],
        to: ['dup@example.com', 'dup@example.com'],
        cc: ['dupCc@example.com', 'dupCc@example.com'],
        bcc: ['dupBcc@example.com', conversationContact, 'dupBcc@example.com'],
      };

      const lastEmail = createIncomingEmail({
        emailAttributes,
      });

      const result = getRecipients(
        lastEmail,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      // "to" deduped
      expect(result.to).toEqual([conversationContact]);
      // "cc": conversation contact is removed since it was the sender; also deduplicated
      expect(result.cc).toEqual(['dupCc@example.com']);
      // "bcc": deduplicated and conversation contact filtered out
      expect(result.bcc).toEqual(['dupBcc@example.com']);
    });
  });

  describe('Edge Cases', () => {
    test('should handle missing email attributes gracefully', () => {
      const lastEmail = createIncomingEmail({
        // @ts-ignore
        emailAttributes: undefined,
      });

      const result = getRecipients(
        lastEmail,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      // When email attributes are missing, conversation contact is added to cc
      expect(result).toEqual({ to: [], cc: [conversationContact], bcc: [] });
    });

    test('should handle when arrays are undefined in emailAttributes', () => {
      const emailAttributes = {
        from: undefined,
        to: undefined,
        cc: undefined,
        bcc: undefined,
      };

      const lastEmail = createIncomingEmail({
        emailAttributes,
      });

      const result = getRecipients(
        lastEmail,
        conversationContact,
        inboxEmail,
        forwardToEmail
      );
      // No recipients are provided so “to” list is empty; however, conversation contact is added to cc.
      expect(result.to).toEqual([]);
      expect(result.cc).toEqual([conversationContact]);
      expect(result.bcc).toEqual([]);
    });
  });
});
