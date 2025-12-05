// whatsapp.ts
// Wrapper del cliente WhatsApp
// Encapsula la inicialización y eventos del cliente WhatsApp

import { Client, LocalAuth } from 'whatsapp-web.js';

let clientInstance: Client | null = null;

export function initWhatsAppClient(options: any): Client {
  clientInstance = new Client(options);
  return clientInstance;
}

export function getWhatsAppClient(): Client {
  if (!clientInstance) throw new Error('Cliente WhatsApp no inicializado');
  return clientInstance;
}
