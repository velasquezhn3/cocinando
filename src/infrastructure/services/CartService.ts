import ICartService from '../../domain/services/ICartService';
import { Cart, CartItem } from '../../domain/entities/Cart';
import { MENU, findProduct } from '../data/menu';

export class CartService implements ICartService {
  private store: Map<string, Cart> = new Map();

  async getCart(userId: string): Promise<Cart> {
    const now = new Date().toISOString();
    const cart = this.store.get(userId) ?? { userId, items: [], updatedAt: now };
    return cart;
  }

  async addItem(userId: string, item: { productId: string; name: string; price: number; quantity?: number }): Promise<Cart> {
    const cart = await this.getCart(userId);
    const qty = item.quantity && item.quantity > 0 ? item.quantity : 1;
    const existing = cart.items.find(i => i.productId === item.productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      cart.items.push({ productId: item.productId, name: item.name, price: item.price, quantity: qty });
    }
    cart.updatedAt = new Date().toISOString();
    this.store.set(userId, cart);
    return cart;
  }

  async removeItem(userId: string, productId: string): Promise<Cart> {
    const cart = await this.getCart(userId);
    cart.items = cart.items.filter(i => i.productId !== productId);
    cart.updatedAt = new Date().toISOString();
    this.store.set(userId, cart);
    return cart;
  }

  async updateQuantity(userId: string, productId: string, quantity: number): Promise<Cart> {
    const cart = await this.getCart(userId);
    const item = cart.items.find(i => i.productId === productId);
    if (!item) return cart;
    if (quantity <= 0) {
      cart.items = cart.items.filter(i => i.productId !== productId);
    } else {
      item.quantity = quantity;
    }
    cart.updatedAt = new Date().toISOString();
    this.store.set(userId, cart);
    return cart;
  }

  async clearCart(userId: string): Promise<void> {
    this.store.delete(userId);
  }

  async calculateTotal(userId: string): Promise<number> {
    const cart = await this.getCart(userId);
    return cart.items.reduce((s, it) => s + (it.price * it.quantity), 0);
  }
}

export default CartService;
