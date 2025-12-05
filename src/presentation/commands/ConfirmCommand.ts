import { Command, CommandContext } from './Command.interface';
import { container } from 'tsyringe';
import CartService from '../../infrastructure/services/CartService';
import WhatsAppSender from '../../infrastructure/whatsapp/WhatsAppSender';

export class ConfirmCommand implements Command {
  name = 'confirmar';
  description = 'Confirma un pedido o reservación.';
  permission: 'any' = 'any';

  async validate(ctx: CommandContext) { return true; }

  /**
   * Expected formats (pipe-separated) sent after user follows instructions from checkout/reserva:
   * confirmar pedido: Nombre|Tel|Recoger|Direccion(optional)|Pago|Hora|Notas
   * confirmar reserva: Nombre|Tel|Fecha(DD-MM-YYYY)|Hora(HH:MM)|Personas|Notas
   */
  async execute(ctx: CommandContext): Promise<string> {
    const raw = ctx.rawMessage.trim();
    const body = raw.replace(/^confirmar\s*/i, '').trim();
    if (!body) return 'Formato inválido. Por favor envía los datos en formato: confirmar Nombre|Tel|Recoger|Dirección|Pago|Hora|Notas';

    const parts = body.split('|').map(s => s.trim());

    // Heurística: si hay una fecha con '-' o '/', tratar como reserva
    const looksLikeDate = parts[2] && /\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}/.test(parts[2]);
    const sender = container.resolve<WhatsAppSender>(WhatsAppSender as any);
    if (looksLikeDate) {
      // reservation
      const [name, tel, date, time, peopleRaw, notes] = parts;
      const people = parseInt(peopleRaw || '1', 10) || 1;
      // validate basic
      const dateOk = (() => { try { const d = new Date(date.split('-').reverse().join('-')); return !isNaN(d.getTime()) && d > new Date(); } catch { return false; } })();
      if (!dateOk) return 'La fecha debe ser una fecha futura válida (DD-MM-YYYY).';

      // build message
      const reservaId = `R-${Date.now().toString().slice(-6)}`;
      const groupId = '120363405850870225@g.us';
      const payload = `📅 NUEVA RESERVACIÓN - COCINANDO ASADOS\n\n🎫 RESERVA #${reservaId}\n\n👤 CLIENTE:\nNombre: ${name}\nTeléfono: ${tel}\n\n📆 DETALLES:\nFecha: ${date}\nHora: ${time}\nPersonas: ${people}\n\n🎉 Ocasión especial: ${notes || '-'}\n\n⏰ Reservado el ${new Date().toLocaleString()}`;
      try { await sender.sendText(groupId, payload); } catch (e) { return 'Error enviando la reservación al grupo. Intenta nuevamente.'; }
      return `✅ ¡Reservación confirmada! Tu reserva #${reservaId} fue enviada al equipo. Te recomendamos llegar 10-15 minutos antes.`;
    }

    // otherwise assume it's an order confirmation
    // Expected: Name|Tel|Recoger|Direccion?|Pago|Hora|Notas
    const [name, tel, tipoServicio, direccion, metodoPago, hora, notas] = parts;
    const cartSvc = container.resolve<CartService>(CartService as any);
    const cart = await cartSvc.getCart(ctx.userId);
    if (!cart || cart.items.length === 0) return 'Tu carrito está vacío. Agrega items antes de confirmar.';

    const orderId = `P-${Date.now().toString().slice(-6)}`;
    const groupId = '120363423892571140@g.us';

    let productsText = '';
    cart.items.forEach((it, i) => { productsText += `${i + 1}. ${it.name} x ${it.quantity} - L.${it.price}\n`; });
    const total = await cartSvc.calculateTotal(ctx.userId);

    const payload = `🔥 NUEVO PEDIDO - COCINANDO ASADOS 🍖\n\n📋 PEDIDO #${orderId}\n📅 Fecha: ${new Date().toLocaleString()}\n\n👤 CLIENTE:\nNombre: ${name}\nTeléfono: ${tel}\n\n📦 TIPO: ${tipoServicio || 'Recoger'}\n🏠 Dirección: ${direccion || '-'}\n🕐 Hora solicitada: ${hora || '-'}\n\n🍽️ PRODUCTOS:\n${productsText}\n💰 TOTAL: L.${total}\n💳 Método de pago: ${metodoPago || '-'}\n\n📝 Notas: ${notas || '-'}\n\n⏰ Recibido a las ${new Date().toLocaleTimeString()}`;

    try { await sender.sendText(groupId, payload); } catch (e) { return 'Error enviando el pedido al grupo. Intenta nuevamente.'; }

    // clear cart after confirmed
    await cartSvc.clearCart(ctx.userId);

    return `✅ ¡Pedido confirmado! Tu pedido #${orderId} fue enviado al equipo. Tiempo estimado: 35-60 minutos según demanda.`;
  }
}

export default ConfirmCommand;
