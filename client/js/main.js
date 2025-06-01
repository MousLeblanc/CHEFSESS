/**
 * Script principal de l'application ChAIf SES
 * Ce script initialise l'application et gère les interactions utilisateur
 */

// Importer notre module d'API et la configuration
import { ChAIfSESAPI } from './api/chaif-ses-api.js';
import config from './api/config.js';

// Initialisation de l'API avec la configuration
const chaifSesApi = new ChAIfSESAPI(config);

// Configuration de l'application
const config = {
  marketmanApiKey: 'votre-api-key-marketman',
  spoonacularApiKey: 'votre-api-key-spoonacular',
  debug: true // Activer le mode debug pour le développement
};

// Initialisation de l'API

// Éléments DOM
const generateBtn = document.getElementById('generate-btn');
const menusContainer = document.getElementById('menus-results');
const loadingIndicator = document.getElementById('loading');
const tabs = document.querySelectorAll('.tab');
const tabContents = document.querySelectorAll('.tab-content');
const showExpiringBtn = document.getElementById('show-expiring');
const ingredientSearchInput = document.getElementById('ingredient-search');

// Initialisation de l'application
document.addEventListener('DOMContentLoaded', async () => {
  console.log('Application ChAIf SES initialisée');
  
  // Afficher les produits qui expirent bientôt
  loadExpiringProducts();
  
  // Configurer les écouteurs d'événements
  setupEventListeners();
});

/**
 * Configure tous les écouteurs d'événements de l'application
 */
function setupEventListeners() {
  // Gestionnaire du bouton de génération de menus
  generateBtn.addEventListener('click', handleMenuGeneration);
  
  // Gestionnaire des onglets
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      activateTab(tabId);
    });
  });
  
  // Gestionnaire pour afficher les produits expirants
  showExpiringBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showExpiringProductsModal();
  });
  
  // Gestionnaire pour la recherche de fournisseurs par ingrédient
  ingredientSearchInput.addEventListener('input', debounce(handleSupplierSearch, 500));
  
  // Délégation d'événements pour les actions sur les menus (voir détails, utiliser menu)
  document.addEventListener('click', (e) => {
    // Gérer le clic sur "Voir la recette"
    if (e.target.classList.contains('view-recipe-btn')) {
      const menuId = e.target.closest('.menu-card').dataset.menuId;
      showRecipeDetails(menuId);
    }
    
    // Gérer le clic sur "Utiliser ce menu"
    if (e.target.classList.contains('use-menu-btn')) {
      const menuId = e.target.closest('.menu-card').dataset.menuId;
      useSelectedMenu(menuId);
    }
    
    // Gérer le clic sur "Commander" (fournisseurs)
    if (e.target.classList.contains('order-btn')) {
      const supplierId = e.target.closest('tr').dataset.supplierId;
      const ingredientId = document.querySelector('.supplier-comparison').dataset.ingredientId;
      placeOrder(supplierId, ingredientId);
    }
  });
}

/**
 * Active l'onglet spécifié et son contenu
 * @param {string} tabId - Identifiant de l'onglet à activer
 */
function activateTab(tabId) {
  // Désactiver tous les onglets
  tabs.forEach(t => t.classList.remove('active'));
  tabContents.forEach(c => c.classList.remove('active'));
  
  // Activer l'onglet sélectionné
  document.querySelector(`.tab[data-tab="${tabId}"]`).classList.add('active');
  document.getElementById(`${tabId}-tab`).classList.add('active');
  
  // Charger les données spécifiques à l'onglet
  if (tabId === 'inventory') {
    loadInventoryData();
  } else if (tabId === 'suppliers') {
    loadSupplierData();
  }
}

/**
 * Gère la génération de menus lorsque l'utilisateur clique sur le bouton
 */
async function handleMenuGeneration() {
  try {
    // Afficher l'indicateur de chargement
    loadingIndicator.style.display = 'flex';
    menusContainer.innerHTML = '';
    
    // Récupérer les préférences de l'utilisateur
    const preferences = {
      cuisine: document.getElementById('cuisine-type').value,
      mealType: document.getElementById('meal-type').value,
      diet: document.getElementById('diet').value,
      guests: parseInt(document.getElementById('guests').value) || 4,
      occasion: document.getElementById('occasion').value,
      optimize: document.getElementById('optimize').value,
      count: 3 // Nombre de menus à générer
    };
    
    console.log('Génération de menus avec les préférences:', preferences);
    
    // Générer les menus via l'API
    const menus = await chaifSesApi.generateMenus(preferences);
    
    // Sauvegarder les menus dans sessionStorage pour y accéder plus tard
    sessionStorage.setItem('generatedMenus', JSON.stringify(menus));
    
    // Afficher les menus générés
    displayGeneratedMenus(menus, preferences.guests);
  } catch (error) {
    console.error('Erreur lors de la génération des menus:', error);
    menusContainer.innerHTML = `
      <div class="error-message">
        <h3>Erreur lors de la génération des menus</h3>
        <p>${error.message}</p>
      </div>
    `;
  } finally {
    // Masquer l'indicateur de chargement
    loadingIndicator.style.display = 'none';
  }
}

/**
 * Affiche les menus générés dans l'interface utilisateur
 * @param {Array} menus - Menus générés par l'API
 * @param {number} guests - Nombre de convives
 */
function displayGeneratedMenus(menus, guests) {
  if (!menus || menus.length === 0) {
    menusContainer.innerHTML = `
      <div class="empty-message">
        <h3>Aucun menu trouvé</h3>
        <p>Essayez de modifier vos préférences ou d'ajouter plus d'ingrédients à votre inventaire.</p>
      </div>
    `;
    return;
  }
  
  let menusHTML = '<div class="menu-list">';
  
  menus.forEach(menu => {
    // Calculer le pourcentage d'ingrédients disponibles
    const totalIngredients = (menu.usedIngredientCount || 0) + (menu.missedIngredientCount || 0);
    const availablePercentage = totalIngredients > 0 
      ? Math.round((menu.usedIngredientCount || 0) / totalIngredients * 100) 
      : 0;
    
    // Créer la liste des ingrédients à afficher
    let ingredientsList = '';
    
    if (menu.extendedIngredients && menu.extendedIngredients.length > 0) {
      ingredientsList = menu.extendedIngredients.map(ing => 
        `<span class="ingredient-tag">${ing.name} (${ing.adjustedAmount || ing.amount} ${ing.unit})</span>`
      ).join('');
    } else if (menu.usedIngredients && menu.missedIngredients) {
      // Alternative si les ingrédients étendus ne sont pas disponibles
      const allIngredients = [...menu.usedIngredients, ...menu.missedIngredients];
      ingredientsList = allIngredients.map(ing => 
        `<span class="ingredient-tag">${ing.name} (${ing.amount} ${ing.unit})</span>`
      ).join('');
    }
    
    // Préparer le badge pour les ingrédients manquants
    let missingBadge = '';
    if (menu.missedIngredientCount > 0) {
      missingBadge = `<span class="missing-badge">${menu.missedIngredientCount} ingrédient(s) manquant(s)</span>`;
    }
    
    menusHTML += `
      <div class="menu-card" data-menu-id="${menu.id}">
        <img src="${menu.image || '/api/placeholder/400/200'}" alt="${menu.title}" class="menu-image">
        <div class="menu-content">
          <h3 class="menu-title">${menu.title}</h3>
          <div class="menu-info">
            <span>⏱️ ${menu.readyInMinutes || '45'} min</span>
            <span>👤 ${menu.calculatedServings || guests} personnes</span>
            <span>❤️ ${menu.likes || '0'}</span>
          </div>
          <div class="ingredients-availability">
            <div class="availability-bar">
              <div class="availability-fill" style="width: ${availablePercentage}%"></div>
            </div>
            <span>${availablePercentage}% des ingrédients disponibles</span>
            ${missingBadge}
          </div>
          <div class="menu-ingredients">
            <h4>Ingrédients</h4>
            <div class="ingredients-list">
              ${ingredientsList}
            </div>
          </div>
          <div class="menu-actions">
            <button class="btn-primary view-recipe-btn">Voir la recette</button>
            <button class="btn-success use-menu-btn">Utiliser ce menu</button>
          </div>
        </div>
      </div>
    `;
  });
  
  menusHTML += '</div>';
  menusContainer.innerHTML = menusHTML;
}

/**
 * Affiche les détails d'une recette
 * @param {string} menuId - Identifiant du menu/recette à afficher
 */
function showRecipeDetails(menuId) {
  // Récupérer les menus générés depuis la session
  const menus = JSON.parse(sessionStorage.getItem('generatedMenus')) || [];
  const menu = menus.find(m => m.id == menuId);
  
  if (!menu) {
    console.error('Menu non trouvé:', menuId);
    return;
  }
  
  // Créer le contenu de la modal
  const modalContent = `
    <div class="recipe-modal-content">
      <div class="recipe-header">
        <h2>${menu.title}</h2>
        <div class="recipe-meta">
          <span>⏱️ ${menu.readyInMinutes || '45'} min</span>
          <span>👤 ${menu.calculatedServings || 4} personnes</span>
          ${menu.nutrition ? `<span>🔥 ${menu.nutrition.calories || '0'} calories/portion</span>` : ''}
        </div>
      </div>
      
      <div class="recipe-image-container">
        <img src="${menu.image || '/api/placeholder/400/200'}" alt="${menu.title}" class="recipe-image">
      </div>
      
      <div class="recipe-ingredients">
        <h3>Ingrédients</h3>
        <ul>
          ${menu.extendedIngredients ? menu.extendedIngredients.map(ing => 
            `<li>${ing.adjustedAmount || ing.amount} ${ing.unit} de ${ing.name}</li>`
          ).join('') : 'Informations sur les ingrédients non disponibles'}
        </ul>
      </div>
      
      <div class="recipe-instructions">
        <h3>Instructions</h3>
        ${menu.instructions ? `<div class="instructions-text">${menu.instructions}</div>` 
          : '<p>Instructions non disponibles</p>'}
      </div>
      
      ${menu.nutrition ? `
        <div class="recipe-nutrition">
          <h3>Informations nutritionnelles (par portion)</h3>
          <div class="nutrition-grid">
            <div class="nutrition-item">
              <span class="nutrition-value">${menu.nutrition.calories || '0'}</span>
              <span class="nutrition-label">Calories</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">${menu.nutrition.protein || '0'}g</span>
              <span class="nutrition-label">Protéines</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">${menu.nutrition.fat || '0'}g</span>
              <span class="nutrition-label">Lipides</span>
            </div>
            <div class="nutrition-item">
              <span class="nutrition-value">${menu.nutrition.carbs || '0'}g</span>
              <span class="nutrition-label">Glucides</span>
            </div>
          </div>
        </div>
      ` : ''}
      
      <div class="recipe-actions">
        <button class="btn-primary print-recipe-btn">Imprimer la recette</button>
        <button class="btn-success use-menu-btn" data-menu-id="${menuId}">Utiliser ce menu</button>
        <button class="btn-secondary close-modal-btn">Fermer</button>
      </div>
    </div>
  `;
  
  // Créer et afficher la modal
  const modal = document.createElement('div');
  modal.className = 'modal recipe-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-container">
      ${modalContent}
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Ajouter les gestionnaires d'événements pour la modal
  modal.querySelector('.close-modal-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector('.modal-overlay').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Gestionnaire pour l'impression
  modal.querySelector('.print-recipe-btn').addEventListener('click', () => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Recette: ${menu.title}</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; }
            h1, h2, h3 { color: #2c3e50; }
            .container { max-width: 800px; margin: 0 auto; padding: 20px; }
            img { max-width: 100%; height: auto; }
            ul { padding-left: 20px; }
            .recipe-meta { margin-bottom: 20px; }
            .recipe-meta span { margin-right: 15px; }
            @media print {
              body { font-size: 12pt; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${menu.title}</h1>
            <div class="recipe-meta">
              <span>⏱️ ${menu.readyInMinutes || '45'} min</span>
              <span>👤 ${menu.calculatedServings || 4} personnes</span>
            </div>
            
            <h2>Ingrédients</h2>
            <ul>
              ${menu.extendedIngredients ? menu.extendedIngredients.map(ing => 
                `<li>${ing.adjustedAmount || ing.amount} ${ing.unit} de ${ing.name}</li>`
              ).join('') : 'Informations sur les ingrédients non disponibles'}
            </ul>
            
            <h2>Instructions</h2>
            ${menu.instructions ? `<div>${menu.instructions}</div>` 
              : '<p>Instructions non disponibles</p>'}
            
            <div class="no-print">
              <button onclick="window.print()">Imprimer</button>
              <button onclick="window.close()">Fermer</button>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  });
  
  // Gestionnaire pour utiliser ce menu
  modal.querySelector('.use-menu-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
    useSelectedMenu(menuId);
  });
}

/**
 * Utilise le menu sélectionné et met à jour l'inventaire
 * @param {string} menuId - Identifiant du menu à utiliser
 */
async function useSelectedMenu(menuId) {
  try {
    // Récupérer les menus générés depuis la session
    const menus = JSON.parse(sessionStorage.getItem('generatedMenus')) || [];
    const menu = menus.find(m => m.id == menuId);
    
    if (!menu) {
      console.error('Menu non trouvé:', menuId);
      return;
    }
    
    // Demander confirmation à l'utilisateur
    const guests = menu.calculatedServings || parseInt(document.getElementById('guests').value) || 4;
    
    const confirmModal = document.createElement('div');
    confirmModal.className = 'modal confirm-modal';
    confirmModal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="confirm-modal-content">
          <h2>Confirmer l'utilisation du menu</h2>
          <p>Vous êtes sur le point d'utiliser le menu "${menu.title}" pour ${guests} personnes.</p>
          <p>Cette action déduira automatiquement les ingrédients utilisés de votre inventaire.</p>
          
          <div class="confirm-actions">
            <button class="btn-danger cancel-btn">Annuler</button>
            <button class="btn-success confirm-btn">Confirmer</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // Gestionnaires d'événements pour la modal de confirmation
    confirmModal.querySelector('.cancel-btn').addEventListener('click', () => {
      document.body.removeChild(confirmModal);
    });
    
    confirmModal.querySelector('.modal-overlay').addEventListener('click', () => {
      document.body.removeChild(confirmModal);
    });
    
    confirmModal.querySelector('.confirm-btn').addEventListener('click', async () => {
      document.body.removeChild(confirmModal);
      
      try {
        // Afficher un indicateur de chargement
        const loadingToast = showToast('Mise à jour de l\'inventaire...', 'info', false);
        
        // Mettre à jour l'inventaire via l'API
        const result = await chaifSesApi.updateInventoryAfterMenuUsage(menu, guests);
        
        if (result) {
          // Masquer l'indicateur de chargement et afficher un message de succès
          hideToast(loadingToast);
          showToast('Inventaire mis à jour avec succès!', 'success', true);
          
          // Sauvegarder le menu utilisé dans l'historique
          saveToMenuHistory(menu, guests);
          
          // Actualiser l'interface si nécessaire
          if (document.getElementById('inventory-tab').classList.contains('active')) {
            loadInventoryData();
          }
        } else {
          hideToast(loadingToast);
          showToast('Aucune mise à jour n\'a été effectuée.', 'warning', true);
        }
      } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'inventaire:', error);
        hideToast(loadingToast);
        showToast('Erreur lors de la mise à jour de l\'inventaire: ' + error.message, 'error', true);
      }
    });
  } catch (error) {
    console.error('Erreur lors de l\'utilisation du menu:', error);
    showToast('Erreur lors de l\'utilisation du menu: ' + error.message, 'error', true);
  }
}

/**
 * Sauvegarde un menu utilisé dans l'historique
 * @param {Object} menu - Menu à sauvegarder
 * @param {number} guests - Nombre de convives
 */
function saveToMenuHistory(menu, guests) {
  // Récupérer l'historique existant ou initialiser un nouvel historique
  const menuHistory = JSON.parse(localStorage.getItem('menuHistory')) || [];
  
  // Ajouter le menu à l'historique
  menuHistory.unshift({
    id: menu.id,
    title: menu.title,
    image: menu.image,
    date: new Date().toISOString(),
    guests: guests,
    ingredients: menu.extendedIngredients ? 
      menu.extendedIngredients.map(ing => ({
        name: ing.name,
        amount: ing.adjustedAmount || ing.amount,
        unit: ing.unit
      })) : []
  });
  
  // Limiter l'historique à 20 entrées
  if (menuHistory.length > 20) {
    menuHistory.pop();
  }
  
  // Sauvegarder l'historique mis à jour
  localStorage.setItem('menuHistory', JSON.stringify(menuHistory));
}

/**
 * Charge et affiche les données d'inventaire
 */
async function loadInventoryData() {
  try {
    const inventoryStats = document.getElementById('inventory-stats');
    inventoryStats.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
    
    // Récupérer l'inventaire via l'API
    const inventory = await chaifSesApi.marketmanApi.getInventory();
    
    // Calculer les statistiques d'inventaire
    const totalValue = inventory.reduce((total, item) => total + (item.quantity * item.price), 0);
    const totalItems = inventory.length;
    const lowStockItems = inventory.filter(item => item.quantity <= item.minimumQuantity).length;
    
    // Mettre à jour l'interface
    inventoryStats.innerHTML = `
      <h3>Statistiques d'Inventaire</h3>
      <div class="filter-section">
        <div>
          <h4>Valeur Totale de l'Inventaire</h4>
          <p class="stat">${totalValue.toFixed(2)} €</p>
        </div>
        <div>
          <h4>Nombre de Produits</h4>
          <p class="stat">${totalItems}</p>
        </div>
        <div>
          <h4>Produits Sous Seuil</h4>
          <p class="stat">${lowStockItems}</p>
        </div>
      </div>
      
      <h3>Inventaire Détaillé</h3>
      <div class="inventory-table-container">
        <table class="inventory-table">
          <thead>
            <tr>
              <th>Produit</th>
              <th>Catégorie</th>
              <th>Quantité</th>
              <th>Prix unitaire</th>
              <th>Valeur</th>
              <th>Date d'expiration</th>
              <th>État</th>
            </tr>
          </thead>
          <tbody>
            ${inventory.map(item => {
              const expiryDate = new Date(item.expiryDate);
              const today = new Date();
              const expiryDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
              
              let statusClass = '';
              let statusText = 'Normal';
              
              if (expiryDays <= 7) {
                statusClass = 'expiring-soon';
                statusText = `Expire dans ${expiryDays} jours`;
              }
              
              if (item.quantity <= item.minimumQuantity) {
                statusClass = 'low-stock';
                statusText = 'Stock bas';
              }
              
              if (expiryDays <= 3 && item.quantity <= item.minimumQuantity) {
                statusClass = 'critical';
                statusText = 'Critique';
              }
              
              return `
                <tr class="${statusClass}">
                  <td>${item.name}</td>
                  <td>${item.category}</td>
                  <td>${item.quantity} ${item.unit}</td>
                  <td>${item.price.toFixed(2)} €</td>
                  <td>${(item.quantity * item.price).toFixed(2)} €</td>
                  <td>${formatDate(item.expiryDate)}</td>
                  <td class="status">${statusText}</td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error('Erreur lors du chargement des données d\'inventaire:', error);
    const inventoryStats = document.getElementById('inventory-stats');
    inventoryStats.innerHTML = `
      <div class="error-message">
        <h3>Erreur lors du chargement des données d'inventaire</h3>
        <p>${error.message}</p>
      </div>
    `;
  }
}

/**
 * Charge et affiche les produits qui expirent bientôt
 */
async function loadExpiringProducts() {
  try {
    const expiringAlert = document.querySelector('.expiring-alert');
    
    // Récupérer les produits qui expirent bientôt via l'API
    const expiringProducts = await chaifSesApi.getExpiringProducts(7);
    
    if (expiringProducts.length === 0) {
      expiringAlert.innerHTML = `
        <h3>✅ Aucun produit proche de la péremption</h3>
        <p>Tous vos produits sont dans les limites de péremption sécuritaires.</p>
      `;
      return;
    }
    
    expiringAlert.innerHTML = `
      <h3>⚠️ Produits proches de la péremption</h3>
      <p>${expiringProducts.length} produit(s) expire(nt) dans les 7 prochains jours. <a href="#" id="show-expiring">Voir les détails</a></p>
    `;
    
    // Mettre à jour le gestionnaire d'événements
    document.getElementById('show-expiring').addEventListener('click', (e) => {
      e.preventDefault();
      showExpiringProductsModal(expiringProducts);
    });
  } catch (error) {
    console.error('Erreur lors du chargement des produits expirants:', error);
    const expiringAlert = document.querySelector('.expiring-alert');
    expiringAlert.innerHTML = `
      <h3>⚠️ Erreur</h3>
      <p>Impossible de vérifier les produits proches de la péremption.</p>
    `;
  }
}

/**
 * Affiche une modal avec les produits qui expirent bientôt
 * @param {Array} expiringProducts - Produits qui expirent bientôt
 */
function showExpiringProductsModal(expiringProducts) {
  if (!expiringProducts || expiringProducts.length === 0) {
    showToast('Aucun produit proche de la péremption.', 'info', true);
    return;
  }
  
  // Trier les produits par date d'expiration (du plus proche au plus éloigné)
  expiringProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
  
  // Créer le contenu de la modal
  const modalContent = `
    <div class="expiring-modal-content">
      <h2>Produits proches de la péremption</h2>
      <p>Ces produits expirent dans les 7 prochains jours. Pensez à les utiliser rapidement.</p>
      
      <table class="expiring-table">
        <thead>
          <tr>
            <th>Produit</th>
            <th>Catégorie</th>
            <th>Quantité</th>
            <th>Expire dans</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${expiringProducts.map(item => {
            const expiryDate = new Date(item.expiryDate);
            const today = new Date();
            const expiryDays = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));
            
            let rowClass = '';
            if (expiryDays <= 2) rowClass = 'critical';
            else if (expiryDays <= 4) rowClass = 'warning';
            
            return `
              <tr class="${rowClass}">
                <td>${item.name}</td>
                <td>${item.category}</td>
                <td>${item.quantity} ${item.unit}</td>
                <td>${expiryDays} jour(s)</td>
                <td>
                  <button class="btn-primary suggest-recipes-btn" data-ingredient="${item.name}">
                    Suggérer des recettes
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
      
      <div class="expiring-actions">
        <button class="btn-success generate-menu-btn">Générer un menu avec ces produits</button>
        <button class="btn-secondary close-modal-btn">Fermer</button>
      </div>
    </div>
  `;
  
  // Créer et afficher la modal
  const modal = document.createElement('div');
  modal.className = 'modal expiring-modal';
  modal.innerHTML = `
    <div class="modal-overlay"></div>
    <div class="modal-container">
      ${modalContent}
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // Ajouter les gestionnaires d'événements pour la modal
  modal.querySelector('.close-modal-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  modal.querySelector('.modal-overlay').addEventListener('click', () => {
    document.body.removeChild(modal);
  });
  
  // Gestionnaire pour générer un menu avec ces produits
  modal.querySelector('.generate-menu-btn').addEventListener('click', () => {
    document.body.removeChild(modal);
    
    // Basculer vers l'onglet de génération de menus
    activateTab('generation');
    
    // Sélectionner "Péremption imminente" comme critère d'optimisation
    document.getElementById('optimize').value = 'expiry';
    
    // Déclencher la génération de menus
    document.getElementById('generate-btn').click();
  });
  
  // Gestionnaires pour suggérer des recettes
  modal.querySelectorAll('.suggest-recipes-btn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const ingredient = btn.dataset.ingredient;
      try {
        // Afficher un indicateur de chargement
        btn.innerHTML = '<div class="spinner-small"></div>';
        btn.disabled = true;
        
        // TODO: Implémenter la suggestion de recettes pour cet ingrédient spécifique
        // Pour l'instant, utilisons juste le générateur de menus général
        
        // Basculer vers l'onglet de génération de menus après une courte pause
        setTimeout(() => {
          document.body.removeChild(modal);
          activateTab('generation');
          document.getElementById('optimize').value = 'expiry';
          document.getElementById('generate-btn').click();
        }, 1000);
      } catch (error) {
        console.error('Erreur lors de la suggestion de recettes:', error);
        btn.innerHTML = 'Erreur';
        setTimeout(() => {
          btn.innerHTML = 'Suggérer des recettes';
          btn.disabled = false;
        }, 2000);
      }
    });
  });
}

/**
 * Charge et affiche les données des fournisseurs
 */
async function loadSupplierData() {
  try {
    const suppliersContainer = document.getElementById('suppliers-tab');
    const tableContainer = suppliersContainer.querySelector('.supplier-comparison');
    
    // Afficher un message d'information si aucun ingrédient n'est recherché
    tableContainer.innerHTML = `
      <p class="info-message">
        Recherchez un ingrédient pour comparer les prix et les délais des différents fournisseurs.
      </p>
    `;
  } catch (error) {
    console.error('Erreur lors du chargement des données des fournisseurs:', error);
  }
}

/**
 * Gère la recherche de fournisseurs pour un ingrédient
 */
async function handleSupplierSearch() {
  const searchTerm = ingredientSearchInput.value.trim();
  
  if (searchTerm.length < 2) {
    return; // Ignorer les recherches trop courtes
  }
  
  try {
    const suppliersContainer = document.getElementById('suppliers-tab');
    const tableContainer = suppliersContainer.querySelector('.card');
    
    // Afficher un indicateur de chargement
    tableContainer.innerHTML = `
      <h2>Comparaison des Fournisseurs</h2>
      <p>Recherche en cours pour "${searchTerm}"...</p>
      <div class="loading"><div class="spinner"></div></div>
    `;
    
    // Rechercher les fournisseurs via l'API
    const suppliers = await chaifSesApi.compareSuppliers(searchTerm);
    
    if (suppliers.length === 0) {
      tableContainer.innerHTML = `
        <h2>Comparaison des Fournisseurs</h2>
        <p>Aucun fournisseur trouvé pour "${searchTerm}".</p>
        <div class="form-group">
          <label for="ingredient-search">Rechercher un ingrédient</label>
          <input type="text" id="ingredient-search" placeholder="ex: tomates, farine, bœuf..." value="${searchTerm}">
        </div>
      `;
      
      // Réattacher l'écouteur d'événements
      document.getElementById('ingredient-search').addEventListener('input', debounce(handleSupplierSearch, 500));
      return;
    }
    
    // Déterminer le meilleur fournisseur (celui avec le score le plus bas)
    const bestSupplier = suppliers.reduce((best, current) => 
      (current.totalScore < best.totalScore) ? current : best
    , suppliers[0]);
    
    // Mettre à jour l'interface
    tableContainer.innerHTML = `
      <h2>Comparaison des Fournisseurs pour "${searchTerm}"</h2>
      <p>Comparez les prix et les délais des différents fournisseurs pour optimiser vos achats.</p>
      
      <div class="form-group">
        <label for="ingredient-search">Rechercher un ingrédient</label>
        <input type="text" id="ingredient-search" placeholder="ex: tomates, farine, bœuf..." value="${searchTerm}">
      </div>
      
      <table class="supplier-comparison" data-ingredient-id="${suppliers[0].product.id}">
        <thead>
          <tr>
            <th>Fournisseur</th>
            <th>Prix/${suppliers[0].product.unit}</th>
            <th>Délai de livraison</th>
            <th>Quantité min.</th>
            <th>Note qualité</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${suppliers.map(supplier => `
            <tr class="${supplier.id === bestSupplier.id ? 'best-value' : ''}" data-supplier-id="${supplier.id}">
              <td>${supplier.name}</td>
              <td>${supplier.product.price.toFixed(2)} €</td>
              <td>${supplier.deliveryTime} jour(s)</td>
              <td>${supplier.product.minimumQuantity} ${supplier.product.unit}</td>
              <td>${supplier.qualityRating}/5</td>
              <td><button class="btn-success order-btn">Commander</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
    
    // Réattacher l'écouteur d'événements
    document.getElementById('ingredient-search').addEventListener('input', debounce(handleSupplierSearch, 500));
  } catch (error) {
    console.error('Erreur lors de la recherche de fournisseurs:', error);
    const suppliersContainer = document.getElementById('suppliers-tab');
    const tableContainer = suppliersContainer.querySelector('.card');
    
    tableContainer.innerHTML = `
      <h2>Comparaison des Fournisseurs</h2>
      <p>Erreur lors de la recherche de fournisseurs: ${error.message}</p>
      <div class="form-group">
        <label for="ingredient-search">Rechercher un ingrédient</label>
        <input type="text" id="ingredient-search" placeholder="ex: tomates, farine, bœuf..." value="${searchTerm}">
      </div>
    `;
    
    // Réattacher l'écouteur d'événements
    document.getElementById('ingredient-search').addEventListener('input', debounce(handleSupplierSearch, 500));
  }
}

/**
 * Simule une commande auprès d'un fournisseur
 * @param {string} supplierId - Identifiant du fournisseur
 * @param {string} ingredientId - Identifiant de l'ingrédient
 */
function placeOrder(supplierId, ingredientId) {
  // TODO: Implémenter la commande réelle via MarketMan API
  
  showToast('Commande simulée avec succès! Cette fonctionnalité sera implémentée ultérieurement.', 'success', true);
}

/**
 * Affiche un toast (notification)
 * @param {string} message - Message à afficher
 * @param {string} type - Type de toast (success, error, warning, info)
 * @param {boolean} autoHide - Si le toast doit se masquer automatiquement
 * @returns {HTMLElement} - Élément DOM du toast
 */
function showToast(message, type = 'info', autoHide = true) {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
    <div class="toast-content">
      <span class="toast-message">${message}</span>
      ${autoHide ? '' : '<div class="spinner-small"></div>'}
    </div>
  `;
  
  // Ajouter le toast au conteneur (ou le créer s'il n'existe pas)
  let toastContainer = document.querySelector('.toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  
  toastContainer.appendChild(toast);
  
  // Masquer automatiquement après 3 secondes si autoHide est activé
  if (autoHide) {
    setTimeout(() => {
      hideToast(toast);
    }, 3000);
  }
  
  return toast;
}

/**
 * Masque un toast
 * @param {HTMLElement} toast - Élément DOM du toast à masquer
 */
function hideToast(toast) {
  if (!toast) return;
  
  toast.classList.add('toast-hiding');
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
    
    // Supprimer le conteneur s'il est vide
    const toastContainer = document.querySelector('.toast-container');
    if (toastContainer && toastContainer.children.length === 0) {
      document.body.removeChild(toastContainer);
    }
  }, 300);
}

/**
 * Limite la fréquence d'exécution d'une fonction
 * @param {Function} func - Fonction à exécuter
 * @param {number} wait - Délai d'attente en ms
 * @returns {Function} - Fonction avec délai
 */
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), wait);
  };
}

/**
 * Formate une date au format local
 * @param {string|Date} date - Date à formater
 * @returns {string} - Date formatée
 */
function formatDate(date) {
  if (!date) return 'N/A';
  
  const dateObj = new Date(date);
  return dateObj.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

// Styles supplémentaires à ajouter dynamiquement
const additionalStyles = `
  /* Styles pour les modals */
  .modal {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1000;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  
  .modal-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
  }
  
  .modal-container {
    position: relative;
    background-color: white;
    border-radius: 8px;
    max-width: 90%;
    max-height: 90%;
    width: 800px;
    overflow-y: auto;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    z-index: 1001;
  }
  
  .recipe-modal-content,
  .expiring-modal-content,
  .confirm-modal-content {
    padding: 2rem;
  }
  
  .recipe-header {
    margin-bottom: 1.5rem;
  }
  
  .recipe-meta {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-top: 0.5rem;
    color: #666;
  }
  
  .recipe-image-container {
    margin-bottom: 1.5rem;
    text-align: center;
  }
  
  .recipe-image {
    max-width: 100%;
    max-height: 400px;
    border-radius: 8px;
  }
  
  .recipe-ingredients,
  .recipe-instructions,
  .recipe-nutrition {
    margin-bottom: 1.5rem;
  }
  
  .recipe-ingredients ul {
    list-style-type: disc;
    padding-left: 1.5rem;
  }
  
  .instructions-text {
    white-space: pre-line;
    line-height: 1.6;
  }
  
  .nutrition-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .nutrition-item {
    background-color: #f5f5f5;
    padding: 1rem;
    border-radius: 8px;
    text-align: center;
  }
  
  .nutrition-value {
    font-size: 1.2rem;
    font-weight: bold;
    display: block;
    margin-bottom: 0.3rem;
  }
  
  .recipe-actions,
  .expiring-actions,
  .confirm-actions {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
  
  /* Styles pour les tableaux */
  .inventory-table-container,
  .expiring-table {
    width: 100%;
    overflow-x: auto;
    margin-top: 1rem;
  }
  
  .inventory-table,
  .expiring-table,
  .supplier-comparison {
    width: 100%;
    border-collapse: collapse;
  }
  
  .inventory-table th,
  .inventory-table td,
  .expiring-table th,
  .expiring-table td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  .inventory-table th,
  .expiring-table th {
    background-color: var(--light);
    font-weight: 600;
  }
  
  .expiring-soon {
    background-color: #fff3cd;
  }
  
  .low-stock {
    background-color: #f8d7da;
  }
  
  .critical {
    background-color: #f8d7da;
    font-weight: bold;
    color: #721c24;
  }
  
  .warning {
    background-color: #fff3cd;
    color: #856404;
  }
  
  /* Styles pour les notifications (toasts) */
  .toast-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1500;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
  
  .toast {
    padding: 12px 20px;
    border-radius: 4px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    min-width: 250px;
    max-width: 400px;
    animation: slideIn 0.3s ease forwards;
  }
  
  .toast-hiding {
    animation: slideOut 0.3s ease forwards;
  }
  
  .toast-content {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .toast-message {
    flex: 1;
  }
  
  .toast-success {
    background-color: #d4edda;
    color: #155724;
    border-left: 4px solid #28a745;
  }
  
  .toast-error {
    background-color: #f8d7da;
    color: #721c24;
    border-left: 4px solid #dc3545;
  }
  
  .toast-warning {
    background-color: #fff3cd;
    color: #856404;
    border-left: 4px solid #ffc107;
  }
  
  .toast-info {
    background-color: #d1ecf1;
    color: #0c5460;
    border-left: 4px solid #17a2b8;
  }
  
  /* Spinners */
  .spinner-small {
    border: 2px solid rgba(0, 0, 0, 0.1);
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border-left-color: currentColor;
    animation: spin 1s linear infinite;
    display: inline-block;
  }
  
  /* Animations */
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  /* Styles pour la barre de disponibilité des ingrédients */
  .ingredients-availability {
    margin: 1rem 0;
  }
  
  .availability-bar {
    height: 10px;
    background-color: #eee;
    border-radius: 5px;
    margin-bottom: 5px;
    overflow: hidden;
  }
  
  .availability-fill {
    height: 100%;
    background-color: var(--success);
    border-radius: 5px;
  }
  
  .missing-badge {
    display: inline-block;
    background-color: #f8d7da;
    color: #721c24;
    padding: 2px 8px;
    border-radius: 10px;
    font-size: 0.8rem;
    margin-left: 10px;
  }
`;

// Ajouter les styles supplémentaires au document
document.addEventListener('DOMContentLoaded', () => {
  const styleElement = document.createElement('style');
  styleElement.textContent = additionalStyles;
  document.head.appendChild(styleElement);
});