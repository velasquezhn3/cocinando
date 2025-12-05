import { Command, CommandContext } from './Command.interface';

export class UbicacionCommand implements Command {
  name = 'ubicacion';
  description = 'Proporciona la dirección y cómo llegar';
  permission: 'any' = 'any';

  async execute(ctx: CommandContext): Promise<string> {
    return '📍 Nos encuentras en Calle Falsa 123, Ciudad Ejemplo.\nPuedes ver la ubicación aquí: https://maps.google.com/?q=Calle+Falsa+123';
  }
}
