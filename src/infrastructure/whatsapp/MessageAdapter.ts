import { Message, MessageTypes } from 'whatsapp-web.js';
import { MediaHandler, MediaProcessResult } from './MediaHandler';

export type AdaptedMessage = {
  userId: string;
  text: string; // primary text to process (may be transcription or caption)
  originalText?: string; // raw user text when present
  media?: {
    type: 'image' | 'voice' | 'other';
    processed?: MediaProcessResult;
  };
  reply: (text: string) => Promise<void>;
};

/**
 * MessageAdapter: normalize whatsapp-web.js Message into AdaptedMessage
 */
export class MessageAdapter {
  constructor(private mediaHandler = new MediaHandler()) {}

  async adapt(message: Message): Promise<AdaptedMessage> {
    const userId = message.from;
    // default reply helper
    const reply = async (t: string) => {
      try {
        await message.reply(t);
      } catch (e) {
        // swallow
      }
    };

    if (message.type === MessageTypes.TEXT) {
      return { userId, text: message.body, originalText: message.body, reply };
    }

    if (message.type === MessageTypes.IMAGE) {
      const processed = await this.mediaHandler.handleImage(message);
      return { userId, text: processed.text, media: { type: 'image', processed }, reply };
    }

    if (message.type === MessageTypes.VOICE) {
      const processed = await this.mediaHandler.handleVoice(message);
      return { userId, text: processed.text, media: { type: 'voice', processed }, reply };
    }

    // other media types fallback
    return { userId, text: '', media: { type: 'other' }, reply };
  }
}

export default MessageAdapter;
