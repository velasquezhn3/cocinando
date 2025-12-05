import { Queue, Worker, QueueScheduler, Job } from 'bullmq';
import IORedis from 'ioredis';
import MediaHandler from '../whatsapp/MediaHandler';
import { TOKENS } from '../../config/tokens';
import { container } from 'tsyringe';
import WhatsAppSender from '../whatsapp/WhatsAppSender';
import { logger } from '../../shared/utils/Logger';

type JobData = {
  userId: string;
  mediaData: string; // base64
  mimetype?: string;
};

export class BullTranscriptionQueue {
  private queue: Queue;
  private worker?: Worker;
  private scheduler?: QueueScheduler;
  private prefix = 'transcription';
  private mediaHandler: MediaHandler;

  constructor(redisUrl?: string) {
    // ioredis constructor overloads are strict in typings; cast to any to allow
    // passing a connection string from env without extra parsing.
    const connection = new IORedis((redisUrl || process.env.REDIS_URL) as any);
    this.queue = new Queue(this.prefix, { connection });
    this.scheduler = new QueueScheduler(this.prefix, { connection });
    this.mediaHandler = container.resolve(MediaHandler);

    // start worker
    this.worker = new Worker(this.prefix, async (job: Job<JobData>) => {
      const data = job.data;
      try {
        logger.info('BullTranscriptionQueue processing job for ' + data.userId);
        // reconstruct a fake Message-like object for mediaHandler
        const fakeMsg: any = {
          downloadMedia: async () => ({ data: data.mediaData, mimetype: data.mimetype })
        };

        const res = await this.mediaHandler.handleVoice(fakeMsg as any);
        const sender = container.resolve<WhatsAppSender>(WhatsAppSender as any);
        if (!res.text) {
          await sender.sendText(data.userId, 'No se pudo transcribir el audio.');
          return;
        }

        // process transcription through the ProcessMessageUsecase
        const usecase = container.resolve<any>(TOKENS.ProcessMessageUsecase as any);
        const result = await usecase.execute(data.userId, res.text);
        if (result.useOpenAI) {
          await sender.sendText(data.userId, 'Procesando con ChatGPT...');
        }
        if (result.response) {
          await sender.sendText(data.userId, result.response);
        }
      } catch (e) {
        logger.error('Error in BullTranscriptionQueue job', e);
        const sender = container.resolve<WhatsAppSender>(WhatsAppSender as any);
        try { await sender.sendText(data.userId, 'Error al procesar la transcripción.'); } catch {}
      }
    }, { connection });
  }

  async enqueue(data: JobData) {
    await this.queue.add('transcribe', data, { removeOnComplete: 100, removeOnFail: 1000 });
  }

  async close() {
    await this.worker?.close();
    await this.queue.close();
    await this.scheduler?.close();
  }
}

export default BullTranscriptionQueue;
