import { Command, CommandContext } from './Command.interface';
import { getWhatsAppClient } from '../../services/whatsapp';

export class ListGroupsCommand implements Command {
  name = 'listgroups';
  description = 'Muestra los IDs de todos los grupos donde el bot está presente';
  permission: 'any' = 'any';

  async validate(ctx: CommandContext): Promise<boolean> {
    return true;
  }

  async execute(ctx: CommandContext): Promise<string> {
    try {
      const client = getWhatsAppClient();
      const chats = await client.getChats();
      const groups = chats.filter((chat: any) => chat.isGroup);

      if (groups.length === 0) {
        return '📭 No estoy en ningún grupo.';
      }

      let response = '*📋 IDs de los grupos:*\n\n';
      groups.forEach((group: any) => {
        response += `• *${group.name}*\n  ID: \`${group.id._serialized}\`\n`;
      });

      return response;
    } catch (err) {
      return '❌ Error al obtener lista de grupos. Asegúrate de que el bot está conectado a WhatsApp.';
    }
  }
}
