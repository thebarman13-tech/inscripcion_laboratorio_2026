// =======================
// PERFIL DEL ALUMNO
// =======================

let alumnoActual = null;
let turnosAlumno = [];

function cargarPerfil() {
    const telefono = localStorage.getItem("alumno_telefono");
    
    if (!telefono) {
        showToast("⚠️ Debes iniciar sesión con tu teléfono", "info");
        document.getElementById("perfilNombre").disabled = true;
        document.getElementById("perfilApellido").disabled = true;
        document.getElementById("perfilTelefono").disabled = true;
        document.getElementById("perfilNivel").disabled = true;
        return;
    }
    
    const alumno = getAlumnoPorTelefono(telefono);
    
    if (alumno) {
        alumnoActual = alumno;
        document.getElementById("perfilNombre").value = alumno.nombre;
        document.getElementById("perfilApellido").value = alumno.apellido;
        document.getElementById("perfilTelefono").value = alumno.telefono;
        document.getElementById("perfilNivel").value = alumno.nivel;
        
        const avatarIcon = document.getElementById("avatarIcon");
        const avatarNivel = document.getElementById("avatarNivel");
        avatarIcon.textContent = getAvatarIcon(alumno.nivel);
        avatarNivel.textContent = alumno.nivel;
        
        cargarTurnosAlumno(alumno.id);
    } else {
        showToast("❌ Alumno no encontrado", "error");
    }
}

function getAvatarIcon(nivel) {
    const iconos = {
        'Inicial': '👶',
        'Intermedio': '🧑‍🔧',
        'Avanzado': '👨‍🔧'
    };
    return iconos[nivel] || '👤';
}

function cargarTurnosAlumno(alumnoId) {
    const todosTurnos = getTurnos();
    turnosAlumno = todosTurnos.filter(t => t.alumno_id === alumnoId)
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function verHistorial() {
    const historialSection = document.getElementById("historialSection");
    const historialList = document.getElementById("historialList");
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (turnosAlumno.length === 0) {
        historialList.innerHTML = '<p style="text-align:center; padding:2rem;">📭 No tienes turnos registrados</p>';
    } else {
        historialList.innerHTML = turnosAlumno.map(turno => {
            const fechaTurno = new Date(turno.fecha);
            fechaTurno.setHours(0, 0, 0, 0);
            const esPasado = fechaTurno < hoy;
            const fechaFormateada = fechaTurno.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
            const diaCapitalizado = fechaFormateada.charAt(0).toUpperCase() + fechaFormateada.slice(1);
            
            return `
                <div class="historial-turno-item ${esPasado ? 'pasado' : ''}">
                    <div class="historial-turno-info">
                        <div class="historial-turno-fecha">📅 ${diaCapitalizado}</div>
                        <div class="historial-turno-hora">⏰ ${turno.turno}</div>
                        <div class="historial-turno-motivo">📌 ${turno.motivo}</div>
                    </div>
                    ${!esPasado ? `
                        <div class="historial-turno-actions">
                            <button onclick="abrirModalCancelar(${turno.id}, '${diaCapitalizado}', '${turno.turno}')" class="btn-cancelar-turno">❌ Cancelar turno</button>
                        </div>
                    ` : '<span class="turno-completado">✅ Completado</span>'}
                </div>
            `;
        }).join('');
    }
    
    historialSection.style.display = "block";
    historialSection.scrollIntoView({ behavior: "smooth" });
}

let turnoACancelar = null;

function abrirModalCancelar(id, fecha, turno) {
    turnoACancelar = id;
    const modal = document.getElementById("modalCancelarTurno");
    const info = document.getElementById("cancelarTurnoInfo");
    info.innerHTML = `¿Estás seguro de cancelar tu turno del <strong>${fecha}</strong> a las <strong>${turno}</strong>?`;
    document.getElementById("cancelarMotivo").value = "";
    modal.style.display = "block";
}

function cerrarModalCancelar() {
    const modal = document.getElementById("modalCancelarTurno");
    modal.style.display = "none";
    turnoACancelar = null;
}

function confirmarCancelarTurno() {
    if (!turnoACancelar) return;
    
    const motivo = document.getElementById("cancelarMotivo").value.trim();
    
    const cancelaciones = JSON.parse(localStorage.getItem("cancelaciones")) || [];
    cancelaciones.push({
        turnoId: turnoACancelar,
        motivo: motivo || "No especificado",
        fecha: new Date().toISOString()
    });
    localStorage.setItem("cancelaciones", JSON.stringify(cancelaciones));
    
    const result = eliminarTurno(turnoACancelar);
    
    if (result.success) {
        cerrarModalCancelar();
        cargarTurnosAlumno(alumnoActual.id);
        if (document.getElementById("historialSection").style.display === "block") {
            verHistorial();
        }
        mostrarConfeti("🎉 ¡Turno cancelado correctamente!");
        showToast("✅ Turno cancelado. Hemos registrado tu cancelación.", "success");
    } else {
        showToast("❌ Error al cancelar el turno", "error");
    }
}

const formPerfil = document.getElementById("formPerfil");
const perfilMensaje = document.getElementById("perfilMensaje");

if (formPerfil) {
    formPerfil.onsubmit = (e) => {
        e.preventDefault();
        
        const nuevoNombre = document.getElementById("perfilNombre").value.trim();
        const nuevoApellido = document.getElementById("perfilApellido").value.trim();
        const nuevoTelefono = document.getElementById("perfilTelefono").value.trim();
        const nuevoNivel = document.getElementById("perfilNivel").value;
        
        if (!nuevoNombre || !nuevoApellido || !nuevoTelefono) {
            showToast("Todos los campos son obligatorios", "error");
            return;
        }
        
        if (!alumnoActual) {
            showToast("No hay sesión activa", "error");
            return;
        }
        
        const resultado = actualizarAlumno(alumnoActual.id, {
            nombre: nuevoNombre,
            apellido: nuevoApellido,
            telefono: nuevoTelefono,
            nivel: nuevoNivel
        });
        
        if (resultado.success) {
            if (nuevoTelefono !== alumnoActual.telefono) {
                localStorage.setItem("alumno_telefono", nuevoTelefono);
            }
            
            alumnoActual = resultado.data;
            
            const avatarIcon = document.getElementById("avatarIcon");
            const avatarNivel = document.getElementById("avatarNivel");
            avatarIcon.textContent = getAvatarIcon(nuevoNivel);
            avatarNivel.textContent = nuevoNivel;
            
            mostrarConfeti("🎉 ¡Datos actualizados correctamente!");
            showToast("✅ Perfil actualizado correctamente", "success");
            
            if (perfilMensaje) {
                perfilMensaje.innerHTML = "✅ Perfil actualizado correctamente";
                perfilMensaje.className = "perfil-mensaje success";
                setTimeout(() => {
                    perfilMensaje.innerHTML = "";
                    perfilMensaje.className = "perfil-mensaje";
                }, 5000);
            }
        } else {
            showToast(resultado.error || "Error al actualizar", "error");
        }
    };
}

function mostrarConfeti(mensaje) {
    const modal = document.getElementById("modalConfeti");
    const confetiMensaje = document.getElementById("confetiMensaje");
    confetiMensaje.innerHTML = mensaje;
    modal.style.display = "block";
    
    for (let i = 0; i < 50; i++) {
        crearConfeti();
    }
}

function crearConfeti() {
    const confeti = document.createElement('div');
    confeti.innerHTML = ['🎉', '🎊', '✨', '🌟', '⭐', '🎈'][Math.floor(Math.random() * 6)];
    confeti.style.position = 'fixed';
    confeti.style.left = Math.random() * 100 + '%';
    confeti.style.top = '-50px';
    confeti.style.fontSize = (Math.random() * 20 + 10) + 'px';
    confeti.style.pointerEvents = 'none';
    confeti.style.zIndex = '9999';
    confeti.style.animation = `confetiFall ${Math.random() * 2 + 2}s linear forwards`;
    document.body.appendChild(confeti);
    
    setTimeout(() => confeti.remove(), 3000);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes confetiFall {
        0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
        }
        100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

function cerrarConfeti() {
    const modal = document.getElementById("modalConfeti");
    modal.style.display = "none";
}

function cerrarSesion() {
    localStorage.removeItem("alumno_telefono");
    localStorage.removeItem("alumno_nombre");
    localStorage.removeItem("alumno_apellido");
    localStorage.removeItem("alumno_nivel");
    localStorage.removeItem("alumno_id");
    showToast("✅ Sesión cerrada correctamente", "success");
    setTimeout(() => {
        window.location.href = "login.html";
    }, 1000);
}

document.addEventListener("DOMContentLoaded", () => {
    cargarPerfil();
    
    if (!localStorage.getItem("alumno_telefono")) {
        showToast("ℹ️ Para acceder a tu perfil, primero regístrate e inicia sesión con tu teléfono", "info");
    }
});