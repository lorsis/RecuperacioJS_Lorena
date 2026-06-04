document.addEventListener('DOMContentLoaded', main);

let datosCoches = [];
let datosClientes = [];
let datosReservas = [];
function main() {
    obtenerDatos();


    document.getElementById('guardarReserva').addEventListener('click', validarReserva);
    // activar eventdos de los botones
}

async function obtenerDatos(){
    // obtindre dades 
    datosCoches = JSON.parse(localStorage.getItem('datosCoches')) || await recuperar_json('coches')
    datosClientes = JSON.parse(localStorage.getItem('datosClientes')) || await recuperar_json('clientes')
    datosReservas = JSON.parse(localStorage.getItem('datosReservas')) || await recuperar_json('reservas')
   // cargar datos de coche 
    cargarDatosReservas(datosReservas);
    // cargar select de clientes
    await cargarSelectClientes(datosClientes);
    await cargarSelectCoches(datosCoches);

}

async function recuperar_json (tabla) {
    try {
    const response = await fetch('data/data.json');
    const data = await response.json();
    console.log(data);
    switch (tabla) {
        case 'coches':
            localStorage.setItem('datosCoches', JSON.stringify(data.coches));
            return data.coches;
        case 'clientes':
            localStorage.setItem('datosClientes', JSON.stringify(data.clientes));
            return data.clientes;
        case 'reservas':
            localStorage.setItem('datosReservas', JSON.stringify(data.reservas));
            return data.reservas;   
        default:
            console.error('Tabla no reconocida');
            return [];
    }
    
    } catch (error) {
        console.error('Error al recuperar el JSON:', error);
        return [];
    }   
} 

function cargarDatosReservas(datos) {
    const tbodyReservas = document.getElementById('tbodyReservas');
    //Eliminar opciones anteriores
    tbodyReservas.replaceChildren();

    datos.forEach(reserva => {
        const fila = document.createElement('tr');
        fila.setAttribute('id', `r-${reserva.id}`);
        
        const tdid = document.createElement('td');
        const txrid = document.createTextNode(reserva.id);
        tdid.appendChild(txrid);
    
        const tdcliente = document.createElement('td');
        const txcliente = document.createTextNode(obtenerNombreCliente(reserva.clienteId));
        tdcliente.appendChild(txcliente);

        const tdmatricula = document.createElement('td');
        const txmatricula = document.createTextNode(obtenerNombreCoche(reserva.matricula));
        tdmatricula.appendChild(txmatricula);

        const tdfechaDesde = document.createElement('td');
        const txfechaDesde = document.createTextNode(new Date(reserva.fechaDesde).toLocaleString());
        tdfechaDesde.appendChild(txfechaDesde);

        const tdfechaHasta = document.createElement('td');
        const txfechaHasta = document.createTextNode(new Date(reserva.fechaHasta).toLocaleString());
        tdfechaHasta.appendChild(txfechaHasta);

        const tdestado = document.createElement('td');
        const txestado = document.createTextNode(reserva.estado);
        tdestado.appendChild(txestado);

        // actions
        const tdactions = document.createElement('td');
            // cambiar estado
       const selectEstado = document.createElement('select');
        const estados = ['Pendiente', 'Preparación', 'Terminado'];
        estados.forEach(estado => {
            const option = document.createElement('option');
            option.value = estado;
            option.textContent = estado;
            if (estado === reserva.estado) {
                option.selected = true;
            }
            selectEstado.appendChild(option);
        });
        selectEstado.className = 'form-select form-select-sm';
        selectEstado.setAttribute('id', `select-estado-${reserva.id}`);
        selectEstado.addEventListener('change', cambiarEstado(reserva.id));
        tdactions.appendChild(selectEstado);  
        tdactions.className = 'd-flex align-items-center gap-2';

             // eliminar 
        
        const deleteButton= document.createElement('button');
        const deleteIcon = document.createElement('i');
        deleteIcon.className = 'fas fa-trash';
        deleteButton.appendChild(deleteIcon);
        deleteButton.className = 'btn btn-danger btn-action';
        deleteButton.addEventListener('click', () => {
            eliminarReserva(reserva.id);
        });
        tdactions.appendChild(deleteButton);
   
        fila.appendChild(tdid);
        fila.appendChild(tdcliente);
        fila.appendChild(tdmatricula);
        fila.appendChild(tdfechaDesde);
        fila.appendChild(tdfechaHasta);
        fila.appendChild(tdestado);
        fila.appendChild(tdactions);
        tbodyReservas.appendChild(fila);
    });
}   

function obtenerNombreCliente(clienteId) {
    const cliente = datosClientes.find(c => c.id === clienteId);
    return cliente ? `${cliente.nombre} ${cliente.apellidos}` : 'Desconocido';
}

function obtenerNombreCoche(matricula) {
    const coche = datosCoches.find(c => c.matricula === matricula);
    return coche ? `${coche.marca} ${coche.modelo} (${coche.matricula})` : 'Desconocido';
}   


async function cargarSelectClientes() {
    const selectCliente = document.getElementById('selectCliente');
    //Eliminar opciones anteriores
    selectCliente.replaceChildren();

    datosClientes.forEach(cliente => {
        const option = document.createElement('option');
        option.setAttribute('value', cliente.id);
        const txrOption = document.createTextNode(`${cliente.nombre} ${cliente.apellidos}`);
        option.appendChild(txrOption);
        selectCliente.appendChild(option);
    });
}


async function cargarSelectCoches() {
    const selectCoche = document.getElementById('selectCoche'); 
    //Eliminar opciones anteriores
    selectCoche.replaceChildren();

    datosCoches.forEach(coche => {
        const option = document.createElement('option');
        option.setAttribute('value', coche.id);
        const txrOption = document.createTextNode(`${coche.marca} ${coche.modelo} (${coche.matricula})`);
        option.appendChild(txrOption);
        selectCoche.appendChild(option);
    });
}   



function validarReserva(e) {
      e.preventDefault();
    esborrarError ();
    if (validarNomPlaylist() && confirm("Confirma si quieres enviar el formulario") ){
            grabar_playlist();
        return true;
    }else{
        return false;
    }
}

function cambiarEstado(id) {
    return function() {
        const selectEstadoChange = document.getElementById(`select-estado-${id}`);
        const nuevoEstado = selectEstadoChange.value;
         console.log(id, nuevoEstado);
        const reserva = datosReservas.find(r => r.id === id);
        if (reserva) {
            reserva.estado = nuevoEstado;
           

            localStorage.setItem('datosReservas', JSON.stringify(datosReservas));
            cargarDatosReservas(datosReservas);
        }
    }   
}



function eliminarReserva(id) {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar esta reserva?');
    if (!confirmacion) {
        return;
    }else{
        const index = datosCoches.findIndex(coche => coche.id === id);
        if (index !== -1) {
            datosCoches.splice(index, 1);
            localStorage.setItem('datosCoches', JSON.stringify(datosCoches));
            cargarDatosCoche(datosCoches);
        }
    }   
}



function error (element, missatge){
    let miss=document.createTextNode(missatge);    
    document.getElementById("missatgeError").appendChild(miss);
    element.classList.add("text-danger");
    element.focus();
}


function esborrarError (){
    document.getElementById("missatgeError").textContent="";
    let formulari = document.forms[0];
        for ( let i=0; i < formulari.elements.length; i++){
            formulari.elements[i].classList.remove("error");
        }
}
