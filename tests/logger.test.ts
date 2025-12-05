// logger.test.ts
// Test unitario básico para el logger

import { Logger } from '../src/utils/logger';

describe('Logger', () => {
  it('debería registrar mensajes info sin errores', () => {
    const logger = new Logger('debug');
    expect(() => logger.info('Mensaje de prueba')).not.toThrow();
  });
});
