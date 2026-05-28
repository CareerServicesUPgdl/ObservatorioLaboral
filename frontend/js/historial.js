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
        } else {
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
let datosJunio2018 = [];
let datosDiciembre2018 = [];
let datosJunio2020 = [];
let datosDiciembre2020 = [];
let datosJunio2021 = [];
let datosDiciembre2021 = [];
let datosJunio2022 = [];
let datosDiciembre2022 = [];
let datosJunio2023 = [];
let datosDiciembre2023 = [];
let datosJunio2024 = [];
let datosDiciembre2024 = [];

let filtroActual = {
    carrera: "Todas las carreras",
    periodo: "Todos los periodos"
};

async function iniciarHistorial() {
    try {
        const response = await fetch(`${API_URL}/Junio2017Data`);
        const data = await response.json();
        datosJunio2017 = Array.isArray(data) ? data : [];

        const response2 = await fetch(`${API_URL}/Diciembre2017Data`);
        const data2 = await response2.json();
        datosDiciembre2017 = Array.isArray(data2) ? data2 : [];

        const response3 = await fetch(`${API_URL}/Junio2018Data`);
        const data3 = await response3.json();
        datosJunio2018 = Array.isArray(data3) ? data3 : [];

        const response4 = await fetch(`${API_URL}/Diciembre2018Data`);
        const data4 = await response4.json();
        datosDiciembre2018 = Array.isArray(data4) ? data4 : [];

        const response5 = await fetch(`${API_URL}/Junio2020Data`);
        const data5 = await response5.json();
        datosJunio2020 = Array.isArray(data5) ? data5 : [];

        const response6 = await fetch(`${API_URL}/Diciembre2020Data`);
        const data6 = await response6.json();
        datosDiciembre2020 = Array.isArray(data6) ? data6 : [];

        /*const response7 = await fetch(`${API_URL}/Junio2021Data`);
        const data7 = await response7.json();
        datosJunio2021 = Array.isArray(data7) ? data7 : [];

        const response8 = await fetch(`${API_URL}/Diciembre2021Data`);
        const data8 = await response8.json();
        datosDiciembre2021 = Array.isArray(data8) ? data8 : [];

        const response9 = await fetch(`${API_URL}/Junio2022Data`);
        const data9 = await response9.json();
        datosJunio2022 = Array.isArray(data9) ? data9 : [];

        const response10 = await fetch(`${API_URL}/Diciembre2022Data`);
        const data10 = await response10.json();
        datosDiciembre2022 = Array.isArray(data10) ? data10 : [];

        const response11 = await fetch(`${API_URL}/Junio2023Data`);
        const data11 = await response11.json();
        datosJunio2023 = Array.isArray(data11) ? data11 : [];

        const response12 = await fetch(`${API_URL}/Diciembre2023Data`);
        const data12 = await response12.json();
        datosDiciembre2023 = Array.isArray(data12) ? data12 : [];

        const response13 = await fetch(`${API_URL}/Junio2024Data`);
        const data13 = await response13.json();
        datosJunio2024 = Array.isArray(data13) ? data13 : [];

        const response14 = await fetch(`${API_URL}/Diciembre2024Data`);
        const data14 = await response14.json();
        datosDiciembre2024 = Array.isArray(data14) ? data14 : [];*/

        actualizarDropdowns();
        aplicarFiltros();

        console.log(datosJunio2020);
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

    aplicarFiltros();
    document.getElementById("dropdownOptionsCarrera").classList.remove("show-dropdown");
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

async function restablecerFiltros() {
    seleccionarCarrera("Todas las carreras");
    seleccionarPeriodo("Todos los periodos");
}

window.onclick = function (event) {
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

function actualizarDropdowns() {
    let datosAFiltrar = [];

    if (filtroActual.periodo === "Todos los periodos") {
        datosAFiltrar = [...datosJunio2017, ...datosDiciembre2017, ...datosJunio2018, ...datosDiciembre2018, ...datosJunio2020, ...datosDiciembre2020, ...datosJunio2021, ...datosDiciembre2021, ...datosJunio2022, ...datosDiciembre2022, ...datosJunio2023, ...datosDiciembre2023, ...datosJunio2024, ...datosDiciembre2024];
    } else if (filtroActual.periodo === "Junio 2017") {
        datosAFiltrar = datosJunio2017;
    } else if (filtroActual.periodo === "Diciembre 2017") {
        datosAFiltrar = datosDiciembre2017;
    } else if (filtroActual.periodo === "Junio 2018") {
        datosAFiltrar = datosJunio2018;
    } else if (filtroActual.periodo === "Diciembre 2018") {
        datosAFiltrar = datosDiciembre2018;
    } else if (filtroActual.periodo === "Junio 2020") {
        datosAFiltrar = datosJunio2020;
    } else if (filtroActual.periodo === "Diciembre 2020") {
        datosAFiltrar = datosDiciembre2020;
    } else if (filtroActual.periodo === "Junio 2021") {
        datosAFiltrar = datosJunio2021;
    } else if (filtroActual.periodo === "Diciembre 2021") {
        datosAFiltrar = datosDiciembre2021;
    } else if (filtroActual.periodo === "Junio 2022") {
        datosAFiltrar = datosJunio2022;
    } else if (filtroActual.periodo === "Diciembre 2022") {
        datosAFiltrar = datosDiciembre2022;
    } else if (filtroActual.periodo === "Junio 2023") {
        datosAFiltrar = datosJunio2023;
    } else if (filtroActual.periodo === "Diciembre 2023") {
        datosAFiltrar = datosDiciembre2023;
    } else if (filtroActual.periodo === "Junio 2024") {
        datosAFiltrar = datosJunio2024;
    } else if (filtroActual.periodo === "Diciembre 2024") {
        datosAFiltrar = datosDiciembre2024;
    }

    const alumnosFiltrados = datosAFiltrar.filter(alumno => {
        return filtroActual.carrera === "Todas las carreras" ||
            alumno.carrera.trim() === filtroActual.carrera.trim();
    });

    const carrerasDisponibles = [...new Set(alumnosFiltrados.map(a => a.carrera.trim()))]
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
    var todosLosDatos = [];

    if (filtroActual.periodo === "Todos los periodos") {
        todosLosDatos = [...datosJunio2017, ...datosDiciembre2017, ...datosJunio2018, ...datosDiciembre2018, ...datosJunio2020, ...datosDiciembre2020, ...datosJunio2021, ...datosDiciembre2021, ...datosJunio2022, ...datosDiciembre2022, ...datosJunio2023, ...datosDiciembre2023, ...datosJunio2024, ...datosDiciembre2024];
    } else if (filtroActual.periodo === "Junio 2017") {
        todosLosDatos = [...datosJunio2017];
    } else if (filtroActual.periodo === "Diciembre 2017") {
        todosLosDatos = [...datosDiciembre2017];
    } else if (filtroActual.periodo === "Junio 2018") {
        todosLosDatos = [...datosJunio2018];
    } else if (filtroActual.periodo === "Diciembre 2018") {
        todosLosDatos = [...datosDiciembre2018];
    } else if (filtroActual.periodo === "Junio 2020") {
        todosLosDatos = [...datosJunio2020];
    } else if (filtroActual.periodo === "Diciembre 2020") {
        todosLosDatos = [...datosDiciembre2020];
    } else if (filtroActual.periodo === "Junio 2021") {
        todosLosDatos = [...datosJunio2021];
    } else if (filtroActual.periodo === "Diciembre 2021") {
        todosLosDatos = [...datosDiciembre2021];
    } else if (filtroActual.periodo === "Junio 2022") {
        todosLosDatos = [...datosJunio2022];
    } else if (filtroActual.periodo === "Diciembre 2022") {
        todosLosDatos = [...datosDiciembre2022];
    } else if (filtroActual.periodo === "Junio 2023") {
        todosLosDatos = [...datosJunio2023];
    } else if (filtroActual.periodo === "Diciembre 2023") {
        todosLosDatos = [...datosDiciembre2023];
    } else if (filtroActual.periodo === "Junio 2024") {
        todosLosDatos = [...datosJunio2024];
    } else if (filtroActual.periodo === "Diciembre 2024") {
        todosLosDatos = [...datosDiciembre2024];
    }

    todosLosDatos.forEach(alumno => {
        const cumpleCarrera = filtroActual.carrera === "Todas las carreras" ||
            alumno.carrera.trim().toLowerCase() === filtroActual.carrera.trim().toLowerCase();

        const carrera = alumno.carrera.trim().toLowerCase();

        const trabaja1 = (alumno.trabaja1 || "").trim().toLowerCase();
        const trabaja2 = (alumno.trabaja2 || "").trim().toLowerCase();
        const trabaja3 = (alumno.trabaja3 || "").trim().toLowerCase();
        const trabaja4 = (alumno.trabaja4 || "").trim().toLowerCase();
        const trabaja5 = (alumno.trabaja5 || "").trim().toLowerCase();

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

            if (trabaja1 === "sí" || trabaja1 === "si" || trabaja1 ==="sí trabaja" || trabaja1 === "si trabaja") {

                datosGraficaTiempo[carrera].data[0]++;

            } else if ((trabaja1 !== "sí" && trabaja1 !== "si" && trabaja1 !== "sí trabaja" && trabaja1 !== "si trabaja") && (trabaja2 === "sí" || trabaja2 === "si" || trabaja2 === "sí trabaja" || trabaja2 === "si trabaja")) {

                datosGraficaTiempo[carrera].data[1]++;

            } else if ((trabaja3 === "sí" || trabaja3 === "si" || trabaja3 === "sí trabaja" || trabaja3 === "si trabaja") && (trabaja2 !== "sí" && trabaja2 !== "si" && trabaja2 !== "sí trabaja" && trabaja2 !== "si trabaja") && (trabaja1 !== "sí" && trabaja1 !== "si" && trabaja1 !== "sí trabaja" && trabaja1 !== "si trabaja")) {

                datosGraficaTiempo[carrera].data[2]++;

            } else if ((trabaja4 === "sí" || trabaja4 === "si" || trabaja4 === "sí trabaja" || trabaja4 === "si trabaja") && (trabaja3 !== "sí" && trabaja3 !== "si" && trabaja3 !== "sí trabaja" && trabaja3 !== "si trabaja") && (trabaja2 !== "sí" && trabaja2 !== "si" && trabaja2 !== "sí trabaja" && trabaja2 !== "si trabaja") && (trabaja1 !== "sí" && trabaja1 !== "si" && trabaja1 !== "sí trabaja" && trabaja1 !== "si trabaja")) {

                datosGraficaTiempo[carrera].data[3]++;

            } else if ((trabaja5 === "sí" || trabaja5 === "si" || trabaja5 === "sí	trabaja" || trabaja5 === "si trabaja") && (trabaja4 === "" || trabaja4 === "no") && (trabaja3 === "" || trabaja3 === "no") && (trabaja2 === "" || trabaja2 === "no") && (trabaja1 === "" || trabaja1 === "no")) {

                datosGraficaTiempo[carrera].data[4]++;

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
        '#b8e994', '#78e08f', '#38ada9', '#079992', '#60a3bc', '#3c6382', '#0a3d62', '#0c2461',
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