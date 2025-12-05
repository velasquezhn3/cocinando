import { IConversationRepository, Message as DomainMessage, MessageRole } from '../../domain/repositories/IConversationRepository';
import { Conversation, MessageRecord } from '../../domain/entities/Conversation';
import { v4 as uuidv4 } from 'uuid';

export class InMemoryConversationRepository implements IConversationRepository {
  private store: Map<string, Conversation> = new Map();

  // Append a message and return the created domain Message
  async appendMessage(
    userId: string,
    role: MessageRole,
    content: string,
    metadata?: Record<string, unknown>
  ): Promise<DomainMessage> {
    const nowIso = new Date().toISOString();
    const rec: MessageRecord = { id: uuidv4(), role: role as any, content, timestamp: nowIso };
    const conv = this.store.get(userId) ?? { userId, messages: [], lastInteraction: nowIso };
    conv.messages.push(rec);
    conv.lastInteraction = nowIso;
    this.store.set(userId, conv);

    return {
      id: rec.id,
      userId,
      role: rec.role as MessageRole,
      content: rec.content,
      timestamp: new Date(rec.timestamp),
      metadata
    };
  }

  async getHistory(userId: string, limit?: number): Promise<DomainMessage[]> {
    const conv = this.store.get(userId);
    if (!conv) return [];
    const slice = limit ? conv.messages.slice(-limit) : conv.messages;
    return slice.map(m => ({
      id: m.id,
      userId: conv.userId,
      role: m.role as MessageRole,
      content: m.content,
      timestamp: new Date(m.timestamp)
    }));
  }

  async getLastMessage(userId: string): Promise<DomainMessage | null> {
    const conv = this.store.get(userId);
    if (!conv || conv.messages.length === 0) return null;
    const m = conv.messages[conv.messages.length - 1];
    return {
      id: m.id,
      userId: conv.userId,
      role: m.role as MessageRole,
      content: m.content,
      timestamp: new Date(m.timestamp)
    };
  }

  async clearHistory(userId: string): Promise<void> {
    this.store.delete(userId);
  }
}
