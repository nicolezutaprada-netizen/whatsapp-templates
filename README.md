# 📱 Plantillas de WhatsApp

Aplicación web para crear, guardar y personalizar plantillas de mensajes de WhatsApp. Permite generar un mensaje final reemplazando un nombre de destinatario y copiarlo directo al portapapeles.


## Cómo usarlo

1. Abre `index.html` en el navegador (o usa **Live Server** en VS Code).
2. Completa el formulario con título, hashtag y mensaje (puedes incluir `{nombre}` en el mensaje como marcador de posición).
3. Haz clic en **"Agregar plantilla"** — aparece al instante en la lista.
4. Elige una plantilla del selector, escribe el nombre del destinatario y haz clic en **"Generar"** para ver el mensaje final.
5. Haz clic en **"Copiar"** para copiar el mensaje al portapapeles y pegarlo en WhatsApp.



### Clase `Template` (`js/models/template.js`)

Modela una plantilla de mensaje.

| Propiedad | Descripción |
|---|---|
| `tituloreal` | Título de la plantilla |
| `mensajereal` | Contenido del mensaje (puede incluir `{nombre}`) |
| `hashtagreal` | Hashtag asociado, normalizado |
| `fechareal` | Fecha y hora de creación (generada automáticamente con `new Date()`) |


## Métodos de String utilizados

| Método | Dónde se usa | Para qué |
|---|---|---|
| `.trim()` | `normalizarHashtag()`, al leer `titulo.value` y `mensaje.value` | Elimina espacios en blanco al inicio y al final del texto |
| `.toLowerCase()` | `normalizarHashtag()` | Convierte el hashtag a minúsculas, para mantener consistencia |
| `.startsWith("#")` | `normalizarHashtag()` | Verifica si el hashtag ya incluye el símbolo `#`, para no duplicarlo |
| `.replaceAll("{nombre}", valorNombre)` | `generarMensajeFinal()` | Busca el placeholder `{nombre}` dentro del mensaje y lo reemplaza por el nombre real del destinatario |
| `.toLocaleDateString("es-PE")` | `render()` (método de `Date`, no de `String`, pero convierte la fecha a texto legible) | Muestra la fecha de creación en formato peruano legible (ej. `3/7/2026`) |

