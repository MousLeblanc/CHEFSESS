// Liste exhaustive des ingrédients pour l'autocomplétion
const ingredientsComplets = [
  // Ingrédients de base
  'Ail', 'Ananas', 'Aubergine', 'Avoine', 'Avocat',
  'Banane', 'Betterave', 'Beurre', 'Blé', 'Boeuf',
  'Café', 'Cannelle', 'Carottes', 'Céleri', 'Champignons', 'Chocolat', 'Chou', 'Citron', 'Concombre', 'Coriandre', 'Courgette', 'Crème',
  'Eau', 'Epaule d\'agneau', 'Epinards',
  'Farine', 'Fraise', 'Framboises', 'Fromage',
  'Gingembre', 'Glace',
  'Haricots', 'Huile d\'olive', 'Huile',
  'Jambon',
  'Kiwi',
  'Lait', 'Laitue', 'Légumes', 'Lentilles',
  'Maïs', 'Mangue', 'Miel', 'Moutarde', 'Myrtilles',
  'Noisettes', 'Noix',
  'Oeufs', 'Oignons', 'Olives', 'Orange',
  'Pain', 'Pâtes', 'Pêche', 'Persil', 'Poireau', 'Poires', 'Poisson', 'Poivre', 'Pommes', 'Pommes de terre', 'Porc', 'Poulet',
  'Quinoa',
  'Radis', 'Riz',
  'Salade', 'Saumon', 'Sel', 'Sucre',
  'Thé', 'Thon', 'Tomates',
  'Vanille', 'Viande', 'Vinaigre', 'Vin',
  'Yaourt',
  
  // Poissons
  'Dorade', 'Cabillaud', 'Merlu', 'Truite', 'Raie', 'Aile de raie', 'Ailes de raie', 'Sole', 'Bar', 'Loup', 'Merlan', 'Sardine', 
  'Anchois', 'Hareng', 'Maquereau', 'Lotte', 'Julienne', 'Colin', 'Crevette', 'Gambas', 'Langoustine', 'Homard', 'Langouste', 
  'Crabe', 'Moule', 'Huître', 'Palourde', 'Coquille', 'St-Jacques', 'Saint-Jacques', 'Calamars', 'Poulpe', 'Seiche',
  
  // Viandes
  'Dinde', 'Veau', 'Lapin', 'Canard', 'Cheval', 'Foie', 'Gésier', 'Coeur', 'Rognon', 'Tripe', 'Ris de veau', 
  'Lard', 'Bacon', 'Saucisse', 'Saucisson', 'Chorizo', 'Salami', 'Pâté', 'Terrine', 'Andouillette', 'Boudin', 'Merguez', 
  'Chipolata', 'Côte', 'Entrecôte', 'Filet', 'Cuisse', 'Aile', 'Escalope', 'Gigot',
  
  // Légumes
  'Échalote', 'Poivron', 'Endive', 'Brocoli', 'Chou-fleur', 'Asperge', 'Artichaut', 'Fenouil', 'Navet', 'Petit pois', 
  'Haricot vert', 'Haricot blanc', 'Pois chiche',
  
  // Fruits
  'Pamplemousse', 'Mandarine', 'Clémentine', 'Mûre', 'Groseille', 'Cassis', 'Cerise', 'Abricot', 'Nectarine', 
  'Prune', 'Mirabelle', 'Raisin', 'Melon', 'Pastèque', 'Figue', 'Grenade', 'Papaye', 'Goyave', 'Litchi', 'Noix de coco', 
  'Datte', 'Châtaigne', 'Marron',
  
  // Épices
  'Muscade', 'Curry', 'Cumin', 'Paprika', 'Piment', 'Thym', 'Romarin', 'Laurier', 'Basilic', 'Menthe', 'Safran', 
  'Cardamome', 'Clou de girofle', 'Anis', 'Badiane', 'Herbe', 'Bouquet garni', 'Estragon', 'Ciboulette', 'Aneth', 
  'Curcuma', 'Ras el hanout', 'Garam masala', 'Quatre-épices', 'Piment d\'espelette',
  
  // Produits laitiers
  'Yogourt', 'Camembert', 'Brie', 'Emmental', 'Gruyère', 'Comté', 'Roquefort', 'Bleu', 'Chèvre', 'Mozzarella', 
  'Parmesan', 'Ricotta', 'Mascarpone', 'Feta', 'Crème fraîche', 'Crème liquide', 'Lait de coco', 'Petit-suisse', 
  'Faisselle', 'Cottage cheese', 'Kéfir', 'Babeurre', 'Lait fermenté',
  
  // Céréales
  'Spaghetti', 'Macaroni', 'Semoule', 'Couscous', 'Boulgour', 'Orge', 'Millet', 'Sarrasin', 'Tapioca', 'Polenta', 
  'Maïzena', 'Baguette', 'Biscottes', 'Crackers', 'Flocon d\'avoine', 'Muesli', 'Céréales petit déjeuner',
  
  // Liquides
  'Bière', 'Cidre', 'Spiritueux', 'Rhum', 'Whisky', 'Cognac', 'Vodka', 'Jus', 'Sirop', 'Soda', 'Limonade', 
  'Chocolat chaud', 'Infusion', 'Bouillon', 'Fond', 'Sauce', 'Ketchup', 'Mayonnaise', 'Huile de tournesol', 
  'Huile de colza', 'Huile de sésame', 'Vinaigre balsamique', 'Vinaigre de vin', 'Vin blanc', 'Vin rouge'
];

// Variables globales
let currentIngredients = [];
let ingredientToDelete = null;

// Initialiser la page au chargement
document.addEventListener('DOMContentLoaded', function() {
  // Charger et afficher les ingrédients
  displayIngredients();
  
  // Initialiser les événements
  initEvents();
  
  // Afficher les alertes de stock
  showStockAlerts();
  
  // Mettre à jour les compteurs
  updateStockCounters();
});
// Initialiser tous les écouteurs d'événements
function initEvents() {
  // Événements pour les filtres et tris
  document.getElementById('category-filter').addEventListener('change', filterAndSortIngredients);
  document.getElementById('status-filter').addEventListener('change', filterAndSortIngredients);
  document.getElementById('sort-by').addEventListener('change', filterAndSortIngredients);
  document.getElementById('search-ingredient').addEventListener('input', filterAndSortIngredients);
  
  // Événements pour l'ajout/modification d'ingrédients
  document.getElementById('add-ingredient-btn').addEventListener('click', openAddIngredientModal);
  document.getElementById('modal-close').addEventListener('click', closeModals);
  document.getElementById('cancel-btn').addEventListener('click', closeModals);
  document.getElementById('ingredient-form').addEventListener('submit', function(e) {
    e.preventDefault();
    saveIngredient();
  });
  
  // Événements pour le bouton d'export
  document.getElementById('export-btn').addEventListener('click', exportStock);
  
  // Événements pour la modal de suppression
  document.getElementById('delete-modal-close').addEventListener('click', closeModals);
  document.getElementById('delete-cancel-btn').addEventListener('click', closeModals);
  document.getElementById('delete-confirm-btn').addEventListener('click', confirmDeleteIngredient);
  
  // Événement pour le bouton de suggestions
  document.getElementById('suggest-ingredients-btn').addEventListener('click', showIngredientSuggestions);
  
  // Événement pour le changement d'unité
  document.getElementById('ingredient-unit').addEventListener('change', function() {
    document.getElementById('threshold-unit').textContent = this.value;
  });

  // Code de débogage temporaire - À SUPPRIMER APRÈS RÉSOLUTION DU PROBLÈME
document.addEventListener('DOMContentLoaded', function() {
  console.log("======= CODE DE DÉBOGAGE TEMPORAIRE =======");
  
  // Vérifier que le bouton existe
  const addBtn = document.getElementById('add-ingredient-btn');
  console.log("Bouton 'ajouter ingrédient':", addBtn);
  
  // Vérifier que la modal existe
  const modal = document.getElementById('ingredient-modal');
  console.log("Modal d'ingrédient:", modal);
  
  // Ajouter un gestionnaire d'événement au clic de manière directe
  if (addBtn && modal) {
    console.log("Ajout d'un nouveau gestionnaire d'événement au bouton");
    
    // Supprimer tous les gestionnaires d'événements existants (technique brutale mais efficace)
    const newBtn = addBtn.cloneNode(true);
    addBtn.parentNode.replaceChild(newBtn, addBtn);
    
    // Ajouter un nouveau gestionnaire d'événement
    newBtn.addEventListener('click', function(e) {
      console.log("CLIC DÉTECTÉ SUR LE BOUTON D'AJOUT!");
      e.preventDefault();
      e.stopPropagation();
      
      // Afficher directement la modal
      modal.style.display = 'flex';
      
      // Réinitialiser le formulaire manuellement
      const form = document.getElementById('ingredient-form');
      if (form) {
        form.reset();
      }
      
      // Mettre à jour le titre
      const titleEl = document.getElementById('modal-title');
      if (titleEl) {
        titleEl.textContent = 'Ajouter un ingrédient';
      }
      
      // Vider l'ID
      const idField = document.getElementById('ingredient-id');
      if (idField) {
        idField.value = '';
      }
    });
    
    console.log("Nouveau gestionnaire d'événement ajouté avec succès");
  } else {
    console.error("Impossible d'ajouter le gestionnaire: éléments manquants");
  }
  
  // Tester aussi les boutons de fermeture
  const closeBtn = document.getElementById('modal-close');
  const cancelBtn = document.getElementById('cancel-btn');
  
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', function() {
      console.log("Clic sur le bouton de fermeture");
      modal.style.display = 'none';
    });
  }
  
  if (cancelBtn && modal) {
    cancelBtn.addEventListener('click', function() {
      console.log("Clic sur le bouton d'annulation");
      modal.style.display = 'none';
    });
  }
  
  console.log("======= FIN DU CODE DE DÉBOGAGE =======");
});
  
  // Ajouter l'écouteur pour le clic sur l'icône des paramètres dans le header
  const settingsBtn = document.querySelector('.header-actions .fa-cog');
  if (settingsBtn) {
    settingsBtn.parentElement.addEventListener('click', openSettingsModal);
  } else {
    // Si le bouton n'existe pas encore, ajouter un écouteur pour quand il sera créé
    const observer = new MutationObserver(function(mutations) {
      mutations.forEach(function(mutation) {
        if (mutation.addedNodes.length) {
          const settingsBtn = document.querySelector('.header-actions .fa-cog');
          if (settingsBtn) {
            settingsBtn.parentElement.addEventListener('click', openSettingsModal);
            observer.disconnect();
          }
        }
      });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
  }
}

// Afficher les ingrédients
function displayIngredients() {
  // Récupérer les ingrédients du localStorage
  currentIngredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
  
  // Récupérer le tbody
  const tbody = document.getElementById('ingredient-list');
  tbody.innerHTML = '';
  
  // Afficher un message si le stock est vide
  const emptyMessage = document.getElementById('empty-stock-message');
  if (currentIngredients.length === 0) {
    emptyMessage.style.display = 'flex';
    return;
  } else {
    emptyMessage.style.display = 'none';
  }
  
  // Filtrer et trier les ingrédients
  filterAndSortIngredients();
}

// Fonction pour filtrer et trier les ingrédients
function filterAndSortIngredients() {
  // Récupérer les valeurs des filtres
  const categoryFilter = document.getElementById('category-filter').value;
  const statusFilter = document.getElementById('status-filter').value;
  const sortBy = document.getElementById('sort-by').value;
  const searchTerm = document.getElementById('search-ingredient').value.toLowerCase();
  
  // Récupérer le tbody
  const tbody = document.getElementById('ingredient-list');
  tbody.innerHTML = '';
  
  // Filtrer les ingrédients
  let filteredIngredients = currentIngredients.filter(ingredient => {
    // Filtrage par catégorie
    if (categoryFilter !== 'all' && ingredient.category !== categoryFilter) {
      return false;
    }
    
    // Filtrage par statut
    if (statusFilter !== 'all') {
      const status = getIngredientStatus(ingredient);
      if (status !== statusFilter) {
        return false;
      }
    }
    
    // Filtrage par terme de recherche
    if (searchTerm && !ingredient.name.toLowerCase().includes(searchTerm)) {
      return false;
    }
    
    return true;
  });
  
  // Trier les ingrédients
  filteredIngredients.sort((a, b) => {
    switch (sortBy) {
      case 'name':
        return a.name.localeCompare(b.name);
      case 'quantity':
        return b.quantity - a.quantity;
      case 'category':
        return a.category.localeCompare(b.category);
      case 'expiry':
        // Si pas de date d'expiration, mettre à la fin
        if (!a.expiry) return 1;
        if (!b.expiry) return -1;
        return new Date(a.expiry) - new Date(b.expiry);
      default:
        return 0;
    }
  });
  
  // Afficher les ingrédients filtrés et triés
  filteredIngredients.forEach(ingredient => {
    const row = createIngredientRow(ingredient);
    tbody.appendChild(row);
  });
  
  // Afficher un message si aucun résultat
  const emptyMessage = document.getElementById('empty-stock-message');
  if (filteredIngredients.length === 0) {
    emptyMessage.style.display = 'flex';
    if (searchTerm) {
      emptyMessage.innerHTML = `
        <i class="fas fa-search fa-3x"></i>
        <p>Aucun ingrédient ne correspond à votre recherche "${searchTerm}".</p>
      `;
    } else {
      emptyMessage.innerHTML = `
        <i class="fas fa-filter fa-3x"></i>
        <p>Aucun ingrédient ne correspond à vos filtres.</p>
      `;
    }
  } else {
    emptyMessage.style.display = 'none';
  }
}

// Créer une ligne de tableau pour un ingrédient
function createIngredientRow(ingredient) {
  const row = document.createElement('tr');
  
  // Déterminer le statut de l'ingrédient pour le style
  const status = getIngredientStatus(ingredient);
  if (status !== 'ok') {
    row.classList.add(`status-${status}`);
  }
  
  // Créer les cellules
  row.innerHTML = `
    <td>${ingredient.name}</td>
    <td>${formatCategory(ingredient.category)}</td>
    <td>${ingredient.quantity} ${ingredient.unit}</td>
    <td>${ingredient.expiry ? formatDate(ingredient.expiry) : '-'}</td>
    <td>${ingredient.threshold} ${ingredient.unit}</td>
    <td class="actions">
      <button class="btn-icon edit-btn" data-id="${ingredient.id}">
        <i class="fas fa-edit"></i>
      </button>
      <button class="btn-icon delete-btn" data-id="${ingredient.id}">
        <i class="fas fa-trash"></i>
      </button>
      <button class="btn-icon convert-btn" data-id="${ingredient.id}">
        <i class="fas fa-exchange-alt"></i>
      </button>
    </td>
  `;
  
  // Ajouter les écouteurs d'événements
  row.querySelector('.edit-btn').addEventListener('click', function() {
    editIngredient(this.getAttribute('data-id'));
  });
  
  row.querySelector('.delete-btn').addEventListener('click', function() {
    showDeleteConfirmation(this.getAttribute('data-id'));
  });
  
  row.querySelector('.convert-btn').addEventListener('click', function() {
    showUnitConversionModal(this.getAttribute('data-id'));
  });
  
  return row;
}

// Déterminer le statut d'un ingrédient (pour le style et le filtrage)
function getIngredientStatus(ingredient) {
  // Vérifier l'expiration
  if (ingredient.expiry) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const expiryDate = new Date(ingredient.expiry);
    expiryDate.setHours(0, 0, 0, 0);
    
    if (expiryDate < today) {
      return 'expired'; // Périmé
    }
    
    // Récupérer le nombre de jours avant alerte d'expiration des paramètres
    const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
    const expiryAlertDays = settings.expiryAlertDays || 3;
    
    const alertDate = new Date();
    alertDate.setDate(alertDate.getDate() + expiryAlertDays);
    alertDate.setHours(0, 0, 0, 0);
    
    if (expiryDate <= alertDate) {
      return 'expiring'; // Bientôt périmé
    }
  }
  
  // Vérifier le seuil de quantité
  if (ingredient.threshold > 0 && ingredient.quantity <= ingredient.threshold) {
    return 'low'; // Stock bas
  }
  
  return 'ok'; // Tout va bien
}

// Formater une catégorie (première lettre en majuscule)
function formatCategory(category) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

// Formater une date pour l'affichage
function formatDate(dateString) {
  const date = new Date(dateString);
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${day}/${month}/${year}`;
}

// Ouvrir la modal d'ajout d'ingrédient
function openAddIngredientModal() {
  // Réinitialiser le formulaire
  document.getElementById('ingredient-form').reset();
  document.getElementById('modal-title').textContent = 'Ajouter un ingrédient';
  document.getElementById('ingredient-id').value = '';
  
  // Charger l'unité par défaut des paramètres
  const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
  if (settings.defaultUnit) {
    document.getElementById('ingredient-unit').value = settings.defaultUnit;
    document.getElementById('threshold-unit').textContent = settings.defaultUnit;
  }
  
  // Afficher la modal
  document.getElementById('ingredient-modal').style.display = 'flex';
  
  // Initialiser l'autocomplétion
  setTimeout(initAutocomplete, 100);
}

// Éditer un ingrédient
function editIngredient(id) {
  // Trouver l'ingrédient
  const ingredient = currentIngredients.find(item => item.id === id);
  
  if (ingredient) {
    // Remplir le formulaire
    document.getElementById('ingredient-id').value = ingredient.id;
    document.getElementById('ingredient-name').value = ingredient.name;
    document.getElementById('ingredient-category').value = ingredient.category;
    document.getElementById('ingredient-quantity').value = ingredient.quantity;
    document.getElementById('ingredient-unit').value = ingredient.unit;
    document.getElementById('threshold-unit').textContent = ingredient.unit;
    document.getElementById('ingredient-threshold').value = ingredient.threshold;
    document.getElementById('ingredient-expiry').value = ingredient.expiry || '';
    
    // Mettre à jour le titre
    document.getElementById('modal-title').textContent = 'Modifier un ingrédient';
    
    // Afficher la modal
    document.getElementById('ingredient-modal').style.display = 'flex';
    
    // Initialiser l'autocomplétion
    setTimeout(initAutocomplete, 100);
  }
}

// Enregistrer un ingrédient
function saveIngredient() {
  // Récupérer les valeurs du formulaire
  const id = document.getElementById('ingredient-id').value || Date.now().toString();
  const name = document.getElementById('ingredient-name').value;
  const category = document.getElementById('ingredient-category').value;
  const quantity = parseFloat(document.getElementById('ingredient-quantity').value);
  const unit = document.getElementById('ingredient-unit').value;
  const threshold = parseFloat(document.getElementById('ingredient-threshold').value) || 0;
  const expiry = document.getElementById('ingredient-expiry').value || null;
  
  // Créer l'objet ingrédient
  const ingredient = { id, name, category, quantity, unit, threshold, expiry };
  
  // Vérifier si c'est une mise à jour ou un nouvel ajout
  const existingIndex = currentIngredients.findIndex(item => item.id === id);
  
  if (existingIndex >= 0) {
    currentIngredients[existingIndex] = ingredient;
    showNotification(`L'ingrédient "${name}" a été mis à jour.`, 'success');
  } else {
    currentIngredients.push(ingredient);
    showNotification(`L'ingrédient "${name}" a été ajouté.`, 'success');
  }
  
  // Sauvegarder dans localStorage
  localStorage.setItem('ingredients', JSON.stringify(currentIngredients));
  
  // Fermer la modal
  closeModals();
  
  // Mettre à jour l'affichage
  displayIngredients();
  
  // Mettre à jour les alertes et compteurs
  showStockAlerts();
  updateStockCounters();
}

// Afficher la confirmation de suppression
function showDeleteConfirmation(id) {
  // Stocker l'ID de l'ingrédient à supprimer
  ingredientToDelete = id;
  
  // Afficher la modal de confirmation
  document.getElementById('delete-modal').style.display = 'flex';
}

// Confirmer la suppression d'un ingrédient
function confirmDeleteIngredient() {
  if (ingredientToDelete) {
    // Trouver l'ingrédient
    const ingredient = currentIngredients.find(item => item.id === ingredientToDelete);
    const name = ingredient ? ingredient.name : 'Ingrédient';
    
    // Supprimer l'ingrédient
    currentIngredients = currentIngredients.filter(item => item.id !== ingredientToDelete);
    
    // Sauvegarder dans localStorage
    localStorage.setItem('ingredients', JSON.stringify(currentIngredients));
    
    // Afficher une notification
    showNotification(`L'ingrédient "${name}" a été supprimé.`, 'success');
    
    // Réinitialiser la variable
    ingredientToDelete = null;
    
    // Fermer la modal
    closeModals();
    
    // Mettre à jour l'affichage
    displayIngredients();
    
    // Mettre à jour les alertes et compteurs
    showStockAlerts();
    updateStockCounters();
  }
}

// Fermer toutes les modals
function closeModals() {
  const modals = document.querySelectorAll('.modal');
  modals.forEach(modal => {
    modal.style.display = 'none';
  });
}

// Afficher les alertes de stock
function showStockAlerts() {
  const alertContainer = document.getElementById('stock-alerts');
  alertContainer.innerHTML = '';
  
  // Compter les alertes par type
  let lowStockCount = 0;
  let expiringCount = 0;
  let expiredCount = 0;
  
  // Récupérer les paramètres pour le nombre de jours avant alerte d'expiration
  const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
  const expiryAlertDays = settings.expiryAlertDays || 3;
  
  // Date actuelle et date d'alerte
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const alertDate = new Date();
  alertDate.setDate(alertDate.getDate() + expiryAlertDays);
  alertDate.setHours(0, 0, 0, 0);
  
  // Vérifier chaque ingrédient
  currentIngredients.forEach(ingredient => {
    // Vérifier le seuil
    if (ingredient.threshold > 0 && ingredient.quantity <= ingredient.threshold) {
      lowStockCount++;
    }
    
    // Vérifier l'expiration
    if (ingredient.expiry) {
      const expiryDate = new Date(ingredient.expiry);
      expiryDate.setHours(0, 0, 0, 0);
      
      if (expiryDate < today) {
        expiredCount++;
      } else if (expiryDate <= alertDate) {
        expiringCount++;
      }
    }
  });
  
  // Afficher les alertes s'il y en a
  if (lowStockCount > 0 || expiringCount > 0 || expiredCount > 0) {
    let alerts = '';
    
    if (expiredCount > 0) {
      alerts += `
        <div class="notification notification-error">
          <i class="fas fa-exclamation-circle"></i>
          <span>${expiredCount} ingrédient(s) périmé(s). Vérifiez votre stock.</span>
        </div>
      `;
    }
    
    if (expiringCount > 0) {
      alerts += `
        <div class="notification notification-warning">
          <i class="fas fa-exclamation-triangle"></i>
          <span>${expiringCount} ingrédient(s) périront dans les ${expiryAlertDays} prochains jours.</span>
        </div>
      `;
    }
    
    if (lowStockCount > 0) {
      alerts += `
        <div class="notification notification-info">
          <i class="fas fa-info-circle"></i>
          <span>${lowStockCount} ingrédient(s) sont en quantité faible.</span>
        </div>
      `;
    }
    
    alertContainer.innerHTML = alerts;
  }
}

// Mettre à jour les compteurs du stock
function updateStockCounters() {
  // Compter par type
  let totalIngredients = currentIngredients.length;
  let lowStockCount = 0;
  let expiringSoonCount = 0;
  
  // Récupérer les paramètres
  const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
  const expiryAlertDays = settings.expiryAlertDays || 3;
  
  // Date d'alerte
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const alertDate = new Date();
  alertDate.setDate(alertDate.getDate() + expiryAlertDays);
  alertDate.setHours(0, 0, 0, 0);
  
  // Compter les ingrédients par statut
  currentIngredients.forEach(ingredient => {
    // Stock bas
    if (ingredient.threshold > 0 && ingredient.quantity <= ingredient.threshold) {
      lowStockCount++;
    }
    
    // Bientôt périmé
    if (ingredient.expiry) {
      const expiryDate = new Date(ingredient.expiry);
      expiryDate.setHours(0, 0, 0, 0);
      
      if (expiryDate > today && expiryDate <= alertDate) {
        expiringSoonCount++;
      }
    }
  });
  
  // Compter les recettes possibles
  const potentialRecipes = countPotentialRecipes();
  
  // Mettre à jour les compteurs dans l'interface
  document.getElementById('total-ingredients').textContent = totalIngredients;
  document.getElementById('low-stock-count').textContent = lowStockCount;
  document.getElementById('expiring-soon-count').textContent = expiringSoonCount;
  document.getElementById('potential-recipes').textContent = potentialRecipes;
}

// Compter les recettes réalisables avec le stock actuel
function countPotentialRecipes() {
  // Récupérer toutes les recettes
  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  
  if (recipes.length === 0) {
    return 0;
  }
  
  // Compter combien de recettes peuvent être réalisées avec le stock actuel
  let count = 0;
  
  recipes.forEach(recipe => {
    // Vérifier si tous les ingrédients sont disponibles
    const canMake = recipe.ingredients.every(recipeIngredient => {
      // Trouver l'ingrédient dans le stock
      const stockItem = currentIngredients.find(item => 
        item.name.toLowerCase() === recipeIngredient.name.toLowerCase()
      );
      
      // Vérifier si l'ingrédient est disponible et en quantité suffisante
      if (!stockItem) return false;
      
      // Convertir les unités si nécessaire
      if (recipeIngredient.unit !== stockItem.unit) {
        // Conversion simplifiée - pour une version plus complète, utilisez convertToBaseUnit
        const recipeQuantityBase = convertToBaseUnit(recipeIngredient.quantity, recipeIngredient.unit);
        const stockQuantityBase = convertToBaseUnit(stockItem.quantity, stockItem.unit);
        
        return stockQuantityBase >= recipeQuantityBase;
      } else {
        // Même unité, simple comparaison
        return stockItem.quantity >= recipeIngredient.quantity;
      }
    });
    
    if (canMake) {
      count++;
    }
  });
  
  return count;
}

// Exporter le stock
function exportStock() {
  // Préparer les données
  const data = [
    ['Nom', 'Catégorie', 'Quantité', 'Unité', 'Seuil d\'alerte', 'Date d\'expiration', 'Statut']
  ];
  
  currentIngredients.forEach(ingredient => {
    data.push([
      ingredient.name,
      ingredient.category,
      ingredient.quantity,
      ingredient.unit,
      ingredient.threshold,
      ingredient.expiry || '',
      getIngredientStatus(ingredient)
    ]);
  });
  
  // Convertir en CSV
  let csv = '';
  data.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  // Créer un blob et un lien de téléchargement
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  // Créer l'URL et le lien
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `stock_${formatDateForFilename(new Date())}.csv`);
  link.style.display = 'none';
  
  // Ajouter à la page, cliquer et nettoyer
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // Afficher une notification
  showNotification('Le stock a été exporté avec succès.', 'success');
}

// Formater une date pour un nom de fichier
function formatDateForFilename(date) {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const year = date.getFullYear();
  
  return `${year}${month}${day}`;
}

// Afficher une notification
function showNotification(message, type = 'info') {
  // Créer l'élément de notification
  const notification = document.createElement('div');
  notification.className = `notification notification-${type}`;
  
  // Ajouter l'icône en fonction du type
  let icon;
  switch (type) {
    case 'success':
      icon = 'fas fa-check-circle';
      break;
    case 'error':
      icon = 'fas fa-exclamation-circle';
      break;
    case 'warning':
      icon = 'fas fa-exclamation-triangle';
      break;
    default:
      icon = 'fas fa-info-circle';
  }
  
  // Construire le contenu
  notification.innerHTML = `
    <i class="${icon}"></i>
    <span>${message}</span>
  `;
  
  // Ajouter à la page
  const container = document.createElement('div');
  container.className = 'notification-container';
  container.style.position = 'fixed';
  container.style.top = '20px';
  container.style.right = '20px';
  container.style.zIndex = '9999';
  
  container.appendChild(notification);
  document.body.appendChild(container);
  
  // Supprimer après un délai
  setTimeout(() => {
    container.style.opacity = '0';
    container.style.transition = 'opacity 0.5s';
    
    setTimeout(() => {
      document.body.removeChild(container);
    }, 500);
  }, 3000);
}

// Dictionnaire pour la catégorisation automatique des ingrédients
const ingredientCategories = {
  // Poissons
  'poisson': ['poisson', 'saumon', 'thon', 'dorade', 'cabillaud', 'merlu', 'truite', 'raie', 'aile de raie', 'ailes de raie', 'sole', 'bar', 'loup', 'merlan', 'sardine', 'anchois', 'hareng', 'maquereau', 'lotte', 'julienne', 'colin', 'crevette', 'gambas', 'langoustine', 'homard', 'langouste', 'crabe', 'moule', 'huître', 'palourde', 'coquille', 'st-jacques', 'saint-jacques', 'calamars', 'poulpe', 'seiche'],
  
  // Viandes
  'viande': ['viande', 'boeuf', 'poulet', 'dinde', 'porc', 'veau', 'agneau', 'lapin', 'canard', 'cheval', 'foie', 'gésier', 'coeur', 'rognon', 'tripe', 'ris de veau', 'jambon', 'lard', 'bacon', 'saucisse', 'saucisson', 'chorizo', 'salami', 'pâté', 'terrine', 'andouillette', 'boudin', 'merguez', 'chipolata', 'côte', 'entrecôte', 'filet', 'cuisse', 'aile', 'escalope', 'gigot', 'épaule'],
  
  // Légumes
  'légume': ['légume', 'carotte', 'pomme de terre', 'oignon', 'poireau', 'ail', 'échalote', 'tomate', 'courgette', 'aubergine', 'poivron', 'salade', 'laitue', 'endive', 'épinard', 'brocoli', 'chou', 'chou-fleur', 'asperge', 'artichaut', 'céleri', 'fenouil', 'betterave', 'radis', 'navet', 'champignon', 'maïs', 'petit pois', 'haricot vert', 'haricot blanc', 'lentille', 'pois chiche', 'concombre', 'avocat', 'olive'],
  
  // Fruits
  'fruit': ['fruit', 'pomme', 'poire', 'banane', 'orange', 'citron', 'pamplemousse', 'mandarine', 'clémentine', 'ananas', 'mangue', 'kiwi', 'fraise', 'framboise', 'myrtille', 'mûre', 'groseille', 'cassis', 'cerise', 'abricot', 'pêche', 'nectarine', 'prune', 'mirabelle', 'raisin', 'melon', 'pastèque', 'figue', 'grenade', 'papaye', 'goyave', 'litchi', 'noix de coco', 'datte', 'châtaigne', 'marron'],
  
  // Épices
  'épice': ['épice', 'sel', 'poivre', 'cannelle', 'muscade', 'vanille', 'curry', 'cumin', 'coriandre', 'paprika', 'piment', 'thym', 'romarin', 'laurier', 'basilic', 'persil', 'menthe', 'safran', 'gingembre', 'cardamome', 'clou de girofle', 'anis', 'badiane', 'herbe', 'bouquet garni', 'estragon', 'ciboulette', 'aneth', 'curcuma', 'ras el hanout', 'garam masala', 'quatre-épices', 'piment d\'espelette'],
  
  // Produits laitiers
  'produit laitier': ['lait', 'crème', 'beurre', 'fromage', 'yaourt', 'yogourt', 'camembert', 'brie', 'emmental', 'gruyère', 'comté', 'roquefort', 'bleu', 'chèvre', 'mozzarella', 'parmesan', 'ricotta', 'mascarpone', 'feta', 'crème fraîche', 'crème liquide', 'lait de coco', 'petit-suisse', 'faisselle', 'cottage cheese', 'kéfir', 'babeurre', 'lait fermenté'],
  
  // Céréales
  'céréale': ['céréale', 'riz', 'pâtes', 'spaghetti', 'macaroni', 'blé', 'semoule', 'couscous', 'quinoa', 'boulgour', 'orge', 'avoine', 'millet', 'sarrasin', 'tapioca', 'polenta', 'maïzena', 'farine', 'pain', 'baguette', 'biscottes', 'crackers', 'flocon d\'avoine', 'muesli', 'céréales petit déjeuner'],
  
  // Liquides
  'liquide': ['eau', 'huile', 'vinaigre', 'vin', 'bière', 'cidre', 'spiritueux', 'rhum', 'whisky', 'cognac', 'vodka', 'jus', 'sirop', 'soda', 'limonade', 'café', 'thé', 'chocolat chaud', 'infusion', 'bouillon', 'fond', 'sauce', 'ketchup', 'mayonnaise', 'moutarde', 'huile d\'olive', 'huile de tournesol', 'huile de colza', 'huile de sésame', 'vinaigre balsamique', 'vinaigre de vin', 'vin blanc', 'vin rouge']
};

// Fonction pour déterminer automatiquement la catégorie d'un ingrédient
function suggestCategory(ingredientName) {
  const lowerName = ingredientName.toLowerCase();
  
  for (const [category, keywords] of Object.entries(ingredientCategories)) {
    for (const keyword of keywords) {
      if (lowerName.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'autre'; // Catégorie par défaut
}

// Fonction pour initialiser l'autocomplétion
// Remplacez complètement la fonction initAutocomplete() par celle-ci:
// Fonction pour initialiser l'autocomplétion
function initAutocomplete() {
  console.log("Initialisation de l'autocomplétion...");
  
  const inputField = document.getElementById('ingredient-name');
  const suggestionsContainer = document.getElementById('ingredient-suggestions');
  const categorySelect = document.getElementById('ingredient-category');
  
  if (!inputField || !suggestionsContainer || !categorySelect) {
    console.error("Éléments HTML manquants");
    return;
  }
  
  // Récupérer les ingrédients déjà en stock pour les suggestions
  const stockIngredientNames = currentIngredients.map(item => item.name);
  
  // Fusionner les ingrédients courants avec ceux du stock (sans doublons)
  const allIngredients = [...new Set([...ingredientsComplets, ...stockIngredientNames])].sort();
  
  console.log("Nombre total d'ingrédients disponibles:", allIngredients.length);
  
  // Variable pour suivre la suggestion sélectionnée
  let selectedIndex = -1;
  
  // Événement d'entrée dans le champ
  inputField.addEventListener('input', function() {
    const input = this.value.toLowerCase();
    suggestionsContainer.innerHTML = '';
    
    // Réinitialiser la sélection
    selectedIndex = -1;
    
    if (input.length < 1) {
      suggestionsContainer.classList.remove('show');
      return;
    }
    
    // Filtrer les ingrédients correspondants
    const matches = allIngredients.filter(ingredient => 
      ingredient.toLowerCase().includes(input)
    );
    
    console.log("Correspondances trouvées:", matches.length);
    
    if (matches.length > 0) {
      // Afficher les suggestions
      suggestionsContainer.classList.add('show');
      
      // Limiter à 10 suggestions maximum
      matches.slice(0, 10).forEach(match => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.textContent = match;
        item.dataset.value = match;  // Stocker la valeur dans un attribut data
        
        suggestionsContainer.appendChild(item);
      });
      
      // Ajouter un gestionnaire d'événements de clic global sur le conteneur
      suggestionsContainer.onclick = function(event) {
        if (event.target.classList.contains('autocomplete-item')) {
          const selectedValue = event.target.dataset.value;
          console.log("Valeur sélectionnée:", selectedValue);
          
          // Mettre à jour le champ
          inputField.value = selectedValue;
          
          // Masquer les suggestions
          suggestionsContainer.classList.remove('show');
          
          // Suggérer une catégorie
          let category = 'autre';
          
          // Logique simplifiée de suggestion de catégorie
          const lowerValue = selectedValue.toLowerCase();
          
          if (['tomate', 'carotte', 'poireau', 'oignon', 'ail', 'salade', 'épinard', 'courgette', 'aubergine'].some(veg => lowerValue.includes(veg))) {
            category = 'légume';
          } else if (['pomme', 'poire', 'banane', 'fraise', 'orange', 'citron', 'kiwi', 'ananas'].some(fruit => lowerValue.includes(fruit))) {
            category = 'fruit';
          } else if (['boeuf', 'porc', 'poulet', 'dinde', 'agneau', 'veau', 'jambon'].some(meat => lowerValue.includes(meat))) {
            category = 'viande';
          } else if (['saumon', 'thon', 'dorade', 'cabillaud', 'truite', 'crevette'].some(fish => lowerValue.includes(fish))) {
            category = 'poisson';
          }
          
          console.log("Catégorie suggérée:", category);
          categorySelect.value = category;
          
          // Donner le focus au champ de quantité
          setTimeout(() => {
            document.getElementById('ingredient-quantity').focus();
          }, 100);
        }
      };
    } else {
      suggestionsContainer.classList.remove('show');
    }
  });
  
  // Cacher les suggestions quand on clique ailleurs
  document.addEventListener('click', function(e) {
    if (e.target !== inputField && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.classList.remove('show');
    }
  });
  
  console.log("Initialisation de l'autocomplétion terminée");
}  // Suggestion automatique de catégorie quand l'utilisateur finit de taper
  inputField.addEventListener('blur', function() {
    // Petit délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      suggestionsContainer.classList.remove('show');
      
      // Si l'ingrédient n'est pas vide et la catégorie est sur "autre", suggérer automatiquement
      if (this.value.trim() !== '' && categorySelect.value === 'autre') {
        const suggestedCategory = suggestCategory(this.value);
        if (suggestedCategory !== 'autre') {
          categorySelect.value = suggestedCategory;
        }
      }
    }, 150);
  });
  
  // Navigation au clavier dans les suggestions
  inputField.addEventListener('keydown', function(e) {
    const suggestionsItems = suggestionsContainer.querySelectorAll('.autocomplete-item');
    
    // Si pas de suggestions, ne rien faire
    if (!suggestionsContainer.classList.contains('show')) return;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        selectedIndex = Math.min(selectedIndex + 1, suggestionsItems.length - 1);
        updateSelection();
        break;
        
      case 'ArrowUp':
        e.preventDefault();
        selectedIndex = Math.max(selectedIndex - 1, -1);
        updateSelection();
        break;
        
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          inputField.value = suggestionsItems[selectedIndex].textContent;
          suggestionsContainer.classList.remove('show');
        }
        break;
        
      case 'Escape':
        suggestionsContainer.classList.remove('show');
        break;
    }
    
    // Mettre à jour la sélection visuellement
    function updateSelection() {
      suggestionsItems.forEach((item, index) => {
        if (index === selectedIndex) {
          item.classList.add('selected');
          // Scroll vers l'élément sélectionné si nécessaire
          item.scrollIntoView({ block: 'nearest' });
        } else {
          item.classList.remove('selected');
        }
      });
    }
  });
  
  // Cacher les suggestions quand on clique ailleurs
  document.addEventListener('click', function(e) {
    if (e.target !== inputField && !suggestionsContainer.contains(e.target)) {
      suggestionsContainer.classList.remove('show');
    }
  });
  
  // Aussi cacher les suggestions quand on quitte le champ
  inputField.addEventListener('blur', function() {
    // Petit délai pour permettre le clic sur une suggestion
    setTimeout(() => {
      suggestionsContainer.classList.remove('show');
    }, 150);
  });
}

// Fonction pour afficher les suggestions d'ingrédients
function showIngredientSuggestions() {
  // Récupérer les recettes et le stock
  const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
  
  // Si pas de recettes, informer l'utilisateur
  if (recipes.length === 0) {
    showNotification('Ajoutez d\'abord des recettes pour obtenir des suggestions d\'ingrédients', 'info');
    return;
  }
  
  // Extraire tous les ingrédients des recettes
  const recipeIngredients = [];
  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => {
      // Vérifier si cet ingrédient est déjà en stock
      const inStock = currentIngredients.some(stockItem => 
        stockItem.name.toLowerCase() === ingredient.name.toLowerCase()
      );
      
      if (!inStock) {
        // Ajouter à la liste des ingrédients manquants
        const existingIndex = recipeIngredients.findIndex(item => 
          item.name.toLowerCase() === ingredient.name.toLowerCase()
        );
        
        if (existingIndex >= 0) {
          // Incrémenter le compteur d'occurrences
          recipeIngredients[existingIndex].occurrences++;
          
          // Ajouter le nom de la recette s'il n'est pas déjà présent
          if (!recipeIngredients[existingIndex].recipes.includes(recipe.name)) {
            recipeIngredients[existingIndex].recipes.push(recipe.name);
          }
        } else {
          // Ajouter le nouvel ingrédient
          recipeIngredients.push({
            name: ingredient.name,
            unit: ingredient.unit,
            occurrences: 1,
            recipes: [recipe.name]
          });
        }
      }
    });
  });
  
  // Trier par nombre d'occurrences
  recipeIngredients.sort((a, b) => b.occurrences - a.occurrences);
  
  // Créer et afficher la modal de suggestions
  const suggestionsModal = document.createElement('div');
  suggestionsModal.className = 'modal';
  suggestionsModal.id = 'suggestions-modal';
  
  let modalContent = `
    <div class="modal-content">
      <div class="modal-header">
        <h2>Suggestions d'ingrédients</h2>
        <button class="modal-close" id="suggestions-modal-close">×</button>
      </div>
  `;
  
  if (recipeIngredients.length === 0) {
    modalContent += `
      <div class="empty-list" style="padding: 20px;">
        <i class="fas fa-check-circle fa-3x" style="color: #4CAF50;"></i>
        <p>Tous les ingrédients de vos recettes sont déjà en stock !</p>
      </div>
    `;
  } else {
    modalContent += `
      <p>Voici les ingrédients qui ne sont pas encore dans votre stock mais qui sont utilisés dans vos recettes :</p>
      
      <div class="suggestion-list">
        <table class="stock-table">
          <thead>
            <tr>
              <th>Ingrédient</th>
              <th>Unité</th>
              <th>Utilisé dans</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
    `;
    
    // Limiter à 10 suggestions max
    recipeIngredients.slice(0, 10).forEach(ingredient => {
      modalContent += `
        <tr>
          <td>${ingredient.name}</td>
          <td>${ingredient.unit}</td>
          <td>${ingredient.recipes.join(', ')}</td>
          <td>
            <button class="btn btn-sm add-suggested-ingredient" data-ingredient='${JSON.stringify(ingredient)}'>
              <i class="fas fa-plus"></i> Ajouter
            </button>
          </td>
        </tr>
      `;
    });
    
    modalContent += `
          </tbody>
        </table>
      </div>
    `;
  }
  
  modalContent += `
      <div class="modal-footer">
        <button class="btn" id="suggestions-close-btn">Fermer</button>
      </div>
    </div>
  `;
  
  suggestionsModal.innerHTML = modalContent;
  document.body.appendChild(suggestionsModal);
  suggestionsModal.style.display = 'flex';
  
  // Gérer les événements
  document.getElementById('suggestions-modal-close').addEventListener('click', () => {
    suggestionsModal.remove();
  });
  
  document.getElementById('suggestions-close-btn').addEventListener('click', () => {
    suggestionsModal.remove();
  });
  
  // Ajouter les écouteurs sur les boutons d'ajout
  const addButtons = suggestionsModal.querySelectorAll('.add-suggested-ingredient');
  addButtons.forEach(button => {
    button.addEventListener('click', function() {
      const ingredient = JSON.parse(this.getAttribute('data-ingredient'));
      
      // Préremplir le formulaire d'ajout d'ingrédient
      document.getElementById('ingredient-id').value = '';
      document.getElementById('ingredient-name').value = ingredient.name;
      document.getElementById('ingredient-unit').value = ingredient.unit || 'unité';
      document.getElementById('ingredient-quantity').value = '';
      document.getElementById('ingredient-threshold').value = '0';
      document.getElementById('ingredient-expiry').value = '';
      
      // Fermer la modal de suggestions
      suggestionsModal.remove();
      
      // Ouvrir la modal d'ajout d'ingrédient
      document.getElementById('modal-title').textContent = 'Ajouter un ingrédient';
      document.getElementById('ingredient-modal').style.display = 'flex';
      
      // Initialiser l'autocomplétion
      setTimeout(initAutocomplete, 100);
    });
  });
}

// Fonction pour afficher la modal de conversion d'unités
function showUnitConversionModal(id) {
  // Trouver l'ingrédient
  const ingredient = currentIngredients.find(item => item.id === id);
  
  if (!ingredient) return;
  
  // Récupérer la modal
  const modal = document.getElementById('unit-conversion-modal');
  
  // Mettre à jour le titre
  modal.querySelector('.modal-header h2').textContent = `Conversion d'unité pour ${ingredient.name}`;
  
  // Ajouter un paragraphe avec la quantité actuelle
  const infoParagraph = modal.querySelector('p');
  infoParagraph.textContent = `Quantité actuelle : ${ingredient.quantity} ${ingredient.unit}`;
  
  // Pré-remplir le select avec l'unité actuelle
  const unitSelect = document.getElementById('convert-to-unit');
  unitSelect.value = ingredient.unit;
  
  // Pré-remplir la quantité
  document.getElementById('converted-quantity').value = ingredient.quantity;
  
  // Afficher la modal
  modal.style.display = 'flex';
  
  // Gérer les événements
  document.getElementById('unit-conversion-close').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('unit-conversion-cancel').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  // Mettre à jour la quantité convertie lorsque l'unité change
  unitSelect.addEventListener('change', function() {
    const newUnit = this.value;
    const convertedQuantity = calculateConversion(ingredient.quantity, ingredient.unit, newUnit);
    document.getElementById('converted-quantity').value = convertedQuantity;
  });
  
  // Gérer la sauvegarde
  document.getElementById('unit-conversion-save').addEventListener('click', () => {
    const newUnit = document.getElementById('convert-to-unit').value;
    const newQuantity = parseFloat(document.getElementById('converted-quantity').value);
    
    // Mettre à jour l'ingrédient
    const index = currentIngredients.findIndex(item => item.id === id);
    if (index >= 0) {
      currentIngredients[index].unit = newUnit;
      currentIngredients[index].quantity = newQuantity;
      
      // Mettre à jour le seuil d'alerte aussi
      if (currentIngredients[index].threshold > 0) {
        currentIngredients[index].threshold = calculateConversion(
          currentIngredients[index].threshold, 
          ingredient.unit, 
          newUnit
        );
      }
      
      // Sauvegarder dans localStorage
      localStorage.setItem('ingredients', JSON.stringify(currentIngredients));
      
      // Afficher une notification
      showNotification(`Les unités de "${ingredient.name}" ont été converties.`, 'success');
      
      // Mettre à jour l'affichage
      displayIngredients();
    }
    
    // Fermer la modal
    modal.style.display = 'none';
  });
}

// Fonction pour calculer la conversion entre unités
function calculateConversion(quantity, fromUnit, toUnit) {
  // Si même unité, pas de conversion nécessaire
  if (fromUnit === toUnit) return quantity;
  
  // Convertir en unité de base
  let baseQuantity;
  switch(fromUnit) {
    case 'kg': baseQuantity = quantity * 1000; break; // en g
    case 'L': baseQuantity = quantity * 1000; break;  // en ml
    default: baseQuantity = quantity;
  }
  
  // Convertir en unité cible
  let convertedQuantity;
  switch(toUnit) {
    case 'kg': convertedQuantity = baseQuantity / 1000; break; // de g à kg
    case 'L': convertedQuantity = baseQuantity / 1000; break;  // de ml à L
    default: convertedQuantity = baseQuantity;
  }
  
  // Arrondir à 2 décimales
  return Math.round(convertedQuantity * 100) / 100;
}

// Fonction pour convertir en unité de base (pour comparaisons)
function convertToBaseUnit(quantity, unit) {
  switch(unit) {
    case 'kg': return quantity * 1000; // Convertir en g
    case 'L': return quantity * 1000;  // Convertir en ml
    default: return quantity;
  }
}

// Fonction pour ouvrir la modal de paramètres
function openSettingsModal() {
  const modal = document.getElementById('settings-modal');
  
  // Si la modal n'existe pas encore, la créer
  if (!modal) {
    // Cette partie ne devrait pas être nécessaire car la modal est déjà dans le HTML
    return;
  }
  
  // Charger les paramètres existants
  loadSettings();
  
  // Afficher la modal
  modal.style.display = 'flex';
  
  // Gérer les événements
  document.getElementById('settings-modal-close').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('settings-cancel-btn').addEventListener('click', () => {
    modal.style.display = 'none';
  });
  
  document.getElementById('settings-save-btn').addEventListener('click', saveSettings);
}

// Charger les paramètres
function loadSettings() {
  const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
  
  if (settings.defaultUnit) {
    document.getElementById('default-unit').value = settings.defaultUnit;
  }
  
  if (settings.autoUpdateStock !== undefined) {
    document.getElementById('auto-update-stock').checked = settings.autoUpdateStock;
  }
  
  if (settings.expiryAlertDays) {
    document.getElementById('expiry-alert-days').value = settings.expiryAlertDays;
  } else {
    document.getElementById('expiry-alert-days').value = 3; // Valeur par défaut
  }
}

// Sauvegarder les paramètres
function saveSettings() {
  const settings = {
    defaultUnit: document.getElementById('default-unit').value,
    autoUpdateStock: document.getElementById('auto-update-stock').checked,
    expiryAlertDays: parseInt(document.getElementById('expiry-alert-days').value) || 3
  };
  
  localStorage.setItem('app-settings', JSON.stringify(settings));
  document.getElementById('settings-modal').style.display = 'none';
  
  // Afficher une notification
  showNotification('Paramètres enregistrés avec succès', 'success');
  
  // Mettre à jour les alertes et compteurs
  showStockAlerts();
  updateStockCounters();
}