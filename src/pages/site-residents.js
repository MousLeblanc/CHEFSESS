const urlParams = new URLSearchParams(window.location.search);
const siteId = urlParams.get('siteId');

if (!siteId) {
  window.location.href = '/';
}

document.querySelector('.logout-link').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  localStorage.clear();
  window.location.href = '/';
});

document.getElementById('dashboard-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = `/pages/site-dashboard.html?siteId=${siteId}`;
});

document.getElementById('add-resident-btn').href += `?siteId=${siteId}`;

const searchInput = document.getElementById('search-input');
const statusFilter = document.getElementById('status-filter');

searchInput.addEventListener('input', () => loadResidents());
statusFilter.addEventListener('change', () => loadResidents());

async function loadResidents() {
  const search = searchInput.value;
  const status = statusFilter.value;

  const list = document.getElementById('residents-list');
  list.innerHTML = '<div class="loading">Chargement...</div>';

  try {
    let url = `/api/residents/site/${siteId}?status=${status}`;
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    const response = await fetch(url, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des résidents');
    }

    const data = await response.json();
    const residents = data.residents || [];

    if (residents.length === 0) {
      list.innerHTML = `
        <div class="no-residents">
          <p>Aucun résident trouvé</p>
        </div>
      `;
      return;
    }

    list.innerHTML = `
      <table class="residents-table">
        <thead>
          <tr>
            <th>Nom</th>
            <th>Prénom</th>
            <th>Date de naissance</th>
            <th>Chambre</th>
            <th>Statut</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${residents.map(resident => `
            <tr>
              <td>${resident.last_name}</td>
              <td>${resident.first_name}</td>
              <td>${new Date(resident.date_of_birth).toLocaleDateString('fr-FR')}</td>
              <td>${resident.room_number || '-'}</td>
              <td><span class="status-badge status-${resident.status}">${resident.status}</span></td>
              <td>
                <button class="btn btn-sm" onclick="viewResident('${resident.id}')">Voir</button>
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

  } catch (error) {
    console.error('Erreur:', error);
    list.innerHTML = `
      <div class="error-message">
        <p>Erreur lors du chargement des résidents</p>
      </div>
    `;
  }
}

window.viewResident = (id) => {
  alert(`Voir résident ${id} - Fonctionnalité à implémenter`);
};

loadResidents();
