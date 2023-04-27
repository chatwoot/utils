import { Conversation, Sender, Variables } from './types/conversation';
const MESSAGE_VARIABLES_REGEX = /{{(.*?)}}/g;

const skipCodeBlocks = (str: string) => str.replace(/```(?:.|\n)+?```/g, '');

export const capitalizeName = (name: string) => {
  return name.replace(/\b(\w)/g, s => s.toUpperCase());
};

export const getFirstName = ({ user }: { user: Sender }) => {
  const firstName = user?.name ? user.name.split(' ').shift() : '';
  return capitalizeName(firstName as string);
};

export const getLastName = ({ user }: { user: Sender }) => {
  if (user && user.name) {
    const lastName =
      user.name.split(' ').length > 1 ? user.name.split(' ').pop() : '';
    return capitalizeName(lastName as string);
  }
  return '';
};

export const getMessageVariables = ({
  conversation,
}: {
  conversation: Conversation;
}) => {
  const {
    meta: { assignee, sender },
    id,
  } = conversation;

  return {
    'contact.name': capitalizeName(sender?.name || ''),
    'contact.first_name': getFirstName({ user: sender }),
    'contact.last_name': getLastName({ user: sender }),
    'contact.email': sender?.email,
    'contact.phone': sender?.phone_number,
    'contact.id': sender?.id,
    'conversation.id': id,
    'agent.name': capitalizeName(assignee?.name || ''),
    'agent.first_name': getFirstName({ user: assignee }),
    'agent.last_name': getLastName({ user: assignee }),
    'agent.email': assignee?.email ?? '',
  };
};

export const replaceVariablesInMessage = ({
  message,
  variables,
}: {
  message: string;
  variables: Variables;
}) => {
  // @ts-ignore
  return message.replace(MESSAGE_VARIABLES_REGEX, (_, replace) => {
    return variables[replace.trim()]
      ? variables[replace.trim().toLowerCase()]
      : '';
  });
};

export const getUndefinedVariablesInMessage = ({
  message,
  variables,
}: {
  message: string;
  variables: Variables;
}) => {
  const messageWithOutCodeBlocks = skipCodeBlocks(message);
  const matches = messageWithOutCodeBlocks.match(MESSAGE_VARIABLES_REGEX);
  if (!matches) return [];

  return matches
    .map(match => {
      return match
        .replace('{{', '')
        .replace('}}', '')
        .trim();
    })
    .filter(variable => {
      return !variables[variable];
    });
};
