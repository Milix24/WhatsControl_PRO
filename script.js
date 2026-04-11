let editIndex = null;

function addClient() {
    const name = document.getElementById('clientName').value.trim();
    let phone = document.getElementById('clientPhone').value.trim();
    const status = document.getElementById('status').value;
    const btn = document.getElementById('mainBtn');

    if(!name || !phone) return alert("Por favor, ingresa los datos completos.");

    phone = phone.replace(/\D/g, ''); 
    const d = new Date();
    // FECHA CON AÑO INCLUIDO
    const dateStr = `${d.getDate()}/${d.getMonth()+1}/${d.getFullYear()}`;

    let clients = JSON.parse(localStorage.getItem('whatsPRO_vFinal')) || [];

    if(editIndex !== null) {
        clients[editIndex] = { ...clients[editIndex], name, phone, status };
        editIndex = null;
        btn.innerText = "Guardar en Cartera";
        btn.style.background = "#0369a1";
    } else {
        clients.push({ name, phone, status, date: dateStr });
    }

    localStorage.setItem('whatsPRO_vFinal', JSON.stringify(clients));
    render();

    document.getElementById('clientName').value = "";
    document.getElementById('clientPhone').value = "";
}

function render() {
    const list = document.getElementById('clientList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filter = document.getElementById('filterStatus').value;
    let clients = JSON.parse(localStorage.getItem('whatsPRO_vFinal')) || [];

    const colors = {
        "Nuevo": "#0369a1",
        "Interesado": "#c2410c",
        "Pendiente": "#7e22ce",
        "Venta Cerrada": "#15803d"
    };

    document.getElementById('countNuevo').innerText = clients.filter(c => c.status === "Nuevo").length;
    document.getElementById('countInteresado').innerText = clients.filter(c => c.status === "Interesado").length;
    document.getElementById('countPendiente').innerText = clients.filter(c => c.status === "Pendiente").length;
    document.getElementById('countVenta').innerText = clients.filter(c => c.status === "Venta Cerrada").length;

    list.innerHTML = "";
    clients.forEach((c, i) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm);
        const matchesFilter = (filter === "Todos" || c.status === filter);

        if(matchesSearch && matchesFilter) {
            const dotColor = colors[c.status] || "#ccc";
            const card = document.createElement('div');
            card.className = "client-card";
            card.innerHTML = `
                <div class="client-info">
                    <div class="name-wrapper">
                        <div class="status-dot" style="background-color: ${dotColor}"></div>
                        <strong>${c.name}</strong>
                    </div>
                    <span>${c.status} • Registrado: ${c.date}</span>
                    <span style="color:${dotColor}; font-weight:bold; font-size:10px; margin-top:2px;">+${c.phone}</span>
                </div>
                <div class="actions">
                    <button class="btn-action btn-ws" onclick="window.open('https://wa.me/${c.phone}')" title="Chat Directo">
                        <i class="fab fa-whatsapp"></i>
                    </button>
                    <button class="btn-action btn-edit" onclick="editClient(${i})" title="Editar">
                        <i class="fas fa-user-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" onclick="deleteClient(${i})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>`;
            list.appendChild(card);
        }
    });
}

function clearCycle() {
    if(confirm("🛑 Esto borrará toda la lista para un nuevo mes. ¿Continuar?")) {
        localStorage.removeItem('whatsPRO_vFinal');
        render();
    }
}

function exportToExcel() {
    let clients = JSON.parse(localStorage.getItem('whatsPRO_vFinal')) || [];
    if(clients.length === 0) return alert("Nada para exportar.");
    let csv = "\uFEFFNombre;WhatsApp;Estado;Fecha\n";
    clients.forEach(c => csv += `${c.name};${c.phone};${c.status};${c.date}\n`);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Reporte_WhatsControl_PRO.csv`;
    link.click();
}

function deleteClient(i) {
    if(confirm("¿Eliminar este contacto?")) {
        let clients = JSON.parse(localStorage.getItem('whatsPRO_vFinal'));
        clients.splice(i, 1);
        localStorage.setItem('whatsPRO_vFinal', JSON.stringify(clients));
        render();
    }
}

function editClient(i) {
    let clients = JSON.parse(localStorage.getItem('whatsPRO_vFinal'));
    const c = clients[i];
    document.getElementById('clientName').value = c.name;
    document.getElementById('clientPhone').value = c.phone;
    document.getElementById('status').value = c.status;
    editIndex = i;
    document.getElementById('mainBtn').innerText = "Actualizar Registro 💾";
    document.getElementById('mainBtn').style.background = "#c2410c";
    window.scrollTo({top: 0, behavior: 'smooth'});
}

window.onload = render;
