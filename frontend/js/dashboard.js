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

async function iniciarDashboard() {
    let empleados = 0;
    let noEmpleados = 0;

    try {
        const response = await fetch(`${API_URL}/qsData`);
        const data = await response.json();

        data.forEach(alumno => {
            if (alumno.trabaja && alumno.trabaja.trim().toLowerCase() === "sí") {
                empleados++;
            } else {
                noEmpleados++;
            }
        });

        graficaEmpleabilidad(empleados, noEmpleados);
        
    } catch (error) {
        console.error("Error cargando el dashboard:", error);
    }
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

function seleccionarCampus(valor) {
    filtroActual.campus = valor;
    document.getElementById('selected-campus').textContent = valor;
    
    filtroActual.facultad = "Todas las Facultades";
    document.getElementById('selected-facultad').textContent = "Todas las Facultades";
    filtroActual.carrera = "Todas las carreras";
    document.getElementById('selected-carrera').textContent = "Todas las carreras";

    actualizarDropdowns();
    aplicarFiltros();
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

function aplicarFiltros() {
    let empleados = 0;
    let noEmpleados = 0;

    todosLosDatos.forEach(alumno => {
        const cumpleCampus = filtroActual.campus === "Todos los campus" || 
                             alumno.campus.trim().toLowerCase() === filtroActual.campus.trim().toLowerCase();
                             
        const cumpleFacultad = filtroActual.facultad === "Todas las Facultades" || 
                               alumno.facultad.trim().toLowerCase() === filtroActual.facultad.trim().toLowerCase();
                               
        const cumpleCarrera = filtroActual.carrera === "Todas las carreras" || 
                              alumno.carrera.trim().toLowerCase() === filtroActual.carrera.trim().toLowerCase();

        if (cumpleCampus && cumpleFacultad && cumpleCarrera) {
            if (alumno.trabaja && (alumno.trabaja.trim().toLowerCase() === "sí" || alumno.trabaja.trim().toLowerCase() === "si")) {
                empleados++;
            } else {
                noEmpleados++;
            }
        }
    });

    graficaEmpleabilidad(empleados, noEmpleados);
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