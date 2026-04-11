let editIndex = null;

function addClient() {
    const name = document.getElementById('clientName').value;
    const phone = document.getElementById('clientPhone').value;
    const status = document.getElementById('status').value;
    
    // Obtener fecha actual
    const now = new Date();
    const dateStr = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    if(!name || !phone) return alert("Por favor completa los campos obligatorios.");

    let clients = JSON.parse(localStorage.getItem('whatsControlPRO')) || [];

    if(editIndex !== null) {
        // Al editar, mantenemos la fecha que ya tenía el cliente
        const originalDate = clients[editIndex].date || dateStr;
        clients[editIndex] = { name, phone, status, date: originalDate };
        editIndex = null;
        document.getElementById('mainBtn').innerText = "Registrar Cliente";
    } else {
        clients.push({ name, phone, status, date: dateStr });
    }

    localStorage.setItem('whatsControlPRO', JSON.stringify(clients));
    document.getElementById('clientName').value = "";
    document.getElementById('clientPhone').value = "";
    render();
}

function deleteClient(index) {
    if(confirm("¿Seguro que deseas eliminar este registro?")) {
        let clients = JSON.parse(localStorage.getItem('whatsControlPRO'));
        clients.splice(index, 1);
        localStorage.setItem('whatsControlPRO', JSON.stringify(clients));
        render();
    }
}

function editClient(index) {
    let clients = JSON.parse(localStorage.getItem('whatsControlPRO'));
    const c = clients[index];
    document.getElementById('clientName').value = c.name;
    document.getElementById('clientPhone').value = c.phone;
    document.getElementById('status').value = c.status;
    editIndex = index;
    document.getElementById('mainBtn').innerText = "Actualizar Datos";
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function exportToCSV() {
    let clients = JSON.parse(localStorage.getItem('whatsControlPRO')) || [];
    if(clients.length === 0) return alert("No hay datos para exportar.");
    let csvContent = "sep=;\nNombre;Telefono;Estado;Fecha\n";
    clients.forEach(c => { csvContent += `${c.name};${c.phone};${c.status};${c.date}\n`; });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "DB_WhatsControl_PRO.csv";
    link.click();
}

function render() {
    const list = document.getElementById('clientList');
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const filterValue = document.getElementById('filterStatus').value;
    let clients = JSON.parse(localStorage.getItem('whatsControlPRO')) || [];

    // Actualización de los 4 Contadores Profesionales
    document.getElementById('totalStats').innerText = clients.length;
    document.getElementById('processStats').innerText = clients.filter(c => 
        ['Nuevo', 'Interesado', 'Pendiente'].includes(c.status)).length;
    document.getElementById('closedStats').innerText = clients.filter(c => c.status === 'Cliente').length;
    document.getElementById('lostStats').innerText = clients.filter(c => c.status === 'No Respondio').length;

    list.innerHTML = "";
    clients.forEach((c, i) => {
        const matchesSearch = c.name.toLowerCase().includes(searchTerm);
        const matchesFilter = filterValue === "Todos" || c.status === filterValue;

        if (matchesSearch && matchesFilter) {
            const card = document.createElement('div');
            card.className = `client-card card-${c.status.replace(/\s/g, '')}`;
            card.innerHTML = `
                <div class="client-info">
                    <strong>${c.name}</strong>
                    <div class="status-date-row">
                        <span>${c.status}</span>
                        <span>•</span>
                        <span>${c.date || 'Recién añadido'}</span>
                    </div>
                </div>
                <div class="actions">
                    <button class="btn-action btn-ws" onclick="window.open('https://wa.me/${c.phone}')">💬</button>
                    <button class="btn-action btn-edit" onclick="editClient(${i})">✏️</button>
                    <button class="btn-action btn-delete" onclick="deleteClient(${i})">🗑️</button>
                </div>`;
            list.appendChild(card);
        }
    });
}
window.onload = render;
