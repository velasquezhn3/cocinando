# 📋 Ejemplo de Salida en Consola

Este archivo muestra exactamente cómo se verá la información en la consola del bot.

## Ejemplo 1: Mensaje Individual

```
═══════════════════════════════════════════════════════════
📨 INFORMACIÓN DEL MENSAJE RECIBIDO
═══════════════════════════════════════════════════════════
⏰ Timestamp: 2025-12-05T15:30:45.123Z
👤 De: 1234567890@c.us
📱 Nombre remitente: Carlos Rodríguez
📍 Es grupo: false
🏷️  ID Mensaje: BAE5F12D8E7F6C9A1B2C3D4E5F6G7H8
💬 Tipo mensaje: chat
📄 Contenido: "Hola bot, ¿cuál es el horario de atención?"
🎬 Tiene media: false
💭 Mensaje citado: false
✅ Estado de entrega (ack): 1
═══════════════════════════════════════════════════════════

🤖 Procesando con ChatGPT para: 1234567890@c.us

📊 Información de procesamiento:
   - Usuario: 1234567890@c.us
   - Longitud del prompt: 45 caracteres
   - Mensajes en historial: 3
   - Modelo: gpt-3.5-turbo
   - Token máx: 800
   - Respuesta generada: 156 caracteres
   - Primeros 100 caracteres: "Hola Carlos! Nuestro horario de atención es de lunes a viernes de 9 AM a 6 PM. ¿Hay algo más en lo que pueda ayudarte?"

✅ Respuesta generada (156 caracteres)
```

---

## Ejemplo 2: Mensaje de Grupo

```
═══════════════════════════════════════════════════════════
📨 INFORMACIÓN DEL MENSAJE RECIBIDO
═══════════════════════════════════════════════════════════
⏰ Timestamp: 2025-12-05T15:35:22.456Z
👤 De: 120382109381-1@g.us
📱 Nombre remitente: María González
📍 Es grupo: true
👥 ID Grupo: 120382109381-1@g.us
🏷️  ID Mensaje: BAE5F12D8E7F6C9A2B3C4D5E6F7G8H9
💬 Tipo mensaje: chat
📄 Contenido: "@bot ¿cuál es el estado de mi pedido #12345?"
🎬 Tiene media: false
💭 Mensaje citado: false
@️  Menciones: 1
✅ Estado de entrega (ack): 1
═══════════════════════════════════════════════════════════

🤖 Procesando con ChatGPT para: 120382109381-1@g.us

📊 Información de procesamiento:
   - Usuario: 120382109381-1@g.us
   - Longitud del prompt: 47 caracteres
   - Mensajes en historial: 7
   - Modelo: gpt-3.5-turbo
   - Token máx: 800
   - Respuesta generada: 203 caracteres
   - Primeros 100 caracteres: "Hola María! He verificado tu pedido #12345. Tu orden está en camino y será entregada hoy entre las 5-7 PM. Puedes rastrear tu pedido aquí..."

✅ Respuesta generada (203 caracteres)
```

---

## Ejemplo 3: Mensaje con Media (Imagen)

```
═══════════════════════════════════════════════════════════
📨 INFORMACIÓN DEL MENSAJE RECIBIDO
═══════════════════════════════════════════════════════════
⏰ Timestamp: 2025-12-05T15:40:10.789Z
👤 De: 9876543210@c.us
📱 Nombre remitente: Diego López
📍 Es grupo: false
🏷️  ID Mensaje: BAE5F12D8E7F6C9A3B4C5D6E7F8G9H0
💬 Tipo mensaje: image
📄 Contenido: "Mira esta foto que tomé"
🎬 Tiene media: true
🎥 Tipo media: image
💭 Mensaje citado: false
✅ Estado de entrega (ack): 1
═══════════════════════════════════════════════════════════

📊 Información de procesamiento:
   - Usuario: 9876543210@c.us
   - Longitud del prompt: 24 caracteres
   - Mensajes en historial: 2
   - Modelo: gpt-3.5-turbo
   - Token máx: 800
   - Respuesta generada: 89 caracteres
   - Primeros 100 caracteres: "¡Qué foto tan hermosa! Parece un lugar increíble. ¿Dónde fue tomada?"

✅ Respuesta generada (89 caracteres)
```

---

## Ejemplo 4: Mensaje de Voz (Audio)

```
═══════════════════════════════════════════════════════════
📨 INFORMACIÓN DEL MENSAJE RECIBIDO
═══════════════════════════════════════════════════════════
⏰ Timestamp: 2025-12-05T15:45:33.111Z
👤 De: 5555555555@c.us
📱 Nombre remitente: Laura Martínez
📍 Es grupo: false
🏷️  ID Mensaje: BAE5F12D8E7F6C9A4B5C6D7E8F9G0H1
💬 Tipo mensaje: audio
📄 Contenido: "[Nota de voz de 32 segundos]"
🎬 Tiene media: true
🎥 Tipo media: audio
💭 Mensaje citado: false
✅ Estado de entrega (ack): 1
═══════════════════════════════════════════════════════════

Transcribiendo tu mensaje de voz, te aviso cuando esté listo...
```

---

## Ejemplo 5: Error en Procesamiento

```
═══════════════════════════════════════════════════════════
📨 INFORMACIÓN DEL MENSAJE RECIBIDO
═══════════════════════════════════════════════════════════
⏰ Timestamp: 2025-12-05T15:50:45.222Z
👤 De: 1111111111@c.us
📱 Nombre remitente: Pedro Sánchez
📍 Es grupo: false
🏷️  ID Mensaje: BAE5F12D8E7F6C9A5B6C7D8E9F0G1H2
💬 Tipo mensaje: chat
📄 Contenido: "Hola bot, ¿puedes ayudarme?"
🎬 Tiene media: false
💭 Mensaje citado: false
✅ Estado de entrega (ack): 1
═══════════════════════════════════════════════════════════

❌ Error: API key de OpenAI no válida
```

---

## Ejemplo 6: Respuesta Predefinida (Sin ChatGPT)

```
═══════════════════════════════════════════════════════════
📨 INFORMACIÓN DEL MENSAJE RECIBIDO
═══════════════════════════════════════════════════════════
⏰ Timestamp: 2025-12-05T16:00:00.333Z
👤 De: 2222222222@c.us
📱 Nombre remitente: Ana Torres
📍 Es grupo: false
🏷️  ID Mensaje: BAE5F12D8E7F6C9A6B7C8D9E0F1G2H3
💬 Tipo mensaje: chat
📄 Contenido: "/menu"
🎬 Tiene media: false
💭 Mensaje citado: false
✅ Estado de entrega (ack): 1
═══════════════════════════════════════════════════════════

✉️  Enviando respuesta predefinida a: 2222222222@c.us
📝 Respuesta: "🍕 MENÚ DE OPCIONES
1. Información
2. Reservas
3. Pedidos
4. Hablar con admin"
```

---

## Información Adicional en Logs

Todos estos datos también se guardan automáticamente en archivos de log:
- Ubicación: `logs/` 
- Formato: Un archivo por día (ej: `2025-12-05.log`)
- Contiene: Timestamp, nivel (debug/info/warn/error), mensaje y metadatos
