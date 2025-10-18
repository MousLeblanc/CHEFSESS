// client/JS/recipe-generator.js
class RecipeGenerator {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadStats();
  }

  bindEvents() {
    // Bouton de génération
    const generateBtn = document.getElementById('generate-recipes-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generateRecipes());
    }

    // Chargement des statistiques au chargement de la page
    this.loadStats();
  }

  async generateRecipes() {
    const generateBtn = document.getElementById('generate-recipes-btn');
    const resultsDiv = document.getElementById('generated-recipes-results');
    const recipesList = document.getElementById('generated-recipes-list');

    try {
      // Désactiver le bouton et afficher le loading
      generateBtn.disabled = true;
      generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Génération en cours...';

      // Collecter les données du formulaire
      const context = document.getElementById('generator-context').value;
      const count = parseInt(document.getElementById('generator-count').value);
      const texture = document.getElementById('generator-texture').value;
      
      const pathologies = Array.from(document.getElementById('generator-pathologies').selectedOptions)
        .map(option => option.value);
      
      const diet = Array.from(document.getElementById('generator-diet').selectedOptions)
        .map(option => option.value);
      
      const allergens = Array.from(document.getElementById('generator-allergens').selectedOptions)
        .map(option => option.value);

      const requestData = {
        context,
        filters: {
          texture,
          pathologies,
          diet,
          allergens
        },
        count
      };

      console.log('🤖 Génération de recettes:', requestData);

      // Appel API
      const response = await fetch('/api/recipe-generator/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la génération');
      }

      const result = await response.json();
      console.log('✅ Recettes générées:', result);

      // Afficher les résultats
      this.displayGeneratedRecipes(result.recipes);
      resultsDiv.style.display = 'block';

      // Recharger les statistiques
      this.loadStats();

      // Afficher un message de succès
      this.showNotification(`✅ ${result.count} recettes générées avec succès !`, 'success');

    } catch (error) {
      console.error('❌ Erreur génération:', error);
      this.showNotification(`❌ Erreur: ${error.message}`, 'error');
    } finally {
      // Réactiver le bouton
      generateBtn.disabled = false;
      generateBtn.innerHTML = '<i class="fas fa-magic"></i> Générer des recettes';
    }
  }

  displayGeneratedRecipes(recipes) {
    const recipesList = document.getElementById('generated-recipes-list');
    
    if (!recipes || recipes.length === 0) {
      recipesList.innerHTML = '<p style="text-align: center; color: #666;">Aucune recette générée</p>';
      return;
    }

    recipesList.innerHTML = recipes.map(recipe => `
      <div style="background: white; border: 1px solid #e0e0e0; border-radius: 8px; padding: 1.5rem; margin-bottom: 1.5rem; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
          <h3 style="margin: 0; color: #2c3e50; flex: 1;">${recipe.name}</h3>
          <span style="background: #e8f5e8; color: #2c3e50; padding: 0.25rem 0.5rem; border-radius: 4px; font-size: 0.8rem; margin-left: 1rem;">
            ${recipe.category}
          </span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.5rem; margin-bottom: 1rem; padding: 0.5rem; background: #f8f9fa; border-radius: 4px;">
          ${recipe.texture ? `<div><strong>Texture:</strong> ${recipe.texture}</div>` : ''}
          ${recipe.diet && recipe.diet.length > 0 ? `<div><strong>Régimes:</strong> ${recipe.diet.join(', ')}</div>` : ''}
          ${recipe.pathologies && recipe.pathologies.length > 0 ? `<div><strong>Pathologies:</strong> ${recipe.pathologies.join(', ')}</div>` : ''}
          ${recipe.allergens && recipe.allergens.length > 0 ? `<div><strong>Allergènes:</strong> ${recipe.allergens.join(', ')}</div>` : ''}
        </div>

        ${recipe.nutritionalProfile ? `
        <div style="margin-bottom: 1rem;">
          <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">📊 Profil nutritionnel</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: 0.5rem; font-size: 0.9rem;">
            <div><strong>Calories:</strong> ${recipe.nutritionalProfile.kcal || 0} kcal</div>
            <div><strong>Protéines:</strong> ${recipe.nutritionalProfile.protein || 0}g</div>
            <div><strong>Lipides:</strong> ${recipe.nutritionalProfile.lipids || 0}g</div>
            <div><strong>Glucides:</strong> ${recipe.nutritionalProfile.carbs || 0}g</div>
            <div><strong>Fibres:</strong> ${recipe.nutritionalProfile.fiber || 0}g</div>
            <div><strong>Sodium:</strong> ${recipe.nutritionalProfile.sodium || 0}mg</div>
          </div>
        </div>
        ` : ''}

        ${recipe.ingredients && recipe.ingredients.length > 0 ? `
        <div style="margin-bottom: 1rem;">
          <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">🥘 Ingrédients</h4>
          <ul style="margin: 0; padding-left: 1.5rem;">
            ${recipe.ingredients.map(ingredient => `
              <li style="margin-bottom: 0.25rem;">
                <strong>${ingredient.name}:</strong> ${ingredient.quantity} ${ingredient.unit || ''}
              </li>
            `).join('')}
          </ul>
        </div>
        ` : ''}

        ${recipe.preparationSteps && recipe.preparationSteps.length > 0 ? `
        <div style="margin-bottom: 1rem;">
          <h4 style="color: #2c3e50; margin-bottom: 0.5rem;">👨‍🍳 Préparation</h4>
          <ol style="margin: 0; padding-left: 1.5rem;">
            ${recipe.preparationSteps.map((step, index) => `
              <li style="margin-bottom: 0.5rem; line-height: 1.4;">
                ${step}
              </li>
            `).join('')}
          </ol>
        </div>
        ` : ''}

        <div style="font-size: 0.8rem; color: #666; border-top: 1px solid #e0e0e0; padding-top: 0.5rem; margin-top: 1rem;">
          <strong>ID:</strong> ${recipe._id || recipe.id || 'N/A'} | 
          <strong>Généré par IA:</strong> ${recipe.aiGenerated ? 'Oui' : 'Non'} | 
          <strong>Score de compatibilité:</strong> ${recipe.aiCompatibilityScore || 'N/A'}
        </div>
      </div>
    `).join('');
  }

  async loadStats() {
    try {
      const response = await fetch('/api/recipe-generator/stats', {
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Erreur lors du chargement des statistiques');
      }

      const result = await response.json();
      this.displayStats(result.data);

    } catch (error) {
      console.error('❌ Erreur chargement stats:', error);
    }
  }

  displayStats(stats) {
    const statsContent = document.getElementById('stats-content');
    
    if (!stats) {
      statsContent.innerHTML = '<p style="color: #666;">Aucune statistique disponible</p>';
      return;
    }

    statsContent.innerHTML = `
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem;">
        <div style="text-align: center; padding: 1rem; background: white; border-radius: 8px;">
          <div style="font-size: 2rem; font-weight: bold; color: #9c27b0;">${stats.totalGenerated}</div>
          <div style="color: #666;">Recettes générées par IA</div>
        </div>
        
        <div style="text-align: center; padding: 1rem; background: white; border-radius: 8px;">
          <div style="font-size: 2rem; font-weight: bold; color: #4caf50;">${stats.totalRecipes}</div>
          <div style="color: #666;">Total des recettes</div>
        </div>
        
        <div style="text-align: center; padding: 1rem; background: white; border-radius: 8px;">
          <div style="font-size: 2rem; font-weight: bold; color: #ff9800;">${stats.percentageGenerated}%</div>
          <div style="color: #666;">Générées par IA</div>
        </div>
      </div>
      
      ${stats.byEstablishment && stats.byEstablishment.length > 0 ? `
        <div style="margin-top: 1rem;">
          <h4 style="margin-bottom: 0.5rem; color: #2c3e50;">Par établissement:</h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 0.5rem;">
            ${stats.byEstablishment.map(stat => `
              <div style="text-align: center; padding: 0.5rem; background: white; border-radius: 4px; font-size: 0.9rem;">
                <div style="font-weight: bold;">${stat._id.join(', ')}</div>
                <div style="color: #666;">${stat.count} recettes</div>
              </div>
            `).join('')}
          </div>
        </div>
      ` : ''}
    `;
  }

  showNotification(message, type = 'info') {
    // Créer une notification temporaire
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      padding: 1rem 1.5rem;
      border-radius: 8px;
      color: white;
      font-weight: 600;
      z-index: 1000;
      max-width: 400px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      ${type === 'success' ? 'background-color: #4caf50;' : ''}
      ${type === 'error' ? 'background-color: #f44336;' : ''}
      ${type === 'info' ? 'background-color: #2196f3;' : ''}
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    // Supprimer après 5 secondes
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 5000);
  }
}

// Initialiser le générateur de recettes quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
  new RecipeGenerator();
});
