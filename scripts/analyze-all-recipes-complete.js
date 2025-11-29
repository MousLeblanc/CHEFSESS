/**
 * Analyse complète de toutes les recettes MongoDB
 * Vérifie la cohérence, la qualité et la complétude des données
 * Génère un rapport détaillé avec suggestions d'amélioration
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Détecteur d'allergènes européens simplifié
const EU_ALLERGENS = {
  'gluten': { keywords: ['blé', 'wheat', 'gluten', 'farine', 'flour', 'semoule', 'semolina', 'pâtes', 'pasta', 'pain', 'bread'] },
  'lait': { keywords: ['lait', 'milk', 'fromage', 'cheese', 'yaourt', 'yogurt', 'crème', 'cream', 'beurre', 'butter', 'lactose'] },
  'oeufs': { keywords: ['œuf', 'oeuf', 'egg', 'œufs', 'oeufs', 'eggs', 'jaune', 'yolk', 'blanc d\'œuf', 'blanc d\'oeuf', 'egg white', 'mayonnaise', 'mayo'] },
  'arachides': { keywords: ['arachide', 'peanut', 'cacahuète', 'cacahuete'] },
  'fruits_a_coque': { keywords: ['noix', 'nuts', 'noisette', 'hazelnut', 'amande', 'almond', 'pistache', 'pistachio'] },
  'soja': { keywords: ['soja', 'soy', 'soya'] },
  'poisson': { keywords: ['poisson', 'fish', 'saumon', 'salmon', 'cabillaud', 'cod', 'thon', 'tuna'] },
  'crustaces': { keywords: ['crevette', 'shrimp', 'crabe', 'crab', 'langouste', 'lobster'] },
  'mollusques': { keywords: ['moule', 'mussel', 'huître', 'oyster', 'coquille', 'shell'] },
  'celeri': { keywords: ['céleri', 'celery', 'celeri'] },
  'moutarde': { keywords: ['moutarde', 'mustard'] },
  'sesame': { keywords: ['sésame', 'sesame', 'tahini'] },
  'sulfites': { keywords: ['sulfite', 'sulfites', 'anhydride'] },
  'lupin': { keywords: ['lupin', 'lupine'] }
};

function detectEuropeanAllergens(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  
  const detected = new Set();
  
  ingredients.forEach(ing => {
    const ingName = (ing.name || '').toLowerCase();
    
    Object.entries(EU_ALLERGENS).forEach(([allergen, { keywords }]) => {
      if (keywords.some(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'i');
        return regex.test(ingName);
      })) {
        detected.add(allergen);
      }
    });
  });
  
  return Array.from(detected);
}

// Statistiques globales
const stats = {
  total: 0,
  issues: {
    missingIngredients: [],
    invalidQuantities: [],
    missingNutrition: [],
    zeroNutrition: [],
    allergenMismatch: [],
    titleIngredientMismatch: [],
    invalidCategory: [],
    invalidTexture: [],
    missingInstructions: [],
    genericInstructions: [],
    duplicateNames: [],
    missingName: [],
    unrealisticQuantities: [],
    incompleteMeals: []
  },
  warnings: {
    lowSimilarity: [],
    suspiciousNutrition: [],
    missingTags: []
  }
};

// Fonctions d'analyse
function extractMainWords(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['de', 'du', 'des', 'la', 'le', 'les', 'aux', 'avec', 'sans', 'pour'].includes(word));
}

function calculateSimilarity(words1, words2) {
  if (words1.length === 0 || words2.length === 0) return 0;
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

function isGenericInstruction(instruction) {
  if (!instruction || typeof instruction !== 'string') return false;
  const genericPatterns = [
    /préparer.*laver/i,
    /cuire.*protéine/i,
    /cuire.*accompagnement/i,
    /assembler.*assaisonner/i,
    /adapter.*texture/i
  ];
  return genericPatterns.some(pattern => pattern.test(instruction));
}

function isIncompleteMeal(recipe) {
  const name = (recipe.name || '').toLowerCase();
  const category = recipe.category || '';
  const ingredients = recipe.ingredients || [];
  
  // Vérifier si c'est un accompagnement classé comme plat
  if (category === 'plat') {
    const accompanimentKeywords = ['purée', 'ratatouille', 'légumes', 'compote', 'sauce'];
    if (accompanimentKeywords.some(keyword => name.includes(keyword))) {
      // Vérifier s'il y a une protéine
      const hasProtein = ingredients.some(ing => {
        const ingName = (ing.name || '').toLowerCase();
        return /poulet|viande|poisson|saumon|cabillaud|dinde|bœuf|porc|jambon|œuf|oeuf/i.test(ingName);
      });
      if (!hasProtein) return true;
    }
    
    // Vérifier si c'est une soupe classée comme plat
    if (name.includes('velouté') || name.includes('soupe') || name.includes('consommé')) {
      return true;
    }
  }
  
  return false;
}

function hasUnrealisticQuantity(ingredient) {
  if (!ingredient || typeof ingredient.quantity !== 'number') return false;
  const qty = ingredient.quantity;
  
  // Quantités irréalistes (trop petites ou trop grandes)
  if (qty < 0.1) return true;
  if (qty > 5000) return true;
  
  return false;
}

function analyzeRecipe(recipe) {
  const issues = [];
  const warnings = [];
  
  // 1. Vérifier le nom
  if (!recipe.name || recipe.name.trim().length === 0) {
    issues.push({ type: 'missingName', message: 'Nom de recette manquant' });
    stats.issues.missingName.push({ id: recipe._id, name: recipe.name });
  }
  
  // 2. Vérifier les ingrédients
  if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
    issues.push({ type: 'missingIngredients', message: 'Aucun ingrédient' });
    stats.issues.missingIngredients.push({ id: recipe._id, name: recipe.name });
  } else {
    // Vérifier chaque ingrédient
    recipe.ingredients.forEach((ing, index) => {
      if (!ing.name || ing.name.trim().length === 0) {
        issues.push({ type: 'missingIngredients', message: `Ingrédient ${index + 1} sans nom` });
      }
      
      if (ing.quantity === undefined || ing.quantity === null) {
        issues.push({ type: 'invalidQuantities', message: `Ingrédient "${ing.name}" sans quantité` });
        stats.issues.invalidQuantities.push({ id: recipe._id, name: recipe.name, ingredient: ing.name });
      } else if (hasUnrealisticQuantity(ing)) {
        issues.push({ type: 'unrealisticQuantities', message: `Quantité irréaliste pour "${ing.name}": ${ing.quantity}` });
        stats.issues.unrealisticQuantities.push({ id: recipe._id, name: recipe.name, ingredient: ing.name, quantity: ing.quantity });
      }
    });
  }
  
  // 3. Vérifier la cohérence titre/ingrédients
  if (recipe.name && recipe.ingredients && recipe.ingredients.length > 0) {
    const titleWords = extractMainWords(recipe.name);
    const ingredientWords = recipe.ingredients.flatMap(ing => extractMainWords(ing.name || ''));
    const similarity = calculateSimilarity(titleWords, ingredientWords);
    
    if (similarity < 0.2 && titleWords.length > 0) {
      warnings.push({ type: 'lowSimilarity', message: `Faible cohérence titre/ingrédients (${(similarity * 100).toFixed(1)}%)` });
      stats.warnings.lowSimilarity.push({ 
        id: recipe._id, 
        name: recipe.name, 
        similarity: similarity,
        ingredients: recipe.ingredients.map(ing => ing.name).join(', ')
      });
    }
  }
  
  // 4. Vérifier les allergènes
  if (recipe.ingredients && recipe.ingredients.length > 0) {
    const detectedAllergens = detectEuropeanAllergens(recipe.ingredients);
    const declaredAllergens = Array.isArray(recipe.allergens) ? recipe.allergens : [];
    
    // Normaliser les noms d'allergènes pour comparaison
    const normalizeAllergen = (name) => {
      const normalized = String(name).toLowerCase().trim();
      const variants = {
        'oeufs': 'oeufs', 'oeuf': 'oeufs', 'eggs': 'oeufs',
        'lait': 'lait', 'lactose': 'lait', 'dairy': 'lait',
        'gluten': 'gluten', 'blé': 'gluten', 'wheat': 'gluten'
      };
      return variants[normalized] || normalized;
    };
    
    const detectedNormalized = detectedAllergens.map(normalizeAllergen);
    const declaredNormalized = declaredAllergens.map(normalizeAllergen);
    
    const missingInDeclared = detectedNormalized.filter(a => !declaredNormalized.includes(a));
    const extraInDeclared = declaredNormalized.filter(a => !detectedNormalized.includes(a));
    
    if (missingInDeclared.length > 0) {
      issues.push({ type: 'allergenMismatch', message: `Allergènes détectés mais non déclarés: ${missingInDeclared.join(', ')}` });
      stats.issues.allergenMismatch.push({ 
        id: recipe._id, 
        name: recipe.name, 
        detected: detectedAllergens,
        declared: declaredAllergens,
        missing: missingInDeclared
      });
    }
    
    if (extraInDeclared.length > 0 && extraInDeclared.length === declaredNormalized.length) {
      // Tous les allergènes déclarés ne sont pas détectés (possible faux positif)
      warnings.push({ type: 'allergenMismatch', message: `Allergènes déclarés mais non détectés: ${extraInDeclared.join(', ')}` });
    }
  }
  
  // 5. Vérifier les valeurs nutritionnelles
  const np = recipe.nutritionalProfile;
  if (!np || Object.keys(np).length === 0) {
    issues.push({ type: 'missingNutrition', message: 'Profil nutritionnel manquant' });
    stats.issues.missingNutrition.push({ id: recipe._id, name: recipe.name });
  } else {
    // Vérifier les valeurs à zéro ou suspectes
    const suspiciousValues = [];
    if (np.kcal === 0 || np.kcal > 5000) suspiciousValues.push(`kcal: ${np.kcal}`);
    if (np.protein === 0 && recipe.ingredients?.some(ing => /viande|poisson|œuf|oeuf|fromage/i.test(ing.name))) {
      suspiciousValues.push(`protein: ${np.protein}`);
    }
    if (suspiciousValues.length > 0) {
      warnings.push({ type: 'suspiciousNutrition', message: `Valeurs nutritionnelles suspectes: ${suspiciousValues.join(', ')}` });
      stats.warnings.suspiciousNutrition.push({ id: recipe._id, name: recipe.name, values: suspiciousValues });
    }
    
    if (np.kcal === 0 && np.protein === 0 && np.carbs === 0 && np.lipids === 0) {
      issues.push({ type: 'zeroNutrition', message: 'Toutes les valeurs nutritionnelles sont à zéro' });
      stats.issues.zeroNutrition.push({ id: recipe._id, name: recipe.name });
    }
  }
  
  // 6. Vérifier la catégorie
  const validCategories = ['entrée', 'plat', 'dessert', 'petit-déjeuner', 'soupe', 'accompagnement', 'boisson', 'purée'];
  if (!recipe.category || !validCategories.includes(recipe.category)) {
    issues.push({ type: 'invalidCategory', message: `Catégorie invalide: ${recipe.category}` });
    stats.issues.invalidCategory.push({ id: recipe._id, name: recipe.name, category: recipe.category });
  }
  
  // 7. Vérifier la texture
  const validTextures = ['normale', 'tendre', 'hachée', 'mixée', 'moulinée', 'lisse', 'liquide', 'boire'];
  if (recipe.texture && !validTextures.includes(recipe.texture)) {
    issues.push({ type: 'invalidTexture', message: `Texture invalide: ${recipe.texture}` });
    stats.issues.invalidTexture.push({ id: recipe._id, name: recipe.name, texture: recipe.texture });
  }
  
  // Vérifier la cohérence texture/nom
  if (recipe.name && recipe.texture) {
    const nameLower = recipe.name.toLowerCase();
    if (nameLower.includes('mixée') && recipe.texture !== 'mixée') {
      warnings.push({ type: 'textureMismatch', message: 'Nom contient "mixée" mais texture différente' });
    }
    if (nameLower.includes('moulinée') && recipe.texture !== 'moulinée') {
      warnings.push({ type: 'textureMismatch', message: 'Nom contient "moulinée" mais texture différente' });
    }
  }
  
  // 8. Vérifier les instructions
  if (!recipe.preparationSteps || !Array.isArray(recipe.preparationSteps) || recipe.preparationSteps.length === 0) {
    issues.push({ type: 'missingInstructions', message: 'Instructions de préparation manquantes' });
    stats.issues.missingInstructions.push({ id: recipe._id, name: recipe.name });
  } else {
    const genericCount = recipe.preparationSteps.filter(isGenericInstruction).length;
    if (genericCount > 0) {
      issues.push({ type: 'genericInstructions', message: `${genericCount} instruction(s) générique(s)` });
      stats.issues.genericInstructions.push({ id: recipe._id, name: recipe.name, count: genericCount });
    }
  }
  
  // 9. Vérifier si c'est un plat complet
  if (isIncompleteMeal(recipe)) {
    issues.push({ type: 'incompleteMeals', message: 'Plat incomplet (accompagnement ou soupe classé comme plat)' });
    stats.issues.incompleteMeals.push({ id: recipe._id, name: recipe.name, category: recipe.category });
  }
  
  // 10. Vérifier les tags
  if (!recipe.tags || !Array.isArray(recipe.tags) || recipe.tags.length === 0) {
    warnings.push({ type: 'missingTags', message: 'Aucun tag' });
    stats.warnings.missingTags.push({ id: recipe._id, name: recipe.name });
  }
  
  return { issues, warnings };
}

async function findDuplicates(recipes) {
  const nameMap = new Map();
  
  recipes.forEach(recipe => {
    if (!recipe.name) return;
    const normalizedName = recipe.name.toLowerCase().trim();
    if (!nameMap.has(normalizedName)) {
      nameMap.set(normalizedName, []);
    }
    nameMap.get(normalizedName).push({ id: recipe._id, name: recipe.name });
  });
  
  const duplicates = [];
  nameMap.forEach((recipes, name) => {
    if (recipes.length > 1) {
      duplicates.push({ name, count: recipes.length, recipes });
    }
  });
  
  return duplicates;
}

async function generateReport() {
  console.log('\n' + '='.repeat(80));
  console.log('📊 RAPPORT D\'ANALYSE COMPLÈTE DES RECETTES');
  console.log('='.repeat(80));
  
  console.log(`\n📈 STATISTIQUES GLOBALES`);
  console.log(`   Total de recettes analysées: ${stats.total}`);
  
  // Compter les problèmes
  const totalIssues = Object.values(stats.issues).reduce((sum, arr) => sum + arr.length, 0);
  const totalWarnings = Object.values(stats.warnings).reduce((sum, arr) => sum + arr.length, 0);
  
  console.log(`   ❌ Problèmes détectés: ${totalIssues}`);
  console.log(`   ⚠️  Avertissements: ${totalWarnings}`);
  console.log(`   ✅ Recettes sans problème: ${stats.total - totalIssues}`);
  
  // Détails par type de problème
  console.log(`\n🔍 DÉTAILS DES PROBLÈMES`);
  console.log(`   • Ingrédients manquants: ${stats.issues.missingIngredients.length}`);
  console.log(`   • Quantités invalides: ${stats.issues.invalidQuantities.length}`);
  console.log(`   • Quantités irréalistes: ${stats.issues.unrealisticQuantities.length}`);
  console.log(`   • Profil nutritionnel manquant: ${stats.issues.missingNutrition.length}`);
  console.log(`   • Valeurs nutritionnelles à zéro: ${stats.issues.zeroNutrition.length}`);
  console.log(`   • Incohérence allergènes: ${stats.issues.allergenMismatch.length}`);
  console.log(`   • Faible cohérence titre/ingrédients: ${stats.warnings.lowSimilarity.length}`);
  console.log(`   • Catégorie invalide: ${stats.issues.invalidCategory.length}`);
  console.log(`   • Texture invalide: ${stats.issues.invalidTexture.length}`);
  console.log(`   • Instructions manquantes: ${stats.issues.missingInstructions.length}`);
  console.log(`   • Instructions génériques: ${stats.issues.genericInstructions.length}`);
  console.log(`   • Plats incomplets: ${stats.issues.incompleteMeals.length}`);
  console.log(`   • Noms manquants: ${stats.issues.missingName.length}`);
  console.log(`   • Doublons: ${stats.issues.duplicateNames.length}`);
  
  // Exemples de problèmes
  if (stats.issues.missingIngredients.length > 0) {
    console.log(`\n📋 EXEMPLES - Ingrédients manquants (premiers 5):`);
    stats.issues.missingIngredients.slice(0, 5).forEach(item => {
      console.log(`   • ${item.name || 'Sans nom'} (ID: ${item.id})`);
    });
  }
  
  if (stats.issues.allergenMismatch.length > 0) {
    console.log(`\n📋 EXEMPLES - Incohérence allergènes (premiers 5):`);
    stats.issues.allergenMismatch.slice(0, 5).forEach(item => {
      console.log(`   • ${item.name}`);
      console.log(`     Détectés: ${item.detected.join(', ')}`);
      console.log(`     Déclarés: ${item.declared.join(', ') || 'Aucun'}`);
      console.log(`     Manquants: ${item.missing.join(', ')}`);
    });
  }
  
  if (stats.warnings.lowSimilarity.length > 0) {
    console.log(`\n📋 EXEMPLES - Faible cohérence titre/ingrédients (premiers 5):`);
    stats.warnings.lowSimilarity.slice(0, 5).forEach(item => {
      console.log(`   • ${item.name} (similarité: ${(item.similarity * 100).toFixed(1)}%)`);
      console.log(`     Ingrédients: ${item.ingredients}`);
    });
  }
  
  if (stats.issues.incompleteMeals.length > 0) {
    console.log(`\n📋 EXEMPLES - Plats incomplets (premiers 5):`);
    stats.issues.incompleteMeals.slice(0, 5).forEach(item => {
      console.log(`   • ${item.name} (catégorie: ${item.category})`);
    });
  }
  
  // Suggestions d'amélioration
  console.log(`\n💡 SUGGESTIONS D'AMÉLIORATION`);
  
  if (stats.issues.missingIngredients.length > 0) {
    console.log(`\n   1. Ajouter les ingrédients manquants`);
    console.log(`      • ${stats.issues.missingIngredients.length} recette(s) sans ingrédients`);
    console.log(`      • Utiliser l'IA ou des règles basées sur le nom de la recette`);
  }
  
  if (stats.issues.allergenMismatch.length > 0) {
    console.log(`\n   2. Corriger les déclarations d'allergènes`);
    console.log(`      • ${stats.issues.allergenMismatch.length} recette(s) avec incohérence`);
    console.log(`      • Re-exécuter la détection automatique et mettre à jour les déclarations`);
  }
  
  if (stats.warnings.lowSimilarity.length > 0) {
    console.log(`\n   3. Vérifier la cohérence titre/ingrédients`);
    console.log(`      • ${stats.warnings.lowSimilarity.length} recette(s) avec faible similarité`);
    console.log(`      • Vérifier manuellement ou corriger les ingrédients`);
  }
  
  if (stats.issues.incompleteMeals.length > 0) {
    console.log(`\n   4. Reclassifier les plats incomplets`);
    console.log(`      • ${stats.issues.incompleteMeals.length} recette(s) à reclassifier`);
    console.log(`      • Changer la catégorie de "plat" à "accompagnement" ou "soupe"`);
  }
  
  if (stats.issues.genericInstructions.length > 0) {
    console.log(`\n   5. Remplacer les instructions génériques`);
    console.log(`      • ${stats.issues.genericInstructions.length} recette(s) avec instructions génériques`);
    console.log(`      • Générer des instructions détaillées avec l'IA`);
  }
  
  if (stats.issues.duplicateNames.length > 0) {
    console.log(`\n   6. Résoudre les doublons`);
    console.log(`      • ${stats.issues.duplicateNames.length} groupe(s) de recettes avec le même nom`);
    console.log(`      • Fusionner ou renommer les doublons`);
  }
  
  if (stats.issues.missingNutrition.length > 0) {
    console.log(`\n   7. Calculer les profils nutritionnels`);
    console.log(`      • ${stats.issues.missingNutrition.length} recette(s) sans profil nutritionnel`);
    console.log(`      • Calculer à partir des ingrédients et quantités`);
  }
  
  console.log(`\n` + '='.repeat(80));
}

async function main() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer toutes les recettes
    console.log('📚 Récupération de toutes les recettes...');
    const recipes = await Recipe.find({});
    stats.total = recipes.length;
    console.log(`✅ ${stats.total} recette(s) trouvée(s)\n`);
    
    if (stats.total === 0) {
      console.log('⚠️  Aucune recette trouvée dans la base de données');
      return;
    }
    
    // Analyser chaque recette
    console.log('🔍 Analyse des recettes en cours...');
    let processed = 0;
    for (const recipe of recipes) {
      analyzeRecipe(recipe);
      processed++;
      if (processed % 50 === 0) {
        process.stdout.write(`\r   Progression: ${processed}/${stats.total} (${((processed / stats.total) * 100).toFixed(1)}%)`);
      }
    }
    process.stdout.write(`\r   Progression: ${processed}/${stats.total} (100%)\n\n`);
    
    // Chercher les doublons
    console.log('🔍 Recherche de doublons...');
    const duplicates = await findDuplicates(recipes);
    stats.issues.duplicateNames = duplicates;
    console.log(`✅ ${duplicates.length} groupe(s) de doublons trouvé(s)\n`);
    
    // Générer le rapport
    await generateReport();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de l\'analyse complète des recettes...\n');
main();

