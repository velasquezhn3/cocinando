import { Message, MessageMedia } from 'whatsapp-web.js';
import OpenAIClient from '../ai/OpenAIClient';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

/**
 * MediaHandler: small abstraction for processing images and voice messages.
 * Currently provides lightweight placeholders. Swap internals to call
 * Whisper/Google Speech/OCR when ready.
 */

export type MediaProcessResult = {
  text: string; // transcription or description
  shouldProcess: boolean; // whether result needs further processing (eg. send to OpenAI)
};

export class MediaHandler {
  constructor(private tempFolder = './tmp', private openaiClient?: OpenAIClient) {}

  private async ensureTempDir() {
    try { await fs.promises.mkdir(this.tempFolder, { recursive: true }); } catch {}
  }

  async handleImage(message: Message): Promise<MediaProcessResult> {
    // placeholder: download image and return a short description or prompt
    try {
      const media = await message.downloadMedia();
      if (!media) return { text: '', shouldProcess: false };
      // In future: save to disk and run an image captioning model or OCR
      return { text: '[IMAGEN] Usuario envió una imagen. Describe la imagen y extrae información relevante.', shouldProcess: true };
    } catch (e) {
      return { text: '', shouldProcess: false };
    }
  }

  async handleVoice(message: Message): Promise<MediaProcessResult> {
    // if OpenAI Whisper enabled and client provided, transcribe
    try {
      const media = await message.downloadMedia();
      if (!media || !media.data) return { text: '', shouldProcess: false };

      // if we have an OpenAI client and env flag, write temp file and transcribe
      const useWhisper = process.env.USE_WHISPER === 'true' && !!this.openaiClient;
      if (useWhisper) {
        await this.ensureTempDir();
        const buffer = Buffer.from(media.data, 'base64');
        // determine extension from mimetype
        const ext = (media.mimetype && media.mimetype.split('/')[1]) || 'ogg';
        const tmpName = path.join(this.tempFolder, `${uuidv4()}.${ext}`);
        await fs.promises.writeFile(tmpName, buffer);
        try {
          const text = await this.openaiClient!.transcribeAudio(tmpName);
          return { text: text ?? '', shouldProcess: true };
        } finally {
          // cleanup
          try { await fs.promises.unlink(tmpName); } catch {}
        }
      }

      // fallback placeholder
      return { text: '[AUDIO] Usuario envió un mensaje de voz. Transcribir y procesar.', shouldProcess: true };
    } catch (e) {
      return { text: '', shouldProcess: false };
    }
  }
}

export default MediaHandler;
