// scripts/list-recipes-from-mongo.js
// Script pour lister toutes les recettes dans MongoDB
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

/**
 * Fonction principale
 */
async function listRecipesFromMongo() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Compter le total de recettes
    const totalRecipes = await RecipeEnriched.countDocuments();
    console.log(`📊 TOTAL DE RECETTES: ${totalRecipes}\n`);
    
    // Statistiques par catégorie
    console.log('📋 RÉPARTITION PAR CATÉGORIE:');
    const categories = await RecipeEnriched.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    categories.forEach(cat => {
      console.log(`  ${cat._id || 'sans catégorie'}: ${cat.count}`);
    });
    
    // Statistiques par source (basées sur les tags)
    console.log('\n🌍 RÉPARTITION PAR SOURCE (tags):');
    const allRecipes = await RecipeEnriched.find({}, { tags: 1, name: 1 }).lean();
    
    const sources = {
      'Ethiopian': 0,
      'World': 0,
      'Vegan': 0,
      'Arabian Magic': 0,
      'Italian Kitchen': 0,
      'Italian2 Kitchen': 0,
      'Arabic': 0,
      'Autres': 0
    };
    
    allRecipes.forEach(recipe => {
      const tags = (recipe.tags || []).join(' ').toLowerCase();
      if (tags.includes('#ethiopian') || tags.includes('ethiopian')) {
        sources['Ethiopian']++;
      } else if (tags.includes('#world') || tags.includes('world')) {
        sources['World']++;
      } else if (tags.includes('#vegan') || tags.includes('vegan')) {
        sources['Vegan']++;
      } else if (tags.includes('#arabian') || tags.includes('arabian-nights')) {
        sources['Arabian Magic']++;
      } else if (tags.includes('#italian') || tags.includes('italian')) {
        if (tags.includes('italian2') || recipe.name.match(/di |alla |della |delle /i)) {
          sources['Italian2 Kitchen']++;
        } else {
          sources['Italian Kitchen']++;
        }
      } else if (tags.includes('#arabic') || tags.includes('middle-eastern')) {
        sources['Arabic']++;
      } else {
        sources['Autres']++;
      }
    });
    
    Object.entries(sources).sort((a, b) => b[1] - a[1]).forEach(([source, count]) => {
      if (count > 0) {
        console.log(`  ${source}: ${count}`);
      }
    });
    
    // Statistiques par allergènes
    console.log('\n⚠️  RÉPARTITION PAR ALLERGÈNES:');
    const allergenStats = {};
    allRecipes.forEach(recipe => {
      (recipe.allergens || []).forEach(allergen => {
        allergenStats[allergen] = (allergenStats[allergen] || 0) + 1;
      });
    });
    
    Object.entries(allergenStats).sort((a, b) => b[1] - a[1]).forEach(([allergen, count]) => {
      console.log(`  ${allergen}: ${count} recettes`);
    });
    
    // Statistiques par restrictions alimentaires
    console.log('\n🥗 RÉPARTITION PAR RESTRICTIONS ALIMENTAIRES:');
    const restrictionStats = {};
    allRecipes.forEach(recipe => {
      (recipe.dietaryRestrictions || []).forEach(restriction => {
        restrictionStats[restriction] = (restrictionStats[restriction] || 0) + 1;
      });
    });
    
    Object.entries(restrictionStats).sort((a, b) => b[1] - a[1]).forEach(([restriction, count]) => {
      console.log(`  ${restriction}: ${count} recettes`);
    });
    
    // Afficher quelques exemples de recettes
    console.log('\n📝 EXEMPLES DE RECETTES (10 premières):');
    const sampleRecipes = await RecipeEnriched.find({})
      .select('name category ingredients preparationSteps tags allergens dietaryRestrictions')
      .limit(10)
      .lean();
    
    sampleRecipes.forEach((recipe, index) => {
      console.log(`\n  ${index + 1}. ${recipe.name}`);
      console.log(`     - Catégorie: ${recipe.category || 'N/A'}`);
      const ingredientCount = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;
      const stepCount = Array.isArray(recipe.preparationSteps) ? recipe.preparationSteps.length : 0;
      console.log(`     - Ingrédients: ${ingredientCount}`);
      console.log(`     - Étapes: ${stepCount}`);
      if (recipe.allergens && recipe.allergens.length > 0) {
        console.log(`     - Allergènes: ${recipe.allergens.join(', ')}`);
      }
      if (recipe.dietaryRestrictions && recipe.dietaryRestrictions.length > 0) {
        console.log(`     - Restrictions: ${recipe.dietaryRestrictions.join(', ')}`);
      }
      if (recipe.tags && recipe.tags.length > 0) {
        console.log(`     - Tags: ${recipe.tags.slice(0, 5).join(', ')}${recipe.tags.length > 5 ? '...' : ''}`);
      }
    });
    
    // Statistiques sur les ingrédients
    console.log('\n🥘 STATISTIQUES SUR LES INGRÉDIENTS:');
    const recipesWithIngredientsData = await RecipeEnriched.find({ ingredients: { $exists: true, $ne: [] } }).select('ingredients').lean();
    
    let totalIngredients = 0;
    let maxIngredients = 0;
    let minIngredients = Infinity;
    
    recipesWithIngredientsData.forEach(recipe => {
      const ingredientCount = Array.isArray(recipe.ingredients) ? recipe.ingredients.length : 0;
      if (ingredientCount > 0) {
        totalIngredients += ingredientCount;
        maxIngredients = Math.max(maxIngredients, ingredientCount);
        minIngredients = minIngredients === Infinity ? ingredientCount : Math.min(minIngredients, ingredientCount);
      }
    });
    
    const recipesWithIngredientsCount = recipesWithIngredientsData.length;
    const avgIngredients = recipesWithIngredientsCount > 0 ? (totalIngredients / recipesWithIngredientsCount).toFixed(1) : 0;
    console.log(`  Nombre moyen d'ingrédients par recette: ${avgIngredients}`);
    console.log(`  Nombre maximum d'ingrédients: ${maxIngredients}`);
    console.log(`  Nombre minimum d'ingrédients: ${minIngredients === Infinity ? 0 : minIngredients}`);
    console.log(`  Recettes avec ingrédients: ${recipesWithIngredientsCount} / ${totalRecipes}`);
    
    // Statistiques sur les étapes
    console.log('\n📖 STATISTIQUES SUR LES ÉTAPES:');
    const recipesWithStepsData = await RecipeEnriched.find({ preparationSteps: { $exists: true, $ne: [] } }).select('preparationSteps').lean();
    
    let totalSteps = 0;
    let maxSteps = 0;
    let minSteps = Infinity;
    
    recipesWithStepsData.forEach(recipe => {
      const stepCount = Array.isArray(recipe.preparationSteps) ? recipe.preparationSteps.length : 0;
      if (stepCount > 0) {
        totalSteps += stepCount;
        maxSteps = Math.max(maxSteps, stepCount);
        minSteps = minSteps === Infinity ? stepCount : Math.min(minSteps, stepCount);
      }
    });
    
    const recipesWithStepsCount = recipesWithStepsData.length;
    const avgSteps = recipesWithStepsCount > 0 ? (totalSteps / recipesWithStepsCount).toFixed(1) : 0;
    console.log(`  Nombre moyen d'étapes par recette: ${avgSteps}`);
    console.log(`  Nombre maximum d'étapes: ${maxSteps}`);
    console.log(`  Nombre minimum d'étapes: ${minSteps === Infinity ? 0 : minSteps}`);
    console.log(`  Recettes avec étapes: ${recipesWithStepsCount} / ${totalRecipes}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter
listRecipesFromMongo();
