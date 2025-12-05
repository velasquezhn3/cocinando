import { container } from './config/container';
import { TOKENS } from './config/tokens';
import { logger } from './shared/utils/Logger';

async function bootstrap() {
  try {
    const bot = container.resolve<any>(TOKENS.WhatsAppBot as any);
    if (bot && typeof bot.start === 'function') {
      await bot.start();
      logger.info('Bot started successfully');
    } else {
      logger.warn('WhatsAppBot not available in container');
    }
  } catch (err) {
    logger.error('Bootstrap error', err);
    process.exit(1);
  }
}

bootstrap();

process.on('SIGINT', async () => {
  try {
    const bot = container.resolve<any>(TOKENS.WhatsAppBot as any);
    if (bot && typeof bot.stop === 'function') await bot.stop();
  } finally {
    process.exit(0);
  }
});