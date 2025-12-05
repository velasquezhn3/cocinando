import { Command, CommandContext } from './Command.interface';
import { container } from 'tsyringe';
import WhatsAppSender from '../../infrastructure/whatsapp/WhatsAppSender';
import * as path from 'path';
import * as fs from 'fs';
import MENU from '../../infrastructure/data/menu';

export class MenuCommand implements Command {
  name = 'menu';
  description = 'Muestra el menú del restaurante';
  permission: 'any' = 'any';

  async validate(ctx: CommandContext) {
    return true;
  }

  async execute(ctx: CommandContext): Promise<string> {
    const parts = (ctx.rawMessage || '').trim().split(/\s+/).slice(1);

    // Build menu text from catalog
    const categories: Record<string, Array<{name:string,price:number}>> = {};
    for (const p of MENU) {
      categories[p.category] = categories[p.category] || [];
      categories[p.category].push({ name: p.name, price: p.price });
    }

    let menuText = '📋 *Menú CociNando Asados* 🍖\n\n';
    for (const cat of Object.keys(categories)) {
      menuText += `*${cat}*:\n`;
      for (const it of categories[cat]) {
        menuText += `- ${it.name} - L.${it.price}\n`;
      }
      menuText += '\n';
    }

    // Try to send images if user asked explicitly or always when available
    const tryImages = parts.length === 0 || ['imagenes', 'fotos', 'menuimagenes', 'menu', 'menuimagenes'].includes((parts[0] || '').toLowerCase()) || (ctx.rawMessage || '').toLowerCase().includes('imagen');

    if (tryImages) {
      try {
        const sender = container.resolve<WhatsAppSender>(WhatsAppSender as any);
        const base = path.join(process.cwd(), 'info');
        const candidates = ['menu1','menu2','menu3','img1','img2','img3'];
        const exts = ['.jpg','.jpeg','.png','.webp','.mp4'];
        let sentAny = false;
        for (const c of candidates) {
          for (const e of exts) {
            const f = path.join(base, c + e);
            if (fs.existsSync(f)) {
              try { await sender.sendMedia(ctx.userId, f, 'Menú - CociNando Asados 🍖'); sentAny = true; } catch (e) { /* ignore individual failures */ }
              break;
            }
          }
        }
        if (sentAny) {
          // also return text summary after images
          return menuText + '\n¿Quieres que te muestre detalles de algún plato?';
        }
      } catch (e) {
        // fall through to return text
      }
    }

    return menuText + '\n¿Qué te gustaría pedir?';
  }
}
