// conversationManager.ts
// Gestión de conversaciones activas y su historial

import { ConversationContext } from '../types/interfaces';

const conversations: Map<string, ConversationContext> = new Map();

export function getConversation(userId: string): ConversationContext | undefined {
  return conversations.get(userId);
}

export function setConversation(userId: string, context: ConversationContext) {
  conversations.set(userId, context);
}

export function clearConversation(userId: string) {
  conversations.delete(userId);
}
