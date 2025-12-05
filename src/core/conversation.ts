// conversation.ts
// Lógica de conversación y gestión de historial

import { getConversation, setConversation } from '../services/conversationManager';

export function updateConversation(userId: string, message: string) {
  // Actualiza el historial de conversación del usuario
  const context = getConversation(userId) || { lastInteraction: new Date(), messageCount: 0, history: [] };
  context.lastInteraction = new Date();
  context.messageCount++;
  context.history.push({ role: 'user', content: message });
  setConversation(userId, context);
}
