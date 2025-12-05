// rateLimitMiddleware.ts
// Middleware para limitar la tasa de mensajes de los usuarios

const userTimestamps: Map<string, number[]> = new Map();
const LIMIT = 5; // mensajes
const WINDOW = 60 * 1000; // 1 minuto

export function rateLimitMiddleware(ctx: any, next: Function) {
  const userId = ctx.from;
  const now = Date.now();
  const timestamps = userTimestamps.get(userId) || [];
  const recent = timestamps.filter(ts => now - ts < WINDOW);
  if (recent.length >= LIMIT) {
    ctx.reply('Has superado el límite de mensajes. Intenta más tarde.');
    return;
  }
  userTimestamps.set(userId, [...recent, now]);
  next();
}
