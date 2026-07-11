ram## Persistencia de datos (`js/persistence.js`)

Las plantillas y el filtro de búsqueda se guardan en `localStorage`, para que no se pierdan al recargar la página o cerrar el navegador.

### Guardar (`guardar()`)

```js
function guardar() {
  state.plantillastotales.length === 0
    ? localStorage.removeItem(CLAVE)
    : localStorage.setItem(CLAVE, JSON.stringify(state.plantillastotales));

  localStorage.setItem(CLAVE_FILTRO, state.filtro ?? "");

  document.getElementById("estado").textContent = state.plantillastotales.length > 0 ? "Guardado ✓" : "Vacío";
}
```

`localStorage` solo puede almacenar texto, así que el arreglo de plantillas se convierte con `JSON.stringify()` antes de guardarse. Si no hay plantillas, se borra la clave directamente con `removeItem()` en vez de guardar un arreglo vacío. El filtro, al ser ya un texto simple, se guarda tal cual, sin `stringify`. `guardar()` se llama automáticamente al final de cada `render()`, así que cualquier cambio de estado (agregar, editar, eliminar, vaciar) queda persistido sin tener que llamarlo manualmente en cada función.

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