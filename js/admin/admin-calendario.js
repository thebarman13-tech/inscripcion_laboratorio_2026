// =======================
// ADMIN - CALENDARIO MENSUAL
// =======================

async function renderCalendarioMensual() {
    const turnosData = getTurnos();
    const año = fechaActual.getFullYear();
    const mes = fechaActual.getMonth();
    
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasEnMes = ultimoDia.getDate();
    const diaInicioSemana = primerDia.getDay();
    
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const mesActualEl = document.getElementById("mesActual");
    if (mesActualEl) mesActualEl.textContent = `${meses[mes]} ${año}`;
    
    const diasSemana = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
    
    let html = diasSemana.map(dia => `<div class="calendario-dia-nombre">${dia}</div>`).join("");
    
    const diasMesAnterior = new Date(año, mes, 0).getDate();
    for (let i = diaInicioSemana - 1; i >= 0; i--) {
        const dia = diasMesAnterior - i;
        html += `<div class="calendario-dia otro-mes"><div class="calendario-dia-numero">${dia}</div></div>`;
    }
    
    const hoy = new Date();
    const hoyStr = hoy.toISOString().split("T")[0];
    
    for (let dia = 1; dia <= diasEnMes; dia++) {
        const fechaStr = `${año}-${String(mes + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
        const turnosDelDia = turnosData.filter(t => t.fecha === fechaStr);
        const esHoy = fechaStr === hoyStr;
        
        html += `
            <div class="calendario-dia ${esHoy ? 'hoy' : ''}" onclick="verTurnosDelDia('${fechaStr}')">
                <div class="calendario-dia-numero">${dia}</div>
                ${turnosDelDia.length > 0 ? `<div class="calendario-turno-count">${turnosDelDia.length} turno${turnosDelDia.length !== 1 ? 's' : ''}</div>` : ''}
            </div>
        `;
    }
    
    const diasRestantes = 42 - (diaInicioSemana + diasEnMes);
    for (let dia = 1; dia <= diasRestantes; dia++) {
        html += `<div class="calendario-dia otro-mes"><div class="calendario-dia-numero">${dia}</div></div>`;
    }
    
    const calendarioMensual = document.getElementById("calendarioMensual");
    if (calendarioMensual) calendarioMensual.innerHTML = html;
}

function cambiarMes(delta) {
    fechaActual.setMonth(fechaActual.getMonth() + delta);
    renderCalendarioMensual();
}

function irHoy() {
    fechaActual = new Date();
    renderCalendarioMensual();
}

async function verTurnosDelDia(fecha) {
    const turnosData = getTurnos();
    const turnosDelDia = turnosData.filter(t => t.fecha === fecha);
    
    if (turnosDelDia.length === 0) {
        showToast(`No hay turnos para el ${fecha}`, "info");
        return;
    }
    
    let mensaje = `📅 Turnos para ${fecha}:\n\n`;
    turnosDelDia.forEach(t => {
        const alumno = getAlumnoPorId(t.alumno_id);
        mensaje += `⏰ ${t.turno} - ${alumno ? `${alumno.nombre} ${alumno.apellido}` : 'Alumno'}\n   📌 ${t.motivo}\n\n`;
    });
    alert(mensaje);
}