# Registro Detallado de Mensajes en Consola

## Descripción General

Se ha implementado un sistema completo de logging en consola que muestra información detallada de cada mensaje recibido en el bot de WhatsApp. Esto incluye:

- **ID de teléfono/usuario**
- **Información de grupos**
- **Tipo de mensaje**
- **Estado de entrega**
- **Metadatos del mensaje**
- **Información de procesamiento**
- **Detalles de respuestas**

---

## Información Mostrada por Mensaje

### 1. **Bloque Principal de Información del Mensaje** (Encabezado)

Cuando se recibe un mensaje, se muestra un bloque con separadores visuales:

```
═══════════════════════════════════════════════════════════
📨 INFORMACIÓN DEL MENSAJE RECIBIDO
═══════════════════════════════════════════════════════════
⏰ Timestamp: 2025-12-05T15:30:45.123Z
👤 De: 1234567890@c.us
📱 Nombre remitente: Juan Pérez
📍 Es grupo: false
🏷️  ID Mensaje: BAE5F12D8E7F6C9A1B2C3D4E5F6G7H8
💬 Tipo mensaje: chat
📄 Contenido: "Hola, ¿cómo estás?"
🎬 Tiene media: false
💭 Mensaje citado: false
✅ Estado de entrega (ack): 1
═══════════════════════════════════════════════════════════
```

### 2. **Campos de Información Mostrados**

| Campo | Descripción | Ejemplo |
|-------|-------------|---------|
| `⏰ Timestamp` | Fecha y hora exacta del mensaje | `2025-12-05T15:30:45.123Z` |
| `👤 De` | ID del remitente (usuario o grupo) | `1234567890@c.us` o `120382109381-1@g.us` |
| `📱 Nombre remitente` | Nombre guardado en WhatsApp | `Juan Pérez` |
| `📍 Es grupo` | Si el mensaje viene de un grupo | `true` / `false` |
| `👥 ID Grupo` | ID único del grupo (solo si es grupo) | `120382109381-1@g.us` |
| `🏷️  ID Mensaje` | Identificador único del mensaje | `BAE5F12D8E7F6C9A1B2C3D4E5F6G7H8` |
| `💬 Tipo mensaje` | Tipo de contenido | `chat`, `image`, `video`, `audio`, `document`, etc. |
| `📄 Contenido` | Primeros 100 caracteres del mensaje | `"Hola, ¿cómo estás?"` |
| `🎬 Tiene media` | Si incluye multimedia | `true` / `false` |
| `🎥 Tipo media` | Tipo de archivo multimedia | `image`, `video`, `audio`, etc. |
| `💭 Mensaje citado` | Si es respuesta a otro mensaje | `true` / `false` |
| `@️  Menciones` | Cantidad de menciones (@) en el grupo | `2` |
| `✅ Estado de entrega (ack)` | Estado de entrega del mensaje | `1` = recibido, `2` = leído, etc. |

---

## 3. **Información de Procesamiento**

Cuando el bot procesa un mensaje con ChatGPT:

```
🤖 Procesando con ChatGPT para: 1234567890@c.us

📊 Información de procesamiento:
   - Usuario: 1234567890@c.us
   - Longitud del prompt: 156 caracteres
   - Mensajes en historial: 5
   - Modelo: gpt-3.5-turbo
   - Token máx: 800
   - Respuesta generada: 342 caracteres
   - Primeros 100 caracteres: "Hola Juan! Me alegra tu pregunta sobre..."
```

### Campos de Procesamiento

| Campo | Descripción |
|-------|-------------|
| `Usuario` | ID del usuario que envió el mensaje |
| `Longitud del prompt` | Número de caracteres del mensaje |
| `Mensajes en historial` | Cantidad de mensajes previos en la conversación |
| `Modelo` | Modelo de OpenAI utilizado |
| `Token máx` | Máximo de tokens para la respuesta |
| `Respuesta generada` | Número de caracteres de la respuesta |
| `Primeros 100 caracteres` | Vista previa de la respuesta |

---

## 4. **Información de Respuestas**

Se muestra información sobre cada respuesta enviada:

```
✉️  Enviando respuesta predefinida a: 1234567890@c.us
📝 Respuesta: "Aquí está la información que solicitaste..."

✅ Respuesta generada (342 caracteres)
```

---

## 5. **Manejo de Errores**

En caso de errores:

```
❌ Error: [descripción del error]
```

---

## Archivos Modificados

1. **[src/infrastructure/whatsapp/WhatsAppBot.ts](src/infrastructure/whatsapp/WhatsAppBot.ts)**
   - Agregada función `logMessageDetails()` para formatear y mostrar información
   - Mejorado `handleIncomingMessage()` para registrar detalles
   - Mejorado `processWithChatGPT()` para mostrar información de procesamiento

2. **[src/handlers/messageHandler.ts](src/handlers/messageHandler.ts)**
   - Agregado registro detallado al recibir mensajes
   - Información de tipo, origen y contenido del mensaje

---

## Cómo Interpretar la Información

### Identificar Mensajes de Grupos

```
📍 Es grupo: true
👥 ID Grupo: 120382109381-1@g.us
```

Un grupo tiene un ID que termina en `@g.us`, mientras que los usuarios individuales terminan en `@c.us`.

### Ver el Estado de Entrega

El campo `✅ Estado de entrega (ack)` tiene los siguientes valores:
- `0` = Enviado
- `1` = Recibido
- `2` = Reproducido (para mensajes de voz)
- `3` = Leído

### Identificar Tipos de Mensajes

| Tipo | Descripción |
|------|-------------|
| `chat` | Mensaje de texto |
| `image` | Imagen |
| `video` | Video |
| `audio` | Nota de voz |
| `document` | Documento (PDF, Word, etc.) |
| `sticker` | Sticker |
| `location` | Ubicación |
| `contact` | Tarjeta de contacto |

---

## Beneficios

✅ **Debugging fácil**: Ver exactamente qué información recibe el bot  
✅ **Monitoreo**: Rastrear grupos, usuarios y tipos de mensajes  
✅ **Análisis**: Comprender patrones de uso y procesamiento  
✅ **Errores**: Identificar problemas rápidamente  
✅ **Auditoría**: Registro completo de todas las interacciones  

---

## Nota

Toda esta información también se registra en los archivos de log en la carpeta `logs/` con la fecha del día, para un análisis posterior más detallado.
