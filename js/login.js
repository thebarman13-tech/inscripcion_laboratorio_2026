// =======================
// LOGIN DE ALUMNOS
// =======================

const formLoginAlumno = document.getElementById("formLoginAlumno");
const loginMensaje = document.getElementById("loginMensaje");

if (formLoginAlumno) {
    formLoginAlumno.onsubmit = (e) => {
        e.preventDefault();
        
        const telefono = document.getElementById("loginTelefono").value.trim();
        
        if (!telefono) {
            mostrarMensaje("❌ Ingresa tu teléfono", "error");
            return;
        }
        
        const alumno = getAlumnoPorTelefono(telefono);
        
        if (alumno) {
            localStorage.setItem("alumno_telefono", telefono);
            localStorage.setItem("alumno_nombre", alumno.nombre);
            localStorage.setItem("alumno_apellido", alumno.apellido);
            localStorage.setItem("alumno_nivel", alumno.nivel);
            localStorage.setItem("alumno_id", alumno.id);
            
            mostrarMensaje(`✅ ¡Bienvenido ${alumno.nombre}! Redirigiendo...`, "success");
            
            setTimeout(() => {
                window.location.href = "perfil.html";
            }, 1500);
        } else {
            mostrarMensaje("❌ Teléfono no registrado. ¿Quieres <a href='registro.html' style='color:#10b981;'>registrarte</a>?", "error");
        }
    };
}

function mostrarMensaje(mensaje, tipo) {
    if (loginMensaje) {
        loginMensaje.innerHTML = mensaje;
        loginMensaje.className = `login-mensaje ${tipo}`;
        
        setTimeout(() => {
            loginMensaje.innerHTML = "";
            loginMensaje.className = "login-mensaje";
        }, 5000);
    }
}