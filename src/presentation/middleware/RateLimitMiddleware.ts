import { IMiddleware, MiddlewareContext, MiddlewareResult } from './IMiddleware';

type RateEntry = { count: number; windowStart: number };

export class RateLimitMiddleware implements IMiddleware {
  private max: number;
  private windowMs: number;
  private store: Map<string, RateEntry> = new Map();

  constructor(max = 5, windowSeconds = 60) {
    this.max = max;
    this.windowMs = windowSeconds * 1000;
  }

  async handle(ctx: MiddlewareContext): Promise<MiddlewareResult> {
    const now = Date.now();
    const key = ctx.userId;
    const existing = this.store.get(key);
    if (!existing || now - existing.windowStart > this.windowMs) {
      this.store.set(key, { count: 1, windowStart: now });
      return { allow: true };
    }

    existing.count += 1;
    this.store.set(key, existing);

    if (existing.count > this.max) {
      return { allow: false, response: `Has superado el límite de ${this.max} mensajes cada ${Math.round(this.windowMs/1000)}s. Intenta más tarde.` };
    }

    return { allow: true };
  }
}

export default RateLimitMiddleware;
