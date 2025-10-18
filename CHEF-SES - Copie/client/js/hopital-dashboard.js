// client/JS/hopital-dashboard.js
import { loadSuppliersData, renderSuppliersList, updateCartCount, initSupplierTab } from './supplier-common.js';

console.log('🏥 Hôpital Dashboard JS chargé');

// Variables globales
let groupCounter = 1;

// Options pour les groupes Hôpital
const therapeuticDiets = [
  { value: 'diabetique', label: 'Diabétique' },
  { value: 'sans_sel', label: 'Sans sel (hyposodé)' },
  { value: 'hypocalorique', label: 'Hypocalorique' },
  { value: 'hypercalorique', label: 'Hypercalorique / Enrichi' },
  { value: 'sans_residu', label: 'Sans résidu' },
  { value: 'insuffisance_renale', label: 'Insuffisance rénale' },
  { value: 'insuffisance_hepatique', label: 'Insuffisance hépatique' },
  { value: 'insuffisance_cardiaque', label: 'Insuffisance cardiaque' },
  { value: 'post_operatoire', label: 'Post-opératoire' },
  { value: 'chimiotherapie', label: 'Chimiothérapie' }
];

const textureOptions = [
  { value: 'normale', label: 'Texture normale' },
  { value: 'tendre', label: 'Texture tendre' },
  { value: 'hachée', label: 'Texture hachée' },
  { value: 'mixée', label: 'Texture mixée' },
  { value: 'liquide_epais', label: 'Liquide épaissi' },
  { value: 'liquide', label: 'Liquide' }
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
  { value: 'moutarde', label: 'Moutarde' }
];

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  console.log('✅ DOM chargé - Initialisation Hôpital Dashboard');
  
  // Initialisation des onglets
  initTabs();
  
  // Ajouter le premier groupe par défaut
  addGroup();
  
  // Initialiser l'onglet fournisseurs
  initSupplierTab();
  
  // Gestionnaire pour le bouton d'ajout de groupe
  const addGroupBtn = document.getElementById('add-group-btn');
  if (addGroupBtn) {
    addGroupBtn.addEventListener('click', addGroup);
  }
  
  // Gestionnaire pour le formulaire
  const menuForm = document.getElementById('menu-form');
  if (menuForm) {
    menuForm.addEventListener('submit', handleFormSubmit);
  }
  
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
  
  // Gestionnaire pour le bouton de déconnexion
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }
});

// Fonction pour initialiser les onglets
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Retirer la classe active de tous les boutons et contenus
      tabBtns.forEach(b => b.classList.remove('active'));
      tabContents.forEach(c => c.classList.remove('active'));
      
      // Ajouter la classe active au bouton et contenu sélectionné
      btn.classList.add('active');
      document.getElementById(`${tab}-tab`).classList.add('active');
    });
  });
}

// Fonction pour ajouter un groupe de patients
function addGroup() {
  const container = document.getElementById('patient-groups-container');
  if (!container) return;
  
  const groupId = `group-${groupCounter++}`;
  
  const groupDiv = document.createElement('div');
  groupDiv.className = 'patient-group';
  groupDiv.id = groupId;
  groupDiv.innerHTML = `
    <div class="group-header">
      <h4><i class="fas fa-user-injured"></i> Groupe ${groupCounter - 1}</h4>
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
        <label>Nombre de patients dans ce groupe :</label>
        <input type="number" class="form-control patients-count" min="1" value="10" required>
      </div>
      
      <div class="form-group">
        <label>Régimes thérapeutiques (optionnel) :</label>
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

// Fonction pour retirer un groupe
window.removeGroup = function(groupId) {
  const group = document.getElementById(groupId);
  if (group) {
    const groups = document.querySelectorAll('.patient-group');
    if (groups.length > 1) {
      group.remove();
      console.log(`❌ Groupe ${groupId} retiré`);
    } else {
      alert('Vous devez avoir au moins un groupe de patients.');
    }
  }
};

// Fonction pour ajouter un régime thérapeutique
window.addDiet = function(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  
  const dietsList = group.querySelector('.diets-list');
  if (!dietsList) return;
  
  const restrictionItem = document.createElement('div');
  restrictionItem.className = 'restriction-item';
  restrictionItem.innerHTML = `
    <select class="form-control diet-select">
      <option value="">-- Sélectionnez un régime --</option>
      ${therapeuticDiets.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
    <input type="number" class="form-control diet-count" placeholder="Nombre" min="1" value="1">
    <button type="button" class="remove-restriction-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  dietsList.appendChild(restrictionItem);
  console.log(`✅ Régime ajouté au groupe ${groupId}`);
};

// Fonction pour ajouter une allergie
window.addAllergy = function(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  
  const allergiesList = group.querySelector('.allergies-list');
  if (!allergiesList) return;
  
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
  console.log(`✅ Allergie ajoutée au groupe ${groupId}`);
};

// Fonction pour gérer la soumission du formulaire
async function handleFormSubmit(e) {
  e.preventDefault();
  console.log('📝 Soumission du formulaire Hôpital');
  
  // Collecter les données du formulaire
  const numDays = document.getElementById('num-days').value;
  const specificNeeds = document.getElementById('specific-needs')?.value || '';
  const priorityIngredients = document.getElementById('priority-ingredients')?.value || '';
  
  // Collecter les données des groupes
  const groups = [];
  const groupElements = document.querySelectorAll('.patient-group');
  
  groupElements.forEach((groupEl, index) => {
    const textureSelect = groupEl.querySelector('.texture-select');
    const patientsCount = groupEl.querySelector('.patients-count');
    
    const diets = [];
    const dietItems = groupEl.querySelectorAll('.diets-list .restriction-item');
    dietItems.forEach(item => {
      const select = item.querySelector('.diet-select');
      const count = item.querySelector('.diet-count');
      if (select.value && count.value) {
        diets.push({
          type: select.value,
          count: parseInt(count.value)
        });
      }
    });
    
    const allergies = [];
    const allergyItems = groupEl.querySelectorAll('.allergies-list .restriction-item');
    allergyItems.forEach(item => {
      const select = item.querySelector('.allergy-select');
      const count = item.querySelector('.allergy-count');
      if (select.value && count.value) {
        allergies.push({
          type: select.value,
          count: parseInt(count.value)
        });
      }
    });
    
    groups.push({
      groupNumber: index + 1,
      texture: textureSelect.value,
      patientsCount: parseInt(patientsCount.value),
      diets,
      allergies
    });
  });
  
  const formData = {
    establishmentType: 'hopital',
    numDays: parseInt(numDays),
    groups,
    specificNeeds,
    priorityIngredients
  };
  
  console.log('📤 Données du formulaire:', formData);
  
  // TODO: Envoyer les données à l'API pour générer les menus
  alert('Fonctionnalité de génération de menus Hôpital à venir !\n\nDonnées collectées:\n' + JSON.stringify(formData, null, 2));
}
