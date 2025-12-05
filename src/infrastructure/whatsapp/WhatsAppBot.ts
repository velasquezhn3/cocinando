import { Client, LocalAuth, Message, MessageTypes, MessageMedia } from 'whatsapp-web.js';
import { OpenAI } from 'openai';
import * as path from 'path';
import * as fs from 'fs';
import { injectable, inject } from 'tsyringe';
import MessageAdapter from './MessageAdapter';
import MediaHandler from './MediaHandler';
import TranscriptionQueue from '../ai/TranscriptionQueue';
import { container } from 'tsyringe';
import ProcessMessageUsecase from '../../application/usecases/ProcessMessage.usecase';
import { TOKENS } from '../../config/tokens';
import { logger } from '../../shared/utils/Logger';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { config } from '../../config/config';
import { MiddlewareRunner } from '../../presentation/middleware/MiddlewareRunner';
import OpenAIClient from '../ai/OpenAIClient';

@injectable()
export class WhatsAppBot {
  private client: Client;
  private processMessageUsecase: ProcessMessageUsecase;
  private conversationRepo: IConversationRepository;
  private openaiClient: OpenAIClient;
  private middlewareRunner?: MiddlewareRunner;
  private messageAdapter: MessageAdapter;
  private transcriptionQueue?: TranscriptionQueue;

  constructor(
    @inject(TOKENS.ProcessMessageUsecase as any) processMessageUsecase: ProcessMessageUsecase,
    @inject(TOKENS.ConversationRepository as any) conversationRepo: IConversationRepository,
    @inject(TOKENS.OpenAIClient as any) openaiClient: OpenAIClient,
    @inject(TOKENS.MiddlewareRunner as any) middlewareRunner?: MiddlewareRunner
  ) {
    this.processMessageUsecase = processMessageUsecase;
    this.conversationRepo = conversationRepo;
    this.openaiClient = openaiClient;
    this.middlewareRunner = middlewareRunner;
    // Initialize adapter/handlers (pass OpenAI client to MediaHandler for optional Whisper transcription)
    this.messageAdapter = new MessageAdapter(new MediaHandler(undefined, this.openaiClient));
    // resolve transcription queue if available
    try { this.transcriptionQueue = container.resolve(TranscriptionQueue); } catch {}

    const puppeteerArgs = ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'];

    this.client = new Client({
      puppeteer: { headless: process.env.NODE_ENV === 'production', args: puppeteerArgs },
      authStrategy: new LocalAuth({ clientId: process.env.CLIENT_ID || 'chatgpt-bot', dataPath: process.env.SESSION_PATH || config.sessionPath })
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers() {
    this.client.on('qr', (qr) => {
      logger.info('QR recibido');
      // small helper to output QR
      try { require('qrcode-terminal').generate(qr, { small: true }); } catch {}
    });

    this.client.on('ready', () => {
      logger.info('WhatsApp client ready');
    });

    this.client.on('message', async (message: Message) => {
      try {
        await this.handleIncomingMessage(message);
      } catch (err) {
        logger.error('Error handling incoming message', err);
      }
    });
  }

  public start(): Promise<void> {
    logger.info('Starting WhatsAppBot...');
    // initialize the client and register WhatsAppSender instance in DI so workers can send messages
    return this.client.initialize().then(() => {
      try {
        // lazy require to avoid circular deps
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const { container } = require('../../config/container');
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const WhatsAppSender = require('./WhatsAppSender').WhatsAppSender;
        container.registerInstance(WhatsAppSender, new WhatsAppSender(this.client));
      } catch (e) {
        // ignore registration errors
      }
    }) as unknown as Promise<void>;
  }

  public async stop(): Promise<void> {
    try {
      await this.client.destroy();
      logger.info('WhatsApp client destroyed');
    } catch (err) {
      logger.error('Error destroying client', err);
    }
  }

  private logMessageDetails(message: Message): void {
    const isGroup = message.from.includes('@g.us');
    const messageInfo = {
      timestamp: new Date().toISOString(),
      from: message.from,
      isGroup: isGroup,
      groupName: message.from.includes('@g.us') ? `${message.from}` : 'N/A',
      senderName: message._data?.notifyName || 'Unknown',
      messageType: message.type,
      messageId: message.id._serialized,
      body: message.body.substring(0, 100) + (message.body.length > 100 ? '...' : ''),
      hasMedia: message.hasMedia,
      mediaType: message.hasMedia ? message.type : 'N/A',
      quotedMessage: message.hasQuotedMsg,
      mentions: message.mentionedIds?.length || 0,
      fromMe: message.fromMe,
      isStatus: message.isStatus,
      ack: message.ack
    };
    
    console.log('');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('📨 INFORMACIÓN DEL MENSAJE RECIBIDO');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`⏰ Timestamp: ${messageInfo.timestamp}`);
    console.log(`👤 De: ${messageInfo.from}`);
    console.log(`📱 Nombre remitente: ${messageInfo.senderName}`);
    console.log(`📍 Es grupo: ${messageInfo.isGroup}`);
    if (messageInfo.isGroup) console.log(`👥 ID Grupo: ${messageInfo.groupName}`);
    console.log(`🏷️  ID Mensaje: ${messageInfo.messageId}`);
    console.log(`💬 Tipo mensaje: ${messageInfo.messageType}`);
    console.log(`📄 Contenido: "${messageInfo.body}"`);
    console.log(`🎬 Tiene media: ${messageInfo.hasMedia}`);
    if (messageInfo.hasMedia) console.log(`🎥 Tipo media: ${messageInfo.mediaType}`);
    console.log(`💭 Mensaje citado: ${messageInfo.quotedMessage}`);
    if (messageInfo.mentions > 0) console.log(`@️  Menciones: ${messageInfo.mentions}`);
    console.log(`✅ Estado de entrega (ack): ${messageInfo.ack}`);
    console.log('═══════════════════════════════════════════════════════════');
    console.log('');
  }

  private async handleIncomingMessage(message: Message): Promise<void> {
    if (message.fromMe || message.isStatus) return;

    // Log detailed message information
    this.logMessageDetails(message);

    // Run middleware pipeline if available
    if (this.middlewareRunner) {
      const ctx = { userId: message.from, message, send: async (t: string) => { await message.reply(t); } };
      const mRes = await this.middlewareRunner.run(ctx as any);
      if (!mRes.allow) {
        if (mRes.response) await message.reply(mRes.response);
        return;
      }
    } else {
      // By default the bot is public for the restaurant use-case (any user may
      // message to get info, make reservations, order food, etc.). Only enforce
      // an allowlist when the operator explicitly sets USE_ALLOWLIST=true and
      // provides ADMIN_USERS.
      if (process.env.USE_ALLOWLIST === 'true') {
        if (config.adminUsers.length > 0 && !config.adminUsers.includes(message.from)) {
          logger.debug(`Usuario no permitido por allowlist: ${message.from}`);
          return;
        }
      }
    }

    // If voice and a persistent Bull queue is configured, enqueue raw media for background processing
    if (message.type === MessageTypes.VOICE && process.env.USE_BULL === 'true') {
      try {
        const media = await message.downloadMedia();
        if (media && media.data) {
          // resolve bull queue and enqueue job
          try {
            const { container } = require('../../config/container');
            const BullQueue = require('../ai/BullTranscriptionQueue').default;
            const bull = container.resolve(BullQueue);
            await bull.enqueue({ userId: message.from, mediaData: media.data, mimetype: media.mimetype });
            await message.reply('Transcribiendo tu mensaje de voz, te aviso cuando esté listo...');
            return;
          } catch (e) {
            // fallback to in-memory flow
          }
        }
      } catch (e) {
        // continue to normal processing
      }
    }

    // Normalize message via adapter (handles text, image, voice)
    const adapted = await this.messageAdapter.adapt(message);
    if (!adapted.text || adapted.text.trim().length === 0) {
      // nothing to process
      return;
    }

    // If voice media and we have a transcription queue, process asynchronously
    if (adapted.media?.type === 'voice' && this.transcriptionQueue) {
      try {
        await adapted.reply('Transcribiendo tu mensaje de voz, te aviso cuando esté listo...');
        this.transcriptionQueue.enqueue({ message, reply: adapted.reply });
      } catch (e) {
        // continue to sync processing if enqueue fails
      }
      return;
    }

    const result = await this.processMessageUsecase.execute(adapted.userId, adapted.text);
    if (result.useOpenAI) {
      console.log(`\n🤖 Procesando con ChatGPT para: ${adapted.userId}`);
      const reply = await this.processWithChatGPT(adapted.userId, adapted.text);
      console.log(`✅ Respuesta generada (${reply.length} caracteres)`);
      await adapted.reply(reply);
    } else if (result.response) {
      console.log(`\n✉️  Enviando respuesta predefinida a: ${adapted.userId}`);
      console.log(`📝 Respuesta: "${result.response.substring(0, 100)}${result.response.length > 100 ? '...' : ''}"`);
      await adapted.reply(result.response);
    }
    return;
  }

  private async processWithChatGPT(senderId: string, prompt: string): Promise<string> {
    // append user prompt to conversation repo (usecase also does this, but ensure context)
    await this.conversationRepo.appendMessage(senderId, 'user', prompt);

    const historyMsgs = await this.conversationRepo.getHistory(senderId);
    const history = historyMsgs.map(m => ({ role: m.role, content: m.content }));

    console.log(`\n📊 Información de procesamiento:`);
    console.log(`   - Usuario: ${senderId}`);
    console.log(`   - Longitud del prompt: ${prompt.length} caracteres`);
    console.log(`   - Mensajes en historial: ${history.length}`);
    console.log(`   - Modelo: ${process.env.OPENAI_MODEL || 'gpt-3.5-turbo'}`);
    console.log(`   - Token máx: ${parseInt(process.env.OPENAI_MAX_TOKENS || '800')}`);

    const messages = [ { role: 'system', content: process.env.SYSTEM_PROMPT || 'Eres un asistente.' }, ...history ];

    const response = await this.openaiClient.createChatCompletion({
      model: process.env.OPENAI_MODEL || 'gpt-3.5-turbo',
      messages,
      max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS || '800')
    });

    const text = response.choices[0]?.message?.content || '';
    await this.conversationRepo.appendMessage(senderId, 'assistant', text);
    
    console.log(`   - Respuesta generada: ${text.length} caracteres`);
    console.log(`   - Primeros 100 caracteres: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`);
    
    return text;
  }
}

export default WhatsAppBot;
