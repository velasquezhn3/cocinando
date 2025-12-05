import { Cart, CartItem } from '../entities/Cart';

export interface ICartService {
  getCart(userId: string): Promise<Cart>;
  addItem(userId: string, item: { productId: string; name: string; price: number; quantity?: number }): Promise<Cart>;
  removeItem(userId: string, productId: string): Promise<Cart>;
  updateQuantity(userId: string, productId: string, quantity: number): Promise<Cart>;
  clearCart(userId: string): Promise<void>;
  calculateTotal(userId: string): Promise<number>;
}

export default ICartService;
