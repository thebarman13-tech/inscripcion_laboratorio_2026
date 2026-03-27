// =======================
// ADMIN - ARCHIVOS (MATERIALES)
// =======================

function cargarArchivosAdmin() {
    archivosAdmin = getArchivos();
    renderArchivosAdmin();
}

function renderArchivosAdmin() {
    const container = document.getElementById("listaArchivosAdmin");
    if (!container) return;
    
    if (archivosAdmin.length === 0) {
        container.innerHTML = `
            <div class="turnos-empty">
                <span>📭</span>
                <p>No hay archivos subidos</p>
                <small>Sube documentos para que los alumnos puedan verlos</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = archivosAdmin.map(archivo => {
        const fecha = new Date(archivo.fechaSubida).toLocaleDateString('es-ES');
        const tamano = formatTamanoArchivo(archivo.tamano);
        
        return `
            <div class="archivo-admin-item" data-id="${archivo.id}">
                <div class="archivo-admin-info">
                    <div class="archivo-admin-nombre">
                        📄 ${escapeHtml(archivo.nombre)}
                        <span class="archivo-tipo">${archivo.tipo}</span>
                    </div>
                    ${archivo.descripcion ? `<div class="archivo-admin-desc">${escapeHtml(archivo.descripcion)}</div>` : ''}
                    <div class="archivo-admin-meta">
                        📅 ${fecha} · 💾 ${tamano}
                    </div>
                </div>
                <button onclick="eliminarArchivo(${archivo.id})" class="btn-eliminar-archivo">🗑️ Eliminar</button>
            </div>
        `;
    }).join("");
}

function subirArchivo() {
    const fileInput = document.getElementById("archivoSubir");
    const nombreInput = document.getElementById("archivoNombre");
    const descripcionInput = document.getElementById("archivoDescripcion");
    
    const file = fileInput?.files[0];
    const nombre = nombreInput?.value.trim();
    const descripcion = descripcionInput?.value.trim();
    
    if (!file) {
        showToast("❌ Selecciona un archivo", "error");
        return;
    }
    
    if (!nombre) {
        showToast("❌ Ingresa un nombre para el archivo", "error");
        return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
        showToast("❌ El archivo no puede superar los 5MB", "error");
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const archivo = {
            id: Date.now(),
            nombre: nombre,
            descripcion: descripcion,
            data: e.target.result,
            tipo: file.name.split('.').pop().toUpperCase(),
            tamano: file.size,
            fechaSubida: new Date().toISOString()
        };
        
        const result = crearArchivo(archivo);
        if (result.success) {
            showToast(`✅ Archivo "${nombre}" subido correctamente`, "success");
            if (fileInput) fileInput.value = "";
            if (nombreInput) nombreInput.value = "";
            if (descripcionInput) descripcionInput.value = "";
            renderArchivosAdmin();
        } else {
            showToast(result.error || "Error al subir archivo", "error");
        }
    };
    reader.readAsDataURL(file);
}

function eliminarArchivo(id) {
    if (confirm("¿Estás seguro de eliminar este archivo?")) {
        const result = eliminarArchivo(id);
        if (result.success) {
            renderArchivosAdmin();
            showToast("✅ Archivo eliminado correctamente", "success");
        } else {
            showToast(result.error || "Error al eliminar archivo", "error");
        }
    }
}

function formatTamanoArchivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}