// client/JS/ehpad-dashboard.js
import { loadSuppliersData, renderSuppliersList, updateCartCount, initSupplierTab } from './supplier-common.js';
import { loadStockData } from './stock-common.js';

console.log('🏥 EHPAD Dashboard JS chargé');

// Variables globales
let groupCounter = 1;
let currentUser = null;
let currentSite = null;

// Options pour les groupes EHPAD
const textureOptions = [
  { value: 'normale', label: 'Texture normale' },
  { value: 'hachée', label: 'Texture hachée' },
  { value: 'mixée', label: 'Texture mixée' },
  { value: 'liquide_epais', label: 'Liquide épaissi' },
  { value: 'liquide', label: 'Liquide' }
];

const pathologyOptions = [
  { value: 'diabete', label: 'Diabète' },
  { value: 'insuffisance_renale', label: 'Insuffisance rénale' },
  { value: 'insuffisance_cardiaque', label: 'Insuffisance cardiaque' },
  { value: 'denutrition', label: 'Dénutrition / Perte de poids' },
  { value: 'dysphagie', label: 'Dysphagie (troubles de la déglutition)' },
  { value: 'trouble_mastication', label: 'Troubles de la mastication' },
  { value: 'reflux', label: 'Reflux gastro-œsophagien' }
];

const dietOptions = [
  { value: 'sans_sel', label: 'Sans sel' },
  { value: 'sans_sucre', label: 'Sans sucre' },
  { value: 'enrichi_proteines', label: 'Enrichi en protéines' },
  { value: 'enrichi_calories', label: 'Enrichi en calories' },
  { value: 'pauvre_potassium', label: 'Pauvre en potassium' },
  { value: 'pauvre_proteines', label: 'Pauvre en protéines' },
  { value: 'vegetarien', label: 'Végétarien' },
  { value: 'halal', label: 'Halal' },
  { value: 'cacher', label: 'Casher' }
];

// Fonction pour charger les informations de l'utilisateur et du site
async function loadUserAndSiteInfo() {
  try {
    // Récupérer le token d'authentification
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('❌ Pas de token trouvé, redirection vers login');
      window.location.href = 'index.html';
      return;
    }

    // Récupérer les informations utilisateur depuis localStorage
    const userString = localStorage.getItem('user');
    if (userString) {
      currentUser = JSON.parse(userString);
      console.log('👤 Utilisateur chargé:', currentUser);

      // Si l'utilisateur a un siteId, charger les infos du site
      if (currentUser.siteId) {
        await loadSiteInfo(currentUser.siteId);
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des infos utilisateur:', error);
  }
}

// Fonction pour charger les informations du site
async function loadSiteInfo(siteId) {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`/api/sites/${siteId}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      credentials: 'include'
    });

    if (response.ok) {
      currentSite = await response.json();
      console.log('🏥 Site chargé:', currentSite);
      updateSiteHeader();
    } else {
      console.error('❌ Erreur lors du chargement du site');
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement du site:', error);
  }
}

// Fonction pour mettre à jour le header avec le nom du site
function updateSiteHeader() {
  if (!currentSite) return;

  const siteNameElement = document.getElementById('site-name');
  if (siteNameElement) {
    siteNameElement.textContent = currentSite.siteName || 'EHPAD';
    console.log('✅ Nom du site affiché:', currentSite.siteName);
  }
}

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', async () => {
  console.log('✅ DOM chargé - Initialisation EHPAD Dashboard');
  
  // Charger les informations utilisateur et du site
  await loadUserAndSiteInfo();
  
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
      
      // 📦 Charger le stock quand l'onglet Stock est sélectionné
      if (tab === 'stock') {
        console.log('📦 Chargement du stock pour l\'onglet Stock');
        loadStockData();
      }
      
      // 🚚 Charger les fournisseurs quand l'onglet Fournisseurs est sélectionné
      if (tab === 'suppliers') {
        console.log('🚚 Chargement des fournisseurs');
        loadSuppliersData();
      }
    });
  });
}

// Fonction pour ajouter un groupe de résidents
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
        <label>Texture alimentaire pour ce groupe :</label>
        <select class="form-control texture-select" required>
          <option value="">-- Sélectionnez une texture --</option>
          ${textureOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
        </select>
      </div>
      
      <div class="form-group">
        <label>Nombre total de résidents dans ce groupe :</label>
        <input type="number" class="form-control residents-count" min="1" value="50" required>
      </div>
      
      <div class="form-group">
        <label>Pathologies alimentaires (parmi ces résidents) :</label>
        <small style="display: block; margin-bottom: 0.5rem; color: #666;">Indiquez combien de résidents de ce groupe ont chaque pathologie</small>
        <div class="restrictions-list pathologies-list"></div>
        <button type="button" class="add-restriction-btn" onclick="addPathology('${groupId}')">
          <i class="fas fa-plus"></i> Ajouter une pathologie
        </button>
      </div>
      
      <div class="form-group">
        <label>Régimes spécifiques (parmi ces résidents) :</label>
        <small style="display: block; margin-bottom: 0.5rem; color: #666;">Indiquez combien de résidents de ce groupe ont chaque régime</small>
        <div class="restrictions-list diets-list"></div>
        <button type="button" class="add-restriction-btn" onclick="addDiet('${groupId}')">
          <i class="fas fa-plus"></i> Ajouter un régime
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
    const groups = document.querySelectorAll('.resident-group');
    if (groups.length > 1) {
      group.remove();
      console.log(`❌ Groupe ${groupId} retiré`);
    } else {
      alert('Vous devez avoir au moins un groupe de résidents.');
    }
  }
};

// Fonction pour ajouter une pathologie
window.addPathology = function(groupId) {
  const group = document.getElementById(groupId);
  if (!group) return;
  
  const pathologiesList = group.querySelector('.pathologies-list');
  if (!pathologiesList) return;
  
  const restrictionItem = document.createElement('div');
  restrictionItem.className = 'restriction-item';
  restrictionItem.innerHTML = `
    <select class="form-control pathology-select">
      <option value="">-- Sélectionnez une pathologie --</option>
      ${pathologyOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
    <input type="number" class="form-control pathology-count" placeholder="Nombre" min="1" value="1">
    <button type="button" class="remove-restriction-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  pathologiesList.appendChild(restrictionItem);
  console.log(`✅ Pathologie ajoutée au groupe ${groupId}`);
};

// Fonction pour ajouter un régime
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
      ${dietOptions.map(opt => `<option value="${opt.value}">${opt.label}</option>`).join('')}
    </select>
    <input type="number" class="form-control diet-count" placeholder="Nombre" min="1" value="1">
    <button type="button" class="remove-restriction-btn" onclick="this.parentElement.remove()">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  dietsList.appendChild(restrictionItem);
  console.log(`✅ Régime ajouté au groupe ${groupId}`);
};

// Fonction pour gérer la soumission du formulaire
async function handleFormSubmit(e) {
  e.preventDefault();
  console.log('📝 Soumission du formulaire EHPAD');
  
  // Collecter les données du formulaire
  const numDays = document.getElementById('num-days').value;
  const priorityIngredients = document.getElementById('priority-ingredients').value;
  
  // Collecter les données des groupes
  const groups = [];
  const groupElements = document.querySelectorAll('.resident-group');
  
  groupElements.forEach((groupEl, index) => {
    const textureSelect = groupEl.querySelector('.texture-select');
    const residentsCount = groupEl.querySelector('.residents-count');
    
    const pathologies = [];
    const pathologyItems = groupEl.querySelectorAll('.pathologies-list .restriction-item');
    pathologyItems.forEach(item => {
      const select = item.querySelector('.pathology-select');
      const count = item.querySelector('.pathology-count');
      if (select.value && count.value) {
        pathologies.push({
          type: select.value,
          count: parseInt(count.value)
        });
      }
    });
    
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
    
    groups.push({
      groupNumber: index + 1,
      texture: textureSelect.value,
      residentsCount: parseInt(residentsCount.value),
      pathologies,
      diets
    });
  });
  
  const formData = {
    establishmentType: 'ehpad',
    numDays: parseInt(numDays),
    groups,
    priorityIngredients
  };
  
  console.log('📤 Données du formulaire:', formData);
  
  // TODO: Envoyer les données à l'API pour générer les menus
  alert('Fonctionnalité de génération de menus EHPAD à venir !\n\nDonnées collectées:\n' + JSON.stringify(formData, null, 2));
}
