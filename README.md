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

## Delegación de eventos

En vez de agregar un `addEventListener` a cada botón individual (lo cual fallaría, ya que los botones se destruyen y se recrean cada vez que `render()` vuelve a dibujar la lista), el listener se coloca **una sola vez** en el elemento padre `<ul id="listaPlantillas">`. Gracias al *burbujeo de eventos* (event bubbling), un clic en cualquier botón hijo sube hasta el padre y dispara el mismo listener, sin importar si ese botón se creó después de que el listener fue registrado.

```js
lista.addEventListener("click", function (evento) {
  const id = evento.target.dataset.id;
  if (evento.target.classList.contains("btn-eliminar")) eliminarPlantilla(id);
  if (evento.target.classList.contains("btn-editar"))   cargarEnFormulario(id);
});
```

| Elemento | Para qué sirve |
|---|---|
| `evento.target` | El elemento **exacto** donde ocurrió el clic (el botón, el título, o cualquier otra parte de la tarjeta) |
| `.classList.contains("btn-eliminar")` | Verifica si el clic fue específicamente sobre el botón de eliminar |
| `.classList.contains("btn-editar")` | Verifica si el clic fue específicamente sobre el botón de editar |
| `evento.target.dataset.id` | Lee el atributo `data-id="${plantilla.id}"` guardado en el botón, para saber **cuál** plantilla debe eliminarse o editarse |

**Ventaja principal:** un solo listener sobrevive a cada `render()` y atiende a **todos** los botones presentes en cualquier momento, sin necesidad de "re-enganchar" eventos cada vez que la lista cambia (se agregan, editan o eliminan plantillas).