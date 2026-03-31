// =======================
// ARCHIVOS - PÁGINA DE MATERIALES
// =======================

let archivos = [];
let categoriaActual = "todos";
let busquedaActual = "";

function cargarArchivos() {
    const container = document.getElementById("listaArchivos");
    container.innerHTML = `
        <div class="loading">
            <span>📂</span>
            <p>Cargando materiales...</p>
        </div>
    `;
    
    try {
        archivos = getArchivos();
        renderArchivos();
    } catch (error) {
        console.error('Error al cargar archivos:', error);
        container.innerHTML = `
            <div class="archivos-empty">
                <span>⚠️</span>
                <p>Error al cargar los materiales</p>
                <small>Verifica tu conexión a internet</small>
            </div>
        `;
    }
}

function renderArchivos() {
    const container = document.getElementById("listaArchivos");
    
    let filtrados = archivos;
    
    if (categoriaActual !== "todos") {
        filtrados = filtrados.filter(a => a.tipo === categoriaActual);
    }
    
    if (busquedaActual) {
        const busqueda = busquedaActual.toLowerCase();
        filtrados = filtrados.filter(a => 
            a.nombre.toLowerCase().includes(busqueda) ||
            (a.descripcion && a.descripcion.toLowerCase().includes(busqueda))
        );
    }
    
    if (filtrados.length === 0) {
        container.innerHTML = `
            <div class="archivos-empty">
                <span>📭</span>
                <p>No hay materiales disponibles</p>
                <small>Los documentos aparecerán aquí cuando el administrador los suba</small>
            </div>
        `;
        return;
    }
    
    filtrados.sort((a, b) => new Date(b.fechaSubida) - new Date(a.fechaSubida));
    
    container.innerHTML = filtrados.map(archivo => {
        const fecha = new Date(archivo.fechaSubida).toLocaleDateString('es-ES');
        const tamano = formatTamano(archivo.tamano);
        const icono = getIconoPorTipo(archivo.tipo);
        
        return `
            <div class="archivo-card" data-id="${archivo.id}">
                <div class="archivo-icono">${icono}</div>
                <div class="archivo-nombre">${escapeHtml(archivo.nombre)}</div>
                ${archivo.descripcion ? `<div class="archivo-descripcion">${escapeHtml(archivo.descripcion)}</div>` : ''}
                <div class="archivo-info">
                    <span class="archivo-tipo">${archivo.tipo}</span>
                    <span class="archivo-fecha">📅 ${fecha}</span>
                </div>
                <div class="archivo-tamano">💾 ${tamano}</div>
                <button onclick="descargarArchivo(${archivo.id})" class="btn-descargar">⬇️ Descargar</button>
            </div>
        `;
    }).join('');
}

function descargarArchivo(id) {
    const archivo = archivos.find(a => a.id === id);
    if (!archivo) return;
    
    const link = document.createElement('a');
    link.href = archivo.data;
    link.download = archivo.nombre;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast(`📄 Descargando: ${archivo.nombre}`, "success");
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
        'SVG': '🎨',
        'XLS': '📊',
        'XLSX': '📊',
        'ZIP': '📦',
        'RAR': '📦',
        'MP4': '🎬',
        'MP3': '🎵'
    };
    return iconos[tipo] || '📁';
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.addEventListener("DOMContentLoaded", () => {
    cargarArchivos();
    
    const categoriaBtns = document.querySelectorAll(".categoria-btn");
    categoriaBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            categoriaBtns.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            categoriaActual = btn.dataset.categoria;
            renderArchivos();
        });
    });
    
    const buscarInput = document.getElementById("buscarArchivo");
    if (buscarInput) {
        buscarInput.addEventListener("input", (e) => {
            busquedaActual = e.target.value;
            renderArchivos();
        });
    }
});