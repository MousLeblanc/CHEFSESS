// scripts/generate-custom-menu.js
// Générateur de menu UNIVERSEL avec critères nutritionnels personnalisables

import dotenv from 'dotenv';
import { ingredientsDatabase, getIngredientData } from './ingredients-database.js';
import RecipeEnriched from '../models/Recipe.js';
import openai from '../services/openaiClient.js';

dotenv.config();

// ========== SAISONNALITÉ INTELLIGENTE ==========
// Tableau des produits de saison par mois (France/Belgique)
// Source: calendrier des fruits et légumes de saison
const SEASONAL_PRODUCTS = {
  // Janvier - Hiver
  1: {
    legumes: ['carotte', 'chou', 'chou-fleur', 'chou de bruxelles', 'endive', 'épinard', 'mâche', 'navet', 'panais', 'poireau', 'pomme de terre', 'potiron', 'courge', 'betterave', 'céleri', 'topinambour', 'salsifis', 'rutabaga'],
    fruits: ['pomme', 'poire', 'kiwi', 'orange', 'clémentine', 'mandarine', 'citron', 'pamplemousse'],
    proteines: ['poulet', 'dinde', 'porc', 'boeuf', 'veau', 'lapin', 'canard', 'cabillaud', 'merlu', 'lieu', 'sole', 'raie']
  },
  // Février - Hiver
  2: {
    legumes: ['carotte', 'chou', 'chou-fleur', 'endive', 'épinard', 'mâche', 'navet', 'panais', 'poireau', 'pomme de terre', 'courge', 'betterave', 'céleri', 'topinambour'],
    fruits: ['pomme', 'poire', 'kiwi', 'orange', 'clémentine', 'citron', 'pamplemousse'],
    proteines: ['poulet', 'dinde', 'porc', 'boeuf', 'veau', 'lapin', 'cabillaud', 'merlu', 'lieu', 'sole']
  },
  // Mars - Fin hiver/début printemps
  3: {
    legumes: ['carotte', 'chou', 'endive', 'épinard', 'mâche', 'navet', 'poireau', 'pomme de terre', 'radis', 'asperge'],
    fruits: ['pomme', 'poire', 'kiwi', 'orange', 'citron'],
    proteines: ['poulet', 'agneau', 'veau', 'lapin', 'cabillaud', 'merlu', 'bar', 'turbot']
  },
  // Avril - Printemps
  4: {
    legumes: ['asperge', 'carotte', 'épinard', 'radis', 'petit pois', 'artichaut', 'laitue', 'cresson', 'oseille', 'blette'],
    fruits: ['pomme', 'rhubarbe', 'fraise'],
    proteines: ['poulet', 'agneau', 'veau', 'lapin', 'bar', 'turbot', 'maquereau']
  },
  // Mai - Printemps
  5: {
    legumes: ['asperge', 'carotte', 'épinard', 'petit pois', 'artichaut', 'laitue', 'radis', 'concombre', 'courgette', 'haricot vert', 'fève'],
    fruits: ['fraise', 'cerise', 'rhubarbe'],
    proteines: ['poulet', 'agneau', 'veau', 'lapin', 'bar', 'turbot', 'maquereau', 'sardine']
  },
  // Juin - Été
  6: {
    legumes: ['artichaut', 'aubergine', 'carotte', 'concombre', 'courgette', 'haricot vert', 'petit pois', 'poivron', 'tomate', 'laitue', 'radis', 'fenouil', 'betterave'],
    fruits: ['fraise', 'framboise', 'cerise', 'abricot', 'melon', 'pêche', 'nectarine'],
    proteines: ['poulet', 'agneau', 'lapin', 'sardine', 'maquereau', 'thon', 'dorade']
  },
  // Juillet - Été
  7: {
    legumes: ['aubergine', 'carotte', 'concombre', 'courgette', 'haricot vert', 'poivron', 'tomate', 'laitue', 'maïs', 'fenouil', 'betterave', 'artichaut'],
    fruits: ['fraise', 'framboise', 'groseille', 'cassis', 'myrtille', 'abricot', 'melon', 'pêche', 'nectarine', 'prune', 'pastèque'],
    proteines: ['poulet', 'lapin', 'sardine', 'maquereau', 'thon', 'dorade', 'rouget']
  },
  // Août - Été
  8: {
    legumes: ['aubergine', 'carotte', 'concombre', 'courgette', 'haricot vert', 'poivron', 'tomate', 'laitue', 'maïs', 'fenouil', 'betterave', 'brocoli'],
    fruits: ['framboise', 'mûre', 'myrtille', 'melon', 'pêche', 'nectarine', 'prune', 'mirabelle', 'raisin', 'figue', 'pastèque'],
    proteines: ['poulet', 'lapin', 'sardine', 'maquereau', 'thon', 'dorade', 'rouget']
  },
  // Septembre - Automne
  9: {
    legumes: ['aubergine', 'carotte', 'chou', 'courgette', 'haricot vert', 'poivron', 'tomate', 'potiron', 'courge', 'brocoli', 'épinard', 'fenouil', 'betterave', 'céleri'],
    fruits: ['pomme', 'poire', 'raisin', 'prune', 'figue', 'melon', 'mûre', 'framboise', 'noisette', 'noix'],
    proteines: ['poulet', 'dinde', 'porc', 'boeuf', 'lapin', 'canard', 'bar', 'dorade', 'maquereau']
  },
  // Octobre - Automne
  10: {
    legumes: ['carotte', 'chou', 'chou-fleur', 'courge', 'potiron', 'potimarron', 'épinard', 'navet', 'panais', 'poireau', 'brocoli', 'betterave', 'céleri', 'fenouil', 'endive'],
    fruits: ['pomme', 'poire', 'raisin', 'coing', 'châtaigne', 'noix', 'noisette', 'kaki'],
    proteines: ['poulet', 'dinde', 'porc', 'boeuf', 'lapin', 'canard', 'bar', 'dorade', 'cabillaud']
  },
  // Novembre - Automne/Hiver
  11: {
    legumes: ['carotte', 'chou', 'chou-fleur', 'chou de bruxelles', 'courge', 'potiron', 'épinard', 'mâche', 'navet', 'panais', 'poireau', 'betterave', 'céleri', 'endive', 'topinambour'],
    fruits: ['pomme', 'poire', 'kiwi', 'orange', 'clémentine', 'mandarine', 'châtaigne', 'noix'],
    proteines: ['poulet', 'dinde', 'porc', 'boeuf', 'canard', 'lapin', 'cabillaud', 'merlu', 'lieu']
  },
  // Décembre - Hiver
  12: {
    legumes: ['carotte', 'chou', 'chou-fleur', 'chou de bruxelles', 'endive', 'épinard', 'mâche', 'navet', 'panais', 'poireau', 'pomme de terre', 'potiron', 'courge', 'betterave', 'céleri', 'topinambour', 'salsifis'],
    fruits: ['pomme', 'poire', 'kiwi', 'orange', 'clémentine', 'mandarine', 'citron', 'pamplemousse', 'châtaigne', 'noix'],
    proteines: ['poulet', 'dinde', 'porc', 'boeuf', 'veau', 'canard', 'oie', 'chapon', 'cabillaud', 'merlu', 'lieu', 'sole', 'huître', 'coquille saint-jacques']
  }
};

/**
 * Vérifie si un ingrédient est de saison pour le mois actuel
 * @param {string} ingredientName - Nom de l'ingrédient
 * @param {number} month - Mois (1-12), par défaut mois actuel
 * @returns {boolean} true si l'ingrédient est de saison
 */
function isIngredientSeasonal(ingredientName, month = null) {
  const currentMonth = month || (new Date().getMonth() + 1);
  const seasonalData = SEASONAL_PRODUCTS[currentMonth];
  
  if (!seasonalData) return true; // Si pas de données, considérer comme OK
  
  const normalizedName = ingredientName.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  
  // Vérifier dans toutes les catégories
  const allSeasonal = [
    ...seasonalData.legumes,
    ...seasonalData.fruits,
    ...seasonalData.proteines
  ];
  
  // Vérification flexible (contient ou est contenu)
  return allSeasonal.some(seasonal => {
    const normalizedSeasonal = seasonal.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    return normalizedName.includes(normalizedSeasonal) || normalizedSeasonal.includes(normalizedName);
  });
}

/**
 * Calcule le score de saisonnalité d'une recette
 * @param {Object} recipe - Recette avec ingrédients
 * @param {number} month - Mois (1-12)
 * @returns {Object} { score: 0-100, seasonalIngredients: [], nonSeasonalIngredients: [] }
 */
function calculateSeasonalityScore(recipe, month = null) {
  const currentMonth = month || (new Date().getMonth() + 1);
  const ingredients = recipe.ingredients || [];
  
  if (ingredients.length === 0) {
    return { score: 100, seasonalIngredients: [], nonSeasonalIngredients: [], allSeasonal: true };
  }
  
  const seasonalIngredients = [];
  const nonSeasonalIngredients = [];
  
  // Ingrédients neutres (toujours disponibles, pas de saison spécifique)
  const neutralIngredients = ['sel', 'poivre', 'huile', 'beurre', 'crème', 'lait', 'farine', 'sucre', 'oeuf', 'œuf', 'riz', 'pâte', 'pain', 'eau', 'vinaigre', 'moutarde', 'ail', 'oignon', 'échalote', 'persil', 'thym', 'laurier', 'romarin', 'basilic', 'coriandre', 'curry', 'paprika', 'cumin'];
  
  for (const ing of ingredients) {
    const name = (ing.name || '').toLowerCase();
    
    // Ignorer les ingrédients neutres
    const isNeutral = neutralIngredients.some(n => name.includes(n));
    if (isNeutral) continue;
    
    if (isIngredientSeasonal(name, currentMonth)) {
      seasonalIngredients.push(name);
    } else {
      nonSeasonalIngredients.push(name);
    }
  }
  
  const totalRelevant = seasonalIngredients.length + nonSeasonalIngredients.length;
  const score = totalRelevant > 0 ? Math.round((seasonalIngredients.length / totalRelevant) * 100) : 100;
  
  return {
    score,
    seasonalIngredients,
    nonSeasonalIngredients,
    allSeasonal: nonSeasonalIngredients.length === 0,
    month: currentMonth,
    monthName: getMonthName(currentMonth)
  };
}

/**
 * Retourne le nom du mois en français
 */
function getMonthName(month) {
  const months = ['', 'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  return months[month] || '';
}

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
  avoidMenuNames = [], // Liste de tous les menus à éviter
  filtersAsPreferences = true,
  nutritionalGoals = [],
  ageGroups = [] // ✅ AJOUTÉ: Groupes d'âge pour filtre alcool
}) {
  const filters = {};
  
  // Filtrer par catégorie selon le type de repas
  // ✅ MODIFIÉ: Pour le déjeuner, EXIGER des PLATS COMPLETS AVEC PROTÉINES
  if (mealType === 'déjeuner' || mealType === 'dîner') {
    // Catégories acceptées
    filters.category = { $in: ['plat', 'plat_complet', 'Plat Principal', 'viande', 'poisson', 'volaille'] };
    
    if (!filters.$and) filters.$and = [];
    
    // 🚫 CRITIQUE SÉCURITÉ ENFANTS: Exclure les recettes avec ALCOOL
    // Vérifier si on cuisine pour des enfants (maternelle, primaire, collège, lycée)
    const childAgeGroups = ['maternelle', 'primaire', 'primaire_cp_ce1', 'primaire_ce2_cm1', 'primaire_cm2', 'college', 'lycee', 'secondaire'];
    const isForChildren = ageGroups && ageGroups.some(g => childAgeGroups.includes(g.ageRange));
    
    if (isForChildren) {
      // Vin, bière, liqueurs = INTERDIT pour les cantines scolaires
      const alcoholKeywords = /vin rouge|vin blanc|vin |au vin|wine|bière|beer|alcool|alcohol|cognac|calvados|armagnac|rhum|rum|whisky|vodka|liqueur|porto|madère|marsala|champagne|cidre alcool|coq au vin|boeuf bourguignon/i;
      
      filters.$and.push(
        // Exclure les recettes avec alcool dans le nom
        { name: { $not: { $regex: alcoholKeywords } } },
        // Exclure les recettes avec alcool dans la description
        { description: { $not: { $regex: alcoholKeywords } } }
      );
      
      console.log(`   🚫 MODE ENFANTS: Recettes avec ALCOOL exclues (coq au vin, boeuf bourguignon, etc.)`);
      
      // ✅ NOUVEAU: EXCLURE les VIANDES ROUGES pour enfants (santé + environnement)
      // Boeuf, veau, agneau, mouton = riches en graisses saturées + forte empreinte carbone
      const redMeatKeywords = /boeuf|bœuf|veau|agneau|mouton|entrecôte|côte de boeuf|steak|bavette|onglet|hampe|paleron|jarret|joue de boeuf|queue de boeuf|tournedos|filet de boeuf|rosbif|pot.?au.?feu|blanquette de veau|osso.?bucco|escalope de veau|côte de veau|rôti de veau|gigot|souris d'agneau|carré d'agneau|navarin/i;
      
      filters.$and.push(
        // Exclure les recettes avec viande rouge dans le nom
        { name: { $not: { $regex: redMeatKeywords } } },
        // Exclure les recettes avec viande rouge dans les ingrédients principaux
        { 'ingredients.name': { $not: { $regex: /^(boeuf|bœuf|veau|agneau|mouton|steak|entrecôte|bavette)/i } } }
      );
      
      console.log(`   🥩 MODE ENFANTS: VIANDES ROUGES exclues (boeuf, veau, agneau) → privilégier poulet, poisson, légumineuses`);
      
      // ✅ EXIGER des LÉGUMES dans les repas enfants (équilibre alimentaire)
      const vegetableKeywords = 'légume|carotte|haricot|courgette|tomate|poivron|brocoli|épinard|chou|salade|petits pois|pois|aubergine|navet|betterave|céleri|poireau|fenouil|artichaut|asperge|concombre|radis|champignon|oignon|ail|échalote|endive|laitue|mâche|roquette|jardinière|printanier|primeur|ratatouille|légumes';
      
      filters.$and.push(
        // ✅ OBLIGATOIRE ENFANTS: Le plat doit contenir des légumes
        {
          $or: [
            { name: { $regex: vegetableKeywords, $options: 'i' } },
            { description: { $regex: vegetableKeywords, $options: 'i' } },
            { 'ingredients.name': { $regex: vegetableKeywords, $options: 'i' } }
          ]
        }
      );
      
      console.log(`   🥗 MODE ENFANTS: Recettes avec LÉGUMES obligatoires (équilibre alimentaire)`);
    }
    
    // ✅ CRITIQUE: EXIGER une source de protéine dans le nom ou les ingrédients
    // Le plat DOIT contenir une de ces protéines pour être un repas complet
    const proteinKeywords = 'poulet|chicken|boeuf|bœuf|beef|veau|porc|pork|jambon|ham|dinde|turkey|agneau|lamb|canard|duck|lapin|poisson|fish|saumon|salmon|thon|tuna|cabillaud|colin|merlu|dorade|bar|truite|sardine|anchois|crevette|shrimp|oeuf|œuf|egg|tofu|lentilles|pois chiches|haricots';
    
    filters.$and.push(
      // ✅ OBLIGATOIRE: Le plat doit contenir une protéine
      {
        $or: [
          { name: { $regex: proteinKeywords, $options: 'i' } },
          { description: { $regex: proteinKeywords, $options: 'i' } },
          { 'ingredients.name': { $regex: proteinKeywords, $options: 'i' } }
        ]
      },
      // Exclure les accompagnements
      { name: { $not: { $regex: /^(purée|puree|accompagnement|garniture|légumes? seuls?|légumes? uniquement)/i } } },
      { name: { $not: { $regex: /(purée|puree) de (carottes?|pommes? de terre|légumes?)/i } } },
      // Exclure les pâtes/riz simples sans protéines
      { name: { $not: { $regex: /^(pâtes?|spaghetti|linguine|tagliatelle|riz) (à l'ail|ail|huile|beurre|nature)/i } } },
      { name: { $not: { $regex: /^(courgettes?|carottes?|haricots?|épinards?|brocoli) (à l'ail|sautée?s?|poêlée?s?)/i } } },
      // Exclure les soupes/veloutés comme plat principal
      { name: { $not: { $regex: /^(soupe|velouté|potage|bouillon|consommé|gaspacho|minestrone)/i } } },
      { category: { $not: { $regex: /^(entrée|entree|starter|soup|soupe|accompagnement)/i } } }
    );
    
    console.log(`   🍖 Filtrage: Plats COMPLETS avec PROTÉINES uniquement`);
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
  
  // ✅ AMÉLIORATION: Éviter tous les menus déjà proposés (pour éviter les répétitions sur la semaine)
  const allAvoidNames = [...(avoidMenuNames || []), ...(avoidMenuName ? [avoidMenuName] : [])];
  if (allAvoidNames.length > 0) {
    // Exclure tous les menus de la liste
    const avoidConditions = allAvoidNames.map(name => ({
      name: { $ne: name } // Exclusion exacte
    }));
    
    // Ajouter aussi des exclusions par regex pour gérer les variations (ex: "Waterzooi" vs "Waterzooi à la gantoise")
    allAvoidNames.forEach(name => {
      const nameLower = name.toLowerCase();
      // Exclure les noms qui contiennent le nom à éviter (ex: "waterzooi" exclut "waterzooi à la gantoise")
      filters.$and = (filters.$and || []).concat([
        { name: { $not: { $regex: nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } }
      ]);
    });
    
    console.log(`🚫 Exclusion MongoDB de ${allAvoidNames.length} menu(s): ${allAvoidNames.join(', ')}`);
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
    }
    // ✅ En mode strict (filtersAsPreferences=false), on ne filtre PAS sur dietaryRestrictions
    // Le pré-filtrage JavaScript sur les allergènes se charge d'exclure les recettes dangereuses
    // L'ancien code filtrait sur dietaryRestrictions=$all ce qui excluait TOUTES les recettes
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
  stockItems = [],
  allergens = [], // Allergènes à exclure strictement
  dietaryRestrictions = [], // Restrictions alimentaires
  avoidMenuNames = [] // Liste de tous les menus à éviter (pour éviter les répétitions sur la semaine)
) {
  if (recipes.length === 0) return null;
  
  // Filtrer les recettes à éviter (menu unique + liste de menus de la semaine)
  let availableRecipes = recipes;
  const allAvoidNames = [...(avoidMenuNames || []), ...(avoidMenuName ? [avoidMenuName] : [])];
  
  if (allAvoidNames.length > 0) {
    console.log(`🚫 Exclusion STRICTE de ${allAvoidNames.length} menu(s) déjà généré(s): ${allAvoidNames.join(', ')}`);
    const beforeCount = recipes.length;
    availableRecipes = recipes.filter(r => {
      const recipeNameLower = r.name.toLowerCase().trim();
      const isExcluded = allAvoidNames.some(avoidName => {
        const avoidNameLower = avoidName.toLowerCase().trim();
        // Correspondance exacte
        if (recipeNameLower === avoidNameLower) {
          console.log(`   ❌ "${r.name}" exclu (correspondance exacte avec "${avoidName}")`);
          return true;
        }
        // Correspondance partielle (pour gérer les variations comme "Waterzooi" vs "Waterzooi à la gantoise")
        // Exclure si le nom de la recette contient le nom à éviter ou vice versa
        if (recipeNameLower.includes(avoidNameLower) || avoidNameLower.includes(recipeNameLower)) {
          // Vérifier que c'est vraiment le même plat (pas juste un mot commun)
          const avoidWords = avoidNameLower.split(/\s+/).filter(w => w.length > 3);
          const recipeWords = recipeNameLower.split(/\s+/).filter(w => w.length > 3);
          const commonWords = avoidWords.filter(w => recipeWords.includes(w));
          // Si plus de 50% des mots significatifs sont communs, c'est probablement le même plat
          if (commonWords.length > 0 && commonWords.length >= Math.min(avoidWords.length, recipeWords.length) * 0.5) {
            console.log(`   ❌ "${r.name}" exclu (correspondance partielle avec "${avoidName}")`);
            return true;
          }
        }
        return false;
      });
      return !isExcluded;
    });
    const excludedCount = beforeCount - availableRecipes.length;
    console.log(`   📊 ${excludedCount} recette(s) exclue(s), ${availableRecipes.length} recette(s) restante(s)`);
  }
  
  if (availableRecipes.length === 0) {
    console.log(`⚠️ Toutes les recettes ont été exclues, fallback avec toutes les recettes (répétitions possibles)`);
    availableRecipes = recipes; // Fallback si toutes évitées
  } else {
    console.log(`✅ ${availableRecipes.length} recettes disponibles après exclusion des répétitions`);
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
      tags: (r.tags || []).slice(0, 5).join(', '),
      allergens: r.allergens || [] // ✅ Inclure les allergènes pour la sélection
    }));
    
    const goalsText = nutritionalGoals.length > 0
      ? nutritionalGoals.map(goal => `- ${goal.label}: minimum ${goal.target}${goal.unit} par personne`).join('\n')
      : 'Aucun objectif nutritionnel spécifique. Privilégier la variété et l\'équilibre.';
    
    const themeText = weekdayTheme 
      ? `\nThème du jour: ${weekdayTheme.label || weekdayTheme.key}`
      : '';
    
    // Construire les informations sur les allergies et restrictions
    let allergensText = '';
    if (allergens && allergens.length > 0) {
      const allergensList = allergens.map(a => {
        // Normaliser les noms d'allergènes pour l'affichage
        const normalized = a.toLowerCase().trim();
        const allergenNames = {
          'oeufs': 'œufs', 'oeuf': 'œufs', 'eggs': 'œufs',
          'arachides': 'arachides', 'peanuts': 'arachides',
          'fruits_a_coque': 'fruits à coque', 'nuts': 'fruits à coque', 'noix': 'fruits à coque',
          'soja': 'soja', 'soy': 'soja',
          'poisson': 'poisson', 'fish': 'poisson',
          'crustaces': 'crustacés', 'shellfish': 'crustacés',
          'mollusques': 'mollusques', 'molluscs': 'mollusques',
          'celeri': 'céleri', 'celery': 'céleri',
          'moutarde': 'moutarde', 'mustard': 'moutarde',
          'gluten': 'gluten',
          'lactose': 'lactose',
          'sesame': 'sésame',
          'sulfites': 'sulfites',
          'lupin': 'lupin'
        };
        return allergenNames[normalized] || a;
      }).join(', ');
      allergensText = `\n\n🚫 ALLERGÈNES STRICTEMENT INTERDITS (CRITIQUE - SÉCURITÉ):
${allergensList}

⚠️ INTERDICTION ABSOLUE: Tu DOIS exclure TOUTES les recettes contenant ces allergènes, même en traces.
- Vérifie les ingrédients de chaque recette
- Vérifie aussi les allergènes déclarés dans les tags/champs de la recette
- Si une recette contient un de ces allergènes, elle est IMMÉDIATEMENT exclue
- Ne propose JAMAIS une recette avec ces allergènes, même si elle répond aux objectifs nutritionnels`;
    }
    
    let restrictionsText = '';
    if (dietaryRestrictions && dietaryRestrictions.length > 0) {
      restrictionsText = `\n\n⚠️ RESTRICTIONS ALIMENTAIRES À RESPECTER:
${dietaryRestrictions.join(', ')}

Ces restrictions doivent être respectées dans le choix de la recette.`;
    }
    
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
    
    // Construire les informations nutritionnelles détaillées pour chaque recette
    const recipesWithNutrition = recipesForAI.map(r => {
      const profile = r.nutritionalProfile || {};
      let nutritionInfo = '';
      
      if (nutritionalGoals.length > 0) {
        const nutritionDetails = nutritionalGoals.map(goal => {
          const value = profile[goal.nutrient] || 0;
          const percentage = goal.target > 0 ? ((value / goal.target) * 100).toFixed(0) : 0;
          const status = value >= goal.target ? '✅' : value >= goal.target * 0.5 ? '⚠️' : '❌';
          return `${goal.label}: ${value.toFixed(1)}${goal.unit} (${percentage}% de l'objectif ${goal.target}${goal.unit}) ${status}`;
        }).join(' | ');
        nutritionInfo = `\n   Nutrition: ${nutritionDetails}`;
      } else {
        nutritionInfo = `\n   ${profile.protein ? `Protéines: ${profile.protein}g | ` : ''}${profile.kcal ? `Calories: ${profile.kcal}kcal` : ''}`;
      }
      
      return `[ID: ${r.id}] ${r.name}${r.description ? ' - ' + r.description : ''}
   Ingrédients principaux: ${r.ingredients}${nutritionInfo}
   Tags: ${r.tags || 'aucun'}`;
    });
    
    const prompt = `Tu es un chef expert en nutrition pour établissements de soins (EHPAD, hôpitaux).

MISSION: Sélectionne la MEILLEURE recette parmi celles disponibles pour un ${mealType} pour ${numberOfPeople} personnes.

CRITÈRES DE SÉLECTION (par ordre de priorité):
1. 🚫 SÉCURITÉ ALIMENTAIRE (PRIORITÉ ABSOLUE):${allergensText}
   ${allergens && allergens.length > 0 ? '⚠️ CRITIQUE: Les allergènes listés ci-dessus sont STRICTEMENT INTERDITS. Vérifie chaque recette avant de la proposer.' : 'Aucun allergène à exclure.'}
${restrictionsText}
2. ${nutritionalGoals.length > 0 ? 'OBJECTIFS NUTRITIONNELS OBLIGATOIRES:' : 'ÉQUILIBRE NUTRITIONNEL'}
${goalsText}
${nutritionalGoals.length > 0 ? '⚠️ CRITIQUE: Tu DOIS choisir une recette qui permet d\'ATTEINDRE les objectifs nutritionnels. Les recettes sont triées par score nutritionnel (les meilleures en premier).\n   - Si une recette ne contient que 50% d\'un nutriment, il faudra doubler les quantités ou ajouter des accompagnements.\n   - PRIVILÉGIE les recettes qui contiennent déjà au moins 80-100% de chaque objectif pour éviter les ajustements.' : ''}${themeText}${stockInfoText}
3. PLAT COMPLET OBLIGATOIRE: Choisir UNIQUEMENT des plats complets (avec protéine + légumes/féculents), PAS des accompagnements.
   ⚠️ INTERDIT: Ne PAS choisir de recettes comme "Purée de carottes", "Purée de pommes de terre", "Légumes seuls", etc.
   Ces recettes sont des accompagnements, pas des menus complets.
4. VARIÉTÉ: Éviter les répétitions avec les menus précédents
5. APPÉTENCE: Privilégier les recettes appétissantes et équilibrées
6. QUALITÉ: Choisir des recettes complètes et bien décrites
${useStockOnly ? '7. STOCK: Toutes les recettes proposées utilisent uniquement des ingrédients disponibles en stock' : ''}

RECETTES DISPONIBLES (triées par score nutritionnel):
${recipesWithNutrition.join('\n\n')}

${allAvoidNames.length > 0 ? `\n\n🚫 INTERDICTION ABSOLUE - MENUS DÉJÀ GÉNÉRÉS (${allAvoidNames.length} menu(s)):
${allAvoidNames.map((name, idx) => `${idx + 1}. "${name}"`).join('\n')}

⚠️ CRITIQUE: Tu DOIS ABSOLUMENT EXCLURE ces menus de ta sélection.
- Vérifie le nom de chaque recette avant de la proposer
- Si une recette a un nom similaire ou identique à un de ces menus, elle est INTERDITE
- Exemple: Si "Waterzooi à la gantoise" est dans la liste, tu NE DOIS PAS choisir "Waterzooi", "Waterzooi de poulet", etc.
- Tu DOIS proposer un menu COMPLÈTEMENT DIFFÉRENT avec un nom différent et des ingrédients différents` : ''}

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
        // ✅ VÉRIFICATION POST-SÉLECTION 1 : Vérifier que le menu n'est pas dans la liste des menus à éviter
        if (allAvoidNames.length > 0) {
          const selectedNameLower = selectedRecipe.name.toLowerCase().trim();
          const isExcluded = allAvoidNames.some(avoidName => {
            const avoidNameLower = avoidName.toLowerCase().trim();
            // Correspondance exacte
            if (selectedNameLower === avoidNameLower) {
              console.error(`❌ RECETTE REJETÉE: "${selectedRecipe.name}" correspond exactement à "${avoidName}" (déjà généré)`);
              return true;
            }
            // Correspondance partielle
            if (selectedNameLower.includes(avoidNameLower) || avoidNameLower.includes(selectedNameLower)) {
              const avoidWords = avoidNameLower.split(/\s+/).filter(w => w.length > 3);
              const selectedWords = selectedNameLower.split(/\s+/).filter(w => w.length > 3);
              const commonWords = avoidWords.filter(w => selectedWords.includes(w));
              if (commonWords.length > 0 && commonWords.length >= Math.min(avoidWords.length, selectedWords.length) * 0.5) {
                console.error(`❌ RECETTE REJETÉE: "${selectedRecipe.name}" correspond partiellement à "${avoidName}" (déjà généré)`);
                return true;
              }
            }
            return false;
          });
          
          if (isExcluded) {
            console.error(`❌ L'IA a sélectionné un menu déjà généré ! Rejet et nouvelle tentative...`);
            // Retirer cette recette et réessayer avec les autres
            const remainingRecipes = availableRecipes.filter(r => r.name !== selectedRecipe.name);
            if (remainingRecipes.length > 0) {
              console.log(`🔄 Nouvelle tentative avec ${remainingRecipes.length} recettes restantes...`);
              // Réessayer avec les recettes restantes (récursif, mais limité)
              return await selectBestRecipeWithAI(
                remainingRecipes,
                nutritionalGoals,
                avoidMenuName,
                mealType,
                numberOfPeople,
                weekdayTheme,
                useStockOnly,
                stockItems,
                allergens,
                dietaryRestrictions,
                avoidMenuNames || []
              );
            } else {
              throw new Error(`Aucune recette compatible trouvée sans les menus déjà générés: ${allAvoidNames.join(', ')}`);
            }
          }
        }
        
        // ✅ VÉRIFICATION POST-SÉLECTION 2 : S'assurer que la recette ne contient pas d'allergènes interdits
        if (allergens && allergens.length > 0) {
          const recipeAllergens = (selectedRecipe.allergens || []).map(a => a.toLowerCase().trim());
          const recipeIngredients = (selectedRecipe.ingredients || []).map(ing => 
            (ing.name || ing).toLowerCase()
          ).join(' ');
          
          // Normaliser les allergènes pour la comparaison
          const normalizedForbiddenAllergens = allergens.map(a => {
            const normalized = a.toLowerCase().trim();
            const allergenMap = {
              'oeufs': ['oeufs', 'oeuf', 'eggs', 'œufs', 'œuf', 'mayonnaise', 'mayo'],
              'arachides': ['arachides', 'peanuts', 'cacahuètes', 'cacahuete'],
              'fruits_a_coque': ['fruits à coque', 'fruits_a_coque', 'nuts', 'noix', 'amandes', 'noisettes', 'pistache', 'cajou', 'pécan', 'macadamia'],
              'soja': ['soja', 'soy', 'soya', 'tofu', 'edamame'],
              'poisson': ['poisson', 'fish', 'saumon', 'thon', 'cabillaud', 'merlu', 'bar', 'dorade', 'sole', 'truite'],
              'crustaces': ['crustacés', 'crustaces', 'shellfish', 'crevettes', 'crabe', 'homard', 'langoustine', 'écrevisse'],
              'mollusques': ['mollusques', 'molluscs', 'moules', 'huîtres', 'palourdes', 'coquilles', 'poulpe', 'calmar', 'seiche'],
              'celeri': ['céleri', 'celeri', 'celery'],
              'moutarde': ['moutarde', 'mustard'],
              // ✅ GLUTEN - Liste étendue pour éviter les erreurs
              'gluten': ['gluten', 'blé', 'ble', 'wheat', 'farine', 'pâte', 'pate', 'feuilletée', 'feuilletee', 
                        'pain', 'biscuit', 'gâteau', 'gateau', 'pasta', 'pâtes', 'semoule', 'orge', 'seigle', 
                        'avoine', 'épeautre', 'epeautre', 'croûte', 'croute', 'panure', 'chapelure', 'brioche',
                        'croissant', 'pizza', 'quiche', 'tarte', 'tourte', 'crêpe', 'crepe', 'gaufre'],
              // ✅ LACTOSE - Liste étendue pour éviter les erreurs  
              'lactose': ['lactose', 'lait', 'milk', 'laitier', 'dairy', 'fromage', 'cheese', 'gruyère', 'gruyere',
                         'emmental', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'camembert', 'roquefort',
                         'comté', 'comte', 'crème', 'creme', 'cream', 'beurre', 'butter', 'yaourt', 'yogurt',
                         'mascarpone', 'ricotta', 'feta', 'chèvre', 'chevre', 'reblochon', 'raclette',
                         'béchamel', 'bechamel', 'gratin'],
              'sesame': ['sésame', 'sesame', 'tahini'],
              'sulfites': ['sulfites', 'sulfite', 'vin', 'vinaigre'],
              'lupin': ['lupin']
            };
            return allergenMap[normalized] || [normalized];
          }).flat();
          
          // Vérifier les allergènes déclarés dans la recette
          const hasForbiddenAllergen = recipeAllergens.some(recipeAllergen => {
            return normalizedForbiddenAllergens.some(forbidden => 
              recipeAllergen.includes(forbidden) || forbidden.includes(recipeAllergen)
            );
          });
          
          // Vérifier aussi dans les ingrédients (pour les cas où l'allergène n'est pas déclaré)
          const hasForbiddenInIngredients = normalizedForbiddenAllergens.some(forbidden => {
            return recipeIngredients.includes(forbidden);
          });
          
          if (hasForbiddenAllergen || hasForbiddenInIngredients) {
            console.error(`❌ RECETTE REJETÉE: "${selectedRecipe.name}" contient des allergènes interdits`);
            console.error(`   Allergènes interdits: ${allergens.join(', ')}`);
            console.error(`   Allergènes de la recette: ${recipeAllergens.join(', ')}`);
            
            // Retirer cette recette et réessayer avec les autres
            const remainingRecipes = availableRecipes.filter(r => r.name !== selectedRecipe.name);
            if (remainingRecipes.length > 0) {
              console.log(`🔄 Nouvelle tentative avec ${remainingRecipes.length} recettes restantes...`);
              // Réessayer avec les recettes restantes (récursif, mais limité)
              return await selectBestRecipeWithAI(
                remainingRecipes,
                nutritionalGoals,
                avoidMenuName,
                mealType,
                numberOfPeople,
                weekdayTheme,
                useStockOnly,
                stockItems,
                allergens,
                dietaryRestrictions,
                avoidMenuNames || []
              );
            } else {
              throw new Error(`Aucune recette compatible trouvée sans les allergènes: ${allergens.join(', ')}`);
            }
          }
        }
        
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
  // Les recettes ont servings=1 (quantités par personne)
  const baseServings = recipe.servings || 1;
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

// ✅ Multiplicateurs de portions par tranche d'âge (base adulte = 1.0)
const AGE_PORTION_MULTIPLIERS = {
  'maternelle': 0.45,        // 2,5-5 ans: 45% d'une portion adulte
  'primaire': 0.65,          // 6-11 ans: 65% d'une portion adulte
  'primaire_cp_ce1': 0.55,   // 6-7 ans: 55%
  'primaire_ce2_cm1': 0.65,  // 8-9 ans: 65%
  'primaire_cm2': 0.75,      // 10-11 ans: 75%
  'secondaire': 0.90,        // 12-18 ans: 90%
  'college': 0.85,           // 12-15 ans: 85%
  'lycee': 0.95,             // 16-18 ans: 95%
  'adulte': 1.0,             // Adulte: 100%
  'senior': 0.80,            // Senior: 80%
  'ehpad': 0.75              // EHPAD: 75%
};

// ✅ Références nutritionnelles ANSES par tranche d'âge (pour le DÉJEUNER - repas principal)
// Source: ANSES - Recommandations nutritionnelles pour les enfants et adolescents
const ANSES_NUTRITIONAL_REFERENCES = {
  'maternelle': {
    label: 'Maternelle (2,5-5 ans)',
    lunch: {
      calories: { min: 280, max: 380, unit: 'kcal' },
      proteins: { min: 8, max: 15, unit: 'g' },
      lipids: { min: 10, max: 16, unit: 'g' },
      carbs: { min: 35, max: 55, unit: 'g' },
      fibers: { min: 3, max: 6, unit: 'g' },
      sodium: { min: 0, max: 400, unit: 'mg' }
    }
  },
  'primaire': {
    label: 'Primaire (6-11 ans)',
    lunch: {
      calories: { min: 450, max: 580, unit: 'kcal' },
      proteins: { min: 14, max: 22, unit: 'g' },
      lipids: { min: 16, max: 24, unit: 'g' },
      carbs: { min: 55, max: 75, unit: 'g' },
      fibers: { min: 5, max: 8, unit: 'g' },
      sodium: { min: 0, max: 600, unit: 'mg' }
    }
  },
  'primaire_cp_ce1': {
    label: 'CP-CE1 (6-7 ans)',
    lunch: {
      calories: { min: 380, max: 480, unit: 'kcal' },
      proteins: { min: 12, max: 18, unit: 'g' },
      lipids: { min: 14, max: 20, unit: 'g' },
      carbs: { min: 45, max: 65, unit: 'g' },
      fibers: { min: 4, max: 7, unit: 'g' },
      sodium: { min: 0, max: 500, unit: 'mg' }
    }
  },
  'primaire_ce2_cm1': {
    label: 'CE2-CM1 (8-9 ans)',
    lunch: {
      calories: { min: 450, max: 550, unit: 'kcal' },
      proteins: { min: 14, max: 20, unit: 'g' },
      lipids: { min: 16, max: 22, unit: 'g' },
      carbs: { min: 55, max: 70, unit: 'g' },
      fibers: { min: 5, max: 8, unit: 'g' },
      sodium: { min: 0, max: 550, unit: 'mg' }
    }
  },
  'primaire_cm2': {
    label: 'CM2 (10-11 ans)',
    lunch: {
      calories: { min: 500, max: 620, unit: 'kcal' },
      proteins: { min: 16, max: 24, unit: 'g' },
      lipids: { min: 18, max: 26, unit: 'g' },
      carbs: { min: 60, max: 80, unit: 'g' },
      fibers: { min: 6, max: 9, unit: 'g' },
      sodium: { min: 0, max: 600, unit: 'mg' }
    }
  },
  'college': {
    label: 'Collège (12-15 ans)',
    lunch: {
      calories: { min: 600, max: 780, unit: 'kcal' },
      proteins: { min: 20, max: 30, unit: 'g' },
      lipids: { min: 22, max: 32, unit: 'g' },
      carbs: { min: 75, max: 100, unit: 'g' },
      fibers: { min: 7, max: 10, unit: 'g' },
      sodium: { min: 0, max: 700, unit: 'mg' }
    }
  },
  'lycee': {
    label: 'Lycée (16-18 ans)',
    lunch: {
      calories: { min: 700, max: 900, unit: 'kcal' },
      proteins: { min: 24, max: 35, unit: 'g' },
      lipids: { min: 26, max: 38, unit: 'g' },
      carbs: { min: 85, max: 115, unit: 'g' },
      fibers: { min: 8, max: 12, unit: 'g' },
      sodium: { min: 0, max: 800, unit: 'mg' }
    }
  },
  'secondaire': {
    label: 'Secondaire (12-18 ans)',
    lunch: {
      calories: { min: 650, max: 850, unit: 'kcal' },
      proteins: { min: 22, max: 32, unit: 'g' },
      lipids: { min: 24, max: 35, unit: 'g' },
      carbs: { min: 80, max: 110, unit: 'g' },
      fibers: { min: 7, max: 11, unit: 'g' },
      sodium: { min: 0, max: 750, unit: 'mg' }
    }
  },
  'adulte': {
    label: 'Adulte',
    lunch: {
      calories: { min: 600, max: 850, unit: 'kcal' },
      proteins: { min: 20, max: 35, unit: 'g' },
      lipids: { min: 22, max: 35, unit: 'g' },
      carbs: { min: 70, max: 100, unit: 'g' },
      fibers: { min: 8, max: 12, unit: 'g' },
      sodium: { min: 0, max: 800, unit: 'mg' }
    }
  },
  'senior': {
    label: 'Senior (65+ ans)',
    lunch: {
      calories: { min: 500, max: 700, unit: 'kcal' },
      proteins: { min: 22, max: 32, unit: 'g' }, // Plus de protéines pour les seniors
      lipids: { min: 18, max: 28, unit: 'g' },
      carbs: { min: 55, max: 85, unit: 'g' },
      fibers: { min: 8, max: 12, unit: 'g' },
      sodium: { min: 0, max: 600, unit: 'mg' } // Moins de sel
    }
  },
  'ehpad': {
    label: 'EHPAD (personne âgée dépendante)',
    lunch: {
      calories: { min: 450, max: 650, unit: 'kcal' },
      proteins: { min: 20, max: 30, unit: 'g' }, // Protéines importantes
      lipids: { min: 16, max: 26, unit: 'g' },
      carbs: { min: 50, max: 75, unit: 'g' },
      fibers: { min: 6, max: 10, unit: 'g' },
      sodium: { min: 0, max: 500, unit: 'mg' } // Sel limité
    }
  }
};

// ✅ Fonction pour évaluer les valeurs nutritionnelles par rapport aux références ANSES
function evaluateNutrition(nutritionValues, ageRange, mealType = 'lunch') {
  const reference = ANSES_NUTRITIONAL_REFERENCES[ageRange];
  if (!reference || !reference[mealType]) {
    return { valid: true, warnings: [], recommendations: [] };
  }
  
  const refs = reference[mealType];
  const warnings = [];
  const recommendations = [];
  let score = 100;
  
  // Mapping des clés nutritionnelles
  const keyMapping = {
    'calories': ['calories', 'kcal', 'energy'],
    'proteins': ['proteins', 'protein', 'proteines'],
    'lipids': ['lipids', 'lipid', 'fat', 'fats'],
    'carbs': ['carbs', 'carbohydrates', 'glucides'],
    'fibers': ['fibers', 'fiber', 'fibres'],
    'sodium': ['sodium', 'sel', 'salt']
  };
  
  for (const [nutrient, range] of Object.entries(refs)) {
    // Trouver la valeur correspondante
    let value = null;
    const possibleKeys = keyMapping[nutrient] || [nutrient];
    for (const key of possibleKeys) {
      if (nutritionValues[key] !== undefined) {
        value = nutritionValues[key];
        break;
      }
    }
    
    if (value === null) continue;
    
    if (value < range.min) {
      const deficit = ((range.min - value) / range.min * 100).toFixed(0);
      warnings.push({
        nutrient,
        type: 'low',
        value,
        expected: `${range.min}-${range.max}${range.unit}`,
        message: `${nutrient}: ${value.toFixed(1)}${range.unit} (trop bas, min: ${range.min}${range.unit}, -${deficit}%)`
      });
      score -= 15;
    } else if (value > range.max) {
      const excess = ((value - range.max) / range.max * 100).toFixed(0);
      warnings.push({
        nutrient,
        type: 'high',
        value,
        expected: `${range.min}-${range.max}${range.unit}`,
        message: `${nutrient}: ${value.toFixed(1)}${range.unit} (trop élevé, max: ${range.max}${range.unit}, +${excess}%)`
      });
      score -= 10;
    }
  }
  
  // Générer des recommandations
  if (warnings.some(w => w.nutrient === 'carbs' && w.type === 'low')) {
    recommendations.push('Ajouter des féculents (riz, pâtes, pain) pour augmenter les glucides');
  }
  if (warnings.some(w => w.nutrient === 'proteins' && w.type === 'high')) {
    recommendations.push('Réduire la portion de viande/poisson ou choisir une source moins protéinée');
  }
  if (warnings.some(w => w.nutrient === 'lipids' && w.type === 'high')) {
    recommendations.push('Réduire les matières grasses ou choisir une cuisson plus légère');
  }
  if (warnings.some(w => w.nutrient === 'fibers' && w.type === 'low')) {
    recommendations.push('Ajouter des légumes ou des légumineuses pour les fibres');
  }
  
  return {
    valid: warnings.length === 0,
    score: Math.max(0, score),
    warnings,
    recommendations,
    reference: reference.label
  };
}

export async function generateCustomMenu({
  numberOfPeople = 4,
  mealType = 'déjeuner',
  nutritionalGoals = [],
  dietaryRestrictions = [],
  allergens = [], // Allergènes à exclure strictement
  avoidMenuName = null,
  avoidMenuNames = [], // ✅ Liste de tous les menus à éviter (pour éviter les répétitions sur la semaine)
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
  ageGroups = [], // ✅ Groupes d'âge pour ajuster les portions
  generateCompleteMeal = true, // ✅ Nouveau: Générer un repas complet (entrée + plat) avec score ANSES >= 85%
  minANSESScore = 85, // ✅ Nouveau: Score ANSES minimum requis
  sustainability = {} // ✅ NOUVEAU: Critères de durabilité { local, seasonal, organic, lowCarbon }
}) {
  console.log(`\n🎯 Génération d'un menu personnalisé...`);
  console.log(`   👥 ${numberOfPeople} personnes`);
  console.log(`   🍽️  Type : ${mealType}`);
  console.log(`   📊 Score ANSES minimum: ${minANSESScore}%`);
  
  // ✅ Calculer le multiplicateur de portion moyen basé sur les groupes d'âge
  let portionMultiplier = 1.0;
  if (ageGroups && ageGroups.length > 0) {
    let totalWeightedMultiplier = 0;
    let totalPeople = 0;
    ageGroups.forEach(group => {
      const multiplier = AGE_PORTION_MULTIPLIERS[group.ageRange] || 1.0;
      const count = group.count || group.peopleCount || 0;
      totalWeightedMultiplier += multiplier * count;
      totalPeople += count;
      console.log(`   👶 ${group.ageRange}: ${count} personnes (×${multiplier})`);
    });
    if (totalPeople > 0) {
      portionMultiplier = totalWeightedMultiplier / totalPeople;
    }
    console.log(`   📏 Multiplicateur de portion moyen: ×${portionMultiplier.toFixed(2)}`);
  }
  if (forceVariation && avoidMenuName) {
    console.log(`   🔄 Forcer une variation (éviter: "${avoidMenuName}")`);
  }
  
  // ✅ NOUVEAU: Afficher les critères de durabilité
  const hasSustainabilityPrefs = sustainability && Object.values(sustainability).some(v => v);
  if (hasSustainabilityPrefs) {
    console.log(`   🌿 Critères durables activés:`);
    if (sustainability.local) console.log(`      ✅ Produits locaux`);
    if (sustainability.seasonal) console.log(`      ✅ Produits de saison`);
    if (sustainability.organic) console.log(`      ✅ Bio / Label qualité`);
    if (sustainability.lowCarbon) console.log(`      ✅ Bas carbone`);
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
  
  // ✅ AMÉLIORATION: Construire la liste complète des menus à éviter
  const allAvoidNames = [...(avoidMenuNames || []), ...(avoidMenuName ? [avoidMenuName] : [])];
  
  if (allAvoidNames.length > 0) {
    console.log(`\n🚫 ===== EXCLUSION DE MENUS DÉJÀ GÉNÉRÉS =====`);
    console.log(`   ${allAvoidNames.length} menu(s) à éviter: ${allAvoidNames.join(', ')}`);
    console.log(`   Ces menus seront exclus de la sélection MongoDB ET JavaScript`);
  }
  
  // Construire les filtres de recherche
  const recipeFilters = buildRecipeFilters({
    mealType,
    dietaryRestrictions,
    weekdayTheme,
    dynamicBanProteins,
    avoidMenuName: allAvoidNames.length > 0 ? allAvoidNames[0] : null, // Premier pour compatibilité
    avoidMenuNames: allAvoidNames, // Liste complète
    filtersAsPreferences,
    nutritionalGoals,
    ageGroups // ✅ AJOUTÉ: Passer les groupes d'âge pour le filtre alcool
  });
  
  console.log(`🔍 Filtres de recherche MongoDB:`, JSON.stringify(recipeFilters, null, 2));
  
  // Récupérer les recettes compatibles (inclure explicitement les allergènes)
  let compatibleRecipes = await RecipeEnriched.find(recipeFilters).select('+allergens');
  console.log(`✅ ${compatibleRecipes.length} recettes trouvées après filtrage MongoDB`);
  
  // Debug: vérifier les allergènes des premières recettes
  if (compatibleRecipes.length > 0) {
    const sampleRecipe = compatibleRecipes[0];
    console.log(`🔍 Exemple - Recette "${sampleRecipe.name}" a ${(sampleRecipe.allergens || []).length} allergène(s): ${(sampleRecipe.allergens || []).join(', ') || 'AUCUN'}`);
  }
  
  // ✅ FILTRAGE SUPPLÉMENTAIRE JavaScript pour s'assurer que les menus à éviter sont exclus
  if (allAvoidNames.length > 0) {
    const beforeCount = compatibleRecipes.length;
    compatibleRecipes = compatibleRecipes.filter(recipe => {
      const recipeNameLower = recipe.name.toLowerCase().trim();
      const isExcluded = allAvoidNames.some(avoidName => {
        const avoidNameLower = avoidName.toLowerCase().trim();
        // Correspondance exacte
        if (recipeNameLower === avoidNameLower) {
          console.log(`   ❌ "${recipe.name}" exclu (correspondance exacte avec "${avoidName}")`);
          return true;
        }
        // Correspondance partielle - extraire le mot principal (ex: "waterzooi" de "waterzooi à la gantoise")
        const avoidMainWord = avoidNameLower.split(/\s+/)[0]; // Premier mot
        const recipeMainWord = recipeNameLower.split(/\s+/)[0];
        if (avoidMainWord.length > 4 && recipeMainWord === avoidMainWord) {
          console.log(`   ❌ "${recipe.name}" exclu (même mot principal "${avoidMainWord}" que "${avoidName}")`);
          return true; // Même mot principal = même plat
        }
        // Vérifier si le nom contient le mot principal
        if (recipeNameLower.includes(avoidMainWord) && avoidMainWord.length > 4) {
          console.log(`   ❌ "${recipe.name}" exclu (contient le mot principal "${avoidMainWord}" de "${avoidName}")`);
          return true;
        }
        if (avoidNameLower.includes(recipeMainWord) && recipeMainWord.length > 4) {
          console.log(`   ❌ "${recipe.name}" exclu (mot principal "${recipeMainWord}" présent dans "${avoidName}")`);
          return true;
        }
        return false;
      });
      return !isExcluded;
    });
    const excludedCount = beforeCount - compatibleRecipes.length;
    if (excludedCount > 0) {
      console.log(`🚫 ${excludedCount} recette(s) supplémentaire(s) exclue(s) par filtrage JavaScript`);
      console.log(`✅ ${compatibleRecipes.length} recettes restantes après double filtrage`);
    } else {
      console.log(`✅ Toutes les recettes sont déjà exclues par MongoDB, pas besoin de filtrage supplémentaire`);
    }
  }
  
  // ✅ PRÉ-FILTRAGE ALLERGÈNES - CRITIQUE pour la sécurité alimentaire
  // Filtrer les recettes AVANT la sélection IA pour éviter tout risque
  if (allergens && allergens.length > 0) {
    console.log(`\n🚫 PRÉ-FILTRAGE ALLERGÈNES STRICT: ${allergens.join(', ')}`);
    const beforeAllergenFilter = compatibleRecipes.length;
    
    // Map étendue des allergènes avec tous les mots-clés associés
    const allergenKeywords = {
      'gluten': ['gluten', 'blé', 'ble', 'wheat', 'farine', 'pâte', 'pate', 'feuilletée', 'feuilletee', 
                'pain', 'biscuit', 'gâteau', 'gateau', 'pasta', 'pâtes', 'semoule', 'orge', 'seigle', 
                'avoine', 'épeautre', 'epeautre', 'croûte', 'croute', 'panure', 'chapelure', 'brioche',
                'croissant', 'pizza', 'quiche', 'tarte', 'tourte', 'crêpe', 'crepe', 'gaufre', 'baguette'],
      'lactose': ['lactose', 'lait', 'milk', 'laitier', 'dairy', 'fromage', 'cheese', 'gruyère', 'gruyere',
                 'emmental', 'parmesan', 'mozzarella', 'cheddar', 'brie', 'camembert', 'roquefort',
                 'comté', 'comte', 'crème', 'creme', 'cream', 'beurre', 'butter', 'yaourt', 'yogurt',
                 'mascarpone', 'ricotta', 'feta', 'chèvre', 'chevre', 'reblochon', 'raclette',
                 'béchamel', 'bechamel', 'gratin', 'crémeux', 'cremeux'],
      'oeufs': ['oeufs', 'oeuf', 'œufs', 'œuf', 'eggs', 'egg', 'mayonnaise', 'mayo', 'meringue', 'omelette'],
      'arachides': ['arachides', 'arachide', 'peanuts', 'peanut', 'cacahuètes', 'cacahuete'],
      'fruits_a_coque': ['noix', 'amandes', 'amande', 'noisettes', 'noisette', 'pistache', 'cajou', 'pécan', 'macadamia'],
      'soja': ['soja', 'soy', 'soya', 'tofu', 'edamame', 'tempeh'],
      'poisson': ['poisson', 'fish', 'saumon', 'thon', 'cabillaud', 'merlu', 'bar', 'dorade', 'sole', 'truite', 'sardine', 'anchois'],
      'crustaces': ['crustacés', 'crustaces', 'crevettes', 'crevette', 'crabe', 'homard', 'langoustine', 'écrevisse'],
      'mollusques': ['mollusques', 'moules', 'huîtres', 'huitres', 'palourdes', 'coquilles', 'poulpe', 'calmar', 'seiche'],
      'celeri': ['céleri', 'celeri', 'celery'],
      'moutarde': ['moutarde', 'mustard'],
      'sesame': ['sésame', 'sesame', 'tahini'],
      'sulfites': ['sulfites', 'sulfite'],
      'lupin': ['lupin']
    };
    
    // Collecter tous les mots-clés à exclure
    const forbiddenKeywords = [];
    allergens.forEach(allergen => {
      const normalizedAllergen = allergen.toLowerCase().trim();
      const keywords = allergenKeywords[normalizedAllergen] || [normalizedAllergen];
      forbiddenKeywords.push(...keywords);
    });
    console.log(`   Mots-clés à exclure: ${forbiddenKeywords.slice(0, 15).join(', ')}${forbiddenKeywords.length > 15 ? '...' : ''}`);
    
    compatibleRecipes = compatibleRecipes.filter(recipe => {
      // Vérifier les allergènes déclarés
      const recipeAllergens = (recipe.allergens || []).map(a => a.toLowerCase().trim());
      const hasAllergenDeclared = recipeAllergens.some(recipeAllergen => {
        return forbiddenKeywords.some(keyword => 
          recipeAllergen.includes(keyword) || keyword.includes(recipeAllergen)
        );
      });
      
      // Vérifier dans les ingrédients (nom + description)
      const ingredientsText = (recipe.ingredients || []).map(ing => {
        const name = (ing.name || ing || '').toLowerCase();
        return name;
      }).join(' ');
      
      const hasAllergenInIngredients = forbiddenKeywords.some(keyword => 
        ingredientsText.includes(keyword)
      );
      
      // Vérifier dans le nom et la description de la recette
      const recipeName = (recipe.name || '').toLowerCase();
      const recipeDescription = (recipe.description || '').toLowerCase();
      const hasAllergenInNameOrDesc = forbiddenKeywords.some(keyword => 
        recipeName.includes(keyword) || recipeDescription.includes(keyword)
      );
      
      const isExcluded = hasAllergenDeclared || hasAllergenInIngredients || hasAllergenInNameOrDesc;
      
      if (isExcluded) {
        console.log(`   ❌ EXCLU: "${recipe.name}" (contient: ${hasAllergenDeclared ? 'allergène déclaré' : hasAllergenInIngredients ? 'ingrédient interdit' : 'mot-clé dans nom/description'})`);
      }
      
      return !isExcluded;
    });
    
    const excludedByAllergens = beforeAllergenFilter - compatibleRecipes.length;
    console.log(`🚫 ${excludedByAllergens} recettes exclues pour allergènes sur ${beforeAllergenFilter}`);
    console.log(`✅ ${compatibleRecipes.length} recettes SÛRES restantes\n`);
    
    if (compatibleRecipes.length === 0) {
      throw new Error(`Aucune recette compatible trouvée sans les allergènes: ${allergens.join(', ')}. Essayez avec moins de restrictions.`);
    }
  }
  
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
    // ✅ AMÉLIORATION: Exclure tous les menus déjà générés
    if (allAvoidNames.length > 0) {
      allAvoidNames.forEach(name => {
        const nameLower = name.toLowerCase();
        relaxedFilters.$and = (relaxedFilters.$and || []).concat([
          { name: { $not: { $regex: nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } }
        ]);
      });
    }
    compatibleRecipes = await RecipeEnriched.find(relaxedFilters);
    console.log(`✅ ${compatibleRecipes.length} recettes trouvées avec filtres assouplis`);
    
    // ✅ FILTRAGE JavaScript supplémentaire même en mode relaxed
    if (allAvoidNames.length > 0) {
      const beforeCount = compatibleRecipes.length;
      compatibleRecipes = compatibleRecipes.filter(recipe => {
        const recipeNameLower = recipe.name.toLowerCase().trim();
        return !allAvoidNames.some(avoidName => {
          const avoidNameLower = avoidName.toLowerCase().trim();
          const avoidMainWord = avoidNameLower.split(/\s+/)[0];
          const recipeMainWord = recipeNameLower.split(/\s+/)[0];
          return recipeNameLower === avoidNameLower || 
                 (avoidMainWord.length > 4 && recipeMainWord === avoidMainWord) ||
                 (recipeNameLower.includes(avoidMainWord) && avoidMainWord.length > 4) ||
                 (avoidNameLower.includes(recipeMainWord) && recipeMainWord.length > 4);
        });
      });
      const excludedCount = beforeCount - compatibleRecipes.length;
      if (excludedCount > 0) {
        console.log(`🚫 ${excludedCount} recette(s) exclue(s) par filtrage JavaScript (mode relaxed)`);
      }
    }
  }
  
  // Si toujours aucun résultat, prendre n'importe quelle recette de la catégorie
  if (compatibleRecipes.length === 0) {
    console.log(`⚠️  Aucune recette compatible, sélection parmi toutes les recettes de la catégorie...`);
    const fallbackFilters = { category: recipeFilters.category };
    // ✅ AMÉLIORATION: Exclure tous les menus déjà générés même en fallback
    if (allAvoidNames.length > 0) {
      allAvoidNames.forEach(name => {
        const nameLower = name.toLowerCase();
        fallbackFilters.$and = (fallbackFilters.$and || []).concat([
          { name: { $not: { $regex: nameLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } } }
        ]);
      });
    }
    compatibleRecipes = await RecipeEnriched.find(fallbackFilters).limit(100);
    console.log(`✅ ${compatibleRecipes.length} recettes disponibles pour fallback`);
    
    // ✅ FILTRAGE JavaScript supplémentaire même en mode fallback
    if (allAvoidNames.length > 0) {
      const beforeCount = compatibleRecipes.length;
      compatibleRecipes = compatibleRecipes.filter(recipe => {
        const recipeNameLower = recipe.name.toLowerCase().trim();
        return !allAvoidNames.some(avoidName => {
          const avoidNameLower = avoidName.toLowerCase().trim();
          const avoidMainWord = avoidNameLower.split(/\s+/)[0];
          const recipeMainWord = recipeNameLower.split(/\s+/)[0];
          return recipeNameLower === avoidNameLower || 
                 (avoidMainWord.length > 4 && recipeMainWord === avoidMainWord) ||
                 (recipeNameLower.includes(avoidMainWord) && avoidMainWord.length > 4) ||
                 (avoidNameLower.includes(recipeMainWord) && recipeMainWord.length > 4);
        });
      });
      const excludedCount = beforeCount - compatibleRecipes.length;
      if (excludedCount > 0) {
        console.log(`🚫 ${excludedCount} recette(s) exclue(s) par filtrage JavaScript (mode fallback)`);
        console.log(`✅ ${compatibleRecipes.length} recettes restantes après filtrage`);
      }
    }
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
  
  // ========== FILTRER PAR OBJECTIFS NUTRITIONNELS SI SPÉCIFIÉS ==========
  if (nutritionalGoals.length > 0) {
    console.log(`\n🎯 Filtrage des recettes selon les objectifs nutritionnels...`);
    console.log(`   ${compatibleRecipes.length} recettes avant filtrage nutritionnel`);
    
    // Filtrer les recettes qui ont au moins un minimum de nutriments requis
    const filteredByNutrition = compatibleRecipes.filter(recipe => {
      const profile = recipe.nutritionalProfile || {};
      
        // Vérifier que la recette peut potentiellement atteindre les objectifs
        // On accepte si la recette contient au moins 30% de chaque objectif
        // (on pourra ajuster les quantités pour atteindre 100%)
        let goalsMet = 0;
        nutritionalGoals.forEach(goal => {
          const value = profile[goal.nutrient] || 0;
          // Accepter si la recette contient au moins 30% de l'objectif
          // (on peut augmenter les quantités pour atteindre 100%)
          if (value >= goal.target * 0.3) {
            goalsMet++;
          }
        });
        
        // Accepter si au moins 70% des objectifs sont partiellement respectés
        // (plus strict qu'avant pour garantir qu'on peut atteindre les objectifs)
        return goalsMet >= Math.ceil(nutritionalGoals.length * 0.7);
    });
    
    if (filteredByNutrition.length > 0) {
      compatibleRecipes = filteredByNutrition;
      console.log(`✅ ${compatibleRecipes.length} recettes respectent au moins partiellement les objectifs nutritionnels`);
      
      // Trier par score nutritionnel (recettes qui respectent le plus d'objectifs en premier)
      compatibleRecipes.sort((a, b) => {
        const profileA = a.nutritionalProfile || {};
        const profileB = b.nutritionalProfile || {};
        
        let scoreA = 0;
        let scoreB = 0;
        
        nutritionalGoals.forEach(goal => {
          const valueA = profileA[goal.nutrient] || 0;
          const valueB = profileB[goal.nutrient] || 0;
          
          // Score basé sur le pourcentage de l'objectif atteint
          scoreA += Math.min(valueA / goal.target, 1.5); // Bonus si dépasse l'objectif
          scoreB += Math.min(valueB / goal.target, 1.5);
        });
        
        return scoreB - scoreA; // Tri décroissant
      });
      
      console.log(`📊 Top 3 recettes par score nutritionnel:`);
      compatibleRecipes.slice(0, 3).forEach((r, i) => {
        const profile = r.nutritionalProfile || {};
        const scores = nutritionalGoals.map(goal => {
          const value = profile[goal.nutrient] || 0;
          return `${goal.label}: ${value.toFixed(1)}${goal.unit} (${((value / goal.target) * 100).toFixed(0)}%)`;
        }).join(', ');
        console.log(`   ${i + 1}. ${r.name} - ${scores}`);
      });
    } else {
      console.log(`⚠️  Aucune recette ne respecte les objectifs nutritionnels, utilisation de toutes les recettes disponibles`);
      console.log(`   L'IA essaiera de sélectionner la meilleure option possible`);
    }
  }
  
  // ========== FILTRAGE/PRIORITISATION PAR CRITÈRES DURABLES ==========
  if (hasSustainabilityPrefs && compatibleRecipes.length > 0) {
    console.log(`\n🌿 Application des critères de durabilité...`);
    console.log(`   ${compatibleRecipes.length} recettes avant scoring durabilité`);
    
    // Calculer un score de durabilité pour chaque recette
    compatibleRecipes = compatibleRecipes.map(recipe => {
      let sustainabilityScore = 0;
      const tags = (recipe.tags || []).map(t => t.toLowerCase());
      const name = (recipe.name || '').toLowerCase();
      const description = (recipe.description || '').toLowerCase();
      const ingredients = (recipe.ingredients || []).map(i => (i.name || '').toLowerCase());
      
      // ✅ Produits locaux
      if (sustainability.local) {
        if (tags.includes('local') || tags.includes('terroir') || tags.includes('régional') ||
            name.includes('local') || name.includes('terroir') || name.includes('fermier') ||
            description.includes('local') || description.includes('terroir')) {
          sustainabilityScore += 25;
        }
        // Bonus si ingrédients typiques locaux (France/Belgique)
        const localIngredients = ['boeuf', 'poulet', 'porc', 'carotte', 'pomme de terre', 'poireau', 'navet', 'chou', 'betterave', 'fromage'];
        if (ingredients.some(ing => localIngredients.some(l => ing.includes(l)))) {
          sustainabilityScore += 10;
        }
      }
      
      // ✅ Produits de saison - Utilisation du calendrier SEASONAL_PRODUCTS
      let seasonalityData = null;
      if (sustainability.seasonal) {
        // Calculer le score de saisonnalité réel avec le calendrier
        seasonalityData = calculateSeasonalityScore({ ingredients: (recipe.ingredients || []) });
        
        if (seasonalityData.allSeasonal) {
          // Tous les ingrédients sont de saison = BONUS MAX
          sustainabilityScore += 40;
        } else if (seasonalityData.score >= 80) {
          // 80%+ ingrédients de saison
          sustainabilityScore += 30;
        } else if (seasonalityData.score >= 50) {
          // 50-80% ingrédients de saison
          sustainabilityScore += 15;
        } else {
          // Moins de 50% de saison = MALUS
          sustainabilityScore -= 10;
        }
        
        // Bonus si tags explicites "saison"
        if (tags.includes('saison') || tags.includes('saisonnier') ||
            description.includes('saison') || description.includes('saisonnier')) {
          sustainabilityScore += 10;
        }
      }
      
      // ✅ Bio / Label qualité
      if (sustainability.organic) {
        if (tags.includes('bio') || tags.includes('biologique') || tags.includes('label') ||
            tags.includes('aop') || tags.includes('igp') || tags.includes('label rouge') ||
            name.includes('bio') || description.includes('bio') || description.includes('label')) {
          sustainabilityScore += 25;
        }
      }
      
      // ✅ Bas carbone
      if (sustainability.lowCarbon) {
        // Favoriser les recettes végétariennes, sans viande rouge
        if (tags.includes('végétarien') || tags.includes('vegan') || tags.includes('bas carbone') ||
            name.includes('légumes') || name.includes('végétarien')) {
          sustainabilityScore += 30;
        }
        // Pénaliser la viande rouge (forte empreinte carbone)
        const highCarbonMeats = ['boeuf', 'agneau', 'mouton', 'veau'];
        const hasMeatRed = ingredients.some(ing => highCarbonMeats.some(m => ing.includes(m)));
        if (hasMeatRed) {
          sustainabilityScore -= 20;
        }
        // Favoriser le poulet/poisson (empreinte plus faible)
        const lowCarbonProteins = ['poulet', 'dinde', 'poisson', 'cabillaud', 'saumon', 'lentille', 'pois chiche', 'haricot', 'tofu'];
        if (ingredients.some(ing => lowCarbonProteins.some(p => ing.includes(p)))) {
          sustainabilityScore += 20;
        }
        // ✅ BONUS: Recettes avec beaucoup de légumes = plus écolo
        const vegetables = ['carotte', 'courgette', 'tomate', 'poivron', 'brocoli', 'épinard', 'haricot vert', 'petit pois', 'aubergine', 'chou', 'navet', 'poireau'];
        const vegCount = ingredients.filter(ing => vegetables.some(v => ing.includes(v))).length;
        if (vegCount >= 3) {
          sustainabilityScore += 20; // 3+ légumes = très équilibré et écolo
        } else if (vegCount >= 1) {
          sustainabilityScore += 10; // Au moins 1 légume
        }
      }
      
      // ✅ BONUS GÉNÉRAL: Favoriser les recettes équilibrées avec légumes (même sans critère bas carbone)
      const veggieIngredients = ['carotte', 'courgette', 'tomate', 'poivron', 'brocoli', 'épinard', 'haricot', 'petit pois', 'aubergine', 'chou', 'légume'];
      const hasVegetables = ingredients.some(ing => veggieIngredients.some(v => ing.includes(v)));
      if (hasVegetables) {
        sustainabilityScore += 5; // Petit bonus pour les recettes avec légumes
      }
      
      // Score minimum = 0 (pas de score négatif)
      return { 
        ...recipe._doc || recipe, 
        sustainabilityScore: Math.max(0, sustainabilityScore),
        seasonalityData: seasonalityData // ✅ Stocke les données de saisonnalité
      };
    });
    
    // Trier par score de durabilité (décroissant), puis conserver les meilleures
    compatibleRecipes.sort((a, b) => b.sustainabilityScore - a.sustainabilityScore);
    
    // Afficher le top 5 avec leurs scores
    console.log(`🌿 Top 5 recettes par score durabilité:`);
    compatibleRecipes.slice(0, 5).forEach((r, i) => {
      console.log(`   ${i + 1}. ${r.name} - Score: ${r.sustainabilityScore}`);
    });
    
    // Si des recettes ont un bon score, prioriser celles-ci
    const highSustainability = compatibleRecipes.filter(r => r.sustainabilityScore >= 25);
    if (highSustainability.length > 0) {
      console.log(`✅ ${highSustainability.length} recettes avec score durabilité >= 25 (prioritaires)`);
      // Garder seulement les recettes durables en priorité, mais conserver les autres en fallback
      compatibleRecipes = [...highSustainability, ...compatibleRecipes.filter(r => r.sustainabilityScore < 25)];
    }
  }
  
  // Sélectionner intelligemment une recette avec l'IA
  // Utiliser les allergènes passés en paramètre (priorité) ou extraire depuis les restrictions
  let allAllergens = allergens || [];
  
  // Si pas d'allergènes explicites, essayer de les extraire des restrictions
  if (allAllergens.length === 0) {
    const allergensFromRestrictions = dietaryRestrictions
      .filter(r => r.toLowerCase().includes('sans') || r.toLowerCase().includes('allergie'))
      .map(r => {
        // Extraire le nom de l'allergène (ex: "sans oeufs" -> "oeufs")
        const match = r.toLowerCase().match(/sans\s+(\w+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);
    allAllergens = allergensFromRestrictions;
  }
  
  if (allAllergens.length > 0) {
    console.log(`🚫 Allergènes à exclure strictement: ${allAllergens.join(', ')}`);
  }
  
  // allAvoidNames est déjà défini plus haut dans la fonction
  if (allAvoidNames.length > 0) {
    console.log(`🚫 Exclusion de ${allAvoidNames.length} menu(s) déjà généré(s) pour éviter les répétitions`);
  }
  
  const selectedRecipe = await selectBestRecipeWithAI(
    compatibleRecipes,
    nutritionalGoals,
    avoidMenuName,
    mealType,
    numberOfPeople,
    weekdayTheme,
    useStockOnly,
    stockItems,
    allAllergens.length > 0 ? allAllergens : undefined,
    dietaryRestrictions,
    allAvoidNames // Passer la liste complète des menus à éviter
  );
  
  if (!selectedRecipe) {
    throw new Error('Erreur lors de la sélection d\'une recette');
  }
  
  console.log(`\n✅ Recette sélectionnée: "${selectedRecipe.name}"`);
  console.log(`   Catégorie: ${selectedRecipe.category}`);
  console.log(`   Ingrédients: ${selectedRecipe.ingredients?.length || 0}`);
  console.log(`   Allergènes: ${(selectedRecipe.allergens || []).join(', ') || 'AUCUN'}`);
  
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
        variationNote: variation.variationNote,
        allergens: selectedRecipe.allergens || [] // Allergènes AFSCA/UE 1169/2011 (hérités de la recette de base)
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
    // Les recettes ont maintenant servings=1 (quantités par personne)
    const baseServings = selectedRecipe.servings || 1;
    const servingMultiplier = numberOfPeople / baseServings;
    
    // Adapter les ingrédients au nombre de personnes
    adaptedIngredients = (selectedRecipe.ingredients || []).map(ing => {
      const rawQuantity = ing.quantity || 0;
      
      // Les quantités dans MongoDB peuvent être :
      // 1. Par personne (ex: 150g de pomme de terre par personne)
      // 2. Pour baseServings personnes (ex: 600g de pomme de terre pour 4 personnes = 150g/personne)
      // 3. Quantité totale mal formatée (ex: 5000g pour toute la recette)
      //
      // On teste d'abord si c'est pour baseServings personnes
      let quantityPerPerson = rawQuantity / baseServings;
      
      // Si la quantité par personne est anormalement élevée (>500g), analyser le cas
      if (quantityPerPerson > 500) {
        // Si rawQuantity lui-même est > 2000g, c'est probablement une quantité totale mal formatée
        // On limite alors à une valeur réaliste
        if (rawQuantity > 2000) {
          console.log(`⚠️  Quantité très élevée pour "${ing.name}": ${rawQuantity}g. Probablement une quantité totale mal formatée.`);
          console.log(`   → Limitation à 500g/personne maximum (au lieu de ${quantityPerPerson.toFixed(1)}g/personne)`);
          quantityPerPerson = 500; // Limiter à 500g max par personne
        } else if (rawQuantity < 1000) {
          // Si rawQuantity < 1000g mais quantityPerPerson > 500g, c'est probablement déjà par personne
          console.log(`⚠️  Quantité suspecte pour "${ing.name}": ${quantityPerPerson.toFixed(1)}g/personne si divisé par ${baseServings}. Utilisation directe: ${rawQuantity}g/personne`);
          quantityPerPerson = rawQuantity;
        } else {
          // Entre 1000-2000g : probablement pour baseServings mais trop élevé, limiter
          console.log(`⚠️  Quantité élevée pour "${ing.name}": ${rawQuantity}g pour ${baseServings} personnes = ${quantityPerPerson.toFixed(1)}g/personne. Limitation à 500g/personne.`);
          quantityPerPerson = 500;
        }
      }
      
      // Limiter les quantités à des valeurs réalistes par catégorie d'ingrédient
      const ingredientData = getIngredientData(ing.name);
      if (ingredientData) {
        const category = ingredientData.category;
        const maxPerPerson = {
          'cereales': 200,  // Max 200g de céréales/personne (riz, pâtes, quinoa)
          'legumes': 250,   // Max 250g de légumes/personne (accompagnement)
          'viandes': 200,   // Max 200g de viande/personne
          'poissons': 200,  // Max 200g de poisson/personne
          'produits-laitiers': 150, // Max 150g de produits laitiers/personne
          'fruits': 200,    // Max 200g de fruits/personne
          'autres': 300     // Max 300g pour autres
        };
        
        const maxAllowed = maxPerPerson[category] || maxPerPerson['autres'];
        if (quantityPerPerson > maxAllowed) {
          console.log(`⚠️  Quantité limitée pour "${ing.name}": ${quantityPerPerson.toFixed(1)}g → ${maxAllowed}g/personne (max réaliste pour ${category})`);
          quantityPerPerson = maxAllowed;
        }
      }
      
      // ✅ Appliquer le multiplicateur de portion basé sur l'âge
      const adjustedQuantityPerPerson = quantityPerPerson * portionMultiplier;
      const quantityTotal = adjustedQuantityPerPerson * numberOfPeople;
      
      if (portionMultiplier !== 1.0) {
        console.log(`   👶 ${ing.name}: ${quantityPerPerson.toFixed(1)}g → ${adjustedQuantityPerPerson.toFixed(1)}g/pers (×${portionMultiplier.toFixed(2)} pour l'âge)`);
      }
      
      return {
        nom: ing.name,
        unite: ing.unit || 'g',
        quantiteParPersonne: Math.round(adjustedQuantityPerPerson * 10) / 10,
        quantiteTotal: Math.round(quantityTotal * 10) / 10
      };
    });
    
    // Ajuster les quantités pour atteindre les objectifs nutritionnels si nécessaire
    if (nutritionalGoals.length > 0 && !useVariation) {
      console.log(`\n🎯 Ajustement des quantités pour atteindre les objectifs nutritionnels...`);
      
      // Calculer les valeurs nutritionnelles actuelles (par personne)
      const currentNutrition = {};
      adaptedIngredients.forEach(ing => {
        const ingredientData = getIngredientData(ing.nom);
        if (ingredientData) {
          const factor = ing.quantiteParPersonne / 100;
          Object.entries(ingredientData.nutritionalValues).forEach(([key, value]) => {
            currentNutrition[key] = (currentNutrition[key] || 0) + (value * factor);
          });
        }
      });
      
      // Pour chaque objectif non atteint, augmenter les quantités des ingrédients riches en ce nutriment
      nutritionalGoals.forEach(goal => {
        const current = currentNutrition[goal.nutrient] || 0;
        if (current < goal.target) {
          const missing = goal.target - current;
          const ratio = goal.target / Math.max(current, 0.1); // Ratio pour atteindre l'objectif
          
          console.log(`   ${goal.label}: ${current.toFixed(1)}${goal.unit} / ${goal.target}${goal.unit} (manque ${missing.toFixed(1)}${goal.unit})`);
          console.log(`   → Ajustement nécessaire: multiplier par ${ratio.toFixed(2)}`);
          
          // Trouver les ingrédients riches en ce nutriment dans la recette
          const richIngredients = adaptedIngredients
            .map(ing => {
              const ingredientData = getIngredientData(ing.nom);
              if (!ingredientData) return null;
              const value = ingredientData.nutritionalValues[goal.nutrient] || 0;
              return { ing, value, data: ingredientData };
            })
            .filter(item => item && item.value > 0)
            .sort((a, b) => b.value - a.value);
          
          if (richIngredients.length > 0) {
            // Augmenter les quantités des ingrédients les plus riches
            const topIngredient = richIngredients[0];
            const currentValue = (topIngredient.data.nutritionalValues[goal.nutrient] || 0) * (topIngredient.ing.quantiteParPersonne / 100);
            const neededValue = missing;
            const additionalQuantity = (neededValue / (topIngredient.data.nutritionalValues[goal.nutrient] || 1)) * 100;
            
            // Ajuster la quantité de l'ingrédient principal
            topIngredient.ing.quantiteParPersonne = Math.round((topIngredient.ing.quantiteParPersonne + additionalQuantity) * 10) / 10;
            topIngredient.ing.quantiteTotal = topIngredient.ing.quantiteParPersonne * numberOfPeople;
            
            console.log(`   → ${topIngredient.ing.nom}: ${(topIngredient.ing.quantiteParPersonne - additionalQuantity).toFixed(1)}${topIngredient.ing.unite} → ${topIngredient.ing.quantiteParPersonne.toFixed(1)}${topIngredient.ing.unite}`);
          }
        }
      });
    }
    
    // Construire le menu depuis la recette MongoDB
    const recipeAllergens = selectedRecipe.allergens || [];
    console.log(`📋 Allergènes de la recette "${selectedRecipe.name}": ${recipeAllergens.length > 0 ? recipeAllergens.join(', ') : 'AUCUN'}`);
    console.log(`   Type de selectedRecipe.allergens: ${typeof selectedRecipe.allergens}, IsArray: ${Array.isArray(selectedRecipe.allergens)}`);
    
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
      difficulte: selectedRecipe.difficulty || selectedRecipe.difficulte || 'Moyenne',
      allergens: recipeAllergens // Allergènes AFSCA/UE 1169/2011
    };
    
    console.log(`✅ Allergènes inclus dans menuData: ${menuData.allergens.length > 0 ? menuData.allergens.join(', ') : 'AUCUN'}`);
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
  // FORMULE SIMPLE: Pour chaque ingrédient, multiplier la valeur pour 100g par (quantité / 100)
  // Puis additionner tous les ingrédients pour obtenir les totaux
  const enrichedIngredients = adaptedIngredients.map(ing => {
    const ingredientData = getIngredientData(ing.nom);
    if (!ingredientData) {
      console.log(`⚠️  Ingrédient "${ing.nom}" non trouvé dans la database`);
      return null;
    }
    
    // Les quantités sont DÉJÀ par personne (ex: 406.6g quinoa par personne)
    // Calcul direct: (quantité par personne / 100) × valeur pour 100g
    const factor = ing.quantiteParPersonne / 100;
    
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
      calculated: nutritionCalculated // Valeurs nutritionnelles POUR UNE PERSONNE
    };
  }).filter(ing => ing !== null);
  
  // Additionner toutes les valeurs nutritionnelles de tous les ingrédients
  // Les valeurs calculated sont déjà par personne, donc on additionne directement
  const totalsPerPerson = {};
  enrichedIngredients.forEach(ing => {
    for (const [key, value] of Object.entries(ing.calculated)) {
      totalsPerPerson[key] = (totalsPerPerson[key] || 0) + value;
    }
  });
  
  // VÉRIFICATION CRITIQUE: Détecter les valeurs anormalement élevées
  // Une personne ne peut pas consommer > 3000 kcal en un seul repas (normalement 500-1000 kcal)
  if (totalsPerPerson.calories > 3000) {
    console.log(`\n⚠️  ⚠️  ⚠️  VALEURS NUTRITIONNELLES ANORMALEMENT ÉLEVÉES DÉTECTÉES !`);
    console.log(`   Calories par personne: ${totalsPerPerson.calories.toFixed(1)} kcal (normalement 500-1000 kcal)`);
    console.log(`   Les quantités dans la recette sont probablement incorrectes.`);
    
    // Calculer le facteur de correction (diviser par le ratio anormal)
    const normalCalories = 800; // Calories normales pour un repas
    const correctionFactor = normalCalories / totalsPerPerson.calories;
    console.log(`   Correction: Division par ${(1/correctionFactor).toFixed(2)} pour obtenir des valeurs réalistes.`);
    
    // Corriger toutes les valeurs
    for (const [key, value] of Object.entries(totalsPerPerson)) {
      totalsPerPerson[key] = value * correctionFactor;
    }
  }
  
  // Calculer les totaux pour toutes les personnes
  const totals = {};
  for (const [key, value] of Object.entries(totalsPerPerson)) {
    totals[key] = value * numberOfPeople;
  }
  
  const nutrition = {
    total: totals,           // Totaux pour toutes les personnes
    perPerson: totalsPerPerson  // Valeurs par personne (déjà calculées, pas besoin de diviser)
  };
  
  // Vérifier les objectifs avant de retourner
  let allGoalsMet = true;
  const unmetGoals = [];
  
  if (nutritionalGoals.length > 0) {
    nutritionalGoals.forEach(goal => {
      const value = nutrition.perPerson[goal.nutrient] || 0;
      if (value < goal.target) {
        allGoalsMet = false;
        unmetGoals.push({
          ...goal,
          current: value,
          missing: goal.target - value,
          percentage: goal.target > 0 ? ((value / goal.target) * 100) : 0
        });
      }
    });
  }
  
  // ✅ Évaluer les valeurs nutritionnelles selon les références ANSES
  let nutritionalEvaluation = null;
  let primaryAgeRange = null;
  
  if (ageGroups && ageGroups.length > 0) {
    // Trouver le groupe d'âge principal (celui avec le plus d'élèves)
    const sortedGroups = [...ageGroups].sort((a, b) => (b.count || b.peopleCount || 0) - (a.count || a.peopleCount || 0));
    primaryAgeRange = sortedGroups[0]?.ageRange;
    
    if (primaryAgeRange && ANSES_NUTRITIONAL_REFERENCES[primaryAgeRange]) {
      console.log(`\n📊 Évaluation nutritionnelle ANSES pour ${primaryAgeRange}...`);
      nutritionalEvaluation = evaluateNutrition(nutrition.perPerson, primaryAgeRange, 'lunch');
      
      if (nutritionalEvaluation.warnings.length > 0) {
        console.log(`⚠️  Avertissements nutritionnels:`);
        nutritionalEvaluation.warnings.forEach(w => console.log(`   - ${w.message}`));
      }
      if (nutritionalEvaluation.recommendations.length > 0) {
        console.log(`💡 Recommandations:`);
        nutritionalEvaluation.recommendations.forEach(r => console.log(`   - ${r}`));
      }
      if (nutritionalEvaluation.valid) {
        console.log(`✅ Menu conforme aux références ANSES pour ${nutritionalEvaluation.reference}`);
      }
      
      // ✅ NOUVEAU: Si le score est trop bas, suggérer des entrées/desserts concrets
      if (nutritionalEvaluation.score < minANSESScore && generateCompleteMeal) {
        console.log(`\n⚠️ Score ANSES ${nutritionalEvaluation.score}/100 < ${minANSESScore}%. Recherche de compléments...`);
        
        // Analyser ce qui est DÉJÀ présent dans le plat
        const ingredientNames = (selectedRecipe.ingredients || []).map(i => (i.name || '').toLowerCase()).join(' ');
        const recipeName = (selectedRecipe.name || '').toLowerCase();
        const hasStarch = /riz|pâtes|pasta|pomme.?de.?terre|patate|semoule|boulgour|quinoa|pain|féculent/i.test(ingredientNames + ' ' + recipeName);
        const hasVegetables = /légume|carotte|haricot|courgette|tomate|poivron|brocoli|épinard|chou/i.test(ingredientNames + ' ' + recipeName);
        const hasProtein = /poulet|boeuf|veau|porc|poisson|saumon|cabillaud|thon|oeuf|œuf|jambon/i.test(ingredientNames + ' ' + recipeName);
        
        console.log(`   📊 Analyse du plat: féculents=${hasStarch}, légumes=${hasVegetables}, protéine=${hasProtein}`);
        
        // Calculer le déficit calorique
        const currentCalories = nutrition.perPerson.calories || 0;
        const targetCalories = ANSES_NUTRITIONAL_REFERENCES[primaryAgeRange]?.lunch?.calories?.min || 280;
        const calorieDeficit = Math.max(0, targetCalories - currentCalories);
        
        // Chercher des entrées et desserts pour compléter
        const suggestions = [];
        
        // Si déficit > 100 kcal, suggérer une entrée ET un dessert
        // Si déficit 50-100 kcal, suggérer soit une entrée soit un dessert
        try {
          if (calorieDeficit > 50) {
            // Chercher une entrée (soupe, salade)
            const entrees = await RecipeEnriched.find({
              category: { $in: ['entrée', 'soupe'] },
              // Respecter les mêmes allergènes
              $or: allergens.length > 0 
                ? [{ allergens: { $nin: allergens } }, { allergens: { $exists: false } }]
                : [{}]
            }).limit(5).lean();
            
            if (entrees.length > 0) {
              const entree = entrees[Math.floor(Math.random() * entrees.length)];
              suggestions.push({
                type: 'entrée',
                name: entree.name,
                category: entree.category,
                recipeId: entree._id,
                calories: entree.nutritionalProfile?.calories || 50,
                reason: 'Compléter le repas avec une entrée pour atteindre les besoins caloriques'
              });
            }
            
            // Chercher un dessert (fruit, compote, yaourt)
            const desserts = await RecipeEnriched.find({
              category: 'dessert',
              $or: allergens.length > 0 
                ? [{ allergens: { $nin: allergens } }, { allergens: { $exists: false } }]
                : [{}]
            }).limit(5).lean();
            
            if (desserts.length > 0) {
              const dessert = desserts[Math.floor(Math.random() * desserts.length)];
              suggestions.push({
                type: 'dessert',
                name: dessert.name,
                category: dessert.category,
                recipeId: dessert._id,
                calories: dessert.nutritionalProfile?.calories || 80,
                reason: 'Ajouter un dessert pour compléter l\'apport énergétique'
              });
            }
          }
          
          // Si pas assez de suggestions, ajouter des suggestions génériques
          if (suggestions.length === 0) {
            if (calorieDeficit > 100) {
              suggestions.push({ type: 'entrée', name: 'Soupe de légumes', calories: 50, reason: 'Entrée légère pour compléter' });
              suggestions.push({ type: 'dessert', name: 'Compote de fruits', calories: 80, reason: 'Dessert pour l\'énergie' });
            } else if (calorieDeficit > 50) {
              suggestions.push({ type: 'dessert', name: 'Fruit frais de saison', calories: 60, reason: 'Dessert vitaminé' });
            }
          }
          
        } catch (error) {
          console.error('Erreur recherche compléments:', error);
        }
        
        // Stocker les suggestions
        nutritionalEvaluation.suggestedCompletions = suggestions;
        nutritionalEvaluation.calorieDeficit = calorieDeficit;
        nutritionalEvaluation.hasStarch = hasStarch;
        nutritionalEvaluation.hasVegetables = hasVegetables;
        nutritionalEvaluation.hasProtein = hasProtein;
        
        // Message clair et intelligent
        if (suggestions.length > 0) {
          const suggestionNames = suggestions.map(s => `${s.type}: ${s.name}`).join(' + ');
          nutritionalEvaluation.completionMessage = `⚠️ Repas incomplet (${currentCalories.toFixed(0)} kcal / ${targetCalories} kcal min). Complétez avec: ${suggestionNames}`;
        } else {
          nutritionalEvaluation.completionMessage = `⚠️ Augmentez les portions pour atteindre les besoins caloriques (${calorieDeficit.toFixed(0)} kcal manquantes).`;
        }
        
        console.log(`💡 Suggestions pour compléter le repas:`);
        suggestions.forEach(s => console.log(`   - ${s.type}: ${s.name} (+${s.calories} kcal)`));
      }
    }
  }
  
  // ✅ GÉNÉRATION AUTOMATIQUE D'ALTERNATIVES pour les élèves allergiques
  let alternatives = [];
  
  // Récupérer les détails des allergies depuis les groupes d'âge
  const allergyDetails = [];
  if (ageGroups && ageGroups.length > 0) {
    ageGroups.forEach(group => {
      if (group.allergies && group.allergies.length > 0) {
        group.allergies.forEach(allergy => {
          const existing = allergyDetails.find(a => a.type === allergy.type);
          if (existing) {
            existing.count += allergy.count || 1;
          } else {
            allergyDetails.push({ type: allergy.type, count: allergy.count || 1 });
          }
        });
      }
    });
  }
  
  // Si on a des allergies déclarées, vérifier si le menu principal les contient
  if (allergyDetails.length > 0) {
    const menuAllergens = (menuData.allergens || []).map(a => a.toLowerCase());
    const menuName = (menuData.nomMenu || '').toLowerCase();
    
    // Mapping des allergènes vers mots-clés
    const allergenKeywordsCheck = {
      'gluten': ['gluten', 'blé', 'farine', 'pâte', 'pain', 'semoule', 'céréale'],
      'lactose': ['lactose', 'lait', 'fromage', 'crème', 'beurre', 'yaourt', 'dairy'],
      'arachides': ['arachide', 'cacahuète', 'peanut'],
      'fruits_a_coque': ['noix', 'noisette', 'amande', 'pistache', 'cajou', 'nut'],
      'œufs': ['œuf', 'oeuf', 'egg', 'mayonnaise'],
      'poisson': ['poisson', 'saumon', 'thon', 'cabillaud', 'merlu', 'fish'],
      'crustaces': ['crustacé', 'crevette', 'crabe', 'homard', 'langouste'],
      'soja': ['soja', 'tofu', 'soy'],
      'celeri': ['céleri', 'celeri'],
      'moutarde': ['moutarde', 'mustard'],
      'sesame': ['sésame', 'sesame'],
      'mollusques': ['mollusque', 'moule', 'huître', 'calamar'],
      'sulfites': ['sulfite', 'vin'],
      'lupin': ['lupin']
    };
    
    for (const allergy of allergyDetails) {
      const allergyType = allergy.type.toLowerCase();
      
      // Vérifier si le menu est déjà compatible (indiqué "sans X")
      if (menuName.includes(`sans ${allergyType}`) || menuName.includes(`(sans ${allergyType})`)) {
        console.log(`✅ Menu "${menuData.nomMenu}" déjà compatible pour ${allergyType}`);
        alternatives.push({
          allergen: allergy.type,
          count: allergy.count,
          needed: false,
          message: `Menu compatible - déjà sans ${allergy.type}`,
          mainMenuOk: true
        });
        continue;
      }
      
      // Vérifier si l'allergène est présent dans le menu
      const keywords = allergenKeywordsCheck[allergyType] || [allergyType];
      const isPresent = menuAllergens.some(ma => keywords.some(kw => ma.includes(kw))) ||
                        keywords.some(kw => menuAllergens.includes(kw));
      
      if (!isPresent) {
        console.log(`✅ Allergène "${allergyType}" non présent dans le menu`);
        alternatives.push({
          allergen: allergy.type,
          count: allergy.count,
          needed: false,
          message: `Menu compatible - ne contient pas de ${allergy.type}`,
          mainMenuOk: true
        });
        continue;
      }
      
      // ✅ L'allergène EST présent - chercher une alternative
      console.log(`🔄 Recherche d'alternative sans ${allergyType} pour ${allergy.count} élève(s)...`);
      
      try {
        // Chercher une recette de même catégorie sans cet allergène
        const alternativeFilters = {
          category: selectedRecipe.category,
          allergens: { $nin: keywords },
          _id: { $ne: selectedRecipe._id }
        };
        
        // Chercher aussi dans les tags/nom pour "sans X"
        const alternativeRecipes = await RecipeEnriched.find({
          $and: [
            { category: selectedRecipe.category },
            { _id: { $ne: selectedRecipe._id } },
            {
              $or: [
                { allergens: { $nin: keywords } },
                { name: { $regex: `sans ${allergyType}`, $options: 'i' } },
                { tags: { $regex: `sans.?${allergyType}`, $options: 'i' } }
              ]
            }
          ]
        }).limit(5);
        
        if (alternativeRecipes.length > 0) {
          // Choisir une alternative au hasard parmi les options
          const altRecipe = alternativeRecipes[Math.floor(Math.random() * alternativeRecipes.length)];
          
          console.log(`✅ Alternative trouvée: "${altRecipe.name}"`);
          
          alternatives.push({
            allergen: allergy.type,
            count: allergy.count,
            needed: true,
            mainMenuOk: false,
            alternative: {
              name: altRecipe.name,
              description: altRecipe.description || `Alternative sans ${allergy.type}`,
              recipeId: altRecipe._id,
              category: altRecipe.category,
              servings: allergy.count // Nombre de portions à préparer
            }
          });
        } else {
          // Pas d'alternative trouvée - suggérer une modification
          console.log(`⚠️ Pas d'alternative trouvée pour ${allergyType}`);
          
          alternatives.push({
            allergen: allergy.type,
            count: allergy.count,
            needed: true,
            mainMenuOk: false,
            alternative: null,
            suggestion: `Adapter le menu principal en retirant les ingrédients contenant ${allergy.type}`
          });
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la recherche d'alternative pour ${allergyType}:`, error);
        alternatives.push({
          allergen: allergy.type,
          count: allergy.count,
          needed: true,
          mainMenuOk: false,
          alternative: null,
          suggestion: `Prévoir une alternative sans ${allergy.type}`
        });
      }
    }
  }
  
  // Calculer combien d'élèves peuvent manger le menu principal
  const studentsOnMainMenu = numberOfPeople - alternatives
    .filter(a => a.needed && !a.mainMenuOk)
    .reduce((sum, a) => sum + a.count, 0);
  
  return {
    menu: menuData,
    nutrition: nutrition,
    numberOfPeople: numberOfPeople,
    nutritionalGoals: nutritionalGoals,
    ingredients: enrichedIngredients,
    source: useVariation ? 'mongodb+ai-variation' : 'mongodb+ai-selection',
    recipeId: useVariation ? null : selectedRecipe._id,
    baseRecipeId: useVariation ? selectedRecipe._id : null,
    goalsStatus: {
      allMet: allGoalsMet,
      unmetGoals: unmetGoals,
      goalsDetails: nutritionalGoals.map(goal => {
        const value = nutrition.perPerson[goal.nutrient] || 0;
        return {
          ...goal,
          current: value,
          met: value >= goal.target,
          percentage: goal.target > 0 ? ((value / goal.target) * 100) : 0
        };
      })
    },
    // ✅ Nouveau: Évaluation nutritionnelle ANSES par tranche d'âge
    nutritionalEvaluation: nutritionalEvaluation,
    ageGroup: primaryAgeRange,
    ansesReference: primaryAgeRange ? ANSES_NUTRITIONAL_REFERENCES[primaryAgeRange] : null,
    // ✅ Nouveau: Alternatives automatiques pour les allergies
    alternatives: alternatives,
    studentsOnMainMenu: studentsOnMainMenu,
    allergyDetails: allergyDetails,
    // ✅ NOUVEAU: Info sur les critères de durabilité appliqués
    sustainability: hasSustainabilityPrefs ? {
      applied: true,
      criteria: sustainability,
      recipeSustainabilityScore: selectedRecipe.sustainabilityScore || 0
    } : { applied: false },
    // ✅ NOUVEAU: Info sur la saisonnalité des ingrédients
    seasonality: calculateSeasonalityScore(selectedRecipe)
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
  
  // Vérifier les objectifs et ajuster si nécessaire
  let allGoalsMet = true;
  const unmetGoals = [];
  
  nutritionalGoals.forEach(goal => {
    const value = nutrition.perPerson[goal.nutrient] || 0;
    const met = value >= goal.target;
    const icon = met ? '✅' : '⚠️';
    const percentage = goal.target > 0 ? ((value / goal.target) * 100).toFixed(0) : 0;
    console.log(`   • ${goal.label} : ${value.toFixed(1)} ${goal.unit} / ${goal.target}${goal.unit} (${percentage}%) ${icon}`);
    if (!met) {
      allGoalsMet = false;
      unmetGoals.push({
        ...goal,
        current: value,
        missing: goal.target - value,
        percentage: parseFloat(percentage)
      });
    }
  });
  
  console.log('\n' + '='.repeat(70));
  
  if (allGoalsMet) {
    console.log('✅ Tous les objectifs nutritionnels sont atteints !');
  } else {
    console.log('⚠️  Certains objectifs ne sont pas atteints');
    console.log('\n📋 Objectifs non atteints:');
    unmetGoals.forEach(goal => {
      console.log(`   • ${goal.label}: ${goal.current.toFixed(1)}${goal.unit} / ${goal.target}${goal.unit} (manque ${goal.missing.toFixed(1)}${goal.unit})`);
    });
    console.log('\n💡 Suggestion: Augmenter les quantités des ingrédients riches en ces nutriments ou ajouter des accompagnements.');
  }
  
  console.log('='.repeat(70) + '\n');
  
  // Retourner aussi les informations sur les objectifs non atteints
  return {
    menu: menuData,
    nutrition: nutrition,
    numberOfPeople: numberOfPeople,
    nutritionalGoals: nutritionalGoals,
    ingredients: enrichedIngredients,
    source: useVariation ? 'mongodb+ai-variation' : 'mongodb+ai-selection',
    recipeId: useVariation ? null : selectedRecipe._id,
    baseRecipeId: useVariation ? selectedRecipe._id : null,
    goalsStatus: {
      allMet: allGoalsMet,
      unmetGoals: unmetGoals,
      goalsDetails: nutritionalGoals.map(goal => {
        const value = nutrition.perPerson[goal.nutrient] || 0;
        return {
          ...goal,
          current: value,
          met: value >= goal.target,
          percentage: goal.target > 0 ? ((value / goal.target) * 100) : 0
        };
      })
    }
  };
}

