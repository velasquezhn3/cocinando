// index.ts
// Cargador de configuración del bot

import dotenv from 'dotenv';
import { DEFAULT_CONFIG } from './defaults';
import { BotConfig } from '../types/interfaces';

dotenv.config();

export function loadConfig(): BotConfig {
  return {
    prefixEnabled: process.env.PREFIX_ENABLED === "true",
    prefix: process.env.PREFIX_KEY || DEFAULT_CONFIG.prefix!,
    openAIApiKey: process.env.OPENAI_API_KEY || '',
    allowedUsers: process.env.ALLOWED_USERS?.split(',').filter(Boolean) || DEFAULT_CONFIG.allowedUsers!,
    maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || DEFAULT_CONFIG.maxMessageLength!.toString()),
    conversationTimeout: parseInt(process.env.CONVERSATION_TIMEOUT || DEFAULT_CONFIG.conversationTimeout!.toString()),
    enableImageAnalysis: process.env.ENABLE_IMAGE_ANALYSIS === "true",
    enableVoiceNotes: process.env.ENABLE_VOICE_NOTES === "true",
    maxHistoryLength: parseInt(process.env.MAX_HISTORY_LENGTH || '10'),
    responseLanguage: process.env.RESPONSE_LANGUAGE || 'es'
  };
}
