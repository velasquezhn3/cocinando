import * as whatsappService from '../src/services/whatsapp';
import { ListGroupsCommand } from '../src/commands/listgroups';

async function run() {
  // Mock the WhatsApp client used by ListGroupsCommand
  (whatsappService as any).getWhatsAppClient = () => ({
    getChats: async () => [
      { isGroup: true, name: 'Grupo A', id: { _serialized: 'g1' } },
      { isGroup: false, name: 'Contacto B', id: { _serialized: 'c1' } },
      { isGroup: true, name: 'Grupo Cocina', id: { _serialized: 'g2' } }
    ]
  });

  const cmd = new ListGroupsCommand();
  const ctx: any = {
    replies: [] as string[],
    reply: async (t: string) => { ctx.replies.push(t); }
  };

  await cmd.execute(ctx);
  console.log('\n=== ListGroupsCommand replies ===\n');
  console.log(ctx.replies.join('\n\n---\n\n'));
}

run().catch(err => { console.error(err); process.exit(1); });
