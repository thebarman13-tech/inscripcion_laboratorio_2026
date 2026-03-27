// =======================
// ADMIN - ALUMNOS POR NIVEL
// =======================

async function renderAlumnosPorNivel() {
    const alumnosData = getAlumnos();
    
    const alumnosInicial = alumnosData.filter(a => a.nivel === "Inicial");
    const alumnosIntermedio = alumnosData.filter(a => a.nivel === "Intermedio");
    const alumnosAvanzado = alumnosData.filter(a => a.nivel === "Avanzado");
    
    const contadorInicial = document.getElementById("contadorInicial");
    const contadorIntermedio = document.getElementById("contadorIntermedio");
    const contadorAvanzado = document.getElementById("contadorAvanzado");
    
    if (contadorInicial) contadorInicial.textContent = `${alumnosInicial.length} alumnos`;
    if (contadorIntermedio) contadorIntermedio.textContent = `${alumnosIntermedio.length} alumnos`;
    if (contadorAvanzado) contadorAvanzado.textContent = `${alumnosAvanzado.length} alumnos`;
    
    const turnosData = getTurnos();
    
    const containerInicial = document.getElementById("alumnosInicial");
    const containerIntermedio = document.getElementById("alumnosIntermedio");
    const containerAvanzado = document.getElementById("alumnosAvanzado");
    
    if (containerInicial) containerInicial.innerHTML = alumnosInicial.map(alumno => renderAlumnoCard(alumno, turnosData, "inicial")).join("");
    if (containerIntermedio) containerIntermedio.innerHTML = alumnosIntermedio.map(alumno => renderAlumnoCard(alumno, turnosData, "intermedio")).join("");
    if (containerAvanzado) containerAvanzado.innerHTML = alumnosAvanzado.map(alumno => renderAlumnoCard(alumno, turnosData, "avanzado")).join("");
}

function renderAlumnoCard(alumno, turnosData, nivelClass) {
    const turnosAlumno = turnosData.filter(t => t.alumno_id === alumno.id);
    const cantidadTurnos = turnosAlumno.length;
    const ultimoTurno = turnosAlumno.length > 0 ? turnosAlumno.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))[0] : null;
    
    return `
        <div class="alumno-card ${nivelClass}">
            <div class="alumno-header">
                <span class="alumno-nombre">${alumno.nombre} ${alumno.apellido}</span>
            </div>
            <div class="alumno-telefono">
                📞 ${alumno.telefono}
            </div>
            <div class="alumno-stats">
                <span class="alumno-turnos">📊 ${cantidadTurnos} turno${cantidadTurnos !== 1 ? 's' : ''} reservado${cantidadTurnos !== 1 ? 's' : ''}</span>
                ${ultimoTurno ? `<span class="alumno-fecha">📅 ${ultimoTurno.fecha}</span>` : '<span class="alumno-fecha">🚫 Sin turnos</span>'}
            </div>
        </div>
    `;
}

async function cargarListaAlumnosConfig() {
    const container = document.getElementById("listaAlumnosConfig");
    if (!container) return;
    
    const alumnosData = getAlumnos();
    const turnosData = getTurnos();
    
    let alumnosFiltrados = [...alumnosData];
    
    if (filtroBusquedaAlumnos) {
        const busqueda = filtroBusquedaAlumnos.toLowerCase();
        alumnosFiltrados = alumnosFiltrados.filter(a => 
            a.nombre.toLowerCase().includes(busqueda) ||
            a.apellido.toLowerCase().includes(busqueda) ||
            a.telefono.includes(busqueda)
        );
    }
    
    if (alumnosFiltrados.length === 0) {
        container.innerHTML = `
            <div class="turnos-empty">
                <span>👥</span>
                <p>No hay alumnos registrados</p>
                <small>Los alumnos aparecerán aquí cuando se registren</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = alumnosFiltrados.map(alumno => {
        const turnosAlumno = turnosData.filter(t => t.alumno_id === alumno.id);
        const cantidadTurnos = turnosAlumno.length;
        
        return `
            <div class="alumno-gestion-item" data-id="${alumno.id}">
                <div class="alumno-gestion-info">
                    <div class="alumno-gestion-nombre">
                        ${alumno.nombre} ${alumno.apellido}
                        <span class="alumno-gestion-nivel ${alumno.nivel}">${alumno.nivel}</span>
                    </div>
                    <div class="alumno-gestion-telefono">📞 ${alumno.telefono}</div>
                    <div class="alumno-gestion-turnos">📊 ${cantidadTurnos} turno${cantidadTurnos !== 1 ? 's' : ''} reservado${cantidadTurnos !== 1 ? 's' : ''}</div>
                </div>
                <div class="alumno-gestion-actions">
                    <button onclick="abrirModalEditar(${alumno.id})" class="btn-editar">✏️ Editar</button>
                    <button onclick="eliminarAlumnoDesdeGestion(${alumno.id})" class="btn-eliminar-alumno">🗑️ Eliminar</button>
                </div>
            </div>
        `;
    }).join("");
}

function filtrarAlumnosConfig() {
    const input = document.getElementById("buscarAlumnoConfig");
    filtroBusquedaAlumnos = input ? input.value : "";
    cargarListaAlumnosConfig();
}

function abrirModalEditar(id) {
    const alumno = getAlumnoPorId(id);
    if (!alumno) return;
    
    const editAlumnoId = document.getElementById("editAlumnoId");
    const editNombre = document.getElementById("editNombre");
    const editApellido = document.getElementById("editApellido");
    const editTelefono = document.getElementById("editTelefono");
    const editNivel = document.getElementById("editNivel");
    
    if (editAlumnoId) editAlumnoId.value = alumno.id;
    if (editNombre) editNombre.value = alumno.nombre;
    if (editApellido) editApellido.value = alumno.apellido;
    if (editTelefono) editTelefono.value = alumno.telefono;
    if (editNivel) editNivel.value = alumno.nivel;
    
    const modal = document.getElementById("modalEditarAlumno");
    if (modal) modal.style.display = "block";
}

function cerrarModalEditar() {
    const modal = document.getElementById("modalEditarAlumno");
    if (modal) modal.style.display = "none";
}

async function guardarEdicionAlumno(e) {
    e.preventDefault();
    
    const id = parseInt(document.getElementById("editAlumnoId").value);
    const nuevoNombre = document.getElementById("editNombre").value.trim();
    const nuevoApellido = document.getElementById("editApellido").value.trim();
    const nuevoTelefono = document.getElementById("editTelefono").value.trim();
    const nuevoNivel = document.getElementById("editNivel").value;
    
    if (!nuevoNombre || !nuevoApellido || !nuevoTelefono) {
        showToast("Todos los campos son obligatorios", "error");
        return;
    }
    
    const resultado = actualizarAlumno(id, {
        nombre: nuevoNombre,
        apellido: nuevoApellido,
        telefono: nuevoTelefono,
        nivel: nuevoNivel
    });
    
    if (resultado.success) {
        showToast(`✅ Alumno ${nuevoNombre} ${nuevoApellido} actualizado correctamente`, "success");
        cerrarModalEditar();
        await cargarListaAlumnosConfig();
        await actualizarDashboard();
    } else {
        showToast(resultado.error || "Error al actualizar", "error");
    }
}

async function eliminarAlumnoDesdeGestion(id) {
    const alumno = getAlumnoPorId(id);
    if (!alumno) return;
    
    const turnosData = getTurnos();
    const turnosAlumno = turnosData.filter(t => t.alumno_id === id);
    
    let mensaje = `⚠️ ¿Estás seguro de eliminar a ${alumno.nombre} ${alumno.apellido}?`;
    
    if (turnosAlumno.length > 0) {
        mensaje += `\n\n📊 Este alumno tiene ${turnosAlumno.length} turno${turnosAlumno.length !== 1 ? 's' : ''} reservado${turnosAlumno.length !== 1 ? 's' : ''} que también se eliminarán.`;
    }
    
    if (confirm(mensaje)) {
        const result = eliminarAlumno(id);
        if (result.success) {
            showToast(`✅ Alumno ${alumno.nombre} ${alumno.apellido} eliminado correctamente`, "success");
            await cargarListaAlumnosConfig();
            await actualizarDashboard();
        } else {
            showToast(result.error || "❌ Error al eliminar alumno", "error");
        }
    }
}

const formEditar = document.getElementById("formEditarAlumno");
if (formEditar) {
    formEditar.onsubmit = guardarEdicionAlumno;
}