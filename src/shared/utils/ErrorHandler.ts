import { logger } from './Logger';

export class ErrorHandler {
  static handle(err: unknown, context?: { userId?: string; location?: string }) {
    // Central logging
    try {
      logger.error(`Error in ${context?.location ?? 'unknown'}`);
      logger.error(String(err));
    } catch (e) {
      // swallow
      // eslint-disable-next-line no-console
      console.error('ErrorHandler logging failed', e);
    }

    // Map common errors to user-friendly messages
    if ((err as any)?.code === 'ECONNREFUSED') return 'Servicio temporalmente no disponible.';
    return 'Ocurrió un error interno. Por favor intenta de nuevo más tarde.';
  }
}

export default ErrorHandler;
