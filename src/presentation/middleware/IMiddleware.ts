import { Message } from 'whatsapp-web.js';

export type MiddlewareContext = {
  userId: string;
  message: Message;
  send: (text: string) => Promise<void>;
};

export type MiddlewareResult = { allow: boolean; response?: string };

export interface IMiddleware {
  handle(ctx: MiddlewareContext): Promise<MiddlewareResult>;
}
