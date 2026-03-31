// ========= CONFIGURACIÓN DEL ADMIN =========

// Constantes (declaradas UNA sola vez)
export const FONDOS_PREDEFINIDOS = [
    { nombre: "Fondo Claro", valor: "#f5f5f5" },
    { nombre: "Fondo Oscuro", valor: "#2c3e50" },
    { nombre: "Fondo Azul", valor: "#e3f2fd" },
    { nombre: "Fondo Verde", valor: "#e8f5e9" },
    { nombre: "Fondo Gris", valor: "#fafafa" }
];

// Función para cargar configuración en el formulario
export async function cargarConfiguracionEnFormulario() {
    console.log("📝 Cargando configuración en formulario...");
    
    try {
        // Importar dinámicamente para evitar ciclos
        const { cargarConfiguracion } = await import('../conexion.js');
        const config = await cargarConfiguracion();
        
        // Buscar campos en el formulario
        const diasInput = document.getElementById('diasAsistencia');
        const feriadosInput = document.getElementById('feriados');
        const fondoSelect = document.getElementById('fondoPantalla');
        
        if (diasInput) {
            diasInput.value = config.diasAsistencia?.join(', ') || 'Lunes, Martes, Miércoles, Jueves, Viernes';
        }
        
        if (feriadosInput) {
            feriadosInput.value = config.feriados?.join(', ') || '';
        }
        
        // Cargar fondos predefinidos en el select
        if (fondoSelect) {
            fondoSelect.innerHTML = '<option value="">Seleccionar fondo</option>';
            FONDOS_PREDEFINIDOS.forEach(fondo => {
                const option = document.createElement('option');
                option.value = fondo.valor;
                option.textContent = fondo.nombre;
                fondoSelect.appendChild(option);
            });
        }
        
        console.log("✅ Configuración cargada en el formulario:", config);
        return config;
        
    } catch (error) {
        console.error("❌ Error al cargar configuración:", error);
        return null;
    }
}

// Función para guardar configuración desde el formulario
export async function guardarConfiguracionDesdeFormulario() {
    try {
        const { guardarDiasAsistencia, guardarFeriados } = await import('../conexion.js');
        
        const diasInput = document.getElementById('diasAsistencia');
        const feriadosInput = document.getElementById('feriados');
        const fondoSelect = document.getElementById('fondoPantalla');
        
        const dias = diasInput?.value.split(',').map(d => d.trim()).filter(d => d) || [];
        const feriados = feriadosInput?.value.split(',').map(f => f.trim()).filter(f => f) || [];
        
        await guardarDiasAsistencia(dias);
        await guardarFeriados(feriados);
        
        // Aplicar fondo si se seleccionó
        if (fondoSelect && fondoSelect.value) {
            document.body.style.backgroundColor = fondoSelect.value;
            localStorage.setItem('fondoPantalla', fondoSelect.value);
        }
        
        console.log("✅ Configuración guardada correctamente");
        alert("✅ Configuración guardada correctamente");
        return true;
        
    } catch (error) {
        console.error("❌ Error al guardar configuración:", error);
        alert("❌ Error al guardar configuración");
        return false;
    }
}

// Función para cargar fondo guardado
export function cargarFondoGuardado() {
    const fondoGuardado = localStorage.getItem('fondoPantalla');
    if (fondoGuardado) {
        document.body.style.backgroundColor = fondoGuardado;
    }
}

console.log("✅ admin-config.js cargado correctamente");