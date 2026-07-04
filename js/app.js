const state={
    plantillastotales:[]
};

function agregarPlantilla(titulo, mensaje, hashtag){
    const nuevaplantilla=new Template(titulo, mensaje, hashtag);
    state.plantillastotales.push(nuevaplantilla);  // agrega la nueva plantilla al estado
}

const lista=document.getElementById("listaPlantillas");

function render(){ //pinta

    lista.innerHTML="" ;   //limpia lo anterior (inner htmtl : leer o modificar el contenido HTML dentro de un elemento específico)
    plantillasVisibles().forEach(function (plantilla) { 

        const fechaTexto=plantilla.fechareal.toLocaleDateString("es-PE");  //tocalatedatastring es // "3/7/2026"  ← formato legible peruano
        const li=document.createElement("li");
        li.className="bg-white p-4 rounded-lg shadow"; //p es padding de 1 rem pa los 4 lados y roundd lg es esquina redondeadas grande
       
        li.innerHTML = `
    <div class="flex items-start justify-between gap-2">
    <strong class="text-slate-800">${plantilla.tituloreal}</strong>
    <span class="text-xs text-slate-400 shrink-0">${plantilla.fechareal.toLocaleDateString("es-PE")}</span>
    </div>
    <p class="text-sm text-slate-600 mt-1">${plantilla.mensajereal}</p>
    <span class="inline-block text-xs bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full mt-2">${plantilla.hashtagreal}</span>
    <div class="flex gap-2 mt-3 pt-2 border-t border-slate-100">
    <button class="btn-editar text-xs px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 hover:bg-blue-100 transition" data-id="${plantilla.id}">Editar</button>
    <button class="btn-eliminar text-xs px-2.5 py-1 rounded-md bg-red-50 text-red-600 hover:bg-red-100 transition" data-id="${plantilla.id}">Eliminar</button>
    </div>`;

    
    
      lista.appendChild(li);                     // 2. agrega un nodo por dato APPENCHILD permite insertar un nuevo nodo o elemento HTML al final de la lista de hijos de otro elemento padre
      });
  renderSelector(); //
   renderStats() 
}




  



function eliminarPlantilla(id) {
  state.plantillastotales = state.plantillastotales.filter(plantilla => plantilla.id !== id);  // filtra las que son diferente id ya que dan true y esas se queda, las que dan false se van y no se pintan
  render();
}



lista.addEventListener("click", function (evento) { //el listener esta en el padre LISTA no cada botón
  const id = evento.target.dataset.id;              // lee el data-id
  if (evento.target.classList.contains("btn-eliminar")) eliminarPlantilla(id); //evento.target es donde el usuario hizo clic, botón, titulo,cualquier cosa dentro de lista.
  if (evento.target.classList.contains("btn-editar"))   cargarEnFormulario(id); //.classList → es una lista de todas las clases CSS que tiene ese elemento.
});
//.contains("btn-eliminar") → pregunta: "¿este elemento tiene la clase btn-eliminar?"

function cargarEnFormulario(id) {
  const plantilla = state.plantillastotales.find(plantilla => plantilla.id === id); //find :primer elemento q cumpla condicion
  titulo.value = plantilla.tituloreal;
  mensaje.value = plantilla.mensajereal;
  hashtag.value = plantilla.hashtagreal;
  state.editandoId = id;          // recordamos que estamos editando, no creando
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



function renderStats() {
  const total = state.plantillastotales.length; //cuanta numero de plantillas
  const porTag = contarPorHashtag(state.plantillastotales);
  const etiquetas = Object.entries(porTag) 
    .map(([hashtag, cantidad]) =>  //se ponen 2 parametros porque el entries separa los valores {hashtag}= #promo y {cantidad}="2"
      `<span class="text-xs bg-white border border-slate-200 px-2 py-0.5 rounded-full">${hashtag} · ${cantidad}</span>`)
    .join("");
  document.getElementById("panel-stats").innerHTML = `
    <div class="flex items-center gap-2 flex-wrap">
      <span class="text-sm font-semibold text-slate-700">${total} plantilla(s)</span>
      ${etiquetas}
    </div>`;
}

//Object.keys(porTag)     // → ["#promo", "#saludo"]           (solo las claves)
//Object.values(porTag)   // → [2, 1]                          (solo los valores)
//Object.entries(porTag)  // → [["#promo", 2], ["#saludo", 1]] (ambos juntos)


function plantillasVisibles() {
  const filtroTexto = (state.filtro ?? "").toLowerCase();  //valor ?? valorPorDefecto
  if (filtroTexto === "") return state.plantillastotales;
  return state.plantillastotales.filter(plantilla => plantilla.hashtagreal.toLowerCase().includes(filtroTexto));
}



document.getElementById("buscador").addEventListener("input", function (evento) {
  state.filtro = evento.target.value;   // el filtro vive en el estado
  render();                             // mismo render, datos distintos
});





function normalizarHashtag(texto) {
  const limpio = texto.trim().toLowerCase();           // sin espacios, en minúscula     "  Hola Mundo  ".trim()   // → "Hola Mundo"  (sin espacios sobrantes al inicio y final)
  //tolowercase todo en minuscula
  return limpio.startsWith("#") ? limpio : "#" + limpio; // asegura el #, STARTWITH pregunta si inicia con el caracter q le paso

  //condición ? valorSiEsVerdadero : valorSiEsFalso

}

const form = document.getElementById("form-plantilla");

form.addEventListener("submit", function (evento) { //al hacer click en submit dispara el evento ADDEVENTLISTENER DETECTA O ESUCHA LA INTERACCION DLE USUARIO
  evento.preventDefault();   // "cancela" la recarga automática de la página
  const tituloTexto = titulo.value.trim();
  const mensajeTexto = mensaje.value.trim();

  if (tituloTexto.length === 0 || mensajeTexto.length === 0) {              // validación
    alert("Título y mensaje son obligatorios");
    return;
  }




  if (state.editandoId) {
  state.plantillastotales = state.plantillastotales.map(plantilla =>     // actualiza solo esa, sin mutar
    plantilla.id === state.editandoId ? { ...plantilla, tituloreal: tituloTexto, mensajereal: mensajeTexto, hashtagreal: normalizarHashtag(hashtag.value) } : plantilla
  );

  //:plantilla=dejarla como está sin cambios
  //condicion ? valorSiVerdadero : valorSiFalso
  //... :copia todas las propiedades que ya tiene plantilla id, tituloreal, mensajereal, hashtagreal, fechareal...), y después sobrescribe las que yo indique después". 
  state.editandoId = null;
} else {
  agregarPlantilla(tituloTexto, mensajeTexto, normalizarHashtag(hashtag.value));
}

  render(); //vuelve a pintar
  form.reset(); //vuelve al estado inicial DEVOLVIENDO LOS CAMPOS A SUS ESTADO INICIAL
});



function generarMensajeFinal(plantilla, valorNombre) {
  return plantilla.mensajereal.replaceAll("{nombre}", valorNombre);  //nombre se reemplaza por valor nombre
}



//POR ESTUDIAR

const selector = document.getElementById("selector");

function renderSelector() {
  // Se define la función que llena el <select> con las plantillas guardadas

  selector.innerHTML = state.plantillastotales
  // "selector" es el <select> del HTML.
  // .innerHTML = ... va a reemplazar todo su contenido con lo que armemos abajo.
  // state.plantillastotales es tu array real de plantillas guardadas.

    .map((plantilla, indice) => `<option value="${indice}">${plantilla.tituloreal}</option>`)
    // .map() recorre cada plantilla del array y la convierte en un <option>.
    // "plantilla" es el objeto individual en cada vuelta; "indice" es su posición (0,1,2...).
    // value="${indice}" guarda la posición como el valor de esa opción del select.
    // ⚠️ plantilla.titulo debería ser plantilla.tituloreal, porque así se llama
    //    la propiedad real en tu clase Template.

    .join("");
    // Une todos los <option> generados (que están en un array) en un solo string de HTML.
}


const salida = document.getElementById("mensaje-final");
// "salida" apunta al elemento del HTML (probablemente un <p> o <div>)
// donde se va a mostrar el mensaje ya armado con el nombre real puesto.


document.getElementById("btn-generar").addEventListener("click", function () {
  // Se agrega un "escuchador" de clics al botón con id="btn-generar".
  // Cada vez que el usuario haga clic, se ejecuta esta función.

  const plantilla = state.plantillastotales[Number(selector.value)];
  // selector.value trae el "value" del <option> elegido (el índice, pero como texto).
  // Number(...) lo convierte a número, para usarlo como posición dentro del array.


  const nombre = document.getElementById("valorNombre").value.trim();
  // Se busca el input donde el usuario escribió el nombre del destinatario,
  // se lee su texto con .value, y .trim() le quita espacios sobrantes.

  salida.textContent = generarMensajeFinal(plantilla, nombre);
  // Se llama a la función que reemplaza "{nombre}" por el nombre real,
  // y el resultado se escribe dentro del elemento "salida" en pantalla.
});





document.getElementById("btn-copiar").addEventListener("click", function () {
  // Se agrega un escuchador de clics al botón con id="btn-copiar"

  navigator.clipboard.writeText(salida.textContent)
  // Intenta copiar el texto de "salida" al portapapeles.
  // writeText() devuelve una PROMESA (una operación que puede tardar o fallar)

    .then(() => {
      console.log("✅ Copiado con éxito");
      // Si la copia funcionó, esto se ejecuta
    })

    .catch((error) => {
      console.error("❌ Error al copiar:", error);
      // Si algo falló (permisos bloqueados, contexto no seguro, etc.),
      // aquí vas a ver el motivo EXACTO del error
    });
});