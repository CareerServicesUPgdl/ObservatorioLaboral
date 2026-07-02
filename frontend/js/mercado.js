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

window.onclick = function (event) {
    if (!event.target.closest('.dropdown')) {
        const dropdown = document.getElementById("dropdownOptionsCarrera");
        if (dropdown.classList.contains('show-dropdown')) {
            dropdown.classList.remove('show-dropdown');
        }
    }
}

let filtroActual = {
    carrera: "Todas las carreras"
};

function dropdownCarrera() {
    document.getElementById("dropdownOptionsCarrera").classList.toggle("show-dropdown");
}

function seleccionarCarrera(valor) {
    filtroActual.carrera = valor;
    document.getElementById('selected-carrera').textContent = valor;

    aplicarFiltros();
    actualizarDropdowns();
    document.getElementById("dropdownOptionsCarrera").classList.remove("show-dropdown");
}

function actualizarDropdowns() {

    const carrerasDisponibles = [
        ...new Set(
            datosENOE
                .map(a => estandarizarCarrera(a.carrera))
                .filter(Boolean)
        )
    ].sort();

    const listaCarrera = document.getElementById('dropdownOptionsCarrera');

    listaCarrera.innerHTML =
        `<li onclick="seleccionarCarrera('Todas las carreras')">Todas las carreras</li>`;

    carrerasDisponibles.forEach(car => {
        const li = document.createElement('li');
        li.textContent = car;
        li.onclick = () => seleccionarCarrera(car);
        listaCarrera.appendChild(li);
    });
}

let datosENOE = [];

async function iniciarMercado() {
    const response = await fetch(`${API_URL}/enoeData`);
    const data = await response.json();
    datosENOE = Array.isArray(data) ? data : [];

    aplicarFiltros();
    actualizarDropdowns();
}

function estandarizarCarrera(codigo) {
    const mapaCarreras = {
        "11000": "Pedagogía",
        "11100": "Pedagogía",
        "11200": "Pedagogía",
        "11300": "Pedagogía",
        "11400": "Pedagogía",
        "11500": "Pedagogía",

        "21400": "Producción y Creación Audiovisual",

        "21500": "Administración y Mercadotecnia",

        "31100": "Psicología",

        "32100": "Publicidad y Relaciones Públicas",
        "41200": "Publicidad y Relaciones Públicas",

        "62100": "Comunicación y Opinion Pública",

        "33100": "Derecho",

        "41100": "Administración y Negocios Internacionales",

        "41300": "Administración y Finanzas",

        "41400": "Contaduría",

        "42000": "Administración y Dirección de Empresas Familiares",

        "42100": "Administración y Dirección",

        "42200": "Dirección de Negocios Gastronómicos",
        "101500": "Dirección de Negocios Gastronómicos",

        "42400": "Ingeniería Civil y Administración",
        "73200": "Ingeniería Civil y Administración",

        "61100": "Ingeniería en Sistemas y Gráficas Computacionales",
        "61300": "Ingeniería en Sistemas y Gráficas Computacionales",
        "62200": "Ingeniería en Sistemas y Gráficas Computacionales",

        "71000": "Ingeniería Mecatrónica",
        "71100": "Ingeniería Mecatrónica",
        "71300": "Ingeniería Mecatrónica",

        "71700": "Ingeniería Industrial e Innovación de Negocios",

        "73100": "Arquitectura",

        "101600": "Administración y Hospitalidad",

        "21600": "Ingeniería en Innovación y Diseño"
    };

    return mapaCarreras[String(codigo).trim()] || null;
}

document.addEventListener('DOMContentLoaded', () => {
    iniciarMercado();
    actualizarDropdowns();
});

function aplicarFiltros() {
    const ocupados = ["Ocupados", "Desocupados", "Disponibles", "No disponibles"];
    const posicion = ["Trabajadores", "Empleadores", "Cuenta propia", "Sin pago"];
    let subocupados = 0;
    let personasOcupadas = new Array(ocupados.length).fill(0);
    let personasPosiciones = new Array(posicion.length).fill(0)

    datosENOE.forEach(persona => {
        const carrera = filtroActual.carrera === "Todas las carreras" || estandarizarCarrera(persona.carrera) === filtroActual.carrera;

        if (carrera) {
            const indexOcupados = persona.trabaja - 1;
            const personasReales = persona.factor;
            personasOcupadas[indexOcupados] += personasReales;

            if (persona.subocupacion === 1) {
                subocupados += personasReales;
            }

            const indexPosicion = persona.posicion - 1;
            personasPosiciones[indexPosicion] += personasReales;
        }
    });

    document.getElementById("totalSubocupados").textContent = subocupados;

    graficaPie({
        etiquetas: ocupados,
        datasets: [{
            label: 'Profesionales',
            data: [...personasOcupadas],
            backgroundColor: [
                "#620000", // Vino oscuro
                "#8A1538", // Granate
                "#A63D40", // Vino claro
                "#B59A30"  // Dorado
            ]
        }],
        id: 'ocupados',
        title: 'Estado laboral de los profesionales',
        personas: 'Profesionales',
        nombre: 'chart-ocupacion'
    });

    graficaPie({
        etiquetas: posicion,
        datasets: [{
            label: 'Profesionales',
            data: [...personasPosiciones],
            backgroundColor: [
                "#620000", // Vino oscuro
                "#8A1538", // Granate
                "#A63D40", // Vino claro
                "#B59A30"  // Dorado
            ]
        }],
        id: 'posicion',
        title: 'Posición de los profesionales',
        personas: 'Profesionales',
        nombre: 'chart-posicion'
    });
}

function graficaPie(datos) {
    const nombre = datos.nombre;
    const canvas = document.getElementById(datos.id);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    Chart.register(ChartDataLabels);

    if (window[nombre]) {
        window[nombre].destroy();
    }

    window[nombre] = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: datos.etiquetas,
            datasets: [{
                data: datos.datasets[0].data,
                backgroundColor: datos.datasets[0].backgroundColor,
                borderColor: "#fff",
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right'
                },
                title: {
                    display: true,
                    text: datos.title,
                    font: {
                        size: 18,
                        weight: 'bold'
                    },
                    color: '#000'
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