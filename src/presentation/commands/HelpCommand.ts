import { Command, CommandContext } from './Command.interface';
import { CommandRegistry } from './CommandRegistry';

export class HelpCommand implements Command {
  name = 'help';
  description = 'Lista los comandos disponibles';
  permission: 'any' = 'any';

  constructor(private registry?: CommandRegistry) {}

  async execute(ctx: CommandContext): Promise<string> {
    if (!this.registry) return 'Comandos indisponibles';
    const commands = this.registry.list().map(c => `- ${c.name}: ${c.description ?? ''}`).join('\n');
    return `Aquí están los comandos disponibles:\n${commands}`;
  }
}
