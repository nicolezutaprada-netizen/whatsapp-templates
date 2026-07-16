import { state, agregarPlantilla, plantillasVisibles, contarPorHashtag, normalizarHashtag, generarMensajeFinal } from "./state.js";
import { guardar } from "./storage.js";



const titulo = document.getElementById("titulo");
const mensaje = document.getElementById("mensaje");
const hashtag = document.getElementById("hashtag");

const lista=document.getElementById("listaPlantillas");


function render(){ //pinta

    lista.innerHTML="" ;   //limpia lo anterior (inner htmtl : leer o modificar el contenido HTML dentro de un elemento específico)

    const visibles = plantillasVisibles();

    if (visibles.length === 0) {
      // estado vacío amigable: distingue "no hay nada creado" vs "el filtro no encontró nada"
      const vacio = state.plantillastotales.length === 0
        ? "Aún no tienes plantillas. ¡Crea la primera!"
        : "No se encontraron plantillas con ese filtro.";
      lista.innerHTML = `
        <li class="sm:col-span-2 text-center text-[var(--text-muted)] py-10">
          <div class="text-4xl mb-2">💬</div>
          ${vacio}
        </li>`;
    } else {
      visibles.forEach(function (plantilla) { 

        const fechaTexto=new Date(plantilla.fechareal).toLocaleDateString("es-PE");  //tocalatedatastring es // "3/7/2026"  ← formato legible peruano
        const li=document.createElement("li");
        li.className="bubble p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)] ml-2"; //p es padding de 1 rem pa los 4 lados y roundd lg es esquina redondeadas grande
       
        li.innerHTML = `
    <div class="flex items-start justify-between gap-2">
    <strong class="font-display text-[var(--text)]">${plantilla.tituloreal}</strong>
    <span class="font-mono text-[10px] text-[var(--text-muted)] shrink-0">${new Date(plantilla.fechareal).toLocaleDateString("es-PE")}</span> 
    </div>
    <p class="text-sm text-[var(--text-muted)] mt-1">${plantilla.mensajereal}</p>
    <span class="inline-block font-mono text-xs px-2 py-0.5 rounded-full mt-2 border border-[var(--accent)] text-[var(--accent)]">${plantilla.hashtagreal}</span>
    <div class="flex gap-2 mt-3 pt-2 border-t border-[var(--border)]">
    <button class="btn-editar text-xs px-2.5 py-1 rounded-md border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)] transition" data-id="${plantilla.id}">Editar</button>
    <button class="btn-eliminar text-xs px-2.5 py-1 rounded-md bg-[rgba(248,113,113,0.12)] text-[var(--danger)] hover:bg-[rgba(248,113,113,0.22)] transition" data-id="${plantilla.id}">Eliminar</button>
    </div>`;

    //se pone new date () ya que todo se paso a texto entonces ahora debe volver a objeto/array para trabajar con tocolaledatestring
    //por eso se reconstruye con new date a partir del texto que dejo stringify
    
      lista.appendChild(li);                     // 2. agrega un nodo por dato APPENCHILD permite insertar un nuevo nodo o elemento HTML al final de la lista de hijos de otro elemento padre
      });
    }

  renderSelector(); //
   renderStats()
   guardar();   
}


// --- Modal de confirmación ---

const modal = document.getElementById("modal");
let accionPendiente = null;     // INICIA VACIA

function pedirConfirmacion(mensaje, accion) {
  document.getElementById("modal-texto").textContent = mensaje;  //textcontent es lo que se ve dentro del parrafo y mensaje se iguala pa q ese valor del parrafo ahora sea lo que tendra el parametro mensaje
  accionPendiente = accion;
  modal.classList.remove("hidden");     // e la lista de clases del modal, quítale la que se llama hidden"(class list separa cad a propiedad como individual)
}

document.getElementById("modal-cancelar").addEventListener("click", function () {  //addeventlistener es un escuchador de eventos
  modal.classList.add("hidden");        // se le agrega hidden despues de q se quito
  accionPendiente = null;  // limpia la acción guardada (por seguridad)
});

document.getElementById("modal-confirmar").addEventListener("click", function () {
  if (accionPendiente)
     accionPendiente();   // ejecuta la acción guardada
  modal.classList.add("hidden");
  accionPendiente = null;
});



function eliminarPlantilla(id) {
  pedirConfirmacion("¿Eliminar esta plantilla?", function () {
    state.plantillastotales = state.plantillastotales.filter(plantilla => plantilla.id !== id);
    render();
  });
}

const btnVaciar = document.getElementById("btn-vaciar");
btnVaciar.addEventListener("click", function () {
  pedirConfirmacion("Esto borrará TODAS tus plantillas. ¿Continuar?", function () {
    state.plantillastotales = [];
    render();     // render → guardar(); como queda vacío, guardar() borra la clave
  });
});



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



document.getElementById("buscador").addEventListener("input", function (evento) {
  state.filtro = evento.target.value;   // el filtro vive en el estado
  render();                             // mismo render, datos distintos
});



document.getElementById("orden").addEventListener("change", function (evento) {
  state.orden = evento.target.value;   // el orden vive en el estado
  render();
});



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



export { render };