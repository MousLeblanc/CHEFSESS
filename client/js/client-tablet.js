// client/js/client-tablet.js
// Gestion de l'interface tablette client pour sélection modulaire

class ClientTablet {
  constructor() {
    this.restaurantId = null;
    this.currentSelection = {
      protein: null,
      sauce: null,
      accompaniment: null
    };
    this.restrictions = {
      allergies: [],
      intolerances: [],
      dietaryRestrictions: [],
      notes: ''
    };
    this.compatibleSauces = [];
    this.compatibleAccompaniments = [];
    this.init();
  }

  async init() {
    // Récupérer l'ID du restaurant depuis l'utilisateur connecté
    const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
    if (user && user._id) {
      this.restaurantId = user._id;
    } else {
      // Essayer de récupérer depuis l'API
      try {
        const response = await fetch('/api/auth/me', { credentials: 'include' });
        if (response.ok) {
          const data = await response.json();
          this.restaurantId = data.user?._id || data._id;
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de l\'utilisateur:', error);
      }
    }

    this.setupEventListeners();
    // Ne pas charger les protéines au démarrage - attendre que l'utilisateur indique ses restrictions
  }

  setupEventListeners() {
    // Bouton "Continuer vers la sélection"
    const continueBtn = document.getElementById('btn-continue-selection');
    if (continueBtn) {
      continueBtn.addEventListener('click', () => this.goToSelection());
    }

    // Bouton "Retour aux restrictions"
    const backBtn = document.getElementById('btn-back-restrictions');
    if (backBtn) {
      backBtn.addEventListener('click', () => this.goBackToRestrictions());
    }

    // Listes déroulantes pour les restrictions
    const allergiesSelect = document.getElementById('allergies-select');
    if (allergiesSelect) {
      allergiesSelect.addEventListener('change', (e) => {
        this.restrictions.allergies = Array.from(e.target.selectedOptions).map(option => option.value);
      });
    }

    const intolerancesSelect = document.getElementById('intolerances-select');
    if (intolerancesSelect) {
      intolerancesSelect.addEventListener('change', (e) => {
        this.restrictions.intolerances = Array.from(e.target.selectedOptions).map(option => option.value);
      });
    }

    const dietaryRestrictionsSelect = document.getElementById('dietary-restrictions-select');
    if (dietaryRestrictionsSelect) {
      dietaryRestrictionsSelect.addEventListener('change', (e) => {
        this.restrictions.dietaryRestrictions = Array.from(e.target.selectedOptions).map(option => option.value);
      });
    }

    const notesInput = document.getElementById('customer-notes');
    if (notesInput) {
      notesInput.addEventListener('input', (e) => {
        this.restrictions.notes = e.target.value;
      });
    }

    // Bouton de validation
    const submitBtn = document.getElementById('submit-order-btn');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => this.submitOrder());
    }

    // Bouton reset
    const resetBtn = document.getElementById('reset-selection-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetSelection());
    }
  }

  goToSelection() {
    console.log('goToSelection appelé');
    
    // Collecter les restrictions depuis les listes déroulantes
    const allergiesSelect = document.getElementById('allergies-select');
    if (allergiesSelect) {
      this.restrictions.allergies = Array.from(allergiesSelect.selectedOptions).map(option => option.value);
      console.log('Allergies sélectionnées:', this.restrictions.allergies);
    }

    const intolerancesSelect = document.getElementById('intolerances-select');
    if (intolerancesSelect) {
      this.restrictions.intolerances = Array.from(intolerancesSelect.selectedOptions).map(option => option.value);
      console.log('Intolérances sélectionnées:', this.restrictions.intolerances);
    }

    const dietaryRestrictionsSelect = document.getElementById('dietary-restrictions-select');
    if (dietaryRestrictionsSelect) {
      this.restrictions.dietaryRestrictions = Array.from(dietaryRestrictionsSelect.selectedOptions).map(option => option.value);
      console.log('Régimes sélectionnés:', this.restrictions.dietaryRestrictions);
    }

    const notesInput = document.getElementById('customer-notes');
    if (notesInput) {
      this.restrictions.notes = notesInput.value;
    }

    // Afficher l'étape de sélection
    const stepRestrictions = document.getElementById('step-restrictions');
    const stepSelection = document.getElementById('step-selection');
    
    if (!stepSelection) {
      console.error('step-selection non trouvé');
      this.showError('Erreur: section de sélection non trouvée');
      return;
    }
    
    if (stepRestrictions) {
      stepRestrictions.style.display = 'none';
      stepRestrictions.classList.remove('active');
    }
    
    stepSelection.style.display = 'block';
    stepSelection.classList.add('active');
    
    console.log('Chargement des protéines...');
    // Charger les protéines compatibles
    this.loadCompatibleProteins();
  }

  async loadCompatibleProteins() {
    const container = document.getElementById('proteins-container');
    if (!container) {
      console.error('Container proteins-container non trouvé');
      return;
    }

    // Afficher un loader
    container.innerHTML = '<div class="loading-container"><div class="loader"></div><p>Chargement des protéines compatibles...</p></div>';

    try {
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      
      // Essayer d'abord avec l'API recipe-components (nécessite auth)
      // Si ça échoue, on utilisera une alternative
      let proteins = [];
      let useAlternative = false;

      try {
        // Construire les paramètres de requête avec les restrictions
        const params = new URLSearchParams();
        params.append('type', 'protein');
        
        // Combiner allergies et intolérances (tous les allergènes à exclure)
        const allAllergens = [...new Set([...this.restrictions.allergies, ...this.restrictions.intolerances])];
        if (allAllergens.length > 0) {
          params.append('allergens', allAllergens.join(','));
        }
        
        // Ajouter les restrictions alimentaires
        if (this.restrictions.dietaryRestrictions.length > 0) {
          params.append('dietaryRestrictions', this.restrictions.dietaryRestrictions.join(','));
        }

        console.log('Chargement des protéines avec paramètres:', params.toString());

        const response = await fetchFn(`/api/recipe-components?${params.toString()}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Réponse API recipe-components:', response.status, response.statusText);

        if (response.ok) {
          const data = await response.json();
          console.log('Données reçues:', data);
          proteins = data.data || data || [];
        } else if (response.status === 401 || response.status === 403) {
          // Pas d'authentification, utiliser l'alternative
          console.log('Authentification requise, utilisation de l\'alternative');
          useAlternative = true;
        } else {
          throw new Error(`Erreur ${response.status}: ${response.statusText}`);
        }
      } catch (apiError) {
        console.warn('Erreur avec recipe-components, utilisation alternative:', apiError);
        useAlternative = true;
      }

      // Alternative : charger depuis les recettes complètes (catégorie 'plat')
      if (useAlternative || proteins.length === 0) {
        console.log('Chargement depuis les recettes complètes...');
        const params = new URLSearchParams();
        params.append('categories', 'plat');
        
        const allAllergens = [...new Set([...this.restrictions.allergies, ...this.restrictions.intolerances])];
        if (allAllergens.length > 0) {
          params.append('allergens', allAllergens.join(','));
        }
        
        if (this.restrictions.dietaryRestrictions.length > 0) {
          params.append('dietaryRestrictions', this.restrictions.dietaryRestrictions.join(','));
        }

        const response = await fetchFn(`/api/restaurants/compatible-menus?${params.toString()}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        console.log('Réponse compatible-menus:', response.status, response.statusText);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ message: 'Erreur inconnue' }));
          console.error('Erreur compatible-menus:', errorData);
          throw new Error(errorData.message || `Erreur ${response.status}: Impossible de charger les menus`);
        }

        const data = await response.json();
        console.log('Données menus reçues:', data);
        const menus = data.data || data || [];
        
        // Transformer les menus en format "protéine" pour l'affichage
        proteins = menus.map(menu => ({
          _id: menu._id,
          name: menu.frenchTitle || menu.name,
          description: menu.description || '',
          tags: menu.tags || [],
          allergens: menu.allergens || [],
          dietaryRestrictions: menu.dietaryRestrictions || []
        }));
      }
      
      if (!Array.isArray(proteins)) {
        console.error('Les données reçues ne sont pas un tableau:', proteins);
        throw new Error('Format de données invalide');
      }
      
      if (proteins.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 2rem; color: #666; grid-column: 1 / -1;">
            <p style="font-size: 1.1em; margin-bottom: 1rem;">⚠️ Aucune option disponible avec vos restrictions.</p>
            <p style="margin-bottom: 1rem;">Veuillez modifier vos restrictions ou contacter le serveur.</p>
            <button onclick="window.clientTablet.goBackToRestrictions()" style="padding: 0.75rem 1.5rem; background: #e67e22; color: white; border: none; border-radius: 8px; cursor: pointer;">
              ← Modifier les restrictions
            </button>
          </div>
        `;
        return;
      }

      console.log(`${proteins.length} options trouvées`);
      this.displayProteins(proteins);
    } catch (error) {
      console.error('Erreur détaillée:', error);
      const errorMessage = error.message || 'Erreur inconnue';
      container.innerHTML = `
        <div style="text-align: center; padding: 2rem; color: #d32f2f; grid-column: 1 / -1;">
          <p style="font-size: 1.1em; margin-bottom: 1rem;">❌ Erreur lors du chargement</p>
          <p style="margin-bottom: 1rem; font-size: 0.9em;">${errorMessage}</p>
          <button onclick="window.clientTablet.loadCompatibleProteins()" style="padding: 0.75rem 1.5rem; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; margin-right: 1rem;">
            🔄 Réessayer
          </button>
          <button onclick="window.clientTablet.goBackToRestrictions()" style="padding: 0.75rem 1.5rem; background: #95a5a6; color: white; border: none; border-radius: 8px; cursor: pointer;">
            ← Retour
          </button>
        </div>
      `;
      this.showError(`Impossible de charger les options: ${errorMessage}`);
    }
  }

  goBackToRestrictions() {
    // Afficher l'étape des restrictions
    const stepRestrictions = document.getElementById('step-restrictions');
    const stepSelection = document.getElementById('step-selection');
    if (stepRestrictions) stepRestrictions.style.display = 'block';
    if (stepSelection) stepSelection.style.display = 'none';
  }

  async loadProteins() {
    try {
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      const response = await fetchFn('/api/recipe-components?type=protein', {
        credentials: 'include'
      });

      if (!response.ok) throw new Error('Erreur lors du chargement des protéines');

      const data = await response.json();
      this.displayProteins(data.data || data);
    } catch (error) {
      console.error('Erreur:', error);
      this.showError('Impossible de charger les protéines');
    }
  }

  displayProteins(proteins) {
    const container = document.getElementById('proteins-container');
    if (!container) return;

    container.innerHTML = '';

    proteins.forEach(protein => {
      const card = document.createElement('div');
      card.className = 'protein-card';
      card.dataset.proteinId = protein._id;
      
      card.innerHTML = `
        <div class="protein-image">
          ${protein.image ? `<img src="${protein.image}" alt="${protein.name}">` : '<div class="protein-placeholder">🍗</div>'}
        </div>
        <h3>${protein.name}</h3>
        <p class="protein-description">${protein.description || ''}</p>
        <div class="protein-tags">
          ${(protein.tags || []).slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
        </div>
        <button class="select-protein-btn" data-protein-id="${protein._id}">
          Sélectionner
        </button>
      `;

      const selectBtn = card.querySelector('.select-protein-btn');
      selectBtn.addEventListener('click', () => this.selectProtein(protein));

      container.appendChild(card);
    });
  }

  async selectProtein(protein) {
    this.currentSelection.protein = protein;
    
    // Mettre à jour l'affichage
    document.querySelectorAll('.protein-card').forEach(card => {
      card.classList.remove('selected');
      if (card.dataset.proteinId === protein._id) {
        card.classList.add('selected');
      }
      // Mettre à jour le texte du bouton
      const btn = card.querySelector('.select-protein-btn');
      if (btn) {
        if (card.dataset.proteinId === protein._id) {
          btn.textContent = '✓ Sélectionné';
        } else {
          btn.textContent = 'Sélectionner';
        }
      }
    });

    // Charger les sauces et accompagnements compatibles
    await this.loadCompatibleComponents(protein._id);
    
    // Afficher les sections suivantes
    const saucesSection = document.getElementById('sauces-section');
    const accompanimentsSection = document.getElementById('accompaniments-section');
    if (saucesSection) saucesSection.style.display = 'block';
    if (accompanimentsSection) accompanimentsSection.style.display = 'block';
    
    this.updateSuggestions();
  }

  async loadCompatibleComponents(proteinId) {
    try {
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      
      // Construire les paramètres avec les restrictions
      const allAllergens = [...new Set([...this.restrictions.allergies, ...this.restrictions.intolerances])];
      
      // Charger les sauces compatibles
      const sauceParams = new URLSearchParams();
      sauceParams.append('type', 'sauce');
      sauceParams.append('compatibleWithProtein', proteinId);
      if (allAllergens.length > 0) {
        sauceParams.append('allergens', allAllergens.join(','));
      }
      if (this.restrictions.dietaryRestrictions.length > 0) {
        sauceParams.append('dietaryRestrictions', this.restrictions.dietaryRestrictions.join(','));
      }
      
      const saucesResponse = await fetchFn(`/api/recipe-components?${sauceParams.toString()}`, {
        credentials: 'include'
      });
      
      // Charger les accompagnements compatibles
      const accompanimentParams = new URLSearchParams();
      accompanimentParams.append('type', 'accompaniment');
      accompanimentParams.append('compatibleWithProtein', proteinId);
      if (allAllergens.length > 0) {
        accompanimentParams.append('allergens', allAllergens.join(','));
      }
      if (this.restrictions.dietaryRestrictions.length > 0) {
        accompanimentParams.append('dietaryRestrictions', this.restrictions.dietaryRestrictions.join(','));
      }
      
      const accompanimentsResponse = await fetchFn(`/api/recipe-components?${accompanimentParams.toString()}`, {
        credentials: 'include'
      });

      if (saucesResponse.ok) {
        const saucesData = await saucesResponse.json();
        this.compatibleSauces = saucesData.data || saucesData;
        this.displaySauces(this.compatibleSauces);
      }

      if (accompanimentsResponse.ok) {
        const accompanimentsData = await accompanimentsResponse.json();
        this.compatibleAccompaniments = accompanimentsData.data || accompanimentsData;
        this.displayAccompaniments(this.compatibleAccompaniments);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des composants:', error);
    }
  }

  displaySauces(sauces) {
    const container = document.getElementById('sauces-container');
    if (!container) return;

    container.innerHTML = '<option value="">Aucune sauce</option>';

    sauces.forEach(sauce => {
      const option = document.createElement('option');
      option.value = sauce._id;
      option.textContent = sauce.name;
      container.appendChild(option);
    });

    container.addEventListener('change', (e) => {
      if (e.target.value) {
        this.currentSelection.sauce = sauces.find(s => s._id === e.target.value);
      } else {
        this.currentSelection.sauce = null;
      }
      this.updateSuggestions();
    });
  }

  displayAccompaniments(accompaniments) {
    const container = document.getElementById('accompaniments-container');
    if (!container) return;

    container.innerHTML = '<option value="">Aucun accompagnement</option>';

    accompaniments.forEach(accompaniment => {
      const option = document.createElement('option');
      option.value = accompaniment._id;
      option.textContent = accompaniment.name;
      container.appendChild(option);
    });

    container.addEventListener('change', (e) => {
      if (e.target.value) {
        this.currentSelection.accompaniment = accompaniments.find(a => a._id === e.target.value);
      } else {
        this.currentSelection.accompaniment = null;
      }
      this.updateSuggestions();
    });
  }

  async updateSuggestions() {
    // Filtrer selon les restrictions
    if (!this.currentSelection.protein) return;

    const summary = document.getElementById('order-summary');
    if (!summary) return;

    const tableNumber = document.getElementById('table-number')?.value || '1';
    const guestNumber = document.getElementById('guest-number')?.value || '1';

    let summaryHTML = '<h3>Récapitulatif de votre commande</h3>';
    summaryHTML += `<p><strong>Table:</strong> ${tableNumber} | <strong>Convive:</strong> ${guestNumber}</p>`;
    
    if (this.currentSelection.protein) {
      summaryHTML += `<p><strong>Protéine:</strong> ${this.currentSelection.protein.name}</p>`;
    }
    
    if (this.currentSelection.sauce) {
      summaryHTML += `<p><strong>Sauce:</strong> ${this.currentSelection.sauce.name}</p>`;
    } else {
      summaryHTML += `<p><strong>Sauce:</strong> Aucune</p>`;
    }
    
    if (this.currentSelection.accompaniment) {
      summaryHTML += `<p><strong>Accompagnement:</strong> ${this.currentSelection.accompaniment.name}</p>`;
    } else {
      summaryHTML += `<p><strong>Accompagnement:</strong> Aucun</p>`;
    }

    // Afficher les restrictions
    if (this.restrictions.allergies.length > 0 || 
        this.restrictions.intolerances.length > 0 || 
        this.restrictions.dietaryRestrictions.length > 0 ||
        this.restrictions.notes) {
      summaryHTML += '<div class="restrictions-alert" style="margin-top: 1rem; padding-top: 1rem; border-top: 2px solid #e9ecef;">';
      summaryHTML += '<strong>⚠️ Vos restrictions:</strong><ul>';
      if (this.restrictions.allergies.length > 0) {
        summaryHTML += `<li>Allergies: ${this.restrictions.allergies.join(', ')}</li>`;
      }
      if (this.restrictions.intolerances.length > 0) {
        summaryHTML += `<li>Intolérances: ${this.restrictions.intolerances.join(', ')}</li>`;
      }
      if (this.restrictions.dietaryRestrictions.length > 0) {
        summaryHTML += `<li>Régimes: ${this.restrictions.dietaryRestrictions.join(', ')}</li>`;
      }
      if (this.restrictions.notes) {
        summaryHTML += `<li>Notes: ${this.restrictions.notes}</li>`;
      }
      summaryHTML += '</ul></div>';
    }

    summary.innerHTML = summaryHTML;
    summary.style.display = 'block';
    
    // Afficher le bouton de soumission
    const submitBtn = document.getElementById('submit-order-btn');
    if (submitBtn) {
      submitBtn.style.display = 'block';
    }
  }

  async submitOrder() {
    if (!this.currentSelection.protein) {
      this.showError('Veuillez sélectionner au moins une protéine');
      return;
    }

    if (!this.restaurantId) {
      this.showError('Erreur: Restaurant non identifié');
      return;
    }

    const tableNumber = parseInt(document.getElementById('table-number')?.value) || 1;
    const guestNumber = parseInt(document.getElementById('guest-number')?.value) || 1;

    const orderData = {
      restaurantId: this.restaurantId,
      proteinId: this.currentSelection.protein._id,
      sauceId: this.currentSelection.sauce?._id || null,
      accompanimentId: this.currentSelection.accompaniment?._id || null,
      restrictions: this.restrictions,
      tableNumber: tableNumber,
      guestNumber: guestNumber
    };

    try {
      const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
      const response = await fetchFn('/api/customer-orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(orderData)
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Erreur lors de la création de la commande');
      }

      const result = await response.json();
      this.showSuccess('Commande envoyée au chef avec succès !');
      
      // Réinitialiser après 2 secondes
      setTimeout(() => {
        this.resetSelection();
      }, 2000);

    } catch (error) {
      console.error('Erreur:', error);
      this.showError(error.message || 'Erreur lors de l\'envoi de la commande');
    }
  }

  resetSelection() {
    this.currentSelection = {
      protein: null,
      sauce: null,
      accompaniment: null
    };
    this.restrictions = {
      allergies: [],
      intolerances: [],
      dietaryRestrictions: [],
      notes: ''
    };

    // Réinitialiser les formulaires
    const allergiesSelect = document.getElementById('allergies-select');
    if (allergiesSelect) {
      Array.from(allergiesSelect.options).forEach(option => option.selected = false);
    }

    const intolerancesSelect = document.getElementById('intolerances-select');
    if (intolerancesSelect) {
      Array.from(intolerancesSelect.options).forEach(option => option.selected = false);
    }

    const dietaryRestrictionsSelect = document.getElementById('dietary-restrictions-select');
    if (dietaryRestrictionsSelect) {
      Array.from(dietaryRestrictionsSelect.options).forEach(option => option.selected = false);
    }

    document.getElementById('customer-notes').value = '';
    document.getElementById('sauces-container').value = '';
    document.getElementById('accompaniments-container').value = '';
    document.getElementById('table-number').value = '';
    document.getElementById('guest-number').value = '1';

    // Masquer les sections
    document.getElementById('sauces-section').style.display = 'none';
    document.getElementById('accompaniments-section').style.display = 'none';
    document.getElementById('order-summary').innerHTML = '';

    // Retirer la sélection visuelle
    document.querySelectorAll('.protein-card').forEach(card => card.classList.remove('selected'));
  }

  showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
      errorDiv.textContent = message;
      errorDiv.style.display = 'block';
      errorDiv.className = 'alert alert-danger';
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 5000);
    }
  }

  showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
      successDiv.textContent = message;
      successDiv.style.display = 'block';
      successDiv.className = 'alert alert-success';
      setTimeout(() => {
        successDiv.style.display = 'none';
      }, 5000);
    }
  }
}

// Initialiser quand le DOM est prêt
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.clientTablet = new ClientTablet();
  });
} else {
  window.clientTablet = new ClientTablet();
}




