import { Conversation } from '../../domain/entities/Conversation';

export type MessageDTO = {
  userId: string;
  text: string;
  media?: any;
};

export interface CommandContext {
  userId: string;
  args: string[];
  rawMessage?: string;
  metadata?: Record<string, unknown>;
}

export interface Command {
  name: string;
  description?: string;
  permission?: 'admin' | 'any';
  validate?(ctx: CommandContext): Promise<boolean> | boolean;
  execute(ctx: CommandContext): Promise<string> | string;
}
