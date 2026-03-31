// =======================
// CURSOS - PÁGINA DE CURSOS Y TALLERES
// =======================

let cursos = [];
let busquedaActual = "";

function cargarCursos() {
    const container = document.getElementById("listaCursos");
    container.innerHTML = `
        <div class="loading">
            <span>📂</span>
            <p>Cargando cursos...</p>
        </div>
    `;
    
    try {
        cursos = getCursos();
        renderCursos();
    } catch (error) {
        console.error('Error al cargar cursos:', error);
        container.innerHTML = `
            <div class="cursos-empty">
                <span>⚠️</span>
                <p>Error al cargar los cursos</p>
                <small>Verifica tu conexión a internet</small>
            </div>
        `;
    }
}

function renderCursos() {
    const container = document.getElementById("listaCursos");
    
    let filtrados = cursos;
    
    if (busquedaActual) {
        const busqueda = busquedaActual.toLowerCase();
        filtrados = filtrados.filter(c => 
            c.titulo.toLowerCase().includes(busqueda) ||
            (c.descripcion && c.descripcion.toLowerCase().includes(busqueda))
        );
    }
    
    filtrados.sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida));
    
    if (filtrados.length === 0) {
        container.innerHTML = `
            <div class="cursos-empty">
                <span>📭</span>
                <p>No hay cursos disponibles</p>
                <small>Los cursos aparecerán aquí cuando el administrador los suba</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filtrados.map(curso => {
        const fecha = new Date(curso.fechaSubida).toLocaleDateString('es-ES');
        const tamano = formatTamano(curso.tamano);
        const icono = getIconoPorTipo(curso.tipo);
        
        return `
            <div class="curso-card" data-id="${curso.id}">
                <div class="curso-icono">${icono}</div>
                <div class="curso-titulo">${escapeHtml(curso.titulo)}</div>
                ${curso.descripcion ? `<div class="curso-descripcion">${escapeHtml(curso.descripcion)}</div>` : ''}
                <div class="curso-info">
                    <span class="curso-tipo">${curso.tipo}</span>
                    <span class="curso-fecha">📅 ${fecha}</span>
                </div>
                <div class="curso-tamano">💾 ${tamano}</div>
                <button onclick="descargarCurso(${curso.id})" class="btn-descargar">⬇️ Descargar</button>
            </div>
        `;
    }).join('');
}

function descargarCurso(id) {
    const curso = cursos.find(c => c.id === id);
    if (!curso) return;
    
    const link = document.createElement('a');
    link.href = curso.data;
    link.download = curso.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`📄 Descargando: ${curso.titulo}`, "success");
}

function formatTamano(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getIconoPorTipo(tipo) {
    const iconos = {
        'PDF': '📄',
        'DOC': '📝',
        'DOCX': '📝',
        'JPG': '🖼️',
        'JPEG': '🖼️',
        'PNG': '🖼️',
        'GIF': '🖼️',
        'ZIP': '📦'
    };
    return iconos[tipo] || '📁';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
    cargarCursos();
    
    const buscarInput = document.getElementById("buscarCurso");
    if (buscarInput) {
        buscarInput.addEventListener("input", (e) => {
            busquedaActual = e.target.value;
            renderCursos();
        });
    }
});