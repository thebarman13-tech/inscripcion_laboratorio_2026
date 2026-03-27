// =======================
// ADMIN - CURSOS
// =======================

function cargarCursosAdmin() {
    cursosAdmin = getCursos();
    renderCursosAdmin();
}

function renderCursosAdmin() {
    const container = document.getElementById("listaCursosAdmin");
    if (!container) return;
    
    if (cursosAdmin.length === 0) {
        container.innerHTML = `
            <div class="turnos-empty">
                <span>📭</span>
                <p>No hay cursos subidos</p>
                <small>Sube cursos para que los alumnos puedan verlos</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = cursosAdmin.map(curso => {
        const fecha = new Date(curso.fechaSubida).toLocaleDateString('es-ES');
        const tamano = formatTamanoArchivo(curso.tamano);
        
        return `
            <div class="curso-admin-item" data-id="${curso.id}">
                <div class="curso-admin-info">
                    <div class="curso-admin-titulo">
                        📄 ${escapeHtml(curso.titulo)}
                        <span class="curso-tipo">${curso.tipo}</span>
                    </div>
                    ${curso.descripcion ? `<div class="curso-admin-desc">${escapeHtml(curso.descripcion)}</div>` : ''}
                    <div class="curso-admin-meta">
                        📅 ${fecha} · 💾 ${tamano}
                    </div>
                </div>
                <button onclick="eliminarCurso(${curso.id})" class="btn-eliminar-curso">🗑️ Eliminar</button>
            </div>
        `;
    }).join("");
}

function subirCurso() {
    const fileInput = document.getElementById("cursoSubir");
    const tituloInput = document.getElementById("cursoTitulo");
    const descripcionInput = document.getElementById("cursoDescripcion");
    
    const file = fileInput?.files[0];
    const titulo = tituloInput?.value.trim();
    const descripcion = descripcionInput?.value.trim();
    
    if (!file) {
        showToast("❌ Selecciona un archivo", "error");
        return;
    }
    
    if (!titulo) {
        showToast("❌ Ingresa un título para el curso", "error");
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast("❌ El archivo no puede superar los 5MB", "error");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const curso = {
            id: Date.now(),
            titulo: titulo,
            descripcion: descripcion,
            data: e.target.result,
            tipo: file.name.split('.').pop().toUpperCase(),
            nombre: file.name,
            tamano: file.size,
            fechaSubida: new Date().toISOString()
        };
        
        const result = crearCurso(curso);
        if (result.success) {
            showToast(`✅ Curso "${titulo}" subido correctamente`, "success");
            if (fileInput) fileInput.value = "";
            if (tituloInput) tituloInput.value = "";
            if (descripcionInput) descripcionInput.value = "";
            renderCursosAdmin();
        } else {
            showToast(result.error || "Error al subir curso", "error");
        }
    };
    reader.readAsDataURL(file);
}

function eliminarCurso(id) {
    if (confirm("¿Estás seguro de eliminar este curso?")) {
        const result = eliminarCurso(id);
        if (result.success) {
            renderCursosAdmin();
            showToast("✅ Curso eliminado correctamente", "success");
        } else {
            showToast(result.error || "Error al eliminar curso", "error");
        }
    }
}