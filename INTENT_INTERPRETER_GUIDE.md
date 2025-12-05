# 🎯 Guía del Intérprete de Intenciones

## ¿Qué es?

El **Intérprete de Intenciones** es un sistema inteligente que analiza automáticamente cada mensaje del cliente en WhatsApp y detecta cuál es su verdadera intención sin necesidad de comandos especiales.

En lugar de que los clientes escriban "!menu" o "/menu", ahora pueden escribir de forma natural:
- "Qué venden?"
- "Muéstrame el menú"
- "¿Qué hay para comer?"
- "A qué horas abren?"

Y el bot automáticamente detecta qué quieren y responde de forma apropiada.

---

## 🔄 Cómo Funciona

### Flujo de Procesamiento

```
Cliente envía mensaje en WhatsApp
    ↓
Bot recibe mensaje
    ↓
🎯 Intérprete de Intenciones analiza el mensaje
    ↓
Detecta una de estas intenciones:
    ├─ menu → Mostrar menú
    ├─ horario → Mostrar horario
    ├─ ubicacion → Mostrar ubicación
    ├─ reservar → Proceso de reserva
    ├─ precio:producto → Consultar precio
    └─ ninguno → Responder con ChatGPT
    ↓
Bot ejecuta la acción correspondiente
    ↓
Cliente recibe respuesta
```

### Ejemplo Práctico

**Cliente escribe:** "Qué tal, cuánto cuesta el pollo?"

1. Bot recibe el mensaje
2. Intérprete analiza: "¿Cuál es la intención?"
3. Detecta: `precio:pollo`
4. Bot responde con el precio del pollo desde el system prompt

---

## 📋 Intenciones Reconocidas

| Intención | Comando Generado | Ejemplo del Cliente |
|-----------|-----------------|-------------------|
| Ver menú | `menu` | "Qué tienen?", "Muéstrame el menú", "Qué hay de comer?" |
| Horario | `horario` | "A qué horas abren?", "Hasta qué hora atienden?" |
| Ubicación | `ubicacion` | "Dónde están?", "Cuál es la dirección?" |
| Reserva | `reservar` | "Quiero una mesa", "Hacer reservación" |
| Consultar precio | `precio:producto` | "Cuánto cuesta el pollo?", "Precio de la pasta?" |
| Mensaje normal | `ninguno` | "Hola", "Cómo estás?", "Cuéntame un chiste" |

---

## 🧠 Cómo Detecta las Intenciones

El intérprete es muy inteligente y busca **palabras clave** en el contexto:

### Menu
Detecta: menú, qué, venden, tienen, hay, catálogo, platos, comidas, bebidas, especiales, promociones

### Horario
Detecta: hora, horario, abierto, cierre, atienden, servicio

### Ubicación
Detecta: dónde, ubicación, dirección, llegar, cómo

### Reservar
Detecta: reserva, mesa, disponible, cuando, personas

### Precio
Detecta: cuánto, cuesta, precio, vale, costo, valor

---

## ⚙️ Configuración Técnica

### El Prompt del Intérprete

El intérprete usa un prompt especial (definido en `INTERPRETER_SYSTEM_PROMPT.md`) que instruyelo siguiente:

1. **Nunca responde al cliente** - Solo devuelve comandos
2. **Responde CON EL COMANDO SOLO** - Nada de explicaciones
3. **Identifica intenciones implícitas** - Aunque no mencionen la palabra exacta
4. **Maneja sinónimos** - Entiende múltiples formas de escribir lo mismo

### Parámetros de Optimización

```javascript
// Temperature baja para respuestas más determinísticas
temperature: 0.3

// Top P bajo para enfocarse en respuestas más probables
top_p: 0.9

// Max tokens muy bajo (solo necesita devolver 1-2 palabras)
max_tokens: 50
```

---

## 🚀 Flujo de Ejecución por Intención

### Cuando detecta `menu`
```
1. Verifica si existe /info/ folder
2. Si hay imágenes (.jpg, .png, .gif):
   - Envía "📋 *Mostrando menú:*"
   - Envía cada imagen con delay de 500ms
3. Si no hay imágenes:
   - Llama a ChatGPT con prompt: "Muéstrame el menú completo"
   - Envía respuesta de texto
```

### Cuando detecta `horario`
```
1. Llama a ChatGPT con: "¿Cuál es el horario de atención?"
2. ChatGPT responde desde el SYSTEM_PROMPT
3. Envía respuesta al cliente
```

### Cuando detecta `ubicacion`
```
1. Llama a ChatGPT con: "¿Dónde está ubicado el restaurante?"
2. ChatGPT responde desde el SYSTEM_PROMPT
3. Envía respuesta al cliente
```

### Cuando detecta `reservar`
```
1. Llama a ChatGPT con: "Quiero hacer una reservación"
2. ChatGPT explica el proceso de reserva
3. Envía respuesta al cliente
```

### Cuando detecta `precio:producto`
```
1. Extrae el producto del comando (ej: "pollo")
2. Llama a ChatGPT con: "¿Cuál es el precio de pollo?"
3. ChatGPT responde con el precio desde el menú
4. Envía respuesta al cliente
```

### Cuando detecta `ninguno`
```
1. Llama a ChatGPT normalmente con el mensaje original
2. ChatGPT responde usando el SYSTEM_PROMPT
3. Envía respuesta al cliente
```

---

## 📊 Métricas y Logging

El bot registra cada intención detectada:

```
🎯 Intención detectada: menu (usuario: Qué venden?...)
🎯 Intención detectada: precio:pollo (usuario: Cuánto cuesta...)
🎯 Intención detectada: horario (usuario: A qué horas...)
```

Esto te ayuda a entender qué intenciones están siendo detectadas correctamente.

---

## 🔧 Casos Especiales

### Múltiples Intenciones
Si el cliente escribe: "¿A qué horas abren y dónde están?"

El intérprete detecta la **primera intención clara**:
- "horario" (porque aparece primero en la frase)

En el siguiente mensaje el cliente puede preguntar la segunda intención.

### Saludos + Intención
Si el cliente escribe: "Hola, quiero ver el menú"

El intérprete **ignora el saludo** y detecta:
- "menu"

### Preguntas Ambiguas
Si el cliente escribe: "¿Tienen opciones vegetarianas?"

El intérprete es lo suficientemente inteligente para:
- Detectar "menu" (porque pregunta sobre opciones)
- Si no hay suficiente claridad → "ninguno" (ChatGPT responde)

---

## 🛠️ Troubleshooting

### El bot no detecta una intención
**Solución:** Agregar más palabras clave al INTENT_INTERPRETER_PROMPT

### El bot detecta la intención incorrecta
**Solución:** Aumentar `temperature` a 0.5 para que sea más creativo

### Respuestas lentas
**Solución:** El intérprete es rápido (~0.3s), pero si el ChatGPT es lento, optimiza el OPENAI_MODEL

---

## 📝 Mejoras Futuras

- [ ] Machine learning para mejorar detección
- [ ] Historial de intenciones por usuario
- [ ] Más intenciones personalizadas (ej: "pedir_domicilio", "quejar")
- [ ] Análisis de sentimiento (si es una queja vs una pregunta)
- [ ] Intenciones basadas en horario (si pregunta fuera de horas, responder diferente)

---

## 📚 Archivos Relacionados

- **`src/index.ts`** - Implementación del interpretador
- **`INTERPRETER_SYSTEM_PROMPT.md`** - Prompt completo del intérprete
- **`PROMPT_SISTEMA.md`** - System prompt para ChatGPT
- **`.env`** - Configuración de OpenAI

---

## 🎯 Resumen

El **Intérprete de Intenciones** hace que tu bot sea:

✅ **Más natural** - Los clientes escriben como hablan  
✅ **Más rápido** - Detecta intenciones en ~0.3s  
✅ **Más barato** - Menos tokens gastados en parsing  
✅ **Más inteligente** - Entiende sinónimos e intenciones implícitas  
✅ **Más automático** - Cero comandos especiales necesarios  

