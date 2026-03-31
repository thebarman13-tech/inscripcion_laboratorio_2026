// =======================
// CONEXIÓN CON LA API DE RENDER
// =======================

// ⚠️ REEMPLAZA CON LA URL DE TU API EN RENDER ⚠️
const API_URL = "https://tu-api.onrender.com/api";

// =======================
// ALUMNOS
// =======================

async function getAlumnos() {
    try {
        const res = await fetch(`${API_URL}/alumnos`);
        const data = await res.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Error:", error);
        showToast("Error al conectar con el servidor", "error");
        return [];
    }
}

async function getAlumnoPorTelefono(telefono) {
    try {
        const res = await fetch(`${API_URL}/alumnos/telefono/${telefono}`);
        const data = await res.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function crearAlumno(alumno) {
    try {
        const res = await fetch(`${API_URL}/alumnos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumno)
        });
        return await res.json();
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: error.message };
    }
}

async function actualizarAlumno(id, alumno) {
    try {
        const res = await fetch(`${API_URL}/alumnos/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(alumno)
        });
        return await res.json();
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: error.message };
    }
}

async function eliminarAlumno(id) {
    try {
        const res = await fetch(`${API_URL}/alumnos/${id}`, {
            method: "DELETE"
        });
        return await res.json();
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: error.message };
    }
}

// =======================
// TURNOS
// =======================

async function getTurnos() {
    try {
        const res = await fetch(`${API_URL}/turnos`);
        const data = await res.json();
        return data.success ? data.data : [];
    } catch (error) {
        console.error("Error:", error);
        return [];
    }
}

async function crearTurno(turno) {
    try {
        const res = await fetch(`${API_URL}/turnos`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(turno)
        });
        return await res.json();
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: error.message };
    }
}

async function eliminarTurno(id) {
    try {
        const res = await fetch(`${API_URL}/turnos/${id}`, {
            method: "DELETE"
        });
        return await res.json();
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: error.message };
    }
}

// =======================
// CONFIGURACIÓN
// =======================

async function getConfiguracion() {
    try {
        const res = await fetch(`${API_URL}/config`);
        const data = await res.json();
        return data.success ? data.data : null;
    } catch (error) {
        console.error("Error:", error);
        return null;
    }
}

async function actualizarConfiguracion(config) {
    try {
        const res = await fetch(`${API_URL}/config`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(config)
        });
        return await res.json();
    } catch (error) {
        console.error("Error:", error);
        return { success: false, error: error.message };
    }
}