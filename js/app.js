import { state } from "./state.js";
import { cargar, CLAVE_FILTRO } from "./storage.js";
import { render } from "./ui.js";

state.plantillastotales = cargar(); //carga lo guardado en localStorage
state.filtro = localStorage.getItem(CLAVE_FILTRO) ?? "";     // recupera el filtro (o vacío)
document.getElementById("buscador").value = state.filtro;    // muéstralo en el input
render();  //pinta la pantalla con esos datos