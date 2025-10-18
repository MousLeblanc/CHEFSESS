// client/js/intelligent-menu-generator.js

/**
 * Classe pour gérer la génération intelligente de menus basée sur les recettes
 */
class IntelligentMenuGenerator {
  constructor() {
    this.apiUrl = '/api/intelligent-menu';
    this.recipeApiUrl = '/api/recipes';
  }

  /**
   * Récupère le token d'authentification
   */
  getAuthToken() {
    return localStorage.getItem('token');
  }

  /**
   * Génère un menu intelligent
   * @param {Object} config - Configuration du menu
   * @returns {Promise<Object>} Menu généré
   */
  async generateMenu(config) {
    try {
      const {
        establishmentType,
        ageGroups, // [{ ageRange: "6-12", count: 25 }, ...]
        numDishes = 3,
        allergens = [],
        dietaryRestrictions = [],
        medicalConditions = [],
        texture = 'normale',
        useStockOnly = false,
        theme = null
      } = config;

      // Validation des données
      if (!establishmentType) {
        throw new Error('Le type d\'établissement est requis');
      }

      if (!ageGroups || ageGroups.length === 0) {
        throw new Error('Au moins un groupe d\'âge est requis');
      }

      // Utiliser l'endpoint de test si pas de token (non connecté)
      const token = this.getAuthToken();
      const endpoint = token ? '/generate' : '/generate-test';
      const headers = {
        'Content-Type': 'application/json'
      };
      
      // Ajouter le token seulement si présent
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.apiUrl}${endpoint}`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          establishmentType,
          ageGroups,
          numDishes,
          allergens,
          dietaryRestrictions,
          medicalConditions,
          texture,
          useStockOnly,
          theme
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la génération du menu');
      }

      const data = await response.json();
      return data.menu;
    } catch (error) {
      console.error('Erreur génération menu intelligent:', error);
      throw error;
    }
  }

  /**
   * Récupère des suggestions de recettes
   * @param {Object} filters - Filtres de recherche
   * @returns {Promise<Array>} Liste de recettes suggérées
   */
  async getRecipeSuggestions(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.ageGroup) queryParams.append('ageGroup', filters.ageGroup);
      if (filters.category) queryParams.append('category', filters.category);
      if (filters.allergens && filters.allergens.length > 0) {
        queryParams.append('allergens', filters.allergens.join(','));
      }
      if (filters.dietaryRestrictions && filters.dietaryRestrictions.length > 0) {
        queryParams.append('dietaryRestrictions', filters.dietaryRestrictions.join(','));
      }
      if (filters.limit) queryParams.append('limit', filters.limit);

      const response = await fetch(`${this.apiUrl}/suggestions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des suggestions');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur récupération suggestions:', error);
      throw error;
    }
  }

  /**
   * Récupère toutes les recettes avec filtres
   * @param {Object} filters - Filtres de recherche
   * @returns {Promise<Array>} Liste de recettes
   */
  async getRecipes(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          if (Array.isArray(filters[key])) {
            queryParams.append(key, filters[key].join(','));
          } else {
            queryParams.append(key, filters[key]);
          }
        }
      });

      const response = await fetch(`${this.recipeApiUrl}?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des recettes');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur récupération recettes:', error);
      throw error;
    }
  }

  /**
   * Récupère une recette par ID
   * @param {string} recipeId - ID de la recette
   * @returns {Promise<Object>} Recette
   */
  async getRecipeById(recipeId) {
    try {
      const response = await fetch(`${this.recipeApiUrl}/${recipeId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Recette non trouvée');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur récupération recette:', error);
      throw error;
    }
  }

  /**
   * Récupère les statistiques des recettes
   * @returns {Promise<Object>} Statistiques
   */
  async getRecipeStats() {
    try {
      const response = await fetch(`${this.recipeApiUrl}/stats/overview`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`
        }
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la récupération des statistiques');
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Erreur récupération statistiques:', error);
      throw error;
    }
  }

  /**
   * Affiche le menu généré dans le DOM
   * @param {Object} menu - Menu à afficher
   * @param {string} containerId - ID du conteneur HTML
   */
  displayMenu(menu, containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.error(`Conteneur ${containerId} non trouvé`);
      return;
    }

    container.innerHTML = `
      <div class="generated-menu">
        <h2>${menu.title}</h2>
        <p class="menu-description">${menu.description}</p>
        
        <div class="menu-metadata">
          <span><strong>Établissement:</strong> ${menu.metadata.establishmentType}</span>
          <span><strong>Total convives:</strong> ${menu.metadata.totalPeople}</span>
        </div>

        <div class="menu-dishes">
          <h3>Plats du menu</h3>
          ${menu.dishes.map((dish, index) => `
            <div class="dish-card">
              <h4>${index + 1}. ${dish.name}</h4>
              <p class="dish-category">${dish.category}</p>
              <p class="dish-description">${dish.description || ''}</p>
              
              <div class="dish-nutrition">
                <span>🔥 ${dish.nutrition?.calories || 0} kcal</span>
                <span>💪 ${dish.nutrition?.proteins || 0}g protéines</span>
                <span>🌾 ${dish.nutrition?.carbs || 0}g glucides</span>
                <span>🥑 ${dish.nutrition?.fats || 0}g lipides</span>
              </div>

              <details>
                <summary>Ingrédients (${dish.ingredients.length})</summary>
                <ul class="ingredients-list">
                  ${dish.ingredients.map(ing => `
                    <li>${ing.quantity} ${ing.unit} de ${ing.name}</li>
                  `).join('')}
                </ul>
              </details>

              <details>
                <summary>Instructions (${dish.instructions.length} étapes)</summary>
                <ol class="instructions-list">
                  ${dish.instructions.map(step => `<li>${step}</li>`).join('')}
                </ol>
              </details>
            </div>
          `).join('')}
        </div>

        <div class="shopping-list">
          <h3>Liste de courses (${menu.shoppingList.length} ingrédients)</h3>
          <table>
            <thead>
              <tr>
                <th>Ingrédient</th>
                <th>Quantité</th>
                <th>Unité</th>
                <th>Pour les plats</th>
              </tr>
            </thead>
            <tbody>
              ${menu.shoppingList.map(item => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${item.unit}</td>
                  <td>${item.requiredFor.join(', ')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }
}

// Exporter pour utilisation globale
window.IntelligentMenuGenerator = IntelligentMenuGenerator;

