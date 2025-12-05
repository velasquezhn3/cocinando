import { Client } from 'whatsapp-web.js';
import { MessageMedia } from 'whatsapp-web.js';
import * as fs from 'fs';
import * as path from 'path';

/**
 * WhatsAppSender: thin wrapper to send messages via whatsapp-web.js Client.
 * Registered in DI by WhatsAppBot after client initialization so workers can send messages.
 */
export class WhatsAppSender {
  private client?: Client;

  constructor(client?: Client) {
    this.client = client;
  }

  setClient(client: Client) {
    this.client = client;
  }

  async sendText(to: string, text: string): Promise<void> {
    if (!this.client) throw new Error('WhatsApp client not initialized');
    await this.client.sendMessage(to, text);
  }

  async sendMedia(to: string, filePath: string, caption?: string): Promise<void> {
    if (!this.client) throw new Error('WhatsApp client not initialized');
    // Resolve path relative to project root
    const abs = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(abs)) throw new Error(`Media file not found: ${abs}`);
    const data = fs.readFileSync(abs, { encoding: 'base64' });
    const ext = path.extname(abs).slice(1);
    const mime = ext === 'mp4' ? 'video/mp4' : `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    const media = new MessageMedia(mime, data, path.basename(abs));
    await this.client.sendMessage(to, media, { caption });
  }
}

export default WhatsAppSender;
