// =======================
// ADMIN - FILTROS AVANZADOS
// =======================

async function aplicarFiltros() {
    const fechaInicio = document.getElementById("filtroFechaInicio");
    const fechaFin = document.getElementById("filtroFechaFin");
    const filtroNivel = document.getElementById("filtroNivel");
    const filtroMotivo = document.getElementById("filtroMotivo");
    const filtroAlumno = document.getElementById("filtroAlumno");
    
    filtrosActivos = {
        fechaInicio: fechaInicio ? fechaInicio.value : "",
        fechaFin: fechaFin ? fechaFin.value : "",
        nivel: filtroNivel ? filtroNivel.value : "todos",
        motivo: filtroMotivo ? filtroMotivo.value : "todos",
        alumno: filtroAlumno ? filtroAlumno.value.toLowerCase().trim() : ""
    };
    
    await renderTurnosFiltrados();
}

async function limpiarFiltros() {
    const fechaInicio = document.getElementById("filtroFechaInicio");
    const fechaFin = document.getElementById("filtroFechaFin");
    const filtroNivel = document.getElementById("filtroNivel");
    const filtroMotivo = document.getElementById("filtroMotivo");
    const filtroAlumno = document.getElementById("filtroAlumno");
    
    if (fechaInicio) fechaInicio.value = "";
    if (fechaFin) fechaFin.value = "";
    if (filtroNivel) filtroNivel.value = "todos";
    if (filtroMotivo) filtroMotivo.value = "todos";
    if (filtroAlumno) filtroAlumno.value = "";
    
    filtrosActivos = {
        fechaInicio: "",
        fechaFin: "",
        nivel: "todos",
        motivo: "todos",
        alumno: ""
    };
    
    await renderTurnosFiltrados();
}

async function renderTurnosFiltrados() {
    let turnosData = getTurnos();
    const alumnosData = getAlumnos();
    
    if (filtrosActivos.fechaInicio) {
        turnosData = turnosData.filter(t => t.fecha >= filtrosActivos.fechaInicio);
    }
    if (filtrosActivos.fechaFin) {
        turnosData = turnosData.filter(t => t.fecha <= filtrosActivos.fechaFin);
    }
    
    if (filtrosActivos.nivel !== "todos") {
        const alumnosNivel = alumnosData.filter(a => a.nivel === filtrosActivos.nivel).map(a => a.id);
        turnosData = turnosData.filter(t => alumnosNivel.includes(t.alumno_id));
    }
    
    if (filtrosActivos.motivo !== "todos") {
        turnosData = turnosData.filter(t => t.motivo === filtrosActivos.motivo);
    }
    
    if (filtrosActivos.alumno) {
        const alumnosCoincidentes = alumnosData.filter(a => 
            a.nombre.toLowerCase().includes(filtrosActivos.alumno) ||
            a.apellido.toLowerCase().includes(filtrosActivos.alumno) ||
            a.telefono.includes(filtrosActivos.alumno)
        ).map(a => a.id);
        turnosData = turnosData.filter(t => alumnosCoincidentes.includes(t.alumno_id));
    }
    
    turnosFiltrados = turnosData;
    
    const containerVigentes = document.getElementById("turnosVigentesList");
    const containerArchivados = document.getElementById("turnosArchivadosList");
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const vigentes = turnosFiltrados.filter(turno => {
        const fechaTurno = new Date(turno.fecha);
        fechaTurno.setHours(0, 0, 0, 0);
        return fechaTurno >= hoy;
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    
    const archivados = turnosFiltrados.filter(turno => {
        const fechaTurno = new Date(turno.fecha);
        fechaTurno.setHours(0, 0, 0, 0);
        return fechaTurno < hoy;
    }).sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
    
    if (containerVigentes) renderListaTurnos(containerVigentes, vigentes, "vigente");
    if (containerArchivados) renderListaTurnos(containerArchivados, archivados, "archivado");
    
    showToast(`📊 Filtros aplicados: ${turnosFiltrados.length} turnos encontrados`, "info");
}