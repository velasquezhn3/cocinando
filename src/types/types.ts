// types.ts
// Tipos y enums personalizados del bot

export type Role = 'user' | 'assistant';

export type CommandHandler = (message: any, args: string[]) => Promise<string | void>;
