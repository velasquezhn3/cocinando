import { inject, injectable } from 'tsyringe';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { IIntentParser, IntentResult } from '../../domain/services/IIntentParser';
import { ICommandRegistry } from '../../domain/services/ICommandRegistry';
import { ILogger } from '../../domain/services/ILogger';
import { IMetrics } from '../../domain/services/IMetrics';
import { ICacheService } from '../../domain/services/ICacheService';
import { TOKENS } from '../../config/tokens';
import { AppError, ErrorCode } from '../../domain/errors/AppError';

/**
 * Resultado del procesamiento de mensaje
 */
export interface ProcessResult {
  response?: string;
  useOpenAI: boolean;
  intent: string;
  confidence: number;
  processingTimeMs: number;
  cached?: boolean;
  metadata?: Record<string, unknown>;
}

/**
 * Configuración del caso de uso
 */
export interface ProcessMessageConfig {
  minConfidenceThreshold: number;
  enableCache: boolean;
  cacheTTL: number;
  maxRetries: number;
}

/**
 * Contexto de ejecución del comando
 */
export interface CommandContext {
  userId: string;
  args: string[];
  rawMessage: string;
  metadata?: Record<string, unknown>;
}

/**
 * ProcessMessageUsecase - Versión mejorada
 * 
 * Mejoras implementadas:
 * - Inyección de dependencias declarativa
 * - Manejo robusto de errores con tipos específicos
 * - Logging estructurado en todos los puntos críticos
 * - Métricas de rendimiento y uso
 * - Sistema de caché para consultas frecuentes
 * - Configuración externalizada
 * - Validación de entrada
 * - Retry logic para operaciones críticas
 * - Respuestas i18n preparadas
 * - Separación clara de responsabilidades
 */
@injectable()
export class ProcessMessageUsecase {
  private readonly config: ProcessMessageConfig;

  constructor(
    @inject(TOKENS.IntentParser) private readonly intentParser: IIntentParser,
    @inject(TOKENS.CommandRegistry) private readonly commandRegistry: ICommandRegistry,
    @inject(TOKENS.ConversationRepository) private readonly conversationRepo: IConversationRepository,
    @inject(TOKENS.Logger) private readonly logger: ILogger,
    @inject(TOKENS.Metrics) private readonly metrics: IMetrics,
    @inject(TOKENS.CacheService) private readonly cache: ICacheService,
    @inject(TOKENS.ProcessMessageConfig) config?: ProcessMessageConfig
  ) {
    this.config = config || {
      minConfidenceThreshold: 0.35,
      enableCache: true,
      cacheTTL: 300, // 5 minutos
      maxRetries: 3
    };
  }

  /**
   * Ejecuta el procesamiento de un mensaje
   */
  async execute(userId: string, text: string): Promise<ProcessResult> {
    const startTime = Date.now();
    const operationId = this.generateOperationId();

    try {
      // Validación de entrada
      this.validateInput(userId, text);

      this.logger.info('Processing message', {
        operationId,
        userId,
        messageLength: text.length,
        timestamp: new Date().toISOString()
      });

      // Verificar caché si está habilitado
      if (this.config.enableCache) {
        const cachedResult = await this.checkCache(userId, text);
        if (cachedResult) {
          this.metrics.increment('cache.hit');
          return {
            ...cachedResult,
            processingTimeMs: Date.now() - startTime,
            cached: true
          };
        }
        this.metrics.increment('cache.miss');
      }

      // Parsear intención
      const intentResult = await this.parseIntent(text, operationId);

      // Persistir mensaje del usuario
      await this.persistUserMessage(userId, text, operationId);

      // Procesar según el tipo de intención
      const result = await this.processIntent(
        userId,
        text,
        intentResult,
        operationId
      );

      // Calcular tiempo de procesamiento
      const processingTimeMs = Date.now() - startTime;
      
      // Registrar métricas
      this.recordMetrics(intentResult, processingTimeMs);

      // Cachear resultado si corresponde
      if (this.config.enableCache && !result.useOpenAI) {
        await this.cacheResult(userId, text, result);
      }

      this.logger.info('Message processed successfully', {
        operationId,
        userId,
        intent: intentResult.intent,
        processingTimeMs,
        useOpenAI: result.useOpenAI
      });

      return {
        ...result,
        processingTimeMs
      };

    } catch (error) {
      const processingTimeMs = Date.now() - startTime;
      
      this.logger.error('Error processing message', {
        operationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        processingTimeMs
      });

      this.metrics.increment('errors.total');

      // Re-lanzar errores de aplicación
      if (error instanceof AppError) {
        throw error;
      }

      // Envolver errores desconocidos
      throw new AppError(
        ErrorCode.INTERNAL_ERROR,
        'Error inesperado al procesar mensaje',
        { originalError: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Valida los parámetros de entrada
   */
  private validateInput(userId: string, text: string): void {
    if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'userId es requerido y debe ser una cadena no vacía'
      );
    }

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'El mensaje no puede estar vacío'
      );
    }

    if (text.length > 4000) {
      throw new AppError(
        ErrorCode.VALIDATION_ERROR,
        'El mensaje excede la longitud máxima permitida (4000 caracteres)'
      );
    }
  }

  /**
   * Parsea la intención del mensaje
   */
  private async parseIntent(text: string, operationId: string): Promise<IntentResult> {
    try {
      const result = await this.intentParser.parse(text);
      
      this.logger.debug('Intent parsed', {
        operationId,
        intent: result.intent,
        confidence: result.confidence,
        entities: result.entities
      });

      return result;
    } catch (error) {
      this.logger.error('Error parsing intent', {
        operationId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      // Retornar intención por defecto en caso de error
      return {
        intent: 'ninguno',
        confidence: 0,
        entities: {}
      };
    }
  }

  /**
   * Persiste el mensaje del usuario con reintentos
   */
  private async persistUserMessage(
    userId: string,
    text: string,
    operationId: string
  ): Promise<void> {
    let retries = 0;
    
    while (retries < this.config.maxRetries) {
      try {
        await this.conversationRepo.appendMessage(userId, 'user', text);
        return;
      } catch (error) {
        retries++;
        
        this.logger.warn('Error persisting user message, retrying', {
          operationId,
          userId,
          attempt: retries,
          maxRetries: this.config.maxRetries,
          error: error instanceof Error ? error.message : 'Unknown error'
        });

        if (retries >= this.config.maxRetries) {
          throw new AppError(
            ErrorCode.DATABASE_ERROR,
            'No se pudo persistir el mensaje después de varios intentos',
            { retries }
          );
        }

        // Backoff exponencial
        await this.sleep(Math.pow(2, retries) * 100);
      }
    }
  }

  /**
   * Persiste el mensaje del asistente
   */
  private async persistAssistantMessage(
    userId: string,
    message: string,
    operationId: string
  ): Promise<void> {
    try {
      await this.conversationRepo.appendMessage(userId, 'assistant', message);
    } catch (error) {
      this.logger.error('Error persisting assistant message', {
        operationId,
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      // No lanzar error para no interrumpir el flujo
    }
  }

  /**
   * Procesa la intención detectada
   */
  private async processIntent(
    userId: string,
    text: string,
    intentResult: IntentResult,
    operationId: string
  ): Promise<ProcessResult> {
    const { intent, confidence, entities } = intentResult;

    // Caso 1: Consulta de precio con producto específico
    if (intent === 'precio' && entities?.product) {
      return await this.handlePriceQuery(
        userId,
        entities.product as string,
        confidence,
        operationId
      );
    }

    // Caso 2: Comando registrado
    const command = this.commandRegistry.get(intent);
    if (command) {
      return await this.handleCommand(
        userId,
        text,
        intent,
        command,
        confidence,
        operationId
      );
    }

    // Caso 3: Baja confianza o intención desconocida -> escalar a OpenAI
    if (intent === 'ninguno' || confidence < this.config.minConfidenceThreshold) {
      this.logger.info('Escalating to OpenAI', {
        operationId,
        intent,
        confidence,
        threshold: this.config.minConfidenceThreshold
      });

      return {
        useOpenAI: true,
        intent,
        confidence,
        processingTimeMs: 0 // Se actualizará en execute
      };
    }

    // Caso 4: Intención detectada pero sin comando específico
    return await this.handleGenericIntent(
      userId,
      intent,
      confidence,
      operationId
    );
  }

  /**
   * Maneja consultas de precio
   */
  private async handlePriceQuery(
    userId: string,
    product: string,
    confidence: number,
    operationId: string
  ): Promise<ProcessResult> {
    // TODO: Integrar con servicio real de precios
    const response = this.formatPriceResponse(product);
    
    await this.persistAssistantMessage(userId, response, operationId);

    return {
      response,
      useOpenAI: false,
      intent: 'precio',
      confidence,
      processingTimeMs: 0,
      metadata: { product }
    };
  }

  /**
   * Maneja la ejecución de comandos registrados
   */
  private async handleCommand(
    userId: string,
    text: string,
    intent: string,
    command: any,
    confidence: number,
    operationId: string
  ): Promise<ProcessResult> {
    const context: CommandContext = {
      userId,
      args: text.split(' ').slice(1),
      rawMessage: text,
      metadata: { operationId }
    };

    // Validar permisos si es necesario
    if (command.validate) {
      const isValid = await Promise.resolve(command.validate(context));
      
      if (!isValid) {
        const response = 'Lo siento, no tienes permisos para ejecutar esta acción.';
        await this.persistAssistantMessage(userId, response, operationId);
        
        this.logger.warn('Command validation failed', {
          operationId,
          userId,
          intent
        });

        return {
          response,
          useOpenAI: false,
          intent,
          confidence,
          processingTimeMs: 0
        };
      }
    }

    // Ejecutar comando
    try {
      const commandResult = await Promise.resolve(command.execute(context));
      const response = typeof commandResult === 'string' 
        ? commandResult 
        : JSON.stringify(commandResult);

      await this.persistAssistantMessage(userId, response, operationId);

      return {
        response,
        useOpenAI: false,
        intent,
        confidence,
        processingTimeMs: 0
      };
    } catch (error) {
      this.logger.error('Command execution failed', {
        operationId,
        userId,
        intent,
        error: error instanceof Error ? error.message : 'Unknown error'
      });

      throw new AppError(
        ErrorCode.COMMAND_EXECUTION_ERROR,
        'Error al ejecutar el comando',
        { intent, error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  /**
   * Maneja intenciones genéricas sin comando específico
   */
  private async handleGenericIntent(
    userId: string,
    intent: string,
    confidence: number,
    operationId: string
  ): Promise<ProcessResult> {
    let response: string;

    // Special case for greeting
    if (intent === 'saludo') {
      response = '¡Hola! 👋 Bienvenido a *CociNando Asados* 🍖\n\n' +
                 '¿En qué puedo ayudarte hoy?\n\n' +
                 '• "menu" - Ver nuestro menú\n' +
                 '• "horario" - Conocer nuestros horarios\n' +
                 '• "ubicacion" - Saber dónde estamos';
    } else {
      response = this.formatGenericResponse(intent, confidence);
    }

    await this.persistAssistantMessage(userId, response, operationId);

    return {
      response,
      useOpenAI: false,
      intent,
      confidence,
      processingTimeMs: 0
    };
  }

  /**
   * Verifica si hay resultado en caché
   */
  private async checkCache(
    userId: string,
    text: string
  ): Promise<ProcessResult | null> {
    try {
      const cacheKey = this.generateCacheKey(userId, text);
      const cached = await this.cache.get<ProcessResult>(cacheKey);
      
      if (cached) {
        this.logger.debug('Cache hit', { userId, cacheKey });
      }
      
      return cached;
    } catch (error) {
      this.logger.warn('Error checking cache', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return null;
    }
  }

  /**
   * Guarda resultado en caché
   */
  private async cacheResult(
    userId: string,
    text: string,
    result: ProcessResult
  ): Promise<void> {
    try {
      const cacheKey = this.generateCacheKey(userId, text);
      await this.cache.set(cacheKey, result, this.config.cacheTTL);
    } catch (error) {
      this.logger.warn('Error caching result', {
        userId,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Registra métricas de uso
   */
  private recordMetrics(intentResult: IntentResult, processingTimeMs: number): void {
    this.metrics.increment(`intent.${intentResult.intent}`);
    this.metrics.histogram('processing_time_ms', processingTimeMs);
    this.metrics.histogram('confidence_score', intentResult.confidence);
  }

  /**
   * Genera clave de caché única
   */
  private generateCacheKey(userId: string, text: string): string {
    // Normalizar texto para mejorar hit rate
    const normalized = text.toLowerCase().trim().replace(/\s+/g, ' ');
    return `msg:${userId}:${this.hashString(normalized)}`;
  }

  /**
   * Genera ID único para la operación
   */
  private generateOperationId(): string {
    return `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Hash simple para strings
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Formatea respuesta de precio
   */
  private formatPriceResponse(product: string): string {
    // TODO: Obtener precio real del servicio
    return `💲 El precio de *${product}* es: $XX.XX\n\n` +
           `_Para más información sobre nuestros productos, escribe "menu"_`;
  }

  /**
   * Formatea respuesta genérica
   */
  private formatGenericResponse(intent: string, confidence: number): string {
    const confidencePercent = Math.round(confidence * 100);
    
    return `He detectado que preguntas sobre *${intent}* (${confidencePercent}% de confianza).\n\n` +
           `¿Puedes ser más específico? También puedes escribir:\n` +
           `• "menu" - Ver nuestro menú\n` +
           `• "horario" - Conocer nuestros horarios\n` +
           `• "ubicacion" - Saber dónde estamos`;
  }

  /**
   * Utilidad para pausar ejecución
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default ProcessMessageUsecase;