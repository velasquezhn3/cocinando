export interface MessageRecord {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface Conversation {
  userId: string;
  messages: MessageRecord[];
  lastInteraction: string;
}
