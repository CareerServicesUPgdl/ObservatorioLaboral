const token = localStorage.getItem("token");

let esAdmin = false;

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
            document.getElementById("nuevoPost").classList.remove("ocultar");
            esAdmin = true;
        } else {
            document.getElementById("administracion").classList.add("ocultar");
            document.getElementById("nuevoPost").classList.add("ocultar");
            esAdmin = false;
        }

        cargarArticulos();
    })
    .catch(error => {
        console.log("Error:", error.message);

        localStorage.removeItem("token");
        window.location.href = "../html/Login.html";
    });

function abrirModal() {
    document.getElementById("modalPost").classList.remove("ocultar");
}

function cerrarModal() {
    document.getElementById("modalPost").classList.add("ocultar");
}

async function publicarPost() {

    const titulo = document.getElementById("tituloPost").value;
    const descripcion = document.getElementById("descripcionPost").value;

    if (!titulo || !descripcion) {
        alert("Completa todos los campos");
        return;
    }

    const url = articuloEditando
        ? `${API_URL}/articulos/${articuloEditando}`
        : `${API_URL}/articulos`;

    const metodo = articuloEditando ? "PUT" : "POST";

    try {

        const respuesta = await fetch(url, {
            method: metodo,
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                titulo,
                descripcion
            })
        });

        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.mensaje);
            return;
        }

        alert(
            articuloEditando
                ? "Artículo actualizado"
                : "Artículo publicado"
        );

        document.getElementById("tituloPost").value = "";
        document.getElementById("descripcionPost").value = "";

        articuloEditando = null;

        document.querySelector(".btn-publicar").textContent = "Publicar";

        cerrarModal();

        cargarArticulos();

    } catch (error) {
        console.error(error);
        alert("Error al guardar el artículo");
    }
}

async function cargarArticulos() {
    try {
        const respuesta = await fetch(`${API_URL}/articulos`);

        const articulos = await respuesta.json();

        const lista = document.getElementById("listaArticulos");

        lista.innerHTML = "";

        articulos.forEach(articulo => {

            let botones = "";

            if (esAdmin) {
                botones = `
                <div class="box">
                    <div class="acciones-articulo">
                        <button onclick="editarArticulo('${articulo._id}')" class="btn-edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-pen" viewBox="0 0 16 16">
                            <path d="m13.498.795.149-.149a1.207 1.207 0 1 1 1.707 1.708l-.149.148a1.5 1.5 0 0 1-.059 2.059L4.854 14.854a.5.5 0 0 1-.233.131l-4 1a.5.5 0 0 1-.606-.606l1-4a.5.5 0 0 1 .131-.232l9.642-9.642a.5.5 0 0 0-.642.056L6.854 4.854a.5.5 0 1 1-.708-.708L9.44.854A1.5 1.5 0 0 1 11.5.796a1.5 1.5 0 0 1 1.998-.001m-.644.766a.5.5 0 0 0-.707 0L1.95 11.756l-.764 3.057 3.057-.764L14.44 3.854a.5.5 0 0 0 0-.708z"/>
                            </svg>
                        </button>

                        <button onclick="borrarArticulo('${articulo._id}')" class="btn-edit">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-trash3 delete" viewBox="0 0 16 16">
                            <path d="M6.5 1h3a.5.5 0 0 1 .5.5v1H6v-1a.5.5 0 0 1 .5-.5M11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3A1.5 1.5 0 0 0 5 1.5v1H1.5a.5.5 0 0 0 0 1h.538l.853 10.66A2 2 0 0 0 4.885 16h6.23a2 2 0 0 0 1.994-1.84l.853-10.66h.538a.5.5 0 0 0 0-1zm1.958 1-.846 10.58a1 1 0 0 1-.997.92h-6.23a1 1 0 0 1-.997-.92L3.042 3.5zm-7.487 1a.5.5 0 0 1 .528.47l.5 8.5a.5.5 0 0 1-.998.06L5 5.03a.5.5 0 0 1 .47-.53Zm5.058 0a.5.5 0 0 1 .47.53l-.5 8.5a.5.5 0 1 1-.998-.06l.5-8.5a.5.5 0 0 1 .528-.47M8 4.5a.5.5 0 0 1 .5.5v8.5a.5.5 0 0 1-1 0V5a.5.5 0 0 1 .5-.5"/>
                            </svg>
                        </button>
                    </div>
                </div>
                `;1
            }

            const post = document.createElement("article");

            post.classList.add("tarjeta-articulo");

            post.innerHTML = `
                <div class="contenido-articulo">
                    <h2>${articulo.titulo}</h2>

                    <p>${articulo.descripcion}</p>

                    <span class="fecha-articulo">
                        ${new Date(articulo.fecha).toLocaleDateString()}
                    </span>

                    ${botones}
                </div>
            `;

            lista.appendChild(post);
        });

    } catch (error) {
        console.error("Error cargando artículos:", error);
    }
}

async function borrarArticulo(id) {

    const confirmar = confirm("¿Quieres borrar este artículo?");

    if (!confirmar) {
        return;
    }

    try {
        const respuesta = await fetch(
            `${API_URL}/articulos/${id}`,
            {
                method: "DELETE"
            }
        );

        const data = await respuesta.json();

        if (!respuesta.ok) {
            alert(data.mensaje);
            return;
        }

        alert("Artículo eliminado");

        cargarArticulos();

    } catch (error) {
        console.error(error);
        alert("Error al eliminar el artículo");
    }
}

let articuloEditando = null;

async function editarArticulo(id) {

    try {
        const respuesta = await fetch(
            `${API_URL}/articulos`
        );

        const articulos = await respuesta.json();

        const articulo = articulos.find(a => a._id === id);

        if (!articulo) {
            alert("Artículo no encontrado");
            return;
        }

        articuloEditando = id;

        document.getElementById("tituloPost").value = articulo.titulo;
        document.getElementById("descripcionPost").value = articulo.descripcion;

        document.querySelector(".btn-publicar").textContent = "Guardar cambios";

        abrirModal();

    } catch (error) {
        console.error(error);
    }
}