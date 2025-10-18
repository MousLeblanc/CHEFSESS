import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Recipe from '../recipe.model.js'; // Ancien modèle
import RecipeEnriched from '../models/Recipe.js'; // Nouveau modèle

async function checkStructures() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Vérifier l'ancien modèle
    console.log('\n📚 ANCIEN MODÈLE (Recipe):');
    const oldCount = await Recipe.countDocuments();
    console.log(`📊 Nombre de recettes: ${oldCount}`);
    
    if (oldCount > 0) {
      const oldSample = await Recipe.findOne();
      console.log('🔍 Champs disponibles:');
      console.log(Object.keys(oldSample.toObject()).join(', '));
      console.log('\n📋 Exemple de structure:');
      console.log(JSON.stringify({
        title: oldSample.title,
        category: oldSample.category,
        texture: oldSample.texture,
        allergens: oldSample.allergens,
        dietaryRestrictions: oldSample.dietaryRestrictions,
        medicalConditions: oldSample.medicalConditions,
        nutrition: oldSample.nutrition
      }, null, 2));
    }

    // Vérifier le nouveau modèle
    console.log('\n📚 NOUVEAU MODÈLE (RecipeEnriched):');
    const newCount = await RecipeEnriched.countDocuments();
    console.log(`📊 Nombre de recettes: ${newCount}`);
    
    if (newCount > 0) {
      const newSample = await RecipeEnriched.findOne();
      console.log('🔍 Champs disponibles:');
      console.log(Object.keys(newSample.toObject()).join(', '));
      console.log('\n📋 Exemple de structure:');
      console.log(JSON.stringify({
        name: newSample.name,
        category: newSample.category,
        texture: newSample.texture,
        allergens: newSample.allergens,
        diet: newSample.diet,
        pathologies: newSample.pathologies,
        nutritionalProfile: newSample.nutritionalProfile
      }, null, 2));
    }

    // Vérifier les différences de mapping
    console.log('\n🔄 DIFFÉRENCES DE MAPPING:');
    console.log('Ancien → Nouveau:');
    console.log('title → name');
    console.log('dietaryRestrictions → diet');
    console.log('medicalConditions → pathologies');
    console.log('instructions → preparationSteps');
    console.log('nutrition → nutritionalProfile');
    console.log('ageGroup → (supprimé)');
    console.log('establishmentType → (array au lieu de string)');

    // Vérifier la cohérence des données
    console.log('\n🔍 VÉRIFICATION DE COHÉRENCE:');
    
    // Compter les recettes avec des champs manquants dans l'ancien modèle
    const oldMissingNutrition = await Recipe.countDocuments({ nutrition: { $exists: false } });
    const oldMissingAllergens = await Recipe.countDocuments({ allergens: { $exists: false } });
    
    console.log(`❌ Ancien modèle - Recettes sans nutrition: ${oldMissingNutrition}`);
    console.log(`❌ Ancien modèle - Recettes sans allergènes: ${oldMissingAllergens}`);
    
    // Compter les recettes avec des champs manquants dans le nouveau modèle
    const newMissingNutrition = await RecipeEnriched.countDocuments({ nutritionalProfile: { $exists: false } });
    const newMissingAllergens = await RecipeEnriched.countDocuments({ allergens: { $exists: false } });
    
    console.log(`❌ Nouveau modèle - Recettes sans nutritionalProfile: ${newMissingNutrition}`);
    console.log(`❌ Nouveau modèle - Recettes sans allergènes: ${newMissingAllergens}`);

    console.log('\n✅ Analyse terminée');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkStructures();
