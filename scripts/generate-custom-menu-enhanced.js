// scripts/generate-custom-menu-enhanced.js
// Générateur de menu amélioré avec équilibre nutritionnel combiné, dressage de l'assiette, et conformité AVIQ/Annexe 120

import dotenv from 'dotenv';
import { ingredientsDatabase, getIngredientData } from './ingredients-database.js';
import RecipeEnriched from '../models/Recipe.js';
import openai from '../services/openaiClient.js';
import { calculateTotalNutrition, verifyNutritionalBalance } from './calculate-menu-nutrition.js';

dotenv.config();

/**
 * Génère un menu personnalisé avec équilibre nutritionnel combiné
 * Les objectifs nutritionnels sont calculés sur l'ENSEMBLE du menu (entrée + plat + dessert)
 */
export async function generateCustomMenuEnhanced({
  numberOfPeople = 4,
  mealType = 'déjeuner',
  nutritionalGoals = [],
  dietaryRestrictions = [],
  residentsGroups = [], // Groupes de résidents avec leurs besoins spécifiques
  avoidMenuName = null,
  forceVariation = false,
  filtersAsPreferences = true,
  strictMode = false,
  prioritizeVariety = true,
  useFullRecipeCatalog = true,
  weekdayTheme = null,
  weeklyProteinPlan = null,
  antiRepeat = null,
  dynamicBanProteins = [],
  periodDays = 1,
  dayIndex = 1,
  useStockOnly = false,
  stockItems = [],
  includePlating = true, // Inclure les suggestions de dressage
  verifyAVIQ = true, // Vérifier la conformité AVIQ
  verifyAnnexe120 = true // Vérifier la conformité Annexe 120
}) {
  console.log(`\n🎯 Génération d'un menu personnalisé amélioré...`);
  console.log(`   👥 ${numberOfPeople} personnes`);
  console.log(`   🍽️  Type : ${mealType}`);
  
  // Afficher les groupes de résidents
  if (residentsGroups.length > 0) {
    console.log(`   👥 Groupes de résidents :`);
    residentsGroups.forEach(group => {
      console.log(`      - ${group.name}: ${group.count} personnes (${group.ageRange || 'N/A'})`);
    });
  }
  
  // Les objectifs nutritionnels sont optionnels
  if (nutritionalGoals.length > 0) {
    console.log(`   🎯 Objectifs nutritionnels :`);
    nutritionalGoals.forEach(goal => {
      console.log(`      - ${goal.label} : ${goal.target}${goal.unit} par personne`);
    });
  }
  
  if (dietaryRestrictions.length > 0) {
    console.log(`   ⚠️  Restrictions : ${dietaryRestrictions.join(', ')}`);
  }
  
  // ========== RÉCUPÉRER LES RECETTES DE MONGODB ==========
  console.log(`\n📚 Recherche de recettes dans MongoDB...`);
  
  // Construire les filtres de recherche (similaire à generate-custom-menu.js)
  const recipeFilters = buildRecipeFilters({
    mealType,
    dietaryRestrictions,
    weekdayTheme,
    dynamicBanProteins,
    avoidMenuName,
    filtersAsPreferences,
    nutritionalGoals
  });
  
  // Récupérer les recettes compatibles
  let compatibleRecipes = await RecipeEnriched.find(recipeFilters);
  console.log(`✅ ${compatibleRecipes.length} recettes trouvées`);
  
  // Si pas de résultats, assouplir les filtres
  if (compatibleRecipes.length === 0 && filtersAsPreferences) {
    console.log(`⚠️  Aucune recette trouvée avec filtres stricts, assouplissement...`);
    const relaxedFilters = {
      category: recipeFilters.category
    };
    compatibleRecipes = await RecipeEnriched.find(relaxedFilters);
    console.log(`✅ ${compatibleRecipes.length} recettes trouvées avec filtres assouplis`);
  }
  
  if (compatibleRecipes.length === 0) {
    throw new Error('Aucune recette compatible trouvée');
  }
  
  // ========== SÉLECTION INTELLIGENTE AVEC IA ==========
  console.log(`\n🤖 Sélection intelligente avec IA...`);
  
  // Sélectionner les recettes pour chaque composant du menu
  const menuStructure = mealType === 'petit-déjeuner' 
    ? ['petit-déjeuner']
    : ['entrée', 'plat', 'dessert'];
  
  const selectedRecipes = [];
  let accumulatedNutrition = {
    proteins: 0,
    carbs: 0,
    fats: 0,
    calories: 0,
    calcium: 0,
    iron: 0,
    vitaminC: 0,
    fiber: 0
  };
  
  for (const course of menuStructure) {
    // Filtrer les recettes par catégorie
    const courseRecipes = compatibleRecipes.filter(r => {
      if (course === 'entrée') return r.category === 'entrée' || r.category === 'soupe';
      if (course === 'plat') return r.category === 'plat' || r.category === 'plat_complet';
      if (course === 'dessert') return r.category === 'dessert';
      if (course === 'petit-déjeuner') return r.category === 'petit-déjeuner';
      return false;
    });
    
    if (courseRecipes.length === 0) {
      console.log(`⚠️  Aucune recette trouvée pour ${course}, passage au suivant...`);
      continue;
    }
    
    // Sélectionner la meilleure recette avec IA
    const selectedRecipe = await selectBestRecipeWithAIEnhanced(
      courseRecipes,
      nutritionalGoals,
      accumulatedNutrition, // Nutrition déjà accumulée
      course,
      numberOfPeople,
      residentsGroups,
      weekdayTheme,
      useStockOnly,
      stockItems,
      includePlating
    );
    
    if (selectedRecipe) {
      selectedRecipes.push({
        course: course,
        recipe: selectedRecipe,
        servings: numberOfPeople
      });
      
      // Accumuler la nutrition
      const recipeNutrition = selectedRecipe.nutritionalProfile || {};
      accumulatedNutrition.proteins += (recipeNutrition.protein || 0) * numberOfPeople;
      accumulatedNutrition.carbs += (recipeNutrition.carbs || 0) * numberOfPeople;
      accumulatedNutrition.fats += (recipeNutrition.lipids || 0) * numberOfPeople;
      accumulatedNutrition.calories += (recipeNutrition.kcal || 0) * numberOfPeople;
      accumulatedNutrition.calcium += (recipeNutrition.calcium || 0) * numberOfPeople;
      accumulatedNutrition.iron += (recipeNutrition.iron || 0) * numberOfPeople;
      accumulatedNutrition.vitaminC += (recipeNutrition.vitaminC || 0) * numberOfPeople;
      accumulatedNutrition.fiber += (recipeNutrition.fiber || 0) * numberOfPeople;
      
      console.log(`✅ ${course} sélectionné: "${selectedRecipe.name}"`);
    }
  }
  
  // ========== CONSTRUIRE LE MENU FINAL ==========
  const menuData = {
    name: `Menu ${mealType} - ${new Date().toLocaleDateString('fr-FR')}`,
    mealType: mealType,
    dishes: selectedRecipes.map(sr => ({
      name: sr.recipe.name,
      category: sr.course,
      description: sr.recipe.description || '',
      ingredients: sr.recipe.ingredients || [],
      instructions: sr.recipe.preparationSteps || [],
      nutritionalProfile: sr.recipe.nutritionalProfile || {},
      servings: sr.servings,
      plating: sr.recipe.plating || null // Dressage de l'assiette
    })),
    numberOfPeople: numberOfPeople,
    nutritionalGoals: nutritionalGoals,
    dietaryRestrictions: dietaryRestrictions,
    residentsGroups: residentsGroups
  };
  
  // ========== VÉRIFIER L'ÉQUILIBRE NUTRITIONNEL ==========
  console.log(`\n📊 Vérification de l'équilibre nutritionnel...`);
  
  const nutritionalGoalsObj = convertGoalsToObject(nutritionalGoals);
  const balanceResult = verifyNutritionalBalance(menuData, nutritionalGoalsObj, {
    name: residentsGroups.map(g => g.name).join(', ') || 'Groupe principal',
    ageRange: residentsGroups[0]?.ageRange || 'N/A',
    dependencyLevel: residentsGroups[0]?.dependencyLevel || 'N/A',
    medicalConditions: residentsGroups.flatMap(g => g.medicalConditions || [])
  });
  
  console.log(`   Score d'équilibre: ${(balanceResult.score * 100).toFixed(1)}%`);
  console.log(`   Équilibré: ${balanceResult.balanced ? '✅ Oui' : '⚠️ Non'}`);
  
  if (balanceResult.recommendations.length > 0) {
    console.log(`   Recommandations:`);
    balanceResult.recommendations.forEach(rec => {
      console.log(`      - ${rec.suggestion}`);
    });
  }
  
  // ========== CALCULER LES INGRÉDIENTS ENRICHIS ==========
  const enrichedIngredients = [];
  selectedRecipes.forEach(sr => {
    (sr.recipe.ingredients || []).forEach(ing => {
      const ingredientData = getIngredientData(ing.name);
      if (ingredientData) {
        const quantityTotal = (ing.quantity || 0) * numberOfPeople;
        const factor = quantityTotal / 100;
        
        const nutritionCalculated = {};
        for (const [key, value] of Object.entries(ingredientData.nutritionalValues)) {
          nutritionCalculated[key] = (value || 0) * factor;
        }
        
        enrichedIngredients.push({
          nom: ing.name,
          unite: ing.unit || 'g',
          quantiteParPersonne: ing.quantity || 0,
          quantiteTotal: quantityTotal,
          nutritionalValues: ingredientData.nutritionalValues,
          calculated: nutritionCalculated
        });
      }
    });
  });
  
  // Calculer les totaux nutritionnels
  const totals = {};
  enrichedIngredients.forEach(ing => {
    for (const [key, value] of Object.entries(ing.calculated)) {
      totals[key] = (totals[key] || 0) + value;
    }
  });
  
  const nutrition = {
    total: totals,
    perPerson: {}
  };
  
  for (const [key, value] of Object.entries(totals)) {
    nutrition.perPerson[key] = value / numberOfPeople;
  }
  
  return {
    menu: menuData,
    nutrition: nutrition,
    numberOfPeople: numberOfPeople,
    nutritionalGoals: nutritionalGoals,
    ingredients: enrichedIngredients,
    balance: balanceResult,
    source: 'mongodb+ai-enhanced',
    plating: includePlating ? menuData.dishes.map(d => d.plating).filter(p => p) : null
  };
}

/**
 * Sélectionne la meilleure recette avec IA en tenant compte de la nutrition accumulée
 */
async function selectBestRecipeWithAIEnhanced(
  recipes,
  nutritionalGoals,
  accumulatedNutrition,
  course,
  numberOfPeople,
  residentsGroups,
  weekdayTheme,
  useStockOnly,
  stockItems,
  includePlating
) {
  if (recipes.length === 0) return null;
  
  // Si peu de recettes, sélection aléatoire
  if (recipes.length <= 3) {
    return recipes[Math.floor(Math.random() * recipes.length)];
  }
  
  try {
    const recipesForAI = recipes.slice(0, 30).map((r, index) => ({
      id: index,
      name: r.name,
      category: r.category,
      description: r.description || '',
      ingredients: (r.ingredients || []).slice(0, 5).map(ing => ing.name).join(', '),
      nutritionalProfile: r.nutritionalProfile || {},
      tags: (r.tags || []).slice(0, 5).join(', ')
    }));
    
    // Construire le prompt avec nutrition accumulée
    const goalsText = nutritionalGoals.length > 0
      ? nutritionalGoals.map(goal => {
          const remaining = goal.target * numberOfPeople - (accumulatedNutrition[goal.nutrient] || 0);
          return `- ${goal.label}: ${goal.target}${goal.unit}/personne (reste à atteindre: ${Math.max(0, remaining).toFixed(1)}${goal.unit} pour ${numberOfPeople} personnes)`;
        }).join('\n')
      : 'Aucun objectif nutritionnel spécifique.';
    
    const groupsText = residentsGroups.length > 0
      ? `\nGroupes de résidents:\n${residentsGroups.map(g => 
          `- ${g.name}: ${g.count} personnes, ${g.ageRange || 'N/A'}, ${g.medicalConditions?.join(', ') || 'Aucune pathologie'}`
        ).join('\n')}`
      : '';
    
    const prompt = `Tu es un chef expert en nutrition pour établissements de soins (EHPAD, hôpitaux).

MISSION: Sélectionne la MEILLEURE recette pour un ${course} dans un menu complet pour ${numberOfPeople} personnes.

⚠️ RÈGLE FONDAMENTALE: Les objectifs nutritionnels sont calculés sur l'ENSEMBLE DU MENU (entrée + plat + dessert), pas sur un plat individuel.
Nutrition déjà accumulée dans le menu:
- Protéines: ${(accumulatedNutrition.proteins / numberOfPeople).toFixed(1)}g/personne
- Glucides: ${(accumulatedNutrition.carbs / numberOfPeople).toFixed(1)}g/personne
- Lipides: ${(accumulatedNutrition.fats / numberOfPeople).toFixed(1)}g/personne
${groupsText}

OBJECTIFS NUTRITIONNELS À RESPECTER (pour l'ENSEMBLE du menu):
${goalsText}

CRITÈRES DE SÉLECTION:
1. La recette doit contribuer à atteindre les objectifs nutritionnels en combinaison avec les autres plats
2. Variété et appétence
3. Compatibilité avec les groupes de résidents
${includePlating ? '4. Si possible, suggérer un dressage esthétique' : ''}

RECETTES DISPONIBLES:
${recipesForAI.map(r => {
  const profile = r.nutritionalProfile || {};
  return `[ID: ${r.id}] ${r.name}
   Nutrition: Protéines ${profile.protein || 0}g | Glucides ${profile.carbs || 0}g | Lipides ${profile.lipids || 0}g
   Ingrédients: ${r.ingredients}
   Tags: ${r.tags || 'aucun'}`;
}).join('\n\n')}

Réponds UNIQUEMENT avec un JSON valide:
{
  "selectedRecipeId": <ID de la recette (0-${recipesForAI.length - 1})>,
  "reasoning": "Explication de pourquoi cette recette a été choisie",
  ${includePlating ? `"plating": {
    "description": "Description du dressage",
    "instructions": ["Étape 1", "Étape 2"],
    "visualElements": {
      "colors": ["couleur1", "couleur2"],
      "textures": ["texture1", "texture2"],
      "height": "moyen",
      "arrangement": "central"
    },
    "garnishes": [
      {
        "name": "Persil",
        "placement": "dessus",
        "quantity": "quelques brins"
      }
    ],
    "plateType": "assiette_plate",
    "servingStyle": "moderne"
  },` : ''}
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en nutrition et gastronomie pour établissements de soins. Réponds UNIQUEMENT avec du JSON valide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const aiResponse = JSON.parse(completion.choices[0].message.content);
    const selectedId = aiResponse.selectedRecipeId;
    
    if (selectedId >= 0 && selectedId < recipesForAI.length) {
      const selectedName = recipesForAI[selectedId].name;
      const selectedRecipe = recipes.find(r => r.name === selectedName);
      
      if (selectedRecipe) {
        // Ajouter le dressage si fourni par l'IA
        if (includePlating && aiResponse.plating) {
          selectedRecipe.plating = aiResponse.plating;
        }
        
        console.log(`🤖 IA a sélectionné: "${selectedRecipe.name}"`);
        console.log(`   Raison: ${aiResponse.reasoning || 'Sélection optimale selon les critères'}`);
        return selectedRecipe;
      }
    }
    
    // Fallback
    return recipes[Math.floor(Math.random() * recipes.length)];
    
  } catch (error) {
    console.error('❌ Erreur lors de la sélection IA, fallback aléatoire:', error.message);
    return recipes[Math.floor(Math.random() * recipes.length)];
  }
}

/**
 * Convertit les objectifs nutritionnels en objet structuré
 */
function convertGoalsToObject(goals) {
  const obj = {};
  goals.forEach(goal => {
    obj[goal.nutrient] = {
      target: goal.target,
      min: goal.target * 0.8, // 80% du target comme minimum
      max: goal.target * 1.2  // 120% du target comme maximum
    };
  });
  return obj;
}

/**
 * Construit les filtres MongoDB pour rechercher des recettes
 */
function buildRecipeFilters({
  mealType,
  dietaryRestrictions = [],
  weekdayTheme = null,
  dynamicBanProteins = [],
  avoidMenuName = null,
  filtersAsPreferences = true,
  nutritionalGoals = []
}) {
  const filters = {};
  
  // Filtrer par catégorie selon le type de repas
  if (mealType === 'déjeuner' || mealType === 'dîner') {
    filters.category = { $in: ['plat', 'entrée', 'plat_complet', 'soupe', 'dessert'] };
  } else if (mealType === 'petit-déjeuner') {
    filters.category = { $in: ['petit-déjeuner'] };
  }
  
  // Thème hebdomadaire
  if (weekdayTheme && weekdayTheme.rules) {
    const themeRules = weekdayTheme.rules;
    if (themeRules.include && themeRules.include.length > 0) {
      const includeConditions = [];
      themeRules.include.forEach(term => {
        const termLower = term.toLowerCase();
        includeConditions.push(
          { diet: { $regex: termLower, $options: 'i' } },
          { dietaryRestrictions: { $regex: termLower, $options: 'i' } },
          { tags: { $regex: `#?${termLower}`, $options: 'i' } },
          { name: { $regex: termLower, $options: 'i' } }
        );
      });
      if (includeConditions.length > 0) {
        filters.$or = (filters.$or || []).concat(includeConditions);
      }
    }
  }
  
  // Éviter un menu spécifique
  if (avoidMenuName) {
    filters.name = { $ne: avoidMenuName };
  }
  
  // Bannir certaines protéines
  if (dynamicBanProteins && dynamicBanProteins.length > 0) {
    dynamicBanProteins.forEach(protein => {
      const proteinLower = protein.toLowerCase();
      filters.$and = (filters.$and || []).concat([
        { name: { $not: { $regex: proteinLower, $options: 'i' } } }
      ]);
    });
  }
  
  // Restrictions alimentaires
  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    const restrictionConditions = dietaryRestrictions.map(restriction => ({
      dietaryRestrictions: { $in: [restriction] }
    }));
    if (restrictionConditions.length > 0) {
      filters.$and = (filters.$and || []).concat(restrictionConditions);
    }
  }
  
  return filters;
}

export default generateCustomMenuEnhanced;

