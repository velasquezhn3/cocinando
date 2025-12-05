// Handler de evento: Mensaje recibido
// Este archivo maneja los mensajes entrantes de WhatsApp.

import { handleMessage } from '../flows/messageFlow';

export function onMessage(message: any) {
  // Aquí se procesa el mensaje recibido
  handleMessage(message);
}
