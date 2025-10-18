// debug-main-controller.js
// Debug du contrôleur principal

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from './recipe.model.js';

dotenv.config();

async function debugMainController() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Simuler les paramètres du test minimal
    const allergens = [];
    const dietaryRestrictions = ['sans_sel'];
    const medicalConditions = [];
    const texture = 'normale';

    console.log('\n🔍 Test du contrôleur principal...');
    console.log(`Allergènes: ${allergens}`);
    console.log(`Restrictions: ${dietaryRestrictions}`);
    console.log(`Conditions médicales: ${medicalConditions}`);
    console.log(`Texture: ${texture}`);

    // 1. Construire les filtres comme dans le contrôleur principal
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

    console.log('\n📋 Filtre MongoDB principal:', JSON.stringify(recipeFilter, null, 2));

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

    // 3. Test du filtrage par âge
    console.log('\n🔍 Test du filtrage par âge...');
    const majorityAgeGroup = 'adulte';
    const filteredByAge = filterRecipesByAgeGroup(compatibleRecipes, majorityAgeGroup);
    console.log(`👴 ${filteredByAge.length} recettes après filtrage par âge`);

    // 4. Test du filtrage pour seniors
    console.log('\n🔍 Test du filtrage pour seniors...');
    const filteredForSeniors = filterRecipesForSeniors(filteredByAge);
    console.log(`👴 ${filteredForSeniors.length} recettes adaptées aux seniors`);

    if (filteredForSeniors.length < 2) {
      console.log(`❌ Pas assez de recettes compatibles. Trouvé: ${filteredForSeniors.length}, requis: 2`);
    } else {
      console.log(`✅ Assez de recettes compatibles: ${filteredForSeniors.length}`);
    }

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await mongoose.connection.close();
  }
}

// Fonction de filtrage par âge (copiée du contrôleur)
function filterRecipesByAgeGroup(recipes, ageGroup) {
  if (!ageGroup) return recipes;
  
  return recipes.filter(recipe => {
    const recipeAgeGroup = recipe.ageGroup;
    if (!recipeAgeGroup) return true;
    
    // Logique de compatibilité des âges
    const ageRanges = {
      '2.5-6': ['2.5-6', '2.5-18'],
      '6-12': ['6-12', '2.5-18'],
      '12-18': ['12-18', '2.5-18'],
      '18+': ['18+'],
      'adulte': ['18+', 'adulte']
    };
    
    const compatibleAges = ageRanges[ageGroup] || [ageGroup];
    return compatibleAges.includes(recipeAgeGroup);
  });
}

// Fonction de filtrage pour seniors (copiée du contrôleur)
function filterRecipesForSeniors(recipes) {
  const inappropriateKeywords = [
    'buddha bowl', 'tacos', 'hamburger', 'bowl', 'wrap', 'smoothie bowl',
    'poke bowl', 'burrito', 'quesadilla', 'nachos', 'fajitas'
  ];
  
  return recipes.filter(recipe => {
    const title = recipe.title.toLowerCase();
    const description = (recipe.description || '').toLowerCase();
    
    const hasInappropriateKeyword = inappropriateKeywords.some(keyword => 
      title.includes(keyword) || description.includes(keyword)
    );
    
    if (hasInappropriateKeyword) {
      console.log(`🚫 Recette "${recipe.title}" exclue pour les seniors (mot-clé inapproprié)`);
      return false;
    }
    
    return true;
  });
}

debugMainController();
