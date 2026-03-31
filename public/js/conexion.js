// Importar Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, doc, getDocs, setDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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

// Función para cargar todos los alumnos
export async function cargarAlumnos() {
    try {
        const querySnapshot = await getDocs(collection(db, "alumnos"));
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

// ========= FUNCIONES PARA CONFIGURACIÓN (DÍAS Y FERIADOS) =========

// Guardar días de asistencia
export async function guardarDiasAsistencia(dias) {
    try {
        const configRef = doc(db, "configuracion", "diasFeriados");
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
        const configRef = doc(db, "configuracion", "diasFeriados");
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

// Cargar configuración (días y feriados)
export async function cargarConfiguracion() {
    try {
        const configRef = doc(db, "configuracion", "diasFeriados");
        const docSnap = await getDoc(configRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            console.log("✅ Configuración cargada:", data);
            return {
                diasAsistencia: data.diasAsistencia || [],
                feriados: data.feriados || []
            };
        } else {
            console.log("📝 No hay configuración guardada, usando valores por defecto");
            return {
                diasAsistencia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
                feriados: []
            };
        }
    } catch (error) {
        console.error("❌ Error al cargar configuración:", error);
        return {
            diasAsistencia: ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"],
            feriados: []
        };
    }
}

// Función para agregar un feriado individual
export async function agregarFeriado(fecha) {
    try {
        const configRef = doc(db, "configuracion", "diasFeriados");
        await updateDoc(configRef, {
            feriados: arrayUnion(fecha),
            ultimaActualizacion: new Date().toISOString()
        });
        console.log(`✅ Feriado agregado: ${fecha}`);
        return true;
    } catch (error) {
        console.error("❌ Error al agregar feriado:", error);
        return false;
    }
}

// Exportar db para usar en otros archivos
export { db };