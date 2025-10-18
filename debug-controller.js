// debug-controller.js
// Script de debug pour tester directement le contrôleur

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from './recipe.model.js';

dotenv.config();

async function debugController() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Simuler les paramètres du test
    const allergens = [];
    const dietaryRestrictions = [];
    const medicalConditions = ['diabete_type2', 'hypertension'];
    const texture = 'normale';

    console.log('\n🔍 Test du filtrage du contrôleur...');
    console.log(`Allergènes: ${allergens}`);
    console.log(`Restrictions: ${dietaryRestrictions}`);
    console.log(`Conditions médicales: ${medicalConditions}`);
    console.log(`Texture: ${texture}`);

    // 1. Construire les filtres comme dans le contrôleur
    const recipeFilter = {
      allergens: { $nin: allergens }
    };

    const orConditions = [];
    
    if (dietaryRestrictions.length > 0) {
      orConditions.push({ dietaryRestrictions: { $in: dietaryRestrictions } });
    }

    if (medicalConditions.length > 0) {
      orConditions.push({ medicalConditions: { $in: medicalConditions } });
    }

    if (orConditions.length > 0) {
      recipeFilter.$or = orConditions;
    }

    if (texture && texture !== 'normale') {
      recipeFilter.texture = texture;
    }

    console.log('\n📋 Filtre MongoDB:', JSON.stringify(recipeFilter, null, 2));

    // 2. Récupérer les recettes compatibles
    let compatibleRecipes = await Recipe.find(recipeFilter);
    console.log(`\n🔍 ${compatibleRecipes.length} recettes compatibles trouvées`);

    if (compatibleRecipes.length > 0) {
      console.log('\n📋 Exemples de recettes compatibles:');
      compatibleRecipes.slice(0, 5).forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title}`);
        console.log(`   Allergènes: ${recipe.allergens?.join(', ') || 'Aucun'}`);
        console.log(`   Restrictions: ${recipe.dietaryRestrictions?.join(', ') || 'Aucune'}`);
        console.log(`   Conditions médicales: ${recipe.medicalConditions?.join(', ') || 'Aucune'}`);
        console.log(`   Texture: ${recipe.texture}`);
        console.log('');
      });
    }

    // 3. Test du filtrage strict (comme dans selectMenuWithAI)
    console.log('\n🔍 Test du filtrage strict (selectMenuWithAI)...');
    
    let filteredRecipes = compatibleRecipes.filter(recipe => {
      // Vérifier allergènes
      if (allergens && allergens.length > 0) {
        const recipeAllergens = recipe.allergens || [];
        const hasProblematicAllergen = recipeAllergens.some(a => allergens.includes(a));
        if (hasProblematicAllergen) {
          return false;
        }
      }
      
      // Vérifier restrictions alimentaires
      if (dietaryRestrictions && dietaryRestrictions.length > 0) {
        const recipeRestrictions = recipe.dietaryRestrictions || [];
        const matchesRestriction = dietaryRestrictions.some(r => recipeRestrictions.includes(r));
        if (!matchesRestriction && dietaryRestrictions.length > 0) {
          return false;
        }
      }
      
      return true;
    });

    console.log(`✅ ${filteredRecipes.length} recettes après filtrage strict`);

    if (filteredRecipes.length === 0) {
      console.log(`❌ Aucune recette compatible après filtrage strict !`);
      console.log(`🔍 Recettes originales: ${compatibleRecipes.length}`);
    } else {
      console.log('\n📋 Recettes après filtrage strict:');
      filteredRecipes.forEach((recipe, index) => {
        console.log(`${index + 1}. ${recipe.title}`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugController();
