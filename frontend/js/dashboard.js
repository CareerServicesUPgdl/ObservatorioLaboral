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