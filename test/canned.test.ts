import {
  getFirstName,
  getLastName,
  getMessageVariables,
  capitalizeName,
  replaceVariablesInMessage,
  getUndefinedVariablesInMessage,
} from '../src/canned';

const variables = {
  'contact.name': 'John Doe',
  'contact.first_name': 'John',
  'contact.last_name': 'Doe',
  'contact.email': 'john.p@example.com',
  'contact.phone': '1234567890',
  'conversation.id': 1,
  'conversation.code': 'CW123',
  'inbox.id': 1,
  'inbox.name': 'Inbox 1',
  'agent.first_name': 'Samuel',
  'agent.last_name': 'Smith',
  'agent.email': 'samuel@gmail.com',
  'contact.custom_attribute.cloud_customer': false,
};

describe('#replaceVariablesInMessage', () => {
  it('returns the message with variable name', () => {
    const message =
      'No issues. Hey {{contact.first_name}}, we will send the reset instructions to your email {{ contact.email}}. The {{ agent.first_name }} {{ agent.last_name }} will take care of everything. Your conversation id is {{ conversation.id }}.';
    expect(replaceVariablesInMessage({ message, variables })).toBe(
      'No issues. Hey John, we will send the reset instructions to your email john.p@example.com. The Samuel Smith will take care of everything. Your conversation id is 1.'
    );
  });

  it('returns the message with variable name having white space', () => {
    const message = 'hey {{contact.name}} how may I help you?';
    expect(replaceVariablesInMessage({ message, variables })).toBe(
      'hey John Doe how may I help you?'
    );
  });

  it('returns the message with variable email', () => {
    const message =
      'No issues. We will send the reset instructions to your email at {{contact.email}}';
    expect(replaceVariablesInMessage({ message, variables })).toBe(
      'No issues. We will send the reset instructions to your email at john.p@example.com'
    );
  });

  it('returns the message with multiple variables', () => {
    const message =
      'hey {{ contact.name }}, no issues. We will send the reset instructions to your email at {{contact.email}}';
    expect(replaceVariablesInMessage({ message, variables })).toBe(
      'hey John Doe, no issues. We will send the reset instructions to your email at john.p@example.com'
    );
  });

  it('returns the message with inbox name', () => {
    const message = 'Welcome to {{inbox.name}}';
    expect(replaceVariablesInMessage({ message, variables })).toBe(
      'Welcome to Inbox 1'
    );
  });

  it('returns the message if the variable is not present in variables', () => {
    const message = 'Please dm me at {{contact.twitter}}';
    expect(replaceVariablesInMessage({ message, variables })).toBe(
      'Please dm me at '
    );
  });
});

describe('#getFirstName', () => {
  it('returns the first name of the contact', () => {
    const assignee = { id: 1, name: 'John Doe' };
    expect(getFirstName({ user: assignee })).toBe('John');
  });

  it('returns the first name of the contact with multiple names', () => {
    const assignee = { id: 1, name: 'John Doe Smith' };
    expect(getFirstName({ user: assignee })).toBe('John');
  });
});

describe('#getLastName', () => {
  it('returns the last name of the contact', () => {
    const assignee = { id: 1, name: 'John Doe' };
    expect(getLastName({ user: assignee })).toBe('Doe');
  });

  it('returns the last name of the contact with multiple names', () => {
    const assignee = { id: 1, name: 'John Doe Smith' };
    expect(getLastName({ user: assignee })).toBe('Smith');
  });
});

describe('#getMessageVariables', () => {
  it('returns the variables', () => {
    const conversation = {
      meta: {
        assignee: {
          id: 1,
          name: 'samuel Smith',
          email: 'samuel@example.com',
          phone_number: '1234567890',
        },
        sender: {
          id: 3,
          name: 'john Doe',
          email: 'john.doe@gmail.com',
          phone_number: '1234567890',
        },
      },
      id: 1,
      code: 'CW123',
      custom_attributes: {
        car_model: 'Tesla Model S',
        car_year: '2022',
      },
      first_reply_created_at: 0,
      waiting_since: 0,
      status: 'open',
    };
    const contact = {
      id: 3,
      name: 'john Doe',
      email: 'john.doe@gmail.com',
      phone_number: '1234567890',
      custom_attributes: { priority: 'high' },
    };
    const inbox = {
      id: 1,
      name: 'Inbox 1',
    };

    expect(getMessageVariables({ conversation, contact, inbox })).toEqual({
      'contact.name': 'John Doe',
      'contact.first_name': 'John',
      'contact.id': 3,
      'contact.last_name': 'Doe',
      'contact.email': 'john.doe@gmail.com',
      'contact.phone': '1234567890',
      'conversation.id': 1,
      'inbox.id': 1,
      'inbox.name': 'Inbox 1',
      'agent.name': 'Samuel Smith',
      'agent.first_name': 'Samuel',
      'agent.last_name': 'Smith',
      'agent.email': 'samuel@example.com',
      'contact.custom_attribute.priority': 'high',
      'conversation.custom_attribute.car_model': 'Tesla Model S',
      'conversation.custom_attribute.car_year': '2022',
    });
  });
});

describe('#getUndefinedVariablesInMessage', () => {
  it('returns the undefined variables', () => {
    const message =
      'It seems like you are facing issues with {{contact.integration}}, the cloud customer is {{contact.custom_attribute.cloud_customer}}';
    expect(
      getUndefinedVariablesInMessage({ message, variables }).length
    ).toEqual(1);
    expect(getUndefinedVariablesInMessage({ message, variables })).toEqual(
      expect.arrayContaining(['contact.integration'])
    );
  });
  it('skip variables in string with code blocks', () => {
    const message =
      'hey {{contact_name}} how are you? ``` code: {{contact_name}} ```';
    const undefinedVariables = getUndefinedVariablesInMessage({
      message,
      variables,
    });
    expect(undefinedVariables.length).toEqual(1);
    expect(undefinedVariables).toEqual(
      expect.arrayContaining(['contact_name'])
    );
  });
});

describe('#capitalizeName', () => {
  it('capitalize name if name is passed', () => {
    const string = 'john peter';
    expect(capitalizeName(string)).toBe('John Peter');
  });
  it('capitalize first name if full name is passed', () => {
    const string = 'john Doe';
    expect(capitalizeName(string)).toBe('John Doe');
  });
  it('returns empty string if the string is empty', () => {
    const string = '';
    expect(capitalizeName(string)).toBe('');
  });
  it('capitalize last name if last name is passed', () => {
    const string = 'john doe';
    expect(capitalizeName(string)).toBe('John Doe');
  });
  it('capitalize first name if first name is passed', () => {
    const string = 'john';
    expect(capitalizeName(string)).toBe('John');
  });
  it('capitalize last name if last name is passed', () => {
    const string = 'doe';
    expect(capitalizeName(string)).toBe('Doe');
  });
  it('returns empty string if the name is null', () => {
    expect(capitalizeName(null)).toBe('');
  });
  it('correctly handles names with accented characters', () => {
    const accentedName1 = 'aríel';
    const accentedName2 = 'josé maría';
    const accentedName3 = 'françois';

    expect(capitalizeName(accentedName1)).toBe('Aríel');
    expect(capitalizeName(accentedName2)).toBe('José María');
    expect(capitalizeName(accentedName3)).toBe('François');
  });
});
