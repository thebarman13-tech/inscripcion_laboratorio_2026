// =======================
// ADMIN - TURNOS
// =======================

function renderListaTurnos(container, turnos, tipo) {
    if (turnos.length === 0) {
        container.innerHTML = `
            <div class="turnos-empty">
                <span>📭</span>
                <p>No hay turnos que coincidan con los filtros</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = turnos.map(turno => {
        const alumno = getAlumnoPorId(turno.alumno_id);
        const fechaObj = new Date(turno.fecha);
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: tipo === 'archivado' ? 'numeric' : undefined });
        const diaCapitalizado = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
        
        return `
            <div class="turno-item ${tipo}">
                <div class="turno-info">
                    <div class="turno-fecha-hora">
                        <span class="turno-fecha">📅 ${diaCapitalizado}</span>
                        <span class="turno-hora">⏰ ${turno.turno}</span>
                    </div>
                    <div class="turno-alumno">
                        👤 ${alumno ? `${alumno.nombre} ${alumno.apellido}` : turno.alumno_id}
                        <span class="turno-nivel ${alumno?.nivel}">${alumno?.nivel || "N/A"}</span>
                    </div>
                    <div class="turno-motivo">
                        📌 ${turno.motivo}
                    </div>
                </div>
                <div class="turno-actions">
                    <button class="btn-eliminar-turno" onclick="eliminarTurno(${turno.id})">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join("");
}

function mostrarTabTurnos(tab) {
    tabTurnosActual = tab;
    
    const btns = document.querySelectorAll(".tab-btn");
    btns.forEach(btn => btn.classList.remove("active"));
    if (event && event.target) event.target.classList.add("active");
    
    const turnosVigentes = document.getElementById("turnosVigentes");
    const turnosArchivados = document.getElementById("turnosArchivados");
    
    if (turnosVigentes) turnosVigentes.classList.toggle("active", tab === "vigentes");
    if (turnosArchivados) turnosArchivados.classList.toggle("active", tab === "archivados");
    
    if (tab === "vigentes") {
        renderTurnosVigentes();
    } else {
        renderTurnosArchivados();
    }
}

async function renderTurnosVigentes() {
    const container = document.getElementById("turnosVigentesList");
    if (!container) return;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const turnosData = getTurnos();
    const turnosVigentes = turnosData.filter(turno => {
        const fechaTurno = new Date(turno.fecha);
        fechaTurno.setHours(0, 0, 0, 0);
        return fechaTurno >= hoy;
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    renderListaTurnos(container, turnosVigentes, "vigente");
}

async function renderTurnosArchivados() {
    const container = document.getElementById("turnosArchivadosList");
    if (!container) return;
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const turnosData = getTurnos();
    const turnosArchivados = turnosData.filter(turno => {
        const fechaTurno = new Date(turno.fecha);
        fechaTurno.setHours(0, 0, 0, 0);
        return fechaTurno < hoy;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    renderListaTurnos(container, turnosArchivados, "archivado");
}

async function eliminarTurno(id) {
    if (confirm("¿Estás seguro de eliminar este turno?")) {
        const result = window.eliminarTurno(id);
        if (result && result.success) {
            await actualizarDashboard();
            await cargarListaAlumnosConfig();
            showToast("✅ Turno eliminado correctamente", "success");
        } else {
            showToast(result?.error || "❌ Error al eliminar turno", "error");
        }
    }
}