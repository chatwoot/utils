import { EmailMessage, MessageType } from './types/message';

/**
 * Determines the recipients for an email reply based on the last email message's details,
 * the conversation contact, and system-specific email addresses.
 */
export function getRecipients(
  lastEmail: EmailMessage,
  conversationContact: string,
  inboxEmail: string,
  forwardToEmail: string
) {
  let to = [] as string[];
  let cc = [] as string[];
  let bcc = [] as string[];

  // Reset emails if there's no lastEmail
  if (!lastEmail) {
    return { to, cc, bcc };
  }

  // Extract values from lastEmail and current conversation context
  const {
    content_attributes: { email: emailAttributes },
    message_type: messageType,
  } = lastEmail;

  let isLastEmailFromContact = false;
  if (emailAttributes) {
    // this will be false anyway if the last email was outgoing
    isLastEmailFromContact = (emailAttributes.from ?? []).includes(
      conversationContact
    );

    if (messageType === MessageType.INCOMING) {
      // Reply to sender if incoming
      to.push(...(emailAttributes.from ?? []));
    } else {
      // Otherwise, reply to the last recipient (for outgoing message)
      to.push(...(emailAttributes.to ?? []));
    }

    // Start building the cc list, including additional recipients
    // If the email had multiple recipients, include them in the cc list
    cc = emailAttributes.cc ? [...emailAttributes.cc] : [];
    if (Array.isArray(emailAttributes.to)) {
      cc.push(...emailAttributes.to);
    }

    // Add the conversation contact to cc if the last email wasn't sent by them
    if (!isLastEmailFromContact) {
      cc.push(conversationContact);
    }

    // Process BCC: Remove conversation contact from bcc as it is already in cc
    bcc = (emailAttributes.bcc || []).filter(
      emailAddress => emailAddress !== conversationContact
    );
  }

  // Filter out undesired emails from cc:
  // - Remove conversation contact from cc if they sent the last email
  // - Remove inbox and forward-to email to prevent loops
  // - Remove emails matching the reply UUID pattern
  const replyUUIDPattern = /^reply\+([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
  cc = cc.filter(email => {
    if (email === conversationContact && isLastEmailFromContact) {
      return false;
    }
    if (email === inboxEmail || email === forwardToEmail) {
      return false;
    }
    if (replyUUIDPattern.test(email)) {
      return false;
    }
    return true;
  });

  // Deduplicate each recipient list by converting to a Set then back to an array
  to = Array.from(new Set(to));
  cc = Array.from(new Set(cc));
  bcc = Array.from(new Set(bcc));

  return {
    to,
    cc,
    bcc,
  };
}
