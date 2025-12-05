import { IMiddleware, MiddlewareContext, MiddlewareResult } from './IMiddleware';

export class MiddlewareRunner {
  private middlewares: IMiddleware[] = [];

  register(m: IMiddleware) {
    this.middlewares.push(m);
  }

  async run(ctx: MiddlewareContext): Promise<MiddlewareResult> {
    for (const m of this.middlewares) {
      try {
        const res = await m.handle(ctx);
        if (!res.allow) return res;
      } catch (err) {
        // On middleware error, deny and log
        // eslint-disable-next-line no-console
        console.error('Middleware error', err);
        return { allow: false, response: 'Error interno del servidor.' };
      }
    }
    return { allow: true };
  }
}

export default MiddlewareRunner;
