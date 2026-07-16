
import { Template } from "./models/template.js";

const state = {
    plantillastotales: []
};



function agregarPlantilla(titulo, mensaje, hashtag){
    const nuevaplantilla=new Template(titulo, mensaje, hashtag);
    state.plantillastotales.push(nuevaplantilla);  // agrega la nueva plantilla al estado
}



//contar cuantos # hay de cada palabra
function contarPorHashtag(plantillas) {
  const conteo = {};                              // "caja" vacía
  plantillas.forEach(function (plantilla) {
    const elHashtag = plantilla.hashtagreal;
    if (conteo[elHashtag]) {
      conteo[elHashtag] = conteo[elHashtag] + 1;  // si ya existe, suma 1
    } else {
      conteo[elHashtag] = 1;                      // si es nuevo, empieza en 1
    }
  });
  return conteo;
}

//Object.keys(porTag)     // → ["#promo", "#saludo"]           (solo las claves)
//Object.values(porTag)   // → [2, 1]                          (solo los valores)
//Object.entries(porTag)  // → [["#promo", 2], ["#saludo", 1]] (ambos juntos)



function ordenar(plantillas) {
  const copia = [...plantillas];   // copiamos: .sort() muta el array original
  return state.orden === "antiguas"
    ? copia.sort((a, b) => new Date(a.fechareal) - new Date(b.fechareal))   // más antiguas primero
    : copia.sort((a, b) => new Date(b.fechareal) - new Date(a.fechareal));  // más recientes primero (por defecto)
}



function plantillasVisibles() {
  const filtroTexto = (state.filtro ?? "").toLowerCase();  //valor ?? valorPorDefecto
  const filtradas = filtroTexto === ""
    ? state.plantillastotales
    : state.plantillastotales.filter(plantilla => plantilla.hashtagreal.toLowerCase().includes(filtroTexto));
  return ordenar(filtradas);   // primero filtra, luego ordena
}



function normalizarHashtag(texto) {
  const limpio = texto.trim().toLowerCase();           // sin espacios, en minúscula     "  Hola Mundo  ".trim()   // → "Hola Mundo"  (sin espacios sobrantes al inicio y final)
  //tolowercase todo en minuscula
  return limpio.startsWith("#") ? limpio : "#" + limpio; // asegura el #, STARTWITH pregunta si inicia con el caracter q le paso

  //condición ? valorSiEsVerdadero : valorSiEsFalso

}



function generarMensajeFinal(plantilla, valorNombre) {
  return plantilla.mensajereal.replaceAll("{nombre}", valorNombre);  //nombre se reemplaza por valor nombre
}



export { state, agregarPlantilla, contarPorHashtag, plantillasVisibles, normalizarHashtag, generarMensajeFinal, ordenar };