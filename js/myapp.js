const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

const formulario = document.querySelector('#nueva-cita')
const contenedorCitas = document.querySelector('#citas');

let editando;

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
  imprimirCitas({citas}){//hago destructuring desde aca para extraer el arreglo de citas del objeto para acceder directamente al arreglo
    this.limpiarHTML()
    citas.forEach(cita => {
      const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;

      const divCita = document.createElement('div');
      divCita.classList.add('cita', 'p-3');
      divCita.dataset.id = id;

      // scRIPTING DE LOS ELEMENTOS...
      const mascotaParrafo = document.createElement('h2');
      mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
      mascotaParrafo.innerHTML = `${mascota}`;

      const propietarioParrafo = document.createElement('p');
      propietarioParrafo.innerHTML = `<span class="font-weight-bolder">Propietario: </span> ${propietario}`;

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
      btnEditar.onclick = () => cargarEdicion(cita);
      btnEditar.classList.add('btn', 'btn-info');
      btnEditar.innerHTML = 'Editar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>'

      // Agregar al HTML
      divCita.appendChild(mascotaParrafo);
      divCita.appendChild(propietarioParrafo);
      divCita.appendChild(telefonoParrafo);
      divCita.appendChild(fechaParrafo);
      divCita.appendChild(horaParrafo);
      divCita.appendChild(sintomasParrafo);
      divCita.appendChild(btnEliminar)
      divCita.appendChild(btnEditar)

      contenedorCitas.appendChild(divCita);
    });
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
  mascotaInput.addEventListener('change', datosCita)
  propietarioInput.addEventListener('change', datosCita);
  telefonoInput.addEventListener('change', datosCita);
  fechaInput.addEventListener('change', datosCita);
  horaInput.addEventListener('change', datosCita);
  sintomasInput.addEventListener('change', datosCita);

  formulario.addEventListener('submit', nuevaCita)
}
eventListeners()

const citaObj = {
  mascota: '',
  propietario: '',
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
  const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;

  if (mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === '') {
    ui.imprimirAlerta('Todos los mensajes son Obligatorios', 'error');
    return
  }
  if(editando){
    administrarCitas.editarCita({ ...citaObj });//de nuevo NO PASAR EL OBJ GLOBAL!!!!!

    ui.imprimirAlerta('Editado Correctamente');
    formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';
    editando = false;
  } else {
     citaObj.id = Date.now()
     administrarCitas.agregarCita({...citaObj}) //no pasar el objeto global sino una 'copia' del contenido de ese objetp
     ui.imprimirAlerta('Se agregó correctamente')
    }


  reiniciarObjeto();
  formulario.reset();

  ui.imprimirCitas(administrarCitas)
}

function reiniciarObjeto() {
  citaObj.mascota = '';
  citaObj.propietario = '';
  citaObj.telefono = '';
  citaObj.fecha = '';
  citaObj.hora = '';
  citaObj.sintomas = '';
}
function eliminarCita(id) {
  administrarCitas.eliminarCita(id);
  ui.imprimirAlerta('la cita elimino correctamente')
  ui.imprimirCitas(administrarCitas)
}
function cargarEdicion(cita){
  const { mascota, propietario, telefono, fecha, hora, sintomas, id } = cita;
  //llenar los input
  mascotaInput.value = mascota;
  propietarioInput.value = propietario;
  telefonoInput.value = telefono;
  fechaInput.value = fecha;
  horaInput.value = hora;
  sintomasInput.value = sintomas;

  //lenar el objeto
  citaObj.mascota = mascota;
  citaObj.propietario = propietario;
  citaObj.telefono = telefono;
  citaObj.fecha = fecha
  citaObj.hora = hora;
  citaObj.sintomas = sintomas;
  citaObj.id = id;

  formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios';

  editando = true;

}
