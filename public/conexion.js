// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    getDoc, 
    doc, 
    updateDoc, 
    deleteDoc,
    query, 
    where,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Tu configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyCBLKQHghXqZm2MbwTUkVmomdZinzA18MU",
    authDomain: "laboratorio-2026-843e9.firebaseapp.com",
    projectId: "laboratorio-2026-843e9",
    storageBucket: "laboratorio-2026-843e9.firebasestorage.app",
    messagingSenderId: "1006317189678",
    appId: "1:1006317189678:web:df03cc8a31a5548671fdbf"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("✅ Firebase conectado correctamente");

// ========= FUNCIONES PARA ALUMNOS =========

// Cargar todos los alumnos
export async function cargarAlumnos() {
    try {
        const alumnosRef = collection(db, "alumnos");
        const querySnapshot = await getDocs(alumnosRef);
        const alumnos = [];
        
        querySnapshot.forEach((doc) => {
            alumnos.push({
                id: doc.id,
                ...doc.data()
            });
        });
        
        console.log(`✅ Se cargaron ${alumnos.length} alumnos`);
        return alumnos;
    } catch (error) {
        console.error("❌ Error al cargar alumnos:", error);
        return [];
    }
}

// Registrar un nuevo alumno
export async function registrarAlumno(datosAlumno) {
    try {
        // Verificar si ya existe por email
        const emailExistente = await buscarAlumnoPorEmail(datosAlumno.email);
        if (emailExistente) {
            throw new Error("Ya existe un alumno con ese email");
        }
        
        // Crear nuevo alumno
        const alumno = {
            nombre: datosAlumno.nombre,
            apellido: datosAlumno.apellido,
            nombreCompleto: `${datosAlumno.nombre} ${datosAlumno.apellido}`,
            email: datosAlumno.email,
            telefono: datosAlumno.telefono,
            nivel: datosAlumno.nivel || "No especificado",
            fechaRegistro: new Date().toISOString(),
            activo: true
        };
        
        const docRef = await addDoc(collection(db, "alumnos"), alumno);
        console.log("✅ Alumno registrado con ID:", docRef.id);
        return { success: true, id: docRef.id };
        
    } catch (error) {
        console.error("❌ Error al registrar alumno:", error);
        return { success: false, error: error.message };
    }
}

// Buscar alumno por email
export async function buscarAlumnoPorEmail(email) {
    try {
        const q = query(collection(db, "alumnos"), where("email", "==", email));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }
        
        let alumno = null;
        querySnapshot.forEach(doc => {
            alumno = { id: doc.id, ...doc.data() };
        });
        return alumno;
        
    } catch (error) {
        console.error("❌ Error al buscar alumno:", error);
        return null;
    }
}

// ========= FUNCIONES PARA TURNOS =========

// Registrar un nuevo turno
export async function registrarTurno(datosTurno) {
    try {
        // Verificar que no haya turno en la misma fecha y hora
        const turnoExistente = await buscarTurnoPorFechaHora(datosTurno.fecha, datosTurno.hora);
        if (turnoExistente) {
            throw new Error("Ya existe un turno en esa fecha y hora");
        }
        
        const turno = {
            fecha: datosTurno.fecha,
            hora: datosTurno.hora,
            laboratorio: datosTurno.laboratorio || "Laboratorio 1",
            cuposTotales: datosTurno.cuposTotales || 10,
            cuposDisponibles: datosTurno.cuposTotales || 10,
            alumnosAsignados: [],
            estado: "activo",
            fechaCreacion: new Date().toISOString()
        };
        
        const docRef = await addDoc(collection(db, "turnos"), turno);
        console.log("✅ Turno registrado con ID:", docRef.id);
        return { success: true, id: docRef.id };
        
    } catch (error) {
        console.error("❌ Error al registrar turno:", error);
        return { success: false, error: error.message };
    }
}

// Buscar turno por fecha y hora
export async function buscarTurnoPorFechaHora(fecha, hora) {
    try {
        const q = query(
            collection(db, "turnos"), 
            where("fecha", "==", fecha),
            where("hora", "==", hora)
        );
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
            return null;
        }
        
        let turno = null;
        querySnapshot.forEach(doc => {
            turno = { id: doc.id, ...doc.data() };
        });
        return turno;
        
    } catch (error) {
        console.error("❌ Error al buscar turno:", error);
        return null;
    }
}

// Obtener todos los turnos
export async function obtenerTurnos() {
    try {
        const turnosRef = collection(db, "turnos");
        const q = query(turnosRef, orderBy("fecha", "asc"));
        const querySnapshot = await getDocs(q);
        const turnos = [];
        
        querySnapshot.forEach(doc => {
            turnos.push({ id: doc.id, ...doc.data() });
        });
        
        console.log(`✅ Se cargaron ${turnos.length} turnos`);
        return turnos;
        
    } catch (error) {
        console.error("❌ Error al obtener turnos:", error);
        return [];
    }
}

// Asignar un alumno a un turno
export async function asignarAlumnoATurno(turnoId, alumnoId) {
    try {
        const turnoRef = doc(db, "turnos", turnoId);
        const turnoDoc = await getDoc(turnoRef);
        
        if (!turnoDoc.exists()) {
            throw new Error("El turno no existe");
        }
        
        const turno = turnoDoc.data();
        
        if (turno.cuposDisponibles <= 0) {
            throw new Error("No hay cupos disponibles");
        }
        
        if (turno.alumnosAsignados && turno.alumnosAsignados.includes(alumnoId)) {
            throw new Error("El alumno ya está asignado a este turno");
        }
        
        await updateDoc(turnoRef, {
            cuposDisponibles: turno.cuposDisponibles - 1,
            alumnosAsignados: [...(turno.alumnosAsignados || []), alumnoId]
        });
        
        console.log("✅ Alumno asignado al turno");
        return { success: true };
        
    } catch (error) {
        console.error("❌ Error al asignar turno:", error);
        return { success: false, error: error.message };
    }
}

// Exportar db
export { db };