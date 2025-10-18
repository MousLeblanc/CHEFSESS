/**
 * Module d'intégration de la génération intelligente de menus dans les dashboards
 * Compatible avec tous les types d'établissements
 */

class DashboardMenuIntegration {
  constructor(establishmentType) {
    this.establishmentType = establishmentType;
    this.menuGenerator = new IntelligentMenuGenerator();
  }

  /**
   * Initialise le formulaire de génération de menus
   */
  init() {
    const form = document.getElementById('menu-form');
    if (!form) {
      console.warn('Formulaire de génération de menus non trouvé');
      return;
    }

    // Supprimer tous les anciens listeners
    form.removeEventListener('submit', this.handleSubmit);
    
    // Ajouter notre listener
    form.addEventListener('submit', (e) => this.handleSubmit(e));
    
    console.log('✅ Listener de formulaire ajouté par DashboardMenuIntegration');
    
    // Réinitialiser le container de groupes d'âge
    const container = document.getElementById('age-groups-container');
    if (container) {
      // Vider le container pour éviter les conflits avec l'ancien système
      container.innerHTML = '';
      console.log('✅ Container de groupes réinitialisé');
      
      // Ajouter un groupe par défaut
      this.addAgeGroup();
      console.log('✅ Groupe d\'âge initial ajouté');
    }
    
    // Initialiser le bouton d'ajout de groupe
    const addGroupBtn = document.getElementById('add-group-btn');
    if (addGroupBtn) {
      // Supprimer les anciens listeners
      const newBtn = addGroupBtn.cloneNode(true);
      addGroupBtn.parentNode.replaceChild(newBtn, addGroupBtn);
      
      // Ajouter le nouveau listener
      newBtn.addEventListener('click', () => this.addAgeGroup());
      console.log('✅ Bouton "Ajouter un groupe" configuré');
    }
  }

  /**
   * Ajoute un groupe d'âge au formulaire
   */
  addAgeGroup() {
    const container = document.getElementById('age-groups-container');
    if (!container) return;

    const groupIndex = container.children.length;
    const groupDiv = document.createElement('div');
    groupDiv.className = 'age-group';
    groupDiv.innerHTML = `
      <div style="padding: 1.5rem; background: #f8f9fa; border-radius: 12px; margin-bottom: 1.5rem; border: 2px solid #e0e0e0;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h4 style="margin: 0; color: #333;"><i class="fas fa-users"></i> Groupe ${groupIndex + 1}</h4>
          <button type="button" class="remove-group-btn" style="padding: 0.5rem 1rem; background: #e74c3c; color: white; border: none; border-radius: 4px; cursor: pointer; ${groupIndex === 0 ? 'visibility: hidden;' : ''}">
            <i class="fas fa-trash"></i> Retirer
          </button>
        </div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Tranche d'âge :</label>
            <select class="age-range" required style="width: 100%; padding: 0.5rem; border: 2px solid #ddd; border-radius: 6px;">
              <option value="2.5-6">2.5 - 6 ans (Maternelle)</option>
              <option value="6-12" selected>6 - 12 ans (Primaire)</option>
              <option value="12-18">12 - 18 ans (Secondaire)</option>
              <option value="adulte">Adultes</option>
            </select>
          </div>
          <div class="form-group" style="margin-bottom: 0;">
            <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;">Nombre de personnes :</label>
            <input type="number" class="age-count" min="1" value="30" required style="width: 100%; padding: 0.5rem; border: 2px solid #ddd; border-radius: 6px;">
          </div>
        </div>

        <div class="form-group" style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;"><i class="fas fa-utensils"></i> Structure du menu :</label>
          <select class="menu-structure" required style="width: 100%; padding: 0.5rem; border: 2px solid #ddd; border-radius: 6px;">
            <option value="plat_seul">Plat principal uniquement</option>
            <option value="soupe_plat">Soupe + Plat principal</option>
            <option value="entree_plat_dessert">Entrée + Plat + Dessert</option>
          </select>
          <small style="color: #666; font-size: 0.85rem; display: block; margin-top: 0.4rem;">
            💡 Le plat principal sera composé automatiquement (protéine + féculent ou légumes + féculent)
          </small>
        </div>
        
        <div class="form-group" style="margin-bottom: 1rem;">
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;"><i class="fas fa-leaf"></i> Régimes alimentaires :</label>
          <div class="group-restrictions-list" style="margin-bottom: 0.5rem;"></div>
          <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 0.5rem;">
            <select class="diet-select" style="padding: 0.5rem; border: 2px solid #ddd; border-radius: 6px;">
              <option value="">-- Sélectionner un régime --</option>
              <option value="vegetarien">Végétarien</option>
              <option value="vegan">Vegan</option>
              <option value="sans_gluten">Sans gluten</option>
              <option value="sans_lactose">Sans lactose</option>
              <option value="halal">Halal</option>
              <option value="casher">Casher</option>
            </select>
            <input type="number" class="diet-count-input" min="1" placeholder="Nb" style="padding: 0.5rem; border: 2px solid #ddd; border-radius: 6px;">
            <button type="button" class="add-diet-btn" style="padding: 0.5rem 1rem; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
        
        <div class="form-group" style="margin-bottom: 0;">
          <label style="display: block; font-weight: 600; margin-bottom: 0.5rem;"><i class="fas fa-exclamation-triangle"></i> Allergies :</label>
          <div class="group-allergens-list" style="margin-bottom: 0.5rem;"></div>
          <div style="display: grid; grid-template-columns: 2fr 1fr auto; gap: 0.5rem;">
            <select class="allergen-select" style="padding: 0.5rem; border: 2px solid #ddd; border-radius: 6px;">
              <option value="">-- Sélectionner une allergie --</option>
              <option value="gluten">Gluten</option>
              <option value="lactose">Lactose</option>
              <option value="oeufs">Œufs</option>
              <option value="arachides">Arachides</option>
              <option value="fruits_a_coque">Fruits à coque</option>
              <option value="poisson">Poisson</option>
              <option value="crustaces">Crustacés</option>
              <option value="soja">Soja</option>
              <option value="celeri">Céleri</option>
              <option value="moutarde">Moutarde</option>
              <option value="sesame">Sésame</option>
              <option value="sulfites">Sulfites</option>
              <option value="lupin">Lupin</option>
              <option value="mollusques">Mollusques</option>
            </select>
            <input type="number" class="allergen-count-input" min="1" placeholder="Nb" style="padding: 0.5rem; border: 2px solid #ddd; border-radius: 6px;">
            <button type="button" class="add-allergen-btn" style="padding: 0.5rem 1rem; background: #e67e22; color: white; border: none; border-radius: 6px; cursor: pointer;">
              <i class="fas fa-plus"></i>
            </button>
          </div>
        </div>
      </div>
    `;

    container.appendChild(groupDiv);

    // Gestionnaire de suppression du groupe
    const removeBtn = groupDiv.querySelector('.remove-group-btn');
    if (removeBtn && groupIndex > 0) {
      removeBtn.addEventListener('click', () => {
        groupDiv.remove();
        this.updateRemoveButtons();
        this.updateGroupNumbers();
      });
    }

    // Gestionnaires pour ajouter des régimes
    const addDietBtn = groupDiv.querySelector('.add-diet-btn');
    const dietSelect = groupDiv.querySelector('.diet-select');
    const dietCountInput = groupDiv.querySelector('.diet-count-input');
    const dietList = groupDiv.querySelector('.group-restrictions-list');

    addDietBtn.addEventListener('click', () => {
      const dietType = dietSelect.value;
      const dietCount = parseInt(dietCountInput.value);

      if (!dietType) {
        alert('Veuillez sélectionner un régime alimentaire');
        return;
      }
      if (!dietCount || dietCount < 1) {
        alert('Veuillez indiquer le nombre de personnes');
        return;
      }

      // Ajouter l'élément à la liste
      const item = document.createElement('div');
      item.className = 'diet-item';
      item.dataset.type = dietType;
      item.dataset.count = dietCount;
      item.style.cssText = 'display: inline-flex; align-items: center; padding: 0.5rem 0.8rem; background: #d4edda; border: 2px solid #27ae60; border-radius: 20px; margin: 0.25rem; color: #155724; font-weight: 600;';
      item.innerHTML = `
        <span>${dietSelect.options[dietSelect.selectedIndex].text} : ${dietCount} pers.</span>
        <button type="button" style="margin-left: 0.5rem; background: none; border: none; color: #c0392b; cursor: pointer; font-size: 1.1rem;" title="Supprimer">×</button>
      `;

      item.querySelector('button').addEventListener('click', () => item.remove());
      dietList.appendChild(item);

      // Réinitialiser les champs
      dietSelect.value = '';
      dietCountInput.value = '';
    });

    // Gestionnaires pour ajouter des allergies
    const addAllergenBtn = groupDiv.querySelector('.add-allergen-btn');
    const allergenSelect = groupDiv.querySelector('.allergen-select');
    const allergenCountInput = groupDiv.querySelector('.allergen-count-input');
    const allergenList = groupDiv.querySelector('.group-allergens-list');

    addAllergenBtn.addEventListener('click', () => {
      const allergenType = allergenSelect.value;
      const allergenCount = parseInt(allergenCountInput.value);

      if (!allergenType) {
        alert('Veuillez sélectionner une allergie');
        return;
      }
      if (!allergenCount || allergenCount < 1) {
        alert('Veuillez indiquer le nombre de personnes');
        return;
      }

      // Ajouter l'élément à la liste
      const item = document.createElement('div');
      item.className = 'allergen-item';
      item.dataset.type = allergenType;
      item.dataset.count = allergenCount;
      item.style.cssText = 'display: inline-flex; align-items: center; padding: 0.5rem 0.8rem; background: #fff3cd; border: 2px solid #e67e22; border-radius: 20px; margin: 0.25rem; color: #856404; font-weight: 600;';
      item.innerHTML = `
        <span>${allergenSelect.options[allergenSelect.selectedIndex].text} : ${allergenCount} pers.</span>
        <button type="button" style="margin-left: 0.5rem; background: none; border: none; color: #c0392b; cursor: pointer; font-size: 1.1rem;" title="Supprimer">×</button>
      `;

      item.querySelector('button').addEventListener('click', () => item.remove());
      allergenList.appendChild(item);

      // Réinitialiser les champs
      allergenSelect.value = '';
      allergenCountInput.value = '';
    });
  }

  /**
   * Met à jour la visibilité des boutons de suppression
   */
  updateRemoveButtons() {
    const container = document.getElementById('age-groups-container');
    if (!container) return;
    
    const groups = container.querySelectorAll('.age-group');
    groups.forEach((group, index) => {
      const removeBtn = group.querySelector('.remove-group-btn');
      if (removeBtn) {
        removeBtn.style.visibility = index === 0 && groups.length === 1 ? 'hidden' : 'visible';
      }
    });
  }

  /**
   * Met à jour les numéros des groupes
   */
  updateGroupNumbers() {
    const container = document.getElementById('age-groups-container');
    if (!container) return;
    
    const groups = container.querySelectorAll('.age-group');
    groups.forEach((group, index) => {
      const title = group.querySelector('h4');
      if (title) {
        title.innerHTML = `<i class="fas fa-users"></i> Groupe ${index + 1}`;
      }
    });
  }

  /**
   * Gère la soumission du formulaire
   */
  async handleSubmit(e) {
    e.preventDefault();

    const resultsDiv = document.getElementById('menu-results');
    if (!resultsDiv) return;

    // Afficher le loading
    resultsDiv.style.display = 'block';
    resultsDiv.innerHTML = `
      <div style="text-align: center; padding: 3rem;">
        <div style="border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
        <p>🎨 Génération du menu en cours...</p>
        <small>L'IA analyse vos 174 recettes et compose un menu personnalisé...</small>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;

    try {
      // Récupérer les groupes d'âge avec leurs filtres
      const ageGroups = [];
      const allAllergens = new Set();
      const allRestrictions = new Set();
      
      let menuStructure = 'plat_seul'; // Valeur par défaut
      
      document.querySelectorAll('.age-group').forEach((group, index) => {
        const ageRange = group.querySelector('.age-range').value;
        const count = parseInt(group.querySelector('.age-count').value);
        
        // Récupérer la structure du menu (on utilise celle du premier groupe)
        if (index === 0) {
          const structureSelect = group.querySelector('.menu-structure');
          if (structureSelect) {
            menuStructure = structureSelect.value;
          }
        }
        
        // Récupérer les régimes avec leurs quantités
        const groupRestrictions = [];
        group.querySelectorAll('.diet-item').forEach(item => {
          const dietType = item.dataset.type;
          const dietCount = parseInt(item.dataset.count);
          groupRestrictions.push({ type: dietType, count: dietCount });
          allRestrictions.add(dietType);
        });
        
        // Récupérer les allergènes avec leurs quantités
        const groupAllergens = [];
        group.querySelectorAll('.allergen-item').forEach(item => {
          const allergenType = item.dataset.type;
          const allergenCount = parseInt(item.dataset.count);
          groupAllergens.push({ type: allergenType, count: allergenCount });
          allAllergens.add(allergenType);
        });
        
        if (ageRange && count > 0) {
          ageGroups.push({ 
            ageRange, 
            count,
            dietaryRestrictions: groupRestrictions,
            allergens: groupAllergens
          });
        }
      });

      if (ageGroups.length === 0) {
        throw new Error('Veuillez ajouter au moins un groupe d\'âge');
      }

      // Les allergènes et restrictions viennent maintenant uniquement des groupes
      // (Les champs globaux "Besoins spécifiques" et "Ingrédients prioritaires" ont été retirés)

      // Calculer numDishes en fonction de la structure
      const numDishes = menuStructure === 'entree_plat_dessert' ? 3 : 2;

      // Configuration du menu
      const config = {
        establishmentType: this.establishmentType,
        ageGroups: ageGroups,
        numDishes: numDishes,
        menuStructure: menuStructure,
        allergens: Array.from(allAllergens),
        dietaryRestrictions: Array.from(allRestrictions),
        medicalConditions: [],
        texture: 'normale',
        useStockOnly: false
      };

      console.log('Configuration envoyée:', config);

      // Générer le menu
      const menu = await this.menuGenerator.generateMenu(config);

      // Afficher le résultat
      this.displayMenu(menu, resultsDiv);

    } catch (error) {
      console.error('Erreur:', error);
      resultsDiv.innerHTML = `
        <div style="background: #e74c3c; color: white; padding: 1.5rem; border-radius: 8px;">
          <h3 style="margin-top: 0;">❌ Erreur lors de la génération</h3>
          <p>${error.message}</p>
          <small>Vérifiez que vous êtes bien connecté et que le serveur est démarré.</small>
        </div>
      `;
    }
  }

  /**
   * Parse les allergènes depuis le texte libre
   */
  parseAllergens(text) {
    const allergenMap = {
      'gluten': ['gluten', 'blé'],
      'lactose': ['lactose', 'lait', 'produits laitiers'],
      'oeufs': ['œuf', 'oeuf'],
      'arachides': ['arachide', 'cacahuète'],
      'fruits_a_coque': ['noix', 'amande', 'noisette'],
      'poisson': ['poisson'],
      'soja': ['soja'],
      'crustaces': ['crustacé', 'crevette']
    };

    const found = [];
    const lowerText = text.toLowerCase();

    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        found.push(allergen);
      }
    });

    return found;
  }

  /**
   * Parse les restrictions alimentaires depuis le texte libre
   */
  parseDietaryRestrictions(text) {
    const restrictionMap = {
      'vegetarien': ['végétarien', 'vegetarien'],
      'vegan': ['vegan', 'végétalien'],
      'sans_gluten': ['sans gluten'],
      'sans_lactose': ['sans lactose'],
      'halal': ['halal'],
      'casher': ['casher', 'kasher']
    };

    const found = [];
    const lowerText = text.toLowerCase();

    Object.entries(restrictionMap).forEach(([restriction, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        found.push(restriction);
      }
    });

    return found;
  }

  /**
   * Formate le nom d'un allergène pour l'affichage
   */
  formatAllergenName(allergen) {
    const allergenNames = {
      'gluten': 'Gluten',
      'lactose': 'Lactose',
      'oeufs': 'Œufs',
      'arachides': 'Arachides',
      'fruits_a_coque': 'Fruits à coque',
      'soja': 'Soja',
      'poisson': 'Poisson',
      'crustaces': 'Crustacés',
      'mollusques': 'Mollusques',
      'celeri': 'Céleri',
      'moutarde': 'Moutarde',
      'sesame': 'Sésame',
      'sulfites': 'Sulfites',
      'lupin': 'Lupin'
    };
    return allergenNames[allergen] || allergen;
  }

  /**
   * Formate le nom d'une restriction alimentaire pour l'affichage
   */
  formatRestrictionName(restriction) {
    const restrictionNames = {
      'vegetarien': 'Végétarien',
      'vegan': 'Vegan',
      'sans_gluten': 'Sans gluten',
      'sans_lactose': 'Sans lactose',
      'halal': 'Halal',
      'casher': 'Casher',
      'sans_porc': 'Sans porc',
      'sans_viande_rouge': 'Sans viande rouge'
    };
    return restrictionNames[restriction] || restriction;
  }

  /**
   * Affiche le menu généré avec variantes
   */
  displayMenu(menu, container) {
    // Gérer l'ancien format (sans variantes) et le nouveau (avec variantes)
    const mainMenuDishes = menu.mainMenu ? menu.mainMenu.dishes : menu.dishes;
    const mainMenuCount = menu.mainMenu ? menu.mainMenu.count : menu.metadata.totalPeople;
    const variants = menu.variants || [];
    const hasVariants = variants.length > 0;
    
    container.innerHTML = `
      <div style="background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        <h2 style="color: #2c3e50; margin-top: 0;">🍽️ ${menu.title}</h2>
        <p style="color: #7f8c8d; font-size: 1.1rem;">${menu.description}</p>
        
        <div style="background: #ecf0f1; padding: 1rem; border-radius: 8px; margin: 1.5rem 0;">
          <strong>📊 Informations:</strong><br>
          Établissement: ${menu.metadata.establishmentType}<br>
          Total convives: ${menu.metadata.totalPeople} personnes<br>
          ${hasVariants ? `
            <span style="color: #e67e22; font-weight: 600;">
              🔄 Menu avec ${variants.length} variante(s) personnalisée(s)
            </span><br>
          ` : ''}
          Groupes: ${menu.metadata.ageGroups.map(g => `${g.count} × ${g.ageRange} ans`).join(', ')}
        </div>
        
        ${menu.mainMenu?.ageAdaptation || menu.ageAdaptation ? `
        <div style="background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #2196f3;">
          <strong style="color: #0d47a1; font-size: 1.1rem;">👶👧🧑 Adaptation des Portions par Âge</strong>
          <p style="color: #0d47a1; margin: 0.5rem 0 0 0; line-height: 1.6;">
            ${menu.mainMenu?.ageAdaptation || menu.ageAdaptation}
          </p>
        </div>
        ` : ''}
        
        ${hasVariants ? `
        <div style="background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%); padding: 1.5rem; border-radius: 8px; margin: 1.5rem 0; border-left: 4px solid #e67e22;">
          <strong style="color: #856404; font-size: 1.1rem;">🔄 Variantes Nécessaires</strong>
          <p style="color: #856404; margin: 0.5rem 0 0 0; line-height: 1.6;">
            ${variants.length} menu(x) adapté(s) avec des remplacements spécifiques :
          </p>
          <ul style="color: #856404; margin: 0.5rem 0 0 1.5rem; line-height: 1.8;">
            ${variants.map(v => `
              <li><strong>${v.name}</strong> : ${v.count} personne(s)
                ${v.allergens && v.allergens.length > 0 ? 
                  `<br><small style="color: #721c24;">🚫 Sans : ${v.allergens.map(a => this.formatAllergenName(a)).join(', ')}</small>` 
                  : ''}
                ${v.dietaryRestrictions && v.dietaryRestrictions.length > 0 ? 
                  `<br><small style="color: #155724;">🥗 ${v.dietaryRestrictions.map(r => this.formatRestrictionName(r)).join(', ')}</small>` 
                  : ''}
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        <!-- MENU PRINCIPAL -->
        <h3 style="color: #27ae60; border-bottom: 3px solid #27ae60; padding-bottom: 0.5rem; margin-top: 2rem; font-size: 1.5rem;">
          🍽️ Menu Principal (${mainMenuCount} convives)
        </h3>
        
        ${menu.mainMenu?.compatibleWith && menu.mainMenu.compatibleWith.length > 0 ? (() => {
          // Collecter tous les allergènes et restrictions exclus
          const allExcludedAllergens = new Set();
          const allExcludedRestrictions = new Set();
          menu.mainMenu.compatibleWith.forEach(profile => {
            if (profile.allergens) profile.allergens.forEach(a => allExcludedAllergens.add(a));
            if (profile.dietaryRestrictions) profile.dietaryRestrictions.forEach(r => allExcludedRestrictions.add(r));
          });
          
          const allergensText = allExcludedAllergens.size > 0 
            ? Array.from(allExcludedAllergens).map(a => this.formatAllergenName(a)).join(', ')
            : '';
          const restrictionsText = allExcludedRestrictions.size > 0 
            ? Array.from(allExcludedRestrictions).map(r => this.formatRestrictionName(r).toLowerCase()).join(', ')
            : '';
          
          const exclusionsText = [];
          if (allergensText) exclusionsText.push(`<strong>allergènes exclus</strong> : ${allergensText}`);
          if (restrictionsText) exclusionsText.push(`<strong>adapté aux</strong> : ${restrictionsText}`);
          
          return `
        <div style="background: linear-gradient(135deg, #d1f2eb 0%, #a9dfbf 100%); padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #27ae60;">
          <strong style="color: #0e6655; font-size: 1.1rem;">✅ Menu Compatible pour Tous</strong>
          <p style="color: #0e6655; margin: 0.75rem 0; line-height: 1.7; font-size: 1rem;">
            Ce menu ${exclusionsText.length > 0 ? `ne contient ${exclusionsText.join(' et ')}` : 'convient à tous les profils'}.<br>
            Il peut donc être servi <strong>sans modification</strong> aux <strong>${mainMenuCount} convives</strong> (incluant les ${menu.mainMenu.compatibleWith.map(p => `${p.count} ${p.name.toLowerCase()}`).join(', ')}).
          </p>
          <p style="color: #0e6655; margin: 0.75rem 0 0 0; font-size: 0.95rem; font-style: italic;">
            💡 <strong>Optimisation maximale :</strong> Un seul menu pour tous au lieu de ${menu.mainMenu.compatibleWith.length + 1} menus différents !
          </p>
        </div>
          `;
        })() : ''}
        
        ${this.renderDishes(mainMenuDishes, '#3498db')}
        
        <!-- VARIANTES -->
        ${hasVariants ? variants.map((variant, vIndex) => `
          <h3 style="color: #e67e22; border-bottom: 3px solid #e67e22; padding-bottom: 0.5rem; margin-top: 3rem; font-size: 1.5rem;">
            🔄 Variante ${vIndex + 1}: ${variant.name} (${variant.count} convives)
          </h3>
          
          ${variant.allergens && variant.allergens.length > 0 || variant.dietaryRestrictions && variant.dietaryRestrictions.length > 0 ? `
          <div style="background: #fff3cd; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #e67e22;">
            ${variant.allergens && variant.allergens.length > 0 ? `
              <strong style="color: #721c24;">🚫 Sans allergènes :</strong> ${variant.allergens.map(a => this.formatAllergenName(a)).join(', ')}<br>
            ` : ''}
            ${variant.dietaryRestrictions && variant.dietaryRestrictions.length > 0 ? `
              <strong style="color: #155724;">🥗 Régimes :</strong> ${variant.dietaryRestrictions.map(r => this.formatRestrictionName(r)).join(', ')}
            ` : ''}
          </div>
          ` : ''}
          
          ${variant.ageAdaptation && (variant.reusedDishes || variant.replacedDishes) ? `
          <div style="background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%); padding: 1.5rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #28a745;">
            <strong style="color: #155724; font-size: 1.05rem;">♻️ Optimisation du Menu</strong><br>
            <p style="color: #155724; margin: 0.5rem 0; line-height: 1.6;">
              ${variant.ageAdaptation}
            </p>
            ${variant.reusedDishes && variant.reusedDishes.length > 0 ? `
              <div style="margin-top: 0.75rem;">
                <strong style="color: #155724;">✅ Plats identiques au menu principal (${variant.reusedDishes.length}):</strong>
                <div style="margin-top: 0.5rem;">
                  ${variant.reusedDishes.map(dish => `
                    <span style="display: inline-block; background: white; color: #155724; padding: 0.4rem 0.8rem; border-radius: 15px; margin: 0.25rem; font-weight: 500; border: 1px solid #28a745;">
                      ${dish}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
            ${variant.replacedDishes && variant.replacedDishes.length > 0 ? `
              <div style="margin-top: 0.75rem;">
                <strong style="color: #856404;">🔄 Plats remplacés (${variant.replacedDishes.length}):</strong>
                <div style="margin-top: 0.5rem;">
                  ${variant.replacedDishes.map(r => `
                    <div style="background: white; padding: 0.5rem; border-radius: 8px; margin: 0.5rem 0; border-left: 3px solid #ffc107;">
                      <span style="text-decoration: line-through; color: #dc3545;">${r.original}</span>
                      <span style="color: #6c757d; margin: 0 0.5rem;">→</span>
                      <span style="color: #28a745; font-weight: 600;">${r.replacement}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
          ` : variant.ageAdaptation ? `
          <div style="background: #e3f2fd; padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 4px solid #2196f3;">
            <strong style="color: #0d47a1;">ℹ️ Adaptation :</strong><br>
            ${variant.ageAdaptation}
          </div>
          ` : ''}
          
          ${this.renderDishesWithTags(variant.dishes, variant.reusedDishes || [], '#e67e22')}
        `).join(''): ''}

        <!-- LISTE DE COURSES GLOBALE -->
        <h3 style="color: #f39c12; border-bottom: 2px solid #f39c12; padding-bottom: 0.5rem; margin-top: 3rem;">
          🛒 Liste de courses complète (${menu.shoppingList.length} ingrédients)
        </h3>
        <p style="color: #7f8c8d; font-style: italic; margin-bottom: 1rem;">
          ${hasVariants ? 'Cette liste inclut tous les ingrédients pour le menu principal ET les variantes.' : 'Liste des ingrédients nécessaires.'}
        </p>
        
        <table style="width: 100%; border-collapse: collapse; margin-top: 1rem;">
          <thead>
            <tr style="background: #3498db; color: white;">
              <th style="padding: 0.75rem; text-align: left;">Ingrédient</th>
              <th style="padding: 0.75rem; text-align: right;">Quantité</th>
              <th style="padding: 0.75rem; text-align: left;">Unité</th>
              <th style="padding: 0.75rem; text-align: left;">Pour les plats</th>
            </tr>
          </thead>
          <tbody>
            ${menu.shoppingList.map((item, index) => `
              <tr style="background: ${index % 2 === 0 ? '#f8f9fa' : 'white'};">
                <td style="padding: 0.75rem;">${item.name}</td>
                <td style="padding: 0.75rem; text-align: right; font-weight: 600;">${item.quantity}</td>
                <td style="padding: 0.75rem;">${item.unit}</td>
                <td style="padding: 0.75rem; font-size: 0.9rem; color: #7f8c8d;">${item.requiredFor.join(', ')}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="margin-top: 2rem; text-align: center;">
          <button onclick="window.print()" style="background: #27ae60; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; cursor: pointer; font-size: 1rem;">
            <i class="fas fa-print"></i> Imprimer le menu
          </button>
        </div>
      </div>
    `;

    // Scroll vers le résultat
    container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  
  /**
   * Rendu des plats (utilisé pour le menu principal et les variantes)
   */
  renderDishes(dishes, borderColor = '#3498db') {
    return dishes.map((dish, index) => {
      const isComposed = dish.isComposed && dish.components && dish.components.length > 0;
      
      return `
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 1.5rem; margin: 1rem 0; border-radius: 8px; border-left: 4px solid ${borderColor};">
        <h4 style="color: #2c3e50; margin-top: 0;">
          ${index + 1}. ${dish.name}
        </h4>
        <span style="background: ${borderColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; text-transform: uppercase;">
          ${dish.category}
        </span>
        
        ${isComposed ? `
          <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 3px solid #4caf50;">
            <strong style="color: #2e7d32; font-size: 0.95rem;">🍽️ Plat Complet Composé :</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem;">
              ${dish.components.map(comp => `
                <div style="background: white; padding: 0.5rem 1rem; border-radius: 15px; border: 2px solid #4caf50; color: #2e7d32; font-weight: 500;">
                  ${comp.type === 'proteine' ? '🍖' : comp.type === 'legumes' ? '🥗' : '🍚'} 
                  ${comp.recipe.title}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${dish.description ? `<p style="color: #7f8c8d; font-style: italic; margin: 0.5rem 0;">${dish.description}</p>` : ''}
        
        ${dish.nutrition && (dish.nutrition.calories || dish.nutrition.proteins || dish.nutrition.carbs || dish.nutrition.fats) ? `
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; font-size: 0.9rem;">
          ${dish.nutrition.calories ? `<span style="background: white; padding: 0.5rem 1rem; border-radius: 20px;">🔥 ${dish.nutrition.calories} kcal</span>` : ''}
          ${dish.nutrition.proteins ? `<span style="background: white; padding: 0.5rem 1rem; border-radius: 20px;">💪 ${dish.nutrition.proteins}g protéines</span>` : ''}
          ${dish.nutrition.carbs ? `<span style="background: white; padding: 0.5rem 1rem; border-radius: 20px;">🌾 ${dish.nutrition.carbs}g glucides</span>` : ''}
          ${dish.nutrition.fats ? `<span style="background: white; padding: 0.5rem 1rem; border-radius: 20px;">🥑 ${dish.nutrition.fats}g lipides</span>` : ''}
        </div>
        ` : `
        <div style="background: #fff3cd; padding: 0.75rem; border-radius: 6px; margin: 1rem 0; font-size: 0.9rem; font-style: italic; color: #856404;">
          ℹ️ Informations nutritionnelles à compléter
        </div>
        `}

        <details style="margin-top: 1rem;">
          <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem; background: white; border-radius: 4px;">
            📝 Ingrédients (${dish.ingredients.length})
          </summary>
          <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
            ${dish.ingredients.map(ing => `
              <li style="margin: 0.25rem 0;">${ing.quantity} ${ing.unit} de ${ing.name}</li>
            `).join('')}
          </ul>
        </details>

        ${dish.instructions && dish.instructions.length > 0 ? `
          <details style="margin-top: 1rem;">
            <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem; background: white; border-radius: 4px;">
              👨‍🍳 Instructions (${dish.instructions.length} étapes)
            </summary>
            <ol style="margin-top: 0.5rem; padding-left: 1.5rem;">
              ${dish.instructions.map(step => `<li style="margin: 0.5rem 0;">${step}</li>`).join('')}
            </ol>
          </details>
        ` : ''}
      </div>
    `;
    }).join('');
  }
  
  /**
   * Rendu des plats avec badges (réutilisé/nouveau)
   */
  renderDishesWithTags(dishes, reusedDishes = [], borderColor = '#e67e22') {
    return dishes.map((dish, index) => {
      const isReused = reusedDishes.includes(dish.name);
      const isComposed = dish.isComposed && dish.components && dish.components.length > 0;
      
      return `
      <div style="background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%); padding: 1.5rem; margin: 1rem 0; border-radius: 8px; border-left: 4px solid ${borderColor}; position: relative;">
        ${isReused ? `
          <div style="position: absolute; top: 1rem; right: 1rem; background: #28a745; color: white; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            ✅ IDENTIQUE
          </div>
        ` : `
          <div style="position: absolute; top: 1rem; right: 1rem; background: #ffc107; color: #333; padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            🔄 REMPLACÉ
          </div>
        `}
        
        <h4 style="color: #2c3e50; margin-top: 0; padding-right: 100px;">
          ${index + 1}. ${dish.name}
        </h4>
        <span style="background: ${borderColor}; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.85rem; text-transform: uppercase;">
          ${dish.category}
        </span>
        
        ${isComposed ? `
          <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); padding: 1rem; border-radius: 8px; margin: 1rem 0; border-left: 3px solid #4caf50;">
            <strong style="color: #2e7d32; font-size: 0.95rem;">🍽️ Plat Complet Composé :</strong>
            <div style="display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 0.5rem;">
              ${dish.components.map(comp => `
                <div style="background: white; padding: 0.5rem 1rem; border-radius: 15px; border: 2px solid #4caf50; color: #2e7d32; font-weight: 500;">
                  ${comp.type === 'proteine' ? '🍖' : comp.type === 'legumes' ? '🥗' : '🍚'} 
                  ${comp.recipe.title}
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        ${dish.description ? `<p style="color: #7f8c8d; font-style: italic; margin: 0.5rem 0;">${dish.description}</p>` : ''}
        
        ${dish.nutrition && (dish.nutrition.calories || dish.nutrition.proteins || dish.nutrition.carbs || dish.nutrition.fats) ? `
        <div style="display: flex; gap: 1rem; flex-wrap: wrap; margin: 1rem 0; font-size: 0.9rem;">
          ${dish.nutrition.calories ? `<span style="background: white; padding: 0.5rem 1rem; border-radius: 20px;">🔥 ${dish.nutrition.calories} kcal</span>` : ''}
          ${dish.nutrition.proteins ? `<span style="background: white; padding: 0.5rem 1rem; border-radius: 20px;">💪 ${dish.nutrition.proteins}g protéines</span>` : ''}
          ${dish.nutrition.carbs ? `<span style="background: white; padding: 0.5rem 1rem; border-radius: 20px;">🌾 ${dish.nutrition.carbs}g glucides</span>` : ''}
          ${dish.nutrition.fats ? `<span style="background: white; padding: 0.5rem 1rem; border-radius: 20px;">🥑 ${dish.nutrition.fats}g lipides</span>` : ''}
        </div>
        ` : `
        <div style="background: #fff3cd; padding: 0.75rem; border-radius: 6px; margin: 1rem 0; font-size: 0.9rem; font-style: italic; color: #856404;">
          ℹ️ Informations nutritionnelles à compléter
        </div>
        `}

        <details style="margin-top: 1rem;">
          <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem; background: white; border-radius: 4px;">
            📝 Ingrédients (${dish.ingredients.length})
          </summary>
          <ul style="margin-top: 0.5rem; padding-left: 1.5rem;">
            ${dish.ingredients.map(ing => `
              <li style="margin: 0.25rem 0;">${ing.quantity} ${ing.unit} de ${ing.name}</li>
            `).join('')}
          </ul>
        </details>

        ${dish.instructions && dish.instructions.length > 0 ? `
          <details style="margin-top: 1rem;">
            <summary style="cursor: pointer; font-weight: 600; padding: 0.5rem; background: white; border-radius: 4px;">
              👨‍🍳 Instructions (${dish.instructions.length} étapes)
            </summary>
            <ol style="margin-top: 0.5rem; padding-left: 1.5rem;">
              ${dish.instructions.map(step => `<li style="margin: 0.5rem 0;">${step}</li>`).join('')}
            </ol>
          </details>
        ` : ''}
      </div>
    `;
    }).join('');
  }
}

// Fonction globale d'initialisation pour chaque dashboard
function initDashboardMenuGenerator(establishmentType) {
  document.addEventListener('DOMContentLoaded', () => {
    const integration = new DashboardMenuIntegration(establishmentType);
    integration.init();
    
    // Exposer globalement pour que les autres scripts puissent l'utiliser
    window.dashboardMenuIntegration = integration;
    
    console.log(`✅ Système de génération de menus initialisé pour ${establishmentType}`);
  });
}

// Rendre la fonction disponible globalement
if (typeof window !== 'undefined') {
  window.initDashboardMenuGenerator = initDashboardMenuGenerator;
}

