import { Command, CommandContext } from './Command.interface';

export class HorarioCommand implements Command {
  name = 'horario';
  description = 'Muestra el horario del restaurante';
  permission: 'any' = 'any';

  async execute(ctx: CommandContext): Promise<string> {
    // A simple static response; could fetch from config or external service
    return '🕒 Nuestro horario es:\nLunes a Viernes: 10:00 - 22:00\nSábados: 11:00 - 23:00\nDomingos: 11:00 - 18:00';
  }
}
