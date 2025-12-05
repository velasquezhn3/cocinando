// intentInterpreter.ts
// Servicio de interpretación de intenciones
// Analiza el mensaje del usuario y determina el comando/intención principal

import { sendToOpenAI } from './openai';

export async function interpretIntent(message: string): Promise<string> {
  // Aquí se puede usar OpenAI o lógica propia para interpretar la intención
  // Ejemplo:
  // const command = await sendToOpenAI(`Interpreta la intención: ${message}`);
  // return command;
  return 'menu'; // Simulación
}
