/**
 * Module d'intégration de la génération intelligente de menus pour Maison de Retraite
 * Adapté aux besoins spécifiques des personnes âgées
 */

class MaisonRetraiteMenuIntegration extends DashboardMenuIntegration {
  constructor(establishmentType) {
    super(establishmentType);
    console.log(`✨ Initialisation de MaisonRetraiteMenuIntegration pour ${establishmentType}`);
  }

  /**
   * Ajoute un groupe de résidents (remplace la méthode parent)
   */
  addAgeGroup() {
    const container = document.getElementById('age-groups-container');
    if (!container) return;

    const groupNumber = container.children.length + 1;
    const groupDiv = document.createElement('div');
    groupDiv.className = 'age-group';
    groupDiv.setAttribute('data-group', groupNumber);
    groupDiv.innerHTML = this.createAgeGroupHtml(groupNumber);

    container.appendChild(groupDiv);

    // Ajouter le listener pour le bouton de suppression
    const removeBtn = groupDiv.querySelector('.remove-group-btn');
    if (removeBtn) {
      removeBtn.addEventListener('click', () => {
        groupDiv.remove();
        this.renumberGroups();
      });
    }

    // Ajouter les listeners pour les checkboxes de conditions médicales
    groupDiv.querySelectorAll('.medical-condition-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const condition = e.target.dataset.condition;
        const countDiv = groupDiv.querySelector(`.medical-condition-count-${condition}`);
        if (countDiv) {
          countDiv.style.display = e.target.checked ? 'block' : 'none';
        }
      });
    });

    // Ajouter les listeners pour les checkboxes d'allergies
    groupDiv.querySelectorAll('.allergen-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const allergen = e.target.dataset.allergen;
        const countDiv = groupDiv.querySelector(`.allergen-count-${allergen}`);
        if (countDiv) {
          countDiv.style.display = e.target.checked ? 'block' : 'none';
        }
      });
    });

    // Ajouter les listeners pour les checkboxes de régimes alimentaires
    groupDiv.querySelectorAll('.dietary-restriction-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const restriction = e.target.dataset.restriction;
        const countDiv = groupDiv.querySelector(`.dietary-restriction-count-${restriction}`);
        if (countDiv) {
          countDiv.style.display = e.target.checked ? 'block' : 'none';
        }
      });
    });
  }

  /**
   * Renuméroter les groupes après suppression
   */
  renumberGroups() {
    const container = document.getElementById('age-groups-container');
    if (!container) return;

    const groups = container.querySelectorAll('.age-group');
    groups.forEach((group, index) => {
      const groupNumber = index + 1;
      group.setAttribute('data-group', groupNumber);
      const title = group.querySelector('h4');
      if (title) {
        title.innerHTML = `<i class="fas fa-user-friends"></i> Groupe ${groupNumber}`;
      }
    });
  }

  /**
   * Crée le HTML pour un groupe de résidents (personnes âgées)
   */
  createAgeGroupHtml(groupNumber) {
    return `
      <div style="background: #f8f9fa; padding: 1.5rem; border-radius: 8px; border-left: 4px solid #4caf50;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
          <h4 style="margin: 0; color: #4caf50;">
            <i class="fas fa-user-friends"></i> Groupe ${groupNumber}
          </h4>
          <button type="button" class="remove-group-btn" data-group="${groupNumber}" style="background: #e74c3c; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.85rem;">
            <i class="fas fa-times"></i> Supprimer
          </button>
        </div>

        <div class="form-group">
          <label><i class="fas fa-users"></i> Nombre de résidents :</label>
          <input type="number" class="group-count" min="1" value="10" required style="padding: 0.75rem; border: 2px solid #ddd; border-radius: 6px; width: 100%;">
        </div>

        <!-- Structure du menu -->
        <div class="form-group">
          <label><i class="fas fa-list"></i> Structure du menu :</label>
          <select class="menu-structure" style="padding: 0.75rem; border: 2px solid #ddd; border-radius: 6px; width: 100%;">
            <option value="plat_seul">Plat principal uniquement</option>
            <option value="entree_plat" selected>Entrée + Plat principal</option>
            <option value="soupe_plat">Soupe + Plat principal</option>
            <option value="plat_dessert">Plat principal + Dessert</option>
            <option value="entree_plat_dessert">Entrée + Plat + Dessert (complet)</option>
          </select>
          <small style="color: #666; font-size: 0.9rem; display: block; margin-top: 0.5rem;">
            💡 Le plat principal sera composé automatiquement (protéine + féculent ou légumes + féculent)
          </small>
        </div>

        <!-- Texture alimentaire -->
        <div class="form-group">
          <label><i class="fas fa-utensils"></i> Texture alimentaire :</label>
          <select class="texture" style="padding: 0.75rem; border: 2px solid #ddd; border-radius: 6px; width: 100%;">
            <option value="normale" selected>Texture normale</option>
            <option value="tendre">Texture tendre (facile à mâcher)</option>
            <option value="hachee">Texture hachée</option>
            <option value="mixee">Texture mixée</option>
            <option value="moulinee">Texture moulinée</option>
          </select>
          <small style="color: #666; font-size: 0.9rem; display: block; margin-top: 0.5rem;">
            🍴 Adaptez la texture selon les capacités de mastication et de déglutition
          </small>
        </div>

        <!-- Conditions médicales -->
        <div class="form-group">
          <label><i class="fas fa-heartbeat"></i> Conditions médicales :</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
            ${this.getMedicalConditionsCheckboxes(groupNumber)}
          </div>
        </div>

        <!-- Allergies -->
        <div class="form-group">
          <label><i class="fas fa-allergies"></i> Allergies :</label>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
            ${this.getAllergiesCheckboxes(groupNumber)}
          </div>
        </div>

        <!-- Régimes alimentaires -->
        <div class="form-group">
          <label><i class="fas fa-leaf"></i> Régimes alimentaires :</label>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 0.5rem; margin-top: 0.5rem;">
            ${this.getDietaryRestrictionsCheckboxes(groupNumber)}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Génère les checkboxes pour les conditions médicales (personnes âgées)
   */
  getMedicalConditionsCheckboxes(groupNumber) {
    const conditions = [
      { value: 'diabete', label: '🩺 Diabète', icon: 'syringe' },
      { value: 'cholesterol', label: '💊 Cholestérol', icon: 'pills' },
      { value: 'hypertension', label: '❤️ Hypertension', icon: 'heartbeat' },
      { value: 'insuffisance_renale', label: '🫘 Insuffisance rénale', icon: 'hospital' },
      { value: 'troubles_digestifs', label: '🏥 Troubles digestifs', icon: 'notes-medical' },
      { value: 'denutrition', label: '🍽️ Dénutrition', icon: 'weight' }
    ];

    return conditions.map(condition => `
      <div style="background: white; border-radius: 4px; padding: 0.5rem;">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem;">
          <input type="checkbox" class="medical-condition-checkbox" value="${condition.value}" data-condition="${condition.value}" style="width: auto; margin: 0;">
          <span>${condition.label}</span>
        </label>
        <div class="medical-condition-count-${condition.value}" style="display: none; margin-top: 0.5rem; padding-left: 1.5rem;">
          <input type="number" class="medical-condition-count" data-condition="${condition.value}" min="1" value="1" placeholder="Nombre" style="width: 80px; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem;">
          <span style="margin-left: 0.3rem; font-size: 0.8rem; color: #666;">pers.</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Génère les checkboxes pour les allergies (adaptées aux seniors)
   */
  getAllergiesCheckboxes(groupNumber) {
    const allergies = [
      { value: 'gluten', label: '🌾 Gluten' },
      { value: 'lactose', label: '🥛 Lactose' },
      { value: 'oeufs', label: '🥚 Œufs' },
      { value: 'fruits_a_coque', label: '🥜 Fruits à coque' },
      { value: 'poisson', label: '🐟 Poisson' },
      { value: 'crustaces', label: '🦐 Crustacés' }
    ];

    return allergies.map(allergy => `
      <div style="background: white; border-radius: 4px; padding: 0.5rem;">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem;">
          <input type="checkbox" class="allergen-checkbox" value="${allergy.value}" data-allergen="${allergy.value}" style="width: auto; margin: 0;">
          <span>${allergy.label}</span>
        </label>
        <div class="allergen-count-${allergy.value}" style="display: none; margin-top: 0.5rem; padding-left: 1.5rem;">
          <input type="number" class="allergen-count" data-allergen="${allergy.value}" min="1" value="1" placeholder="Nombre" style="width: 80px; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem;">
          <span style="margin-left: 0.3rem; font-size: 0.8rem; color: #666;">pers.</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Génère les checkboxes pour les régimes alimentaires (seniors)
   */
  getDietaryRestrictionsCheckboxes(groupNumber) {
    const restrictions = [
      { value: 'sans_sel', label: '🧂 Sans sel', icon: 'ban' },
      { value: 'pauvre_en_sucre', label: '🍬 Pauvre en sucre', icon: 'candy-cane' },
      { value: 'pauvre_en_graisse', label: '🥓 Pauvre en graisse', icon: 'bacon' },
      { value: 'riche_en_calcium', label: '🦴 Riche en calcium', icon: 'bone' },
      { value: 'vegetarien', label: '🥗 Végétarien', icon: 'leaf' },
      { value: 'sans_porc', label: '🐷 Sans porc', icon: 'ban' }
    ];

    return restrictions.map(restriction => `
      <div style="background: white; border-radius: 4px; padding: 0.5rem;">
        <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.85rem;">
          <input type="checkbox" class="dietary-restriction-checkbox" value="${restriction.value}" data-restriction="${restriction.value}" style="width: auto; margin: 0;">
          <span>${restriction.label}</span>
        </label>
        <div class="dietary-restriction-count-${restriction.value}" style="display: none; margin-top: 0.5rem; padding-left: 1.5rem;">
          <input type="number" class="dietary-restriction-count" data-restriction="${restriction.value}" min="1" value="1" placeholder="Nombre" style="width: 80px; padding: 0.3rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.85rem;">
          <span style="margin-left: 0.3rem; font-size: 0.8rem; color: #666;">pers.</span>
        </div>
      </div>
    `).join('');
  }

  /**
   * Gère la soumission du formulaire (remplace la méthode parent)
   */
  async handleSubmit(e) {
    e.preventDefault();

    const resultsDiv = document.getElementById('menu-results');
    if (!resultsDiv) return;

    try {
      // Récupérer les groupes de résidents
      const ageGroups = [];
      
      document.querySelectorAll('.age-group').forEach((groupElement) => {
        const groupData = this.collectGroupData(groupElement);
        if (groupData && groupData.count > 0) {
          ageGroups.push(groupData);
        }
      });

      if (ageGroups.length === 0) {
        throw new Error('Veuillez ajouter au moins un groupe de résidents');
      }

      console.log('📤 Données des groupes:', ageGroups);

      // Afficher le loading avec informations détaillées
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="border: 4px solid #f3f3f3; border-top: 4px solid #4caf50; border-radius: 50%; width: 50px; height: 50px; animation: spin 1s linear infinite; margin: 0 auto 1rem;"></div>
          <h3 style="color: #4caf50; margin-bottom: 1rem;">🎨 Génération du menu pour maison de retraite...</h3>
          <div style="background: #e8f5e9; border-radius: 8px; padding: 1.5rem; margin: 1rem 0; text-align: left;">
            <h4 style="color: #2e7d32; margin-top: 0;">✅ Filtres appliqués :</h4>
            <ul style="margin: 0.5rem 0; padding-left: 1.5rem; color: #333;">
              <li>🔍 <strong>${ageGroups.length} groupe(s) de résidents</strong> configuré(s)</li>
              <li>👥 <strong>${ageGroups.reduce((sum, group) => sum + group.count, 0)} résidents</strong> au total</li>
              <li>🍽️ <strong>Textures adaptées</strong> selon les capacités</li>
              <li>🚫 <strong>Allergènes exclus</strong> automatiquement</li>
              <li>🏥 <strong>Conditions médicales</strong> prises en compte</li>
              <li>🥗 <strong>Régimes alimentaires</strong> respectés</li>
            </ul>
          </div>
          <p style="color: #666; margin: 1rem 0;">L'IA analyse 325 recettes enrichies et compose un menu parfaitement adapté...</p>
          <small style="color: #999;">⏱️ Génération en cours, veuillez patienter...</small>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;

      // Collecter tous les filtres globaux
      const globalFilters = this.collectGlobalFilters(ageGroups);

      // Préparer la configuration pour l'API
      const config = {
        establishmentType: this.establishmentType,
        ageGroups: ageGroups,
        numDishes: 2, // Par défaut pour maison de retraite
        allergens: globalFilters.allergens,
        dietaryRestrictions: globalFilters.dietaryRestrictions,
        medicalConditions: globalFilters.medicalConditions,
        texture: globalFilters.texture,
        useStockOnly: false
      };

      console.log('📤 Configuration envoyée:', config);

      // Générer le menu
      const menu = await this.menuGenerator.generateMenu(config);
      console.log('✅ Menu généré:', menu);

      // Vérifier que le menu est valide
      if (!menu || !menu.mainMenu) {
        throw new Error('Le menu généré est invalide');
      }

      // Afficher le menu
      try {
        this.displayMenu(menu);
      } catch (displayError) {
        console.error('Erreur lors de l\'affichage du menu:', displayError);
        throw new Error(`Erreur d'affichage: ${displayError.message}`);
      }

    } catch (error) {
      console.error('Erreur lors de la génération du menu:', error);
      console.error('Stack trace:', error.stack);
      
      const resultsDiv = document.getElementById('menu-results');
      if (resultsDiv) {
        resultsDiv.innerHTML = `
          <div style="background: #fee; border: 2px solid #f88; border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
            <h3 style="color: #c33; margin-top: 0;">
              <i class="fas fa-exclamation-triangle"></i> Erreur lors de la génération
            </h3>
            <p style="color: #c33; margin-bottom: 0.5rem;">
              ${error.message || 'Une erreur est survenue. Veuillez réessayer.'}
            </p>
            <details style="margin-top: 1rem;">
              <summary style="cursor: pointer; color: #666;">Détails techniques</summary>
              <pre style="background: #f5f5f5; padding: 1rem; border-radius: 4px; overflow: auto; font-size: 0.85rem; margin-top: 0.5rem;">${error.stack || 'Pas de détails disponibles'}</pre>
            </details>
          </div>
        `;
      }
    }
  }

  /**
   * Affiche le menu généré (remplace la méthode parent)
   */
  displayMenu(menu) {
    const resultsDiv = document.getElementById('menu-results');
    if (!resultsDiv) {
      console.error('Element menu-results non trouvé');
      return;
    }

    resultsDiv.style.display = 'block';
    
    // Récupérer le nombre total de résidents pour les quantités
    // Calculer le total à partir des groupes d'âge
    let totalResidents = 0;
    if (menu.metadata && menu.metadata.ageGroups) {
      totalResidents = menu.metadata.ageGroups.reduce((sum, group) => sum + group.count, 0);
    } else if (menu.mainMenu && menu.mainMenu.count) {
      totalResidents = menu.mainMenu.count;
    } else if (menu.totalPeople) {
      totalResidents = menu.totalPeople;
    } else {
      totalResidents = 100; // Valeur par défaut
    }
    
    this.totalResidents = totalResidents;
    console.log(`👥 Nombre total de résidents calculé: ${this.totalResidents}`);
    
    let html = `
      <div class="menu-header" style="background: linear-gradient(135deg, #4caf50 0%, #81c784 100%); color: white; padding: 2rem; border-radius: 12px; margin-bottom: 2rem;">
        <h2 style="margin: 0 0 0.5rem 0;">🍽️ ${menu.title || 'Menu pour Maison de Retraite'}</h2>
        <p style="margin: 0; opacity: 0.95;">${menu.description || `Menu adapté pour ${this.totalResidents} résidents`}</p>
      </div>
    `;

    // Afficher le menu principal
    if (menu.mainMenu) {
      html += `
        <div class="main-menu" style="background: white; border-radius: 12px; padding: 2rem; margin-bottom: 2rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
          <h3 style="color: #4caf50; margin-top: 0;">🍽️ Menu Principal (${menu.mainMenu.count} résidents)</h3>
          ${this.renderDishes(menu.mainMenu.dishes)}
        </div>
      `;
    }

    // Afficher les variantes si nécessaires
    if (menu.variants && menu.variants.length > 0) {
      html += `
        <div class="variants" style="background: #fff3cd; border-radius: 12px; padding: 2rem; margin-bottom: 2rem;">
          <h3 style="color: #856404;">🔄 Variantes Nécessaires (${menu.variants.length})</h3>
      `;
      
      menu.variants.forEach((variant, index) => {
        html += `
          <div style="background: white; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem;">
            <h4 style="color: #856404; margin-top: 0;">Variante ${index + 1} - ${variant.name} (${variant.count} résidents)</h4>
            ${this.renderDishes(variant.dishes)}
          </div>
        `;
      });
      
      html += `</div>`;
    }

    // Afficher la liste de courses
    if (menu.shoppingList && menu.shoppingList.length > 0) {
      html += `
        <div class="shopping-list" style="background: #e8f5e9; border-radius: 12px; padding: 2rem; margin-top: 2rem;">
          <h3 style="color: #2e7d32; margin-top: 0;">🛒 Liste de Courses Consolidée</h3>
          <ul style="columns: 2; column-gap: 2rem; list-style: none; padding: 0;">
            ${menu.shoppingList.slice(0, 50).map(item => `
              <li style="padding: 0.5rem 0; border-bottom: 1px solid #c8e6c9;">
                <strong>${item.name || item.ingredient}</strong>: ${item.quantity} ${item.unit || ''}
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    }

    resultsDiv.innerHTML = html;
  }

  /**
   * Rend les plats
   */
  renderDishes(dishes) {
    if (!dishes || dishes.length === 0) {
      return '<p style="color: #666;">Aucun plat à afficher</p>';
    }

    return dishes.map(dish => {
      // Le backend peut retourner 'name', 'title', ou 'recipeTitle'
      const dishTitle = dish.name || dish.title || dish.recipeTitle || 'Plat sans nom';
      const dishDescription = dish.description || '';
      
      // Gérer les plats composés
      let composedInfo = '';
      if (dish.isComposed && dish.components && dish.components.length > 0) {
        composedInfo = `
          <div style="background: #e8f5e9; border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem;">
            <strong style="font-size: 0.85rem; color: #2e7d32;">🍽️ Plat Complet Composé:</strong>
            <div style="margin-top: 0.5rem; display: flex; flex-wrap: wrap; gap: 0.5rem;">
              ${dish.components.map(comp => {
                const icons = { proteine: '🍖', legumes: '🥗', feculent: '🍚', soupe: '🍲', entree: '🥗', dessert: '🍰' };
                return `<span style="background: white; padding: 0.3rem 0.6rem; border-radius: 4px; font-size: 0.8rem;">${icons[comp.component] || '🍽️'} ${comp.name}</span>`;
              }).join('')}
            </div>
          </div>
        `;
      }
      
      // Afficher les ingrédients avec quantités adaptées
      let ingredientsInfo = '';
      if (dish.ingredients && dish.ingredients.length > 0) {
        const totalResidents = this.totalResidents || 100;
        const servingsBase = dish.servings || 4; // Portions de base de la recette
        const multiplier = totalResidents / servingsBase;
        
        ingredientsInfo = `
          <div style="background: #fff9e6; border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem;">
            <strong style="font-size: 0.85rem; color: #d97706;">📋 Ingrédients pour ${totalResidents} résidents:</strong>
            <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem; font-size: 0.85rem;">
              ${dish.ingredients.slice(0, 10).map(ing => {
                const qty = parseFloat(ing.quantity || ing.quantite || 0);
                const adjustedQty = qty > 0 ? Math.ceil(qty * multiplier) : qty;
                const unit = ing.unit || ing.mesure || '';
                const name = ing.name || ing.item || ing.nom || '';
                return `<li>${name}: <strong>${adjustedQty} ${unit}</strong></li>`;
              }).join('')}
              ${dish.ingredients.length > 10 ? `<li style="color: #666;"><em>... et ${dish.ingredients.length - 10} autres ingrédients</em></li>` : ''}
            </ul>
          </div>
        `;
      }
      
      return `
        <div class="dish" style="background: #f8f9fa; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; border-left: 4px solid #4caf50;">
          <h4 style="margin: 0 0 0.5rem 0; color: #2c3e50;">${dishTitle}</h4>
          ${dishDescription ? `<p style="color: #666; margin: 0 0 0.5rem 0; font-size: 0.9rem;">${dishDescription}</p>` : ''}
          ${composedInfo}
          ${this.renderNutrition(dish.nutrition, this.totalResidents)}
          ${ingredientsInfo}
          ${dish.allergens && dish.allergens.length > 0 ? `
            <div style="margin-top: 0.5rem;">
              <strong style="font-size: 0.85rem; color: #e74c3c;">🚫 Allergènes:</strong>
              ${dish.allergens.map(a => `<span style="background: #fee; color: #c33; padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-left: 0.3rem;">${a}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `;
    }).join('');
  }

  /**
   * Rend les informations nutritionnelles
   */
  renderNutrition(nutrition, totalPeople = 1) {
    if (!nutrition || (nutrition.calories === 0 && nutrition.proteins === 0)) {
      return '<p style="color: #999; font-size: 0.85rem; margin: 0.5rem 0 0 0;">ℹ️ Informations nutritionnelles à compléter</p>';
    }

    // Afficher à la fois par personne et total
    return `
      <div style="background: #f0f9ff; border-radius: 6px; padding: 0.75rem; margin-top: 0.5rem;">
        <div style="display: flex; gap: 1rem; font-size: 0.85rem; color: #666; flex-wrap: wrap;">
          ${nutrition.calories > 0 ? `<span>🔥 ${nutrition.calories} kcal/pers.</span>` : ''}
          ${nutrition.proteins > 0 ? `<span>💪 ${nutrition.proteins}g protéines/pers.</span>` : ''}
          ${nutrition.carbs > 0 ? `<span>🌾 ${nutrition.carbs}g glucides/pers.</span>` : ''}
          ${nutrition.fats > 0 ? `<span>🥑 ${nutrition.fats}g lipides/pers.</span>` : ''}
        </div>
        ${totalPeople > 1 ? `
          <div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #bfdbfe; font-size: 0.85rem; color: #1e40af; font-weight: 600;">
            <span>📊 TOTAL pour ${totalPeople} pers.: </span>
            ${nutrition.calories > 0 ? `<span>${Math.ceil(nutrition.calories * totalPeople)} kcal</span>` : ''}
          </div>
        ` : ''}
      </div>
    `;
  }

  /**
   * Collecte tous les filtres globaux à partir des groupes
   */
  collectGlobalFilters(ageGroups) {
    const globalFilters = {
      allergens: [],
      dietaryRestrictions: [],
      medicalConditions: [],
      texture: 'normale'
    };

    // D'abord, collecter les filtres globaux du formulaire
    console.log('🔍 Collecte des filtres globaux...');
    
    // Allergènes globaux
    const globalAllergens = document.querySelectorAll('.allergen-checkbox:checked');
    globalAllergens.forEach(checkbox => {
      const allergen = checkbox.value;
      if (!globalFilters.allergens.includes(allergen)) {
        globalFilters.allergens.push(allergen);
      }
    });
    console.log('🥜 Allergènes globaux:', globalFilters.allergens);

    // Restrictions alimentaires globales
    const globalDietaryRestrictions = document.querySelectorAll('.dietary-restriction-checkbox:checked');
    globalDietaryRestrictions.forEach(checkbox => {
      const restriction = checkbox.value;
      if (!globalFilters.dietaryRestrictions.includes(restriction)) {
        globalFilters.dietaryRestrictions.push(restriction);
      }
    });
    console.log('🍽️ Restrictions alimentaires globales:', globalFilters.dietaryRestrictions);

    // Conditions médicales globales
    const globalMedicalConditions = document.querySelectorAll('.medical-condition-checkbox:checked');
    globalMedicalConditions.forEach(checkbox => {
      const condition = checkbox.value;
      if (!globalFilters.medicalConditions.includes(condition)) {
        globalFilters.medicalConditions.push(condition);
      }
    });
    console.log('🏥 Conditions médicales globales:', globalFilters.medicalConditions);

    // Ensuite, collecter tous les filtres uniques de tous les groupes
    ageGroups.forEach(group => {
      // Allergènes
      if (group.allergens) {
        group.allergens.forEach(allergen => {
          if (!globalFilters.allergens.includes(allergen.type)) {
            globalFilters.allergens.push(allergen.type);
          }
        });
      }

      // Restrictions alimentaires
      if (group.dietaryRestrictions) {
        group.dietaryRestrictions.forEach(restriction => {
          if (!globalFilters.dietaryRestrictions.includes(restriction.type)) {
            globalFilters.dietaryRestrictions.push(restriction.type);
          }
        });
      }

      // Conditions médicales
      if (group.medicalConditions) {
        group.medicalConditions.forEach(condition => {
          if (!globalFilters.medicalConditions.includes(condition.type)) {
            globalFilters.medicalConditions.push(condition.type);
          }
        });
      }

      // Texture (prendre la plus restrictive)
      if (group.texture && group.texture !== 'normale') {
        const textureHierarchy = ['normale', 'tendre', 'hachee', 'mixee', 'moulinee'];
        const currentIndex = textureHierarchy.indexOf(globalFilters.texture);
        const groupIndex = textureHierarchy.indexOf(group.texture);
        if (groupIndex > currentIndex) {
          globalFilters.texture = group.texture;
        }
      }
    });

    console.log('🔍 Filtres globaux collectés:', globalFilters);
    return globalFilters;
  }

  /**
   * Collecte les données d'un groupe de résidents
   */
  collectGroupData(groupElement) {
    const countInput = groupElement.querySelector('.group-count');
    const menuStructureSelect = groupElement.querySelector('.menu-structure');
    const textureSelect = groupElement.querySelector('.texture');
    
    const groupData = {
      ageRange: 'adulte', // Pour maison de retraite, toujours adulte
      count: countInput ? parseInt(countInput.value) || 0 : 0,
      menuStructure: menuStructureSelect ? menuStructureSelect.value : 'entree_plat',
      texture: textureSelect ? textureSelect.value : 'normale',
      medicalConditions: [],
      allergens: [],
      dietaryRestrictions: []
    };

    // Collecter les conditions médicales cochées avec leurs comptes
    groupElement.querySelectorAll('.medical-condition-checkbox:checked').forEach(checkbox => {
      const condition = checkbox.dataset.condition;
      const countInput = groupElement.querySelector(`.medical-condition-count[data-condition="${condition}"]`);
      const count = countInput ? parseInt(countInput.value) : 1;
      groupData.medicalConditions.push({ type: condition, count: count });
    });

    // Collecter les allergies cochées avec leurs comptes
    groupElement.querySelectorAll('.allergen-checkbox:checked').forEach(checkbox => {
      const allergen = checkbox.dataset.allergen;
      const countInput = groupElement.querySelector(`.allergen-count[data-allergen="${allergen}"]`);
      const count = countInput ? parseInt(countInput.value) : 1;
      groupData.allergens.push({ type: allergen, count: count });
    });

    // Collecter les régimes alimentaires cochés avec leurs comptes
    groupElement.querySelectorAll('.dietary-restriction-checkbox:checked').forEach(checkbox => {
      const restriction = checkbox.dataset.restriction;
      const countInput = groupElement.querySelector(`.dietary-restriction-count[data-restriction="${restriction}"]`);
      const count = countInput ? parseInt(countInput.value) : 1;
      groupData.dietaryRestrictions.push({ type: restriction, count: count });
    });

    return groupData;
  }
}

// Initialiser le gestionnaire de menus pour maison de retraite
document.addEventListener('DOMContentLoaded', () => {
  const establishmentType = document.getElementById('establishment-type')?.value || 'maison_retraite';
  const maisonRetraiteMenuHandler = new MaisonRetraiteMenuIntegration(establishmentType);
  maisonRetraiteMenuHandler.init();
});

