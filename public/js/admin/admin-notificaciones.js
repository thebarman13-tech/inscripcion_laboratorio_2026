// =======================
// ADMIN - NOTIFICACIONES
// =======================

let notificaciones = [];

function agregarNotificacion(titulo, descripcion, tipo = "info") {
    const notificacion = {
        id: Date.now(),
        titulo: titulo,
        descripcion: descripcion,
        tipo: tipo,
        fecha: new Date().toISOString(),
        leida: false
    };
    
    notificaciones.unshift(notificacion);
    
    if (notificaciones.length > 50) {
        notificaciones = notificaciones.slice(0, 50);
    }
    
    localStorage.setItem("notificaciones_admin", JSON.stringify(notificaciones));
    renderNotificaciones();
    showToast(`🔔 ${titulo}`, "info");
}

function cargarNotificaciones() {
    const guardadas = localStorage.getItem("notificaciones_admin");
    if (guardadas) {
        notificaciones = JSON.parse(guardadas);
    } else {
        notificaciones = [
            {
                id: Date.now() - 86400000,
                titulo: "Bienvenido al sistema",
                descripcion: "El panel de administración está listo para usar",
                tipo: "success",
                fecha: new Date(Date.now() - 86400000).toISOString(),
                leida: true
            }
        ];
    }
    renderNotificaciones();
}

function renderNotificaciones() {
    const container = document.getElementById("notificacionesList");
    if (!container) return;
    
    if (notificaciones.length === 0) {
        container.innerHTML = `
            <div class="notificacion-vacia">
                <span>🔔</span>
                <p>No hay notificaciones</p>
                <small>Las notificaciones aparecerán aquí</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = notificaciones.map(notif => {
        const fecha = new Date(notif.fecha).toLocaleString('es-ES');
        const icono = getIconoPorTipoNotif(notif.tipo);
        
        return `
            <div class="notificacion-item ${!notif.leida ? 'nueva' : ''}" data-id="${notif.id}">
                <div class="notificacion-icono">${icono}</div>
                <div class="notificacion-contenido">
                    <div class="notificacion-titulo">${escapeHtml(notif.titulo)}</div>
                    <div class="notificacion-descripcion">${escapeHtml(notif.descripcion)}</div>
                    <div class="notificacion-fecha">📅 ${fecha}</div>
                </div>
            </div>
        `;
    }).join("");
    
    notificaciones.forEach(n => n.leida = true);
    localStorage.setItem("notificaciones_admin", JSON.stringify(notificaciones));
}

function getIconoPorTipoNotif(tipo) {
    const iconos = {
        success: '✅',
        error: '❌',
        warning: '⚠️',
        info: 'ℹ️'
    };
    return iconos[tipo] || '📌';
}

// Sobrescribir funciones para agregar notificaciones
const originalCrearAlumno = window.crearAlumno || function() { return { success: false }; };
const originalCrearTurno = window.crearTurno || function() { return { success: false }; };
const originalEliminarTurno = window.eliminarTurno || function() { return { success: false }; };

async function crearAlumnoConNotificacion(alumno) {
    const resultado = await originalCrearAlumno(alumno);
    if (resultado && resultado.success) {
        agregarNotificacion(
            "📝 Nuevo alumno registrado",
            `${alumno.nombre} ${alumno.apellido} se ha registrado en el sistema`,
            "success"
        );
    }
    return resultado;
}

async function crearTurnoConNotificacion(turno) {
    const resultado = await originalCrearTurno(turno);
    if (resultado && resultado.success) {
        const alumno = getAlumnoPorId(turno.alumno_id);
        agregarNotificacion(
            "📅 Nuevo turno reservado",
            `${alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno'} reservó turno para ${turno.fecha} a las ${turno.turno}`,
            "info"
        );
    }
    return resultado;
}

async function eliminarTurnoConNotificacion(id) {
    const turnos = getTurnos();
    const turno = turnos.find(t => t.id === id);
    const resultado = await originalEliminarTurno(id);
    if (resultado && resultado.success && turno) {
        const alumno = getAlumnoPorId(turno.alumno_id);
        agregarNotificacion(
            "❌ Turno cancelado",
            `${alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno'} canceló el turno del ${turno.fecha} a las ${turno.turno}`,
            "warning"
        );
    }
    return resultado;
}

if (typeof window.crearAlumno === 'function') window.crearAlumno = crearAlumnoConNotificacion;
if (typeof window.crearTurno === 'function') window.crearTurno = crearTurnoConNotificacion;
if (typeof window.eliminarTurno === 'function') window.eliminarTurno = eliminarTurnoConNotificacion;