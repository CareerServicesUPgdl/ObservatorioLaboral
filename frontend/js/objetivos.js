const token = localStorage.getItem("token");
import { graficaEmpleabilidad, graficaIniciativas, graficaPie } from './graficas.js';
let todosLosDatos = [];
let datosFiltrados = [];
let iniciativas2526 = [];
let iniciativas2627 = [];
let iniciativasFiltradas = [];
let satisfaccion2526 = [];
let satisfaccionFiltrada = [];

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

function seleccionarPeriodo(valor) {
    filtroActual = valor;
    filtro();
    document.getElementById('selected-periodo').textContent = valor;
    document.getElementById("dropdownOptionsPeriodos").classList.remove('show-dropdown');
}

window.onclick = function (event) {
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
        const inicativasRes = await fetch(`${API_URL}/iniciativas25_26`);
        iniciativas2526 = await inicativasRes.json();
        const inicativasRes2 = await fetch(`${API_URL}/iniciativas26_27`);
        iniciativas2627 = await inicativasRes2.json();
        const satisfaccion25_26 = await fetch(`${API_URL}/satisfaccion25_26`);
        satisfaccion2526 = await satisfaccion25_26.json();

        seleccionarPeriodo(filtroActual);
    } catch (error) {
        console.error("Error al obtener datos:", error);
    }
}


function filtro() {
    if (filtroActual === "2025-2026") {
        satisfaccionFiltrada = satisfaccion2526;
        iniciativasFiltradas = iniciativas2526;
        datosFiltrados = todosLosDatos.filter(dato => (dato.egreso === "Diciembre 2025" || dato.egreso === "Junio 2026") && dato.campus === "Guadalajara");
    }else if (filtroActual === "2026-2027") {
        satisfaccionFiltrada = [0];
        iniciativasFiltradas = iniciativas2627;
        datosFiltrados = todosLosDatos.filter(dato => (dato.egreso === "Diciembre 2026" || dato.egreso === "Junio 2027") && dato.campus === "Guadalajara");
    }
    iniciativas();
    emplebilidad();
    satisfaccion();
}

function emplebilidad() {
    let si = datosFiltrados.filter(dato => (dato.trabaja === "Sí" || dato.trabaja === "Si")).length;
    let no = datosFiltrados.filter(dato => dato.trabaja === "No").length;
    graficaEmpleabilidad(si, no);

    let total = si + no;
    let porcentaje = (total / total) * 100;
    if (isNaN(porcentaje)) {
        porcentaje = 0;
    }
    document.getElementById("porcentajeQS").textContent = porcentaje.toFixed(2) + "%";
    document.getElementById("respuesta-graduados").textContent = total + "/" + total;
}

function iniciativas() {
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const iniciativas = [
        ...new Set(
            iniciativasFiltradas.map(iniciativa => iniciativa.iniciativa)
        )
    ];
    let conteoMes = Array(meses.length).fill(0);
    let conteoIniciativas = Array(iniciativas.length).fill(0);

    for (let i = 0; i < iniciativasFiltradas.length; i++) {
        for (let j = 0; j < meses.length; j++) {
            if (iniciativasFiltradas[i].mes === meses[j]) {
                conteoMes[j]++;
            }
        }
        for (let j = 0; j < iniciativas.length; j++) {
            if (iniciativasFiltradas[i].iniciativa === iniciativas[j]) {
                conteoIniciativas[j]++;
            }
        }
    }

    document.getElementById("total-iniciativas").textContent = iniciativasFiltradas.length;

    graficaIniciativas({
        id: 'graficaIniciativasMes',
        title: 'Iniciativas por mes',
        axis: 'x',
        etiquetas: meses,
        datasets: [{
            label: 'Iniciativas por mes',
            data: [...conteoMes],
            backgroundColor: '#88803c'
        }]
    })
    graficaIniciativas({
        id: 'graficaIniciativas',
        title: 'Iniciativas por categoria',
        axis: 'y',
        etiquetas: iniciativas,
        datasets: [{
            label: 'Iniciativas por categoria',
            data: [...conteoIniciativas],
            backgroundColor: '#88803c'
        }]
    })
}

function satisfaccion(){
    const satisfaccion = [
        ...new Set(
            satisfaccionFiltrada.map(satisfaccion => satisfaccion.satisfaccion)
        )
    ];
    let conteo = Array(satisfaccion.length).fill(0);

    for(let i=0; i < satisfaccionFiltrada.length; i++){
        for(let j=0; j < satisfaccion.length; j++){
            if(satisfaccionFiltrada[i].satisfaccion === satisfaccion[j]){
                conteo[j]++;
            }
        }
    }

    let porsentajeSatisfaccion = 0;
    let total=0;
    for(let i=0; i < satisfaccion.length; i++){
        total += conteo[i];
        if(satisfaccion[i] === "Totalmente satisfecho" || satisfaccion[i] === "Muy satisfecho"){
            porsentajeSatisfaccion += conteo[i];
        }
    }
    
    document.getElementById("satisfaccion-total").textContent = porsentajeSatisfaccion + "/" + total;
    document.getElementById("satisfaccion-porcentaje").textContent = ((porsentajeSatisfaccion/total) * 100).toFixed(2) + "%";

    graficaPie({
            etiquetas: satisfaccion,
            datasets: [{
                label: 'satisfaccion',
                data: [...conteo],
                backgroundColor: [
                    "#620000", // Vino oscuro
                    "#A63D40", // Vino claro
                    "#B59A30",  // Dorado
                    "#8A1538", // Granate
                ]
            }],
            id: 'satisfaccion',
            title: 'Nivel de satisfacción con el servicio de Career Services',
            personas: 'empresas',
            nombre: 'chart-satisfaccion'
        });
}

window.dropdownPeriodo = dropdownPeriodo;
window.seleccionarPeriodo = seleccionarPeriodo;