// =======================
// ADMIN - CONFIGURACIÓN
// =======================

let CONFIG_LOCAL = null;

async function cargarConfiguracionEnFormulario() {
    const config = getConfiguracion();
    CONFIG_LOCAL = config;
    
    const checkboxes = document.querySelectorAll("#diasHabilesContainer input");
    if (checkboxes) {
        checkboxes.forEach(cb => {
            cb.checked = config.diasHabiles.includes(parseInt(cb.value));
        });
    }
    
    renderHorariosList(config.horarios);
    renderFeriadosList(config.feriados);
    
    const mensajeConfirmacion = document.getElementById("mensajeConfirmacion");
    if (mensajeConfirmacion) mensajeConfirmacion.value = config.mensajeConfirmacion;
    
    await cargarListaAlumnosConfig();
    cargarArchivosAdmin();
    cargarCursosAdmin();
    actualizarVistaPreviaLogo();
    
    const buscarInput = document.getElementById("buscarAlumnoConfig");
    if (buscarInput) {
        buscarInput.addEventListener("input", () => filtrarAlumnosConfig());
    }
    
    const iconInput = document.getElementById("logoIcon");
    const nameInput = document.getElementById("logoName");
    const sloganInput = document.getElementById("logoSlogan");
    
    const actualizarPreviewTexto = () => {
        const icon = iconInput?.value.trim() || "🔧";
        const name = nameInput?.value.trim() || "DRTECNO";
        const slogan = sloganInput?.value.trim() || "Laboratorio";
        
        const previewContainer = document.getElementById("logoPreview");
        if (previewContainer && logoConfig.type === "text") {
            previewContainer.innerHTML = `
                <div class="logo-text-preview">
                    <span>${icon} ${name}</span>
                    <small>${slogan}</small>
                </div>
            `;
        }
    };
    
    if (iconInput) iconInput.addEventListener("input", actualizarPreviewTexto);
    if (nameInput) nameInput.addEventListener("input", actualizarPreviewTexto);
    if (sloganInput) sloganInput.addEventListener("input", actualizarPreviewTexto);
}

function renderHorariosList(horarios) {
    const container = document.getElementById("horariosList");
    if (!container) return;
    
    container.innerHTML = horarios.map((horario, index) => `
        <div class="horario-item">
            <span class="horario-text">⏰ ${horario}</span>
            <button onclick="eliminarHorario(${index})" class="btn-eliminar-item">🗑️</button>
        </div>
    `).join("");
}

function renderFeriadosList(feriados) {
    const container = document.getElementById("feriadosList");
    if (!container) return;
    
    container.innerHTML = feriados.map((feriado, index) => {
        const fechaObj = new Date(feriado);
        const fechaFormateada = fechaObj.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
        return `
            <div class="feriado-item">
                <span class="feriado-text">📆 ${fechaFormateada} (${feriado})</span>
                <button onclick="eliminarFeriado(${index})" class="btn-eliminar-item">🗑️</button>
            </div>
        `;
    }).join("");
}

async function guardarDiasHabiles() {
    const checkboxes = document.querySelectorAll("#diasHabilesContainer input");
    const diasHabiles = Array.from(checkboxes)
        .filter(cb => cb.checked)
        .map(cb => parseInt(cb.value));
    
    CONFIG_LOCAL.diasHabiles = diasHabiles;
    const result = actualizarConfiguracion(CONFIG_LOCAL);
    if (result.success) {
        showToast("✅ Días hábiles guardados correctamente", "success");
    } else {
        showToast(result.error || "Error al guardar", "error");
    }
}

function agregarHorario() {
    const input = document.getElementById("nuevoHorario");
    const nuevoHorario = input?.value.trim();
    
    if (!nuevoHorario) {
        showToast("❌ Ingrese un horario válido", "error");
        return;
    }
    
    if (CONFIG_LOCAL.horarios.includes(nuevoHorario)) {
        showToast("❌ Este horario ya existe", "error");
        return;
    }
    
    CONFIG_LOCAL.horarios.push(nuevoHorario);
    renderHorariosList(CONFIG_LOCAL.horarios);
    if (input) input.value = "";
    showToast("✅ Horario agregado correctamente", "success");
}

function eliminarHorario(index) {
    if (CONFIG_LOCAL.horarios.length <= 1) {
        showToast("❌ Debe haber al menos un horario disponible", "error");
        return;
    }
    
    CONFIG_LOCAL.horarios.splice(index, 1);
    renderHorariosList(CONFIG_LOCAL.horarios);
    showToast("✅ Horario eliminado correctamente", "success");
}

async function guardarHorarios() {
    const result = actualizarConfiguracion(CONFIG_LOCAL);
    if (result.success) {
        showToast("✅ Horarios guardados correctamente", "success");
    } else {
        showToast(result.error || "Error al guardar", "error");
    }
}

function agregarFeriado() {
    const input = document.getElementById("nuevoFeriado");
    const nuevoFeriado = input?.value;
    
    if (!nuevoFeriado) {
        showToast("❌ Seleccione una fecha válida", "error");
        return;
    }
    
    if (CONFIG_LOCAL.feriados.includes(nuevoFeriado)) {
        showToast("❌ Esta fecha ya está en la lista de feriados", "error");
        return;
    }
    
    CONFIG_LOCAL.feriados.push(nuevoFeriado);
    CONFIG_LOCAL.feriados.sort();
    renderFeriadosList(CONFIG_LOCAL.feriados);
    if (input) input.value = "";
    showToast("✅ Feriado agregado correctamente", "success");
}

function eliminarFeriado(index) {
    CONFIG_LOCAL.feriados.splice(index, 1);
    renderFeriadosList(CONFIG_LOCAL.feriados);
    showToast("✅ Feriado eliminado correctamente", "success");
}

async function guardarFeriados() {
    const result = actualizarConfiguracion(CONFIG_LOCAL);
    if (result.success) {
        showToast("✅ Feriados guardados correctamente", "success");
    } else {
        showToast(result.error || "Error al guardar", "error");
    }
}

async function guardarMensaje() {
    const textarea = document.getElementById("mensajeConfirmacion");
    CONFIG_LOCAL.mensajeConfirmacion = textarea?.value;
    const result = actualizarConfiguracion(CONFIG_LOCAL);
    if (result.success) {
        showToast("✅ Mensaje de confirmación guardado correctamente", "success");
    } else {
        showToast(result.error || "Error al guardar", "error");
    }
}

async function resetearConfiguracion() {
    if (confirm("¿Estás seguro de restablecer la configuración predeterminada? Se perderán todos los cambios personalizados.")) {
        const configDefault = {
            diasHabiles: [2, 3, 4],
            horarios: ["12:00 a 14:00", "14:00 a 16:00", "16:00 a 18:00"],
            feriados: ["2026-01-01", "2026-03-24", "2026-04-02", "2026-05-01", "2026-07-09", "2026-12-25"],
            mensajeConfirmacion: `✅ Turno confirmado!\n\n⚠️ Recordar:\n• Traer herramientas personales (pinzas, destornilladores, flux, estaño, alcohol, etc).\n• Respetar los códigos de convivencia del Laboratorio (mantener el orden y limpieza del puesto de trabajo).\n• Respetar el horario elegido ya que luego ingresa otro alumno.\n• De no poder asistir avisar con anticipación para poder liberar el turno y que otro alumno pueda ocuparlo.`
        };
        
        const result = actualizarConfiguracion(configDefault);
        if (result.success) {
            CONFIG_LOCAL = configDefault;
            restablecerLogo();
            localStorage.setItem("cursos_laboratorio", JSON.stringify([]));
            localStorage.setItem("archivos_laboratorio", JSON.stringify([]));
            await cargarConfiguracionEnFormulario();
            showToast("✅ Configuración restablecida a valores predeterminados", "success");
        } else {
            showToast(result.error || "Error al restablecer", "error");
        }
    }
}

// =======================
// CONFIGURACIÓN DE FONDO
// =======================

// Fondos predefinidos
const FONDOS_PREDEFINIDOS = [
  { nombre: "Abstracto 1", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600&h=900&fit=crop" },
  { nombre: "Abstracto 2", url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1600&h=900&fit=crop" },
  { nombre: "Tecnología", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop" },
  { nombre: "Laboratorio", url: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1600&h=900&fit=crop" },
  { nombre: "Circuitos", url: "https://images.unsplash.com/photo-1581092335871-4e5c7b3c5a5a?w=1600&h=900&fit=crop" },
  { nombre: "Minimalista", url: "https://images.unsplash.com/photo-1557682260-96773eb01377?w=1600&h=900&fit=crop" }
];

function cargarFondoConfig() {
  const fondoGuardado = localStorage.getItem("fondo_config");
  if (fondoGuardado) {
    const fondo = JSON.parse(fondoGuardado);
    aplicarFondo(fondo);
    actualizarVistaPreviaFondo(fondo);
  } else {
    actualizarVistaPreviaFondo(null);
  }
  renderFondosPredefinidos();
}

function renderFondosPredefinidos() {
  const container = document.getElementById("fondosPredefinidos");
  if (!container) return;
  
  const fondoActual = localStorage.getItem("fondo_config");
  let fondoActualUrl = null;
  if (fondoActual) {
    fondoActualUrl = JSON.parse(fondoActual).url;
  }
  
  container.innerHTML = FONDOS_PREDEFINIDOS.map(fondo => `
    <div class="predefinido-item ${fondoActualUrl === fondo.url ? 'active' : ''}" onclick="seleccionarFondoPredefinido('${fondo.url}', '${fondo.nombre}')">
      <div class="predefinido-imagen" style="background-image: url('${fondo.url}'); background-size: cover; background-position: center;"></div>
      <div class="predefinido-nombre">${fondo.nombre}</div>
    </div>
  `).join("");
}

function aplicarFondo(fondo) {
  if (!fondo || !fondo.url) {
    document.body.style.background = "";
    document.body.style.backgroundImage = "";
    return;
  }
  
  document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${fondo.url}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundRepeat = "no-repeat";
}

function actualizarVistaPreviaFondo(fondo) {
  const preview = document.getElementById("fondoPreview");
  if (!preview) return;
  
  if (!fondo || !fondo.url) {
    preview.className = "fondo-preview sin-fondo";
    preview.innerHTML = "<span>📷 Sin imagen de fondo</span>";
    preview.style.backgroundImage = "";
    return;
  }
  
  preview.className = "fondo-preview";
  preview.innerHTML = "";
  preview.style.backgroundImage = `url('${fondo.url}')`;
  preview.style.backgroundSize = "cover";
  preview.style.backgroundPosition = "center";
}

function subirFondo() {
  const fileInput = document.getElementById("fondoUpload");
  const file = fileInput?.files[0];
  
  if (!file) {
    showToast("❌ Selecciona una imagen primero", "error");
    return;
  }
  
  if (file.size > 2 * 1024 * 1024) {
    showToast("❌ La imagen no puede superar los 2MB", "error");
    return;
  }
  
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
  if (!tiposPermitidos.includes(file.type)) {
    showToast("❌ Formato no permitido. Usa JPG, PNG o WEBP", "error");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const fondo = {
      type: "custom",
      url: e.target.result,
      nombre: file.name
    };
    
    localStorage.setItem("fondo_config", JSON.stringify(fondo));
    aplicarFondo(fondo);
    actualizarVistaPreviaFondo(fondo);
    renderFondosPredefinidos();
    showToast("✅ Imagen de fondo actualizada correctamente", "success");
  };
  reader.readAsDataURL(file);
}

function seleccionarFondoPredefinido(url, nombre) {
  const fondo = {
    type: "predefinido",
    url: url,
    nombre: nombre
  };
  
  localStorage.setItem("fondo_config", JSON.stringify(fondo));
  aplicarFondo(fondo);
  actualizarVistaPreviaFondo(fondo);
  renderFondosPredefinidos();
  showToast(`✅ Fondo "${nombre}" aplicado correctamente`, "success");
}

function restablecerFondo() {
  localStorage.removeItem("fondo_config");
  aplicarFondo(null);
  actualizarVistaPreviaFondo(null);
  renderFondosPredefinidos();
  showToast("✅ Fondo restablecido a valores predeterminados", "success");
}

// =======================
// INICIALIZAR FONDO AL CARGAR LA PÁGINA
// =======================

// Llamar a cargarFondoConfig cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  cargarFondoConfig();
});

// =======================
// CONFIGURACIÓN DE FONDO
// =======================

// Fondos predefinidos
const FONDOS_PREDEFINIDOS = [
  { nombre: "Abstracto 1", url: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?w=1600&h=900&fit=crop" },
  { nombre: "Abstracto 2", url: "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=1600&h=900&fit=crop" },
  { nombre: "Tecnología", url: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&h=900&fit=crop" },
  { nombre: "Laboratorio", url: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?w=1600&h=900&fit=crop" },
  { nombre: "Circuitos", url: "https://images.unsplash.com/photo-1581092335871-4e5c7b3c5a5a?w=1600&h=900&fit=crop" },
  { nombre: "Minimalista", url: "https://images.unsplash.com/photo-1557682260-96773eb01377?w=1600&h=900&fit=crop" }
];

function cargarFondoConfig() {
  const fondoGuardado = localStorage.getItem("fondo_config");
  if (fondoGuardado) {
    const fondo = JSON.parse(fondoGuardado);
    aplicarFondo(fondo);
    actualizarVistaPreviaFondo(fondo);
  } else {
    actualizarVistaPreviaFondo(null);
  }
  renderFondosPredefinidos();
}

function renderFondosPredefinidos() {
  const container = document.getElementById("fondosPredefinidos");
  if (!container) return;
  
  const fondoActual = localStorage.getItem("fondo_config");
  let fondoActualUrl = null;
  if (fondoActual) {
    fondoActualUrl = JSON.parse(fondoActual).url;
  }
  
  container.innerHTML = FONDOS_PREDEFINIDOS.map(fondo => `
    <div class="predefinido-item ${fondoActualUrl === fondo.url ? 'active' : ''}" onclick="seleccionarFondoPredefinido('${fondo.url}', '${fondo.nombre}')">
      <div class="predefinido-imagen" style="background-image: url('${fondo.url}'); background-size: cover; background-position: center;"></div>
      <div class="predefinido-nombre">${fondo.nombre}</div>
    </div>
  `).join("");
}

function aplicarFondo(fondo) {
  if (!fondo || !fondo.url) {
    document.body.style.background = "";
    document.body.style.backgroundImage = "";
    return;
  }
  
  document.body.style.background = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('${fondo.url}')`;
  document.body.style.backgroundSize = "cover";
  document.body.style.backgroundPosition = "center";
  document.body.style.backgroundAttachment = "fixed";
  document.body.style.backgroundRepeat = "no-repeat";
}

function actualizarVistaPreviaFondo(fondo) {
  const preview = document.getElementById("fondoPreview");
  if (!preview) return;
  
  if (!fondo || !fondo.url) {
    preview.className = "fondo-preview sin-fondo";
    preview.innerHTML = "<span>📷 Sin imagen de fondo</span>";
    preview.style.backgroundImage = "";
    return;
  }
  
  preview.className = "fondo-preview";
  preview.innerHTML = "";
  preview.style.backgroundImage = `url('${fondo.url}')`;
  preview.style.backgroundSize = "cover";
  preview.style.backgroundPosition = "center";
}

function subirFondo() {
  const fileInput = document.getElementById("fondoUpload");
  const file = fileInput?.files[0];
  
  if (!file) {
    showToast("❌ Selecciona una imagen primero", "error");
    return;
  }
  
  if (file.size > 2 * 1024 * 1024) {
    showToast("❌ La imagen no puede superar los 2MB", "error");
    return;
  }
  
  const tiposPermitidos = ["image/jpeg", "image/png", "image/webp"];
  if (!tiposPermitidos.includes(file.type)) {
    showToast("❌ Formato no permitido. Usa JPG, PNG o WEBP", "error");
    return;
  }
  
  const reader = new FileReader();
  reader.onload = function(e) {
    const fondo = {
      type: "custom",
      url: e.target.result,
      nombre: file.name
    };
    
    localStorage.setItem("fondo_config", JSON.stringify(fondo));
    aplicarFondo(fondo);
    actualizarVistaPreviaFondo(fondo);
    renderFondosPredefinidos();
    showToast("✅ Imagen de fondo actualizada correctamente", "success");
  };
  reader.readAsDataURL(file);
}

function seleccionarFondoPredefinido(url, nombre) {
  const fondo = {
    type: "predefinido",
    url: url,
    nombre: nombre
  };
  
  localStorage.setItem("fondo_config", JSON.stringify(fondo));
  aplicarFondo(fondo);
  actualizarVistaPreviaFondo(fondo);
  renderFondosPredefinidos();
  showToast(`✅ Fondo "${nombre}" aplicado correctamente`, "success");
}

function restablecerFondo() {
  localStorage.removeItem("fondo_config");
  aplicarFondo(null);
  actualizarVistaPreviaFondo(null);
  renderFondosPredefinidos();
  showToast("✅ Fondo restablecido a valores predeterminados", "success");
}

// Llamar a cargarFondoConfig cuando se carga la página
document.addEventListener("DOMContentLoaded", () => {
  cargarFondoConfig();
});