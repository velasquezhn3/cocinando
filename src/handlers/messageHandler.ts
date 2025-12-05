// messageHandler.ts
// Procesamiento de mensajes entrantes de WhatsApp

import { Message } from 'whatsapp-web.js';
import { container } from '../config/container';
import { TOKENS } from '../config/tokens';
import { logger } from '../shared/utils/Logger';

// Bridge between legacy event handler and the new application UseCase.
export async function handleMessage(message: Message) {
  const from = message.from;
  const body = (message.body || '').trim();
  const isGroup = from.includes('@g.us');
  const messageType = message.type;
  const hasMedia = message.hasMedia;

  console.log(`\n🔔 Nuevo mensaje recibido`);
  console.log(`   - De: ${from}`);
  console.log(`   - Es grupo: ${isGroup}`);
  console.log(`   - Tipo: ${messageType}`);
  console.log(`   - Tiene media: ${hasMedia}`);
  console.log(`   - Contenido: "${body.substring(0, 80)}${body.length > 80 ? '...' : ''}"`);

  logger.debug(`Mensaje recibido de ${from}: ${body}`);

  try {
    const usecase = container.resolve<any>(TOKENS.ProcessMessageUsecase as any);
    const result = await usecase.execute(from, body);
    logger.debug(`Resultado del procesamiento: ${JSON.stringify(result)}`);
    if (result.useOpenAI) {
      logger.info(`Procesando mensaje con ChatGPT para ${from}`);
      console.log(`\n🤖 Procesando con ChatGPT...`);
      await message.reply('Procesando con ChatGPT...');
    }
    if (result.response) {
      logger.info(`Enviando respuesta a ${from}: ${result.response}`);
      console.log(`✅ Enviando respuesta (${result.response.length} caracteres)`);
      await message.reply(result.response);
    }
  } catch (err) {
    logger.error(`Error procesando mensaje de ${from}: ${err}`);
    console.error(`❌ Error: ${err}`);
    // best-effort fallback reply
    try { await message.reply('Ocurrió un error procesando tu mensaje.'); } catch {}
  }
}
