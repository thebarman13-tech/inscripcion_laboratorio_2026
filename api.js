// ========== API PÚBLICA ==========
// Este archivo expone endpoints para consultar datos desde aplicaciones externas
// Ejemplo de uso: https://laboratorio-2026.web.app/api.js?endpoint=turnos

import { db } from './js/conexion.js';
import { collection, getDocs, query, where, orderBy, limit } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Configuración CORS para permitir acceso externo
const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
};

// Función para enviar respuesta JSON
function sendResponse(data, status = 200) {
    return new Response(JSON.stringify(data), { status, headers });
}

// ========== ENDPOINTS DISPONIBLES ==========

// 1. Obtener todos los turnos disponibles
async function getTurnosDisponibles() {
    try {
        const turnosRef = collection(db, "turnos");
        const q = query(turnosRef, where("cuposDisponibles", ">", 0), orderBy("fecha", "asc"));
        const snapshot = await getDocs(q);
        const turnos = [];
        snapshot.forEach(doc => turnos.push({ id: doc.id, ...doc.data() }));
        return sendResponse({ success: true, data: turnos });
    } catch (error) {
        return sendResponse({ success: false, error: error.message }, 500);
    }
}

// 2. Obtener todos los cursos activos
async function getCursosActivos() {
    try {
        const cursosRef = collection(db, "cursos");
        const q = query(cursosRef, where("estado", "==", "activo"));
        const snapshot = await getDocs(q);
        const cursos = [];
        snapshot.forEach(doc => cursos.push({ id: doc.id, ...doc.data() }));
        return sendResponse({ success: true, data: cursos });
    } catch (error) {
        return sendResponse({ success: false, error: error.message }, 500);
    }
}

// 3. Obtener materiales por nivel
async function getMaterialesPorNivel(nivel) {
    try {
        const materialesRef = collection(db, "materiales");
        const q = query(materialesRef, where("nivel", "==", nivel));
        const snapshot = await getDocs(q);
        const materiales = [];
        snapshot.forEach(doc => materiales.push({ id: doc.id, ...doc.data() }));
        return sendResponse({ success: true, data: materiales });
    } catch (error) {
        return sendResponse({ success: false, error: error.message }, 500);
    }
}

// 4. Obtener estadísticas generales
async function getEstadisticas() {
    try {
        const alumnosSnap = await getDocs(collection(db, "alumnos"));
        const reservasSnap = await getDocs(collection(db, "reservas"));
        const cursosSnap = await getDocs(collection(db, "cursos"));
        const materialesSnap = await getDocs(collection(db, "materiales"));
        
        return sendResponse({
            success: true,
            data: {
                totalAlumnos: alumnosSnap.size,
                totalReservas: reservasSnap.size,
                totalCursos: cursosSnap.size,
                totalMateriales: materialesSnap.size
            }
        });
    } catch (error) {
        return sendResponse({ success: false, error: error.message }, 500);
    }
}

// 5. Buscar alumno por teléfono
async function buscarAlumno(telefono) {
    try {
        const alumnosRef = collection(db, "alumnos");
        const q = query(alumnosRef, where("telefono", "==", telefono));
        const snapshot = await getDocs(q);
        if (snapshot.empty) {
            return sendResponse({ success: false, error: "Alumno no encontrado" }, 404);
        }
        let alumno = null;
        snapshot.forEach(doc => alumno = { id: doc.id, ...doc.data() });
        return sendResponse({ success: true, data: alumno });
    } catch (error) {
        return sendResponse({ success: false, error: error.message }, 500);
    }
}

// 6. Obtener próximos turnos (límite)
async function getProximosTurnos(limite = 5) {
    try {
        const turnosRef = collection(db, "turnos");
        const hoy = new Date().toISOString().split('T')[0];
        const q = query(turnosRef, where("fecha", ">=", hoy), orderBy("fecha", "asc"), limit(parseInt(limite)));
        const snapshot = await getDocs(q);
        const turnos = [];
        snapshot.forEach(doc => turnos.push({ id: doc.id, ...doc.data() }));
        return sendResponse({ success: true, data: turnos });
    } catch (error) {
        return sendResponse({ success: false, error: error.message }, 500);
    }
}

// 7. Obtener configuración general
async function getConfiguracion() {
    try {
        const configRef = doc(db, "configuracion", "general");
        const configSnap = await getDoc(configRef);
        if (configSnap.exists()) {
            const { logoBase64, ...config } = configSnap.data();
            return sendResponse({ success: true, data: config });
        }
        return sendResponse({ success: true, data: {} });
    } catch (error) {
        return sendResponse({ success: false, error: error.message }, 500);
    }
}

// ========== ROUTER ==========
async function handleRequest(request) {
    const url = new URL(request.url);
    const endpoint = url.searchParams.get('endpoint');
    const telefono = url.searchParams.get('telefono');
    const nivel = url.searchParams.get('nivel');
    const limite = url.searchParams.get('limite');
    
    switch (endpoint) {
        case 'turnos':
            return await getTurnosDisponibles();
        case 'cursos':
            return await getCursosActivos();
        case 'materiales':
            if (nivel) return await getMaterialesPorNivel(nivel);
            return sendResponse({ success: false, error: "Se requiere parámetro 'nivel'" }, 400);
        case 'estadisticas':
            return await getEstadisticas();
        case 'alumno':
            if (telefono) return await buscarAlumno(telefono);
            return sendResponse({ success: false, error: "Se requiere parámetro 'telefono'" }, 400);
        case 'proximos-turnos':
            return await getProximosTurnos(limite);
        case 'configuracion':
            return await getConfiguracion();
        default:
            return sendResponse({
                success: false,
                error: "Endpoint no válido",
                endpoints_disponibles: [
                    "?endpoint=turnos",
                    "?endpoint=cursos",
                    "?endpoint=materiales&nivel=inicial",
                    "?endpoint=estadisticas",
                    "?endpoint=alumno&telefono=3425551234",
                    "?endpoint=proximos-turnos&limite=5",
                    "?endpoint=configuracion"
                ]
            }, 404);
    }
}

// Exportar para uso en Service Worker
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);
    if (url.pathname.includes('/api.js')) {
        event.respondWith(handleRequest(event.request));
    }
});