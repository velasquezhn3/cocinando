import { Command, CommandContext } from './Command.interface';
import { container } from 'tsyringe';
import CartService from '../../infrastructure/services/CartService';
import { findProduct } from '../../infrastructure/data/menu';

export class CartCommand implements Command {
  name = 'carrito';
  description = 'Gestiona el carrito: agregar, ver, eliminar, checkout';
  permission: 'any' = 'any';

  async validate(ctx: CommandContext) {
    return true;
  }

  async execute(ctx: CommandContext): Promise<string> {
    const raw = ctx.rawMessage.trim();
    const parts = raw.split(/\s+/).slice(1); // remove command token
    const cartSvc = container.resolve(CartService);

    // parse subcommands: agregar <producto> <cantidad>
    if (parts.length === 0 || ['ver', 'mostrar', 'list'].includes(parts[0].toLowerCase())) {
      const cart = await cartSvc.getCart(ctx.userId);
      if (cart.items.length === 0) return 'Tu carrito está vacío. 🍽️';
      let resp = '🛒 Tu carrito:\n';
      cart.items.forEach((it, idx) => {
        resp += `${idx + 1}. ${it.name} x ${it.quantity} - L.${it.price} c/u\n`;
      });
      const total = await cartSvc.calculateTotal(ctx.userId);
      resp += `\n💰 Total: L.${total}`;
      return resp;
    }

    if (['agregar', 'añadir', 'add'].includes(parts[0].toLowerCase())) {
      // format: agregar <producto> <cantidad?>
      const productTerm = parts.slice(1, 3).join(' ');
      const qtyRaw = parts[parts.length - 1];
      let qty = 1;
      const maybeQty = parseInt(qtyRaw, 10);
      if (!isNaN(maybeQty)) qty = maybeQty;
      const prod = findProduct(productTerm) || findProduct(parts[1] || '');
      if (!prod) return `No encontré el producto "${productTerm}" en el menú.`;
      await cartSvc.addItem(ctx.userId, { productId: prod.id, name: prod.name, price: prod.price, quantity: qty });
      const total = await cartSvc.calculateTotal(ctx.userId);
      return `✅ Agregado ${prod.name} x${qty} al carrito.\n💰 Total ahora: L.${total}`;
    }

    if (['eliminar', 'quitar', 'remove'].includes(parts[0].toLowerCase())) {
      const productTerm = parts.slice(1).join(' ');
      const prod = findProduct(productTerm) || findProduct(parts[1] || '');
      if (!prod) return `No encontré el producto "${productTerm}" en el carrito.`;
      await cartSvc.removeItem(ctx.userId, prod.id);
      const total = await cartSvc.calculateTotal(ctx.userId);
      return `🗑️ Eliminado ${prod.name} del carrito.\n💰 Total ahora: L.${total}`;
    }

    if (['checkout', 'pagar', 'confirmar'].includes(parts[0].toLowerCase())) {
      // provide instructions to confirm the order via the ConfirmCommand
      const cart = await cartSvc.getCart(ctx.userId);
      if (cart.items.length === 0) return 'Tu carrito está vacío. Agrega productos antes de hacer checkout.';
      let resp = '🧾 Resumen de tu pedido:\n';
      cart.items.forEach((it, idx) => { resp += `${idx + 1}. ${it.name} x ${it.quantity} - L.${it.price}\n`; });
      const total = await cartSvc.calculateTotal(ctx.userId);
      resp += `\n💰 Total: L.${total}\n\n`;
      resp += 'Para confirmar el pedido por favor responde con este formato (copiar y pegar):\n';
      resp += 'confirmar Nombre|Teléfono|Recoger|Dirección(en caso de delivery)|Método de pago|Hora preferida|Notas opcionales\n\n';
      resp += 'Ejemplo:\nconfirmar Juan Perez|89484315|Delivery|Barrio Centro, Casa 12|Efectivo|20:30|Sin picante';
      return resp;
    }

    return 'Comando de carrito no reconocido. Usa: "carrito ver", "carrito agregar <producto> <cantidad>", "carrito eliminar <producto>"';
  }
}

export default CartCommand;
