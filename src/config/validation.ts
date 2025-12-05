// validation.ts
// Validación de configuración del bot

import { BotConfig } from '../types/interfaces';

export function validateConfig(config: BotConfig): void {
  if (!config.openAIApiKey) {
    throw new Error('OPENAI_API_KEY es requerida');
  }
  // Puedes agregar más validaciones aquí
}
