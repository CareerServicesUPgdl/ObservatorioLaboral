const token = localStorage.getItem("token");

if (!token) {
    window.location.href = "../html/Login.html";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "../html/Login.html";
}

fetch(`${API_URL}/perfil`, {
    headers: {
        "Authorization": token
    }
})
.then(async res => {
    const data = await res.json();

    if (!res.ok) {
        throw new Error(data.error || "Error de autenticación");
    }

    return data;
})
.then(data => {
    document.getElementById("nombreUsuario").innerText = data.usuario.email;
    document.getElementById("cuenta").innerText = data.usuario.cuenta;

    if (data.usuario.cuenta === "Admin") {
        document.getElementById("administracion").classList.remove("ocultar");
    }else{
        document.getElementById("administracion").classList.add("ocultar");
    }
})
.catch(error => {
    console.log("Error:", error.message);

    localStorage.removeItem("token");
    window.location.href = "../html/Login.html";
});

let datosJunio2017 = [];
let datosDiciembre2017 = [];
let filtroActual = {
    carrera: "Todas las carreras",
    periodo: "Todos los periodos"
};

async function iniciarHistorial() {
    try {
        const response = await fetch(`${API_URL}/Junio2017Data`);
        datosJunio2017 = await response.json();
        const response2 = await fetch(`${API_URL}/Diciembre2017Data`);
        datosDiciembre2017 = await response2.json();
        actualizarDropdowns();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function dropdownCarrera() {
    document.getElementById("dropdownOptionsCarrera").classList.toggle("show-dropdown");
}

function dropdownPeriodo() {
    document.getElementById("dropdownOptionsPeriodo").classList.toggle("show-dropdown");
}

function seleccionarCarrera(valor) {
    filtroActual.carrera = valor;
    document.getElementById('selected-carrera').textContent = valor;

    actualizarDropdowns();
    aplicarFiltros();
}

window.onclick = function(event) {
    if (!event.target.closest('.dropdown')) {
        const dropdown = document.getElementById("dropdownOptionsCarrera");
        if (dropdown.classList.contains('show-dropdown')) {
            dropdown.classList.remove('show-dropdown');
        }
        const dropdownPeriodo = document.getElementById("dropdownOptionsPeriodo");
        if (dropdownPeriodo.classList.contains('show-dropdown')) {
            dropdownPeriodo.classList.remove('show-dropdown');
        }
    }
}

async function restablecerFiltros() {
    seleccionarCarrera("Todas las carreras");
    seleccionarPeriodo("Todos los periodos");
}

function seleccionarPeriodo(valor) {
    filtroActual.periodo = valor;
    document.getElementById('selected-periodo').textContent = valor;
    filtroActual.carrera = "Todas las carreras";
    document.getElementById('selected-carrera').textContent = "Todas las carreras";

    actualizarDropdowns();
    aplicarFiltros();
    document.getElementById("dropdownOptionsPeriodo").classList.remove("show-dropdown");
}

function actualizarDropdowns() {
    let datosAFiltrar = [];

    if (filtroActual.periodo === "Todos los periodos") {
        datosAFiltrar = [...datosJunio2017, ...datosDiciembre2017];
    } else if (filtroActual.periodo === "Junio 2017") {
        datosAFiltrar = datosJunio2017;
    } else if (filtroActual.periodo === "Diciembre 2017") {
        datosAFiltrar = datosDiciembre2017;
    }

    const alumnosFiltrados = datosAFiltrar.filter(alumno => {
        return filtroActual.carrera === "Todas las carreras" || 
               alumno.carrera.trim() === filtroActual.carrera.trim();
    });

    const carrerasDisponibles = [...new Set(alumnosFiltrados.map(a => a.carrera))]
        .filter(Boolean)
        .sort();

    const listaCarreras = document.getElementById('dropdownOptionsCarrera');

    listaCarreras.innerHTML = `<li onclick="seleccionarCarrera('Todas las carreras')">Todas las carreras</li>`;
    
    carrerasDisponibles.forEach(car => {
        const li = document.createElement('li');
        li.textContent = car;
        li.onclick = () => seleccionarCarrera(car);
        listaCarreras.appendChild(li);
    });
}

function aplicarFiltros() {
    const tiempos = ["Antes de Egresar", "0-3 meses", "3-6 meses", "6-9 meses", "9-12 meses"];
    
    const datosGraficaTiempo = {};

    if(filtroActual.periodo === "Todos los periodos") {
        var todosLosDatos = [...datosJunio2017, ...datosDiciembre2017];
    }else if(filtroActual.periodo === "Junio 2017") {
        var todosLosDatos = [...datosJunio2017];
    }else if(filtroActual.periodo === "Diciembre 2017") {
        var todosLosDatos = [...datosDiciembre2017];
    }

    todosLosDatos.forEach(alumno => {
        const cumpleCarrera = filtroActual.carrera === "Todas las carreras" || 
                              alumno.carrera.trim().toLowerCase() === filtroActual.carrera.trim().toLowerCase();

        const carrera = alumno.carrera.trim().toLowerCase();

        const trabaja1 = (alumno.trabaja1 || "").trim().toLowerCase();
        const trabaja2 = (alumno.trabaja2 || "").trim().toLowerCase();
        const trabaja3 = (alumno.trabaja3 || "").trim().toLowerCase();

        if (cumpleCarrera) {
            if (!datosGraficaTiempo[carrera]) {
                datosGraficaTiempo[carrera] = {
                    label: carrera,
                    data: new Array(tiempos.length).fill(0),
                    borderColor: obtenerColorCarrera(carrera),
                    backgroundColor: obtenerColorCarrera(carrera),
                    tension: 0.4,
                    fill: false
                };
            }

            if (trabaja1 === "sí" || trabaja1 === "si") {

                datosGraficaTiempo[carrera].data[0]++;

            } else if ((trabaja1 !== "sí" && trabaja1 !== "si") && (trabaja2 === "sí" || trabaja2 === "si")) {

                datosGraficaTiempo[carrera].data[1]++;

            } else if ((trabaja3 === "sí" || trabaja3 === "si") && (trabaja2 !== "sí" && trabaja2 !== "si") && (trabaja1 !== "sí" && trabaja1 !== "si")) {

                datosGraficaTiempo[carrera].data[2]++;

            }
        }
    });
    graficaColocacion({
        etiquetas: tiempos,
        datasets: Object.values(datosGraficaTiempo)
    });
}

function graficaColocacion(datosProcesados) {
    const canvas = document.getElementById('tiempoColocacion');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (window.chartTiempo) {
        window.chartTiempo.destroy();
    }

    window.chartTiempo = new Chart(ctx, {
        type: 'line',
        data: {
            labels: datosProcesados.etiquetas,
            datasets: datosProcesados.datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, 
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        boxWidth: 12,
                        padding: 15,
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Tiempo de Colocación por Carrera',
                    color: '#000',
                    font: { size: 18, weight: 'bold' },
                    padding: { bottom: 20 }
                },
                datalabels: {
                    display: false 
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1,
                        color: '#666'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    },
                    title: {
                        display: true,
                        text: 'Cantidad de Egresados '
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#666'
                    }
                }
            },
            interaction: {
                mode: 'index',
                intersect: false
            }
        }
    });
}

function obtenerColorCarrera(carrera) {
    const coloresUP = [
        '#88803c', '#710800', '#b3a670', '#4d0500', '#2c3e50', '#a6a6a6', '#d4af37', '#5e0b00',
        '#1abc9c', '#16a085', '#2ecc71', '#27ae60', '#3498db', '#2980b9', '#34495e', '#21618c',
        '#0e6251', '#1d8348', '#2874a6', '#154360', '#76d7c4', '#7dcea0', '#85c1e9', '#5499c7',
        '#e67e22', '#d35400', '#e74c3c', '#c0392b', '#f1c40f', '#f39c12', '#a04000', '#ba4a00',
        '#9b59b6', '#8e44ad', '#6c3483', '#4a235a', '#fd79a8', '#e84393', '#d63031', '#6d214f',
        '#b8e994', '#78e08f', '#38ada9', '#079992', '#60a3bc', '#3c6382', '#0a3d62', '#0c2461'
    ];

    let hash = 0;
    for (let i = 0; i < carrera.length; i++) {
        hash = carrera.charCodeAt(i) + ((hash << 5) - hash);
    }
    return coloresUP[Math.abs(hash) % coloresUP.length];
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarHistorial();
});