# 📋 Fotos del Menú

Esta carpeta es para almacenar las imágenes del menú del restaurante Cocinando.

## 📸 Cómo agregar imágenes:

1. **Coloca tus imágenes en esta carpeta** (`/info`)
   - Formatos soportados: `.jpg`, `.jpeg`, `.png`, `.gif`
   - Ejemplo: `menu-entrada.jpg`, `menu-parrilladas.png`

2. **Los clientes pueden ver el menú con:**
   - Escribiendo: `menu`
   - El bot automáticamente enviará todas las imágenes de esta carpeta

## 📁 Estructura recomendada:

```
info/
├── menu-entradas.jpg
├── menu-pastas.jpg
├── menu-tacos.jpg
├── menu-parrilladas.jpg
├── menu-postres.jpg
├── menu-bebidas.jpg
└── README.md (este archivo)
```

## ⚡ Notas:

- Las imágenes se envían automáticamente en el orden que aparecen en la carpeta
- El bot envía un pequeño delay (1 segundo) entre cada imagen
- Soporta cualquier cantidad de imágenes
- Si no hay imágenes, el bot mostrará un menú de texto

## 💡 Ejemplo:

Cliente escribe: `menu`

Bot responde:
1. Mensaje: "📋 Menú del Restaurante Cocinando\n\nEnviando fotos del menú..."
2. Envía menu-entradas.jpg
3. Envía menu-pastas.jpg
4. Envía menu-tacos.jpg
5. ... y todas las demás

---

**Agrega tus imágenes aquí y el bot las compartirá automáticamente con los clientes.**
