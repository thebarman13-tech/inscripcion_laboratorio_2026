// =======================
// ADMIN - ESTADÍSTICAS AVANZADAS
// =======================

async function actualizarEstadisticas() {
    const alumnosData = getAlumnos();
    const turnosData = getTurnos();
    
    const totalTurnos = turnosData.length;
    const totalAlumnos = alumnosData.length;
    
    const fechasUnicas = new Set(turnosData.map(t => t.fecha));
    const diasConTurnos = fechasUnicas.size;
    
    const hoy = new Date();
    let totalDisponibles = 0;
    let fechaActual = new Date(hoy);
    fechaActual.setDate(hoy.getDate() + 1);
    
    const config = getConfiguracion();
    const diasHabiles = config ? config.diasHabiles : [2, 3, 4];
    const turnos = config ? config.horarios : ["12:00 a 14:00", "14:00 a 16:00", "16:00 a 18:00"];
    const feriados = config ? config.feriados : [];
    
    for (let i = 0; i < 14; i++) {
        const fechaStr = fechaActual.toISOString().split("T")[0];
        const diaSemana = fechaActual.getDay();
        if (diasHabiles.includes(diaSemana) && !feriados.includes(fechaStr)) {
            totalDisponibles += turnos.length;
        }
        fechaActual.setDate(fechaActual.getDate() + 1);
    }
    
    const ocupacion = totalDisponibles > 0 ? Math.round((totalTurnos / totalDisponibles) * 100) : 0;
    
    const totalTurnosEl = document.getElementById("totalTurnos");
    const totalAlumnosEl = document.getElementById("totalAlumnos");
    const diasConTurnosEl = document.getElementById("diasConTurnos");
    const tasaOcupacionEl = document.getElementById("tasaOcupacion");
    
    if (totalTurnosEl) totalTurnosEl.textContent = totalTurnos;
    if (totalAlumnosEl) totalAlumnosEl.textContent = totalAlumnos;
    if (diasConTurnosEl) diasConTurnosEl.textContent = diasConTurnos;
    if (tasaOcupacionEl) tasaOcupacionEl.textContent = `${ocupacion}%`;
}

async function actualizarEstadisticasAvanzadas() {
    const alumnosData = getAlumnos();
    const turnosData = getTurnos();
    const cancelaciones = JSON.parse(localStorage.getItem("cancelaciones")) || [];
    
    // Alumno más activo
    const turnosPorAlumno = {};
    turnosData.forEach(turno => {
        turnosPorAlumno[turno.alumno_id] = (turnosPorAlumno[turno.alumno_id] || 0) + 1;
    });
    
    let alumnoMasActivoId = null;
    let maxTurnos = 0;
    for (const [id, count] of Object.entries(turnosPorAlumno)) {
        if (count > maxTurnos) {
            maxTurnos = count;
            alumnoMasActivoId = parseInt(id);
        }
    }
    
    if (alumnoMasActivoId) {
        const alumno = getAlumnoPorId(alumnoMasActivoId);
        document.getElementById("alumnoMasActivo").textContent = alumno ? `${alumno.nombre} ${alumno.apellido} (${maxTurnos} turnos)` : "-";
    } else {
        document.getElementById("alumnoMasActivo").textContent = "-";
    }
    
    // Horario más demandado
    const horarios = {};
    turnosData.forEach(turno => {
        horarios[turno.turno] = (horarios[turno.turno] || 0) + 1;
    });
    
    let horarioMasDemandado = "-";
    let maxHorario = 0;
    for (const [horario, count] of Object.entries(horarios)) {
        if (count > maxHorario) {
            maxHorario = count;
            horarioMasDemandado = horario;
        }
    }
    document.getElementById("horarioMasDemandado").textContent = horarioMasDemandado !== "-" ? `${horarioMasDemandado} (${maxHorario} turnos)` : "-";
    
    // Día con más turnos
    const dias = {};
    turnosData.forEach(turno => {
        const fecha = new Date(turno.fecha);
        const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
        dias[diaSemana] = (dias[diaSemana] || 0) + 1;
    });
    
    let diaMasTurnos = "-";
    let maxDia = 0;
    for (const [dia, count] of Object.entries(dias)) {
        if (count > maxDia) {
            maxDia = count;
            diaMasTurnos = dia;
        }
    }
    document.getElementById("diaMasTurnos").textContent = diaMasTurnos !== "-" ? `${diaMasTurnos} (${maxDia} turnos)` : "-";
    
    // Tasa de cancelación
    const totalTurnos = turnosData.length;
    const totalCancelaciones = cancelaciones.length;
    const tasa = totalTurnos > 0 ? Math.round((totalCancelaciones / totalTurnos) * 100) : 0;
    document.getElementById("tasaCancelacion").textContent = `${tasa}%`;
    
    // Ranking de alumnos más activos
    renderRankingAlumnos(turnosPorAlumno);
    
    // Gráfico de horarios
    renderGraficoHorarios(horarios);
}

function renderRankingAlumnos(turnosPorAlumno) {
    const container = document.getElementById("rankingAlumnos");
    if (!container) return;
    
    const ranking = Object.entries(turnosPorAlumno)
        .map(([id, count]) => ({ id: parseInt(id), count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);
    
    if (ranking.length === 0) {
        container.innerHTML = '<p style="text-align:center; padding:1rem;">📊 No hay datos aún</p>';
        return;
    }
    
    container.innerHTML = ranking.map((item, index) => {
        const alumno = getAlumnoPorId(item.id);
        const nombre = alumno ? `${alumno.nombre} ${alumno.apellido}` : `Alumno #${item.id}`;
        const medalla = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
        
        return `
            <div class="ranking-item">
                <div class="ranking-puesto">${medalla}</div>
                <div class="ranking-info">
                    <div class="ranking-nombre">${escapeHtml(nombre)}</div>
                    <div class="ranking-turnos">Turnos reservados</div>
                </div>
                <div class="ranking-cantidad">${item.count}</div>
            </div>
        `;
    }).join("");
}

function renderGraficoHorarios(horarios) {
    const ctx = document.getElementById("horariosChart")?.getContext("2d");
    if (!ctx) return;
    
    const labels = Object.keys(horarios);
    const datos = Object.values(horarios);
    
    if (horariosChart) horariosChart.destroy();
    
    horariosChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: labels,
            datasets: [{
                label: "Cantidad de turnos",
                data: datos,
                backgroundColor: "#3b82f6",
                borderRadius: 8,
                barPercentage: 0.6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: { display: false },
                tooltip: { backgroundColor: "rgba(0,0,0,0.8)" }
            },
            scales: {
                y: { beginAtZero: true, ticks: { stepSize: 1, color: getComputedStyle(document.body).getPropertyValue('--text-secondary') } },
                x: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') } }
            }
        }
    });
}

async function actualizarGraficos() {
    const turnosData = getTurnos();
    const alumnosData = getAlumnos();
    
    const niveles = { Inicial: 0, Intermedio: 0, Avanzado: 0 };
    
    turnosData.forEach(turno => {
        const alumno = alumnosData.find(a => a.id === turno.alumno_id);
        if (alumno && niveles[alumno.nivel] !== undefined) {
            niveles[alumno.nivel]++;
        }
    });
    
    const nivelCtx = document.getElementById("nivelChart")?.getContext("2d");
    if (nivelCtx) {
        if (nivelChart) nivelChart.destroy();
        nivelChart = new Chart(nivelCtx, {
            type: "doughnut",
            data: {
                labels: ["📘 Inicial", "📗 Intermedio", "📕 Avanzado"],
                datasets: [{
                    data: [niveles.Inicial, niveles.Intermedio, niveles.Avanzado],
                    backgroundColor: ["#3b82f6", "#8b5cf6", "#ec489a"],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { position: "bottom", labels: { color: getComputedStyle(document.body).getPropertyValue('--text-primary') } }
                }
            }
        });
    }
    
    const motivos = {};
    turnosData.forEach(turno => {
        motivos[turno.motivo] = (motivos[turno.motivo] || 0) + 1;
    });
    
    const motivoCtx = document.getElementById("motivoChart")?.getContext("2d");
    if (motivoCtx) {
        if (motivoChart) motivoChart.destroy();
        motivoChart = new Chart(motivoCtx, {
            type: "bar",
            data: {
                labels: Object.keys(motivos),
                datasets: [{
                    label: "Cantidad de turnos",
                    data: Object.values(motivos),
                    backgroundColor: "#3b82f6",
                    borderRadius: 8
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1, color: getComputedStyle(document.body).getPropertyValue('--text-secondary') } },
                    x: { ticks: { color: getComputedStyle(document.body).getPropertyValue('--text-secondary') } }
                }
            }
        });
    }
}