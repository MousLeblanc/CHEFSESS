// client/JS/ecole-dashboard.js
import { loadSuppliersData, renderSuppliersList, updateCartCount, initSupplierTab } from './supplier-common.js';
import { loadStockData, renderStockTable, initStockTab, showAddStockModal, filterStock } from './stock-common.js';

console.log('Ecole Dashboard charge - Cantine Scolaire');

// Variables globales
let groupCounter = 1;

// Options pour les cantines scolaires - Tranches d'âge
const ageRangeOptions = [
  { value: 'maternelle', label: 'Maternelle (2,5-5 ans)' },
  { value: 'primaire_cp_ce1', label: 'Primaire CP-CE1 (6-7 ans)' },
  { value: 'primaire_ce2_cm1', label: 'Primaire CE2-CM1 (8-9 ans)' },
  { value: 'primaire_cm2', label: 'Primaire CM2 (10-11 ans)' },
  { value: 'college', label: 'Collège (12-15 ans)' },
  { value: 'lycee', label: 'Lycée (16-18 ans)' }
];

// Options de régimes alimentaires
const dietOptions = [
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'vegan', label: 'Vegan' },
  { value: 'sans_gluten', label: 'Sans gluten' },
  { value: 'sans_lactose', label: 'Sans lactose' },
  { value: 'halal', label: 'Halal' },
  { value: 'cacher', label: 'Casher' }
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
  console.log('DOM charge - Initialisation Ecole Dashboard');
  initTabs();
  // addGroup(); // Désactivé - Le nouveau système de menu gère cela
  // initSupplierTab(); // Supprimé - sera appelé quand l'onglet est activé
  
  // const addGroupBtn = document.getElementById('add-group-btn');
  // if (addGroupBtn) addGroupBtn.addEventListener('click', addGroup); // Désactivé - nouveau système
  
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
      
      // Charger le stock quand l'onglet est activé
      if (tab === 'stock') {
        console.log('Onglet Stock activé - Chargement du stock...');
        initStockTab();
      }
      // Charger les fournisseurs quand l'onglet est activé
      else if (tab === 'suppliers') {
        console.log('Onglet Fournisseurs activé - Chargement des fournisseurs...');
        initSupplierTab();
      }
    });
  });
}

function addGroup() {
  const container = document.getElementById('age-groups-container');
  if (!container) {
    console.error('Container age-groups-container not found');
    return;
  }
  
  const groupId = `group-${groupCounter++}`;
  const groupDiv = document.createElement('div');
  groupDiv.className = 'age-group';
  groupDiv.id = groupId;
  
  // Générer les options de tranches d'âge
  const ageRangeOptionsHTML = ageRangeOptions.map(opt => 
    `<option value="${opt.value}">${opt.label}</option>`
  ).join('');
  
  groupDiv.innerHTML = `
    <div class="group-header">
      <h4><i class="fas fa-child"></i> Groupe ${groupCounter - 1}</h4>
      <button type="button" class="remove-group-btn" onclick="removeGroup('${groupId}')">
        <i class="fas fa-trash"></i> Retirer
      </button>
    </div>
    
    <div class="group-content">
      <div class="form-group">
        <label>Tranche d'âge :</label>
        <select class="form-control age-range" required>
          <option value="">-- Sélectionnez une tranche d'âge --</option>
          ${ageRangeOptionsHTML}
        </select>
      </div>
      
      <div class="form-group">
        <label>Nombre de personnes :</label>
        <input type="number" class="form-control people-count" min="1" value="30" required>
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
