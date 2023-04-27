export interface Conversation {
  meta: Meta;
  id: number;
}

export interface Meta {
  assignee: Assignee;
  sender: Sender;
}

export interface Sender {
  id: number;
  email?: string;
  name?: string;
  phone_number?: string;
}

export interface Assignee {
  id: number;
  email?: string;
  name?: string;
  phone_number?: string;
}
