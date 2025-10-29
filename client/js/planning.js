// planning.js - gestion du planning des menus
import { fetchProtectedAPI } from './apiHelper.js'; 
import { showNotification, formatDate } from './init.js'; 


// Calcul du lundi de la semaine courante
function getCurrentMonday(date = new Date()) {
const day = date.getDay();
const diff = day === 0 ? -6 : 1 - day; // dimanche = 0
const monday = new Date(date);
monday.setDate(date.getDate() + diff);
return monday;
}

let currentMonday = getCurrentMonday();

function formatDateISO(date) {
return date.toISOString().split('T')[0];
}

async function loadWeekData(weekStart) {
    const startDate = formatDate(weekStart, 'YYYY-MM-DD');

    showNotification('Chargement des données du planning...', 'info'); 

    try {
        
        const response = await fetchProtectedAPI(`http://localhost:5000/api/menus?start=${startDate}`); //
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || `Erreur HTTP ${response.status}`);
        }
        const menus = await response.json(); 
        
        
        updateCalendarWithMenus(menus); 
        
        showNotification('Données du planning chargées avec succès', 'success');
    } catch (error) {
        console.error('Erreur lors du chargement des données du planning:', error);
        showNotification(`Erreur de chargement du planning: ${error.message}`, 'danger');
    }
}
function updateCalendarWithMenus(menus) {
document.querySelectorAll('.calendar-day .menu-list').forEach(div => div.innerHTML = '');

menus.forEach(menu => {
const dateStr = formatDateISO(new Date(menu.date));
const dayEl = document.querySelector(`.calendar-day[data-date="${dateStr}"]`);
if (dayEl) {
const menuList = dayEl.querySelector('.menu-list');
if (menuList) {
const div = document.createElement('div');
div.className = 'menu-item';
div.innerHTML = `<div class="menu-title">${menu.title}</div>`;
menuList.appendChild(div);
}
}
});
}

async function generateWeekPlanning(startDate) {
  try {
    const res = await fetch('/api/menus/generate', {
      credentials: 'include', // 🍪 Cookie HTTP-Only
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      body: JSON.stringify({ startDate }) 
    });

    if (!res.ok) {
      const text = await res.text(); 
      console.error("❌ Erreur brute:", text);
      throw new Error("Réponse HTTP invalide");
    }

    const data = await res.json();
    showNotification("Planning généré avec succès", "success");
    await loadWeekMenus(startDate);
  } catch (err) {
    console.error(err);
    showNotification("Erreur lors de la génération", "error");
  }
}

function renderCurrentWeekRange(startDate) {
const monday = new Date(startDate);
const sunday = new Date(monday);
sunday.setDate(monday.getDate() + 6);
const options = { day: 'numeric', month: 'short' };
const rangeText = `${monday.toLocaleDateString('fr-FR', options)} au ${sunday.toLocaleDateString('fr-FR', options)}`;
document.getElementById('week-range').textContent = rangeText;

const dayEls = document.querySelectorAll('.calendar-day');
dayEls.forEach((el, i) => {
const d = new Date(monday);
d.setDate(monday.getDate() + i);
el.setAttribute('data-date', formatDateISO(d));
const dayNum = el.querySelector('.day-number');
if (dayNum) dayNum.textContent = `${d.getDate()} ${d.toLocaleDateString('fr-FR', { month: 'short' })}`;
});
}

function setupButtons() {
    console.log('✅ Bouton précédent actif');
console.log('✅ Bouton suivant actif');
console.log('✅ Bouton génération actif');

document.getElementById('prev-week').addEventListener('click', () => {
currentMonday.setDate(currentMonday.getDate() - 7);
renderCurrentWeekRange(currentMonday);
loadWeekMenus(formatDateISO(currentMonday));
});

document.getElementById('next-week').addEventListener('click', () => {
currentMonday.setDate(currentMonday.getDate() + 7);
renderCurrentWeekRange(currentMonday);
loadWeekMenus(formatDateISO(currentMonday));
});

document.getElementById('generate-week-plan').addEventListener('click', () => {
  const startDate = formatDateISO(currentMonday); 
  console.log("▶️ Envoi à /generate :", startDate); 
  generateWeekPlanning(startDate);
});
document.querySelectorAll('.add-menu-btn').forEach(btn => {
btn.addEventListener('click', async () => {
const date = btn.dataset.date;
const res = await fetch('/api/menus', {
credentials: 'include', // 🍪 Cookie HTTP-Only
method: 'POST',
headers: {
'Content-Type': 'application/json',
// 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Cache-Control': 'no-cache, no-store, must-revalidate',
'Pragma': 'no-cache',
'Expires': '0'
},
body: JSON.stringify({ date })
});
const result = await res.json();
if (result.success) {
showNotification("Menu ajouté", "success");
await loadWeekMenus(formatDateISO(currentMonday));
} else {
showNotification("Erreur lors de l'ajout", "error");
}
});
});
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('📅 planning.js chargé');

renderCurrentWeekRange(currentMonday);
loadWeekMenus(formatDateISO(currentMonday));
setupButtons();
});
