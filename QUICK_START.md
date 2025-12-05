# 🚀 Guía de Inicio Rápido

## ⚡ 5 Pasos para Activar el Sistema

### 1️⃣ Instala Dependencias
```bash
npm install
```

### 2️⃣ Configura tu `.env`
```bash
# Abre .env y asegúrate de tener:
OPENAI_API_KEY=sk-proj-xxxxx...    # Tu API key de OpenAI
ADMIN_USERS=+50496756588            # Tu número WhatsApp
```

### 3️⃣ Inicia el Bot
```bash
npm start
```

### 4️⃣ Escanea el QR
- Aparecerá un QR en la terminal
- Abre WhatsApp → Ajustes → Dispositivos vinculados → Escanea

### 5️⃣ ¡Listo!
El bot está activo. Prueba escribiendo:
- "Qué venden?"
- "A qué horas abren?"
- "Dónde están?"

---

## 🎯 Lo Que Hace Automáticamente

El **Intérprete de Intenciones** detecta automáticamente:

| Cuando el cliente escribe | El bot responde con |
|---|---|
| "Qué venden?" | Menú (imágenes de `/info/` o texto) |
| "A qué horas abren?" | Horario desde el system prompt |
| "Dónde están?" | Ubicación desde el system prompt |
| "Quiero mesa" | Información de cómo reservar |
| "Cuánto el pollo?" | Precio desde el menú |
| Cualquier otra cosa | Respuesta normal de ChatGPT |

---

## 📂 Archivos Importantes

### Para Personalizar

```
/.env
  ├─ OPENAI_API_KEY ← Tu API key
  ├─ OPENAI_MODEL ← Modelo a usar (gpt-3.5-turbo)
  ├─ SYSTEM_PROMPT ← Personalidad del bot
  └─ ADMIN_USERS ← Tu número WhatsApp

/PROMPT_SISTEMA.md
  └─ Menú, horarios, ubicación, etc.
```

### Para Entender

```
/INTERPRETER_SYSTEM_PROMPT.md ← Cómo funciona el intérprete
/INTERPRETER_EXAMPLES.md ← 30+ ejemplos reales
/INTENT_INTERPRETER_GUIDE.md ← Documentación técnica
/ARCHITECTURE_DIAGRAM.md ← Diagramas del sistema
```

---

## 💡 Ejemplos Reales

### Cliente pregunta por menú
```
Cliente: "Qué hay para comer?"
Bot: 📋 *Mostrando menú:*
     [imagen1.jpg]
     [imagen2.jpg]
     [imagen3.jpg]
```

### Cliente pregunta precio
```
Cliente: "Cuánto cuesta el ceviche?"
Bot: 🦐 *Precio del Ceviche:*
     El ceviche cuesta L. 150
     Incluye: camarón fresco, limón...
```

### Cliente hace saludo + pregunta
```
Cliente: "Hola, a qué horas abren?"
Bot: 👋 ¡Hola! 🕐
     Abierto: Lunes a Viernes 11am - 10pm
     Sábado y Domingo: 12pm - 11pm
```

---

## 📸 Agregar Imágenes del Menú

El bot buscará imágenes en `/info/` cuando alguien pregunte por el menú.

### Cómo agregar:

1. Coloca tus imágenes en la carpeta `/info/`
   ```
   /info/
   ├─ menu-1.jpg
   ├─ menu-2.jpg
   ├─ menu-3.jpg
   └─ README.md
   ```

2. Reinicia el bot
   ```bash
   npm start
   ```

3. Cliente puede escribir cualquiera de estos:
   - "Qué venden?"
   - "Muéstrame el menú"
   - "Tienes menú?"
   - "Dale, el catálogo"

4. Bot automáticamente envía las imágenes en orden

---

## 🛠️ Personalización Rápida

### Cambiar System Prompt

Abre `/.env` y encuentra:

```env
SYSTEM_PROMPT=Eres un asistente...
```

Cambialo con tu información:
```env
SYSTEM_PROMPT=Eres un asistente del restaurante Cocinando.
Especialidad: comida latinoamericana.
Ubicación: Tegucigalpa, Honduras.
Teléfono: 9876-5432
Horario: Lunes a Viernes 11am-10pm
[...]
```

### Cambiar Modelo (para ahorrar o mejorar)

```env
# Para ahorrar (rápido pero menos inteligente):
OPENAI_MODEL=gpt-3.5-turbo

# Para mejor calidad (más lento y caro):
OPENAI_MODEL=gpt-4o-mini
```

### Cambiar Temperatura (creatividad)

```env
# Menos creativo, respuestas más predecibles:
OPENAI_TEMPERATURE=0.3

# Más creativo, respuestas variadas:
OPENAI_TEMPERATURE=0.9
```

---

## 🔍 Monitorear el Bot

### En Admin (tu número)

```
/help          → Ver comandos disponibles
/status        → Mensajes procesados, memoria, etc
/apistatus     → Estado de OpenAI, errores 429
/settings      → Configuración actual
/history       → Últimos 5 mensajes
/clear         → Limpiar historial de conversación
```

Ejemplo:
```
Tú: /status

Bot: 🤖 *Estado del Bot:*
     Activo: ✅ Sí
     Mensajes procesados: 127
     Respuestas exitosas: 125
     Conversaciones activas: 8
     Memoria usada: 45.32 MB
     Versión: 1.0.0
```

---

## ❌ Solución de Problemas

### El bot no responde
**Solución**: Elimina `whatsapp_sessions` y reinicia
```bash
rm -r whatsapp_sessions
npm start
# Escanea el QR nuevamente
```

### Error 429 (Too Many Requests)
**Solución**: Agregar dinero a OpenAI
1. Ve a https://platform.openai.com/account/billing/overview
2. Agrega método de pago
3. Aumenta el límite

### El menú no se muestra
**Solución**: Verifica que `/info/` tenga imágenes
```bash
# En Windows PowerShell:
Get-ChildItem info/

# Debería mostrar:
# menu-1.jpg
# menu-2.jpg
```

### Respuestas lentas
**Solución**: Reduce max_tokens en `.env`
```env
OPENAI_MAX_TOKENS=500  # Reduce de 800 a 500
```

---

## 📊 Costos Estimados

Con **gpt-3.5-turbo** (el más barato):

- **$5 USD** = ~7,000 mensajes
- **1 usuario x 50 msgs/día** = ~$0.35/mes
- **10 usuarios x 50 msgs/día** = ~$3.50/mes

Es muy económico. ¡No te preocupes por costos!

---

## 🎓 Próximos Pasos

### Básico
- ✅ Bot funcionando
- ✅ Intérprete activo
- ✅ Menú visible

### Intermedio
- [ ] Agregar más información al SYSTEM_PROMPT
- [ ] Personalizar emojis y formato
- [ ] Probar con múltiples usuarios

### Avanzado
- [ ] Integrar con base de datos
- [ ] Confirmación de reservas vía email
- [ ] Dashboard de estadísticas
- [ ] Multi-idioma

---

## 📚 Documentación Rápida

| Archivo | Para... |
|---------|---------|
| `INTERPRETER_SYSTEM_PROMPT.md` | Entender cómo detecta intenciones |
| `INTERPRETER_EXAMPLES.md` | Ver 30+ ejemplos reales |
| `INTENT_INTERPRETER_GUIDE.md` | Documentación técnica completa |
| `ARCHITECTURE_DIAGRAM.md` | Diagramas y flujos |
| `PROMPT_SISTEMA.md` | El menú y información del restaurante |
| `COSTOS_OPTIMIZACION.md` | Análisis de costos |

---

## 🎯 Checklist de Inicio

```
[ ] Node.js 18+ instalado
[ ] npm install completado
[ ] .env configurado con API key
[ ] npm start ejecutado
[ ] QR escaneado en WhatsApp
[ ] Bot responde a "Hola"
[ ] Bot detecta intención correctamente
[ ] Imágenes en /info/ (opcional)
[ ] Menú visible al preguntar
[ ] Status admin funciona
```

---

## 🆘 Soporte

Si algo no funciona:

1. **Verifica logs**:
   ```bash
   tail logs/bot.log
   ```

2. **Prueba OpenAI API**:
   ```bash
   node test-openai.js
   ```

3. **Revisa documentación**:
   - INTERPRETER_EXAMPLES.md para ejemplos
   - INTENT_INTERPRETER_GUIDE.md para técnica
   - ARCHITECTURE_DIAGRAM.md para flujos

4. **Último recurso**: Reinicia todo
   ```bash
   rm -r whatsapp_sessions logs/*
   npm start
   ```

---

## 🚀 Está Listo!

Tu bot está configurado y funcionando. Ahora:

1. **Personaliza el SYSTEM_PROMPT** con tu información
2. **Agrega imágenes del menú** en `/info/`
3. **Invita clientes** a probar

El intérprete de intenciones los entenderá automáticamente sin que necesiten escribir comandos especiales.

¡Disfruta! 🎉

---

**Última actualización**: Diciembre 3, 2025  
**Versión**: 1.0  
**Estado**: Listo para producción ✅

