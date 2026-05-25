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

            if (alumno.trabaja1.trim().toLowerCase() === "Sí") {
                const carrera = alumno.carrera;

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

                datosGraficaTiempo[carrera].data[0]++;

            } else if (alumno.trabaja1.trim().toLowerCase() !== "Sí" && alumno.trabaja2.trim().toLowerCase() === "Sí") {

                datosGraficaTiempo[alumno.carrera].data[1]++;

            } else if (alumno.trabaja3.trim().toLowerCase() === "Sí" && alumno.trabaja2.trim().toLowerCase() !== "Sí" && alumno.trabaja1.trim().toLowerCase() !== "Sí") {

                datosGraficaTiempo[alumno.carrera].data[2]++;

            }
        }
    });
    graficaColocacion({
        etiquetas: tiempos,
        datasets: Object.values(datosGraficaTiempo)
    });
}

import { obtenerColorCarrera } from "./dashboard.js";
function graficaColocacion(datosProcesados) {
    const canvas = document.getElementById('timepoColocacion');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (window.chartColocacion) {
        window.chartColocacion.destroy();
    }

    window.chartColocacion = new Chart(ctx, {
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

document.addEventListener('DOMContentLoaded', () => {
    iniciarHistorial();
});