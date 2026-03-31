// =======================
// ADMIN - CORE PRINCIPAL
// =======================

// Variables globales
let nivelChart = null;
let motivoChart = null;
let horariosChart = null;
let tabTurnosActual = "vigentes";
let filtroBusquedaAlumnos = "";
let archivosAdmin = [];
let cursosAdmin = [];
let fechaActual = new Date();
let turnosFiltrados = [];

// Filtros activos
let filtrosActivos = {
    fechaInicio: "",
    fechaFin: "",
    nivel: "todos",
    motivo: "todos",
    alumno: ""
};

// =======================
// FUNCIONES AUXILIARES
// =======================

function escapeHtml(text) {
    if (!text) return "";
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function mostrarSeccion(seccion) {
    const loginSection = document.getElementById("loginSection");
    const dashboardSection = document.getElementById("dashboardSection");
    const configuracionSection = document.getElementById("configuracionSection");
    
    if (loginSection) loginSection.style.display = seccion === "login" ? "block" : "none";
    if (dashboardSection) dashboardSection.style.display = seccion === "dashboard" ? "block" : "none";
    if (configuracionSection) configuracionSection.style.display = seccion === "configuracion" ? "block" : "none";
}

// =======================
// SKELETON LOADING
// =======================

function mostrarSkeletonLoading() {
    const elementos = [
        "totalTurnos", "totalAlumnos", "diasConTurnos", "tasaOcupacion",
        "alumnoMasActivo", "horarioMasDemandado", "diaMasTurnos", "tasaCancelacion"
    ];
    
    elementos.forEach(id => {
        const el = document.getElementById(id);
        if (el && (el.textContent === "0" || el.textContent === "0%" || el.textContent === "-")) {
            el.innerHTML = '<div class="skeleton" style="height: 2rem; width: 100%;"></div>';
        }
    });
}

function ocultarSkeletonLoading() {}

// =======================
// DASHBOARD PRINCIPAL
// =======================

async function actualizarDashboard() {
    mostrarSkeletonLoading();
    
    await actualizarEstadisticas();
    await renderAlumnosPorNivel();
    await actualizarGraficos();
    await renderTurnosVigentes();
    await renderTurnosArchivados();
    await renderCalendarioMensual();
    await actualizarEstadisticasAvanzadas();
    
    ocultarSkeletonLoading();
}

// =======================
// INICIALIZACIÓN
// =======================

document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const tab = urlParams.get("tab");
    
    if (adminLog) {
        if (tab === "configuracion") {
            mostrarSeccion("configuracion");
            await cargarConfiguracionEnFormulario();
        } else {
            mostrarSeccion("dashboard");
            cargarNotificaciones();
            await actualizarDashboard();
        }
    } else {
        mostrarSeccion("login");
    }
});

// =======================
// LOGIN ADMIN
// =======================

const formLoginAdmin = document.getElementById("formLogin");
if (formLoginAdmin) {
    formLoginAdmin.onsubmit = (e) => {
        e.preventDefault();
        
        const user = document.getElementById("user")?.value;
        const pass = document.getElementById("pass")?.value;
        
        if (user === "DRTECNO" && pass === "laboratorio2026") {
            adminLog = true;
            localStorage.setItem("adminLog", "true");
            actualizarUIAdmin();
            mostrarSeccion("dashboard");
            cargarNotificaciones();
            actualizarDashboard();
            showToast("Bienvenido administrador", "success");
        } else {
            showToast("Usuario o contraseña incorrectos", "error");
        }
    };
}