/**
 * Gestionnaire de génération de menus pour la Cantine d'Entreprise
 * Adapté spécifiquement pour les adultes sans groupes d'âge
 */

class EntrepriseMenuHandler {
  constructor() {
    this.menuGenerator = new IntelligentMenuGenerator();
    this.init();
  }

  init() {
    const form = document.getElementById('menu-form');
    if (!form) {
      console.warn('Formulaire de génération de menus non trouvé');
      return;
    }

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    console.log('✅ Gestionnaire de menu entreprise initialisé');
  }

  async handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
      // 1. Récupérer les données de base
      const numMeals = parseInt(document.getElementById('num-meals').value) || 150;
      const menuStructure = document.getElementById('menu-structure').value || 'plat_seul';
      const establishmentType = document.getElementById('establishment-type').value || 'cantine_entreprise';

      // 2. Récupérer les régimes alimentaires avec leurs quantités
      const dietaryRestrictions = [];
      const allergens = [];
      let totalWithRestrictions = 0;

      // Végétarien
      const vegCheckbox = document.getElementById('diet-vegetarien');
      if (vegCheckbox && vegCheckbox.checked) {
        const count = parseInt(document.getElementById('count-vegetarien').value) || 0;
        if (count > 0) {
          dietaryRestrictions.push({ type: 'vegetarien', count });
          totalWithRestrictions += count;
        }
      }

      // Vegan
      const veganCheckbox = document.getElementById('diet-vegan');
      if (veganCheckbox && veganCheckbox.checked) {
        const count = parseInt(document.getElementById('count-vegan').value) || 0;
        if (count > 0) {
          dietaryRestrictions.push({ type: 'vegan', count });
          totalWithRestrictions += count;
        }
      }

      // Sans gluten
      const glutenCheckbox = document.getElementById('diet-sans-gluten');
      if (glutenCheckbox && glutenCheckbox.checked) {
        const count = parseInt(document.getElementById('count-sans-gluten').value) || 0;
        if (count > 0) {
          dietaryRestrictions.push({ type: 'sans_gluten', count });
          allergens.push({ type: 'gluten', count });
          totalWithRestrictions += count;
        }
      }

      // Sans lactose
      const lactoseCheckbox = document.getElementById('diet-sans-lactose');
      if (lactoseCheckbox && lactoseCheckbox.checked) {
        const count = parseInt(document.getElementById('count-sans-lactose').value) || 0;
        if (count > 0) {
          dietaryRestrictions.push({ type: 'sans_lactose', count });
          allergens.push({ type: 'lactose', count });
          totalWithRestrictions += count;
        }
      }

      // 3. Construire les groupes d'adultes avec leurs restrictions
      const withoutRestrictions = Math.max(0, numMeals - totalWithRestrictions);
      
      const ageGroups = [];

      // Groupe principal sans restrictions
      if (withoutRestrictions > 0) {
        ageGroups.push({
          ageRange: 'adulte',
          count: withoutRestrictions,
          menuStructure: menuStructure,
          dietaryRestrictions: [],
          allergens: []
        });
      }

      // Ajouter les groupes avec restrictions alimentaires
      dietaryRestrictions.forEach(restriction => {
        if (restriction.count > 0) {
          ageGroups.push({
            ageRange: 'adulte',
            count: restriction.count,
            menuStructure: menuStructure,
            dietaryRestrictions: [restriction.type],
            allergens: []
          });
        }
      });

      // Ajouter les groupes avec allergènes (seulement si pas déjà dans dietaryRestrictions)
      allergens.forEach(allergen => {
        // Vérifier que ce n'est pas déjà couvert par une restriction alimentaire
        const alreadyCovered = dietaryRestrictions.some(r => 
          (r.type === 'sans_gluten' && allergen.type === 'gluten') ||
          (r.type === 'sans_lactose' && allergen.type === 'lactose')
        );
        
        if (!alreadyCovered && allergen.count > 0) {
          ageGroups.push({
            ageRange: 'adulte',
            count: allergen.count,
            menuStructure: menuStructure,
            dietaryRestrictions: [],
            allergens: [allergen.type]
          });
        }
      });

      // 4. Vérifier qu'on a au moins un groupe
      if (ageGroups.length === 0) {
        // Si aucun groupe (tous les champs étaient à 0), créer un groupe par défaut
        ageGroups.push({
          ageRange: 'adulte',
          count: numMeals,
          menuStructure: menuStructure,
          dietaryRestrictions: [],
          allergens: []
        });
      }

      // 5. Calculer numDishes selon la structure du menu
      let numDishes = 1; // Par défaut: plat seul
      switch(menuStructure) {
        case 'plat_seul':
          numDishes = 1;
          break;
        case 'entree_plat':
        case 'soupe_plat':
        case 'plat_dessert':
          numDishes = 2;
          break;
        case 'entree_plat_dessert':
          numDishes = 3;
          break;
      }

      // 6. Préparer la configuration
      const config = {
        establishmentType: establishmentType,
        ageGroups: ageGroups,
        numDishes: numDishes,
        menuStructure: menuStructure,
        allergens: [...new Set(allergens.map(a => a.type))],
        dietaryRestrictions: [...new Set(dietaryRestrictions.map(d => d.type))],
        medicalConditions: [],
        texture: 'normale',
        useStockOnly: false
      };

      console.log('📤 Configuration envoyée:', config);
      console.log('📊 Groupes d\'âge:', ageGroups);

      // 7. Afficher le loader
      const resultsDiv = document.getElementById('menu-results');
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div style="display: inline-block; width: 60px; height: 60px; border: 6px solid #f3f3f3; border-top: 6px solid #607d8b; border-radius: 50%; animation: spin 1s linear infinite;"></div>
          <p style="margin-top: 1.5rem; color: #607d8b; font-weight: 600; font-size: 1.1rem;">
            🍽️ Génération du menu en cours...<br>
            <small style="color: #888; font-weight: 400;">L'IA compose un menu équilibré pour ${numMeals} personnes</small>
          </p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;

      // 8. Générer le menu
      const menu = await this.menuGenerator.generateMenu(config);
      
      console.log('✅ Menu généré:', menu);

      // 9. Afficher le résultat
      this.displayMenu(menu);

    } catch (error) {
      console.error('❌ Erreur lors de la génération du menu:', error);
      const resultsDiv = document.getElementById('menu-results');
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `
        <div style="background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 12px; padding: 2rem; margin-top: 1.5rem;">
          <h3 style="color: #721c24; margin-top: 0;">
            <i class="fas fa-exclamation-triangle"></i> Erreur lors de la génération
          </h3>
          <p style="color: #721c24; margin-bottom: 0;">
            ${error.message || 'Une erreur est survenue. Veuillez réessayer.'}
          </p>
        </div>
      `;
    }
  }

  displayMenu(menu) {
    const resultsDiv = document.getElementById('menu-results');
    resultsDiv.style.display = 'block';

    const mainMenuCount = menu.mainMenu?.count || 0;
    const hasVariants = menu.variants && menu.variants.length > 0;
    const hasCompatibleProfiles = menu.mainMenu?.compatibleWith && menu.mainMenu.compatibleWith.length > 0;

    resultsDiv.innerHTML = `
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-top: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 1.8rem; display: flex; align-items: center; gap: 0.75rem;">
          <i class="fas fa-utensils"></i>
          ${menu.title || 'Menu Entreprise'}
        </h2>
        <p style="margin: 0; opacity: 0.95; font-size: 1rem; line-height: 1.6;">
          ${menu.description || 'Menu équilibré pour cantine d\'entreprise'}
        </p>
      </div>

      ${hasCompatibleProfiles ? this.displayCompatibleProfiles(menu.mainMenu) : ''}

      <div style="background: white; padding: 2rem; border-radius: 12px; margin-top: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <h3 style="color: #667eea; margin-top: 0; font-size: 1.4rem; display: flex; align-items: center; gap: 0.5rem;">
          <i class="fas fa-users"></i>
          🍽️ Menu Principal (${mainMenuCount} convives)
        </h3>
        
        ${menu.mainMenu?.ageAdaptation ? `
          <div style="background: #e8eaf6; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem; border-left: 4px solid #667eea;">
            <strong style="color: #3f51b5;"><i class="fas fa-balance-scale"></i> Portions adaptées :</strong>
            <p style="margin: 0.5rem 0 0 0; color: #5c6bc0; line-height: 1.6;">
              ${menu.mainMenu.ageAdaptation}
            </p>
          </div>
        ` : ''}
        
        ${this.renderDishes(menu.mainMenu.dishes, '#667eea')}
      </div>

      ${hasVariants ? this.displayVariants(menu.variants) : ''}

      ${menu.shoppingList ? this.displayShoppingList(menu.shoppingList) : ''}

      <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <button onclick="window.print()" style="flex: 1; background: #667eea; color: white; padding: 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          <i class="fas fa-print"></i> Imprimer le menu
        </button>
        <button onclick="document.getElementById('menu-results').style.display='none'" style="flex: 1; background: #95a5a6; color: white; padding: 1rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
          <i class="fas fa-times"></i> Fermer
        </button>
      </div>
    `;
  }

  displayCompatibleProfiles(mainMenu) {
    if (!mainMenu.compatibleWith || mainMenu.compatibleWith.length === 0) return '';

    const allExcludedAllergens = new Set();
    const allExcludedRestrictions = new Set();

    mainMenu.compatibleWith.forEach(profile => {
      if (profile.allergens) profile.allergens.forEach(a => allExcludedAllergens.add(a));
      if (profile.dietaryRestrictions) profile.dietaryRestrictions.forEach(r => allExcludedRestrictions.add(r));
    });

    const allergensText = Array.from(allExcludedAllergens).map(a => this.formatAllergenName(a)).join(', ');
    const restrictionsText = Array.from(allExcludedRestrictions).map(r => this.formatRestrictionName(r)).join(', ');

    const exclusions = [];
    if (allergensText) exclusions.push(`<strong>sans</strong> : ${allergensText}`);
    if (restrictionsText) exclusions.push(`<strong>adapté aux</strong> : ${restrictionsText}`);

    return `
      <div style="background: linear-gradient(135deg, #d1f2eb 0%, #a9dfbf 100%); padding: 1.5rem; border-radius: 8px; margin-top: 1.5rem; border-left: 4px solid #27ae60;">
        <strong style="color: #0e6655; font-size: 1.1rem;">✅ Menu Compatible pour Tous</strong>
        <p style="color: #0e6655; margin: 0.75rem 0; line-height: 1.7; font-size: 1rem;">
          Ce menu ${exclusions.length > 0 ? `est ${exclusions.join(' et ')}` : 'convient à tous les profils'}.<br>
          Il peut donc être servi <strong>sans modification</strong> aux <strong>${mainMenu.count} convives</strong> (incluant les ${mainMenu.compatibleWith.map(p => `${p.count} ${p.name.toLowerCase()}`).join(', ')}).
        </p>
        <p style="color: #0e6655; margin: 0.75rem 0 0 0; font-size: 0.95rem; font-style: italic;">
          💡 <strong>Optimisation maximale :</strong> Un seul menu pour tous au lieu de ${mainMenu.compatibleWith.length + 1} menus différents !
        </p>
      </div>
    `;
  }

  displayVariants(variants) {
    if (!variants || variants.length === 0) return '';

    return `
      <div style="background: white; padding: 2rem; border-radius: 12px; margin-top: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <h3 style="color: #e74c3c; margin-top: 0; font-size: 1.3rem;">
          <i class="fas fa-exchange-alt"></i>
          🔄 Variantes Nécessaires (${variants.length})
        </h3>
        <p style="color: #7f8c8d; margin-bottom: 1.5rem; font-size: 0.95rem;">
          Certains plats du menu principal ne conviennent pas à tous. Voici les adaptations nécessaires :
        </p>
        ${variants.map((variant, index) => `
          <div style="background: #fff5f5; padding: 1.5rem; border-radius: 8px; margin-bottom: 1rem; border-left: 4px solid #e74c3c;">
            <h4 style="color: #c0392b; margin-top: 0; display: flex; align-items: center; gap: 0.5rem;">
              <i class="fas fa-user-friends"></i>
              Variante ${index + 1}: ${variant.name} (${variant.count} personnes)
            </h4>
            ${variant.replacedDishes && variant.replacedDishes.length > 0 ? `
              <div style="margin-bottom: 1rem;">
                <strong style="color: #e74c3c;"><i class="fas fa-sync-alt"></i> Remplacements nécessaires :</strong>
                ${variant.replacedDishes.map(dish => `
                  <div style="background: white; padding: 0.75rem; margin: 0.5rem 0; border-radius: 6px; border: 1px solid #e74c3c;">
                    <div style="color: #c0392b; font-weight: 600; margin-bottom: 0.25rem;">
                      ❌ Remplace : ${dish.originalDish}
                    </div>
                    <div style="color: #27ae60; font-weight: 600;">
                      ✅ Par : ${dish.newDish.name}
                    </div>
                  </div>
                `).join('')}
              </div>
            ` : ''}
            ${variant.reusedDishes && variant.reusedDishes.length > 0 ? `
              <div>
                <strong style="color: #27ae60;"><i class="fas fa-check-circle"></i> Plats conservés du menu principal :</strong>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.5rem;">
                  ${variant.reusedDishes.map(dish => `
                    <span style="background: #d4edda; color: #155724; padding: 0.5rem 1rem; border-radius: 20px; font-size: 0.9rem;">
                      ✓ ${dish}
                    </span>
                  `).join('')}
                </div>
              </div>
            ` : ''}
          </div>
        `).join('')}
      </div>
    `;
  }

  renderDishes(dishes, borderColor = '#667eea') {
    if (!dishes || dishes.length === 0) {
      return '<p style="color: #888;">Aucun plat disponible.</p>';
    }

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

  displayShoppingList(shoppingList) {
    if (!shoppingList || shoppingList.length === 0) return '';

    return `
      <div style="background: white; padding: 2rem; border-radius: 12px; margin-top: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.08);">
        <h3 style="color: #667eea; margin-top: 0; font-size: 1.3rem;">
          <i class="fas fa-shopping-cart"></i>
          📝 Liste de Courses
        </h3>
        <ul style="list-style: none; padding: 0;">
          ${shoppingList.map(item => `
            <li style="padding: 0.75rem; background: #f8f9fa; margin: 0.5rem 0; border-radius: 6px; border-left: 3px solid #667eea;">
              <strong>${item.quantity} ${item.unit}</strong> de ${item.name}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }

  formatAllergenName(allergen) {
    const names = {
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
    return names[allergen] || allergen;
  }

  formatRestrictionName(restriction) {
    const names = {
      'vegetarien': 'Régime végétarien',
      'vegan': 'Régime vegan',
      'sans_gluten': 'Sans gluten',
      'sans_lactose': 'Sans lactose',
      'halal': 'Halal',
      'casher': 'Casher',
      'sans_porc': 'Sans porc',
      'sans_viande_rouge': 'Sans viande rouge'
    };
    return names[restriction] || restriction;
  }
}

// Initialiser au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  new EntrepriseMenuHandler();
});

