// client/JS/entreprise-dashboard.js
import { loadSuppliersData, renderSuppliersList, updateCartCount, initSupplierTab } from './supplier-common.js';

console.log('Cantine d Entreprise Dashboard JS charge');

// Variables globales
let groupCounter = 1;

// Options pour les cantines d'entreprise
const dietOptions = [
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'sans_lactose', label: 'Sans lactose' },
  { value: 'halal', label: 'Halal' },
  { value: 'cacher', label: 'Casher' },
  { value: 'hypocalorique', label: 'Hypocalorique' },
  { value: 'sportif', label: 'Sportif / Protéiné' }
];

const allergyOptions = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'lactose', label: 'Lactose' },
  { value: 'arachides', label: 'Arachides' },
  { value: 'fruits_a_coque', label: 'Fruits à coque' },
  { value: 'œufs', label: 'Œufs' },
  { value: 'poisson', label: 'Poisson' },
  { value: 'crustaces', label: 'Crustacés' },
  { value: 'soja', label: 'Soja' },
  { value: 'celeri', label: 'Céleri' },
  { value: 'moutarde', label: 'Moutarde' },
  { value: 'sesame', label: 'Sésame' },
  { value: 'sulfites', label: 'Sulfites' },
  { value: 'lupin', label: 'Lupin' },
  { value: 'mollusques', label: 'Mollusques' }
];

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM charge - Initialisation Cantine Entreprise Dashboard');
  initTabs();
  addGroup();
  // initSupplierTab(); // Supprimé - sera appelé quand l'onglet est activé
  
  const addGroupBtn = document.getElementById('add-group-btn');
  if (addGroupBtn) addGroupBtn.addEventListener('click', addGroup);
  
  const menuForm = document.getElementById('menu-form');
  // if (menuForm) menuForm.addEventListener('submit', handleFormSubmit); // Désactivé - nouveau système utilisé
  
  // Bouton Actualiser pour les fournisseurs
  const refreshSuppliersBtn = document.getElementById('refresh-suppliers-btn');
  if (refreshSuppliersBtn) {
    refreshSuppliersBtn.addEventListener('click', () => {
      console.log('Actualisation des fournisseurs...');
      if (window.refreshSuppliers) {
        window.refreshSuppliers();
      }
    });
  }
  
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }
});

function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(`${tab}-tab`).classList.add('active');
      
      // Charger les fournisseurs quand l'onglet est activé
      if (tab === 'suppliers') {
        console.log('Onglet Fournisseurs activé - Chargement des fournisseurs...');
        initSupplierTab();
      }
      
      // Charger la comparaison quand l'onglet Comparaison est sélectionné
      if (tab === 'supplier-comparison') {
        console.log('⚖️ Chargement de la comparaison des fournisseurs');
        if (typeof window.loadSupplierComparison === 'function') {
          window.loadSupplierComparison();
        } else {
          console.error('❌ loadSupplierComparison non disponible');
        }
      }
    });
  });
}

function addGroup() {
  const container = document.getElementById('employee-groups-container');
  if (!container) return;
  
  const groupId = `group-${groupCounter++}`;
  const groupDiv = document.createElement('div');
  groupDiv.className = 'employee-group';
  groupDiv.id = groupId;
  groupDiv.innerHTML = `
    <div class="group-header">
      <h4><i class="fas fa-user-tie"></i> Groupe ${groupCounter - 1}</h4>
      <button type="button" class="remove-group-btn" onclick="removeGroup('${groupId}')">
        <i class="fas fa-trash"></i> Retirer
      </button>
    </div>
    
    <div class="group-content">
      <div class="form-group">
        <label>Nombre d'employés dans ce groupe :</label>
        <input type="number" class="form-control employees-count" min="1" value="50" required>
      </div>
      
      <div class="form-group">
        <label>Régimes alimentaires (optionnel) :</label>
        <div class="restrictions-list diets-list"></div>
        <button type="button" class="add-restriction-btn" onclick="addDiet('${groupId}')">
          <i class="fas fa-plus"></i> Ajouter un régime
        </button>
      </div>
      
      <div class="form-group">
        <label>Allergies alimentaires (optionnel) :</label>
        <div class="restrictions-list allergies-list"></div>
        <button type="button" class="add-restriction-btn" onclick="addAllergy('${groupId}')">
          <i class="fas fa-plus"></i> Ajouter une allergie
        </button>
      </div>
    </div>
  `;
  
  container.appendChild(groupDiv);
  console.log(`Groupe ${groupCounter - 1} ajoute`);
}

window.removeGroup = function(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    const groups = document.querySelectorAll('.employee-group');
    if (groups.length > 1) {
      group.remove();
    } else {
      alert('Vous devez avoir au moins un groupe d\'employés.');
    }
  }
};

window.addDiet = function(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  
  const dietsList = group.querySelector('.diets-list');
  const restrictionItem = document.createElement('div');
  restrictionItem.className = 'restriction-item';
  restrictionItem.innerHTML = `
    <select class="form-control diet-select">
      <option value="">-- Sélectionnez un régime --</option>
      ${dietOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
    <input type="number" class="form-control diet-count" placeholder="Nombre" min="1" value="1">
    <button type="button" class="remove-restriction-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  dietsList.appendChild(restrictionItem);
};

window.addAllergy = function(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  
  const allergiesList = group.querySelector('.allergies-list');
  const restrictionItem = document.createElement('div');
  restrictionItem.className = 'restriction-item';
  restrictionItem.innerHTML = `
    <select class="form-control allergy-select">
      <option value="">-- Sélectionnez une allergie --</option>
      ${allergyOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
    <input type="number" class="form-control allergy-count" placeholder="Nombre" min="1" value="1">
    <button type="button" class="remove-restriction-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  allergiesList.appendChild(restrictionItem);
};

async function handleFormSubmit(e) {
  e.preventDefault();
  console.log('📝 Soumission du formulaire Cantine Entreprise');
  
  const numDays = document.getElementById('num-days').value;
  const groups = [];
  const groupElements = document.querySelectorAll('.employee-group');
  
  groupElements.forEach((groupEl, index) => {
    const employeesCount = groupEl.querySelector('.employees-count');
    
    const diets = [];
    groupEl.querySelectorAll('.diets-list .restriction-item').forEach(item => {
      const select = item.querySelector('.diet-select');
      const count = item.querySelector('.diet-count');
      if (select.value && count.value) {
        diets.push({ type: select.value, count: parseInt(count.value) });
      }
    });
    
    const allergies = [];
    groupEl.querySelectorAll('.allergies-list .restriction-item').forEach(item => {
      const select = item.querySelector('.allergy-select');
      const count = item.querySelector('.allergy-count');
      if (select.value && count.value) {
        allergies.push({ type: select.value, count: parseInt(count.value) });
      }
    });
    
    groups.push({
      groupNumber: index + 1,
      employeesCount: parseInt(employeesCount.value),
      diets,
      allergies
    });
  });
  
  const formData = {
    establishmentType: 'cantine_entreprise',
    numDays: parseInt(numDays),
    groups
  };
  
  console.log('📤 Données du formulaire:', formData);
  alert('Fonctionnalité de génération de menus Cantine Entreprise à venir !\n\nDonnées collectées:\n' + JSON.stringify(formData, null, 2));
}
