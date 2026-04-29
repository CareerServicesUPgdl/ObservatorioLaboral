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

function seleccionarCampus(nombre, valor) {
    document.getElementById("selected-campus").innerText = nombre;
    
    dropdownCampus();
    
    filtrarPorCampus(valor); 
}

function seleccionarFacultad(nombre, valor) {
    document.getElementById("selected-facultad").innerText = nombre;
    
    dropdownFacultad();
    
    filtrarPorFacultad(valor); 
}

function seleccionarCarrera(nombre, valor) {
    document.getElementById("selected-carrera").innerText = nombre;
    
    dropdownCarrera();
    
    filtrarPorCarrera(valor); 
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
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'top' },
                title: { display: true, text: 'Índice de empleabilidad' }
            }
        }
    });
}

async function filtrarPorCampus(campusSeleccionado){
    let empleados = 0;
    let noEmpleados = 0;

    try {
        const response = await fetch(`${API_URL}/qsData`);
        const data = await response.json();
        if(campusSeleccionado==="todos"){
            iniciarDashboard();
            return;
        }
        data.forEach(alumno => {
            if (alumno.campus.trim().toLowerCase()===campusSeleccionado.trim().toLowerCase()){
                if (alumno.trabaja && alumno.trabaja.trim().toLowerCase() === "sí") {
                    empleados++;
                } else {
                    noEmpleados++;
                }
            }
        });

        graficaEmpleabilidad(empleados, noEmpleados);
        
    } catch (error) {
        console.error("Error cargando el dashboard:", error);
    }
}





document.addEventListener('DOMContentLoaded', () => {
    iniciarDashboard();
});