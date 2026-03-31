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
    orderBy,
    setDoc
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Importar Storage para subida de archivos
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-storage.js";

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
const storage = getStorage(app);

console.log("✅ Firebase conectado correctamente");

// ========== FUNCIONES PARA ALUMNOS ==========

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

// Registrar un nuevo alumno (sin email)
export async function registrarAlumno(datosAlumno) {
    try {
        // Verificar si ya existe por teléfono
        const telefonoExistente = await buscarAlumnoPorTelefono(datosAlumno.telefono);
        if (telefonoExistente) {
            throw new Error("Ya existe un alumno con ese teléfono");
        }
        
        // Crear nuevo alumno
        const alumno = {
            nombre: datosAlumno.nombre,
            apellido: datosAlumno.apellido,
            nombreCompleto: `${datosAlumno.nombre} ${datosAlumno.apellido}`,
            telefono: datosAlumno.telefono,
            nivel: datosAlumno.nivel || "No especificado",
            email: datosAlumno.email || "",
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

// Buscar alumno por teléfono
export async function buscarAlumnoPorTelefono(telefono) {
    try {
        const q = query(collection(db, "alumnos"), where("telefono", "==", telefono));
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

// Buscar alumno por ID
export async function buscarAlumnoPorId(id) {
    try {
        const docRef = doc(db, "alumnos", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() };
        }
        return null;
        
    } catch (error) {
        console.error("❌ Error al buscar alumno por ID:", error);
        return null;
    }
}

// Actualizar alumno
export async function actualizarAlumno(id, datos) {
    try {
        const alumnoRef = doc(db, "alumnos", id);
        await updateDoc(alumnoRef, {
            ...datos,
            actualizado: new Date().toISOString()
        });
        console.log("✅ Alumno actualizado:", id);
        return { success: true };
    } catch (error) {
        console.error("❌ Error al actualizar alumno:", error);
        return { success: false, error: error.message };
    }
}

// ========== FUNCIONES PARA TURNOS ==========

// Registrar un nuevo turno
export async function registrarTurno(datosTurno) {
    try {
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

// Eliminar turno
export async function eliminarTurno(id) {
    try {
        await deleteDoc(doc(db, "turnos", id));
        console.log("✅ Turno eliminado:", id);
        return { success: true };
    } catch (error) {
        console.error("❌ Error al eliminar turno:", error);
        return { success: false, error: error.message };
    }
}

// ========== FUNCIONES PARA CONFIGURACIÓN ==========

// Guardar días de asistencia
export async function guardarDiasAsistencia(dias) {
    try {
        const configRef = doc(db, "configuracion", "general");
        await setDoc(configRef, {
            diasAsistencia: dias,
            ultimaActualizacion: new Date().toISOString()
        }, { merge: true });
        console.log("✅ Días de asistencia guardados:", dias);
        return true;
    } catch (error) {
        console.error("❌ Error al guardar días de asistencia:", error);
        return false;
    }
}

// Guardar días feriados
export async function guardarFeriados(feriados) {
    try {
        const configRef = doc(db, "configuracion", "general");
        await setDoc(configRef, {
            feriados: feriados,
            ultimaActualizacion: new Date().toISOString()
        }, { merge: true });
        console.log("✅ Feriados guardados:", feriados);
        return true;
    } catch (error) {
        console.error("❌ Error al guardar feriados:", error);
        return false;
    }
}

// Cargar configuración
export async function cargarConfiguracion() {
    try {
        const configRef = doc(db, "configuracion", "general");
        const docSnap = await getDoc(configRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            return {
                diasAsistencia: data.diasAsistencia || [],
                feriados: data.feriados || [],
                cuposPorTurno: data.cuposPorTurno || 5,
                logoBase64: data.logoBase64 || null
            };
        } else {
            return {
                diasAsistencia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
                feriados: [],
                cuposPorTurno: 5,
                logoBase64: null
            };
        }
    } catch (error) {
        console.error("❌ Error al cargar configuración:", error);
        return {
            diasAsistencia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
            feriados: [],
            cuposPorTurno: 5,
            logoBase64: null
        };
    }
}

// ========== FUNCIONES PARA SUBIDA DE ARCHIVOS ==========

// Subir archivo a Storage
export async function subirArchivo(file, path) {
    try {
        const storageRef = ref(storage, `${path}/${Date.now()}_${file.name}`);
        await uploadBytes(storageRef, file);
        const url = await getDownloadURL(storageRef);
        console.log("✅ Archivo subido:", url);
        return url;
    } catch (error) {
        console.error("❌ Error al subir archivo:", error);
        throw error;
    }
}

// ========== EXPORTAR ==========
export { db, storage };