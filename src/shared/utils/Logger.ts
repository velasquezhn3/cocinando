import * as fs from 'fs';
import * as path from 'path';

export class Logger {
  private level: 'debug' | 'info' | 'warn' | 'error';
  private logDir: string;

  constructor(level: 'debug' | 'info' | 'warn' | 'error' = 'debug') {
    this.level = level;
    this.logDir = path.join(process.cwd(), 'logs');
    if (!fs.existsSync(this.logDir)) fs.mkdirSync(this.logDir, { recursive: true });
  }

  private writeFile(level: string, message: string, meta?: any) {
    const entry = { timestamp: new Date().toISOString(), level, message, meta };
    const file = path.join(this.logDir, `${new Date().toISOString().slice(0, 10)}.log`);
    fs.appendFileSync(file, JSON.stringify(entry) + '\n', 'utf8');
  }

  debug(msg: string, meta?: any) {
    if (this.level === 'debug') console.debug('[DEBUG]', msg, meta || '');
    this.writeFile('debug', msg, meta);
  }
  info(msg: string, meta?: any) {
    if (['debug', 'info'].includes(this.level)) console.log('[INFO]', msg, meta || '');
    this.writeFile('info', msg, meta);
  }
  warn(msg: string, meta?: any) {
    if (['debug', 'info', 'warn'].includes(this.level)) console.warn('[WARN]', msg, meta || '');
    this.writeFile('warn', msg, meta);
  }
  error(msg: string, meta?: any) {
    console.error('[ERROR]', msg, meta || '');
    this.writeFile('error', msg, meta);
  }
}

export const logger = new Logger((process.env.LOG_LEVEL as any) || 'debug');
