// defaults.ts
// Configuraciones por defecto del bot

import { BotConfig } from '../types/interfaces';

export const DEFAULT_CONFIG: Partial<BotConfig> = {
  prefixEnabled: false,
  prefix: "!g",
  allowedUsers: [],
  maxMessageLength: 4000,
  conversationTimeout: 3600000, // 1 hora
  enableImageAnalysis: false,
  enableVoiceNotes: false,
  maxHistoryLength: 10,
  responseLanguage: "es"
};
