import { Command, CommandContext } from './Command.interface';

function formatUptime(sec: number): string {
  const s = Math.floor(sec % 60);
  const m = Math.floor((sec / 60) % 60);
  const h = Math.floor(sec / 3600);
  return `${h}h ${m}m ${s}s`;
}

export class StatusCommand implements Command {
  name = 'status';
  description = 'Muestra el estado actual del bot';
  permission: 'any' = 'any';

  async validate(ctx: CommandContext): Promise<boolean> {
    return true;
  }

  async execute(ctx: CommandContext): Promise<string> {
    try {
      // Dinamically import package.json to get version
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const pkg = require('../../../package.json');
      const version = pkg?.version ?? 'unknown';
      const uptime = formatUptime(process.uptime());
      const mem = process.memoryUsage();
      const rssMb = Math.round((mem.rss || 0) / 1024 / 1024);
      const heapUsedMb = Math.round((mem.heapUsed || 0) / 1024 / 1024);

      const message = [
        `🤖 Estado del bot:`,
        `• Versión: ${version}`,
        `• Node: ${process.version}`,
        `• Uptime: ${uptime}`,
        `• Memoria RSS: ${rssMb} MB`,
        `• Heap usado: ${heapUsedMb} MB`
      ].join('\n');

      return message;
    } catch (err) {
      return '❌ Error al obtener estado del bot';
    }
  }
}
