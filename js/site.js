// JS común de MiProfesor: una función por cosa; cada una sale temprano si su elemento no está en la página

function mostrarMensaje(mensaje, texto) {
    mensaje.innerHTML = texto;
    mensaje.style.display = "block";
}

function mostrarSnackbar() {
    const snackbar = document.querySelector(".snackbar");
    snackbar.hidden = false;
    setTimeout(() => snackbar.hidden = true, 4000);
}

// Frena el envío si falta un campo obligatorio y nombra cuál (los formularios llevan novalidate)
function validarFormulario(formulario) {
    const mensaje = formulario.querySelector(".mensajeError");
    const campo = formulario.querySelector(":invalid");
    if (campo !== null) {
        const nombre = campo.closest("label").textContent.trim();
        if (campo.type === "checkbox") {
            mostrarMensaje(mensaje, "Tenés que aceptar: " + nombre + ".");
        } else if (campo.value === "") {
            mostrarMensaje(mensaje, "Completá el campo " + nombre + ".");
        } else {
            mostrarMensaje(mensaje, "Revisá el campo " + nombre + ".");
        }
        campo.focus();
        return false;
    }
    mensaje.style.display = "none";
    return true;
}

// Registrarse e Iniciar sesión: si está todo, sigue al Panel (el action del formulario)
function inicializarFormulariosAcceso() {
    document.querySelectorAll("#formularioRegistro, #formularioIngreso").forEach(formulario => {
        formulario.addEventListener("submit", evento => {
            if (!validarFormulario(formulario)) evento.preventDefault();
        });
    });
}

// Desde "Registrarme como profe" se llega con #profesor
function marcarRolDesdeEnlace() {
    const profesor = document.querySelector('.rol input[value="profesor"]');
    if (profesor === null || location.hash !== "#profesor") return;
    profesor.checked = true;
}

// shortcut: sin backend la consulta no se envía, solo se muestra el aviso; conectar a ConsultasController
function inicializarFormularioConsulta() {
    const formulario = document.getElementById("formularioConsulta");
    if (formulario === null) return;
    const aviso = formulario.querySelector(".aviso");
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        if (!validarFormulario(formulario)) return;
        formulario.reset();
        aviso.hidden = false;
    });
    aviso.querySelector("button").addEventListener("click", () => aviso.hidden = true);
}

// Soporte: filtra las preguntas por tema; el tema elegido queda en tinta
function inicializarFiltrosPreguntas() {
    const botones = document.querySelectorAll(".preguntas [data-tema]:is(button)");
    botones.forEach(boton => boton.addEventListener("click", () => {
        botones.forEach(otro => otro.setAttribute("aria-pressed", otro === boton));
        document.querySelectorAll(".preguntas details").forEach(pregunta => {
            pregunta.hidden = boton.dataset.tema !== "todas" && pregunta.dataset.tema !== boton.dataset.tema;
        });
    }));
}

// Catálogo: muestra el precio elegido y deja quitar los filtros activos
function inicializarFiltrosCatalogo() {
    const precio = document.getElementById("precio");
    if (precio === null) return;
    precio.addEventListener("input", () => {
        document.getElementById("precioElegido").textContent = "hasta $ " + Number(precio.value).toLocaleString("es-AR");
    });
    document.querySelectorAll(".filtrosActivos .badge").forEach(filtro => filtro.addEventListener("click", () => filtro.remove()));
}

// Diálogo "Pedir clase": lo abre cualquier botón con data-pedir="Nombre del profesor"
function inicializarDialogoPedirClase() {
    const dialogo = document.getElementById("dialogoPedirClase");
    if (dialogo === null) return;
    const enviar = dialogo.querySelector('[value="enviar"]');
    const horas = dialogo.querySelector(".horas");
    const elegirDia = dialogo.querySelector("[data-elegir-dia]");
    const elegir = (grupo, boton) => grupo.forEach(otro => otro.setAttribute("aria-pressed", otro === boton));

    document.querySelectorAll("[data-pedir]").forEach(boton => boton.addEventListener("click", () => {
        dialogo.querySelectorAll("[data-profe]").forEach(nombre => nombre.textContent = boton.dataset.pedir);
        dialogo.querySelector("form").reset();
        dialogo.querySelectorAll("[aria-pressed]").forEach(opcion => opcion.setAttribute("aria-pressed", false));
        horas.hidden = true;
        elegirDia.hidden = false;
        enviar.disabled = true;
        dialogo.showModal();
    }));

    const dias = dialogo.querySelectorAll(".dias button");
    dias.forEach(dia => dia.addEventListener("click", () => {
        elegir(dias, dia);
        horas.hidden = false;
        elegirDia.hidden = true;
    }));

    const botonesHora = horas.querySelectorAll("button");
    botonesHora.forEach(hora => hora.addEventListener("click", () => {
        elegir(botonesHora, hora);
        enviar.disabled = false;
    }));

    dialogo.querySelectorAll("[data-cerrar]").forEach(boton => boton.addEventListener("click", () => dialogo.close()));
    dialogo.addEventListener("close", () => {
        if (dialogo.returnValue === "enviar") mostrarSnackbar();
        dialogo.returnValue = "";
    });
}

// Perfil: copiar el enlace del perfil público y "avisarme"
function inicializarAccionesPerfil() {
    document.querySelectorAll("[data-copiar-enlace]").forEach(boton => boton.addEventListener("click", () => {
        navigator.clipboard?.writeText(new URL("perfil.html", location.href).href);
        boton.setAttribute("title", "Enlace copiado");
        if (!boton.classList.contains("botonIcono")) boton.textContent = "Enlace copiado";
    }));
    document.querySelectorAll(".perfil [aria-pressed]").forEach(boton => boton.addEventListener("click", () => {
        boton.setAttribute("aria-pressed", boton.getAttribute("aria-pressed") !== "true");
    }));
}

// Panel: pestañas, que también se abren con #mis-clases, #chat o #historial en la URL
function inicializarPestanasPanel() {
    const pestanas = document.querySelectorAll('.panel [role="tab"]');
    if (pestanas.length === 0) return;
    const abrir = id => pestanas.forEach(pestana => {
        const elegida = pestana.getAttribute("aria-controls") === id;
        pestana.setAttribute("aria-selected", elegida);
        document.getElementById(pestana.getAttribute("aria-controls")).hidden = !elegida;
    });
    pestanas.forEach(pestana => pestana.addEventListener("click", () => abrir(pestana.getAttribute("aria-controls"))));
    document.querySelectorAll("[data-abrir]").forEach(enlace => enlace.addEventListener("click", () => abrir(enlace.dataset.abrir)));
    const inicial = location.hash.slice(1);
    if (["mis-clases", "chat", "historial"].includes(inicial)) abrir(inicial);
}

// Panel: los avisos que se resuelven salen de la lista
function inicializarNotificaciones() {
    document.querySelectorAll("[data-resolver]").forEach(boton => boton.addEventListener("click", () => boton.closest("li").remove()));
}

// Panel: elegir una conversación y escribir
function inicializarChat() {
    const chat = document.getElementById("chat");
    if (chat === null) return;
    const contactos = chat.querySelectorAll("[data-foto]");
    const cabeza = chat.querySelector(".card:last-child > div");
    const mensajes = chat.querySelector(".card:last-child ul");
    const formulario = chat.querySelector("form");
    contactos.forEach(contacto => contacto.addEventListener("click", () => {
        contactos.forEach(otro => otro.setAttribute("aria-pressed", otro === contacto));
        cabeza.querySelector("img").src = contacto.dataset.foto;
        cabeza.querySelector("b").textContent = contacto.textContent;
        cabeza.querySelector("p").textContent = "Todavía no hay mensajes. Escribí el primero.";
        mensajes.replaceChildren();
        formulario.hidden = false;
        formulario.querySelector("input").focus();
    }));
    formulario.addEventListener("submit", evento => {
        evento.preventDefault();
        const texto = formulario.querySelector("input").value.trim();
        if (texto === "") return;
        const burbuja = document.createElement("li");
        burbuja.className = "burbuja";
        burbuja.textContent = texto;
        mensajes.append(burbuja);
        formulario.reset();
    });
}

function inicializarSitio() {
    inicializarFormulariosAcceso();
    marcarRolDesdeEnlace();
    inicializarFormularioConsulta();
    inicializarFiltrosPreguntas();
    inicializarFiltrosCatalogo();
    inicializarDialogoPedirClase();
    inicializarAccionesPerfil();
    inicializarPestanasPanel();
    inicializarNotificaciones();
    inicializarChat();
}

inicializarSitio();
