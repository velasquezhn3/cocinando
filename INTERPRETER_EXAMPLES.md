# 📝 Ejemplos de Funcionamiento del Intérprete

## Ejemplos Reales de Detección

### ✅ Detección Correcta de MENU

```
Cliente: "Qué venden?"
IA Intérprete: menu
Bot: [Envía imágenes de /info/ o menú de texto]

Cliente: "Muéstrame el menú porfa"
IA Intérprete: menu
Bot: [Envía imágenes de /info/ o menú de texto]

Cliente: "Cuáles son los platos especiales?"
IA Intérprete: menu
Bot: [Envía imágenes de /info/ o menú de texto]

Cliente: "Tenés algo para vegetarianos?"
IA Intérprete: menu
Bot: [Envía imágenes de /info/ o menú de texto]

Cliente: "Dale el catálogo"
IA Intérprete: menu
Bot: [Envía imágenes de /info/ o menú de texto]
```

### ✅ Detección Correcta de HORARIO

```
Cliente: "A qué horas abren?"
IA Intérprete: horario
Bot: 🕐 *Horario de atención:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Hasta qué hora atienden?"
IA Intérprete: horario
Bot: 🕐 *Horario de atención:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Atienden mañana a las 7?"
IA Intérprete: horario
Bot: 🕐 *Horario de atención:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Están abiertos ahora?"
IA Intérprete: horario
Bot: 🕐 *Horario de atención:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Qué días atienden?"
IA Intérprete: horario
Bot: 🕐 *Horario de atención:*
     [Respuesta desde SYSTEM_PROMPT]
```

### ✅ Detección Correcta de UBICACION

```
Cliente: "Dónde están ubicados?"
IA Intérprete: ubicacion
Bot: 📍 *Ubicación:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Cuál es la dirección?"
IA Intérprete: ubicacion
Bot: 📍 *Ubicación:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Cómo llego?"
IA Intérprete: ubicacion
Bot: 📍 *Ubicación:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Está cerca de X?"
IA Intérprete: ubicacion
Bot: 📍 *Ubicación:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Dónde se ubican exactamente?"
IA Intérprete: ubicacion
Bot: 📍 *Ubicación:*
     [Respuesta desde SYSTEM_PROMPT]
```

### ✅ Detección Correcta de RESERVAR

```
Cliente: "Quiero hacer una reservación"
IA Intérprete: reservar
Bot: 📞 *Proceso de Reservación:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Tenés mesa para 4 mañana?"
IA Intérprete: reservar
Bot: 📞 *Proceso de Reservación:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Reservo para las 7 de la noche"
IA Intérprete: reservar
Bot: 📞 *Proceso de Reservación:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Hay disponibilidad el viernes?"
IA Intérprete: reservar
Bot: 📞 *Proceso de Reservación:*
     [Respuesta desde SYSTEM_PROMPT]

Cliente: "Quiero agendar"
IA Intérprete: reservar
Bot: 📞 *Proceso de Reservación:*
     [Respuesta desde SYSTEM_PROMPT]
```

### ✅ Detección Correcta de PRECIO

```
Cliente: "Cuánto cuesta el pollo?"
IA Intérprete: precio:pollo
Bot: 🍗 *Precio del Pollo:*
     [Respuesta ChatGPT: "¿Cuál es el precio de pollo?"]

Cliente: "Qué vale la pasta?"
IA Intérprete: precio:pasta
Bot: 🍝 *Precio de la Pasta:*
     [Respuesta ChatGPT: "¿Cuál es el precio de pasta?"]

Cliente: "El ceviche cuánto está?"
IA Intérprete: precio:ceviche
Bot: 🦐 *Precio del Ceviche:*
     [Respuesta ChatGPT: "¿Cuál es el precio de ceviche?"]

Cliente: "Precio de la ensalada?"
IA Intérprete: precio:ensalada
Bot: 🥗 *Precio de la Ensalada:*
     [Respuesta ChatGPT: "¿Cuál es el precio de ensalada?"]

Cliente: "Cuánto el taco?"
IA Intérprete: precio:taco
Bot: 🌮 *Precio del Taco:*
     [Respuesta ChatGPT: "¿Cuál es el precio de taco?"]

Cliente: "Qué cuesta más, el pollo o la pasta?"
IA Intérprete: precio:pollo
Bot: (Detecta la primera) 🍗 *Precio del Pollo:*
     [Respuesta ChatGPT]
```

### ✅ Detección de NINGUNO (Chateo Normal)

```
Cliente: "Hola"
IA Intérprete: ninguno
Bot: 👋 Hola! Soy el asistente de Cocinando. 
     ¿Qué te gustaría saber?

Cliente: "Buenos días"
IA Intérprete: ninguno
Bot: 👋 Buenos días! ¿En qué puedo ayudarte?

Cliente: "Cómo estás?"
IA Intérprete: ninguno
Bot: 😊 ¡Bien, gracias por preguntar! 
     ¿Qué te gustaría conocer sobre Cocinando?

Cliente: "Cuéntame un chiste"
IA Intérprete: ninguno
Bot: 😄 Claro, aquí va uno...
     [Respuesta de ChatGPT]

Cliente: "Qué es lo mejor de Cocinando?"
IA Intérprete: ninguno
Bot: 🌟 Aquí está lo mejor de Cocinando...
     [Respuesta de ChatGPT desde SYSTEM_PROMPT]
```

---

## Casos Complejos

### 1. Saludo + Intención

```
Cliente: "Hola, quiero ver el menú"
IA Intérprete: menu (ignora "hola")
Bot: 📋 [Envía menú]

Cliente: "Ey, a qué horas abren?"
IA Intérprete: horario (ignora "ey")
Bot: 🕐 [Envía horario]

Cliente: "Buenos días, cuánto cuesta el pollo?"
IA Intérprete: precio:pollo (ignora "buenos días")
Bot: 🍗 [Envía precio]
```

### 2. Múltiples Preguntas

```
Cliente: "A qué horas abren y dónde están?"
IA Intérprete: horario (detecta la primera clara)
Bot: 🕐 [Envía horario]

(El cliente puede preguntar lo segundo después)
Cliente: "Y dónde están ubicados?"
IA Intérprete: ubicacion
Bot: 📍 [Envía ubicación]
```

### 3. Preguntas sobre Productos

```
Cliente: "Hacen opciones sin gluten?"
IA Intérprete: menu (pregunta sobre opciones)
Bot: 📋 [Envía menú para que vea opciones]

Cliente: "Es picante la salsa?"
IA Intérprete: ninguno (pregunta específica sobre sabor)
Bot: 🌶️ [ChatGPT responde desde SYSTEM_PROMPT]

Cliente: "La pasta tiene mariscos?"
IA Intérprete: ninguno (pregunta sobre ingredientes)
Bot: 🍝 [ChatGPT responde desde SYSTEM_PROMPT]
```

### 4. Intenciones Implícitas

```
Cliente: "Tengo hambre"
IA Intérprete: menu (detección inteligente)
Bot: 📋 [Envía menú]

Cliente: "Quiero comer algo diferente"
IA Intérprete: menu (intención implícita)
Bot: 📋 [Envía menú]

Cliente: "Vamos a celebrar el viernes"
IA Intérprete: reservar (detección inteligente)
Bot: 📞 [Inicia proceso de reserva]
```

---

## Mensajes que Generan "ninguno"

```
Cliente: "Hola"
IA: ninguno → ChatGPT responde amigablemente

Cliente: "Cómo estás?"
IA: ninguno → ChatGPT responde

Cliente: "Cuéntame sobre Cocinando"
IA: ninguno → ChatGPT responde desde SYSTEM_PROMPT

Cliente: "Tienen wifi?"
IA: ninguno → ChatGPT responde

Cliente: "Ofrecen servicio a domicilio?"
IA: ninguno → ChatGPT responde

Cliente: "Aceptan tarjeta de crédito?"
IA: ninguno → ChatGPT responde

Cliente: "Qué especialidades tienen?"
IA: ninguno o menu (depende del contexto)
→ Si "especialidades" detecta menu, si no → ChatGPT
```

---

## Flujo Temporal Completo

```
CLIENTE                          BOT INTERNO                      RESPUESTA AL CLIENTE
══════════════════════════════════════════════════════════════════════════════════════════

Escribe: "Qué venden?"
                                 ↓
                                 Recibe mensaje
                                 ↓
                                 Intérprete analiza
                                 ↓
                                 Detecta: menu
                                 ↓
                                 Verifica /info/ folder
                                 ↓
                                 Lee imágenes
                                 ↓
                                 Envía: 📋 *Mostrando menú:*
                                 Envía: [imagen1.jpg]
                                 Envía: [imagen2.jpg]
                                 Envía: [imagen3.jpg]
                                 ↓
                                 Registra en logs:
                                 "🎯 Intención detectada: menu"
                                 ════════════════════════════→  Ve el menú en imágenes


Escribe: "Cuánto es el pollo?"
                                 ↓
                                 Recibe mensaje
                                 ↓
                                 Intérprete analiza
                                 ↓
                                 Detecta: precio:pollo
                                 ↓
                                 Extrae producto: "pollo"
                                 ↓
                                 Llama ChatGPT:
                                 "¿Cuál es el precio de pollo?"
                                 ↓
                                 ChatGPT responde desde
                                 SYSTEM_PROMPT con el precio
                                 ↓
                                 Envía respuesta
                                 ════════════════════════════→  🍗 El pollo cuesta...
```

---

## Velocidad de Procesamiento

```
Mensaje recibido: 0ms
├─ Intérprete analiza: ~300ms
├─ Detecta intención: ~50ms
├─ Ejecuta comando: ~100-500ms (según tipo)
└─ Respuesta enviada: 500-800ms

TOTAL: 500-1300ms desde que escribe hasta que ve la respuesta
```

---

## Casos de Error

### Error 1: ChatGPT no responde

```
Cliente: "A qué horas abren?"
Intérprete: horario
Bot intenta llamar ChatGPT pero falla
Respuesta: ❌ Error al procesar. Intenta de nuevo.
```

### Error 2: No hay imágenes en /info/

```
Cliente: "Muéstrame el menú"
Intérprete: menu
Bot verifica /info/ → No hay imágenes
Fallback: ChatGPT responde con menú de texto
```

### Error 3: Mensaje mal formado

```
Cliente: "asdgasdg"
Intérprete: ninguno (no hay palabras clave)
Bot: ChatGPT intenta responder
```

---

## Resumen de Respuestas

| Intención | Símbolo | Tipo de Respuesta |
|-----------|---------|------------------|
| menu | 📋 | Imágenes o texto |
| horario | 🕐 | Texto desde SYSTEM_PROMPT |
| ubicacion | 📍 | Texto desde SYSTEM_PROMPT |
| reservar | 📞 | Texto desde SYSTEM_PROMPT |
| precio:x | 💰 | Texto desde SYSTEM_PROMPT |
| ninguno | 💬 | Respuesta libre de ChatGPT |

