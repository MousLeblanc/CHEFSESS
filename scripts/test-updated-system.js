import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

async function testUpdatedSystem() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Test 1: Vérifier que le nouveau modèle fonctionne
    console.log('\n🔍 TEST 1: Vérification du nouveau modèle');
    const recipeCount = await RecipeEnriched.countDocuments();
    console.log(`📊 Nombre de recettes: ${recipeCount}`);

    if (recipeCount > 0) {
      const sampleRecipe = await RecipeEnriched.findOne();
      console.log('📋 Exemple de recette:');
      console.log({
        name: sampleRecipe.name,
        category: sampleRecipe.category,
        texture: sampleRecipe.texture,
        diet: sampleRecipe.diet,
        pathologies: sampleRecipe.pathologies,
        allergens: sampleRecipe.allergens,
        nutritionalProfile: sampleRecipe.nutritionalProfile
      });
    }

    // Test 2: Vérifier les filtres
    console.log('\n🔍 TEST 2: Test des filtres');
    
    // Test filtres de texture
    const textureRecipes = await RecipeEnriched.find({ texture: 'normale' });
    console.log(`📊 Recettes avec texture normale: ${textureRecipes.length}`);

    // Test filtres de régime
    const dietRecipes = await RecipeEnriched.find({ diet: { $in: ['végétarien'] } });
    console.log(`📊 Recettes végétariennes: ${dietRecipes.length}`);

    // Test filtres de pathologies
    const pathologyRecipes = await RecipeEnriched.find({ pathologies: { $in: ['diabète'] } });
    console.log(`📊 Recettes pour diabétiques: ${pathologyRecipes.length}`);

    // Test filtres d'allergènes
    const allergenRecipes = await RecipeEnriched.find({ allergens: { $nin: ['gluten'] } });
    console.log(`📊 Recettes sans gluten: ${allergenRecipes.length}`);

    // Test 3: Vérifier les champs nutritionnels
    console.log('\n🔍 TEST 3: Vérification des champs nutritionnels');
    const recipesWithNutrition = await RecipeEnriched.find({ 
      'nutritionalProfile.kcal': { $gt: 0 } 
    });
    console.log(`📊 Recettes avec données nutritionnelles: ${recipesWithNutrition.length}`);

    // Test 4: Vérifier les établissements
    console.log('\n🔍 TEST 4: Vérification des établissements');
    const ehpadRecipes = await RecipeEnriched.find({ 
      establishmentType: { $in: ['ehpad'] } 
    });
    console.log(`📊 Recettes pour EHPAD: ${ehpadRecipes.length}`);

    const collectiviteRecipes = await RecipeEnriched.find({ 
      establishmentType: { $in: ['collectivite'] } 
    });
    console.log(`📊 Recettes pour collectivités: ${collectiviteRecipes.length}`);

    // Test 5: Test de génération de menu simple
    console.log('\n🔍 TEST 5: Test de génération de menu simple');
    
    const testFilters = {
      texture: 'normale',
      diet: { $in: ['végétarien'] },
      allergens: { $nin: ['gluten'] }
    };

    const compatibleRecipes = await RecipeEnriched.find(testFilters);
    console.log(`📊 Recettes compatibles avec les filtres de test: ${compatibleRecipes.length}`);

    if (compatibleRecipes.length > 0) {
      console.log('📋 Exemples de recettes compatibles:');
      compatibleRecipes.slice(0, 3).forEach(recipe => {
        console.log(`  - ${recipe.name} (${recipe.category})`);
      });
    }

    console.log('\n✅ Tests terminés avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testUpdatedSystem();
