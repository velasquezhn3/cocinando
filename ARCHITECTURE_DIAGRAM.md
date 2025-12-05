# Arquitectura propuesta (resumen)

Capas principales:
- `config/` - configuración y bootstrapping (DI container)
- `domain/` - entidades y contratos (interfaces de repositorio)
- `application/` - casos de uso (no implementados en esta entrega mínima)
- `infrastructure/` - adaptadores (WhatsApp client, AI parser, storage)
- `presentation/` - comandos y middleware
- `shared/` - utilidades compartidas (logger, errores)

Flujo simplificado de un mensaje:
1. WhatsApp client recibe mensaje (adapter)
2. Middleware chain: Auth -> RateLimit -> Validation
3. IntentParser local analiza intención
   - Si es comando: `CommandRegistry` ejecuta comando
   - Si es intención de negocio (ej: reservar): `ConversationService` crea/actualiza estado
   - Si no hay intención clara: llamar a OpenAI para generación conversacional
4. Respuesta formateada y enviada por `WhatsAppClient` adapter

Decisiones clave:
- IntentParser local reduce cost/time de llamadas a OpenAI.
- Repository pattern permite cambiar InMemory -> Redis sin tocar lógica de negocio.
- DI via `tsyringe` desacopla dependencias y facilita testing.
# 🏗️ Arquitectura del Intérprete de Intenciones

## 📐 Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                     WHATSAPP WEB.JS CLIENT                      │
│                   (Recibe mensajes de clientes)                 │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   handleIncomingMessage()            │
        │   (Punto de entrada)                 │
        └──────────────┬───────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────────────┐
        │ ¿Es mensaje de texto?                │
        └──┬──────────────────────────────┬────┘
           │ SÍ                           │ NO
           │                              │
           ▼                              ▼
    ┌────────────────────────┐    ┌──────────────────┐
    │ interpretUserIntent()  │    │Procesar imagen   │
    │                        │    │Procesar audio    │
    │ (Intérprete IA)        │    │(Legacy)          │
    └────────┬───────────────┘    └──────────────────┘
             │
             ▼ Detecta intención
    ┌──────────────────────────────┐
    │ handleIntentCommand()         │
    │ (Router de intenciones)       │
    └──┬──────────┬──────┬──────┬───┬──────┐
       │          │      │      │   │      │
       ▼          ▼      ▼      ▼   ▼      ▼
     menu     horario ubicacion reser precio ninguno
       │          │      │      │   │      │
       ▼          ▼      ▼      ▼   ▼      ▼
    Lee /info  ChatGPT ChatGPT ChatGPT ChatGPT ChatGPT
    Envía img  Horario Ubicac  Reserv  Precio  Normal
       │          │      │      │   │      │
       └──────────┴──────┴──────┴───┴──────┘
                        │
                        ▼
             ┌──────────────────────┐
             │ Respuesta al cliente │
             └──────────────────────┘
```

---

## 🔄 Flujo de Datos

### Paso 1: Recepción del Mensaje

```
WhatsApp Web.js
    │
    ├─ De: +50496756588
    ├─ Mensaje: "Qué venden?"
    ├─ Timestamp: 2024-12-03 14:30:00
    └─ Tipo: TEXT
         │
         ▼
   handleIncomingMessage()
```

### Paso 2: Análisis del Intérprete

```
interpretUserIntent("Qué venden?")
    │
    ├─ Temperature: 0.3 (determinístico)
    ├─ Max tokens: 50
    ├─ Prompt del intérprete...
    │
    ▼ OpenAI API
    
Intérprete analiza:
    ├─ Palabras clave: "Qué", "venden"
    ├─ Contexto: Pregunta sobre productos
    ├─ Intención: menu
    │
    ▼
Retorna: "menu"
```

### Paso 3: Ejecución de Intención

```
handleIntentCommand(message, "menu")
    │
    ├─ if intent === "menu"
    │   ├─ Verifica: ¿Existe /info/ ?
    │   ├─ Lee archivos: *.jpg, *.png, *.gif
    │   │
    │   ├─ Si hay imágenes:
    │   │  ├─ Envía: "📋 *Mostrando menú:*"
    │   │  ├─ Envía: [imagen1.jpg]
    │   │  ├─ Espera: 500ms
    │   │  └─ Envía: [imagen2.jpg]
    │   │
    │   └─ Si no hay imágenes:
    │      ├─ Llama ChatGPT: "Muéstrame menú"
    │      └─ Envía respuesta de texto
    │
    ▼
Respuesta enviada al cliente
```

### Paso 4: Logging y Métricas

```
Logger
├─ 🎯 Intención detectada: menu
├─ ⏱️  Tiempo de análisis: 300ms
├─ 👤 Usuario: +50496756588
├─ 📝 Mensaje: "Qué venden?"
└─ ✅ Intención ejecutada correctamente
```

---

## 🧠 Estructura del Prompt del Intérprete

```
┌─────────────────────────────────────────────────────────────┐
│           INTENT_INTERPRETER_PROMPT                         │
│                                                             │
│  1. Rol del Modelo                                          │
│     "Eres un Intérprete de Intenciones..."                │
│                                                             │
│  2. Regla Fundamental                                       │
│     "Solo devuelve UN comando, nada más"                  │
│                                                             │
│  3. Comandos Válidos                                        │
│     menu, horario, ubicacion, reservar, precio:x, ninguno  │
│                                                             │
│  4. Palabras Clave por Intención                            │
│     menu: menú, qué, venden, tienen, hay, catálogo...     │
│     horario: hora, horario, abierto, cierre...            │
│     ubicacion: dónde, ubicación, dirección...             │
│     reservar: reserva, mesa, disponible...                │
│     precio: cuánto, cuesta, precio, vale...               │
│                                                             │
│  5. Ejemplos de Mapeo                                       │
│     "Qué venden?" → menu                                   │
│     "A qué horas?" → horario                               │
│     "Dónde están?" → ubicacion                             │
│     ...                                                     │
│                                                             │
│  6. Casos Especiales                                        │
│     Saludos + intención: ignora saludo                     │
│     Múltiples preguntas: elige primera clara              │
│     Preguntas ambiguas: mejor opción                       │
│                                                             │
│  7. Formato de Respuesta                                    │
│     SOLO EL COMANDO, NADA MAS                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Matriz de Decisión

```
Mensaje del Cliente
    │
    ├─ Contiene "menú", "qué", "venden", etc?
    │  └─ SÍ: menu
    │
    ├─ Contiene "hora", "horario", "abierto", etc?
    │  └─ SÍ: horario
    │
    ├─ Contiene "dónde", "ubicación", "dirección", etc?
    │  └─ SÍ: ubicacion
    │
    ├─ Contiene "reserva", "mesa", "disponible", etc?
    │  └─ SÍ: reservar
    │
    ├─ Contiene "cuánto", "cuesta", "precio", etc?
    │  ├─ SÍ: Extrae nombre del producto
    │  └─ Retorna: precio:<producto>
    │
    └─ Ninguna coincidencia?
       └─ ninguno (ChatGPT responde normalmente)
```

---

## 🎯 Mapeo de Intenciones a Acciones

```
┌─────────────┬─────────────────────┬──────────────────────────┐
│ Intención   │ Función             │ Acción                   │
├─────────────┼─────────────────────┼──────────────────────────┤
│ menu        │ Lógica especial     │ Envía imágenes o texto   │
├─────────────┼─────────────────────┼──────────────────────────┤
│ horario     │ ChatGPT             │ "¿Horario de atención?"  │
├─────────────┼─────────────────────┼──────────────────────────┤
│ ubicacion   │ ChatGPT             │ "¿Dónde ubicado?"        │
├─────────────┼─────────────────────┼──────────────────────────┤
│ reservar    │ ChatGPT             │ "¿Cómo reservar?"        │
├─────────────┼─────────────────────┼──────────────────────────┤
│ precio:x    │ ChatGPT con producto│ "¿Precio de x?"          │
├─────────────┼─────────────────────┼──────────────────────────┤
│ ninguno     │ ChatGPT normal      │ Respuesta libre          │
└─────────────┴─────────────────────┴──────────────────────────┘
```

---

## 🔌 Integración con OpenAI

### Intérprete (Rápido y Barato)

```
openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: INTENT_INTERPRETER_PROMPT },
    { role: 'user', content: mensaje_del_cliente }
  ],
  max_tokens: 50,           // Solo 1-2 palabras
  temperature: 0.3,         // Determinístico
  top_p: 0.9
})

⏱️  Tiempo: ~300ms
💰 Costo: ~$0.00015 por análisis
```

### ChatGPT (Más Lento pero Detallado)

```
openai.chat.completions.create({
  model: 'gpt-3.5-turbo',
  messages: [
    { role: 'system', content: SYSTEM_PROMPT },
    ...context.history
  ],
  max_tokens: 800,
  temperature: 0.7,
  top_p: 1
})

⏱️  Tiempo: ~500ms - 2s
💰 Costo: ~$0.0007 por respuesta
```

---

## 📈 Evolución del Procesamiento

### Antes (Sin Intérprete)

```
Mensaje → Análisis de comando → ChatGPT → Respuesta
   │           (en código)
   └─ Tiempo: 500ms + ChatGPT = 1s - 3s
```

### Después (Con Intérprete)

```
Mensaje → Intérprete IA → Acción específica → Respuesta
   │        (300ms)          (100-500ms)
   └─ Tiempo: 400-800ms (más rápido!)
```

---

## 🛡️ Validación y Seguridad

```
┌─────────────────────────────────────┐
│ Respuesta del Intérprete            │
└────────────┬────────────────────────┘
             │
             ▼
    ┌─────────────────────────────┐
    │ ¿Está en VALID_COMMANDS?    │
    │ O empieza con "precio:"?    │
    └─┬──────────────────────┬────┘
      │ SÍ                   │ NO
      │                      │
      ▼                      ▼
   Usar        ┌──────────────────────┐
   Intención   │ Usar 'ninguno'       │
               │ Fallback a ChatGPT   │
               └──────────────────────┘
```

---

## 📱 Flujo de Usuario Completo

```
1️⃣  Cliente abre WhatsApp
    └─ Escribe: "Qué venden?"

2️⃣  Mensaje llega al bot
    └─ handleIncomingMessage() recibe

3️⃣  Bot analiza intención
    └─ interpretUserIntent() → "menu"
    └─ Tiempo: ~300ms

4️⃣  Bot ejecuta intención
    └─ handleIntentCommand() → menu
    └─ Verifica /info/ → Encuentra imágenes
    └─ Tiempo: ~100ms

5️⃣  Bot envía respuesta
    └─ "📋 *Mostrando menú:*"
    └─ [imagen1.jpg]
    └─ [imagen2.jpg]
    └─ Tiempo: ~200ms

6️⃣  Cliente ve respuesta
    └─ TOTAL: ~600ms desde que escribió
    └─ Experiencia: Muy natural y rápida
```

---

## 🔧 Stack Tecnológico

```
┌────────────────────────────┐
│ Capa de Presentación       │
│ (WhatsApp)                 │
└────────────┬───────────────┘
             │
┌────────────▼───────────────┐
│ WhatsApp Web.js            │
│ (Cliente de WhatsApp)      │
└────────────┬───────────────┘
             │
┌────────────▼───────────────┐
│ ChatGPT Bot (TypeScript)   │
│ ├─ handleIncomingMessage() │
│ ├─ interpretUserIntent()   │
│ ├─ handleIntentCommand()   │
│ └─ processWithChatGPT()    │
└────────────┬───────────────┘
             │
┌────────────▼───────────────┐
│ OpenAI API                 │
│ ├─ Intérprete (50 tokens)  │
│ ├─ ChatGPT (800 tokens)    │
│ └─ Embedding/Vision        │
└────────────────────────────┘
```

---

## 💾 Almacenamiento de Datos

```
┌──────────────────────────────────────┐
│ Memoria en Tiempo de Ejecución       │
├──────────────────────────────────────┤
│                                      │
│ conversations: Map<userId, Context>  │
│  ├─ +50496756588: {                 │
│  │  ├─ lastInteraction: Date        │
│  │  ├─ messageCount: 42             │
│  │  └─ history: [                   │
│  │     {role: 'user', content: ...} │
│  │     {role: 'assistant', ...}     │
│  │  ]                               │
│  │}                                 │
│  │                                  │
│  ├─ +50498876543: {...}            │
│  └─ +50499987654: {...}            │
│                                      │
│ Timeout: 3600000ms (1 hora)         │
│ Max history: 20 mensajes por usuario│
│                                      │
└──────────────────────────────────────┘

Archivos Persistentes:
├─ /logs/          - Registros de actividad
├─ /info/          - Imágenes de menú
└─ /whatsapp_sessions/ - Sesiones autenticadas
```

---

## 🚀 Optimizaciones Implementadas

```
┌─────────────────────────────────────┐
│ OPTIMIZACIÓN                        │
├─────────────────────────────────────┤
│ ✅ Intérprete con temperatura baja  │
│    (Respuestas determinísticas)     │
│                                     │
│ ✅ Max tokens reducido a 50         │
│    (Solo necesita 1-2 palabras)     │
│                                     │
│ ✅ Caché implícita en memoria       │
│    (Historial reutilizado)          │
│                                     │
│ ✅ Top_p ajustado a 0.9             │
│    (Enfocado en respuestas probables)│
│                                     │
│ ✅ Timeout de conversación          │
│    (Limpia memoria después de 1h)   │
│                                     │
│ ✅ Sin persistencia de DB           │
│    (Más rápido, menos complejidad)  │
│                                     │
└─────────────────────────────────────┘

Resultado:
├─ Análisis: ~300ms
├─ Respuesta: ~500-800ms
├─ Costo: ~$0.0007-0.0008 por interacción
└─ Experiencia: Natural y rápida
```

---

## 📊 Diagrama de Estados

```
    ┌──────────────┐
    │   ESPERANDO  │
    │   MENSAJE    │
    └──────┬───────┘
           │ Mensaje recibido
           ▼
    ┌──────────────┐
    │  VALIDANDO   │
    │  USUARIO     │
    └──┬───────┬───┘
       │ OK    │ Bloqueado
       │       └──► [IGNORAR]
       ▼
    ┌──────────────┐
    │  ANALIZANDO  │
    │  INTENCIÓN   │
    └──────┬───────┘
           │
    ┌──────┴─────────────────────────────┐
    │       INTENCIÓN DETECTADA           │
    └──────┬─────────────────────────────┘
           │
    ┌──────▼───────────────────────────┐
    │  menu │ horario │ ubicacion │ ... │
    └──┬────┴──┬──────┴─────┬──────┴──┬──┘
       │       │            │        │
       ▼       ▼            ▼        ▼
    [Lógica] [ChatGPT] [ChatGPT] [ChatGPT]
       │       │            │        │
       └───────┴────────────┴────────┘
              │
              ▼
         ┌─────────────┐
         │  ENVIANDO   │
         │  RESPUESTA  │
         └─────────────┘
              │
              ▼
         ┌─────────────┐
         │  COMPLETADO │
         └─────────────┘
```

---

**Versión**: 1.0  
**Última actualización**: Diciembre 3, 2025  
**Estado**: ✅ Producción

