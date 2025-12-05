import 'reflect-metadata';
import { container } from 'tsyringe';
import { InMemoryConversationRepository } from '../infrastructure/storage/InMemoryConversationRepository';
import { IConversationRepository } from '../domain/repositories/IConversationRepository';
import IntentParser from '../infrastructure/ai/IntentParser';
import { TOKENS } from './tokens';
import { CommandRegistry } from '../presentation/commands/CommandRegistry';
import { MenuCommand } from '../presentation/commands/MenuCommand';
import { HorarioCommand } from '../presentation/commands/HorarioCommand';
import { UbicacionCommand } from '../presentation/commands/UbicacionCommand';
import { HelpCommand } from '../presentation/commands/HelpCommand';
import { StatusCommand } from '../presentation/commands/StatusCommand';
import { ListGroupsCommand } from '../presentation/commands/ListGroupsCommand';
import { CartCommand } from '../presentation/commands/CartCommand';
import { ConfirmCommand } from '../presentation/commands/ConfirmCommand';
import { ReservarCommand } from '../presentation/commands/ReservarCommand';
import MessageAdapter from '../infrastructure/whatsapp/MessageAdapter';
import MediaHandler from '../infrastructure/whatsapp/MediaHandler';
import TranscriptionQueue from '../infrastructure/ai/TranscriptionQueue';
import LocalTranscriber from '../infrastructure/ai/LocalTranscriber';
import BullTranscriptionQueue from '../infrastructure/ai/BullTranscriptionQueue';
import { MiddlewareRunner } from '../presentation/middleware/MiddlewareRunner';
import { AuthMiddleware } from '../presentation/middleware/AuthMiddleware';
import { RateLimitMiddleware } from '../presentation/middleware/RateLimitMiddleware';
import { logger } from '../shared/utils/Logger';
import WhatsAppSender from '../infrastructure/whatsapp/WhatsAppSender';
import WhatsAppBot from '../infrastructure/whatsapp/WhatsAppBot';
import ProcessMessageUsecase from '../application/usecases/ProcessMessage.usecase';
import OpenAIClient from '../infrastructure/ai/OpenAIClient';
import { MetricsService } from '../infrastructure/services/MetricsService';
import { CacheService } from '../infrastructure/services/CacheService';

// TOKENS are defined in `src/config/tokens.ts` to avoid circular imports

// Conversation repository registration (Redis optional)
// Prepare a single Redis URL (fallback to localhost) to be shared by components
const DEFAULT_REDIS = 'redis://127.0.0.1:6379';
const redisUrl = process.env.REDIS_URL || DEFAULT_REDIS;

if (process.env.USE_REDIS === 'true') {
	try {
		// lazy require to avoid hard dependency when not using Redis
		// eslint-disable-next-line @typescript-eslint/no-var-requires
		const { RedisConversationRepository } = require('../infrastructure/storage/RedisConversationRepository');
		const ttl = process.env.CONV_TTL ? parseInt(process.env.CONV_TTL) : undefined;
		// register instance because RedisConversationRepository needs constructor args
		container.registerInstance(TOKENS.ConversationRepository, new RedisConversationRepository(redisUrl, ttl));
	} catch (err) {
		// fallback to in-memory if Redis libs aren't installed
		// eslint-disable-next-line no-console
		console.warn('Redis requested but not available — falling back to InMemoryConversationRepository', err);
		container.registerSingleton(TOKENS.ConversationRepository, InMemoryConversationRepository);
	}
} else {
	container.registerSingleton(TOKENS.ConversationRepository, InMemoryConversationRepository);
}

// Intent parser instance
container.registerInstance(TOKENS.IntentParser, new IntentParser());

// Default configuration for ProcessMessageUsecase (registered so DI can resolve it)
container.registerInstance(TOKENS.ProcessMessageConfig, {
	minConfidenceThreshold: 0.35,
	enableCache: true,
	cacheTTL: 300,
	maxRetries: 3
} as any);

// CommandRegistry and command classes
container.registerSingleton(TOKENS.CommandRegistry, CommandRegistry);
// register command classes so they can be resolved (they're lightweight)
container.registerSingleton(MenuCommand, MenuCommand);
container.registerSingleton(HorarioCommand, HorarioCommand);
container.registerSingleton(UbicacionCommand, UbicacionCommand);
container.registerSingleton(HelpCommand, HelpCommand);
container.registerSingleton(StatusCommand, StatusCommand);
container.registerSingleton(ListGroupsCommand, ListGroupsCommand);
container.registerSingleton(CartCommand, CartCommand);
container.registerSingleton(ConfirmCommand, ConfirmCommand);
container.registerSingleton(ReservarCommand, ReservarCommand);

// Application and infra singletons
container.registerSingleton(TOKENS.ProcessMessageUsecase, ProcessMessageUsecase as any);
// Register OpenAI client as an instance to avoid relying on runtime decorator metadata
// (some runtimes like vite-node / esbuild don't emit design:paramtypes reliably).
container.registerInstance(TOKENS.OpenAIClient, new OpenAIClient(process.env.OPENAI_API_KEY));
// WhatsAppBot will be constructed after middleware and logger are available to
// avoid relying on tsyringe's constructor metadata (which may be unavailable
// under some runtimes like vite-node). We'll register the instance later.

// Resolve registry and register command instances
const registry = container.resolve<CommandRegistry>(TOKENS.CommandRegistry as any);
registry.register(container.resolve(MenuCommand));
registry.register(container.resolve(HorarioCommand));
registry.register(container.resolve(UbicacionCommand));
registry.register(container.resolve(StatusCommand));
registry.register(container.resolve(ListGroupsCommand));
registry.register(container.resolve(CartCommand));
registry.register(container.resolve(ConfirmCommand));
registry.register(container.resolve(ReservarCommand));
// HelpCommand expects registry in constructor — resolve via container then re-register with registry
const helpCmd = new HelpCommand(registry);
registry.register(helpCmd);

// Middleware setup — create runner and register middlewares
const middlewareRunner = new MiddlewareRunner();
middlewareRunner.register(new AuthMiddleware());
middlewareRunner.register(new RateLimitMiddleware(parseInt(process.env.RATE_MAX || '5', 10), parseInt(process.env.RATE_WINDOW || '60', 10)));
container.registerInstance(TOKENS.MiddlewareRunner, middlewareRunner as any);

// Logger
container.registerInstance(TOKENS.Logger, logger as any);

// Metrics service
container.registerSingleton(TOKENS.Metrics, MetricsService as any);

// Cache service
container.registerSingleton(TOKENS.CacheService, CacheService as any);

// Cart service
import { CartService } from '../infrastructure/services/CartService';
container.registerSingleton(CartService, CartService as any);

// Register adapters and media handlers in DI
container.registerSingleton(MessageAdapter, MessageAdapter);
container.registerSingleton(MediaHandler, MediaHandler);

// WhatsApp sender (will register instance when bot initializes)
container.registerSingleton(WhatsAppSender, WhatsAppSender);

// Local transcriber (optional)
container.registerSingleton(LocalTranscriber, LocalTranscriber);

// Transcription queue singleton - prefer Bull/Redis-backed queue when configured
if (process.env.USE_BULL === 'true') {
	try {
		// Register BullTranscriptionQueue with the same redis url
		container.registerSingleton(BullTranscriptionQueue, BullTranscriptionQueue as any);
		// ensure instance is constructed with redisUrl
		const bullInst = new BullTranscriptionQueue(redisUrl);
		container.registerInstance(TranscriptionQueue, bullInst as any);
	} catch (e) {
		// fallback to in-memory queue if bull/ioredis not installed
		// eslint-disable-next-line no-console
		console.warn('Bull requested but not available — falling back to in-memory TranscriptionQueue', e);
		container.registerSingleton(TranscriptionQueue, TranscriptionQueue as any);
	}
} else {
	container.registerSingleton(TranscriptionQueue, TranscriptionQueue as any);
}

	// Construct and register WhatsAppBot instance now that middleware/logger are ready.
	try {
		const botInstance = new WhatsAppBot(
			container.resolve<any>(TOKENS.ProcessMessageUsecase as any),
			container.resolve<any>(TOKENS.ConversationRepository as any),
			container.resolve<any>(TOKENS.OpenAIClient as any),
			container.resolve<any>(TOKENS.MiddlewareRunner as any)
		);
		container.registerInstance(TOKENS.WhatsAppBot, botInstance as any);
	} catch (e) {
		// If something fails here, log and allow fallback — the application may still
		// want to construct the bot lazily elsewhere.
		// eslint-disable-next-line no-console
		console.warn('Failed to construct WhatsAppBot at container init:', e);
	}

export { container };
