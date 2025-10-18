// scripts/merge-recipes.js
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
dotenv.config({ path: join(dirname(fileURLToPath(import.meta.url)), '../.env') });

import mongoose from 'mongoose';
import Recipe from '../recipe.model.js';

// Importer les deux datasets
import recipesData from '../client/js/recipes.js';
import enrichedRecipesData from '../client/js/recipes_enriched_full.js';

// Fonction pour normaliser le nom d'une recette (suppression des accents, minuscules, etc.)
function normalizeRecipeName(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
    .replace(/[^\w\s]/g, '') // Supprimer la ponctuation
    .replace(/\s+/g, ' ') // Normaliser les espaces
    .trim();
}

// Fonction pour calculer la similarité entre deux noms de recettes
function calculateSimilarity(name1, name2) {
  const normalized1 = normalizeRecipeName(name1);
  const normalized2 = normalizeRecipeName(name2);
  
  // Si les noms sont identiques après normalisation
  if (normalized1 === normalized2) return 1.0;
  
  // Calculer la similarité basée sur les mots communs
  const words1 = normalized1.split(' ');
  const words2 = normalized2.split(' ');
  
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  return commonWords.length / totalWords;
}

// Fonction pour détecter les allergènes dans les ingrédients
function detectAllergens(ingredients) {
  const allergens = new Set();
  
  const allergenMap = {
    'gluten': ['pâtes', 'pâte', 'farine', 'pain', 'chapelure', 'semoule', 'blé', 'biscuit', 'brioche', 'pizza', 'quiche'],
    'lactose': ['lait', 'crème', 'fromage', 'beurre', 'gruyère', 'parmesan', 'yaourt', 'emmental', 'mozzarella', 'chèvre', 'brie', 'camembert'],
    'oeufs': ['œuf', 'oeuf', 'mayonnaise', 'mayo', 'omelette'],
    'poisson': ['poisson', 'colin', 'dorade', 'saumon', 'thon', 'cabillaud', 'truite', 'sardine', 'anchois', 'merlu'],
    'crustaces': ['crevette', 'crabe', 'homard', 'langoustine', 'écrevisse'],
    'mollusques': ['moule', 'huître', 'calamar', 'seiche', 'poulpe', 'escargot'],
    'soja': ['soja', 'tofu', 'sauce soja', 'miso'],
    'fruits_a_coque': ['noix', 'amande', 'noisette', 'cajou', 'pistache', 'pécan', 'macadamia'],
    'arachides': ['cacahuète', 'arachide', 'cacahouète'],
    'sesame': ['sésame', 'tahini'],
    'moutarde': ['moutarde'],
    'celeri': ['céleri', 'celeri'],
    'sulfites': ['vin', 'vinaigre'],
    'lupin': ['lupin']
  };
  
  ingredients.forEach(ing => {
    const ingredientName = (ing.name || ing.item || '').toLowerCase();
    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some(keyword => ingredientName.includes(keyword))) {
        allergens.add(allergen);
      }
    });
  });
  
  return Array.from(allergens);
}

// Fonction pour mapper les types d'âge
function mapAgeGroup(types, ageGroup) {
  if (ageGroup) return ageGroup;
  if (!types || !Array.isArray(types)) return '2.5-18';
  
  if (types.includes('enfants')) {
    return '2.5-12';
  } else if (types.includes('adultes')) {
    return '12-18';
  } else if (types.includes('seniors')) {
    return '18+';
  }
  
  return '2.5-18';
}

// Fonction pour mapper les régimes alimentaires
function mapDietaryRestrictions(diet, category) {
  if (!diet || !Array.isArray(diet)) {
    // Essayer de déterminer à partir de la catégorie
    if (category === 'vegetarien') return ['vegetarien'];
    if (category === 'vegan') return ['vegan'];
    return [];
  }
  
  const restrictions = [];
  
  diet.forEach(d => {
    switch (d.toLowerCase()) {
      case 'omnivore':
        break;
      case 'vegetarien':
        restrictions.push('vegetarien');
        break;
      case 'vegetalien':
      case 'vegan':
        restrictions.push('vegan');
        break;
      case 'sans_gluten':
        restrictions.push('sans_gluten');
        break;
      case 'sans_lactose':
        restrictions.push('sans_lactose');
        break;
      case 'halal':
        restrictions.push('halal');
        break;
      case 'casher':
        restrictions.push('casher');
        break;
    }
  });
  
  return restrictions;
}

// Fonction pour mapper les pathologies
function mapMedicalConditions(pathologies) {
  if (!pathologies || !Array.isArray(pathologies)) return [];
  
  const conditions = [];
  
  pathologies.forEach(p => {
    switch (p.toLowerCase()) {
      case 'aucune':
        break;
      case 'intolérance lactose':
        conditions.push('maladie_coeliaque');
        break;
      case 'diabète':
        conditions.push('diabete');
        break;
      case 'hypertension':
        conditions.push('hypertension');
        break;
      case 'cholestérol':
        conditions.push('cholesterol');
        break;
      case 'dysphagie':
        conditions.push('dysphagie');
        break;
      case 'texture_modifiee':
        conditions.push('texture_modifiee');
        break;
    }
  });
  
  return conditions;
}

// Fonction pour détecter le composant du repas
function detectMealComponent(tags, name, ingredients) {
  const tagString = (tags || []).join(' ').toLowerCase();
  const nameLower = (name || '').toLowerCase();
  const ingredientNames = (ingredients || []).map(ing => (ing.name || ing.item || '').toLowerCase()).join(' ');
  
  // Soupe
  if (tagString.includes('soupe') || nameLower.includes('soupe') || 
      nameLower.includes('velouté') || nameLower.includes('potage') || 
      nameLower.includes('bouillon')) {
    return 'soupe';
  }
  
  // Entrée
  if (tagString.includes('entrée') || tagString.includes('entree') || 
      (tagString.includes('salade') && !tagString.includes('composée'))) {
    return 'entree';
  }
  
  // Dessert
  if (tagString.includes('dessert') || nameLower.includes('compote') || 
      nameLower.includes('yaourt') || nameLower.includes('crème') || 
      nameLower.includes('gâteau') || nameLower.includes('tarte') || 
      nameLower.includes('flan') || nameLower.includes('sorbet') || 
      nameLower.includes('glace')) {
    return 'dessert';
  }
  
  // Féculent seul
  const feculentKeywords = ['riz', 'pâtes', 'semoule', 'pommes de terre', 'purée', 'polenta'];
  const hasOnlyFeculent = feculentKeywords.some(kw => nameLower.includes(kw)) && 
    !['poulet', 'poisson', 'viande', 'saumon', 'colin', 'boeuf', 'porc'].some(kw => nameLower.includes(kw));
  if (hasOnlyFeculent) {
    return 'feculent';
  }
  
  // Protéine
  const proteineKeywords = ['poulet', 'poisson', 'saumon', 'colin', 'dorade', 'thon', 'cabillaud', 
                            'boeuf', 'veau', 'agneau', 'porc', 'jambon', 'steak', 'filet', 'escalope'];
  const hasProteine = proteineKeywords.some(kw => nameLower.includes(kw) || ingredientNames.includes(kw));
  if (hasProteine) {
    return 'proteine';
  }
  
  // Légumes
  const legumesKeywords = ['ratatouille', 'légumes', 'courgette', 'aubergine', 'tomate', 'carotte', 
                           'haricot', 'brocoli', 'chou-fleur', 'épinard'];
  const hasLegumes = legumesKeywords.some(kw => nameLower.includes(kw));
  if (hasLegumes && !hasProteine) {
    return 'legumes';
  }
  
  return 'plat_complet';
}

// Fonction pour normaliser une recette du dataset original
function normalizeOriginalRecipe(recipe) {
  const normalizedIngredients = recipe.ingredients.map(ing => ({
    name: ing.item || ing.name || 'Ingrédient',
    quantity: ing.quantity || 0,
    unit: ing.unit || 'unité'
  }));
  
  const nutrition = recipe.nutrition ? {
    calories: recipe.nutrition.calories || 0,
    proteins: recipe.nutrition.proteins || 0,
    carbs: recipe.nutrition.carbs || 0,
    fats: recipe.nutrition.fats || 0
  } : {
    calories: 0,
    proteins: 0,
    carbs: 0,
    fats: 0
  };
  
  // Détecter la catégorie à partir des tags
  const tags = recipe.tags || [];
  let category = recipe.category || 'autre';
  
  if (tags.includes('viande') || tags.includes('bœuf') || tags.includes('porc') || tags.includes('agneau')) {
    category = 'viande';
  } else if (tags.includes('poisson') || tags.includes('fruits de mer')) {
    category = 'poisson';
  } else if (tags.includes('volaille') || tags.includes('poulet') || tags.includes('dinde')) {
    category = 'volaille';
  } else if (tags.includes('végétarien') || tags.includes('vegetarien') || tags.includes('légumes')) {
    category = 'vegetarien';
  }
  
  return {
    title: recipe.title,
    description: recipe.description || `Délicieuse recette de ${recipe.title.toLowerCase()}`,
    ageGroup: mapAgeGroup(recipe.type, recipe.ageGroup),
    type: category,
    mainIngredient: recipe.mainIngredient || 'divers',
    servings: recipe.servings || 4,
    ingredients: normalizedIngredients,
    instructions: recipe.instructions || [],
    category: category,
    nutrition: nutrition,
    allergens: detectAllergens(normalizedIngredients),
    dietaryRestrictions: mapDietaryRestrictions(recipe.diet, category),
    medicalConditions: mapMedicalConditions(recipe.pathologies),
    texture: recipe.texture || 'normale',
    mealComponent: detectMealComponent(tags, recipe.title, normalizedIngredients),
    tags: tags,
    originalId: `orig_${Date.now()}_${Math.random().toString(36).substr(2, 9)}` // ID unique pour les recettes originales
  };
}

// Fonction pour normaliser une recette enrichie
function normalizeEnrichedRecipe(recipe) {
  return {
    title: recipe.name,
    description: `Délicieuse recette de ${recipe.name.toLowerCase()}`,
    ageGroup: mapAgeGroup(recipe.type),
    type: recipe.diet && recipe.diet.length > 0 ? recipe.diet[0] : 'omnivore',
    mainIngredient: 'divers',
    servings: recipe.servings || 4,
    ingredients: recipe.ingredients || [],
    instructions: recipe.steps || [],
    category: recipe.diet && recipe.diet.length > 0 ? recipe.diet[0] : 'omnivore',
    nutrition: {
      calories: recipe.calories || 0,
      proteins: recipe.proteins || 0,
      carbs: recipe.carbs || 0,
      fats: recipe.lipids || 0
    },
    allergens: detectAllergens(recipe.allergens || []),
    dietaryRestrictions: mapDietaryRestrictions(recipe.diet),
    medicalConditions: mapMedicalConditions(recipe.pathologies),
    texture: recipe.texture || 'normale',
    mealComponent: detectMealComponent(recipe.tags, recipe.name),
    tags: recipe.tags || [],
    originalId: recipe.id
  };
}

// Fonction principale de fusion
async function mergeRecipes() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');
    
    console.log('🗑️  Suppression des anciennes recettes...');
    await Recipe.deleteMany({});
    console.log('✅ Anciennes recettes supprimées');
    
    console.log('📝 Normalisation des recettes originales...');
    const normalizedOriginal = recipesData.map(normalizeOriginalRecipe);
    console.log(`✅ ${normalizedOriginal.length} recettes originales normalisées`);
    
    console.log('📝 Normalisation des recettes enrichies...');
    const normalizedEnriched = enrichedRecipesData.map(normalizeEnrichedRecipe);
    console.log(`✅ ${normalizedEnriched.length} recettes enrichies normalisées`);
    
    console.log('🔍 Détection des doublons...');
    const allRecipes = [...normalizedOriginal, ...normalizedEnriched];
    const uniqueRecipes = [];
    const duplicates = [];
    
    for (let i = 0; i < allRecipes.length; i++) {
      const currentRecipe = allRecipes[i];
      let isDuplicate = false;
      
      for (let j = 0; j < uniqueRecipes.length; j++) {
        const existingRecipe = uniqueRecipes[j];
        const similarity = calculateSimilarity(currentRecipe.title, existingRecipe.title);
        
        // Si similarité > 0.8, considérer comme doublon
        if (similarity > 0.8) {
          isDuplicate = true;
          duplicates.push({
            duplicate: currentRecipe,
            original: existingRecipe,
            similarity: similarity
          });
          console.log(`🔄 Doublon détecté: "${currentRecipe.title}" (similarité: ${(similarity * 100).toFixed(1)}%)`);
          
          // Garder la version enrichie si elle a plus d'informations
          if (currentRecipe.originalId && !existingRecipe.originalId) {
            uniqueRecipes[j] = currentRecipe;
            console.log(`  ✅ Remplacé par la version enrichie`);
          }
          break;
        }
      }
      
      if (!isDuplicate) {
        uniqueRecipes.push(currentRecipe);
      }
    }
    
    console.log(`📊 Résultats de la détection de doublons:`);
    console.log(`  - Recettes uniques: ${uniqueRecipes.length}`);
    console.log(`  - Doublons détectés: ${duplicates.length}`);
    
    console.log('💾 Insertion des recettes uniques dans MongoDB...');
    const insertedRecipes = await Recipe.insertMany(uniqueRecipes);
    console.log(`✅ ${insertedRecipes.length} recettes fusionnées injectées avec succès!`);
    
    // Afficher des statistiques détaillées
    const stats = {
      total: insertedRecipes.length,
      original: normalizedOriginal.length,
      enriched: normalizedEnriched.length,
      duplicates: duplicates.length,
      parCategorie: {},
      parTrancheAge: {},
      parTexture: {},
      parComposant: {},
      allergenes: {},
      restrictions: {},
      pathologies: {}
    };
    
    insertedRecipes.forEach(recipe => {
      stats.parCategorie[recipe.category] = (stats.parCategorie[recipe.category] || 0) + 1;
      stats.parTrancheAge[recipe.ageGroup] = (stats.parTrancheAge[recipe.ageGroup] || 0) + 1;
      stats.parTexture[recipe.texture] = (stats.parTexture[recipe.texture] || 0) + 1;
      stats.parComposant[recipe.mealComponent] = (stats.parComposant[recipe.mealComponent] || 0) + 1;
      
      recipe.allergens.forEach(allergen => {
        stats.allergenes[allergen] = (stats.allergenes[allergen] || 0) + 1;
      });
      
      recipe.dietaryRestrictions.forEach(restriction => {
        stats.restrictions[restriction] = (stats.restrictions[restriction] || 0) + 1;
      });
      
      recipe.medicalConditions.forEach(pathology => {
        stats.pathologies[pathology] = (stats.pathologies[pathology] || 0) + 1;
      });
    });
    
    console.log('\n📊 Statistiques de fusion:');
    console.log(`Total final: ${stats.total} recettes`);
    console.log(`Recettes originales: ${stats.original}`);
    console.log(`Recettes enrichies: ${stats.enriched}`);
    console.log(`Doublons supprimés: ${stats.duplicates}`);
    console.log('\nPar catégorie:', stats.parCategorie);
    console.log('Par tranche d\'âge:', stats.parTrancheAge);
    console.log('Par texture:', stats.parTexture);
    console.log('Par composant de repas:', stats.parComposant);
    console.log('Allergènes les plus fréquents:', Object.entries(stats.allergenes)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .reduce((obj, [k, v]) => ({ ...obj, [k]: v }), {}));
    console.log('Restrictions alimentaires:', stats.restrictions);
    console.log('Pathologies supportées:', stats.pathologies);
    
    console.log('\n🎉 Fusion des recettes terminée avec succès!');
    console.log('🚀 Votre application dispose maintenant de toutes les recettes dans un format unifié!');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la fusion des recettes:', error);
    process.exit(1);
  }
}

// Exécuter la fusion
mergeRecipes();
