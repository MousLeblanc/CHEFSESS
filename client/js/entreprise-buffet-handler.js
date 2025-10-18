/**
 * Gestionnaire spécifique pour les menus buffet de cantine d'entreprise
 * Génère 3 menus complets au choix + buffet salades + desserts variés
 */

class EnterpriseBuffetHandler {
  constructor() {
    this.init();
  }

  init() {
    const form = document.getElementById('menu-form');
    if (!form) {
      console.warn('Formulaire de génération de menus non trouvé');
      return;
    }

    form.addEventListener('submit', (e) => this.handleSubmit(e));
    console.log('✅ Gestionnaire de menu buffet entreprise initialisé');
  }

  async handleSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    try {
      // 1. Récupérer les données de base
      const numMeals = parseInt(document.getElementById('num-meals').value) || 150;
      const menuStructure = document.getElementById('menu-structure').value || 'plat_seul';

      // 2. Récupérer les restrictions alimentaires
      const dietaryRestrictions = [];
      const allergens = [];

      ['vegetarien', 'vegan', 'sans-gluten', 'sans-lactose'].forEach(diet => {
        const checkbox = document.getElementById(`diet-${diet}`);
        if (checkbox && checkbox.checked) {
          const count = parseInt(document.getElementById(`count-${diet}`).value) || 0;
          if (count > 0) {
            const restriction = diet.replace(/-/g, '_');
            dietaryRestrictions.push(restriction);
            
            // Ajouter les allergènes correspondants
            if (diet === 'sans-gluten') allergens.push('gluten');
            if (diet === 'sans-lactose') allergens.push('lactose');
          }
        }
      });

      // 3. Afficher le loader
      const resultsDiv = document.getElementById('menu-results');
      resultsDiv.style.display = 'block';
      resultsDiv.innerHTML = `
        <div style="text-align: center; padding: 3rem;">
          <div class="loader" style="border: 5px solid #f3f3f3; border-top: 5px solid #667eea; border-radius: 50%; width: 60px; height: 60px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
          <p style="margin-top: 1rem; color: #666; font-size: 1.1rem;">
            🍽️ Génération du menu buffet en cours...
          </p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      `;

      // 4. Préparer la configuration
      const config = {
        numMeals: numMeals,
        menuStructure: menuStructure,
        dietaryRestrictions: dietaryRestrictions,
        allergens: allergens
      };

      console.log('📤 Configuration buffet envoyée:', config);

      // Utilise toujours l'endpoint sécurisé avec cookie
      const endpoint = '/api/intelligent-menu/generate-enterprise-buffet';

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include', // 🔐 Envoie automatiquement le cookie
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Erreur lors de la génération du menu buffet');
      }

      const menu = await response.json();
      console.log('✅ Menu buffet généré:', menu);

      // 5. Afficher le menu buffet
      this.displayBuffetMenu(menu);

    } catch (error) {
      console.error('❌ Erreur lors de la génération du menu buffet:', error);
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

  displayBuffetMenu(menu) {
    const resultsDiv = document.getElementById('menu-results');
    resultsDiv.style.display = 'block';

    let html = `
      <!-- En-tête -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 2rem; border-radius: 12px; margin-top: 2rem; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
        <h2 style="margin: 0 0 0.5rem 0; font-size: 2rem;">
          🍽️ ${menu.title || 'Menu Buffet Entreprise'}
        </h2>
        <p style="margin: 0; opacity: 0.95; font-size: 1.1rem;">
          ${menu.description || `Menu buffet pour ${menu.totalPeople} personnes`}
        </p>
        <div style="display: flex; justify-content: center; gap: 2rem; margin-top: 1.5rem; font-size: 0.95rem;">
          <span>📊 <strong>${menu.summary?.optionsCount || 0}</strong> options de plats</span>
          <span>🥗 <strong>${menu.summary?.saladChoices || 0}</strong> salades</span>
          <span>🍰 <strong>${menu.summary?.dessertChoices || 0}</strong> desserts</span>
        </div>
      </div>
    `;

    // Afficher les 3 options de menus
    if (menu.menuOptions && menu.menuOptions.length > 0) {
      html += `<h3 style="color: #e74c3c; font-size: 1.5rem; margin: 2rem 0 1rem 0;">🍴 Menus au Choix</h3>`;
      
      menu.menuOptions.forEach((option, index) => {
        html += `
          <div style="background: #fff; border: 3px solid #e74c3c; border-radius: 12px; padding: 1.5rem; margin-bottom: 1.5rem;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eee;">
              <h4 style="margin: 0; color: #e74c3c; font-size: 1.3rem;">${option.name}</h4>
              <span style="background: #e74c3c; color: white; padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold;">
                👥 ${option.servings} personnes
              </span>
            </div>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
              ${option.dishes.map(dish => this.renderDishCompact(dish)).join('')}
            </div>
          </div>
        `;
      });
    }

    // Afficher le buffet de salades
    if (menu.saladBar && menu.saladBar.options && menu.saladBar.options.length > 0) {
      html += `
        <div style="background: #e8f5e9; border: 3px solid #27ae60; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
          <h3 style="color: #27ae60; margin: 0 0 0.5rem 0;">${menu.saladBar.title}</h3>
          <p style="color: #666; margin: 0 0 1rem 0;">${menu.saladBar.description} (${menu.saladBar.servings} personnes)</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem;">
            ${menu.saladBar.options.map(salad => this.renderDishSimple(salad)).join('')}
          </div>
        </div>
      `;
    }

    // Afficher les desserts
    if (menu.desserts && menu.desserts.options && menu.desserts.options.length > 0) {
      html += `
        <div style="background: #fce4ec; border: 3px solid #9b59b6; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
          <h3 style="color: #9b59b6; margin: 0 0 0.5rem 0;">${menu.desserts.title}</h3>
          <p style="color: #666; margin: 0 0 1rem 0;">${menu.desserts.description}</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
            ${menu.desserts.options.map(dessert => this.renderDessert(dessert)).join('')}
          </div>
        </div>
      `;
    }

    // Afficher la liste de courses
    if (menu.shoppingList && menu.shoppingList.length > 0) {
      html += `
        <div style="background: #e3f2fd; border: 3px solid #2196f3; border-radius: 12px; padding: 1.5rem; margin: 2rem 0;">
          <h3 style="color: #1976d2; margin: 0 0 0.5rem 0;">🛒 Liste de Courses Consolidée</h3>
          <p style="color: #666; margin: 0 0 1rem 0;">Tous les ingrédients nécessaires pour ${menu.totalPeople} personnes</p>
          <ul style="columns: 3; column-gap: 2rem; list-style: none; padding: 0; margin: 0;">
            ${menu.shoppingList.slice(0, 30).map(ing => `
              <li style="padding: 0.5rem 0; border-bottom: 1px solid #bbdefb;">
                <strong style="color: #1976d2;">${ing.name}</strong>: ${Math.ceil(ing.quantity)} ${ing.unit}
              </li>
            `).join('')}
          </ul>
          ${menu.shoppingList.length > 30 ? `<p style="color: #666; margin-top: 1rem; font-style: italic;">... et ${menu.shoppingList.length - 30} autres ingrédients</p>` : ''}
        </div>
      `;
    }

    // Boutons d'action
    html += `
      <div style="margin-top: 2rem; display: flex; gap: 1rem; flex-wrap: wrap;">
        <button onclick="window.print()" style="flex: 1; background: #667eea; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">
          <i class="fas fa-print"></i> Imprimer
        </button>
        <button onclick="location.reload()" style="flex: 1; background: #27ae60; color: white; padding: 1rem 2rem; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; font-size: 1rem;">
          <i class="fas fa-redo"></i> Générer un nouveau menu
        </button>
      </div>
    `;

    resultsDiv.innerHTML = html;
  }

  renderDishCompact(dish) {
    if (!dish) return '';
    
    return `
      <div style="background: #f8f9fa; padding: 1rem; border-radius: 8px; border-left: 4px solid #3498db;">
        <div style="font-weight: bold; color: #2c3e50; margin-bottom: 0.3rem; font-size: 0.85rem; text-transform: uppercase; opacity: 0.7;">${dish.category}</div>
        <div style="font-size: 1.1rem; color: #34495e; margin-bottom: 0.5rem; font-weight: 600;">${dish.name}</div>
        ${dish.description ? `<div style="font-size: 0.9rem; color: #7f8c8d; margin-bottom: 0.5rem;">${dish.description}</div>` : ''}
        ${this.renderNutritionCompact(dish.nutrition)}
      </div>
    `;
  }

  renderDishSimple(dish) {
    if (!dish) return '';
    
    return `
      <div style="background: white; padding: 1rem; border-radius: 8px; border: 2px solid #27ae60;">
        <div style="font-weight: bold; color: #27ae60; font-size: 1.05rem;">${dish.name}</div>
        ${dish.description ? `<div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">${dish.description}</div>` : ''}
      </div>
    `;
  }

  renderDessert(dessert) {
    if (!dessert) return '';
    
    return `
      <div style="background: white; padding: 1.5rem; border-radius: 8px; border: 2px solid #9b59b6;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div style="font-weight: bold; font-size: 1.1rem; color: #8e44ad;">${dessert.name}</div>
          <span style="background: #9b59b6; color: white; padding: 0.3rem 0.7rem; border-radius: 12px; font-size: 0.85rem;">
            👥 ~${dessert.servings} pers.
          </span>
        </div>
        ${dessert.description ? `<div style="color: #666; margin-bottom: 0.5rem; font-size: 0.9rem;">${dessert.description}</div>` : ''}
        ${dessert.details ? `<div style="color: #9b59b6; font-style: italic; font-size: 0.85rem; margin-top: 0.5rem;">💡 ${dessert.details}</div>` : ''}
        ${dessert.ingredients && dessert.ingredients.length > 0 ? `
          <details style="margin-top: 0.5rem;">
            <summary style="cursor: pointer; color: #8e44ad; font-weight: bold; font-size: 0.9rem;">📝 Voir les ingrédients</summary>
            <ul style="margin: 0.5rem 0 0 1rem; font-size: 0.85rem;">
              ${dessert.ingredients.map(ing => `<li>${ing.quantity} ${ing.unit} de ${ing.name}</li>`).join('')}
            </ul>
          </details>
        ` : ''}
      </div>
    `;
  }

  renderNutritionCompact(nutrition) {
    if (!nutrition || (nutrition.calories === 0 && nutrition.proteins === 0)) {
      return '';
    }
    
    return `
      <div style="display: flex; gap: 0.5rem; font-size: 0.8rem; color: #7f8c8d; margin-top: 0.5rem;">
        ${nutrition.calories > 0 ? `<span>🔥 ${nutrition.calories}kcal</span>` : ''}
        ${nutrition.proteins > 0 ? `<span>💪 ${nutrition.proteins}g prot.</span>` : ''}
      </div>
    `;
  }
}

// Initialiser le gestionnaire
document.addEventListener('DOMContentLoaded', () => {
  new EnterpriseBuffetHandler();
});
