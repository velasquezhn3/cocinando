export interface CommandContext {
  userId: string;
  args: string[];
  rawMessage: string;
  metadata?: Record<string, unknown>;
}

export interface Command {
  name: string;
  description: string;
  validate?: (ctx: CommandContext) => boolean | Promise<boolean>;
  execute: (ctx: CommandContext) =>
    | string
    | Promise<string>
    | Record<string, unknown>
    | Promise<Record<string, unknown>>;
}

export interface ICommandRegistry {
  register(intent: string, command: Command): void;
  get(intent: string): Command | undefined;
  has(intent: string): boolean;
  list(): string[];
}
