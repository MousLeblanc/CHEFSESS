// controllers/modularMenuController.js
import asyncHandler from 'express-async-handler';
import RecipeComponent from '../models/RecipeComponent.js';
import RecipeTemplate from '../models/RecipeTemplate.js';

// @desc    Générer un menu modulaire
// @route   POST /api/menu/generate-modular
// @access  Private
export const generateModularMenu = asyncHandler(async (req, res) => {
  console.log('🍽️ Génération modulaire - Données reçues:', JSON.stringify(req.body, null, 2));
  
  const {
    numberOfPeople = 4,
    mealType = 'déjeuner',
    dietaryRestrictions = [],
    allergens = [],
    useStockOnly = false,
    proteinId = null, // Si sélection manuelle
    sauceId = null,
    accompanimentId = null,
    avoidProteins = [], // IDs de protéines à éviter (pour éviter les répétitions)
    previousMenus = [], // Historique des menus récents
    stockItems = [] // Liste des items en stock (si useStockOnly)
  } = req.body;
  
  console.log('📊 Paramètres:', { numberOfPeople, mealType, dietaryRestrictions, allergens });
  
  let protein, sauce, accompaniment;
  
  // Mode automatique ou manuel
  if (proteinId) {
    // Mode manuel : utiliser les IDs fournis
    protein = await RecipeComponent.findById(proteinId);
    if (!protein || protein.type !== 'protein') {
      res.status(400);
      throw new Error('Protéine invalide');
    }
    
    if (sauceId) {
      sauce = await RecipeComponent.findById(sauceId);
      if (!sauce || sauce.type !== 'sauce') {
        res.status(400);
        throw new Error('Sauce invalide');
      }
      // Vérifier la compatibilité
      if (!sauce.compatibleWith.proteins.includes(protein._id)) {
        res.status(400);
        throw new Error('Sauce non compatible avec cette protéine');
      }
    }
    
    if (accompanimentId) {
      accompaniment = await RecipeComponent.findById(accompanimentId);
      if (!accompaniment || accompaniment.type !== 'accompaniment') {
        res.status(400);
        throw new Error('Accompagnement invalide');
      }
      if (!accompaniment.compatibleWith.proteins.includes(protein._id)) {
        res.status(400);
        throw new Error('Accompagnement non compatible avec cette protéine');
      }
    }
  } else {
    // Mode automatique : sélectionner optimalement
    console.log('🔍 Recherche d\'une protéine optimale...');
    protein = await selectOptimalProtein({
      restrictions: dietaryRestrictions,
      allergens,
      avoid: avoidProteins,
      useStockOnly,
      stockItems
    });
    
    if (!protein) {
      console.error('❌ Aucune protéine trouvée');
      res.status(400);
      throw new Error('Aucune protéine compatible trouvée avec les critères sélectionnés. Veuillez ajuster les restrictions ou vérifier que les composants modulaires sont bien dans la base de données.');
    }
    
    console.log('✅ Protéine sélectionnée:', protein.name);
    
    // Trouver les composants compatibles
    console.log('🔍 Recherche de sauces compatibles...');
    const compatibleSauces = await findCompatibleComponents({
      type: 'sauce',
      proteinId: protein._id,
      restrictions: dietaryRestrictions,
      allergens,
      useStockOnly,
      stockItems
    });
    console.log(`✅ ${compatibleSauces.length} sauce(s) compatible(s) trouvée(s)`);
    
    console.log('🔍 Recherche d\'accompagnements compatibles...');
    const compatibleAccompaniments = await findCompatibleComponents({
      type: 'accompaniment',
      proteinId: protein._id,
      restrictions: dietaryRestrictions,
      allergens,
      useStockOnly,
      stockItems
    });
    console.log(`✅ ${compatibleAccompaniments.length} accompagnement(s) compatible(s) trouvé(s)`);
    
    // Sélectionner optimalement
    const combination = selectOptimalCombination({
      protein,
      sauces: compatibleSauces,
      accompaniments: compatibleAccompaniments,
      previousMenus,
      useStockOnly,
      stockItems
    });
    
    sauce = combination.sauce;
    accompaniment = combination.accompaniment;
  }
  
  // Créer le template
  try {
    console.log('📝 Création du template...');
    console.log('   - Protéine ID:', protein._id);
    console.log('   - Sauce ID:', sauce?._id || 'null');
    console.log('   - Accompagnement ID:', accompaniment?._id || 'null');
    console.log('   - User ID:', req.user._id);
    console.log('   - Meal Type:', mealType || 'déjeuner');
    console.log('   - Number of People:', numberOfPeople || 4);
    
    // Créer le template avec un nom temporaire pour éviter l'erreur de validation
    const templateName = `${protein.name}${sauce ? ` avec ${sauce.name}` : ''}${accompaniment ? ` et ${accompaniment.name}` : ''}`;
    console.log('   - Nom du template:', templateName);
    
    const template = new RecipeTemplate({
      name: templateName, // Nom explicite pour éviter l'erreur de validation
      protein: protein._id,
      sauce: sauce?._id || undefined,
      accompaniment: accompaniment?._id || undefined,
      mealType: mealType || 'déjeuner',
      defaultServings: numberOfPeople || 4,
      isAutoGenerated: !proteinId,
      createdBy: req.user._id
    });
    
    // Populate pour calculer les totaux (le pre-save hook le fera aussi, mais on le fait ici pour être sûr)
    console.log('   - Population des composants...');
    await template.populate(['protein', 'sauce', 'accompaniment']);
    console.log('   - Protéine populée:', template.protein?.name);
    console.log('   - Sauce populée:', template.sauce?.name || 'null');
    console.log('   - Accompagnement populé:', template.accompaniment?.name || 'null');
    
    console.log('💾 Sauvegarde du template...');
    try {
      await template.save();
      console.log('✅ Template sauvegardé:', template._id);
    } catch (saveError) {
      console.error('❌ Erreur lors de la sauvegarde du template:', saveError);
      console.error('Détails:', {
        message: saveError.message,
        name: saveError.name,
        code: saveError.code,
        errors: saveError.errors ? Object.keys(saveError.errors) : 'none'
      });
      if (saveError.errors) {
        Object.keys(saveError.errors).forEach(key => {
          console.error(`   - ${key}:`, saveError.errors[key].message);
        });
      }
      throw saveError;
    }
  
    // Vérifier le stock si demandé
    let stockCheck = null;
    if (useStockOnly && stockItems.length > 0) {
      stockCheck = await checkStockAvailability(template, numberOfPeople, stockItems);
    }
  
    // Re-populate pour retourner les données complètes
    await template.populate(['protein', 'sauce', 'accompaniment']);
  
    console.log('✅ Génération modulaire réussie');
    res.json({
      success: true,
      data: {
        template,
        stockCheck,
        combination: {
          protein: protein.name,
          sauce: sauce?.name || null,
          accompaniment: accompaniment?.name || null
        }
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création du template:', error);
    console.error('Stack:', error.stack);
    console.error('Error details:', {
      message: error.message,
      name: error.name,
      errors: error.errors,
      code: error.code
    });
    
    // Retourner une erreur plus détaillée
    const errorMessage = error.message || 'Erreur inconnue lors de la création du menu modulaire';
    res.status(500).json({
      success: false,
      error: errorMessage,
      details: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        errors: error.errors
      } : undefined
    });
  }
});

// Fonction pour sélectionner une protéine optimale
async function selectOptimalProtein({ restrictions, allergens, avoid, useStockOnly, stockItems }) {
  const query = {
    type: 'protein'
  };
  
  // Exclure les allergènes seulement s'il y en a
  if (allergens && allergens.length > 0) {
    query.allergens = { $nin: allergens };
  }
  
  // Filtrer par restrictions seulement si nécessaire
  // Si restrictions = [], on accepte tout
  // Si restrictions contient des valeurs, on cherche des protéines compatibles OU sans restrictions
  if (restrictions && restrictions.length > 0) {
    query.$or = [
      { dietaryRestrictions: { $in: restrictions } },
      { dietaryRestrictions: { $size: 0 } }, // Aucune restriction
      { dietaryRestrictions: { $exists: false } } // Champ non défini
    ];
  }
  
  // Exclure les protéines récemment utilisées
  if (avoid.length > 0) {
    query._id = { $nin: avoid };
  }
  
  // Filtrer par stock si demandé
  if (useStockOnly && stockItems.length > 0) {
    const availableProteins = await filterByStock(query, stockItems);
    if (availableProteins.length === 0) {
      return null;
    }
    return selectRandom(availableProteins);
  }
  
  const proteins = await RecipeComponent.find(query).limit(50);
  if (proteins.length === 0) {
    // Si aucune protéine trouvée avec les restrictions, essayer sans restrictions
    const fallbackQuery = { type: 'protein' };
    if (allergens && allergens.length > 0) {
      fallbackQuery.allergens = { $nin: allergens };
    }
    if (avoid.length > 0) {
      fallbackQuery._id = { $nin: avoid };
    }
    const fallbackProteins = await RecipeComponent.find(fallbackQuery).limit(50);
    if (fallbackProteins.length === 0) {
      return null;
    }
    return selectRandom(fallbackProteins);
  }
  
  return selectRandom(proteins);
}

// Fonction pour trouver les composants compatibles
async function findCompatibleComponents({ type, proteinId, restrictions, allergens, useStockOnly, stockItems }) {
  // Construire la requête de base
  const baseQuery = { type: type };
  
  // Exclure les allergènes seulement s'il y en a
  if (allergens && allergens.length > 0) {
    baseQuery.allergens = { $nin: allergens };
  }
  
  // Récupérer tous les composants de ce type qui respectent les allergènes
  let components = await RecipeComponent.find(baseQuery).limit(100);
  
  // Filtrer par compatibilité avec la protéine (en mémoire pour plus de flexibilité)
  if (proteinId) {
    components = components.filter(comp => {
      // Si compatibleWith n'existe pas ou est vide, c'est compatible avec tout
      if (!comp.compatibleWith || !comp.compatibleWith.proteins || comp.compatibleWith.proteins.length === 0) {
        return true;
      }
      // Vérifier si l'ID de la protéine est dans le tableau
      return comp.compatibleWith.proteins.some(id => id.toString() === proteinId.toString());
    });
  }
  
  // Filtrer par restrictions diététiques
  if (restrictions && restrictions.length > 0) {
    components = components.filter(comp => {
      // Si pas de restrictions définies, c'est compatible
      if (!comp.dietaryRestrictions || comp.dietaryRestrictions.length === 0) {
        return true;
      }
      // Vérifier si au moins une restriction correspond
      return restrictions.some(restriction => comp.dietaryRestrictions.includes(restriction));
    });
  }
  
  // Filtrer par stock si demandé
  if (useStockOnly && stockItems.length > 0) {
    components = await filterByStock(components, stockItems);
  }
  
  return components;
}

// Fonction pour sélectionner la meilleure combinaison
function selectOptimalCombination({ protein, sauces, accompaniments, previousMenus, useStockOnly, stockItems }) {
  const combinations = [];
  
  // Si pas de sauces/accompagnements, retourner null
  const availableSauces = sauces.length > 0 ? sauces : [null];
  const availableAccompaniments = accompaniments.length > 0 ? accompaniments : [null];
  
  for (const sauce of availableSauces) {
    for (const accompaniment of availableAccompaniments) {
      const score = calculateCombinationScore({
        protein,
        sauce,
        accompaniment,
        previousMenus,
        useStockOnly,
        stockItems
      });
      
      combinations.push({
        protein,
        sauce,
        accompaniment,
        score
      });
    }
  }
  
  // Trier par score et retourner la meilleure
  combinations.sort((a, b) => b.score - a.score);
  
  return combinations[0] || { protein, sauce: null, accompaniment: null };
}

// Fonction pour calculer le score d'une combinaison
function calculateCombinationScore({ protein, sauce, accompaniment, previousMenus, useStockOnly, stockItems }) {
  let score = 100;
  
  // Pénalité si cette combinaison a déjà été utilisée récemment
  if (previousMenus && previousMenus.length > 0) {
    const recentCombination = previousMenus.find(menu => {
      const menuProtein = menu.protein?._id?.toString() || menu.protein;
      const menuSauce = menu.sauce?._id?.toString() || menu.sauce;
      const menuAccompaniment = menu.accompaniment?._id?.toString() || menu.accompaniment;
      
      return menuProtein === protein._id.toString() &&
             (!sauce || menuSauce === sauce._id.toString()) &&
             (!accompaniment || menuAccompaniment === accompaniment._id.toString());
    });
    
    if (recentCombination) {
      score -= 50; // Forte pénalité pour répétition
    }
    
    // Pénalité si même protéine récemment utilisée
    const recentProtein = previousMenus.find(menu => {
      const menuProtein = menu.protein?._id?.toString() || menu.protein;
      return menuProtein === protein._id.toString();
    });
    
    if (recentProtein) {
      score -= 20; // Pénalité modérée
    }
  }
  
  // Bonus si tous les ingrédients sont en stock
  if (useStockOnly && stockItems && stockItems.length > 0) {
    // Vérification simplifiée (à améliorer avec vraie vérification de stock)
    score += 30;
  }
  
  // Bonus pour équilibre nutritionnel (à implémenter)
  // score += calculateNutritionBalance({ protein, sauce, accompaniment }) * 10;
  
  // Bonus pour variété (éviter même sauce/accompagnement que récemment)
  if (previousMenus && previousMenus.length > 0) {
    if (sauce) {
      const recentSauce = previousMenus.find(menu => {
        const menuSauce = menu.sauce?._id?.toString() || menu.sauce;
        return menuSauce === sauce._id.toString();
      });
      if (!recentSauce) {
        score += 5; // Bonus pour variété de sauce
      }
    }
    
    if (accompaniment) {
      const recentAccompaniment = previousMenus.find(menu => {
        const menuAccompaniment = menu.accompaniment?._id?.toString() || menu.accompaniment;
        return menuAccompaniment === accompaniment._id.toString();
      });
      if (!recentAccompaniment) {
        score += 5; // Bonus pour variété d'accompagnement
      }
    }
  }
  
  return score;
}

// Fonction pour filtrer par stock (simplifiée)
async function filterByStock(queryOrComponents, stockItems) {
  // Si c'est une query, exécuter d'abord
  const components = Array.isArray(queryOrComponents) 
    ? queryOrComponents 
    : await RecipeComponent.find(queryOrComponents);
  
  // Vérification simplifiée : vérifier si les ingrédients principaux sont en stock
  // À améliorer avec une vraie vérification de stock
  return components.filter(component => {
    if (!component.ingredients || component.ingredients.length === 0) {
      return true; // Si pas d'ingrédients, considérer comme disponible
    }
    
    // Vérifier si au moins un ingrédient principal est en stock
    const mainIngredient = component.ingredients[0];
    const inStock = stockItems.some(item => 
      item.name.toLowerCase().includes(mainIngredient.name.toLowerCase()) ||
      mainIngredient.name.toLowerCase().includes(item.name.toLowerCase())
    );
    
    return inStock;
  });
}

// Fonction pour vérifier la disponibilité du stock
async function checkStockAvailability(template, numberOfPeople, stockItems) {
  const requiredIngredients = template.getIngredientsForServings(numberOfPeople);
  const stockMap = new Map(stockItems.map(item => [item.name.toLowerCase(), item]));
  
  const availability = requiredIngredients.map(ing => {
    const stockItem = stockMap.get(ing.name.toLowerCase());
    const available = stockItem ? stockItem.quantity : 0;
    const needed = ing.quantity;
    
    return {
      name: ing.name,
      needed,
      available,
      unit: ing.unit,
      status: available >= needed ? 'available' : available > 0 ? 'low' : 'unavailable'
    };
  });
  
  const allAvailable = availability.every(item => item.status === 'available');
  const hasUnavailable = availability.some(item => item.status === 'unavailable');
  
  return {
    allAvailable,
    hasUnavailable,
    items: availability
  };
}

// Fonction utilitaire pour sélectionner aléatoirement
function selectRandom(array) {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

