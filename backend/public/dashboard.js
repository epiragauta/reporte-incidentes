
// Initialize the map
const map = L.map('map').setView([4.5709, -74.2973], 6); // Default view: Colombia

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap contributors'
}).addTo(map);

let markers = L.layerGroup().addTo(map);

async function loadIncidents() {
    const filter = document.getElementById('filter').value;
    const url = `/api/incidents?${filter}`;

    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const incidents = data.incidents;

        // Clear existing markers
        markers.clearLayers();

        incidents.forEach(incident => {
            const popupContent = `
                <div class="incident-popup">
                    <h3>Incidente</h3>
                    <p><strong>Descripción:</strong> ${incident.description}</p>
                    <p><strong>Fecha:</strong> ${new Date(incident.timestamp).toLocaleString()}</p>
                    <p><strong>Verificado:</strong> ${incident.verified ? 'Sí' : 'No'}</p>
                    <p><strong>Anónimo:</strong> ${incident.is_anonymous ? 'Sí' : 'No'}</p>
                </div>
            `;

            L.marker([incident.lat, incident.long])
                .addTo(markers)
                .bindPopup(popupContent);
        });

    } catch (error) {
        console.error('Error fetching incidents:', error);
        alert('Error al cargar incidentes. Por favor, intente nuevamente.');
    }
}

// Initial load
loadIncidents();

document.getElementById('filter').addEventListener('change', loadIncidents);
