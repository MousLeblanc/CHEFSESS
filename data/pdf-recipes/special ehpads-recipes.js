/**
 * Recettes extraites d'un PDF - Format Chef SES
 * Généré le: 2025-11-26T15:14:54.658Z
 * Total de recettes: 0
 * 
 * Format compatible avec le modèle RecipeEnriched de Chef SES
 */

export const extractedRecipes = [];

// Export par défaut
export default extractedRecipes;

// Fonctions utilitaires
export function getRecipeByName(name) {
  return extractedRecipes.find(recipe => recipe.name === name);
}

export function getRecipesByCategory(category) {
  return extractedRecipes.filter(recipe => recipe.category === category);
}

export function getRecipesByTag(tag) {
  return extractedRecipes.filter(recipe => 
    recipe.tags && recipe.tags.includes(tag)
  );
}

export function searchRecipes(query) {
  const queryLower = query.toLowerCase();
  return extractedRecipes.filter(recipe => 
    recipe.name.toLowerCase().includes(queryLower) ||
    (recipe.ingredients && recipe.ingredients.some(ing => 
      ing.name.toLowerCase().includes(queryLower)
    )) ||
    (recipe.tags && recipe.tags.some(tag => 
      tag.toLowerCase().includes(queryLower)
    ))
  );
}

// Fonction pour filtrer par établissement
export function getRecipesForEstablishment(establishmentType) {
  return extractedRecipes.filter(recipe => 
    recipe.establishmentTypes && recipe.establishmentTypes.includes(establishmentType)
  );
}

// Fonction pour filtrer par restriction alimentaire
export function getRecipesByDietaryRestriction(restriction) {
  return extractedRecipes.filter(recipe => 
    recipe.dietaryRestrictions && recipe.dietaryRestrictions.includes(restriction)
  );
}
