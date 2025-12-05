// interfaces.ts
// Interfaces principales del bot WhatsApp

export interface ConversationContext {
  lastInteraction: Date;
  messageCount: number;
  history: Array<{role: 'user' | 'assistant', content: string}>;
}

export interface BotConfig {
  prefixEnabled: boolean;
  prefix: string;
  openAIApiKey: string;
  allowedUsers: string[];
  maxMessageLength: number;
  conversationTimeout: number;
  enableImageAnalysis: boolean;
  enableVoiceNotes: boolean;
  maxHistoryLength: number;
  responseLanguage: string;
}

export interface ProcessedMessage {
  prompt: string;
  shouldProcess: boolean;
  isCommand: boolean;
  command?: string;
  args?: string[];
}

export interface BotStats {
  totalMessages: number;
  successfulResponses: number;
  failedResponses: number;
  activeConversations: number;
  startupTime: Date;
}
