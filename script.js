// ============================================
// NEGOCIO INTELIGENTE EXPRESS - CRM
// Basado en WhatsControl_PRO
// Versión 1.0 - 2026
// ============================================

// ---------- ESTADO GLOBAL ----------
let clientes = [];
let filtroActual = 'todos';
let clientesFiltrados = [];

// ---------- INICIALIZACIÓN ----------
document.addEventListener('DOMContentLoaded', () => {
    cargarClientes();
    cargarConfiguracion();
    renderizarClientes();
    actualizarDashboard();
    actualizarEstadisticas();  // <-- AGREGAR ESTA LÍNEA
    actualizarInfoBackup();
});



// ---------- GESTIÓN DE DATOS (LocalStorage) ----------
function cargarClientes() {
    const data = localStorage.getItem('negocioInteligenteClientes');
    if (data) {
        clientes = JSON.parse(data);
    } else {
        // Datos de ejemplo para demostración
        clientes = [
            { id: '1', nombre: 'María González', telefono: '56912345678', estado: 'Atendido', fechaCreacion: '2026-06-01', fechaAtencion: '2026-06-01', ultimoContacto: '2026-06-01' },
            { id: '2', nombre: 'Ana Rodríguez', telefono: '56987654321', estado: 'Nueva consulta', fechaCreacion: '2026-07-20', fechaAtencion: null, ultimoContacto: '2026-07-20' },
            { id: '3', nombre: 'Sofía Pérez', telefono: '56911112222', estado: 'Atendido', fechaCreacion: '2026-05-15', fechaAtencion: '2026-05-15', ultimoContacto: '2026-05-15' },
            { id: '4', nombre: 'Carla Martínez', telefono: '56933334444', estado: 'Atendido', fechaCreacion: '2026-06-20', fechaAtencion: '2026-06-20', ultimoContacto: '2026-06-20' },
        ];
        guardarClientes();
    }
}

function guardarClientes() {
    localStorage.setItem('negocioInteligenteClientes', JSON.stringify(clientes));
}


// ---------- CORREGIR CARACTERES MAL CODIFICADOS ----------
function corregirTexto(texto) {
    if (!texto) return texto;
    return String(texto)
        .replace(/Ã¡/g, 'á')
        .replace(/Ã©/g, 'é')
        .replace(/Ã­/g, 'í')
        .replace(/Ã³/g, 'ó')
        .replace(/Ãº/g, 'ú')
        .replace(/Ã±/g, 'ñ')
        .replace(/Ã‘/g, 'Ñ')
        .replace(/Ã/g, 'í')
        .replace(/Â¿/g, '¿')
        .replace(/Â¡/g, '¡')
        .trim();
}



// ---------- REFRESCAR SISTEMA ----------
function refrescarSistema() {
    guardarClientes();
    renderizarClientes();
    actualizarDashboard();
    actualizarEstadisticas();
    actualizarInfoBackup();
}


// ---------- FUNCIONES DE CLIENTES ----------
function generarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

function agregarCliente(nombre, telefono, estado) {
    const telNormalizado = normalizarTelefono(telefono);
    if (!telNormalizado) {
        alert('❌ El teléfono ingresado no es válido. Usa formato chileno (Ej: 912345678).');
        return null;
    }
    const nuevoCliente = {
        id: generarId(),
        nombre: nombre.trim(),
        telefono: telNormalizado,
        estado: estado || 'Nueva consulta',
        fechaCreacion: new Date().toISOString().split('T')[0],
        fechaAtencion: estado === 'Atendido' ? new Date().toISOString().split('T')[0] : null,
        ultimoContacto: new Date().toISOString().split('T')[0]
    };
    clientes.unshift(nuevoCliente);
    refrescarSistema();  // <-- AGREGAR ESTA LÍNEA
    return nuevoCliente;
}



function cambiarEstado(clienteId, nuevoEstado) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    cliente.estado = nuevoEstado;
    
    if (nuevoEstado === 'Atendido' && !cliente.fechaAtencion) {
        cliente.fechaAtencion = new Date().toISOString().split('T')[0];
    }
    
    cliente.ultimoContacto = new Date().toISOString().split('T')[0];
    refrescarSistema();  // <-- AGREGAR ESTA LÍNEA
}


function eliminarCliente(clienteId) {
    if (confirm('¿Eliminar este cliente?')) {
        clientes = clientes.filter(c => c.id !== clienteId);
       refrescarSistema();  // <-- AGREGAR ESTA LÍNEA
    }
}


// ---------- CÁLCULO DE DÍAS ----------
function calcularDiferenciaDias(fechaInicio) {
    const inicio = new Date(fechaInicio);
    const hoy = new Date();
    const diff = hoy - inicio;
    return Math.floor(diff / (1000 * 60 * 60 * 24));
}


function esRecuperable(cliente) {
    if (cliente.estado !== 'Atendido' || !cliente.fechaAtencion) return false;
    const dias = window.diasRecordatorio || 30;
    return calcularDiferenciaDias(cliente.fechaAtencion) >= dias;
}


// Obtener nivel de prioridad según días
function getPrioridad(dias) {
    if (dias < 30) return { nivel: 'baja', texto: 'No corresponde contactar', color: '#888' };
    if (dias >= 30 && dias < 60) return { nivel: 'media', texto: '🟢 Listo para contactar', color: '#10B981' };
    if (dias >= 60 && dias < 90) return { nivel: 'alta', texto: '🟠 Recuperar hoy', color: '#F59E0B' };
    return { nivel: 'critica', texto: '🔴 Cliente crítico', color: '#EF4444' };
}

// ---------- DASHBOARD ----------
function actualizarDashboard() {
    const total = clientes.length;
    const nuevos = clientes.filter(c => c.estado === 'Nueva consulta' || c.estado === 'Nuevo').length;
    const atendidos = clientes.filter(c => c.estado === 'Atendido').length;
    const recuperables = clientes.filter(esRecuperable).length;
    
    document.getElementById('totalClientes').textContent = total;
    document.getElementById('nuevosClientes').textContent = nuevos;
    document.getElementById('atendidosHoy').textContent = atendidos;
    document.getElementById('recuperables').textContent = recuperables;
    
    // Destacar métrica "Clientes por Recuperar" si > 0
    const metricCard = document.getElementById('metricRecuperables');
    if (recuperables > 0) {
        metricCard.classList.add('destacado');
    } else {
        metricCard.classList.remove('destacado');
    }
}

// ---------- ESTADÍSTICAS ----------
function actualizarEstadisticas() {
    const container = document.getElementById('estadisticasGrid');
    if (!container) return;
    
    // Si no hay clientes
    if (clientes.length === 0) {
        container.innerHTML = `
            <div class="estadistica-card" style="grid-column:1/-1;text-align:center;border-left-color:#888;">
                <span class="estadistica-valor" style="font-size:1.2rem;">📭</span>
                <span class="estadistica-label">Sin datos aún</span>
                <span class="estadistica-detalle">Agrega clientes para ver estadísticas</span>
            </div>
        `;
        return;
    }
    
    // Calcular estadísticas
    const total = clientes.length;
    const nuevos = clientes.filter(c => c.estado === 'Nueva consulta' || c.estado === 'Nuevo').length;
    const atendidos = clientes.filter(c => c.estado === 'Atendido').length;
    const recuperables = clientes.filter(esRecuperable).length;
    
    // Clientes atendidos con fecha
    const atendidosConFecha = clientes.filter(c => c.estado === 'Atendido' && c.fechaAtencion);
    
    // Calcular tiempo promedio entre visitas (días)
    let promedioDias = 0;
    if (atendidosConFecha.length > 0) {
        const totalDias = atendidosConFecha.reduce((sum, c) => {
            return sum + calcularDiferenciaDias(c.fechaAtencion);
        }, 0);
        promedioDias = Math.round(totalDias / atendidosConFecha.length);
    }
    
    // Cliente que lleva más tiempo sin volver
    let clienteMasAntiguo = null;
    let maxDias = 0;
    atendidosConFecha.forEach(c => {
        const dias = calcularDiferenciaDias(c.fechaAtencion);
        if (dias > maxDias) {
            maxDias = dias;
            clienteMasAntiguo = c;
        }
    });
    
    // Clientes recuperados esta semana (últimos 7 días)
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 7);
    const recuperadosSemana = clientes.filter(c => {
        if (c.estado !== 'Atendido' || !c.fechaAtencion) return false;
        const fechaAtencion = new Date(c.fechaAtencion);
        return fechaAtencion >= fechaLimite && esRecuperable(c);
    }).length;
    
    // Generar HTML
    container.innerHTML = `
        <div class="estadistica-card positiva">
            <span class="estadistica-valor">${recuperadosSemana}</span>
            <span class="estadistica-label">🔄 Recuperados esta semana</span>
            <span class="estadistica-detalle">Clientes que volvieron en los últimos 7 días</span>
            ${recuperadosSemana > 0 ? `<button onclick="filtrar('recuperables')" class="estadistica-accion">Ver listado →</button>` : ''}
        </div>
        <div class="estadistica-card">
            <span class="estadistica-valor">${promedioDias > 0 ? promedioDias : '—'}</span>
            <span class="estadistica-label">⏱️ Promedio entre visitas</span>
            <span class="estadistica-detalle">${promedioDias > 0 ? promedioDias + ' días' : 'Sin datos suficientes'}</span>
            ${promedioDias > 35 ? `<span class="estadistica-detalle" style="color:#D97706;">⚠️ Meta: 35 días</span>` : ''}
        </div>
        <div class="estadistica-card ${maxDias >= 60 ? 'alerta' : 'destacada'}">
            <span class="estadistica-valor">${clienteMasAntiguo ? clienteMasAntiguo.nombre : '—'}</span>
            <span class="estadistica-label">⏰ Cliente más antiguo</span>
            <span class="estadistica-detalle">${clienteMasAntiguo ? maxDias + ' días sin venir' : 'Sin datos'}</span>
            ${clienteMasAntiguo ? `<button onclick="buscarClienteEspecifico('${clienteMasAntiguo.nombre}')" class="estadistica-accion">Ver ficha →</button>` : ''}
        </div>
        <div class="estadistica-card">
            <span class="estadistica-valor">${recuperables}</span>
            <span class="estadistica-label">📋 Clientes por Recuperar</span>
            <span class="estadistica-detalle">${recuperables > 0 ? 'Listos para contactar' : 'Todos al día ✅'}</span>
            ${recuperables > 0 ? `<button onclick="filtrar('recuperables')" class="estadistica-accion">Ver lista →</button>` : ''}
        </div>
    `;
}


// ---------- FUNCIONES AUXILIARES PARA RENDERIZADO ----------
function crearBadgePrioridad(cliente, dias) {
    if (cliente.estado === 'Atendido' && cliente.fechaAtencion && dias !== null && dias >= 30) {
        return `<span class="badge-prioridad">✅ RECOMENDADO</span>`;
    }
    return '';
}

function crearEstadoAutomatico(cliente, dias) {
    if (cliente.estado === 'Atendido' && cliente.fechaAtencion && dias !== null) {
        const prioridad = getPrioridad(dias);
        return {
            texto: prioridad.texto,
            color: prioridad.color
        };
    }
    return {
        texto: '⏳ Cliente aún no atendido',
        color: '#888'
    };
}

function crearBotonesAccion(cliente, esRecup) {
    const whatsappIcon = `<span class="whatsapp-icon">💬</span>`;
    const botonRecordar = `<button onclick="recordarCliente('${cliente.id}')" class="btn-recordar" ${!esRecup ? 'style="opacity:0.6;"' : ''}>
        ${whatsappIcon} Enviar Recordatorio
    </button>`;
    
    const selectEstado = `<select onchange="cambiarEstado('${cliente.id}', this.value)" class="btn-cambiar-estado">
        <option value="Nueva consulta" ${cliente.estado === 'Nueva consulta' ? 'selected' : ''}>🟢 Nueva consulta</option>
        <option value="Contactado" ${cliente.estado === 'Contactado' ? 'selected' : ''}>🔵 Contactado</option>
        <option value="Reservó cita" ${cliente.estado === 'Reservó cita' ? 'selected' : ''}>🟣 Reservó cita</option>
        <option value="Atendido" ${cliente.estado === 'Atendido' ? 'selected' : ''}>✅ Atendido</option>
    </select>`;
    
    const botonEliminar = `<button onclick="eliminarCliente('${cliente.id}')" style="background:#FCA5A5;color:#7F1D1D;border:none;border-radius:6px;padding:6px 12px;cursor:pointer;font-weight:500;font-size:0.8rem;font-family:'Inter',sans-serif;">🗑️</button>`;
    
    return botonRecordar + selectEstado + botonEliminar;
}



// ---------- RENDERIZADO ----------
function renderizarClientes(lista = null) {
    const container = document.getElementById('listaClientes');
    const clientesAMostrar = lista || clientes;
    
    if (clientesAMostrar.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <p>📭 No hay clientes registrados</p>
                <p style="color:#888;font-size:0.9rem;">Registra tu primera consulta usando el formulario</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = clientesAMostrar.map(cliente => {
        const dias = cliente.fechaAtencion ? calcularDiferenciaDias(cliente.fechaAtencion) : null;
        const esRecup = esRecuperable(cliente);
        
        // Normalizar estado para la clase CSS
        let estadoKey = cliente.estado.toLowerCase().replace(/ /g, '-').replace(/ó/g, 'o');
        const estadoClass = `estado-${estadoKey}`;
        
        // Determinar prioridad y clase
        let prioridadClass = 'prioridad-baja';
        if (cliente.estado === 'Atendido' && cliente.fechaAtencion && dias !== null) {
            const prioridad = getPrioridad(dias);
            prioridadClass = `prioridad-${prioridad.nivel}`;
        }
        
        // Usar funciones auxiliares
        const badgeHtml = crearBadgePrioridad(cliente, dias);
        const estadoAuto = crearEstadoAutomatico(cliente, dias);
        const botonesAccion = crearBotonesAccion(cliente, esRecup);
        
        return `
            <div class="cliente-card ${prioridadClass}">
                <div class="nombre">${cliente.nombre}</div>
                <div class="telefono">📱 ${cliente.telefono}</div>
                ${badgeHtml}
                <span class="estado ${estadoClass}">${cliente.estado}</span>
                ${cliente.fechaAtencion ? `
                    <div class="fecha-atencion">
                        📅 Última atención: ${cliente.fechaAtencion}
                    </div>
                    <div class="dias-atencion">
                        ⏱️ Han pasado: <strong>${dias} días</strong>
                    </div>
                    <div class="estado-auto" style="color: ${estadoAuto.color}; font-weight: 600; font-size: 0.9rem; margin-top: 4px;">
                        ${estadoAuto.texto}
                    </div>
                ` : `
                    <div class="fecha-atencion" style="color: #888;">
                        ${estadoAuto.texto}
                    </div>
                `}
                <div class="acciones">
                    ${botonesAccion}
                </div>
            </div>
        `;
    }).join('');
}



// ---------- FILTROS ----------
function filtrar(tipo) {
    filtroActual = tipo;
    let resultado = [];
    
    document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        if (btn.textContent.includes('Todos') && tipo === 'todos') btn.classList.add('active');
        if (btn.textContent.includes('Nuevos') && tipo === 'nuevos') btn.classList.add('active');
        if (btn.textContent.includes('Atendidos') && tipo === 'atendidos') btn.classList.add('active');
        if (btn.textContent.includes('Clientes por Recuperar') && tipo === 'recuperables') btn.classList.add('active');
    });
    
    switch(tipo) {
        case 'todos':
            resultado = clientes;
            break;
        case 'nuevos':
            resultado = clientes.filter(c => c.estado === 'Nueva consulta' || c.estado === 'Nuevo');
            break;
        case 'atendidos':
            resultado = clientes.filter(c => c.estado === 'Atendido');
            break;
        case 'recuperables':
            resultado = clientes.filter(esRecuperable);
            break;
        default:
            resultado = clientes;
    }
    
    renderizarClientes(resultado);
}

// ---------- BÚSQUEDA ----------
function buscarCliente() {
    const termino = document.getElementById('buscador').value.toLowerCase().trim();
    if (!termino) {
        filtrar(filtroActual);
        return;
    }
    const resultado = clientes.filter(c => 
        c.nombre.toLowerCase().includes(termino) || 
        c.telefono.includes(termino)
    );
    renderizarClientes(resultado);
}

// ---------- BUSCAR CLIENTE ESPECÍFICO ----------
function buscarClienteEspecifico(nombre) {
    const buscador = document.getElementById('buscador');
    if (buscador) {
        buscador.value = nombre;
        buscarCliente();
        // Scroll a la lista de clientes
        document.querySelector('.clientes-section').scrollIntoView({ behavior: 'smooth' });
    }
}



// ---------- RECORDAR CLIENTE (WhatsApp) ----------
function recordarCliente(clienteId) {
    const cliente = clientes.find(c => c.id === clienteId);
    if (!cliente) return;
    
    const config = JSON.parse(localStorage.getItem('negocioInteligenteConfig') || '{}');
    const dias = window.diasRecordatorio || 30;
    
    if (!esRecuperable(cliente)) {
        alert(`Este cliente aún no es recuperable. Espera ${dias}+ días desde su última atención.`);
        return;
    }
    
    const diasTranscurridos = cliente.fechaAtencion ? calcularDiferenciaDias(cliente.fechaAtencion) : 0;
    
    // Usar mensaje personalizado o el predeterminado
    let mensaje = config.mensajePersonalizado || 
        `Hola ${cliente.nombre} 😊\n\n` +
        `Ya pasaron ${dias} días desde tu última visita a la estética.\n` +
        `Tenemos horas disponibles esta semana.\n` +
        `¿Te gustaría reservar nuevamente?\n\n` +
        `¡Te esperamos! ✨`;

   // Reemplazar variables
    mensaje = mensaje
        .replace(/{nombre}/g, cliente.nombre)
        .replace(/{negocio}/g, config.nombre || 'la estética')
        .replace(/{dias}/g, diasTranscurridos);
    
            const mensajeCodificado = encodeURIComponent(mensaje);
    const numeroNormalizado = normalizarTelefono(cliente.telefono);
    
    if (!numeroNormalizado) {
        alert('❌ El teléfono del cliente no es válido para WhatsApp.');
        return;
    }
    
    const url = `https://wa.me/${numeroNormalizado}?text=${mensajeCodificado}`;
    
    window.open(url, '_blank');
    
}

// ---------- EVENTOS ----------

document.getElementById('clienteForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const nombre = document.getElementById('nombre').value.trim();
    const telefono = document.getElementById('telefono').value.trim();
    const estado = document.getElementById('estadoInicial').value;
    
    if (!nombre || !telefono) {
        alert('Por favor completa todos los campos');
        return;
    }
    
    agregarCliente(nombre, telefono, estado);
    document.getElementById('clienteForm').reset();
    document.getElementById('estadoInicial').value = 'Nueva consulta';
});

// Evento para importar CSV
document.getElementById('importFile').addEventListener('change', importarClientesCSV);



// ---------- FUNCIONES ADICIONALES ----------
function exportarReporte() {
    let texto = '📊 REPORTE DE CLIENTES\n';
    texto += '='.repeat(40) + '\n\n';
    texto += `Total: ${clientes.length}\n`;
    texto += `Nuevos: ${clientes.filter(c => c.estado === 'Nueva consulta' || c.estado === 'Nuevo').length}\n`;
    texto += `Atendidos: ${clientes.filter(c => c.estado === 'Atendido').length}\n`;
    texto += `Clientes por Recuperar: ${clientes.filter(esRecuperable).length}\n\n`;
    texto += '='.repeat(40) + '\n\n';
    
    clientes.forEach(c => {
        texto += `👤 ${c.nombre}\n`;
        texto += `📱 ${c.telefono}\n`;
        texto += `📌 ${c.estado}\n`;
        if (c.fechaAtencion) {
            const dias = calcularDiferenciaDias(c.fechaAtencion);
            texto += `📅 Atendido: ${c.fechaAtencion} (${dias} días)\n`;
            if (esRecuperable(c)) texto += '⚠️ RECUPERABLE\n';
        }
        texto += '-'.repeat(30) + '\n';
    });
    
    const blob = new Blob([texto], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-clientes-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}


// ---------- ENVIAR INFORME POR CORREO ----------
function enviarInformeCorreo() {
    // Verificar si hay clientes
    if (clientes.length === 0) {
        alert('📭 No hay clientes para enviar el informe.');
        return;
    }
    
    // Obtener correo de la configuración
    const config = JSON.parse(localStorage.getItem('negocioInteligenteConfig') || '{}');
    let email = config.correo || '';
    
    // Si no hay correo guardado, preguntar
    if (!email) {
        email = prompt('📧 Ingresa el correo donde deseas recibir el informe:', '');
        if (!email || !email.includes('@')) {
            alert('❌ Correo inválido. No se enviará el informe.');
            return;
        }
        // Guardar el correo en la configuración
        config.correo = email;
        localStorage.setItem('negocioInteligenteConfig', JSON.stringify(config));
        // Actualizar el campo de configuración si existe
        const correoInput = document.getElementById('configCorreo');
        if (correoInput) correoInput.value = email;
    }
    
    // Generar contenido del informe
    let texto = '📊 INFORME DE CLIENTES\n';
    texto += '='.repeat(40) + '\n\n';
    texto += `📅 Fecha: ${new Date().toISOString().split('T')[0]}\n`;
    texto += `🏢 ${config.nombre || 'Negocio'}\n\n`;
    texto += `📋 Total: ${clientes.length}\n`;
    texto += `🆕 Nuevos: ${clientes.filter(c => c.estado === 'Nueva consulta' || c.estado === 'Nuevo').length}\n`;
    texto += `✅ Atendidos: ${clientes.filter(c => c.estado === 'Atendido').length}\n`;
    texto += `🔄 Clientes por Recuperar: ${clientes.filter(esRecuperable).length}\n\n`;
    texto += '='.repeat(40) + '\n\n';
    texto += '📋 LISTA DE CLIENTES\n';
    texto += '-'.repeat(40) + '\n\n';
    
    clientes.forEach((c, i) => {
        texto += `${i+1}. ${c.nombre}\n`;
        texto += `   📱 ${c.telefono}\n`;
        texto += `   📌 ${c.estado}\n`;
        if (c.fechaAtencion) {
            const dias = calcularDiferenciaDias(c.fechaAtencion);
            texto += `   📅 Atendido: ${c.fechaAtencion} (${dias} días)\n`;
            if (esRecuperable(c)) texto += '   ⚠️ RECUPERABLE - ¡Contactar!\n';
        }
        texto += '\n';
    });
    
    // Crear el mensaje para mailto
    const asunto = encodeURIComponent(`📊 Informe Clientes - ${new Date().toISOString().split('T')[0]}`);
    const cuerpo = encodeURIComponent(texto);
    const mailtoLink = `mailto:${email}?subject=${asunto}&body=${cuerpo}`;
    
    // Abrir el cliente de correo
    window.open(mailtoLink, '_blank');
    
    // Mostrar notificación
    mostrarToast('📧 Abriendo correo para: ' + email);
}


// ---------- TOAST DE NOTIFICACIÓN ----------
function mostrarToast(mensaje, tipo = 'success') {
    // Remover toast existente
    const oldToast = document.querySelector('.toast');
    if (oldToast) oldToast.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.textContent = mensaje;
    document.body.appendChild(toast);
    
    // Mostrar con animación
    setTimeout(() => toast.classList.add('show'), 10);
    
    // Ocultar después de 3 segundos
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 500);
    }, 3000);
}


function reiniciarCiclo() {
    if (confirm('⚠️ ¿Eliminar TODOS los clientes? Esta acción no se puede deshacer.')) {
        if (confirm('¿Estás completamente seguro?')) {
            clientes = [];
            clientes = [];
        refrescarSistema();  // <-- AGREGAR ESTA LÍNEA
            document.getElementById('buscador').value = '';
        }
    }
}


// ---------- CONFIGURACIÓN DEL NEGOCIO ----------
function cargarConfiguracion() {
    const config = localStorage.getItem('negocioInteligenteConfig');
    if (config) {
        const data = JSON.parse(config);
        const nombreInput = document.getElementById('configNombre');
        const whatsappInput = document.getElementById('configWhatsapp');
        const correoInput = document.getElementById('configCorreo');
        const direccionInput = document.getElementById('configDireccion');
        const diasSelect = document.getElementById('configDias');
        const mensajeTextarea = document.getElementById('configMensaje');
        
        if (nombreInput) nombreInput.value = data.nombre || '';
        if (whatsappInput) whatsappInput.value = data.whatsapp || '';
        if (correoInput) correoInput.value = data.correo || '';
        if (direccionInput) direccionInput.value = data.direccion || '';
        if (diasSelect) diasSelect.value = data.diasRecordatorio || 30;
        if (mensajeTextarea) mensajeTextarea.value = data.mensajePersonalizado || '';
        
        // Guardar días de recordatorio en variable global
        window.diasRecordatorio = data.diasRecordatorio || 30;
        return data;
    }
    // Si no hay configuración, usar valor por defecto
    window.diasRecordatorio = 30;
    return null;
}


// ---------- ABRIR/CERRAR CONFIGURACIÓN ----------
function abrirConfiguracion() {
    const configSection = document.getElementById('configSection');
    if (configSection) {
        configSection.style.display = 'block';
        configSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

function cerrarConfiguracion() {
    const configSection = document.getElementById('configSection');
    if (configSection) {
        configSection.style.display = 'none';
    }
}


function guardarConfiguracion() {
    const nombre = document.getElementById('configNombre').value.trim();
    const whatsapp = document.getElementById('configWhatsapp').value.trim();
    const correo = document.getElementById('configCorreo').value.trim();
    const direccion = document.getElementById('configDireccion').value.trim();
    const diasRecordatorio = parseInt(document.getElementById('configDias').value);
    const mensajePersonalizado = document.getElementById('configMensaje').value.trim();
    
    if (!nombre) {
        alert('⚠️ Por favor ingresa el nombre de tu estética.');
        return;
    }
    
    const config = {
        nombre: nombre,
        whatsapp: whatsapp,
        correo: correo,
        direccion: direccion,
        diasRecordatorio: diasRecordatorio,
        mensajePersonalizado: mensajePersonalizado
    };
    
    localStorage.setItem('negocioInteligenteConfig', JSON.stringify(config));
    window.diasRecordatorio = diasRecordatorio;
    alert('✅ Configuración guardada correctamente.');
}


// ---------- BACKUP ----------
function guardarBackup() {
    // Verificar si hay datos
    if (clientes.length === 0) {
        const config = localStorage.getItem('negocioInteligenteConfig');
        if (!config) {
            alert('📭 No hay datos para guardar. Agrega clientes o configuración primero.');
            return;
        }
    }
    
    // Recopilar todos los datos
    const datos = {
        version: '1.0',
        fecha: new Date().toISOString(),
        clientes: clientes,
        configuracion: localStorage.getItem('negocioInteligenteConfig') || null
    };
    
    // Crear archivo JSON
    const json = JSON.stringify(datos, null, 2);
    const blob = new Blob([json], { type: 'application/json;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    const fecha = new Date().toISOString().split('T')[0];
    link.download = `backup-negocio-inteligente-${fecha}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    
    // Guardar fecha del último backup
    const ahora = new Date();
    const fechaStr = ahora.toLocaleDateString('es-CL', { day: '2-digit', month: 'long', year: 'numeric' });
    const horaStr = ahora.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
    localStorage.setItem('negocioInteligenteUltimoBackup', JSON.stringify({
        fecha: fechaStr,
        hora: horaStr,
        timestamp: ahora.getTime()
    }));
    actualizarInfoBackup();
    
    mostrarToast('✅ Respaldo guardado correctamente (' + clientes.length + ' clientes)');
}


    // ---------- ACTUALIZAR INFO BACKUP ----------
function actualizarInfoBackup() {
    const container = document.getElementById('ultimoBackupInfo');
    if (!container) return;
    
    const data = localStorage.getItem('negocioInteligenteUltimoBackup');
    if (data) {
        const info = JSON.parse(data);
        container.innerHTML = `📅 Último respaldo: <strong>${info.fecha}</strong> a las <strong>${info.hora}</strong>`;
        container.classList.add('visible');
    } else {
        container.classList.remove('visible');
    }
}


// ---------- IMPORTAR CLIENTES DESDE CSV ----------
function abrirImportacion() {
    const input = document.getElementById('importFile');
    if (!input) {
        alert('⚠️ Error: No se encontró el selector de archivos.');
        return;
    }
    input.value = '';
    input.click();
}

function descargarPlantillaCSV() {
    // Usar punto y coma (;) como separador y BOM para UTF-8
    // Esto hace que Excel (en español/latino) lo abra correctamente
    const BOM = '\uFEFF';
    const contenido = 
        BOM +
        'nombre;telefono;fecha_atencion\n' +
        'María Pérez;912345678;15/07/2026\n' +
        'Carolina Soto;987654321;02/06/2026\n' +
        'Andrea Díaz;934567890;10/08/2026\n';
    
    const blob = new Blob([contenido], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'plantilla-clientes.csv';
    link.click();
    URL.revokeObjectURL(link.href);
    
    mostrarToast('📄 Plantilla descargada correctamente');
}


function parsearCSV(texto) {

// ---------- CORREGIR CARACTERES MAL CODIFICADOS ----------
function corregirTexto(texto) {
    if (!texto) return texto;
    return texto
        .replace(/Ã¡/g, 'á')
        .replace(/Ã©/g, 'é')
        .replace(/Ã­/g, 'í')
        .replace(/Ã³/g, 'ó')
        .replace(/Ãº/g, 'ú')
        .replace(/Ã±/g, 'ñ')
        .replace(/Ã/g, 'í')
        .replace(/Â¿/g, '¿')
        .replace(/Â¡/g, '¡')
        .trim();
}



    // Detectar separador automáticamente: ; o ,
    const primeraLinea = texto.split(/\r?\n/)[0] || '';
    const separador = primeraLinea.includes(';') ? ';' : ',';
    
    const lineas = texto.split(/\r?\n/).filter(linea => linea.trim() !== '');
    if (lineas.length < 2) return { encabezados: [], filas: [] };
    
    // Limpiar BOM si existe
    const limpiarBOM = (str) => str.replace(/^\uFEFF/, '');
    
    const encabezados = limpiarBOM(lineas[0]).split(separador).map(h => h.trim().toLowerCase());
    const filas = [];
    
    for (let i = 1; i < lineas.length; i++) {
        const valores = limpiarBOM(lineas[i]).split(separador).map(v => v.trim());
        const fila = {};
        encabezados.forEach((enc, idx) => {
            fila[enc] = valores[idx] || '';
        });
        filas.push({ linea: i + 1, datos: fila });
    }
    
    return { encabezados, filas };
}


function parsearFecha(fechaStr) {
    if (!fechaStr) return null;
    
    // Formato DD/MM/AAAA
    if (fechaStr.includes('/')) {
        const partes = fechaStr.split('/');
        if (partes.length === 3) {
            const dia = parseInt(partes[0]);
            const mes = parseInt(partes[1]) - 1;
            const anio = parseInt(partes[2]);
            if (!isNaN(dia) && !isNaN(mes) && !isNaN(anio)) {
                const fecha = new Date(anio, mes, dia);
                if (!isNaN(fecha.getTime())) {
                    return fecha.toISOString().split('T')[0];
                }
            }
        }
    }
    
    // Formato AAAA-MM-DD
    if (fechaStr.includes('-')) {
        const fecha = new Date(fechaStr);
        if (!isNaN(fecha.getTime())) {
            return fecha.toISOString().split('T')[0];
        }
    }
    
    return null;
}

function importarClientesCSV(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const texto = e.target.result;
        const { encabezados, filas } = parsearCSV(texto);
        
        // Validar encabezados
        const requeridos = ['nombre', 'telefono', 'fecha_atencion'];
        const faltantes = requeridos.filter(r => !encabezados.includes(r));
        
        if (faltantes.length > 0) {
            alert(`❌ El CSV no tiene las columnas requeridas: ${faltantes.join(', ')}`);
            return;
        }
        
        // Procesar filas
        const importados = [];
        const omitidos = [];
        const errores = [];
        
        filas.forEach(fila => {
            const { nombre, telefono, fecha_atencion } = fila.datos;
            const nombreCorregido = corregirTexto(nombre);
            
            // Validar nombre
            if (!nombreCorregido || nombreCorregido === '') {
                errores.push(`Línea ${fila.linea}: falta el nombre`);
                return;
            }
            
            // Validar teléfono
            const telNormalizado = normalizarTelefono(telefono);
            if (!telNormalizado) {
                errores.push(`Línea ${fila.linea}: teléfono inválido (${telefono})`);
                return;
            }
            
            // Validar fecha
            const fechaISO = parsearFecha(fecha_atencion);
            if (!fechaISO) {
                errores.push(`Línea ${fila.linea}: fecha inválida (${fecha_atencion})`);
                return;
            }
            
            // Verificar duplicados por teléfono
            const duplicado = clientes.find(c => 
                normalizarTelefono(c.telefono) === telNormalizado
            );
            
            if (duplicado) {
                omitidos.push(`Línea ${fila.linea}: ${nombre} ya existe (${telefono})`);
                return;
            }
            
            // Agregar cliente
            const nuevoCliente = {
                id: generarId(),
                nombre: nombreCorregido,
                telefono: telNormalizado,
                estado: 'Atendido',
                fechaCreacion: fechaISO,
                fechaAtencion: fechaISO,
                ultimoContacto: fechaISO
            };
            
            clientes.unshift(nuevoCliente);
            importados.push(nombreCorregido);
        });
        
        // Guardar y refrescar
        refrescarSistema();
        
        // Mostrar resultados
        mostrarResultadosImportacion(importados.length, omitidos.length, errores, omitidos, errores);
    };
    
    reader.readAsText(file);
}

function mostrarResultadosImportacion(importados, omitidosCount, erroresCount, listaOmitidos, listaErrores) {
    const container = document.getElementById('importResultados');
    if (!container) return;
    
    let clase = 'exito';
    if (erroresCount > 0) clase = 'advertencia';
    if (importados === 0) clase = 'error';
    
    let html = `
        <h3>📊 Resultado de la Importación</h3>
        <div class="resumen">
            <div class="resumen-item">
                <span class="num">${importados}</span>
                <span class="lbl">✅ Importados</span>
            </div>
            <div class="resumen-item">
                <span class="num">${omitidosCount}</span>
                <span class="lbl">⏭️ Omitidos</span>
            </div>
            <div class="resumen-item">
                <span class="num">${erroresCount}</span>
                <span class="lbl">❌ Errores</span>
            </div>
        </div>
    `;
    
    if (listaErrores.length > 0) {
        html += `
            <p style="margin: 10px 0 6px; font-weight:600; color:#991B1B;">Errores encontrados:</p>
            <ul class="errores-lista">
                ${listaErrores.map(e => `<li>${e}</li>`).join('')}
            </ul>
        `;
    }
    
    if (listaOmitidos.length > 0) {
        html += `
            <p style="margin: 10px 0 6px; font-weight:600; color:#92400E;">Duplicados omitidos:</p>
            <ul class="errores-lista">
                ${listaOmitidos.map(o => `<li style="background:#FFFBEB;border-left-color:#F59E0B;">${o}</li>`).join('')}
            </ul>
        `;
    }
    
    container.innerHTML = html;
    container.className = `import-resultados ${clase}`;
    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    mostrarToast(`✅ Importación completa: ${importados} clientes`);
}

// ---------- NORMALIZAR TELÉFONO (Chile) ----------
function normalizarTelefono(telefono) {
    if (!telefono) return null;
    
    // Eliminar espacios, guiones, paréntesis y puntos
    let limpio = String(telefono).replace(/[\s\-\(\)\.]/g, '');
    
    // Eliminar el signo +
    limpio = limpio.replace(/\+/g, '');
    
    // Eliminar el 56 si está al inicio
    if (limpio.startsWith('56')) {
        limpio = limpio.substring(2);
    }
    
    // Ahora debe quedar un número de 9 dígitos que empieza con 9
    if (!/^9\d{8}$/.test(limpio)) {
        return null;
    }
    
    // Devolver con 56 al inicio
    return '56' + limpio;
}





function restaurarBackup() {
    // Crear input de archivo si no existe
    let input = document.getElementById('backupFileInput');
    if (!input) {
        input = document.createElement('input');
        input.id = 'backupFileInput';
        input.type = 'file';
        input.accept = '.json';
        input.style.display = 'none';
        document.body.appendChild(input);
    }


    
    // Manejar la selección del archivo
    input.onchange = function(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const datos = JSON.parse(e.target.result);
                
                // Validar estructura
                if (!datos.clientes || !Array.isArray(datos.clientes)) {
                    alert('❌ El archivo no es válido. No contiene datos de clientes.');
                    return;
                }
                
                // Confirmar restauración
                const mensaje = `⚠️ ¿Restaurar respaldo?\n\n` +
                    `📅 Fecha del respaldo: ${datos.fecha || 'No especificada'}\n` +
                    `📋 Clientes: ${datos.clientes.length}\n` +
                    `⚙️ Configuración: ${datos.configuracion ? 'Sí' : 'No'}\n\n` +
                    `Se reemplazarán TODOS los datos actuales.`;
                
                if (!confirm(mensaje)) return;
                if (!confirm('¿Estás completamente seguro?')) return;
                
                // Restaurar clientes
                clientes = datos.clientes;
                guardarClientes();
                
                // Restaurar configuración
                if (datos.configuracion) {
                    localStorage.setItem('negocioInteligenteConfig', datos.configuracion);
                }
                

                // Recargar interfaz
                cargarConfiguracion();
                refrescarSistema();  // <-- AGREGAR ESTA LÍNEA
                
                mostrarToast('✅ Respaldo restaurado correctamente (' + clientes.length + ' clientes)');
                
            } catch (error) {
                alert('❌ Error al leer el archivo. Asegúrate de que sea un respaldo válido.');
                console.error('Error al restaurar:', error);
            }
        };
        reader.readAsText(file);
        
        // Limpiar input para permitir seleccionar el mismo archivo nuevamente
        input.value = '';
    };
    
    // Abrir selector de archivos
    input.click();
}


// ---------- EXPORTAR FUNCIONES GLOBALES ----------
window.filtrar = filtrar;
window.buscarCliente = buscarCliente;
window.recordarCliente = recordarCliente;
window.cambiarEstado = cambiarEstado;
window.eliminarCliente = eliminarCliente;
window.exportarReporte = exportarReporte;
window.reiniciarCiclo = reiniciarCiclo;
window.cargarConfiguracion = cargarConfiguracion;
window.guardarConfiguracion = guardarConfiguracion;
window.enviarInformeCorreo = enviarInformeCorreo;
window.guardarBackup = guardarBackup;
window.restaurarBackup = restaurarBackup;
window.actualizarEstadisticas = actualizarEstadisticas;
window.actualizarInfoBackup = actualizarInfoBackup;
window.buscarClienteEspecifico = buscarClienteEspecifico;
window.abrirConfiguracion = abrirConfiguracion;
window.cerrarConfiguracion = cerrarConfiguracion;
window.abrirImportacion = abrirImportacion;
window.descargarPlantillaCSV = descargarPlantillaCSV;
window.importarClientesCSV = importarClientesCSV;
window.normalizarTelefono = normalizarTelefono;
