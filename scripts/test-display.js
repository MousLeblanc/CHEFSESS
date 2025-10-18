// Test de l'affichage des recettes avec des données complètes
const testRecipes = [
  {
    _id: "68ee3b6b506a004e48d31072",
    id: "68ee3b6b506a004e48d31072",
    name: "Potage de légumes aux lentilles",
    category: "soupe",
    description: "Un potage nourrissant et adapté aux personnes âgées",
    texture: "mixée",
    diet: ["sans sel ajouté", "hyperprotéiné"],
    pathologies: ["hypertension", "diabète"],
    allergens: [],
    nutritionalProfile: {
      kcal: 280,
      protein: 18,
      lipids: 8,
      carbs: 35,
      fiber: 12,
      sodium: 150
    },
    ingredients: [
      { name: "Lentilles vertes", quantity: 100, unit: "g" },
      { name: "Carottes", quantity: 2, unit: "pièces" },
      { name: "Courgettes", quantity: 1, unit: "pièce" },
      { name: "Oignon", quantity: 1, unit: "pièce" },
      { name: "Bouillon de légumes", quantity: 500, unit: "ml" },
      { name: "Huile d'olive", quantity: 1, unit: "c.à.s" }
    ],
    preparationSteps: [
      "Faire tremper les lentilles dans l'eau froide pendant 30 minutes",
      "Éplucher et couper les légumes en morceaux",
      "Dans une casserole, faire revenir l'oignon dans l'huile d'olive",
      "Ajouter les légumes et les lentilles, couvrir avec le bouillon",
      "Laisser mijoter 45 minutes à feu doux",
      "Mixer le tout jusqu'à obtenir une purée lisse",
      "Rectifier l'assaisonnement si nécessaire"
    ],
    establishmentType: ["ehpad"],
    compatibleFor: ["mixée", "hypertension", "diabète"],
    aiCompatibilityScore: 1.0,
    aiGenerated: true
  },
  {
    _id: "68ee3b6b506a004e48d31078",
    id: "68ee3b6b506a004e48d31078",
    name: "Purée de poulet aux champignons",
    category: "plat",
    description: "Un plat protéiné et facile à manger",
    texture: "mixée",
    diet: ["sans sel ajouté", "hyperprotéiné"],
    pathologies: ["hypertension", "diabète"],
    allergens: [],
    nutritionalProfile: {
      kcal: 320,
      protein: 28,
      lipids: 12,
      carbs: 20,
      fiber: 3,
      sodium: 180
    },
    ingredients: [
      { name: "Filet de poulet", quantity: 150, unit: "g" },
      { name: "Champignons de Paris", quantity: 100, unit: "g" },
      { name: "Pommes de terre", quantity: 200, unit: "g" },
      { name: "Lait écrémé", quantity: 100, unit: "ml" },
      { name: "Beurre", quantity: 10, unit: "g" },
      { name: "Persil", quantity: 1, unit: "c.à.s" }
    ],
    preparationSteps: [
      "Cuire le poulet à la vapeur pendant 20 minutes",
      "Faire revenir les champignons dans une poêle",
      "Cuire les pommes de terre à l'eau bouillante",
      "Mixer le poulet avec les champignons",
      "Écraser les pommes de terre avec le lait et le beurre",
      "Mélanger le tout jusqu'à obtenir une purée homogène",
      "Saupoudrer de persil haché"
    ],
    establishmentType: ["ehpad"],
    compatibleFor: ["mixée", "hyperprotéiné"],
    aiCompatibilityScore: 1.0,
    aiGenerated: true
  }
];

// Fonction d'affichage (copiée du client)
function displayGeneratedRecipes(recipes) {
  if (!recipes || recipes.length === 0) {
    console.log('Aucune recette générée');
    return;
  }

  const html = recipes.map(recipe => `
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

  console.log('🎨 HTML généré pour l\'affichage:');
  console.log(html);
}

console.log('🧪 TEST: Affichage des recettes complètes');
console.log('📋 Nombre de recettes de test:', testRecipes.length);
console.log('\n' + '='.repeat(80));

displayGeneratedRecipes(testRecipes);

console.log('\n' + '='.repeat(80));
console.log('✅ Test d\'affichage terminé');
