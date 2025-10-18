// client/JS/maison-retraite-dashboard.js
import { loadSuppliersData, renderSuppliersList, updateCartCount, initSupplierTab } from './supplier-common.js';

console.log('🏠 Maison de Retraite Dashboard JS chargé');

// Variables globales
let groupCounter = 1;

// Options similaires à EHPAD mais simplifiées
const textureOptions = [
  { value: 'normale', label: 'Texture normale' },
  { value: 'tendre', label: 'Texture tendre' },
  { value: 'hachée', label: 'Texture hachée' },
  { value: 'mixée', label: 'Texture mixée' }
];

const dietOptions = [
  { value: 'sans_sel', label: 'Sans sel' },
  { value: 'sans_sucre', label: 'Sans sucre' },
  { value: 'enrichi', label: 'Enrichi' },
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'halal', label: 'Halal' },
  { value: 'cacher', label: 'Casher' }
];

const allergyOptions = [
  { value: 'gluten', label: 'Gluten' },
  { value: 'lactose', label: 'Lactose' },
  { value: 'arachides', label: 'Arachides' },
  { value: 'fruits_a_coque', label: 'Fruits à coque' }
];

// Initialisation (même structure que EHPAD)
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM chargé - Initialisation Maison de Retraite Dashboard');
  initTabs();
  addGroup();
  initSupplierTab();
  
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
    });
  });
}

function addGroup() {
  const container = document.getElementById('resident-groups-container');
  if (!container) return;
  
  const groupId = `group-${groupCounter++}`;
  const groupDiv = document.createElement('div');
  groupDiv.className = 'resident-group';
  groupDiv.id = groupId;
  groupDiv.innerHTML = `
    <div class="group-header">
      <h4><i class="fas fa-users"></i> Groupe ${groupCounter - 1}</h4>
      <button type="button" class="remove-group-btn" onclick="removeGroup('${groupId}')">
        <i class="fas fa-trash"></i> Retirer
      </button>
    </div>
    
    <div class="group-content">
      <div class="form-group">
        <label>Texture alimentaire :</label>
        <select class="form-control texture-select" required>
          <option value="">-- Sélectionnez une texture --</option>
          ${textureOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label>Nombre de résidents dans ce groupe :</label>
        <input type="number" class="form-control residents-count" min="1" value="10" required>
      </div>
      
      <div class="form-group">
        <label>Régimes spécifiques (optionnel) :</label>
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
  console.log(`✅ Groupe ${groupCounter - 1} ajouté`);
}

window.removeGroup = function(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    const groups = document.querySelectorAll('.resident-group');
    if (groups.length > 1) {
      group.remove();
    } else {
      alert('Vous devez avoir au moins un groupe de résidents.');
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
  console.log('📝 Soumission du formulaire Maison de Retraite');
  
  const numDays = document.getElementById('num-days').value;
  const groups = [];
  const groupElements = document.querySelectorAll('.resident-group');
  
  groupElements.forEach((groupEl, index) => {
    const textureSelect = groupEl.querySelector('.texture-select');
    const residentsCount = groupEl.querySelector('.residents-count');
    
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
      texture: textureSelect.value,
      residentsCount: parseInt(residentsCount.value),
      diets,
      allergies
    });
  });
  
  const formData = {
    establishmentType: 'maison_de_retraite',
    numDays: parseInt(numDays),
    groups
  };
  
  console.log('📤 Données du formulaire:', formData);
  alert('Fonctionnalité de génération de menus Maison de Retraite à venir !\n\nDonnées collectées:\n' + JSON.stringify(formData, null, 2));
}
