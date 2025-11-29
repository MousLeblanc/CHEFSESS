// scripts/inject-pdf-recipes-to-mongo.js
// Script pour extraire les recettes depuis un fichier JSON et les insérer dans MongoDB classées par catégories
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import extractRecipesFromJSON from './extract-recipes-from-json.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Détecter les allergènes dans les ingrédients
 */
function detectAllergens(ingredients) {
  const allergens = new Set();
  
  const allergenMap = {
    'gluten': ['pâtes', 'pâte', 'farine', 'pain', 'chapelure', 'semoule', 'blé', 'biscuit', 'brioche', 'pizza', 'macaroni', 'tagliatelle', 'linguine', 'spaghetti'],
    'lactose': ['lait', 'crème', 'fromage', 'beurre', 'gruyère', 'parmesan', 'yaourt', 'emmental', 'mozzarella', 'chèvre', 'béchamel', 'ricotta', 'fromage frais'],
    'oeufs': ['œuf', 'oeuf', 'mayonnaise', 'mayo'],
    'poisson': ['poisson', 'colin', 'dorade', 'saumon', 'thon', 'cabillaud', 'truite', 'sardine', 'anchois'],
    'crustaces': ['crevette', 'crabe', 'homard', 'langoustine', 'écrevisse'],
    'mollusques': ['moule', 'huître', 'calamar', 'seiche', 'poulpe', 'escargot'],
    'soja': ['soja', 'tofu', 'sauce soja'],
    'fruits_a_coque': ['noix', 'amande', 'noisette', 'cajou', 'pistache', 'pécan', 'macadamia', 'pignon', 'pin'],
    'arachides': ['cacahuète', 'arachide', 'cacahouète'],
    'sesame': ['sésame', 'tahini'],
    'moutarde': ['moutarde'],
    'celeri': ['céleri', 'celeri'],
    'sulfites': ['vin', 'vinaigre'],
    'lupin': ['lupin']
  };
  
  ingredients.forEach(ing => {
    const ingredientName = (ing.name || '').toLowerCase();
    Object.entries(allergenMap).forEach(([allergen, keywords]) => {
      if (keywords.some(keyword => ingredientName.includes(keyword))) {
        allergens.add(allergen);
      }
    });
  });
  
  return Array.from(allergens);
}

/**
 * Déterminer les restrictions alimentaires
 */
function determineDietaryRestrictions(recipe, category) {
  const restrictions = [];
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients}`.toLowerCase();
  
  // Végétarien
  const meatKeywords = ['viande', 'bœuf', 'boeuf', 'porc', 'agneau', 'veau', 'jambon', 'lard', 'bacon', 'saucisse', 'steak'];
  const fishKeywords = ['poisson', 'saumon', 'thon', 'cabillaud', 'crevette', 'crabe', 'moule'];
  const poultryKeywords = ['poulet', 'dinde', 'volaille', 'canard', 'oie'];
  
  const hasMeat = meatKeywords.some(kw => allText.includes(kw));
  const hasFish = fishKeywords.some(kw => allText.includes(kw));
  const hasPoultry = poultryKeywords.some(kw => allText.includes(kw));
  
  if (!hasMeat && !hasFish && !hasPoultry) {
    restrictions.push('végétarien');
    
    // Vérifier si vegan (pas de produits animaux)
    const animalProducts = ['lait', 'crème', 'fromage', 'beurre', 'œuf', 'oeuf', 'miel', 'yaourt'];
    const hasAnimalProducts = animalProducts.some(product => allText.includes(product));
    if (!hasAnimalProducts) {
      restrictions.push('végétalien');
    }
  }
  
  // Sans gluten
  const glutenIngredients = ['pâtes', 'farine', 'pain', 'chapelure', 'semoule', 'blé'];
  const hasGluten = glutenIngredients.some(gluten => allText.includes(gluten));
  if (!hasGluten) {
    restrictions.push('sans_gluten');
  }
  
  // Sans lactose
  const lactoseIngredients = ['lait', 'crème', 'fromage', 'beurre', 'yaourt'];
  const hasLactose = lactoseIngredients.some(lactose => allText.includes(lactose));
  if (!hasLactose) {
    restrictions.push('sans_lactose');
  }
  
  // Sans porc
  const hasPork = allText.includes('porc') || allText.includes('lard') || allText.includes('bacon');
  if (!hasPork) {
    restrictions.push('sans_porc');
  }
  
  return restrictions;
}

/**
 * Classifier la recette par catégorie détaillée
 */
function classifyRecipe(recipe) {
  const name = (recipe.name || '').toLowerCase();
  const ingredients = (recipe.ingredients || []).map(i => i.name.toLowerCase()).join(' ');
  const allText = `${name} ${ingredients}`.toLowerCase();
  
  // Soupe
  if (name.includes('soupe') || name.includes('velouté') || name.includes('potage') || name.includes('bouillon') || name.includes('gaspacho')) {
    return {
      detailedCategory: 'soupe',
      modelCategory: 'soupe',
      tags: ['#soupe']
    };
  }
  
  // Salade
  if (name.includes('salade')) {
    return {
      detailedCategory: 'salade',
      modelCategory: 'entrée',
      tags: ['#salade']
    };
  }
  
  // Dessert
  if (name.match(/\b(dessert|gateau|gâteau|tarte|mousse|crème|flan|sorbet|glace|compote|brownie|muffin|biscuit|cookie)\b/)) {
    return {
      detailedCategory: 'dessert',
      modelCategory: 'dessert',
      tags: ['#dessert']
    };
  }
  
  // Pain et viennoiseries
  if (name.match(/\b(pain|brioche|croissant|viennoiserie|baguette|focaccia|bun|roll)\b/)) {
    return {
      detailedCategory: 'pain_et_viennoiseries',
      modelCategory: 'petit-déjeuner',
      tags: ['#pain', '#viennoiserie']
    };
  }
  
  // Sauce
  if (name.match(/\b(sauce|béchamel|pesto|passata|bolognaise|marinara|mayonnaise)\b/)) {
    return {
      detailedCategory: 'sauce',
      modelCategory: 'accompagnement',
      tags: ['#sauce']
    };
  }
  
  // Accompagnements
  if (name.match(/\b(riz|pâtes|semoule|purée|polenta|quinoa|boulgour|pommes de terre|frites|légumes)\b/) && 
      !name.match(/\b(poulet|poisson|viande|saumon|colin|boeuf|porc|agneau|veau)\b/)) {
    return {
      detailedCategory: 'accompagnement',
      modelCategory: 'accompagnement',
      tags: ['#accompagnement']
    };
  }
  
  // Viandes
  const meatKeywords = ['viande', 'bœuf', 'boeuf', 'porc', 'agneau', 'veau', 'jambon', 'lard', 'bacon', 'saucisse', 'steak', 'escalope', 'rôti'];
  const hasMeat = meatKeywords.some(kw => allText.includes(kw));
  if (hasMeat) {
    return {
      detailedCategory: 'viande',
      modelCategory: 'plat',
      tags: ['#viande']
    };
  }
  
  // Poissons
  const fishKeywords = ['poisson', 'saumon', 'thon', 'cabillaud', 'dorade', 'truite', 'sardine', 'anchois', 'crevette', 'crabe', 'homard', 'moule', 'huître'];
  const hasFish = fishKeywords.some(kw => allText.includes(kw));
  if (hasFish) {
    return {
      detailedCategory: 'poisson',
      modelCategory: 'plat',
      tags: ['#poisson']
    };
  }
  
  // Volailles
  const poultryKeywords = ['poulet', 'dinde', 'volaille', 'canard', 'oie'];
  const hasPoultry = poultryKeywords.some(kw => allText.includes(kw));
  if (hasPoultry) {
    return {
      detailedCategory: 'volaille',
      modelCategory: 'plat',
      tags: ['#volaille']
    };
  }
  
  // Végétarien
  if (!hasMeat && !hasFish && !hasPoultry) {
    return {
      detailedCategory: 'végétarien',
      modelCategory: 'plat',
      tags: ['#végétarien']
    };
  }
  
  // Par défaut
  return {
    detailedCategory: 'autre',
    modelCategory: 'plat',
    tags: []
  };
}

/**
 * Normaliser une recette pour MongoDB
 */
function normalizeRecipeForMongo(recipe) {
  const classification = classifyRecipe(recipe);
  const allergens = detectAllergens(recipe.ingredients || []);
  const dietaryRestrictions = determineDietaryRestrictions(recipe, classification.detailedCategory);
  
  // Mapper la nutrition
  const nutrition = recipe.nutrition || {};
  const nutritionalProfile = {
    kcal: nutrition.calories || 0,
    protein: nutrition.proteins || 0,
    lipids: nutrition.lipids || 0,
    carbs: nutrition.carbs || 0,
    fiber: nutrition.fibers || 0,
    sodium: nutrition.sodium || 0
  };
  
  // Générer les tags complets
  const tags = [...classification.tags];
  if (dietaryRestrictions.includes('végétarien')) {
    tags.push('#végétarien');
  }
  if (dietaryRestrictions.includes('végétalien')) {
    tags.push('#végétalien');
  }
  
  // Normaliser les ingrédients
  const normalizedIngredients = (recipe.ingredients || []).map(ing => ({
    name: ing.name || 'Ingrédient',
    quantity: ing.quantity || 0,
    unit: ing.unit || 'unité'
  }));
  
  // Normaliser les étapes de préparation
  const preparationSteps = (recipe.preparationSteps || []).filter(step => step && step.trim().length > 0);
  
  // Ajouter les informations de temps et portions dans les tags si nécessaire
  if (recipe.preparationTime || recipe.cookingTime) {
    const timeInfo = [];
    if (recipe.preparationTime) timeInfo.push(`préparation:${recipe.preparationTime}min`);
    if (recipe.cookingTime) timeInfo.push(`cuisson:${recipe.cookingTime}min`);
    tags.push(`#temps:${timeInfo.join(',')}`);
  }
  if (recipe.servings) {
    tags.push(`#portions:${recipe.servings}`);
  }
  
  return {
    name: recipe.name || 'Recette sans nom',
    category: classification.modelCategory,
    ingredients: normalizedIngredients,
    preparationSteps: preparationSteps,
    tags: tags,
    allergens: allergens,
    dietaryRestrictions: dietaryRestrictions,
    nutritionalProfile: nutritionalProfile,
    texture: 'normale' // Par défaut
  };
}

/**
 * Fonction principale
 */
async function injectPDFRecipesToMongo(jsonPath) {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');
    
    console.log(`📖 Extraction des recettes depuis ${jsonPath}...`);
    const result = await extractRecipesFromJSON(jsonPath);
    console.log(`✅ ${result.count} recette(s) extraite(s)`);
    
    console.log('🔄 Normalisation et classification des recettes...');
    const normalizedRecipes = result.recipes.map(normalizeRecipeForMongo);
    
    // Statistiques par catégorie détaillée (basée sur les tags)
    const statsByCategory = {};
    normalizedRecipes.forEach(recipe => {
      // Extraire la catégorie détaillée depuis les tags
      const categoryTag = recipe.tags.find(tag => 
        ['#soupe', '#salade', '#dessert', '#pain', '#viennoiserie', '#sauce', '#accompagnement', 
         '#viande', '#poisson', '#volaille', '#végétarien'].some(cat => tag.includes(cat))
      );
      const cat = categoryTag ? categoryTag.replace('#', '') : 'autre';
      statsByCategory[cat] = (statsByCategory[cat] || 0) + 1;
    });
    
    console.log('\n📊 Répartition par catégorie détaillée:');
    Object.entries(statsByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
    console.log('\n💾 Insertion dans MongoDB...');
    
    // Insérer les recettes par lots pour éviter les problèmes de mémoire
    const batchSize = 50;
    let inserted = 0;
    let skipped = 0;
    
    for (let i = 0; i < normalizedRecipes.length; i += batchSize) {
      const batch = normalizedRecipes.slice(i, i + batchSize);
      
      // Vérifier si la recette existe déjà (par nom)
      const existingRecipes = await RecipeEnriched.find({ 
        name: { $in: batch.map(r => r.name) } 
      }).select('name');
      const existingNames = new Set(existingRecipes.map(r => r.name));
      
      const newRecipes = batch.filter(r => !existingNames.has(r.name));
      
      if (newRecipes.length > 0) {
        await RecipeEnriched.insertMany(newRecipes);
        inserted += newRecipes.length;
      }
      
      skipped += batch.length - newRecipes.length;
      
      console.log(`  Progression: ${Math.min(i + batchSize, normalizedRecipes.length)}/${normalizedRecipes.length} (${inserted} insérées, ${skipped} ignorées)`);
    }
    
    console.log(`\n✅ ${inserted} recette(s) insérée(s) avec succès!`);
    if (skipped > 0) {
      console.log(`⚠️  ${skipped} recette(s) déjà existante(s) ignorée(s)`);
    }
    
    // Afficher les statistiques finales par catégorie dans MongoDB
    console.log('\n📊 Statistiques finales dans MongoDB:');
    const finalStats = await RecipeEnriched.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    finalStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    // Statistiques par tags
    console.log('\n📊 Statistiques par tags:');
    const tagStats = await RecipeEnriched.aggregate([
      { $unwind: '$tags' },
      {
        $group: {
          _id: '$tags',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);
    
    tagStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    console.log('\n🎉 Injection terminée avec succès!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'injection:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter si appelé directement
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1] && import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'));

if (isMainModule || process.argv[1]?.includes('inject-pdf-recipes-to-mongo')) {
  const jsonPath = process.argv[2] || path.join(__dirname, '../data/pdf-recipes/recettes kitchen aid-recipes.json');
  
  injectPDFRecipesToMongo(jsonPath);
}

export default injectPDFRecipesToMongo;

