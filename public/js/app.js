// =======================
// STORAGE GLOBAL
// =======================

let adminLog = localStorage.getItem("adminLog") === "true";

// =======================
// DATOS EN LOCALSTORAGE
// =======================

// Inicializar datos si no existen
function inicializarDatos() {
    if (!localStorage.getItem("alumnos")) {
        localStorage.setItem("alumnos", JSON.stringify([]));
    }
    if (!localStorage.getItem("turnos")) {
        localStorage.setItem("turnos", JSON.stringify([]));
    }
    if (!localStorage.getItem("configuracion")) {
        localStorage.setItem("configuracion", JSON.stringify({
            diasHabiles: [2, 3, 4],
            horarios: ["12:00 a 14:00", "14:00 a 16:00", "16:00 a 18:00"],
            feriados: ["2026-01-01", "2026-03-24", "2026-04-02", "2026-05-01", "2026-07-09", "2026-12-25"],
            mensajeConfirmacion: `✅ Turno confirmado!\n\n⚠️ Recordar:\n• Traer herramientas personales (pinzas, destornilladores, flux, estaño, alcohol, etc).\n• Respetar los códigos de convivencia del Laboratorio (mantener el orden y limpieza del puesto de trabajo).\n• Respetar el horario elegido ya que luego ingresa otro alumno.\n• De no poder asistir avisar con anticipación para poder liberar el turno y que otro alumno pueda ocuparlo.`
        }));
    }
    if (!localStorage.getItem("archivos_laboratorio")) {
        localStorage.setItem("archivos_laboratorio", JSON.stringify([]));
    }
    if (!localStorage.getItem("cursos_laboratorio")) {
        localStorage.setItem("cursos_laboratorio", JSON.stringify([]));
    }
}

// =======================
// ALUMNOS
// =======================

function getAlumnos() {
    return JSON.parse(localStorage.getItem("alumnos")) || [];
}

function getAlumnoPorTelefono(telefono) {
    const alumnos = getAlumnos();
    return alumnos.find(a => a.telefono === telefono) || null;
}

function getAlumnoPorId(id) {
    const alumnos = getAlumnos();
    return alumnos.find(a => a.id === id) || null;
}

function crearAlumno(alumno) {
    const alumnos = getAlumnos();
    
    if (alumnos.find(a => a.telefono === alumno.telefono)) {
        return { success: false, error: "Teléfono ya registrado" };
    }
    
    const nuevoAlumno = {
        id: Date.now(),
        nombre: alumno.nombre,
        apellido: alumno.apellido,
        telefono: alumno.telefono,
        nivel: alumno.nivel,
        fechaRegistro: new Date().toISOString()
    };
    
    alumnos.push(nuevoAlumno);
    localStorage.setItem("alumnos", JSON.stringify(alumnos));
    
    return { success: true, data: nuevoAlumno };
}

function actualizarAlumno(id, datos) {
    const alumnos = getAlumnos();
    const index = alumnos.findIndex(a => a.id === id);
    
    if (index === -1) {
        return { success: false, error: "Alumno no encontrado" };
    }
    
    if (datos.telefono && datos.telefono !== alumnos[index].telefono) {
        const telefonoExistente = alumnos.find(a => a.telefono === datos.telefono && a.id !== id);
        if (telefonoExistente) {
            return { success: false, error: "Teléfono ya registrado por otro alumno" };
        }
    }
    
    alumnos[index] = { ...alumnos[index], ...datos };
    localStorage.setItem("alumnos", JSON.stringify(alumnos));
    
    return { success: true, data: alumnos[index] };
}

function eliminarAlumno(id) {
    let alumnos = getAlumnos();
    const turnos = getTurnos();
    
    const nuevosTurnos = turnos.filter(t => t.alumno_id !== id);
    localStorage.setItem("turnos", JSON.stringify(nuevosTurnos));
    
    alumnos = alumnos.filter(a => a.id !== id);
    localStorage.setItem("alumnos", JSON.stringify(alumnos));
    
    return { success: true };
}

// =======================
// TURNOS
// =======================

function getTurnos() {
    return JSON.parse(localStorage.getItem("turnos")) || [];
}

function getTurnosPorFecha(fecha) {
    const turnos = getTurnos();
    return turnos.filter(t => t.fecha === fecha);
}

function crearTurno(turno) {
    const turnos = getTurnos();
    
    if (turnos.find(t => t.fecha === turno.fecha && t.turno === turno.turno)) {
        return { success: false, error: "Turno ya ocupado" };
    }
    
    if (turnos.find(t => t.alumno_id === turno.alumno_id && t.fecha === turno.fecha)) {
        return { success: false, error: "Ya tienes un turno ese día" };
    }
    
    const nuevoTurno = {
        id: Date.now(),
        alumno_id: turno.alumno_id,
        fecha: turno.fecha,
        turno: turno.turno,
        motivo: turno.motivo,
        fechaReserva: new Date().toISOString()
    };
    
    turnos.push(nuevoTurno);
    localStorage.setItem("turnos", JSON.stringify(turnos));
    
    return { success: true, data: nuevoTurno };
}

function eliminarTurno(id) {
    let turnos = getTurnos();
    turnos = turnos.filter(t => t.id !== id);
    localStorage.setItem("turnos", JSON.stringify(turnos));
    return { success: true };
}

// =======================
// CONFIGURACIÓN
// =======================

function getConfiguracion() {
    return JSON.parse(localStorage.getItem("configuracion"));
}

function actualizarConfiguracion(config) {
    localStorage.setItem("configuracion", JSON.stringify(config));
    return { success: true };
}

// =======================
// ARCHIVOS (Materiales)
// =======================

function getArchivos() {
    return JSON.parse(localStorage.getItem("archivos_laboratorio")) || [];
}

function crearArchivo(archivo) {
    const archivos = getArchivos();
    archivos.push(archivo);
    localStorage.setItem("archivos_laboratorio", JSON.stringify(archivos));
    return { success: true, data: archivo };
}

function eliminarArchivo(id) {
    let archivos = getArchivos();
    archivos = archivos.filter(a => a.id !== id);
    localStorage.setItem("archivos_laboratorio", JSON.stringify(archivos));
    return { success: true };
}

// =======================
// CURSOS
// =======================

function getCursos() {
    return JSON.parse(localStorage.getItem("cursos_laboratorio")) || [];
}

function crearCurso(curso) {
    const cursos = getCursos();
    cursos.push(curso);
    localStorage.setItem("cursos_laboratorio", JSON.stringify(cursos));
    return { success: true, data: curso };
}

function eliminarCurso(id) {
    let cursos = getCursos();
    cursos = cursos.filter(c => c.id !== id);
    localStorage.setItem("cursos_laboratorio", JSON.stringify(cursos));
    return { success: true };
}

// =======================
// INICIALIZACIÓN
// =======================

inicializarDatos();

// =======================
// TEMA OSCURO/CLARO
// =======================

function initTheme() {
    const savedTheme = localStorage.getItem("theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.textContent = savedTheme === "dark" ? "☀️" : "🌙";
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute("data-theme");
    const newTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", newTheme);
    localStorage.setItem("theme", newTheme);
    
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.textContent = newTheme === "dark" ? "☀️" : "🌙";
    }
    
    showToast(`Tema ${newTheme === "dark" ? "oscuro" : "claro"} activado`, "info");
}

// =======================
// ADMIN LOGIN / LOGOUT
// =======================

const ADMIN = {
    user: "DRTECNO",
    pass: "laboratorio2026"
};

function actualizarUIAdmin() {
    const btnDashboard = document.getElementById("btnDashboard");
    const btnConfig = document.getElementById("btnConfig");
    const btnLogin = document.getElementById("btnLogin");
    const btnLogout = document.getElementById("btnLogout");
    
    if (btnDashboard) btnDashboard.style.display = adminLog ? "inline" : "none";
    if (btnConfig) btnConfig.style.display = adminLog ? "inline" : "none";
    if (btnLogin) btnLogin.style.display = adminLog ? "none" : "inline";
    if (btnLogout) btnLogout.style.display = adminLog ? "inline" : "none";
}

function logout() {
    adminLog = false;
    localStorage.setItem("adminLog", "false");
    actualizarUIAdmin();
    window.location.href = "index.html";
    showToast("Sesión cerrada correctamente", "info");
}

// =======================
// TOAST NOTIFICATIONS
// =======================

function showToast(message, type = "info") {
    const toast = document.getElementById("toast");
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type} show`;
    
    setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}

// =======================
// NAVEGACIÓN PERFIL
// =======================

function irAPerfil() {
    const telefono = localStorage.getItem("alumno_telefono");
    if (telefono) {
        window.location.href = "perfil.html";
    } else {
        window.location.href = "login.html";
    }
}

// =======================
// CONFIGURACIÓN DEL LOGO
// =======================

const LOGO_DEFAULT = {
    type: "text",
    icon: "🔧",
    name: "DRTECNO",
    slogan: "Laboratorio",
    imageData: null
};

let logoConfig = JSON.parse(localStorage.getItem("logo_config")) || { ...LOGO_DEFAULT };

function aplicarLogo() {
    const logoContainer = document.getElementById("logoContent");
    if (!logoContainer) return;
    
    if (logoConfig.type === "image" && logoConfig.imageData) {
        logoContainer.innerHTML = `<img src="${logoConfig.imageData}" alt="Logo" style="max-height: 50px; max-width: 200px; object-fit: contain;">`;
    } else {
        logoContainer.innerHTML = `
            <span>${logoConfig.icon} ${logoConfig.name}</span>
            <small>${logoConfig.slogan}</small>
        `;
    }
}

function guardarLogoTexto() {
    const icon = document.getElementById("logoIcon")?.value.trim() || "🔧";
    const name = document.getElementById("logoName")?.value.trim() || "DRTECNO";
    const slogan = document.getElementById("logoSlogan")?.value.trim() || "Laboratorio";
    
    logoConfig = {
        type: "text",
        icon: icon,
        name: name,
        slogan: slogan,
        imageData: null
    };
    
    localStorage.setItem("logo_config", JSON.stringify(logoConfig));
    aplicarLogo();
    if (typeof actualizarVistaPreviaLogo === "function") actualizarVistaPreviaLogo();
    showToast("✅ Logo de texto guardado correctamente", "success");
}

function subirLogo() {
    const fileInput = document.getElementById("logoUpload");
    const file = fileInput?.files[0];
    
    if (!file) {
        showToast("❌ Selecciona una imagen primero", "error");
        return;
    }
    
    if (file.size > 2 * 1024 * 1024) {
        showToast("❌ La imagen no puede superar los 2MB", "error");
        return;
    }
    
    const tiposPermitidos = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml", "image/gif"];
    if (!tiposPermitidos.includes(file.type)) {
        showToast("❌ Formato no permitido. Usa PNG, JPG, JPEG, SVG o GIF", "error");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        logoConfig = {
            type: "image",
            icon: "🔧",
            name: "DRTECNO",
            slogan: "Laboratorio",
            imageData: e.target.result
        };
        
        localStorage.setItem("logo_config", JSON.stringify(logoConfig));
        aplicarLogo();
        if (typeof actualizarVistaPreviaLogo === "function") actualizarVistaPreviaLogo();
        showToast("✅ Logo subido correctamente", "success");
    };
    reader.readAsDataURL(file);
}

function restablecerLogo() {
    logoConfig = { ...LOGO_DEFAULT };
    localStorage.setItem("logo_config", JSON.stringify(logoConfig));
    aplicarLogo();
    if (typeof actualizarVistaPreviaLogo === "function") actualizarVistaPreviaLogo();
    
    const iconInput = document.getElementById("logoIcon");
    const nameInput = document.getElementById("logoName");
    const sloganInput = document.getElementById("logoSlogan");
    const fileInput = document.getElementById("logoUpload");
    
    if (iconInput) iconInput.value = LOGO_DEFAULT.icon;
    if (nameInput) nameInput.value = LOGO_DEFAULT.name;
    if (sloganInput) sloganInput.value = LOGO_DEFAULT.slogan;
    if (fileInput) fileInput.value = "";
    
    showToast("✅ Logo restablecido a valores predeterminados", "success");
}

function actualizarVistaPreviaLogo() {
    const previewContainer = document.getElementById("logoPreview");
    if (!previewContainer) return;
    
    if (logoConfig.type === "image" && logoConfig.imageData) {
        previewContainer.innerHTML = `<img src="${logoConfig.imageData}" alt="Logo Preview">`;
    } else {
        previewContainer.innerHTML = `
            <div class="logo-text-preview">
                <span>${logoConfig.icon} ${logoConfig.name}</span>
                <small>${logoConfig.slogan}</small>
            </div>
        `;
    }
    
    const iconInput = document.getElementById("logoIcon");
    const nameInput = document.getElementById("logoName");
    const sloganInput = document.getElementById("logoSlogan");
    
    if (iconInput) iconInput.value = logoConfig.icon;
    if (nameInput) nameInput.value = logoConfig.name;
    if (sloganInput) sloganInput.value = logoConfig.slogan;
}

// =======================
// CONFIGURACIÓN DE FONDO
// =======================

function cargarFondo() {
    const fondoGuardado = localStorage.getItem("fondo_config");
    if (fondoGuardado) {
        const fondo = JSON.parse(fondoGuardado);
        if (fondo && fondo.url) {
            document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${fondo.url}')`;
            document.body.style.backgroundSize = "cover";
            document.body.style.backgroundPosition = "center";
            document.body.style.backgroundAttachment = "fixed";
            document.body.style.backgroundRepeat = "no-repeat";
        }
    }
}

// =======================
// INICIALIZACIÓN
// =======================

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    aplicarLogo();
    cargarFondo();
    
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }
    
    actualizarUIAdmin();
});