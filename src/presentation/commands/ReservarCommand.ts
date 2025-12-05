import { Command, CommandContext } from './Command.interface';

export class ReservarCommand implements Command {
  name = 'reservar';
  description = 'Inicia el flujo de reservación y da instrucciones para confirmar.';
  permission: 'any' = 'any';

  async validate(ctx: CommandContext) { return true; }

  async execute(ctx: CommandContext): Promise<string> {
    return `📅 Vamos a reservar una mesa. Por favor envía los datos en este formato (copiar + pegar):\n\n` +
      `confirmar Nombre|Teléfono|DD-MM-YYYY|HH:MM|Personas|Notas(opcional)\n\n` +
      `Ejemplo:\nconfirmar Juan Perez|89484315|25-12-2025|20:30|4|Cumpleaños`;
  }
}

export default ReservarCommand;
