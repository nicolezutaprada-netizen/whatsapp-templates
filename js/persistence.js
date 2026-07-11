const CLAVE = "whatsapp-templates";  
const CLAVE_FILTRO = "whatsapp-templates-filtro";


function guardar() {
  
  state.plantillastotales.length === 0 // si no hay plantillas,
    ? localStorage.removeItem(CLAVE) //borra la clave;
    : localStorage.setItem(CLAVE, JSON.stringify(state.plantillastotales)); // si hay, guárdalas

    // JSON.stringify:convierte un objeto/aarreglo a texto
    // //localStorage → almacenamiento persistente(no se borra aunque cierres todo)
    //setItem → guardar/actualizar dato(la accion de meter algo en local  

    localStorage.setItem(CLAVE_FILTRO, state.filtro ?? "");   // el filtro es texto: sin stringify

  document.getElementById("estado").textContent = state.plantillastotales.length > 0 ? "Guardado ✓" : "Vacío"; //textcontent:leer o cambiar texto
 
}





function cargar() {
  const guardado = localStorage.getItem(CLAVE); // getitem:lee lo que está guardadp
  if (guardado===null) return []; //
  try {
    return JSON.parse(guardado);          // intenta reconstruir, parse:convertir de texto a objeto/array
  } catch (error) { 
    console.warn("Datos corruptos, empiezo de cero:", error);
    return [];                            // si falla, no rompas: lista vacía
  }
}



