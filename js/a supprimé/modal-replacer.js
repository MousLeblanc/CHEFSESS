// js/modal-replacer.js
(function() {
  console.log("=== Remplacement complet de la modal ===");
  
  // Fonction d'initialisation principale
  function initModalReplacement() {
    console.log("Initialisation du remplacement de modal");
    
    // 1. Recherche du bouton d'ajout d'ingrédient
    const addIngredientBtn = document.querySelector('button#add-ingredient-btn, .btn#add-ingredient-btn, button:contains("Ajouter un ingrédient")');
    
    if (!addIngredientBtn) {
      console.error("Bouton d'ajout d'ingrédient introuvable");
      createEmergencyOpenButton();
      return;
    }
    
    console.log("Bouton d'ajout trouvé:", addIngredientBtn);
    
    // 2. Supprimer toute modal existante
    const existingModal = document.getElementById('ingredient-modal');
    if (existingModal) {
      console.log("Suppression de la modal existante");
      existingModal.remove();
    }
    
    // 3. Créer une nouvelle modal et l'injecter dans le document
    createAndInjectModal();
    
    // 4. Attacher l'événement au bouton
    addIngredientBtn.addEventListener('click', function() {
      openModal();
    });
    
    console.log("Remplacement de modal terminé avec succès");
  }
  
  // Fonction pour créer et injecter la modal dans le document
  function createAndInjectModal() {
    console.log("Création d'une nouvelle modal");
    
    const modalHTML = `
      <div class="modal" id="new-ingredient-modal" style="display: none; position: fixed; z-index: 9999; left: 0; top: 0; width: 100%; height: 100%; overflow: auto; background-color: rgba(0,0,0,0.5); justify-content: center; align-items: center;">
        <div class="modal-content" style="background-color: white; margin: 10% auto; padding: 20px; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.2); width: 80%; max-width: 500px; position: relative;">
          <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px; margin-bottom: 15px;">
            <h2 id="new-modal-title">Ajouter un ingrédient</h2>
            <button id="new-modal-close" style="background: none; border: none; font-size: 1.5rem; cursor: pointer;">×</button>
          </div>
          
          <form id="new-ingredient-form">
            <input type="hidden" id="new-ingredient-id">
            
            <div class="form-group" style="margin-bottom: 15px;">
              <label for="new-ingredient-name" style="display: block; margin-bottom: 5px; font-weight: bold;">Nom de l'ingrédient</label>
              <input type="text" id="new-ingredient-name" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
              <div id="new-ingredient-suggestions" style="position: absolute; width: 100%; background: white; border: 1px solid #ccc; border-top: none; max-height: 200px; overflow-y: auto; display: none; z-index: 1000;"></div>
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
              <label for="new-ingredient-category" style="display: block; margin-bottom: 5px; font-weight: bold;">Catégorie</label>
              <select id="new-ingredient-category" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" required>
                <option value="viande">Viande</option>
                <option value="poisson">Poisson</option>
                <option value="légume">Légume</option>
                <option value="fruit">Fruit</option>
                <option value="épice">Épice</option>
                <option value="produit laitier">Produit laitier</option>
                <option value="céréale">Céréale</option>
                <option value="liquide">Liquide</option>
                <option value="autre" selected>Autre</option>
              </select>
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
              <label for="new-ingredient-quantity" style="display: block; margin-bottom: 5px; font-weight: bold;">Quantité</label>
              <div style="display: flex;">
                <input type="number" id="new-ingredient-quantity" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px 0 0 4px;" step="0.01" min="0" required>
                <select id="new-ingredient-unit" style="width: 80px; padding: 8px; border: 1px solid #ddd; border-left: none; border-radius: 0 4px 4px 0;">
                  <option value="g">g</option>
                  <option value="kg">kg</option>
                  <option value="ml">ml</option>
                  <option value="L">L</option>
                  <option value="unité" selected>unité</option>
                </select>
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
              <label for="new-ingredient-threshold" style="display: block; margin-bottom: 5px; font-weight: bold;">Seuil d'alerte</label>
              <div style="display: flex; align-items: center;">
                <input type="number" id="new-ingredient-threshold" style="flex: 1; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" step="0.01" min="0" value="0">
                <span id="new-threshold-unit" style="margin-left: 10px;">unité</span>
              </div>
            </div>
            
            <div class="form-group" style="margin-bottom: 15px;">
              <label for="new-ingredient-expiry" style="display: block; margin-bottom: 5px; font-weight: bold;">Date d'expiration (optionnel)</label>
              <input type="date" id="new-ingredient-expiry" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
            </div>
            
            <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 10px; border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
              <button type="button" id="new-cancel-btn" style="padding: 8px 16px; background-color: #f8f8f8; border: 1px solid #ddd; border-radius: 4px; cursor: pointer;">Annuler</button>
              <button type="submit" id="new-save-btn" style="padding: 8px 16px; background-color: #8b4513; color: white; border: none; border-radius: 4px; cursor: pointer;">Enregistrer</button>
            </div>
          </form>
        </div>
      </div>
    `;
    
    // Injecter la modal dans le document
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Attacher les événements à la nouvelle modal
    const modal = document.getElementById('new-ingredient-modal');
    const closeBtn = document.getElementById('new-modal-close');
    const cancelBtn = document.getElementById('new-cancel-btn');
    const form = document.getElementById('new-ingredient-form');
    
    // Fermeture de la modal
    closeBtn.addEventListener('click', closeModal);
    cancelBtn.addEventListener('click', closeModal);
    
    // Soumission du formulaire
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      saveIngredient();
    });
    
    // Mise à jour de l'unité pour le seuil
    const unitSelect = document.getElementById('new-ingredient-unit');
    const thresholdUnit = document.getElementById('new-threshold-unit');
    
    unitSelect.addEventListener('change', function() {
      thresholdUnit.textContent = this.value;
    });
    
    // Autocomplete pour le nom de l'ingrédient
    setupSimpleAutocomplete();
  }
  
  // Fonction pour ouvrir la modal
  function openModal() {
    console.log("Ouverture de la modal");
    
    // Réinitialiser le formulaire
    document.getElementById('new-ingredient-form').reset();
    document.getElementById('new-modal-title').textContent = 'Ajouter un ingrédient';
    document.getElementById('new-ingredient-id').value = '';
    
    // Charger l'unité par défaut des paramètres (si disponible)
    try {
      const settings = JSON.parse(localStorage.getItem('app-settings') || '{}');
      if (settings.defaultUnit) {
        document.getElementById('new-ingredient-unit').value = settings.defaultUnit;
        document.getElementById('new-threshold-unit').textContent = settings.defaultUnit;
      }
    } catch (error) {
      console.error("Erreur lors du chargement des paramètres:", error);
    }
    
    // Afficher la modal
    const modal = document.getElementById('new-ingredient-modal');
    modal.style.display = 'flex';
  }
  
  // Fonction pour fermer la modal
  function closeModal() {
    console.log("Fermeture de la modal");
    document.getElementById('new-ingredient-modal').style.display = 'none';
  }
  
  // Fonction pour sauvegarder l'ingrédient
  function saveIngredient() {
    console.log("Sauvegarde de l'ingrédient");
    
    // Récupérer les valeurs du formulaire
    const id = document.getElementById('new-ingredient-id').value || Date.now().toString();
    const name = document.getElementById('new-ingredient-name').value;
    const category = document.getElementById('new-ingredient-category').value;
    const quantity = parseFloat(document.getElementById('new-ingredient-quantity').value);
    const unit = document.getElementById('new-ingredient-unit').value;
    const threshold = parseFloat(document.getElementById('new-ingredient-threshold').value) || 0;
    const expiry = document.getElementById('new-ingredient-expiry').value || null;
    
    // Créer l'objet ingrédient
    const ingredient = { id, name, category, quantity, unit, threshold, expiry };
    
    // Récupérer les ingrédients existants
    let currentIngredients = [];
    try {
      currentIngredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
    } catch (error) {
      console.error("Erreur lors de la récupération des ingrédients:", error);
    }
    
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
    closeModal();
    
    // Recharger la page pour afficher le nouvel ingrédient
    window.location.reload();
  }
  
  // Fonction pour afficher une notification
  function showNotification(message, type = 'info') {
    // Vérifier si la fonction showNotification existe déjà
    if (typeof window.showNotification === 'function') {
      window.showNotification(message, type);
    } else {
      // Créer une notification simple
      const notification = document.createElement('div');
      notification.textContent = message;
      notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background-color: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
        color: white;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
      `;
      
      document.body.appendChild(notification);
      
      setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transition = 'opacity 0.5s';
        
        setTimeout(() => {
          notification.remove();
        }, 500);
      }, 3000);
    }
  }
  
  // Configuration d'une autocomplétion simple
  function setupSimpleAutocomplete() {
    const inputField = document.getElementById('new-ingredient-name');
    const suggestionsContainer = document.getElementById('new-ingredient-suggestions');
    
    // Liste d'ingrédients de base
    const basicIngredients = [
      'Ail', 'Ananas', 'Aubergine', 'Avocat', 'Banane', 'Boeuf', 'Carottes',
      'Champignons', 'Citron', 'Concombre', 'Courgette', 'Fromage', 'Lait',
      'Oeufs', 'Oignons', 'Pâtes', 'Poisson', 'Pommes', 'Pommes de terre',
      'Poulet', 'Riz', 'Salade', 'Saumon', 'Tomates', 'Yaourt'
    ];
    
    // Récupérer également les ingrédients déjà en stock
    let currentIngredients = [];
    try {
      const storedIngredients = JSON.parse(localStorage.getItem('ingredients') || '[]');
      currentIngredients = storedIngredients.map(item => item.name);
    } catch (error) {
      console.error("Erreur lors de la récupération des ingrédients:", error);
    }
    
    // Fusionner les listes d'ingrédients (sans doublons)
    const allIngredients = [...new Set([...basicIngredients, ...currentIngredients])].sort();
    
    // Événement de saisie dans le champ
    inputField.addEventListener('input', function() {
      const input = this.value.toLowerCase();
      suggestionsContainer.innerHTML = '';
      
      if (input.length < 1) {
        suggestionsContainer.style.display = 'none';
        return;
      }
      
      // Filtrer les ingrédients correspondants
      const matches = allIngredients.filter(ingredient => 
        ingredient.toLowerCase().includes(input)
      );
      
      if (matches.length > 0) {
        suggestionsContainer.style.display = 'block';
        
        // Limiter à 10 suggestions maximum
        matches.slice(0, 10).forEach(match => {
          const item = document.createElement('div');
          item.textContent = match;
          item.style.cssText = 'padding: 8px 10px; cursor: pointer; border-bottom: 1px solid #eee;';
          
          item.addEventListener('mouseenter', function() {
            this.style.backgroundColor = '#f0f0f0';
          });
          
          item.addEventListener('mouseleave', function() {
            this.style.backgroundColor = 'transparent';
          });
          
          item.addEventListener('click', function() {
            inputField.value = match;
            suggestionsContainer.style.display = 'none';
            
            // Suggérer une catégorie
            suggestCategoryForIngredient(match);
          });
          
          suggestionsContainer.appendChild(item);
        });
      } else {
        suggestionsContainer.style.display = 'none';
      }
    });
    
    // Cacher les suggestions quand on clique ailleurs
    document.addEventListener('click', function(e) {
      if (e.target !== inputField && !suggestionsContainer.contains(e.target)) {
        suggestionsContainer.style.display = 'none';
      }
    });
  }
  
  // Suggérer une catégorie pour un ingrédient
  function suggestCategoryForIngredient(ingredientName) {
    const lowerName = ingredientName.toLowerCase();
    const categorySelect = document.getElementById('new-ingredient-category');
    
    // Règles simples de suggestion de catégorie
    if (['boeuf', 'poulet', 'porc', 'agneau', 'dinde', 'veau', 'jambon'].some(meat => lowerName.includes(meat))) {
      categorySelect.value = 'viande';
    } else if (['saumon', 'thon', 'cabillaud', 'merlu', 'crevette', 'poisson'].some(fish => lowerName.includes(fish))) {
      categorySelect.value = 'poisson';
    } else if (['carotte', 'oignon', 'tomate', 'salade', 'pomme de terre', 'courgette', 'aubergine', 'poivron', 'haricot', 'petit pois', 'chou', 'champignon'].some(veg => lowerName.includes(veg))) {
      categorySelect.value = 'légume';
    } else if (['pomme', 'banane', 'orange', 'citron', 'ananas', 'fraise', 'poire', 'pêche', 'raisin', 'kiwi', 'melon'].some(fruit => lowerName.includes(fruit))) {
      categorySelect.value = 'fruit';
    } else if (['sel', 'poivre', 'curry', 'paprika', 'cannelle', 'muscade', 'cumin', 'thym', 'romarin', 'basilic'].some(spice => lowerName.includes(spice))) {
      categorySelect.value = 'épice';
    } else if (['lait', 'yaourt', 'fromage', 'beurre', 'crème', 'camembert', 'comté', 'emmental', 'chèvre'].some(dairy => lowerName.includes(dairy))) {
      categorySelect.value = 'produit laitier';
    } else if (['riz', 'pâte', 'spaghetti', 'farine', 'pain', 'céréale', 'blé', 'maïs', 'avoine'].some(cereal => lowerName.includes(cereal))) {
      categorySelect.value = 'céréale';
    } else if (['eau', 'huile', 'vin', 'vinaigre', 'sauce', 'jus', 'bière', 'sirop', 'lait de coco'].some(liquid => lowerName.includes(liquid))) {
      categorySelect.value = 'liquide';
    } else {
      categorySelect.value = 'autre';
    }
  }
  
  // Créer un bouton d'urgence en cas de problème
  function createEmergencyOpenButton() {
    console.log("Création d'un bouton d'urgence");
    
    const emergencyBtn = document.createElement('button');
    emergencyBtn.textContent = "OUVRIR MODAL (URGENCE)";
    emergencyBtn.style.cssText = "position: fixed; top: 10px; right: 10px; z-index: 9999; background-color: red; color: white; padding: 10px; font-weight: bold; border: none; border-radius: 4px; cursor: pointer;";
    
    emergencyBtn.addEventListener('click', function() {
      createAndInjectModal();
      openModal();
    });
    
    document.body.appendChild(emergencyBtn);
  }
  
  // Exécuter l'initialisation lorsque le DOM est chargé
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModalReplacement);
  } else {
    initModalReplacement();
  }
})();