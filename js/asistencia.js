// =======================
// VARIABLES GLOBALES
// =======================

let TURNOS = ["12:00 a 14:00", "14:00 a 16:00", "16:00 a 18:00"];
let DIAS_HABILES = [2, 3, 4];
let FERIADOS = ["2026-01-01", "2026-03-24", "2026-04-02", "2026-05-01", "2026-07-09", "2026-12-25"];
let MENSAJE_CONFIRMACION = `✅ Turno confirmado!\n\n⚠️ Recordar:\n• Traer herramientas personales (pinzas, destornilladores, flux, estaño, alcohol, etc).\n• Respetar los códigos de convivencia del Laboratorio (mantener el orden y limpieza del puesto de trabajo).\n• Respetar el horario elegido ya que luego ingresa otro alumno.\n• De no poder asistir avisar con anticipación para poder liberar el turno y que otro alumno pueda ocuparlo.`;

let filtroCalendario = "";

function cargarConfiguracion() {
    const config = getConfiguracion();
    if (config) {
        DIAS_HABILES = config.diasHabiles;
        TURNOS = config.horarios;
        FERIADOS = config.feriados;
        MENSAJE_CONFIRMACION = config.mensajeConfirmacion;
        actualizarSelectTurnos();
    }
}

function filtrarCalendario() {
    filtroCalendario = document.getElementById("buscarTurnos")?.value.toLowerCase() || "";
    renderCalendario();
}

function renderCalendario() {
    const calendario = document.getElementById("calendario");
    if (!calendario) return;
    
    calendario.innerHTML = "";
    
    const hoy = new Date();
    const diasMostrar = [];
    let fechaActual = new Date(hoy);
    fechaActual.setDate(hoy.getDate() + 1);
    
    const todosLosTurnos = getTurnos();
    
    while (diasMostrar.length < 7) {
        const diaSemana = fechaActual.getDay();
        const fechaStr = fechaActual.toISOString().split("T")[0];
        
        if (DIAS_HABILES.includes(diaSemana) && !FERIADOS.includes(fechaStr)) {
            diasMostrar.push(new Date(fechaActual));
        }
        
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    for (const fecha of diasMostrar) {
        const fechaStr = fecha.toISOString().split("T")[0];
        const fechaFormateada = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
        
        const turnosOcupados = todosLosTurnos.filter(t => t.fecha === fechaStr);
        
        const diaDiv = document.createElement("div");
        diaDiv.className = "dia";
        diaDiv.innerHTML = `<h4>${fechaFormateada}<br><small>${fechaStr}</small></h4>`;
        
        for (const turno of TURNOS) {
            const ocupado = turnosOcupados.find(t => t.turno === turno);
            const btn = document.createElement("button");
            btn.textContent = turno;
            btn.className = ocupado ? "ocupado" : "libre";
            
            if (!ocupado) {
                btn.onclick = () => {
                    document.getElementById("fechaTurno").value = fechaStr;
                    document.getElementById("turnoSelect").value = turno;
                    document.querySelector(".form-card").scrollIntoView({ behavior: "smooth" });
                    showToast(`Seleccionado: ${turno} para ${fechaFormateada}`, "info");
                };
            }
            
            diaDiv.appendChild(btn);
        }
        
        calendario.appendChild(diaDiv);
    }
}

function mostrarHistorialAlumno(telefono) {
    const historialCard = document.getElementById("historialCard");
    const historialDiv = document.getElementById("historialTurnos");
    
    if (!telefono || telefono.length < 6) {
        historialCard.style.display = "none";
        return;
    }
    
    const alumno = getAlumnoPorTelefono(telefono);
    if (!alumno) {
        historialCard.style.display = "none";
        return;
    }
    
    const todosLosTurnos = getTurnos();
    const turnosAlumno = todosLosTurnos
        .filter(t => t.alumno_id === alumno.id)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    if (turnosAlumno.length === 0) {
        historialDiv.innerHTML = '<p>📭 No hay turnos previos</p>';
    } else {
        historialDiv.innerHTML = turnosAlumno.map(t => {
            const fechaObj = new Date(t.fecha);
            const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            return `
                <div class="historial-item">
                    <div>
                        <span class="historial-fecha">📅 ${fechaFormateada}</span>
                        <span class="historial-turno">⏰ ${t.turno}</span>
                    </div>
                    <div>📌 ${t.motivo}</div>
                </div>
            `;
        }).join('');
    }
    
    historialCard.style.display = "block";
}

function showConfirmacionModal(alumno, fecha, turno) {
    const modal = document.getElementById("modalConfirmacion");
    const modalBody = document.getElementById("modalBody");
    
    const fechaObj = new Date(fecha);
    const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const diaCapitalizado = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
    const mensajeHTML = MENSAJE_CONFIRMACION.replace(/\n/g, '<br>').replace(/•/g, '<br>•');
    
    modalBody.innerHTML = `
        <div class="info-cards">
            <div class="info-card alumno">
                <div class="info-label"><span>👤</span> ALUMNO</div>
                <div class="info-value">${alumno.nombre} ${alumno.apellido}</div>
            </div>
            <div class="info-card fecha">
                <div class="info-label"><span>📅</span> FECHA Y HORARIO</div>
                <div class="info-value">${diaCapitalizado} · ⏰ ${turno}</div>
            </div>
        </div>
        <div class="reminders-section">
            <div class="reminders-title"><span>⚠️</span> IMPORTANTE - LEER ATENTAMENTE</div>
            <div style="white-space: pre-line; line-height: 1.6;">${mensajeHTML}</div>
        </div>
        <div class="confirmation-footer"><span>✅</span> ¡Turno confirmado! Te esperamos en el laboratorio.</div>
    `;
    
    modal.style.display = "block";
    
    const btnAceptar = document.getElementById("btnAceptar");
    const cerrarModal = () => { modal.style.display = "none"; };
    
    const newBtn = btnAceptar.cloneNode(true);
    btnAceptar.parentNode.replaceChild(newBtn, btnAceptar);
    newBtn.addEventListener("click", cerrarModal);
    
    modal.onclick = (e) => { if (e.target === modal) modal.style.display = "none"; };
    
    const escHandler = (e) => {
        if (e.key === "Escape") {
            modal.style.display = "none";
            document.removeEventListener("keydown", escHandler);
        }
    };
    document.addEventListener("keydown", escHandler);
    newBtn.addEventListener("click", () => document.removeEventListener("keydown", escHandler), { once: true });
}

function actualizarSelectTurnos() {
    const turnoSelect = document.getElementById("turnoSelect");
    if (!turnoSelect) return;
    
    const valorActual = turnoSelect.value;
    turnoSelect.innerHTML = "";
    
    TURNOS.forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = t;
        turnoSelect.appendChild(opt);
    });
    
    if (TURNOS.includes(valorActual)) turnoSelect.value = valorActual;
}

const formTurno = document.getElementById("formTurno");

if (formTurno) {
    formTurno.onsubmit = (e) => {
        e.preventDefault();
        
        const telefono = document.getElementById("telTurno").value.trim();
        const fecha = document.getElementById("fechaTurno").value;
        const turno = document.getElementById("turnoSelect").value;
        const motivo = document.getElementById("motivo").value;
        
        if (!telefono || !fecha || !turno || !motivo) {
            showToast("Complete todos los campos", "error");
            return;
        }
        
        const alumno = getAlumnoPorTelefono(telefono);
        if (!alumno) {
            showToast("❌ Alumno no registrado. Primero regístrese en la sección 'Registro'", "error");
            return;
        }
        
        const fechaObj = new Date(fecha);
        const diaSemana = fechaObj.getDay();
        if (!DIAS_HABILES.includes(diaSemana)) {
            showToast(`❌ Solo se pueden reservar turnos los días seleccionados en configuración`, "error");
            return;
        }
        
        if (FERIADOS.includes(fecha)) {
            showToast("❌ No se puede reservar turno en días feriados", "error");
            return;
        }
        
        const todosLosTurnos = getTurnos();
        const turnoOcupado = todosLosTurnos.find(t => t.fecha === fecha && t.turno === turno);
        if (turnoOcupado) {
            showToast("❌ Este turno ya está ocupado", "error");
            return;
        }
        
        const turnoExistente = todosLosTurnos.find(t => t.alumno_id === alumno.id && t.fecha === fecha);
        if (turnoExistente) {
            showToast("❌ Ya tienes un turno reservado para este día", "error");
            return;
        }
        
        const resultado = crearTurno({
            alumno_id: alumno.id,
            fecha: fecha,
            turno: turno,
            motivo: motivo
        });
        
        if (resultado.success) {
            showConfirmacionModal(alumno, fecha, turno);
            document.getElementById("telTurno").value = "";
            document.getElementById("motivo").value = "";
            document.getElementById("historialCard").style.display = "none";
            renderCalendario();
        } else {
            showToast(resultado.error || "❌ Error al reservar turno", "error");
        }
    };
}

document.addEventListener("DOMContentLoaded", () => {
    cargarConfiguracion();
    actualizarSelectTurnos();
    renderCalendario();
    
    const buscarTurnos = document.getElementById("buscarTurnos");
    if (buscarTurnos) buscarTurnos.addEventListener("input", () => filtrarCalendario());
    
    const telTurno = document.getElementById("telTurno");
    if (telTurno) telTurno.addEventListener("input", () => mostrarHistorialAlumno(telTurno.value));
});