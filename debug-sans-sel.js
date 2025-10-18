// debug-sans-sel.js
// Debug spécifique pour les recettes sans sel

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from './recipe.model.js';

dotenv.config();

async function debugSansSel() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔍 Debug spécifique pour les recettes sans sel...');

    // Test 1: Recettes avec sans_sel dans dietaryRestrictions
    const recettesSansSel = await Recipe.find({ dietaryRestrictions: 'sans_sel' });
    console.log(`\n🧂 Recettes avec 'sans_sel' dans dietaryRestrictions: ${recettesSansSel.length}`);
    recettesSansSel.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.title}`);
      console.log(`   Restrictions: ${recipe.dietaryRestrictions?.join(', ') || 'Aucune'}`);
      console.log(`   Conditions médicales: ${recipe.medicalConditions?.join(', ') || 'Aucune'}`);
      console.log('');
    });

    // Test 2: Filtre exact comme dans le contrôleur
    const recipeFilter = {
      allergens: { $nin: [] }
    };

    const orConditions = [];
    orConditions.push({ dietaryRestrictions: { $in: ['sans_sel'] } });
    recipeFilter.$or = orConditions;

    console.log('\n📋 Filtre MongoDB utilisé:', JSON.stringify(recipeFilter, null, 2));

    const recettesFiltrees = await Recipe.find(recipeFilter);
    console.log(`\n🔍 Recettes trouvées avec le filtre MongoDB: ${recettesFiltrees.length}`);
    recettesFiltrees.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.title}`);
      console.log(`   Restrictions: ${recipe.dietaryRestrictions?.join(', ') || 'Aucune'}`);
    });

    // Test 3: Filtre plus simple
    const filtreSimple = { dietaryRestrictions: { $in: ['sans_sel'] } };
    const recettesSimples = await Recipe.find(filtreSimple);
    console.log(`\n🔍 Recettes avec filtre simple: ${recettesSimples.length}`);

    // Test 4: Vérifier la structure des dietaryRestrictions
    console.log('\n🔍 Structure des dietaryRestrictions:');
    const sampleRecipes = await Recipe.find({ dietaryRestrictions: { $exists: true } }).limit(5);
    sampleRecipes.forEach(recipe => {
      console.log(`${recipe.title}:`, recipe.dietaryRestrictions);
    });

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugSansSel();
