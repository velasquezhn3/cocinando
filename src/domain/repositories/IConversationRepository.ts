export type MessageRole = 'user' | 'assistant' | 'system';

export interface Message {
  id: string;
  userId: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface IConversationRepository {
  appendMessage(
    userId: string,
    role: MessageRole,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<Message>;
  getHistory(userId: string, limit?: number): Promise<Message[]>;
  clearHistory(userId: string): Promise<void>;
  getLastMessage(userId: string): Promise<Message | null>;
}

