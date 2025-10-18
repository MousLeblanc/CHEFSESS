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

document.getElementById('residents-link').addEventListener('click', (e) => {
  e.preventDefault();
  window.location.href = `/pages/site-residents.html?siteId=${siteId}`;
});

document.getElementById('refresh-btn').addEventListener('click', () => {
  loadMenus();
});

let currentWeek = null;

async function loadSiteData() {
  try {
    const response = await fetch(`/api/sites/${siteId}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Site non trouvé');
    }

    const site = await response.json();

    document.getElementById('site-name').textContent = site.site_name;
    document.getElementById('site-title').textContent = site.site_name;
    document.getElementById('site-type').textContent = `Type: ${getTypeLabel(site.type)}`;

  } catch (error) {
    console.error('Erreur:', error);
    alert('Erreur lors du chargement des données du site');
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

function loadWeekSelector() {
  const select = document.getElementById('week-select');
  const weeks = generateWeeks(4);

  select.innerHTML = weeks.map(week => `
    <option value="${week.value}">${week.label}</option>
  `).join('');

  currentWeek = weeks[0].value;
  select.value = currentWeek;

  select.addEventListener('change', (e) => {
    currentWeek = e.target.value;
    loadMenus();
  });
}

function generateWeeks(count) {
  const weeks = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + (i * 7));

    const year = date.getFullYear();
    const weekNumber = getWeekNumber(date);
    const weekValue = `${year}-W${weekNumber.toString().padStart(2, '0')}`;
    const weekLabel = `Semaine ${weekNumber} (${formatDate(date)})`;

    weeks.push({ value: weekValue, label: weekLabel });
  }

  return weeks;
}

function getWeekNumber(date) {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

function formatDate(date) {
  return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
}

async function loadMenus() {
  const content = document.getElementById('dashboard-content');
  content.innerHTML = '<div class="loading">Chargement des menus...</div>';

  try {
    const response = await fetch(`/api/sites/${siteId}/menus?yearWeek=${currentWeek}`, {
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des menus');
    }

    const menus = await response.json();

    if (!menus || menus.length === 0) {
      content.innerHTML = `
        <div class="no-menu">
          <div class="no-menu-icon">🍽️</div>
          <h3>Aucun menu disponible</h3>
          <p>Les menus pour cette semaine n'ont pas encore été synchronisés depuis le groupe.</p>
        </div>
      `;
      updateSyncStatus(menus);
      return;
    }

    content.innerHTML = `
      <div class="menu-section">
        <h2>Menus de la semaine</h2>
        <div class="menu-grid">
          ${menus.map(menu => createMenuCard(menu)).join('')}
        </div>
      </div>
    `;

    updateSyncStatus(menus);

  } catch (error) {
    console.error('Erreur:', error);
    content.innerHTML = `
      <div class="no-menu">
        <div class="no-menu-icon">⚠️</div>
        <h3>Erreur</h3>
        <p>Erreur lors du chargement des menus</p>
      </div>
    `;
  }
}

function createMenuCard(menu) {
  const entriesHtml = (menu.entries || []).map(entry => `
    <li class="menu-entry">
      <span>${formatDate(new Date(entry.date))}</span> -
      <span>${entry.service === 'midi' ? 'Midi' : 'Soir'}</span>
    </li>
  `).join('');

  return `
    <div class="menu-card">
      <h3>${menu.label || 'Menu'}</h3>
      <ul class="menu-entries">
        ${entriesHtml}
      </ul>
      <div class="menu-footer">
        Synchronisé le ${new Date(menu.last_synced_at).toLocaleString('fr-FR')}
      </div>
    </div>
  `;
}

function updateSyncStatus(menus) {
  const syncStatus = document.getElementById('sync-status');
  const syncIcon = document.getElementById('sync-icon');
  const syncMessage = document.getElementById('sync-message');

  if (!menus || menus.length === 0) {
    syncStatus.className = 'sync-status pending';
    syncIcon.textContent = '⚠️';
    syncMessage.textContent = 'Aucun menu synchronisé pour cette semaine';
  } else {
    syncStatus.className = 'sync-status synced';
    syncIcon.textContent = '✅';
    syncMessage.textContent = `${menus.length} menu(s) synchronisé(s)`;
  }

  syncStatus.style.display = 'flex';
}

loadSiteData();
loadWeekSelector();
loadMenus();
