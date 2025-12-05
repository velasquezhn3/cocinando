# 💰 Costos y Optimización - Bot ChatGPT WhatsApp

## 📊 Comparativa de Modelos OpenAI

| Modelo | Costo (por 1M tokens) | Velocidad | Contexto | Recomendación |
|--------|----------------------|-----------|----------|---------------|
| **gpt-3.5-turbo** | $0.50 entrada / $1.50 salida | ⚡ Muy rápido | 4K | ✅ **ACTUAL (Más barato)** |
| gpt-3.5-turbo-16k | $3.00 / $4.00 | ⚡ Rápido | 16K | ❌ Deprecado |
| gpt-4 | $30.00 / $60.00 | 🐢 Lento | 8K | ❌ Muy caro |
| gpt-4-turbo | $10.00 / $30.00 | 🐢 Moderado | 128K | ❌ Caro |

---

## 💵 Estimación de Costos con $5 USD

### Configuración Actual:
```
Modelo: gpt-3.5-turbo
Max tokens salida: 800
Promedio estimado por mensaje: 400-600 tokens
```

### Cálculo:
- **Entrada**: ~200 tokens promedio = $0.0001/mensaje
- **Salida**: ~400 tokens promedio = $0.0006/mensaje
- **Total por mensaje**: ~$0.0007 (menos de 1 centavo)

### Con $5 USD puedes hacer:
```
$5 ÷ $0.0007 = ~7,142 mensajes
```

**Es decir: Más de 7,000 mensajes con $5 dólares**

---

## ⚡ Optimizaciones Implementadas

### 1. **Modelo más barato**
   - ✅ Cambié de `gpt-3.5-turbo-16k` a `gpt-3.5-turbo`
   - ✅ Reducción de costo: ~60% más barato

### 2. **Tokens máximos reducidos**
   ```
   Antes: MAX_TOKENS=2000
   Ahora: MAX_TOKENS=800
   ```
   - Las respuestas siguen siendo buenas
   - Menores tokens = menos costo

### 3. **Rate limiting**
   - ✅ 1 mensaje por minuto por usuario
   - Evita gastos excesivos por usuarios activos

### 4. **Historial acotado**
   - ✅ Máximo 10 mensajes en historial
   - Reduce tokens de contexto

---

## 📈 Cómo Monitorear Gastos

### Opción 1: Panel de OpenAI
Ve a: https://platform.openai.com/account/usage/overview

Verás:
- Gasto total del día/mes
- Desglose por modelo
- Proyección de gastos

### Opción 2: Comando Admin
Envía a tu bot (como admin):
```
apistatus
```

Te muestra:
- Errores 429
- Tasa de éxito
- Información del API

---

## 🚨 Alertas Importantes

### Si ves mucho gasto:
1. Verifica que no hay bucles infinitos de mensajes
2. Revisa si el bot está recibiendo muchos mensajes
3. Usa el `rate limiting` para controlar

### Limitar gastos:
```env
# En .env puedes ajustar:
OPENAI_MAX_TOKENS=500        # Respuestas más cortas
MAX_HISTORY_LENGTH=5         # Menos contexto
```

---

## 💡 Recomendaciones

### Para el Restaurante Cocinando:
1. **Mantén la configuración actual** - Es muy barata
2. **Monitorea semanalmente** en OpenAI dashboard
3. **Establece alertas** si gastas más de $1/semana

### Si quieres más tokens de salida:
```env
OPENAI_MAX_TOKENS=1200   # Respuestas más largas (sigue siendo barato)
```

### Si quieres ahorrar más:
```env
OPENAI_MAX_TOKENS=400    # Respuestas muy cortas
MAX_HISTORY_LENGTH=3     # Sin contexto previo
```

---

## 📱 Ejemplo de Costo Real

**Interacción típica:**
```
Cliente: "Hola, ¿cuál es el precio de los tacos?"
Bot: "Los tacos están disponibles en 3 variedades:
- Tuna Pibil: L.365
- Pollo Parrilla: L.390
- Puyazo: L.395
¿Deseas hacer un pedido?"
```

**Tokens usados:**
- Entrada: ~50 tokens (prompts + contexto)
- Salida: ~100 tokens (respuesta)
- **Total: ~150 tokens**
- **Costo: ~$0.00015** (menos de una centésima)

Con $5 podrías tener ~33,000 interacciones así.

---

## 🔧 Configuración Actual (Optimizada)

```env
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=800
MAX_MODEL_TOKENS=4096
```

✅ **Conclusión: Tu bot está totalmente optimizado para ahorrar dinero**

---

**Última actualización:** 3 de Diciembre de 2025
