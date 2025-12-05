import { Message } from 'whatsapp-web.js';
import MediaHandler from '../whatsapp/MediaHandler';
import { ProcessMessageUsecase } from '../../application/usecases/ProcessMessage.usecase';
import { IConversationRepository } from '../../domain/repositories/IConversationRepository';
import { logger } from '../../shared/utils/Logger';
import { TOKENS } from '../../config/tokens';
import { container } from 'tsyringe';

type Job = {
  message: Message;
  reply: (text: string) => Promise<void>;
};

export class TranscriptionQueue {
  private queue: Job[] = [];
  private running = false;
  private mediaHandler: MediaHandler;
  private processUsecase: ProcessMessageUsecase;
  private repo: IConversationRepository;

  constructor(mediaHandler?: MediaHandler) {
    this.mediaHandler = mediaHandler ?? new MediaHandler();
    this.processUsecase = container.resolve<any>(TOKENS.ProcessMessageUsecase as any);
    this.repo = container.resolve<any>(TOKENS.ConversationRepository as any);
    // start worker
    this.start();
  }

  enqueue(job: Job) {
    this.queue.push(job);
  }

  private async start() {
    if (this.running) return;
    this.running = true;
    while (this.running) {
      const job = this.queue.shift();
      if (!job) {
        await new Promise(r => setTimeout(r, 500));
        continue;
      }
      try {
        logger.info('Processing transcription job');
        const res = await this.mediaHandler.handleVoice(job.message);
        if (res.text && res.shouldProcess) {
          // save transcription as user message
          await this.repo.appendMessage(job.message.from, 'user', res.text);
          // process through usecase to produce assistant response
          const result = await this.processUsecase.execute(job.message.from, res.text);
          if (result.useOpenAI) {
            // fallback: ask WhatsAppBot to handle openai path; here we simply send placeholder
            await job.reply('Procesando con ChatGPT...');
          } else if (result.response) {
            await job.reply(result.response);
          }
        } else {
          await job.reply('No se pudo transcribir el audio.');
        }
      } catch (e) {
        logger.error('Transcription job failed', e);
        try { await job.reply('Error al procesar el audio.'); } catch {}
      }
    }
  }

  stop() {
    this.running = false;
  }
}

export default TranscriptionQueue;
