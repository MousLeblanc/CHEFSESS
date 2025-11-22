// client/JS/ecole-dashboard.js
import { loadSuppliersData, renderSuppliersList, updateCartCount, initSupplierTab } from './supplier-common.js';
import { loadStockData, renderStockTable, initStockTab, showAddStockModal, filterStock } from './stock-common.js';

console.log('Ecole Dashboard charge - Cantine Scolaire');

// Variables globales
let groupCounter = 1;

// Options pour les cantines scolaires - Tranches d'âge
const ageRangeOptions = [
  { value: 'maternelle', label: 'Maternelle (2,5-5 ans)' },
  { value: 'primaire', label: 'Primaire (6-11 ans)' },
  { value: 'primaire_cp_ce1', label: 'Primaire CP-CE1 (6-7 ans)' },
  { value: 'primaire_ce2_cm1', label: 'Primaire CE2-CM1 (8-9 ans)' },
  { value: 'primaire_cm2', label: 'Primaire CM2 (10-11 ans)' },
  { value: 'secondaire', label: 'Secondaire (12-18 ans)' },
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
  
  // Restaurer la fonctionnalité des groupes d'élèves
  const addGroupBtn = document.getElementById('add-group-btn');
  if (addGroupBtn) {
    addGroupBtn.addEventListener('click', () => {
      addGroup();
    });
    console.log('✅ Bouton "Ajouter un groupe" initialisé');
  }
  
  // Ajouter un groupe par défaut si aucun n'existe (après un court délai pour que le DOM soit prêt)
  setTimeout(() => {
    const container = document.getElementById('age-groups-container');
    if (container && container.children.length === 0) {
      addGroup();
    }
  }, 500);
  
  // Bouton pour générer un menu à partir des groupes
  const generateMenuFromGroupsBtn = document.getElementById('generate-menu-from-groups-btn');
  if (generateMenuFromGroupsBtn) {
    generateMenuFromGroupsBtn.addEventListener('click', () => {
      generateMenuFromAgeGroups();
    });
    console.log('✅ Bouton "Générer un menu pour ces groupes" initialisé');
  }
  
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
      // Charger la comparaison quand l'onglet Comparaison est sélectionné
      else if (tab === 'supplier-comparison') {
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
    const groups = document.querySelectorAll('.age-group');
    if (groups.length > 1) {
      group.remove();
      console.log(`✅ Groupe ${groupId} retiré`);
    } else {
      alert('Vous devez avoir au moins un groupe d\'élèves.');
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

// Fonction pour générer un menu à partir des groupes d'âges
async function generateMenuFromAgeGroups() {
  console.log('🎯 Génération d\'un menu à partir des groupes d\'âges...');
  
  const container = document.getElementById('age-groups-container');
  if (!container) {
    alert('Erreur: Conteneur des groupes non trouvé');
    return;
  }
  
  const groupElements = container.querySelectorAll('.age-group');
  if (groupElements.length === 0) {
    alert('Veuillez d\'abord ajouter au moins un groupe d\'élèves.');
    return;
  }
  
  // Collecter les données de tous les groupes
  const groups = [];
  let totalStudents = 0;
  const allRestrictions = new Set();
  const allAllergies = new Set();
  
  groupElements.forEach((groupEl, index) => {
    const ageRange = groupEl.querySelector('.age-range')?.value;
    const peopleCount = parseInt(groupEl.querySelector('.people-count')?.value || 0);
    
    if (!ageRange || peopleCount === 0) {
      console.warn(`⚠️ Groupe ${index + 1} incomplet (âge ou nombre manquant)`);
      return;
    }
    
    totalStudents += peopleCount;
    
    // Collecter les régimes alimentaires
    const diets = [];
    groupEl.querySelectorAll('.diets-list .restriction-item').forEach(item => {
      const select = item.querySelector('.diet-select');
      const count = item.querySelector('.diet-count');
      if (select?.value && count?.value) {
        const dietType = select.value;
        const dietCount = parseInt(count.value);
        diets.push({ type: dietType, count: dietCount });
        allRestrictions.add(dietType);
      }
    });
    
    // Collecter les allergies
    const allergies = [];
    groupEl.querySelectorAll('.allergies-list .restriction-item').forEach(item => {
      const select = item.querySelector('.allergy-select');
      const count = item.querySelector('.allergy-count');
      if (select?.value && count?.value) {
        const allergyType = select.value;
        const allergyCount = parseInt(count.value);
        allergies.push({ type: allergyType, count: allergyCount });
        allAllergies.add(allergyType);
      }
    });
    
    groups.push({
      ageRange,
      peopleCount,
      diets,
      allergies
    });
    
    console.log(`📊 Groupe ${index + 1}: ${ageRange}, ${peopleCount} élèves, ${diets.length} régimes, ${allergies.length} allergies`);
  });
  
  if (totalStudents === 0) {
    alert('Erreur: Le nombre total d\'élèves est de 0. Veuillez vérifier les groupes.');
    return;
  }
  
  console.log(`\n📊 RÉSUMÉ DES GROUPES:`);
  console.log(`   Total d'élèves: ${totalStudents}`);
  console.log(`   Nombre de groupes: ${groups.length}`);
  console.log(`   Restrictions uniques: ${Array.from(allRestrictions).join(', ') || 'Aucune'}`);
  console.log(`   Allergies uniques: ${Array.from(allAllergies).join(', ') || 'Aucune'}`);
  
  // Convertir les restrictions en format attendu par le générateur
  const dietaryRestrictions = [];
  
  // Convertir les régimes
  allRestrictions.forEach(restriction => {
    const restrictionMap = {
      'vegetarien': 'végétarien',
      'vegan': 'végétalien',
      'sans_gluten': 'sans gluten',
      'sans_lactose': 'sans lactose',
      'halal': 'halal',
      'cacher': 'casher'
    };
    if (restrictionMap[restriction]) {
      dietaryRestrictions.push(restrictionMap[restriction]);
    }
  });
  
  // Convertir les allergies
  allAllergies.forEach(allergy => {
    const allergyMap = {
      'gluten': 'sans gluten',
      'lactose': 'sans lactose',
      'arachides': 'sans arachides',
      'fruits_a_coque': 'sans fruits à coque',
      'œufs': 'sans œufs',
      'poisson': 'sans poisson',
      'crustaces': 'sans crustacés'
    };
    if (allergyMap[allergy]) {
      dietaryRestrictions.push(allergyMap[allergy]);
    }
  });
  
  // Récupérer le type de repas depuis le select
  const mealTypeSelect = document.getElementById('group-meal-type-select');
  const selectedMealType = mealTypeSelect?.value || 'déjeuner';
  
  // Afficher un message de confirmation
  const confirmMessage = `Génération d'un menu ${selectedMealType} pour ${totalStudents} élèves répartis en ${groups.length} groupe(s).\n\n` +
    `Groupes:\n${groups.map((g, i) => `  ${i + 1}. ${g.ageRange}: ${g.peopleCount} élèves`).join('\n')}\n\n` +
    (dietaryRestrictions.length > 0 ? `Restrictions: ${dietaryRestrictions.join(', ')}\n\n` : '') +
    `Continuer ?`;
  
  if (!confirm(confirmMessage)) {
    return;
  }
  
  // Utiliser le générateur de menu personnalisé
  try {
    console.log('🚀 Appel du générateur de menu personnalisé...');
    
    // Vérifier si customMenuGenerator est disponible
    if (typeof window.customMenuGenerator === 'undefined' || !window.customMenuGenerator) {
      // Si pas disponible, utiliser directement l'API
      await generateMenuViaAPI(totalStudents, selectedMealType, dietaryRestrictions, groups);
    } else {
      // Utiliser le générateur existant
      // Temporairement mettre à jour le nombre de personnes dans le formulaire
      const peopleInput = document.getElementById('custom-menu-people');
      const mealTypeSelect = document.getElementById('custom-menu-type');
      const restrictionsSelect = document.getElementById('custom-menu-restrictions');
      
      if (peopleInput) peopleInput.value = totalStudents;
      if (mealTypeSelect) mealTypeSelect.value = selectedMealType;
      
      // Mettre à jour les restrictions
      if (restrictionsSelect) {
        Array.from(restrictionsSelect.options).forEach(option => {
          option.selected = dietaryRestrictions.includes(option.value);
        });
      }
      
      // Générer le menu
      await window.customMenuGenerator.generateCustomMenu();
    }
  } catch (error) {
    console.error('❌ Erreur lors de la génération du menu:', error);
    alert('Erreur lors de la génération du menu: ' + error.message);
  }
}

// Fonction pour générer un menu via l'API directement
async function generateMenuViaAPI(numberOfPeople, mealType, dietaryRestrictions, groups) {
  console.log('📡 Génération via API directe...');
  
  const progressDiv = document.getElementById('custom-menu-progress');
  const progressText = document.getElementById('custom-progress-text');
  
  if (progressDiv) progressDiv.style.display = 'block';
  if (progressText) progressText.textContent = 'Génération du menu en cours...';
  
  try {
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

    const response = await fetchFn('/api/menu/generate-custom', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        numberOfPeople,
        mealType,
        dietaryRestrictions,
        nutritionalGoals: [], // Pas d'objectifs nutritionnels spécifiques pour l'instant
        useStockOnly: false,
        prioritizeVariety: true,
        useFullRecipeCatalog: true
      })
    });
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const result = await response.json();
    
    if (progressDiv) progressDiv.style.display = 'none';
    
    if (result.success && result.menu) {
      // Afficher les résultats dans la section des résultats du générateur
      displayMenuResults(result, groups);
      
      // Scroll vers les résultats
      const resultsDiv = document.getElementById('custom-menu-results');
      if (resultsDiv) {
        resultsDiv.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    } else {
      throw new Error(result.message || 'Erreur lors de la génération du menu');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
    if (progressDiv) progressDiv.style.display = 'none';
    alert('Erreur lors de la génération du menu: ' + error.message);
  }
}

// Fonction pour afficher les résultats du menu avec les détails des groupes
function displayMenuResults(result, groups) {
  const resultsDiv = document.getElementById('custom-menu-results');
  if (!resultsDiv) {
    console.warn('⚠️ Div des résultats non trouvée, création...');
    // Créer la div si elle n'existe pas
    const generatorCard = document.querySelector('#menus-tab .card');
    if (generatorCard) {
      const newResultsDiv = document.createElement('div');
      newResultsDiv.id = 'custom-menu-results';
      generatorCard.appendChild(newResultsDiv);
      resultsDiv = newResultsDiv;
    } else {
      alert('Menu généré avec succès !');
      return;
    }
  }
  
  resultsDiv.style.display = 'block';
  
  const menu = result.menu;
  const nutrition = result.nutrition;
  
  // Calculer les quantités par groupe d'âge
  let groupsBreakdown = '';
  if (groups && groups.length > 0) {
    groupsBreakdown = `
      <div style="background: #f0f9ff; padding: 1rem; border-radius: 8px; margin-top: 1rem; border-left: 4px solid #3b82f6;">
        <h4 style="margin: 0 0 0.5rem 0; color: #1e40af;"><i class="fas fa-users"></i> Répartition par groupe d'âge:</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          ${groups.map(g => `<li><strong>${g.ageRange}:</strong> ${g.peopleCount} élève(s)</li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  resultsDiv.innerHTML = `
    <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
      <h3 style="margin: 0 0 1rem 0; color: #10b981;"><i class="fas fa-utensils"></i> Menu généré</h3>
      
      <div style="background: #f0fdf4; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #10b981;">
        <h4 style="margin: 0 0 0.5rem 0; color: #047857;">${menu.nomMenu || 'Menu'}</h4>
        <p style="margin: 0; color: #065f46;">${menu.description || ''}</p>
      </div>
      
      ${groupsBreakdown}
      
      <div style="margin-top: 1.5rem;">
        <h4 style="margin: 0 0 0.5rem 0; color: #374151;"><i class="fas fa-list"></i> Ingrédients (pour ${result.numberOfPeople} personnes):</h4>
        <ul style="margin: 0; padding-left: 1.5rem;">
          ${result.ingredients.map(ing => 
            `<li><strong>${ing.nom}:</strong> ${ing.quantiteTotal}${ing.unite || 'g'} (${ing.quantiteParPersonne}${ing.unite || 'g'} par personne)</li>`
          ).join('')}
        </ul>
      </div>
      
      ${nutrition ? `
        <div style="margin-top: 1.5rem; background: #f9fafb; padding: 1rem; border-radius: 8px;">
          <h4 style="margin: 0 0 0.5rem 0; color: #374151;"><i class="fas fa-chart-bar"></i> Valeurs nutritionnelles (par personne):</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
            ${nutrition.perPerson ? Object.entries(nutrition.perPerson).slice(0, 8).map(([key, value]) => 
              `<div><strong>${key}:</strong> ${value.toFixed(1)}</div>`
            ).join('') : ''}
          </div>
        </div>
      ` : ''}
      
      <div style="margin-top: 1.5rem; display: flex; gap: 1rem;">
        <button onclick="window.acceptGeneratedMenu()" style="background: #10b981; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
          <i class="fas fa-check"></i> Accepter ce menu
        </button>
        <button onclick="window.regenerateMenu()" style="background: #f39c12; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 8px; cursor: pointer; font-weight: 600;">
          <i class="fas fa-redo"></i> Régénérer
        </button>
      </div>
    </div>
  `;
  
  // Stocker le résultat pour pouvoir le régénérer
  window.lastMenuResult = result;
  window.lastMenuGroups = groups;
}

// Fonctions globales pour les boutons
window.acceptGeneratedMenu = function() {
  alert('Fonctionnalité d\'acceptation du menu à implémenter');
};

window.regenerateMenu = function() {
  if (window.lastMenuGroups) {
    generateMenuFromAgeGroups();
  }
};

async function handleFormSubmit(e) {
  e.preventDefault();
  console.log('📝 Soumission du formulaire Cantine Entreprise');
  
  const numDays = document.getElementById('num-days')?.value;
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
