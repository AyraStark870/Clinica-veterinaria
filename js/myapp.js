const nombreInput = document.querySelector('#nombre');
const apellidoInput = document.querySelector('#apellidos');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

const formulario = document.querySelector('#nueva-cita')
const contenedorCitas = document.querySelector('#citas');

let editando;
let DB;

window.onload = () => {
  eventListeners();

  crearDB();
}

class Citas{
  constructor(){
    this.citas = [];
  }
  agregarCita(cita){
    this.citas = [...this.citas, cita]
  }
  eliminarCita(id){
    this.citas = this.citas.filter(cita => cita.id !== id);
  }
  editarCita(citaActualizada) {
    this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita)
  }
}
class UI{
  imprimirAlerta(mensaje, tipo){
    const divMensaje = document.createElement('div');
    divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');

    if (tipo === 'error') {
      divMensaje.classList.add('alert-danger');
    } else {
      divMensaje.classList.add('alert-success');
    }
    divMensaje.textContent = mensaje;
    document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita'));
    setTimeout(() => {
      divMensaje.remove();
    }, 3000);
  }
  imprimirCitas(){
    this.limpiarHTML()
    //leer contenido de la base de datos
    const objectStore = DB.transaction('citas').objectStore('citas')

    objectStore.openCursor().onsuccess = function(e){
      const cursor = e.target.result;//openCursor hace como un forEach

      if(cursor){
        const { nombre, apellidos, telefono, fecha, hora, sintomas, id } = cursor.value;

        const divCita = document.createElement('div');
        divCita.classList.add('cita', 'p-3');
        divCita.dataset.id = id;

        // scRIPTING DE LOS ELEMENTOS...
        const nombreParrafo = document.createElement('h4');
        nombreParrafo.classList.add('card-title', 'font-weight-bolder');
        nombreParrafo.innerHTML = `${nombre} ${apellidos}`;



        const telefonoParrafo = document.createElement('p');
        telefonoParrafo.innerHTML = `<span class="font-weight-bolder">Teléfono: </span> ${telefono}`;

        const fechaParrafo = document.createElement('p');
        fechaParrafo.innerHTML = `<span class="font-weight-bolder">Fecha: </span> ${fecha}`;

        const horaParrafo = document.createElement('p');
        horaParrafo.innerHTML = `<span class="font-weight-bolder">Hora: </span> ${hora}`;

        const sintomasParrafo = document.createElement('p');
        sintomasParrafo.innerHTML = `<span class="font-weight-bolder">Síntomas: </span> ${sintomas}`;

        // Agregar un botón de eliminar...
        const btnEliminar = document.createElement('button');
        btnEliminar.onclick = () => eliminarCita(id);
        btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
        btnEliminar.innerHTML = 'Eliminar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'

        // Añade un botón de editar...
        const btnEditar = document.createElement('button');
        const cita = cursor.value
        btnEditar.onclick = () => cargarEdicion(cita);
        btnEditar.classList.add('btn', 'btn-info');
        btnEditar.innerHTML = 'Editar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>'

        // Agregar al HTML
        divCita.appendChild(nombreParrafo);

        divCita.appendChild(telefonoParrafo);
        divCita.appendChild(fechaParrafo);
        divCita.appendChild(horaParrafo);
        divCita.appendChild(sintomasParrafo);
        divCita.appendChild(btnEliminar)
        divCita.appendChild(btnEditar)

        contenedorCitas.appendChild(divCita);

        cursor.continue()//para que vaya al siguiente elemento
      }
    }
  }

  limpiarHTML() {
    while (contenedorCitas.firstChild) {
      contenedorCitas.removeChild(contenedorCitas.firstChild);
    }
  }
}

const ui = new UI()

const administrarCitas = new Citas()

function eventListeners(){
  nombreInput.addEventListener('change', datosCita)
  apellidoInput.addEventListener('change', datosCita);
  telefonoInput.addEventListener('change', datosCita);
  fechaInput.addEventListener('change', datosCita);
  horaInput.addEventListener('change', datosCita);
  sintomasInput.addEventListener('change', datosCita);

  formulario.addEventListener('submit', nuevaCita)
}


const citaObj = {
  nombre: '',
  apellidos: '',
  telefono: '',
  fecha: '',
  hora: '',
  sintomas: ''
}

function datosCita(e){
  citaObj[e.target.name] = e.target.value//utilizo esta sintaxis para acceder a las propiedades del objeto

}

function nuevaCita(e){
   e.preventDefault()
  const { nombre, apellidos, telefono, fecha, hora, sintomas } = citaObj;

  if (nombre === '' || apellidos === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '') {
    ui.imprimirAlerta('Todos los mensajes son Obligatorios', 'error');
    return
  }
  if(editando){
    administrarCitas.editarCita({ ...citaObj });//de nuevo NO PASAR EL OBJ GLOBAL!!!!!

    //edita en indexDB
    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');

    objectStore.put(citaObj);

    transaction.oncomplete = () => {
      ui.imprimirAlerta('Editado Correctamente');
      formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';
      editando = false;
    }

    transaction.onerror = () => {
      console.log('Hubo un errorr.')
    }


  } else {
     citaObj.id = Date.now()
     administrarCitas.agregarCita({...citaObj}) //no pasar el objeto global sino una 'copia' del contenido de ese objetp

    const transaction = DB.transaction(['citas'], 'readwrite');
    const objectStore = transaction.objectStore('citas');
    // console.log(objectStore);
     objectStore.add(citaObj);

    transaction.oncomplete = () => {
      console.log('Cita agregada!');

      // Mostrar mensaje de que todo esta bien...
      ui.imprimirAlerta('Se agregó correctamente')

    }

    transaction.onerror = () => {
      console.log('Hubo un error!');
    }


    }


  reiniciarObjeto();
  formulario.reset();

  ui.imprimirCitas()
}

function reiniciarObjeto() {
  citaObj.nombre = '';
  citaObj.apellidos = '';
  citaObj.telefono = '';
  citaObj.fecha = '';
  citaObj.hora = '';
  citaObj.sintomas = '';
}

function eliminarCita(id) {

  // NUEVO:
  const transaction = DB.transaction(['citas'], 'readwrite');
  const objectStore = transaction.objectStore('citas');
  objectStore.delete(id);

  transaction.oncomplete = () => {
    console.log(`Cita  ${id} fue eliminado`);
    administrarCitas.eliminarCita(id);
    ui.imprimirCitas()
  }


  transaction.onerror = () => {
    console.log('Hubo un error!');
  }


}
function cargarEdicion(cita){
  const { nombre, apellidos, telefono, fecha, hora, sintomas, id } = cita;
  //llenar los input
  nombreInput.value = nombre;
  apellidoInput.value = apellidos;
  telefonoInput.value = telefono;
  fechaInput.value = fecha;
  horaInput.value = hora;
  sintomasInput.value = sintomas;

  //lenar el objeto
  citaObj.nombre = nombre;
  citaObj.apellidos = apellidos;
  citaObj.telefono = telefono;
  citaObj.fecha = fecha
  citaObj.hora = hora;
  citaObj.sintomas = sintomas;
  citaObj.id = id;

  formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

  editando = true;

}

function crearDB(){
  // crear base de datos con la versión 1
  const crearDB = window.indexedDB.open('citas', 1);

  // si hay un error, lanzarlo
  crearDB.onerror = function () {
    console.log('Hubo un error');
  }

  // si todo esta bien, asignar a database el resultado
  crearDB.onsuccess = function () {
    console.log('DB creada');

    // guardamos el resultado
    DB = crearDB.result;

    // mostrar citas al cargar
    ui.imprimirCitas()

  }
  crearDB.onupgradeneeded = function (e) {
    // el evento que se va a correr tomamos la base de datos
    const db = e.target.result;


    // definir el objectstore, primer parametro el nombre de la BD, segundo las opciones
    // keypath es de donde se van a obtener los indices
    const objectStore = db.createObjectStore('citas', { keyPath: 'id', autoIncrement: true });

    //createindex, nombre y keypath, 3ro los parametros
    objectStore.createIndex('nombre', 'nombre', { unique: false });
    objectStore.createIndex('apellidos', 'apellidos', { unique: false });
    objectStore.createIndex('telefono', 'telefono', { unique: false });
    objectStore.createIndex('fecha', 'fecha', { unique: false });
    objectStore.createIndex('hora', 'hora', { unique: false });
    objectStore.createIndex('sintomas', 'sintomas', { unique: false });
    objectStore.createIndex('id', 'id', { unique: true });



    console.log('Database creada y lista');
  }
}

