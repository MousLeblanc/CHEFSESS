// debug-select-menu-ai.js
// Debug de la fonction selectMenuWithAI

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from './recipe.model.js';

dotenv.config();

async function debugSelectMenuAI() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Simuler les paramètres du test minimal
    const compatibleRecipes = await Recipe.find({
      allergens: { $nin: [] },
      $or: [
        { dietaryRestrictions: { $in: ['sans_sel'] } }
      ]
    });

    console.log(`\n🔍 ${compatibleRecipes.length} recettes compatibles trouvées`);

    const numDishes = 2;
    const totalPeople = 25;
    const ageGroups = [{ ageRange: 'adulte', count: 25 }];
    const establishmentType = 'maison_retraite';
    const theme = undefined;
    const allergens = [];
    const dietaryRestrictions = ['sans_sel'];
    const medicalConditions = [];
    const menuStructure = 'entree_plat';

    console.log('\n🔍 Test de selectMenuWithAI...');
    console.log(`Allergènes: ${allergens}`);
    console.log(`Restrictions: ${dietaryRestrictions}`);
    console.log(`Conditions médicales: ${medicalConditions}`);

    // Test du filtrage strict
    let filteredRecipes = compatibleRecipes.filter(recipe => {
      // Vérifier allergènes
      if (allergens && allergens.length > 0) {
        const recipeAllergens = recipe.allergens || [];
        const hasProblematicAllergen = recipeAllergens.some(a => allergens.includes(a));
        if (hasProblematicAllergen) {
          console.log(`❌ ${recipe.title} exclue (allergène: ${recipeAllergens.find(a => allergens.includes(a))})`);
          return false;
        }
      }
      
      // Vérifier restrictions alimentaires
      if (dietaryRestrictions && dietaryRestrictions.length > 0) {
        const recipeRestrictions = recipe.dietaryRestrictions || [];
        const matchesRestriction = dietaryRestrictions.some(r => recipeRestrictions.includes(r));
        if (!matchesRestriction) {
          console.log(`❌ ${recipe.title} exclue (restrictions: ${recipeRestrictions.join(', ')}, demandées: ${dietaryRestrictions.join(', ')})`);
          return false;
        }
      }
      
      return true;
    });

    console.log(`✅ ${filteredRecipes.length} recettes après filtrage strict`);

    if (filteredRecipes.length === 0) {
      console.log(`❌ Aucune recette compatible après filtrage strict !`);
      console.log(`🔍 Recettes originales: ${compatibleRecipes.length}`);
      console.log(`🔍 Exemples de recettes originales:`, compatibleRecipes.slice(0, 3).map(r => ({
        title: r.title,
        allergens: r.allergens,
        dietaryRestrictions: r.dietaryRestrictions,
        medicalConditions: r.medicalConditions
      })));
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

debugSelectMenuAI();
