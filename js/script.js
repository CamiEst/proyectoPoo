class PuntoInteres {

    constructor(lat, lon, tipo, direccion, imagen) {
        this.lat = lat;
        this.lon = lon;
        this.tipo = tipo;
        this.direccion = direccion;
        this.imagen = imagen;
        this.marcador = null; // Referencia al marcador para poder mostrar/ocultar
    }
    
    crearMarcador(map) {
        const icono = this._getIconoTipo();
        this.marcador = L.marker([this.lat, this.lon], { icon: icono }).addTo(map);
        
        this.marcador.bindPopup(`
            <strong>Dirección:</strong> ${this.direccion} <br>
            ` 
            /* dejo esto aqui por si quieres implementarlo tambien
            <strong>Tipo:</strong> ${this.tipo} <br>
            <img src="${this.imagen}" alt="Imagen" style="width:150px; border-radius:8px;">
            */
        );
        this.marcador.on('click', ()=>{
            mostrarInfo(this.lat, this.lon, this.tipo, this.direccion, this.imagen);
        });
    }

    _getIconoTipo() {

        return L.icon({
            iconUrl: `./assets/img/${this.tipo}.png`,
            iconSize: [50, 50]
        });
    }

    mostrar() {
        if (this.marcador) this.marcador.addTo(map);
    }

    ocultar() {
        if (this.marcador) map.removeLayer(this.marcador);
    }
}

const info = document.getElementById('info');
const cerrar = document.getElementById('cerrar')

function mostrarInfo(lat, lon, tipo, direccion, imagen)
{
    info.innerHTML = `
    <img src="${imagen}" alt="Imagen"> <br>
    <p>      
    <strong>Latitud:</strong> ${lat}, <strong>Longitud:</strong> ${lon} <br>
    <strong>Tipo:</strong> ${tipo} <br>
    <strong>Dirección:</strong> ${direccion} <br>
    <p>
    `;
    info.style.right = "1vh";
    cerrar.style.right = "1vh";
}

// Inicializar mapa
const map = L.map('map').setView([10.4236, -75.5517], 16);

// Agregar mapa base
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

map.on('dclick',()=>{
    this.preventEventDeafult();
});



// Lista de puntos de interés para poder mostrar/ocultar según la selección del usuario
let puntosDeInteres = [];

// Cargar puntos desde JSON
fetch('./data/puntos_interes.json')
    .then(response => response.json())
    .then(data => {
        data.puntos.forEach(punto => {
            const p = new PuntoInteres(punto.lat, punto.lon, punto.tipo, punto.direccion, punto.imagen);
            p.crearMarcador(map);
            puntosDeInteres.push(p);
        });
    })
    .catch(err => console.error("Error al cargar puntos: ", err));

// Crear control de selección de tipos de puntos
const control = document.getElementById('selector');

// Evento para mostrar/ocultar los puntos según el tipo seleccionado
cerrar.addEventListener('click',()=>{
    info.style.right = "-40vh";
    cerrar.style.right = "-40vh";
});

const botonTipo = document.querySelectorAll('#tipos button');

botonTipo.forEach((boton, index) => {
    boton.addEventListener('click', () => {
        // Generar la clase 'seleccionadoX' en función del índice
        const claseSeleccionado = `seleccionado${index + 1}`;

        if (boton.classList.contains(claseSeleccionado)) {
            boton.classList.remove(claseSeleccionado);
            mostrarTipo('todos');
        } else {
            // Buscar y eliminar la clase 'seleccionadoX' de cualquier botón previamente seleccionado
            const seleccionado = document.querySelector('[class*="seleccionado"]');
            if (seleccionado !== null) {
                // Eliminamos la clase 'seleccionadoX' de todos los botones
                const clases = seleccionado.classList;
                clases.forEach(clase => {
                    if (clase.startsWith('seleccionado')) {
                        seleccionado.classList.remove(clase);
                    }
                });
            }

            // Añadimos la clase 'seleccionadoX' al botón clicado
            boton.classList.add(claseSeleccionado);
            mostrarTipo(boton.innerText.trim().toLowerCase());
        }
    });
});

function mostrarTipo(mostrar)
{
    const tipoSeleccionado = mostrar;
    puntosDeInteres.forEach(punto => {
        if (tipoSeleccionado === 'todos' || punto.tipo === tipoSeleccionado) {
            punto.mostrar();
        } else {
            punto.ocultar();
        }
    });
}

var marker = L.marker([51.505, -0.09]).addTo(map);
// Función para actualizar la posición del marcador
function updatePosition(position) {
    var Lat = position.coords.latitude;
    var Lon = position.coords.longitude;

    // Actualizar la posición del marcador
    marker.setLatLng([Lat, Lon]);
    marker.bindPopup('Estás aquí')
    .openPopup();
    // Hacer que el mapa siga al marcador
    map.setView([Lat, Lon], 13);
}

// Comprobar si la geolocalización está disponible
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(updatePosition, function(error) {
        console.log('Error al obtener la ubicación: ', error);
    });
} else {
    alert('Geolocalización no soportada en este navegador');
}

