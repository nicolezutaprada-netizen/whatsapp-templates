# Gestor de Plantillas para WhatsApp

Aplicación web para crear, guardar y gestionar plantillas reutilizables de mensajes de WhatsApp. Permite armar mensajes con un marcador `{nombre}` que se reemplaza por el nombre real del destinatario antes de copiarlo.

🔗 **Demo desplegada:** https://nicolezutaprada-netizen.github.io/whatsapp-templates/

---

## Funcionalidad

- Crear, editar y eliminar plantillas (con confirmación mediante modal antes de eliminar o vaciar todo).
- Filtrar plantillas por hashtag en tiempo real.
- Ordenar la colección por fecha (más recientes / más antiguas).
- Ver estadísticas: total de plantillas y conteo por hashtag.
- Generar el mensaje final reemplazando `{nombre}` por un nombre real, con botón para copiarlo al portapapeles.
- Persistencia automática en `localStorage`: las plantillas y el filtro se restauran al recargar la página.
- Validación de campos obligatorios (título y mensaje) al crear/editar.
- Estado vacío amigable: mensajes distintos según si no hay plantillas creadas o si el filtro no encontró resultados.

---

## Arquitectura modular (ESM)

El código está repartido en 4 módulos ES (`import`/`export`), en vez de scripts clásicos que comparten variables globales:

| Archivo | Responsabilidad |
|---|---|
| `js/models/template.js` | Clase `Template`: define la forma de cada plantilla (id, título, mensaje, hashtag, fecha). |
| `js/state.js` | Estado de la app (`state`) y lógica pura de datos: agregar, contar por hashtag, filtrar (`plantillasVisibles`), ordenar, normalizar hashtag, generar el mensaje final. No toca el DOM. |
| `js/storage.js` | Persistencia en `localStorage`: `guardar()` y `cargar()`. |
| `js/ui.js` | Todo lo que toca el DOM: `render()`, el panel de estadísticas, el selector de plantillas, el modal de confirmación y todos los `addEventListener`. |
| `js/app.js` | Punto de arranque: carga el estado guardado y llama a `render()`. |

`index.html` carga un único `<script type="module" src="js/app.js">`; el navegador resuelve el resto de los módulos siguiendo la cadena de `import`.

---

## Historias de Usuario implementadas

### HU2: Estado vacío amigable

**Como** usuario, **quiero** ver un mensaje claro cuando no tengo plantillas o cuando mi búsqueda no encuentra nada, **para** no ver una pantalla en blanco sin explicación.

**Criterios de aceptación:**
- Si no hay plantillas creadas, se muestra: *"Aún no tienes plantillas. ¡Crea la primera!"*
- Si hay plantillas pero el filtro no encuentra coincidencias, se muestra: *"No se encontraron plantillas con ese filtro."*
- Al haber datos que mostrar, la lista vuelve a la normalidad.

**Implementación:** dentro de `render()` (en `js/ui.js`), se guarda el resultado de `plantillasVisibles()` en una variable y, si su longitud es `0`, se decide el mensaje comparando `state.plantillastotales.length` contra `0` — así se distingue "no hay nada creado" de "el filtro no encontró nada".

### HU4: Ordenar la colección

**Como** usuario, **quiero** ordenar mis plantillas por fecha (más recientes o más antiguas), **para** revisarlas como me convenga.

**Criterios de aceptación:**
- Un selector permite elegir entre "Más recientes primero" y "Más antiguas primero".
- La lista se reordena al instante al cambiar la opción.
- El orden se mantiene al agregar, editar o filtrar.

**Implementación:** la función `ordenar(plantillas)` en `js/state.js` copia el arreglo con `[...plantillas]` (porque `.sort()` muta el original) y lo ordena comparando `new Date(a.fechareal) - new Date(b.fechareal)` según el valor de `state.orden`. Se encadena al final de `plantillasVisibles()`, después del filtro. El `<select id="orden">` en `ui.js` actualiza `state.orden` y llama a `render()` en cada cambio.

---

## Decisiones técnicas clave

**Modal de confirmación en vez de `confirm()` nativo:** para eliminar una plantilla o vaciar todo, se usa un modal propio (`pedirConfirmacion(mensaje, accion)` en `js/ui.js`) en vez del `confirm()` del navegador. Esto permite personalizar el mensaje y el estilo visual, y guarda la acción a ejecutar en una variable (`accionPendiente`) que solo se dispara si el usuario confirma — si cancela, se limpia sin ejecutar nada.

**Separación de responsabilidades (state vs. ui):** `state.js` no importa ni manipula el DOM directamente; toda la lógica que sí lo hace (incluido el modal, aunque conceptualmente "pertenece" a acciones sobre los datos) vive en `ui.js`. Esto evita que `state.js` dependa de `ui.js`, manteniendo la dirección de dependencia clara: la interfaz depende del estado, no al revés.

**`.sort()` sobre una copia, no el original:** como `Array.prototype.sort()` muta el arreglo en el que se llama, `ordenar()` siempre trabaja sobre una copia (`[...plantillas]`) para no alterar accidentalmente `state.plantillastotales` fuera de lo esperado.

---

## Persistencia de datos (`js/storage.js`)

Las plantillas y el filtro de búsqueda se guardan en `localStorage`, para que no se pierdan al recargar la página o cerrar el navegador.

### Guardar (`guardar()`)

```js
import { state } from "./state.js";

const CLAVE = "whatsapp-templates";
const CLAVE_FILTRO = "whatsapp-templates-filtro";

function guardar() {
  state.plantillastotales.length === 0
    ? localStorage.removeItem(CLAVE)
    : localStorage.setItem(CLAVE, JSON.stringify(state.plantillastotales));

  localStorage.setItem(CLAVE_FILTRO, state.filtro ?? "");

  document.getElementById("estado").textContent = state.plantillastotales.length > 0 ? "Guardado ✓" : "Vacío";
}
```

`localStorage` solo puede almacenar texto, así que el arreglo de plantillas se convierte con `JSON.stringify()` antes de guardarse. Si no hay plantillas, se borra la clave directamente con `removeItem()` en vez de guardar un arreglo vacío. El filtro, al ser ya un texto simple, se guarda tal cual, sin `stringify`. `guardar()` se llama automáticamente al final de cada `render()` (en `js/ui.js`), así que cualquier cambio de estado (agregar, editar, eliminar, vaciar) queda persistido sin tener que llamarlo manualmente en cada función.

Como `storage.js` es un módulo ES (importado con `import`/`export`), necesita traer `state` explícitamente desde `state.js` con `import { state } from "./state.js";` — a diferencia de los scripts clásicos, los módulos no comparten variables globales entre archivos.

### Cargar (`cargar()`)

```js
function cargar() {
  const guardado = localStorage.getItem(CLAVE);
  if (guardado === null) return [];
  try {
    return JSON.parse(guardado);
  } catch (error) {
    console.warn("Datos corruptos, empiezo de cero:", error);
    return [];
  }
}
```

`getItem()` devuelve el texto guardado, o `null` si nunca se guardó nada — en ese caso se retorna un arreglo vacío de inmediato. Si sí hay texto, se usa `JSON.parse()` para reconstruirlo de vuelta a un arreglo de objetos.

**Por qué el `try/catch`:** `JSON.parse()` puede fallar si el texto guardado está corrupto o mal formado (por ejemplo, si el usuario editó manualmente los datos de `localStorage` desde la consola, o el valor quedó incompleto por algún error). Sin protección, ese fallo detendría toda la aplicación. Con `try/catch`, si `JSON.parse()` lanza un error, este se atrapa en el `catch`, se registra en consola con `console.warn()`, y la app sigue funcionando normalmente devolviendo una lista vacía en vez de romperse.

Al final del archivo, `guardar`, `cargar`, `CLAVE` y `CLAVE_FILTRO` se exportan con `export { guardar, cargar, CLAVE, CLAVE_FILTRO };`, para que `js/app.js` (que necesita `cargar` y `CLAVE_FILTRO` al arrancar) y `js/ui.js` (que necesita `guardar` dentro de `render()`) puedan importarlos.