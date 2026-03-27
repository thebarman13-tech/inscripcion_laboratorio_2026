// =======================
// REGISTRO DE ALUMNOS
// =======================

const formRegistro = document.getElementById("formRegistro");
const msgRegistro = document.getElementById("msgRegistro");

if (formRegistro) {
    formRegistro.onsubmit = (e) => {
        e.preventDefault();
        
        const nombre = document.getElementById("nombre").value.trim();
        const apellido = document.getElementById("apellido").value.trim();
        const telefono = document.getElementById("telefono").value.trim();
        const nivel = document.getElementById("nivel").value;
        
        if (!nombre || !apellido || !telefono) {
            showToast("Todos los campos son obligatorios", "error");
            return;
        }
        
        const resultado = crearAlumno({ nombre, apellido, telefono, nivel });
        
        if (resultado.success) {
            document.getElementById("nombre").value = "";
            document.getElementById("apellido").value = "";
            document.getElementById("telefono").value = "";
            
            showToast(`✅ Alumno ${nombre} ${apellido} registrado correctamente`, "success");
            
            if (msgRegistro) {
                msgRegistro.innerHTML = "✅ Alumno registrado correctamente";
                msgRegistro.className = "mensaje-registro success";
                setTimeout(() => {
                    msgRegistro.innerHTML = "";
                    msgRegistro.className = "mensaje-registro";
                }, 5000);
            }
        } else {
            showToast(resultado.error || "❌ Error al registrar", "error");
        }
    };
}