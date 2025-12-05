import { IMiddleware, MiddlewareContext, MiddlewareResult } from './IMiddleware';
import { config } from '../../config/config';

export class AuthMiddleware implements IMiddleware {
  async handle(ctx: MiddlewareContext): Promise<MiddlewareResult> {
    // By default the bot is public. Enforce allowlist only when operator sets USE_ALLOWLIST=true
    if (process.env.USE_ALLOWLIST !== 'true') return { allow: true };

    // if adminUsers is empty, deny by default when allowlist is enabled
    if (!config.adminUsers || config.adminUsers.length === 0) return { allow: false, response: 'Access restricted: no ADMIN_USERS set.' };

    // whitelist format: full whatsapp id strings
    if (config.adminUsers.includes(ctx.userId)) return { allow: true };

    return { allow: false, response: 'Usuario no autorizado para usar este bot.' };
  }
}

export default AuthMiddleware;
