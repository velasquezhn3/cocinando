// eventHandler.ts
// Handlers para eventos del cliente WhatsApp (conexión, QR, errores, etc.)

import { Client } from 'whatsapp-web.js';

export function registerEventHandlers(client: Client) {
  client.on('qr', (qr) => {
    // Lógica para mostrar QR en consola
    console.log('QR recibido:', qr);
  });

  client.on('ready', () => {
    console.log('Bot listo y conectado a WhatsApp');
  });

  client.on('auth_failure', (msg) => {
    console.error('Fallo de autenticación:', msg);
  });

  // Agrega más eventos según necesidad
}
