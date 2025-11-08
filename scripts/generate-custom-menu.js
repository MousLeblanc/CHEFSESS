// scripts/generate-custom-menu.js
// Générateur de menu UNIVERSEL avec critères nutritionnels personnalisables

import dotenv from 'dotenv';
import { ingredientsDatabase, getIngredientData } from './ingredients-database.js';
import RecipeEnriched from '../models/Recipe.js';
import openai from '../services/openaiClient.js';

dotenv.config();

/**
 * Filtre les ingrédients selon un critère nutritionnel
 * @param {string} nutrientKey - Clé du nutriment (proteins, vitaminC, fibers, calcium, iron, etc.)
 * @param {number} minValue - Valeur minimale pour être considéré "riche"
 * @returns {Array} Liste triée d'ingrédients
 */
function getIngredientsByNutrient(nutrientKey, minValue = 0) {
  const ingredients = [];
  
  for (const [name, data] of Object.entries(ingredientsDatabase)) {
    const value = data.nutritionalValues[nutrientKey] || 0;
    if (value >= minValue) {
      ingredients.push({
        name: name,
        category: data.category,
        value: value,
        nutrientKey: nutrientKey,
        nutritionalValues: data.nutritionalValues
      });
    }
  }
  
  return ingredients.sort((a, b) => b.value - a.value);
}

/**
 * Génère un menu selon des critères nutritionnels personnalisés
 * @param {Object} options
 * @param {number} options.numberOfPeople - Nombre de personnes
 * @param {string} options.mealType - Type de repas (déjeuner, dîner, etc.)
 * @param {Array} options.nutritionalGoals - Liste des objectifs nutritionnels
 *   Ex: [{ nutrient: 'proteins', target: 35, unit: 'g', label: 'Protéines' }]
 * @param {Array} options.dietaryRestrictions - Restrictions alimentaires
 */

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
    filters.category = { $in: ['plat', 'entrée', 'plat_complet'] };
  } else if (mealType === 'petit-déjeuner') {
    filters.category = { $in: ['petit-déjeuner'] };
  }
  
  // Thème hebdomadaire (lundi=végétarien, mardi=vlaams, etc.)
  if (weekdayTheme && weekdayTheme.rules) {
    const themeRules = weekdayTheme.rules;
    
    if (themeRules.include && themeRules.include.length > 0) {
      // Rechercher dans diet, dietaryRestrictions, tags
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
    
    if (themeRules.exclude && themeRules.exclude.length > 0) {
      // Exclusion stricte
      const excludeConditions = [];
      themeRules.exclude.forEach(term => {
        const termLower = term.toLowerCase();
        excludeConditions.push(
          { diet: { $not: { $regex: termLower, $options: 'i' } } },
          { dietaryRestrictions: { $not: { $regex: termLower, $options: 'i' } } },
          { tags: { $not: { $regex: `#?${termLower}`, $options: 'i' } } },
          { name: { $not: { $regex: termLower, $options: 'i' } } }
        );
      });
    }
    
    if (themeRules.cuisine) {
      filters.$or = (filters.$or || []).concat([
        { tags: { $regex: themeRules.cuisine, $options: 'i' } },
        { name: { $regex: themeRules.cuisine, $options: 'i' } },
        { description: { $regex: themeRules.cuisine, $options: 'i' } }
      ]);
    }
  }
  
  // Interdictions dynamiques de protéines
  if (dynamicBanProteins && dynamicBanProteins.length > 0) {
    dynamicBanProteins.forEach(protein => {
      const proteinLower = protein.toLowerCase();
      filters.$and = (filters.$and || []).concat([
        { name: { $not: { $regex: proteinLower, $options: 'i' } } },
        { tags: { $not: { $regex: proteinLower, $options: 'i' } } }
      ]);
    });
  }
  
  // Éviter le menu déjà proposé
  if (avoidMenuName) {
    filters.name = { $ne: avoidMenuName };
  }
  
  // Restrictions alimentaires
  if (dietaryRestrictions && dietaryRestrictions.length > 0) {
    if (filtersAsPreferences) {
      // Mode préférences : chercher dans diet, dietaryRestrictions, tags (OR)
      const restrictionConditions = [];
      dietaryRestrictions.forEach(restriction => {
        const resLower = restriction.toLowerCase().replace('sans ', '');
        restrictionConditions.push(
          { diet: { $regex: resLower, $options: 'i' } },
          { dietaryRestrictions: { $regex: resLower, $options: 'i' } },
          { tags: { $regex: `#?${resLower}`, $options: 'i' } }
        );
      });
      if (restrictionConditions.length > 0) {
        filters.$or = (filters.$or || []).concat(restrictionConditions);
      }
    } else {
      // Mode strict : toutes les restrictions doivent être respectées
      filters.dietaryRestrictions = { $all: dietaryRestrictions };
    }
  }
  
  // Normaliser les conditions $or/$and
  if (filters.$or && Array.isArray(filters.$or) && filters.$or.length > 0) {
    // Si $or contient déjà des conditions, créer un seul $or
    const allOrConditions = [];
    filters.$or.forEach(condition => {
      if (condition.$or && Array.isArray(condition.$or)) {
        allOrConditions.push(...condition.$or);
      } else {
        allOrConditions.push(condition);
      }
    });
    if (allOrConditions.length > 0) {
      filters.$or = allOrConditions;
    } else {
      delete filters.$or;
    }
  }
  
  return filters;
}

/**
 * Sélectionne intelligemment la meilleure recette avec l'IA
 */
async function selectBestRecipeWithAI(
  recipes, 
  nutritionalGoals = [], 
  avoidMenuName = null,
  mealType = 'déjeuner',
  numberOfPeople = 4,
  weekdayTheme = null,
  useStockOnly = false,
  stockItems = []
) {
  if (recipes.length === 0) return null;
  
  // Filtrer les recettes à éviter
  let availableRecipes = recipes;
  if (avoidMenuName) {
    availableRecipes = recipes.filter(r => 
      r.name.toLowerCase() !== avoidMenuName.toLowerCase()
    );
  }
  
  if (availableRecipes.length === 0) {
    availableRecipes = recipes; // Fallback si toutes évitées
  }
  
  // Si peu de recettes, sélection aléatoire (pas besoin d'IA)
  if (availableRecipes.length <= 3) {
    const randomIndex = Math.floor(Math.random() * availableRecipes.length);
    return availableRecipes[randomIndex];
  }
  
  try {
    // Préparer la liste des recettes pour l'IA (limiter à 30 pour éviter les tokens)
    const recipesForAI = availableRecipes.slice(0, 30).map((r, index) => ({
      id: index,
      name: r.name,
      category: r.category,
      description: r.description || '',
      ingredients: (r.ingredients || []).slice(0, 5).map(ing => ing.name).join(', '),
      nutritionalProfile: r.nutritionalProfile || {},
      tags: (r.tags || []).slice(0, 5).join(', ')
    }));
    
    const goalsText = nutritionalGoals.length > 0
      ? nutritionalGoals.map(goal => `- ${goal.label}: minimum ${goal.target}${goal.unit} par personne`).join('\n')
      : 'Aucun objectif nutritionnel spécifique. Privilégier la variété et l\'équilibre.';
    
    const themeText = weekdayTheme 
      ? `\nThème du jour: ${weekdayTheme.label || weekdayTheme.key}`
      : '';
    
    // Construire les informations de stock pour l'IA
    let stockInfoText = '';
    if (useStockOnly && stockItems && stockItems.length > 0) {
      const stockList = stockItems.slice(0, 20).map(item => 
        `- ${item.name} (${item.quantity} ${item.unit || 'unité'})`
      ).join('\n');
      stockInfoText = `\n\n📦 STOCK DISPONIBLE (${stockItems.length} articles):
${stockList}
${stockItems.length > 20 ? `... et ${stockItems.length - 20} autres articles` : ''}

⚠️ IMPORTANT: Tu DOIS choisir UNIQUEMENT parmi les recettes dont TOUS les ingrédients sont disponibles en stock.
Les recettes listées ci-dessous ont déjà été filtrées pour ne contenir que des ingrédients disponibles.`;
    }
    
    const prompt = `Tu es un chef expert en nutrition pour établissements de soins (EHPAD, hôpitaux).

MISSION: Sélectionne la MEILLEURE recette parmi celles disponibles pour un ${mealType} pour ${numberOfPeople} personnes.

CRITÈRES DE SÉLECTION:
1. ${nutritionalGoals.length > 0 ? 'OBJECTIFS NUTRITIONNELS PRIORITAIRES:' : 'ÉQUILIBRE NUTRITIONNEL'}
${goalsText}${themeText}${stockInfoText}
2. VARIÉTÉ: Éviter les répétitions avec les menus précédents
3. APPÉTENCE: Privilégier les recettes appétissantes et équilibrées
4. QUALITÉ: Choisir des recettes complètes et bien décrites
${useStockOnly ? '5. STOCK: Toutes les recettes proposées utilisent uniquement des ingrédients disponibles en stock' : ''}

RECETTES DISPONIBLES:
${recipesForAI.map(r => 
  `[ID: ${r.id}] ${r.name}${r.description ? ' - ' + r.description : ''}
   Ingrédients principaux: ${r.ingredients}
   ${r.nutritionalProfile.protein ? `Protéines: ${r.nutritionalProfile.protein}g | ` : ''}${r.nutritionalProfile.kcal ? `Calories: ${r.nutritionalProfile.kcal}kcal` : ''}
   Tags: ${r.tags || 'aucun'}`
).join('\n\n')}

${avoidMenuName ? `⚠️ IMPORTANT: NE PAS choisir "${avoidMenuName}" (déjà proposé).` : ''}

Réponds UNIQUEMENT avec un JSON valide:
{
  "selectedRecipeId": <ID de la recette sélectionnée (0-${recipesForAI.length - 1})>,
  "reasoning": "Explication courte de pourquoi cette recette a été choisie"
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
      max_tokens: 500
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    const selectedId = aiResponse.selectedRecipeId;
    
    if (selectedId >= 0 && selectedId < recipesForAI.length) {
      const selectedName = recipesForAI[selectedId].name;
      const selectedRecipe = availableRecipes.find(r => r.name === selectedName);
      
      if (selectedRecipe) {
        console.log(`🤖 IA a sélectionné: "${selectedRecipe.name}"`);
        console.log(`   Raison: ${aiResponse.reasoning || 'Sélection optimale selon les critères'}`);
        return selectedRecipe;
      }
    }
    
    // Fallback si erreur dans la réponse IA
    console.log(`⚠️  Erreur dans la réponse IA, sélection aléatoire...`);
    const randomIndex = Math.floor(Math.random() * availableRecipes.length);
    return availableRecipes[randomIndex];
    
  } catch (error) {
    console.error('❌ Erreur lors de la sélection IA, fallback aléatoire:', error.message);
    // Fallback: sélection aléatoire
    const randomIndex = Math.floor(Math.random() * availableRecipes.length);
    return availableRecipes[randomIndex];
  }
}

/**
 * Génère une variation d'une recette avec l'IA pour éviter les répétitions
 */
async function generateRecipeVariation(
  baseRecipe,
  avoidMenuName,
  numberOfPeople,
  mealType,
  nutritionalGoals = [],
  weekdayTheme = null
) {
  try {
    const goalsText = nutritionalGoals.length > 0
      ? nutritionalGoals.map(goal => `- ${goal.label}: minimum ${goal.target}${goal.unit} par personne`).join('\n')
      : 'Aucun objectif nutritionnel spécifique.';
    
    const themeText = weekdayTheme 
      ? `\nThème du jour: ${weekdayTheme.label || weekdayTheme.key}`
      : '';
    
    const prompt = `Tu es un chef expert. Crée une VARIATION de la recette suivante pour éviter la répétition.

RECETTE DE BASE:
Nom: ${baseRecipe.name}
Description: ${baseRecipe.description || baseRecipe.name}
Ingrédients: ${(baseRecipe.ingredients || []).slice(0, 8).map(ing => `${ing.name} (${ing.quantity}${ing.unit || 'g'})`).join(', ')}
Instructions: ${(baseRecipe.preparationSteps || baseRecipe.instructions || []).slice(0, 3).join(' | ')}

${goalsText ? `OBJECTIFS NUTRITIONNELS:\n${goalsText}\n` : ''}${themeText}

RÈGLES POUR LA VARIATION:
1. Garder la STRUCTURE de base (même type de plat, même protéine principale)
2. VARIER les accompagnements, légumes ou mode de préparation
3. Changer le nom du plat (éviter "${avoidMenuName || baseRecipe.name}")
4. Adapter les quantités pour ${numberOfPeople} personnes
5. Maintenir l'équilibre nutritionnel

Réponds UNIQUEMENT avec un JSON valide:
{
  "nomMenu": "Nom de la variation (différent de "${baseRecipe.name}")",
  "description": "Description courte de la variation",
  "ingredients": [
    {"nom": "nom exact", "quantite": <quantité PAR PERSONNE>, "unite": "g"}
  ],
  "instructions": ["Étape 1", "Étape 2", "Étape 3"],
  "variationNote": "Note expliquant les changements apportés"
}`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Tu es un chef expert. Crée des variations culinaires créatives mais réalistes. Réponds UNIQUEMENT avec du JSON valide."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8, // Plus de créativité pour les variations
      max_tokens: 1500
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);
    
    console.log(`🎨 Variation générée: "${aiResponse.nomMenu}"`);
    console.log(`   ${aiResponse.variationNote || 'Variation créative de la recette de base'}`);
    
    return aiResponse;
    
  } catch (error) {
    console.error('❌ Erreur lors de la génération de variation:', error.message);
    // Retourner la recette de base si erreur
    return null;
  }
}

/**
 * Sélectionne une recette adaptée parmi celles disponibles (fonction de compatibilité)
 */
function selectBestRecipe(recipes, nutritionalGoals = [], avoidMenuName = null) {
  // Cette fonction est conservée pour compatibilité mais n'est plus utilisée
  // La vraie sélection se fait maintenant avec selectBestRecipeWithAI
  if (recipes.length === 0) return null;
  
  let availableRecipes = recipes;
  if (avoidMenuName) {
    availableRecipes = recipes.filter(r => 
      r.name.toLowerCase() !== avoidMenuName.toLowerCase()
    );
  }
  
  if (availableRecipes.length === 0) {
    availableRecipes = recipes;
  }
  
  const randomIndex = Math.floor(Math.random() * availableRecipes.length);
  return availableRecipes[randomIndex];
}

/**
 * Normalise une chaîne pour la comparaison (enlever accents, minuscules, espaces)
 */
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .trim();
}

/**
 * Convertit une quantité en grammes selon l'unité
 */
function convertToGrams(quantity, unit) {
  if (!quantity || quantity <= 0) return 0;
  
  const unitLower = normalizeString(unit);
  const quantityNum = parseFloat(quantity);
  
  if (unitLower.includes('kg')) return quantityNum * 1000;
  if (unitLower.includes('g')) return quantityNum;
  if (unitLower.includes('l') || unitLower.includes('litre')) return quantityNum * 1000;
  if (unitLower.includes('ml')) return quantityNum;
  if (unitLower.includes('cl')) return quantityNum * 10;
  if (unitLower.includes('pincée') || unitLower.includes('pinch')) return quantityNum * 1; // 1 pincée = 1g
  if (unitLower.includes('cuillère à café') || unitLower.includes('cuillere a cafe') || unitLower.includes('cac')) return quantityNum * 5;
  if (unitLower.includes('cuillère à soupe') || unitLower.includes('cuillere a soupe') || unitLower.includes('cas')) return quantityNum * 15;
  if (unitLower.includes('verre')) return quantityNum * 250;
  if (unitLower.includes('pièce') || unitLower.includes('piece')) return quantityNum * 100; // Approximation par défaut
  if (unitLower.includes('unité') || unitLower.includes('unite')) return quantityNum * 100; // Approximation par défaut
  
  // Par défaut, retourner la quantité telle quelle (on suppose que c'est en grammes)
  return quantityNum;
}

/**
 * Vérifie si une recette peut être réalisée avec le stock disponible
 * @param {Object} recipe - La recette à vérifier
 * @param {Array} stockItems - Les articles en stock
 * @param {number} numberOfPeople - Nombre de personnes
 * @returns {Object} { available: boolean, missingIngredients: Array, availableIngredients: Array }
 */
function checkRecipeStockAvailability(recipe, stockItems, numberOfPeople) {
  if (!recipe.ingredients || recipe.ingredients.length === 0) {
    return { available: false, missingIngredients: [], availableIngredients: [], reason: 'Aucun ingrédient dans la recette' };
  }
  
  if (!stockItems || stockItems.length === 0) {
    return { available: false, missingIngredients: recipe.ingredients.map(ing => ing.name), availableIngredients: [], reason: 'Aucun stock disponible' };
  }
  
  // Calculer le multiplicateur pour le nombre de personnes
  const baseServings = recipe.servings || 4;
  const servingMultiplier = numberOfPeople / baseServings;
  
  const missingIngredients = [];
  const availableIngredients = [];
  
  for (const recipeIngredient of recipe.ingredients) {
    const recipeIngredientName = normalizeString(recipeIngredient.name);
    const recipeQuantity = (recipeIngredient.quantity || 0) * servingMultiplier;
    const recipeUnit = recipeIngredient.unit || 'g';
    
    // Chercher dans le stock
    let found = false;
    let sufficient = false;
    
    for (const stockItem of stockItems) {
      const stockName = normalizeString(stockItem.name);
      
      // Vérifier si les noms correspondent (correspondance flexible)
      const match = stockName === recipeIngredientName ||
                   stockName.includes(recipeIngredientName) ||
                   recipeIngredientName.includes(stockName) ||
                   stockName.split(/\s+/).some(word => recipeIngredientName.includes(word) && word.length > 3) ||
                   recipeIngredientName.split(/\s+/).some(word => stockName.includes(word) && word.length > 3);
      
      if (match) {
        found = true;
        // Convertir les quantités en grammes pour comparer
        const stockQuantityInGrams = convertToGrams(stockItem.quantity, stockItem.unit);
        const neededQuantityInGrams = convertToGrams(recipeQuantity, recipeUnit);
        
        if (stockQuantityInGrams >= neededQuantityInGrams) {
          sufficient = true;
          availableIngredients.push({
            name: recipeIngredient.name,
            needed: recipeQuantity,
            unit: recipeUnit,
            available: stockItem.quantity,
            stockUnit: stockItem.unit
          });
        } else {
          // Stock insuffisant
          availableIngredients.push({
            name: recipeIngredient.name,
            needed: recipeQuantity,
            unit: recipeUnit,
            available: stockItem.quantity,
            stockUnit: stockItem.unit,
            sufficient: false
          });
        }
        break;
      }
    }
    
    if (!found) {
      missingIngredients.push({
        name: recipeIngredient.name,
        needed: recipeQuantity,
        unit: recipeUnit
      });
    } else if (!sufficient) {
      // Trouvé mais quantité insuffisante
      missingIngredients.push({
        name: recipeIngredient.name,
        needed: recipeQuantity,
        unit: recipeUnit,
        reason: 'quantité_insuffisante'
      });
    }
  }
  
  return {
    available: missingIngredients.length === 0,
    missingIngredients,
    availableIngredients,
    missingCount: missingIngredients.length
  };
}

/**
 * Filtre les recettes selon le stock disponible
 * @param {Array} recipes - Liste des recettes
 * @param {Array} stockItems - Articles en stock
 * @param {number} numberOfPeople - Nombre de personnes
 * @returns {Array} Recettes qui peuvent être réalisées avec le stock
 */
function filterRecipesByStock(recipes, stockItems, numberOfPeople) {
  if (!stockItems || stockItems.length === 0) {
    console.log('⚠️  Aucun stock disponible, toutes les recettes seront exclues');
    return [];
  }
  
  const availableRecipes = [];
  
  for (const recipe of recipes) {
    const stockCheck = checkRecipeStockAvailability(recipe, stockItems, numberOfPeople);
    if (stockCheck.available) {
      availableRecipes.push({
        ...recipe,
        _stockCheck: stockCheck
      });
    }
  }
  
  console.log(`📦 ${availableRecipes.length} recettes disponibles avec le stock sur ${recipes.length} total`);
  return availableRecipes;
}

export async function generateCustomMenu({
  numberOfPeople = 4,
  mealType = 'déjeuner',
  nutritionalGoals = [],
  dietaryRestrictions = [],
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
  stockItems = []
}) {
  console.log(`\n🎯 Génération d'un menu personnalisé...`);
  console.log(`   👥 ${numberOfPeople} personnes`);
  console.log(`   🍽️  Type : ${mealType}`);
  if (forceVariation && avoidMenuName) {
    console.log(`   🔄 Forcer une variation (éviter: "${avoidMenuName}")`);
  }
  
  // Les objectifs nutritionnels sont optionnels
  if (nutritionalGoals.length > 0) {
    // Afficher les objectifs
    console.log(`   🎯 Objectifs nutritionnels :`);
    nutritionalGoals.forEach(goal => {
      console.log(`      - ${goal.label} : ${goal.target}${goal.unit} par personne`);
    });
    
    // Construire la liste d'ingrédients recommandés pour chaque nutriment (pour les logs)
    nutritionalGoals.forEach(goal => {
      const minValue = goal.minIngredientValue || 5;
      const ingredients = getIngredientsByNutrient(goal.nutrient, minValue);
      console.log(`\n📊 ${ingredients.length} ingrédients riches en ${goal.label}`);
      console.log(`   Top 5 :`);
      ingredients.slice(0, 5).forEach(ing => {
        console.log(`   - ${ing.name}: ${ing.value}${goal.unit}/100g`);
      });
    });
  } else {
    console.log(`   🎯 Aucun objectif nutritionnel spécifié - génération d'un menu varié et équilibré`);
  }
  
  if (dietaryRestrictions.length > 0) {
    console.log(`   ⚠️  Restrictions : ${dietaryRestrictions.join(', ')}`);
  }
  
  // ========== RÉCUPÉRER LES RECETTES DE MONGODB ==========
  console.log(`\n📚 Recherche de recettes dans MongoDB...`);
  
  // Construire les filtres de recherche
  const recipeFilters = buildRecipeFilters({
    mealType,
    dietaryRestrictions,
    weekdayTheme,
    dynamicBanProteins,
    avoidMenuName,
    filtersAsPreferences,
    nutritionalGoals
  });
  
  console.log(`🔍 Filtres de recherche:`, JSON.stringify(recipeFilters, null, 2));
  
  // Récupérer les recettes compatibles
  let compatibleRecipes = await RecipeEnriched.find(recipeFilters);
  console.log(`✅ ${compatibleRecipes.length} recettes trouvées`);
  
  // Si pas de résultats avec filtres stricts, essayer avec filtres assouplis
  if (compatibleRecipes.length === 0 && filtersAsPreferences) {
    console.log(`⚠️  Aucune recette trouvée avec filtres stricts, assouplissement...`);
    // Réessayer avec seulement la catégorie et les exclusions strictes
    const relaxedFilters = {
      category: recipeFilters.category
    };
    if (dynamicBanProteins && dynamicBanProteins.length > 0) {
      dynamicBanProteins.forEach(protein => {
        const proteinLower = protein.toLowerCase();
        relaxedFilters.$and = (relaxedFilters.$and || []).concat([
          { name: { $not: { $regex: proteinLower, $options: 'i' } } }
        ]);
      });
    }
    if (avoidMenuName) {
      relaxedFilters.name = { $ne: avoidMenuName };
    }
    compatibleRecipes = await RecipeEnriched.find(relaxedFilters);
    console.log(`✅ ${compatibleRecipes.length} recettes trouvées avec filtres assouplis`);
  }
  
  // Si toujours aucun résultat, prendre n'importe quelle recette de la catégorie
  if (compatibleRecipes.length === 0) {
    console.log(`⚠️  Aucune recette compatible, sélection parmi toutes les recettes de la catégorie...`);
    const fallbackFilters = { category: recipeFilters.category };
    if (avoidMenuName) {
      fallbackFilters.name = { $ne: avoidMenuName };
    }
    compatibleRecipes = await RecipeEnriched.find(fallbackFilters).limit(100);
    console.log(`✅ ${compatibleRecipes.length} recettes disponibles pour fallback`);
  }
  
  if (compatibleRecipes.length === 0) {
    throw new Error('Aucune recette disponible dans la base de données pour ce type de repas');
  }
  
  // ========== FILTRER PAR STOCK SI ACTIVÉ ==========
  if (useStockOnly && stockItems && stockItems.length > 0) {
    console.log(`\n📦 Filtrage des recettes selon le stock disponible...`);
    console.log(`   ${stockItems.length} articles en stock`);
    console.log(`   ${compatibleRecipes.length} recettes avant filtrage`);
    
    const filteredRecipes = filterRecipesByStock(compatibleRecipes, stockItems, numberOfPeople);
    
    if (filteredRecipes.length === 0) {
      throw new Error(`Aucune recette disponible avec le stock actuel pour ${numberOfPeople} personnes. Veuillez ajouter des articles au stock ou désactiver l'option "Stock uniquement".`);
    }
    
    compatibleRecipes = filteredRecipes;
    console.log(`✅ ${compatibleRecipes.length} recettes peuvent être réalisées avec le stock disponible`);
  } else if (useStockOnly) {
    throw new Error('Mode "Stock uniquement" activé mais aucun stock disponible. Veuillez ajouter des articles au stock.');
  }
  
  // Sélectionner intelligemment une recette avec l'IA
  const selectedRecipe = await selectBestRecipeWithAI(
    compatibleRecipes,
    nutritionalGoals,
    avoidMenuName,
    mealType,
    numberOfPeople,
    weekdayTheme,
    useStockOnly,
    stockItems
  );
  
  if (!selectedRecipe) {
    throw new Error('Erreur lors de la sélection d\'une recette');
  }
  
  console.log(`\n✅ Recette sélectionnée: "${selectedRecipe.name}"`);
  console.log(`   Catégorie: ${selectedRecipe.category}`);
  console.log(`   Ingrédients: ${selectedRecipe.ingredients?.length || 0}`);
  
  // Si forceVariation est activé, générer une variation avec l'IA
  let menuData;
  let useVariation = false;
  
  if (forceVariation && avoidMenuName) {
    console.log(`\n🎨 Génération d'une variation avec l'IA...`);
    const variation = await generateRecipeVariation(
      selectedRecipe,
      avoidMenuName,
      numberOfPeople,
      mealType,
      nutritionalGoals,
      weekdayTheme
    );
    
    if (variation && variation.nomMenu) {
      // Utiliser la variation générée par l'IA
      useVariation = true;
      menuData = {
        nomMenu: variation.nomMenu,
        description: variation.description || variation.nomMenu,
        ingredients: variation.ingredients || [],
        instructions: variation.instructions || selectedRecipe.preparationSteps || ['Préparer selon la recette de base.'],
        tempsCuisson: selectedRecipe.cookingTime || selectedRecipe.tempsCuisson || '30 min',
        difficulte: selectedRecipe.difficulty || selectedRecipe.difficulte || 'Moyenne',
        isVariation: true,
        variationNote: variation.variationNote
      };
      console.log(`✅ Variation créée: "${menuData.nomMenu}"`);
    } else {
      console.log(`⚠️  Erreur lors de la génération de variation, utilisation de la recette originale`);
    }
  }
  
  // Si pas de variation, utiliser la recette MongoDB sélectionnée
  let adaptedIngredients;
  
  if (!useVariation) {
    // Convertir la recette MongoDB au format attendu
    // Les recettes n'ont pas toujours de servings défini, on utilise une base de 4
    const baseServings = 4; // Base standard pour les recettes
    const servingMultiplier = numberOfPeople / baseServings;
    
    // Adapter les ingrédients au nombre de personnes
    adaptedIngredients = (selectedRecipe.ingredients || []).map(ing => {
      const quantityPerPerson = (ing.quantity || 0) * servingMultiplier / numberOfPeople;
      const quantityTotal = (ing.quantity || 0) * servingMultiplier;
      
      return {
        nom: ing.name,
        unite: ing.unit || 'g',
        quantiteParPersonne: Math.round(quantityPerPerson * 10) / 10,
        quantiteTotal: Math.round(quantityTotal * 10) / 10
      };
    });
    
    // Construire le menu depuis la recette MongoDB
    menuData = {
      nomMenu: selectedRecipe.name,
      description: selectedRecipe.description || selectedRecipe.name,
      ingredients: adaptedIngredients.map(ing => ({
        nom: ing.nom,
        quantite: ing.quantiteParPersonne,
        unite: ing.unite
      })),
      instructions: selectedRecipe.preparationSteps || selectedRecipe.instructions || ['Préparer selon la recette de base.'],
      tempsCuisson: selectedRecipe.cookingTime || selectedRecipe.tempsCuisson || '30 min',
      difficulte: selectedRecipe.difficulty || selectedRecipe.difficulte || 'Moyenne'
    };
  } else {
    // Pour les variations, les ingrédients viennent déjà de l'IA
    adaptedIngredients = (menuData.ingredients || []).map(ing => ({
      nom: ing.nom,
      unite: ing.unite || 'g',
      quantiteParPersonne: parseFloat(ing.quantite) || 0,
      quantiteTotal: (parseFloat(ing.quantite) || 0) * numberOfPeople
    }));
  }
  
  // Calculer les valeurs nutritionnelles
  const enrichedIngredients = adaptedIngredients.map(ing => {
    const ingredientData = getIngredientData(ing.nom);
    if (!ingredientData) {
      console.log(`⚠️  Ingrédient "${ing.nom}" non trouvé dans la database`);
      return null;
    }
    
    // Calculer les valeurs nutritionnelles pour la quantité totale
    const factor = ing.quantiteTotal / 100;
    
    const nutritionCalculated = {};
    for (const [key, value] of Object.entries(ingredientData.nutritionalValues)) {
      nutritionCalculated[key] = (value || 0) * factor;
    }
    
    return {
      nom: ing.nom,
      unite: ing.unite,
      quantiteParPersonne: ing.quantiteParPersonne,
      quantiteTotal: ing.quantiteTotal,
      nutritionalValues: ingredientData.nutritionalValues,
      calculated: nutritionCalculated
    };
  }).filter(ing => ing !== null);
  
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
    source: useVariation ? 'mongodb+ai-variation' : 'mongodb+ai-selection',
    recipeId: useVariation ? null : selectedRecipe._id,
    baseRecipeId: useVariation ? selectedRecipe._id : null
  };
}

// ========== ANCIEN CODE (GÉNÉRATION VIA IA) - DÉSACTIVÉ ==========
/*
  // Construire le prompt dynamique
  const goalsText = nutritionalGoals.length > 0 
    ? nutritionalGoals.map(goal => 
        `- ${goal.label} : minimum ${goal.target}${goal.unit} par personne`
      ).join('\n')
    : 'Aucun objectif nutritionnel spécifique. Le menu doit être varié, équilibré et appétissant.';
  
  const ingredientsSections = nutritionalGoals.length > 0
    ? nutritionalGoals.map(goal => {
        const minValue = goal.minIngredientValue || 5;
        const ingredients = getIngredientsByNutrient(goal.nutrient, minValue);
        const list = ingredients
          .slice(0, 15)
          .map(i => `${i.name} (${i.value}${goal.unit}/100g)`)
          .join('\n');
        
        return `INGRÉDIENTS RICHES EN ${goal.label.toUpperCase()} DISPONIBLES:\n${list}`;
      }).join('\n\n')
    : 'Tu as accès à tout le catalogue de recettes. Varie les protéines (viandes, poissons, légumineuses), légumes et féculents pour créer un menu équilibré et appétissant.';
  
  const restrictionsText = dietaryRestrictions.length > 0 
    ? `RESTRICTIONS ALIMENTAIRES: ${dietaryRestrictions.join(', ')}` 
    : '';
  
  const variationText = forceVariation && avoidMenuName
    ? `⚠️ IMPORTANT: Tu as DÉJÀ proposé "${avoidMenuName}".
Tu DOIS créer un menu COMPLÈTEMENT DIFFÉRENT avec:
- Un nom de plat différent
- Des ingrédients principaux différents (si possible)
- Une présentation/cuisson différente
NE RÉPÈTE PAS le menu précédent !`
    : '';
  
  const prompt = `Tu es un chef cuisinier professionnel spécialisé dans les repas nutritifs pour établissements de santé (EHPAD, hôpitaux).

MISSION: Compose un ${mealType} CLASSIQUE et ÉQUILIBRÉ pour ${numberOfPeople} personnes.

${nutritionalGoals.length > 0 ? 'OBJECTIFS NUTRITIONNELS PRIORITAIRES:\n' : ''}${goalsText}

${restrictionsText ? restrictionsText + '\n\n' : ''}${variationText ? variationText + '\n\n' : ''}${ingredientsSections ? ingredientsSections + '\n\n' : ''}${nutritionalGoals.length > 0 ? 'Tu peux aussi utiliser d\'autres légumes, féculents, viandes, poissons et condiments pour compléter le menu.\n\n' : ''}

RÈGLES STRICTES:
1. UTILISE UN NOM DE PLAT CLASSIQUE ET SIMPLE (ex: "Poulet rôti aux légumes", "Saumon grillé et riz", "Salade composée")
2. ÉVITE les noms poétiques, métaphores ou descriptions trop créatives
3. CHOISIS DES ASSOCIATIONS D'INGRÉDIENTS TRADITIONNELLES ET LOGIQUES
${nutritionalGoals.length > 0 ? '4. PRIVILÉGIE des ingrédients qui répondent aux objectifs nutritionnels' : '4. VARIE les ingrédients pour créer un menu équilibré et appétissant (protéines variées, légumes de saison, féculents)'}
5. ⚠️ IMPORTANT: Les quantités doivent être PAR PERSONNE (portions individuelles)
   Exemple: Pour du poulet, indique environ 150g (quantité par personne)
${nutritionalGoals.length > 0 ? '6. Les quantités doivent être RÉALISTES et GÉNÉREUSES pour atteindre les objectifs nutritionnels' : '6. Les quantités doivent être RÉALISTES et GÉNÉREUSES pour un repas équilibré'}
7. Le plat doit être APPÉTISSANT, ÉQUILIBRÉ et RECONNAISSABLE

EXEMPLES DE NOMS ACCEPTABLES:
- "Poulet grillé aux poivrons et brocolis"
- "Saumon aux épinards et lentilles"
- "Bœuf braisé aux carottes et quinoa"
- "Salade composée aux agrumes"

FORMAT DE RÉPONSE (JSON):
{
  "nomMenu": "Nom simple et classique du plat",
  "description": "Description courte et réaliste (1 ligne)",
  "ingredients": [
    {
      "nom": "nom exact de l'ingrédient",
      "quantite": 150,
      "unite": "g"
    }
  ],
  "instructions": [
    "Étape 1 - action claire",
    "Étape 2 - action claire"
  ],
  "tempsCuisson": "30 min",
  "difficulte": "Facile"
}

⚠️ RAPPEL: Dans "quantite", indique la portion PAR PERSONNE (ex: 150g de poulet par personne).
Le système multipliera automatiquement par ${numberOfPeople} pour obtenir la quantité totale.

IMPORTANT: Réponds UNIQUEMENT avec le JSON valide, sans texte avant ou après, sans markdown.`;

  console.log(`\n🤖 Appel à l'IA OpenAI...`);
  
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: forceVariation ? 0.9 : 0.7,  // Plus de créativité pour les variations
      max_tokens: 2000,
    });

    const aiResponse = completion.choices[0].message.content;
    console.log(`\n✅ Réponse IA reçue\n`);
    
    // Parser la réponse
    let menuData;
    try {
      const cleanResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      menuData = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('❌ Erreur de parsing JSON:', parseError.message);
      console.log('Réponse brute:', aiResponse);
      throw parseError;
    }
    
    // Calculer les valeurs nutritionnelles réelles
    console.log(`📊 Calcul des valeurs nutritionnelles réelles...\n`);
    
    const enrichedIngredients = menuData.ingredients.map(ing => {
      const ingredientData = getIngredientData(ing.nom);
      if (!ingredientData) {
        console.log(`⚠️  Ingrédient "${ing.nom}" non trouvé dans la database`);
        return null;
      }
      
      // L'IA génère les quantités PAR PERSONNE (comme demandé dans le prompt)
      const quantityPerPerson = parseFloat(ing.quantite) || 100;
      
      console.log(`🔍 [BACKEND] Ingrédient "${ing.nom}": quantite de l'IA (PAR PERSONNE) = ${ing.quantite}, numberOfPeople = ${numberOfPeople}`);
      
      // Calculer la quantité TOTALE en multipliant par le nombre de personnes
      const quantityTotal = quantityPerPerson * numberOfPeople;
      
      console.log(`🔍 [BACKEND] → quantityPerPerson = ${quantityPerPerson}, quantityTotal = ${quantityTotal}`);
      
      // Calculer les valeurs nutritionnelles pour la quantité TOTALE
      const factor = quantityTotal / 100;
      
      const nutritionCalculated = {};
      for (const [key, value] of Object.entries(ingredientData.nutritionalValues)) {
        nutritionCalculated[key] = (value || 0) * factor;
      }
      
      // Construire l'objet final avec SEULEMENT les propriétés dont on a besoin
      return {
        nom: ing.nom,
        unite: ing.unite,
        quantiteParPersonne: quantityPerPerson,  // Quantité par personne (150g)
        quantiteTotal: quantityTotal,             // Quantité totale (150 × 42 = 6300g)
        nutritionalValues: ingredientData.nutritionalValues,
        calculated: nutritionCalculated
      };
    }).filter(ing => ing !== null);
    
    // Calculer les totaux pour tous les nutriments
    const totals = {};
    enrichedIngredients.forEach(ing => {
      for (const [key, value] of Object.entries(ing.calculated)) {
        totals[key] = (totals[key] || 0) + value;
      }
    });
    
    // Préparer les résultats
    const nutrition = {
      total: totals,
      perPerson: {}
    };
    
    for (const [key, value] of Object.entries(totals)) {
      nutrition.perPerson[key] = value / numberOfPeople;
    }
    
    // Log pour vérifier ce qu'on retourne
    console.log('📤 [BACKEND] Exemple d\'ingrédient retourné:', JSON.stringify(enrichedIngredients[0], null, 2));
    
    return {
      menu: menuData,
      nutrition: nutrition,
      numberOfPeople: numberOfPeople,
      nutritionalGoals: nutritionalGoals,
      ingredients: enrichedIngredients
    };
    
  } catch (error) {
    console.error('\n❌ Erreur lors de l\'appel OpenAI:', error.message);
    throw error;
  }
}
*/

/**
 * Affiche le menu de manière formatée
 */
export function displayMenu(result) {
  const { menu, nutrition, numberOfPeople, nutritionalGoals, ingredients } = result;
  
  console.log('='.repeat(70));
  console.log(`🍽️  ${menu.nomMenu.toUpperCase()}`);
  console.log('='.repeat(70));
  console.log(`\n📝 ${menu.description}\n`);
  console.log(`👥 Pour ${numberOfPeople} personnes`);
  console.log(`⏱️  Temps de cuisson : ${menu.tempsCuisson}`);
  console.log(`📊 Difficulté : ${menu.difficulte}`);
  
  console.log(`\n🥘 INGRÉDIENTS:`);
  ingredients.forEach(ing => {
    const nutrientInfo = nutritionalGoals.map(goal => {
      const value = ing.calculated[goal.nutrient] || 0;
      return `${value.toFixed(1)}${goal.unit} ${goal.label.toLowerCase()}`;
    }).join(', ');
    console.log(`   • ${ing.nom}: ${ing.quantite}${ing.unite} (${nutrientInfo})`);
  });
  
  console.log(`\n👨‍🍳 INSTRUCTIONS:`);
  menu.instructions.forEach((instruction, index) => {
    console.log(`   ${index + 1}. ${instruction}`);
  });
  
  console.log(`\n📊 VALEURS NUTRITIONNELLES TOTALES (${numberOfPeople} pers.):`);
  console.log(`   • Calories : ${Math.round(nutrition.total.calories || 0)} kcal`);
  console.log(`   • Protéines : ${(nutrition.total.proteins || 0).toFixed(1)} g`);
  console.log(`   • Glucides : ${(nutrition.total.carbs || 0).toFixed(1)} g`);
  console.log(`   • Lipides : ${(nutrition.total.lipids || 0).toFixed(1)} g`);
  console.log(`   • Fibres : ${(nutrition.total.fibers || 0).toFixed(1)} g`);
  
  // Afficher les nutriments des objectifs
  nutritionalGoals.forEach(goal => {
    const value = nutrition.total[goal.nutrient] || 0;
    console.log(`   • ${goal.label} : ${value.toFixed(1)} ${goal.unit}`);
  });
  
  console.log(`\n📊 VALEURS NUTRITIONNELLES PAR PERSONNE:`);
  console.log(`   • Calories : ${(nutrition.perPerson.calories || 0).toFixed(1)} kcal`);
  console.log(`   • Protéines : ${(nutrition.perPerson.proteins || 0).toFixed(1)} g`);
  console.log(`   • Glucides : ${(nutrition.perPerson.carbs || 0).toFixed(1)} g`);
  console.log(`   • Lipides : ${(nutrition.perPerson.lipids || 0).toFixed(1)} g`);
  console.log(`   • Fibres : ${(nutrition.perPerson.fibers || 0).toFixed(1)} g`);
  
  // Vérifier les objectifs
  let allGoalsMet = true;
  nutritionalGoals.forEach(goal => {
    const value = nutrition.perPerson[goal.nutrient] || 0;
    const met = value >= goal.target;
    const icon = met ? '✅' : '⚠️';
    console.log(`   • ${goal.label} : ${value.toFixed(1)} ${goal.unit} ${icon}`);
    if (!met) allGoalsMet = false;
  });
  
  console.log('\n' + '='.repeat(70));
  
  if (allGoalsMet) {
    console.log('✅ Tous les objectifs nutritionnels sont atteints !');
  } else {
    console.log('⚠️  Certains objectifs ne sont pas atteints');
  }
  
  console.log('='.repeat(70) + '\n');
}

