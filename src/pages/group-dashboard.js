const user = JSON.parse(localStorage.getItem('user') || '{}');

if (!user || !user.groupId) {
  window.location.href = '/pages/login.html';
}

document.getElementById('user-name').textContent = user.name;

document.querySelector('.logout-link').addEventListener('click', async (e) => {
  e.preventDefault();
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  localStorage.clear();
  window.location.href = '/';
});

const modal = document.getElementById('create-site-modal');
const createSiteBtn = document.getElementById('create-site-btn');
const closeModal = document.querySelector('.modal-close');
const createSiteForm = document.getElementById('create-site-form');

createSiteBtn.addEventListener('click', () => {
  modal.style.display = 'flex';
});

closeModal.addEventListener('click', () => {
  modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.style.display = 'none';
  }
});

createSiteForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const siteName = document.getElementById('site-name').value;
  const siteType = document.getElementById('site-type').value;

  try {
    const response = await fetch(`/api/groups/${user.groupId}/sites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({
        siteName,
        type: siteType,
      }),
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la création du site');
    }

    modal.style.display = 'none';
    createSiteForm.reset();
    loadSites();
  } catch (error) {
    alert(error.message);
  }
});

async function loadSites() {
  try {
    const response = await fetch(`/api/groups/${user.groupId}/sites`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des sites');
    }

    const sites = await response.json();

    document.getElementById('total-sites').textContent = sites.length;
    document.getElementById('active-sites').textContent = sites.filter(s => s.is_active).length;

    const sitesList = document.getElementById('sites-list');
    sitesList.innerHTML = sites.map(site => `
      <div class="site-card">
        <h3>${site.site_name}</h3>
        <p class="site-type">${getTypeLabel(site.type)}</p>
        <p class="site-status ${site.is_active ? 'active' : 'inactive'}">
          ${site.is_active ? '✅ Actif' : '❌ Inactif'}
        </p>
        <div class="site-actions">
          <a href="/pages/site-dashboard.html?siteId=${site.id}" class="btn btn-sm">Voir</a>
        </div>
      </div>
    `).join('');

  } catch (error) {
    console.error('Erreur:', error);
  }
}

function getTypeLabel(type) {
  const types = {
    'ehpad': 'EHPAD',
    'hopital': 'Hôpital',
    'ecole': 'École',
    'maison_retraite': 'Maison de retraite',
    'cantine_entreprise': 'Cantine d\'entreprise'
  };
  return types[type] || type;
}

loadSites();
