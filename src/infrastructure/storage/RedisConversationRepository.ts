import { IConversationRepository, Message as DomainMessage, MessageRole } from '../../domain/repositories/IConversationRepository';
import { Conversation } from '../../domain/entities/Conversation';
import Redis from 'ioredis';

/**
 * Redis-backed Conversation repository.
 * Stores each conversation as a JSON value under key `conv:{userId}`.
 * Simple and safe for moderate traffic; tune serialization or use hashes for very large volumes.
 */
export class RedisConversationRepository implements IConversationRepository {
  private client: Redis;
  private prefix = 'conv:';
  private ttlSeconds?: number;

  constructor(redisUrl?: string, ttlSeconds?: number) {
    // cast to any to satisfy ioredis constructor overloads when passing a string
    this.client = new Redis((redisUrl || process.env.REDIS_URL) as any);
    this.ttlSeconds = ttlSeconds;
  }

  private key(userId: string) {
    return `${this.prefix}${userId}`;
  }

  async getConversation(userId: string): Promise<Conversation | null> {
    const raw = await this.client.get(this.key(userId));
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Conversation;
    } catch (e) {
      // if parse fails, delete corrupt key and return null
      await this.client.del(this.key(userId));
      return null;
    }
  }

  async saveConversation(userId: string, conversation: Conversation): Promise<void> {
    const raw = JSON.stringify(conversation);
    if (this.ttlSeconds) {
      await this.client.set(this.key(userId), raw, 'EX', this.ttlSeconds);
    } else {
      await this.client.set(this.key(userId), raw);
    }
  }

  async appendMessage(userId: string, role: MessageRole, content: string, metadata?: Record<string, unknown>): Promise<DomainMessage> {
    const conv = (await this.getConversation(userId)) ?? { userId, messages: [], lastInteraction: new Date().toISOString() };
    const msg = { id: `${Date.now()}-${Math.random().toString(36).slice(2,8)}`, role, content, timestamp: new Date().toISOString() };
  conv.messages.push(msg as any);
    conv.lastInteraction = new Date().toISOString();
    await this.saveConversation(userId, conv);
    return {
      id: msg.id,
      userId: conv.userId,
      role: msg.role as MessageRole,
      content: msg.content,
      timestamp: new Date(msg.timestamp),
      metadata
    };
  }

  async clearConversation(userId: string): Promise<void> {
    await this.client.del(this.key(userId));
  }

  // --- Adapter methods to satisfy IConversationRepository interface ---
  async getHistory(userId: string, limit?: number): Promise<DomainMessage[]> {
    const conv = await this.getConversation(userId);
    if (!conv) return [];
    const slice = limit ? conv.messages.slice(-limit) : conv.messages;
    return slice.map(m => ({ id: m.id, userId: conv.userId, role: m.role as MessageRole, content: m.content, timestamp: new Date(m.timestamp) }));
  }

  async getLastMessage(userId: string): Promise<DomainMessage | null> {
    const conv = await this.getConversation(userId);
    if (!conv || conv.messages.length === 0) return null;
    const m = conv.messages[conv.messages.length - 1];
    return { id: m.id, userId: conv.userId, role: m.role as MessageRole, content: m.content, timestamp: new Date(m.timestamp) };
  }

  async clearHistory(userId: string): Promise<void> {
    await this.clearConversation(userId);
  }
}

export default RedisConversationRepository;
