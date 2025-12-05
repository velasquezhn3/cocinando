// Central token list used for DI. Kept in its own module to avoid circular
// dependencies between the container and classes that reference TOKENS in
// decorators at load time.
export const TOKENS = {
  ConversationRepository: Symbol.for('ConversationRepository'),
  IntentParser: Symbol.for('IntentParser'),
  CommandRegistry: Symbol.for('CommandRegistry'),
  ProcessMessageUsecase: Symbol.for('ProcessMessageUsecase'),
  OpenAIClient: Symbol.for('OpenAIClient'),
  WhatsAppBot: Symbol.for('WhatsAppBot'),
  MiddlewareRunner: Symbol.for('MiddlewareRunner'),
  Logger: Symbol.for('Logger'),
  Metrics: Symbol.for('Metrics'),
  CacheService: Symbol.for('CacheService'),
  ProcessMessageConfig: Symbol.for('ProcessMessageConfig')
} as const;

export default TOKENS;
