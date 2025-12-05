import { OpenAI } from 'openai';
import { injectable } from 'tsyringe';
import * as fs from 'fs';
import * as path from 'path';

@injectable()
export class OpenAIClient {
  private client: OpenAI;

  constructor(apiKey?: string) {
    this.client = new OpenAI({ apiKey: apiKey || process.env.OPENAI_API_KEY });
  }

  async createChatCompletion(opts: any) {
    return this.client.chat.completions.create(opts);
  }

  /**
   * Transcribe an audio file using OpenAI Whisper (model: whisper-1)
   * Expects a local file path.
   */
  async transcribeAudio(filePath: string, model = 'whisper-1') {
    // the OpenAI SDK's audio.transcriptions.create expects a file stream
    const stream = fs.createReadStream(filePath);
    // @ts-ignore - pass through to SDK
    const resp = await (this.client as any).audio.transcriptions.create({ file: stream, model });
    // response may contain 'text' or 'data' depending on SDK version
    return resp?.text ?? resp?.data ?? '';
  }
}

export default OpenAIClient;
