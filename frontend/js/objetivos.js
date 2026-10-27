const token = localStorage.getItem("token");
let todosLosDatos = [];

if (!token) {
    window.location.href = "../html/Login.html";
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "../html/Login.html";
}

//mostrar datos del usuario
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
        if (data.usuario.cuenta !== "Admin") {
            window.location.href = "../html/Dashboard.html";
        }
        document.getElementById("nombreUsuario").innerText = data.usuario.email;
        document.getElementById("cuenta").innerText = data.usuario.cuenta;
    })
    .catch(error => {
        console.log("Error:", error.message);

        localStorage.removeItem("token");
        window.location.href = "../html/Login.html";
    });

function dropdownPeriodo() {
    document.getElementById("dropdownOptionsPeriodos").classList.toggle("show-dropdown");
}

let filtroActual = "2025-2026";
seleccionarPeriodo(filtroActual);

function seleccionarPeriodo(valor) {
    filtroActual = valor;
    emplebilidad();
    document.getElementById('selected-periodo').textContent = valor;
    document.getElementById("dropdownOptionsPeriodos").classList.remove('show-dropdown');
}

window.onclick = function(event) {
    if (!event.target.closest('.dropdown')) {
        const dropdown = document.getElementById("dropdownOptionsPeriodos");
        if (dropdown.classList.contains('show-dropdown')) {
            dropdown.classList.remove('show-dropdown');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    iniciar();
});

async function iniciar() {
    try {
        const response = await fetch(`${API_URL}/qsData`);
        todosLosDatos = await response.json();  
        emplebilidad();
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}

import { graficaEmpleabilidad } from './graficas.js';
function emplebilidad(){
    let si =0;
    let no =0;
    if (filtroActual === "2025-2026") {
        si = todosLosDatos.filter(dato => (dato.trabaja === "Sí" || dato.trabaja === "Si") && (dato.egreso === "Diciembre 2025" || dato.egreso === "Junio 2026") && dato.campus==="Guadalajara").length;
        no = todosLosDatos.filter(dato => dato.trabaja === "No" && (dato.egreso === "Diciembre 2025" || dato.egreso === "Junio 2026") && dato.campus==="Guadalajara").length;
    }
    graficaEmpleabilidad(si, no);
    let total = si + no;
    let porcentaje = (total/total)*100;
    if (isNaN(porcentaje)) {
        porcentaje = 0;
    }
    document.getElementById("porcentajeQS").textContent = porcentaje.toFixed(2)+"%";
    document.getElementById("respuesta-graduados").textContent = total+"/"+total;
}

window.dropdownPeriodo = dropdownPeriodo;
window.seleccionarPeriodo = seleccionarPeriodo;