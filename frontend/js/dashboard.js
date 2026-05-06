const token = localStorage.getItem("token");

var campus="";
var facultad="";
var carrera="";

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
    document.getElementById("nombre").innerText = data.usuario.nombre;
    document.getElementById("apellido").innerText = data.usuario.apellido;

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

function dropdownCampus() {
    document.getElementById("dropdownOptionsCampus").classList.toggle("show-dropdown");
}

function dropdownFacultad() {
    document.getElementById("dropdownOptionsFacultad").classList.toggle("show-dropdown");
}

function dropdownCarrera() {
    document.getElementById("dropdownOptionsCarrera").classList.toggle("show-dropdown");
}

function seleccionarCampus(valor) {
    filtroActual.campus = valor;
    document.getElementById('selected-campus').textContent = valor;
    
    filtroActual.facultad = "Todas las Facultades";
    document.getElementById('selected-facultad').textContent = "Todas las Facultades";
    filtroActual.carrera = "Todas las carreras";
    document.getElementById('selected-carrera').textContent = "Todas las carreras";

    actualizarDropdowns();
    aplicarFiltros();
    document.getElementById("dropdownOptionsCampus").classList.remove("show-dropdown");
}

function seleccionarFacultad(valor) {
    filtroActual.facultad = valor;
    document.getElementById('selected-facultad').textContent = valor;
    
    filtroActual.carrera = "Todas las carreras";
    document.getElementById('selected-carrera').textContent = "Todas las carreras";

    actualizarDropdowns();
    aplicarFiltros();
}

function seleccionarCarrera(valor) {
    filtroActual.carrera = valor;
    document.getElementById('selected-carrera').textContent = valor;
    dropdownCarrera();
    aplicarFiltros();
}

window.onclick = function(event) {
    if (!event.target.closest('.dropdown')) {
        const dropdown = document.getElementById("dropdownOptionsCampus");
        if (dropdown.classList.contains('show-dropdown')) {
            dropdown.classList.remove('show-dropdown');
        }
        const dropdownFacultad = document.getElementById("dropdownOptionsFacultad");
        if (dropdownFacultad.classList.contains('show-dropdown')) {
            dropdownFacultad.classList.remove('show-dropdown');
        }
        const dropdownCarrera = document.getElementById("dropdownOptionsCarrera");
        if (dropdownCarrera.classList.contains('show-dropdown')) {
            dropdownCarrera.classList.remove('show-dropdown');
        }
    }
}

let todosLosDatos = [];
let filtroActual = {
    campus: "Todos los campus",
    facultad: "Todas las Facultades",
    carrera: "Todas las carreras"
};

async function iniciarDashboard() {
    try {
        const response = await fetch(`${API_URL}/qsData`);
        todosLosDatos = await response.json();
        actualizarDropdowns();
        aplicarFiltros();
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

function aplicarFiltros() {
    let empleados = 0;
    let noEmpleados = 0;

    const tiemposEjeX = ["De 1ro a 3er semestre", "De 3ro a 5to semestre", "6to semestre", "7mo semestre", "8vo semestre", "9no semestre", "10mo semestre"];
    const categoriasSector = ["automotriz", "comercio", "consumo", "educación", "farmacéutica", "financiero", "retail", "servicios", "tecnología", "turismo", "otro"];
    
    let alumnosPorSector = new Array(categoriasSector.length).fill(0);
    const datosGraficaLineas = {};

    todosLosDatos.forEach(alumno => {
        const cumpleCampus = filtroActual.campus === "Todos los campus" || 
                             alumno.campus.trim().toLowerCase() === filtroActual.campus.trim().toLowerCase();
                             
        const cumpleFacultad = filtroActual.facultad === "Todas las Facultades" || 
                               alumno.facultad.trim().toLowerCase() === filtroActual.facultad.trim().toLowerCase();
                               
        const cumpleCarrera = filtroActual.carrera === "Todas las carreras" || 
                              alumno.carrera.trim().toLowerCase() === filtroActual.carrera.trim().toLowerCase();

        if (cumpleCampus && cumpleFacultad && cumpleCarrera) {
            const trabaja=alumno.trabaja && (alumno.trabaja.trim().toLowerCase() === "sí" || alumno.trabaja.trim().toLowerCase() === "si")
            if (trabaja) {
                //grafica empleabilidad
                empleados++;

                //grafica tiempo de colocacion
                const carrera = alumno.carrera;
                let tiempo = alumno.semestre.trim();

                if (!datosGraficaLineas[carrera]) {
                    datosGraficaLineas[carrera] = {
                        label: carrera,
                        data: new Array(tiemposEjeX.length).fill(0),
                        borderColor: obtenerColorCarrera(carrera),
                        backgroundColor: obtenerColorCarrera(carrera),
                        tension: 0.4,
                        fill: false
                    };
                }

                const categoriasEgresado = ["0-3 meses", "Más de 12 meses", "3-6 meses", "6-9 meses", "9-12 meses", "Antes de egresar"];
                
                if (categoriasEgresado.includes(tiempo)) {
                    tiempo = "10mo semestre"; 
                }

                const index = tiemposEjeX.indexOf(tiempo);
                if (index !== -1) {
                    datosGraficaLineas[carrera].data[index]++;
                }

                //grafica colocacion
                let sectorAlumno = alumno.sector.trim() ? alumno.sector.trim().toLowerCase() : "otro";

                console.log(sectorAlumno)

                let indexSector = categoriasSector.indexOf(sectorAlumno);

                console.log(indexSector);

                if (indexSector === -1) {
                    indexSector = 1; 
                }

                alumnosPorSector[indexSector]++;

            } else {
                noEmpleados++;
            }
        }
    });

    graficaEmpleabilidad(empleados, noEmpleados);
    graficaColocacion({
        etiquetas: tiemposEjeX,
        datasets: Object.values(datosGraficaLineas)
    });
    graficaSector({
        etiquetas: categoriasSector,
        datasets: [{
            label: 'Egresados',
            data: [...alumnosPorSector],
            backgroundColor: '#88803c'
        }]
    });
    console.log(alumnosPorSector)
}

function actualizarDropdowns() {
    const datosPorCampus = todosLosDatos.filter(alumno => {
        return filtroActual.campus === "Todos los campus" || 
               alumno.campus.trim() === filtroActual.campus.trim();
    });

    const facultadesDisponibles = [...new Set(datosPorCampus.map(a => a.facultad))].sort();
    const listaFacultades = document.getElementById('dropdownOptionsFacultad');
    
    listaFacultades.innerHTML = `<li onclick="seleccionarFacultad('Todas las Facultades')">Todas las Facultades</li>`;
    facultadesDisponibles.forEach(fac => {
        if(fac) {
            const li = document.createElement('li');
            li.textContent = fac;
            li.onclick = () => seleccionarFacultad(fac);
            listaFacultades.appendChild(li);
        }
    });

    const datosPorFacultad = datosPorCampus.filter(alumno => {
        return filtroActual.facultad === "Todas las Facultades" || 
               alumno.facultad.trim() === filtroActual.facultad.trim();
    });

    const carrerasDisponibles = [...new Set(datosPorFacultad.map(a => a.carrera))].sort();
    const listaCarreras = document.getElementById('dropdownOptionsCarrera');

    listaCarreras.innerHTML = `<li onclick="seleccionarCarrera('Todas las carreras')">Todas las carreras</li>`;
    carrerasDisponibles.forEach(car => {
        if(car) {
            const li = document.createElement('li');
            li.textContent = car;
            li.onclick = () => seleccionarCarrera(car);
            listaCarreras.appendChild(li);
        }
    });
}

async function restablecerFiltros() {
    seleccionarCampus("Todos los campus");
    seleccionarFacultad("Todas las Facultades");
    seleccionarCarrera("Todas las carreras");
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarDashboard();
});

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

function graficaEmpleabilidad(si, no) {
    const ctx = document.getElementById('empleabilidad').getContext('2d');

    if (window.chartEmpleo) {
        window.chartEmpleo.destroy();
    }

    window.chartEmpleo = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: ['Trabajan', 'No Trabajan'],
            datasets: [{
                label: 'Situación Laboral',
                data: [si, no],
                backgroundColor: ['#88803c', '#710800'],
                borderWidth: 1
            }]
        },
        plugins: [ChartDataLabels],
        options: {
            responsive: true,
            plugins: {
                legend: { 
                    position: 'top',
                    labels: { color: '#333', font: { size: 14 } }
                },
                title: { 
                    display: true, 
                    text: 'Índice de empleabilidad',
                    font: { size: 18},
                    color: '#000000' 
                },
                datalabels: {
                    color: '#fff',
                    font: {size: 12 },
                    display: (context) => context.dataset.data[context.dataIndex] > 0,
                    formatter: (value, ctx) => {
                        const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                        if (total === 0) return "0%"; // Evita división por cero
                        const percentage = ((value * 100) / total).toFixed(1) + "%";
                        return percentage;
                    }
                }
            }
        }
    });
}

function graficaColocacion(datosProcesados) {
    const canvas = document.getElementById('graficaColocacion');
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
                    position: 'right',
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

function graficaSector(datos) {
    const canvas = document.getElementById('graficaSector');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    if (window.chartSector) {
        window.chartSector.destroy();
    }

    window.chartSector = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: datos.etiquetas,
            datasets: datos.datasets
        },
        options: {
            indexAxis: 'y', 
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false 
                },
                title: {
                    display: true,
                    text: 'Sector Laboral en el que trebajan los estudiantes',
                    font: { size: 18, weight: 'bold' }
                },
                datalabels: {
                    anchor: 'end',
                    align: 'right',
                    formatter: Math.round,
                    font: { weight: 'bold' }
                }
            },
            scales: {
                x: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
                    title: {
                        display: true,
                        text: 'Número de Personas'
                    }
                },
                y: { 
                    ticks: {
                        color: '#333',
                        font: { size: 12 }
                    },
                    grid: { display: false }
                }
            }
        }
    });
}