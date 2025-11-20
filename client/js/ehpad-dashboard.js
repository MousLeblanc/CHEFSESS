// client/JS/ehpad-dashboard.js
import { loadSuppliersData, renderSuppliersList, updateCartCount, initSupplierTab } from './supplier-common.js';
import { loadStockData, renderStockTable, initStockTab, showAddStockModal, filterStock } from './stock-common.js';

console.log('🏥 EHPAD Dashboard JS chargé');

// Fonction pour afficher les toasts
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
    color: white;
    padding: 1rem 1.5rem;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 10000;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    animation: slideIn 0.3s ease;
  `;
  toast.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Rendre showAddStockModal accessible globalement
window.showAddStockModal = showAddStockModal;

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
    // 🍪 Token géré via cookie HTTP-Only (authentification automatique)
    
    // Vérifier si on a déjà un siteId stocké dans sessionStorage (spécifique à cet onglet)
    const storedSiteId = sessionStorage.getItem('currentSiteId');
    console.log('🔍 SiteId stocké dans sessionStorage (onglet spécifique):', storedSiteId);
    
    // TOUJOURS vérifier avec le serveur pour garantir que l'utilisateur est toujours authentifié
    console.log('🔐 Vérification de l\'authentification avec le serveur...');
    
    const response = await fetch('/api/auth/me', {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 401) {
      console.error('❌ Session expirée, redirection vers login');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('currentSiteId');
      window.location.href = 'index.html';
      return;
    }
    
    if (!response.ok) {
      throw new Error(`Erreur ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    currentUser = data?.user || data;
    
    if (!currentUser) {
      console.error('❌ Aucune donnée utilisateur reçue');
      window.location.href = 'index.html';
      return;
    }
    
    console.log('✅ Utilisateur authentifié:', currentUser.name);
    console.log('🔍 SiteId du token/cookie:', currentUser.siteId);
    console.log('🔍 SiteId stocké dans sessionStorage (onglet):', storedSiteId);

    // PRIORITÉ ABSOLUE: Utiliser le siteId stocké dans sessionStorage (spécifique à cet onglet)
    // Si pas de siteId stocké, utiliser celui du token/cookie
    // Cela permet d'avoir plusieurs onglets avec des sites différents
    let targetSiteId = storedSiteId || currentUser.siteId;
    
    if (storedSiteId && storedSiteId !== currentUser.siteId) {
      console.log('⚠️ SiteId du token diffère du siteId stocké dans cet onglet');
      console.log('   - SiteId stocké (onglet):', storedSiteId);
      console.log('   - SiteId du token:', currentUser.siteId);
      console.log('   - Utilisation du siteId stocké pour cet onglet (PRIORITÉ)');
      
      // IMPORTANT: Ne pas écraser le siteId stocké avec celui du token
      // Garder le siteId stocké dans currentUser pour cet onglet
      currentUser.siteId = storedSiteId;
    }
    
    // Mettre à jour sessionStorage avec les données du serveur
    // MAIS conserver le siteId stocké si différent
    sessionStorage.setItem('user', JSON.stringify(currentUser));
    
    // Si l'utilisateur a un siteId, charger les infos du site
    if (targetSiteId) {
      // Stocker le siteId dans sessionStorage pour cet onglet (même si déjà stocké)
      sessionStorage.setItem('currentSiteId', targetSiteId);
      console.log('✅ SiteId final utilisé pour cet onglet:', targetSiteId);
      console.log('   - Source:', storedSiteId ? 'sessionStorage (onglet spécifique)' : 'token/cookie');
      await loadSiteInfo(targetSiteId);
    } else {
      console.warn('⚠️ Utilisateur sans siteId');
    }
  } catch (error) {
    console.error('❌ Erreur lors du chargement des infos utilisateur:', error);
    // En cas d'erreur réseau, essayer de récupérer depuis sessionStorage comme fallback
    const userString = sessionStorage.getItem('user');
    if (userString) {
      try {
        currentUser = JSON.parse(userString);
        console.log('⚠️ Utilisation des données en cache (sessionStorage)');
        
        // Utiliser le siteId stocké dans sessionStorage (spécifique à cet onglet)
        const storedSiteId = sessionStorage.getItem('currentSiteId');
        const targetSiteId = storedSiteId || currentUser.siteId;
        
        if (targetSiteId) {
          sessionStorage.setItem('currentSiteId', targetSiteId);
          await loadSiteInfo(targetSiteId);
        }
      } catch (e) {
        console.error('❌ Erreur lors du parsing des données cache:', e);
        window.location.href = 'index.html';
      }
    } else {
      window.location.href = 'index.html';
    }
  }
}

// Fonction pour charger les informations du site
async function loadSiteInfo(siteId) {
  try {
    console.log('🔍 Chargement du site:', siteId);
    // 🍪 Token géré via cookie HTTP-Only (authentification automatique)
    const response = await fetch(`/api/sites/${siteId}`, {
      credentials: 'include', // 🍪 Cookie HTTP-Only
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      currentSite = await response.json();
      console.log('✅ Site chargé:', currentSite);
      updateSiteHeader();
    } else {
      console.error('❌ Erreur lors du chargement du site:', response.status);
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
  
  // Initialiser l'onglet stock si actif au chargement
  const activeTab = document.querySelector('.tab-btn.active')?.dataset.tab;
  if (activeTab === 'stock') {
    initStockTab();
  }
  
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
      // 🍪 Token supprimé via cookie (géré par le backend)
      sessionStorage.removeItem('user');
      window.location.href = 'index.html';
    });
  }

  // ⚙️ Initialiser les gestionnaires d'événements pour les paramètres
  const settingsForm = document.getElementById('site-settings-form');
  if (settingsForm) {
    settingsForm.addEventListener('submit', saveSiteSettings);
  }

  // Bouton Annuler des paramètres
  const cancelBtn = document.getElementById('cancel-settings-btn');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      loadSiteSettings(); // Recharger les valeurs originales
    });
  }

  // Gestion du volume du son
  const soundCheckbox = document.getElementById('notification-sound');
  const soundVolumeContainer = document.getElementById('sound-volume-container');
  const soundVolumeSlider = document.getElementById('sound-volume');
  const soundVolumeValue = document.getElementById('sound-volume-value');

  if (soundCheckbox && soundVolumeContainer) {
    soundCheckbox.addEventListener('change', (e) => {
      soundVolumeContainer.style.display = e.target.checked ? 'block' : 'none';
    });
  }

  if (soundVolumeSlider && soundVolumeValue) {
    soundVolumeSlider.addEventListener('input', (e) => {
      soundVolumeValue.textContent = e.target.value + '%';
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
      const tabContent = document.getElementById(`${tab}-tab`);
      if (tabContent) {
        tabContent.classList.add('active');
      } else {
        console.error(`❌ Onglet "${tab}" non trouvé`);
        return;
      }
      
      // 📦 Charger le stock quand l'onglet Stock est sélectionné
      if (tab === 'stock') {
        console.log('📦 Chargement du stock pour l\'onglet Stock');
        initStockTab(); // Initialise les event listeners et charge les données
      }
      
      // 🚚 Charger les fournisseurs quand l'onglet Fournisseurs est sélectionné
      if (tab === 'suppliers') {
        console.log('🚚 Chargement des fournisseurs');
        loadSuppliersData();
      }
      
      // ⚖️ Charger la comparaison quand l'onglet Comparaison est sélectionné
      if (tab === 'supplier-comparison') {
        console.log('⚖️ Chargement de la comparaison des fournisseurs');
        if (typeof window.loadSupplierComparison === 'function') {
          window.loadSupplierComparison();
        } else {
          console.error('❌ loadSupplierComparison non disponible');
        }
      }
      
      // ⚙️ Charger les paramètres quand l'onglet Paramètres est sélectionné
      if (tab === 'settings') {
        console.log('⚙️ Chargement des paramètres');
        loadSiteSettings();
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
}

// ========== GESTION DES PARAMÈTRES DU SITE ==========

async function loadSiteSettings() {
  if (!currentSite || !currentUser?.siteId) {
    console.error('❌ Pas de site chargé');
    return;
  }

  try {
    // Charger les données du site depuis l'API
    const response = await fetch(`/api/sites/${currentUser.siteId}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Erreur lors du chargement des paramètres');
    }

    const site = await response.json();
    console.log('✅ Paramètres chargés:', site);

    // Remplir le formulaire
    document.getElementById('site-name').value = site.siteName || '';
    document.getElementById('site-address-street').value = site.address?.street || '';
    document.getElementById('site-address-city').value = site.address?.city || '';
    document.getElementById('site-address-postalCode').value = site.address?.postalCode || '';
    document.getElementById('site-address-country').value = site.address?.country || 'Belgique';
    document.getElementById('site-contact-phone').value = site.contact?.phone || '';
    document.getElementById('site-contact-email').value = site.contact?.email || '';

    // Remplir les informations du responsable (premier responsable)
    const responsable = site.responsables && site.responsables.length > 0 ? site.responsables[0] : {};
    document.getElementById('responsable-name').value = responsable.name || '';
    document.getElementById('responsable-phone').value = responsable.phone || '';
    document.getElementById('responsable-email').value = responsable.email || '';
    document.getElementById('responsable-position').value = responsable.position || '';

    // Remplir les paramètres de notifications
    const notifications = site.settings?.notifications || {};
    document.getElementById('notification-badge').checked = notifications.badgeEnabled !== false;
    document.getElementById('notification-sound').checked = notifications.soundEnabled !== false;
    document.getElementById('sound-volume').value = notifications.soundVolume || 50;
    document.getElementById('sound-volume-value').textContent = (notifications.soundVolume || 50) + '%';
    
    // Afficher/masquer le contrôle de volume selon l'état de la sonnerie
    const soundVolumeContainer = document.getElementById('sound-volume-container');
    if (soundVolumeContainer) {
      soundVolumeContainer.style.display = notifications.soundEnabled !== false ? 'block' : 'none';
    }

    // Mettre à jour currentSite
    currentSite = site;
  } catch (error) {
    console.error('❌ Erreur lors du chargement des paramètres:', error);
    showToast('Erreur lors du chargement des paramètres', 'error');
  }
}

async function saveSiteSettings(e) {
  e.preventDefault();
  
  if (!currentUser?.siteId) {
    showToast('Erreur: Site non identifié', 'error');
    return;
  }

  try {
    const settingsData = {
      siteName: document.getElementById('site-name').value,
      address: {
        street: document.getElementById('site-address-street').value,
        city: document.getElementById('site-address-city').value,
        postalCode: document.getElementById('site-address-postalCode').value,
        country: document.getElementById('site-address-country').value
      },
      contact: {
        phone: document.getElementById('site-contact-phone').value,
        email: document.getElementById('site-contact-email').value
      },
      responsables: [{
        name: document.getElementById('responsable-name').value,
        phone: document.getElementById('responsable-phone').value,
        email: document.getElementById('responsable-email').value,
        position: document.getElementById('responsable-position').value
      }],
      settings: {
        notifications: {
          badgeEnabled: document.getElementById('notification-badge').checked,
          soundEnabled: document.getElementById('notification-sound').checked,
          soundVolume: parseInt(document.getElementById('sound-volume').value),
          soundUrl: '/sounds/notification.mp3'
        }
      }
    };

    console.log('💾 Sauvegarde des paramètres:', settingsData);

    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;

    const response = await fetchFn(`/api/sites/${currentUser.siteId}`, {
      method: 'PUT',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(settingsData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur lors de la sauvegarde');
    }

    const updatedSite = await response.json();
    currentSite = updatedSite.site;
    
    // Mettre à jour le header
    updateSiteHeader();
    
    showToast('Paramètres enregistrés avec succès', 'success');
    
    // Recharger les paramètres pour s'assurer que tout est à jour
    await loadSiteSettings();
  } catch (error) {
    console.error('❌ Erreur lors de la sauvegarde:', error);
    showToast(error.message || 'Erreur lors de la sauvegarde', 'error');
  }
}

