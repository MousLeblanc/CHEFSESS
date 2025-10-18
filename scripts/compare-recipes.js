import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Recipe from '../recipe.model.js'; // Ancien modèle
import RecipeEnriched from '../models/Recipe.js'; // Nouveau modèle

async function compareRecipes() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Récupérer toutes les recettes des deux modèles
    const oldRecipes = await Recipe.find({}).lean();
    const newRecipes = await RecipeEnriched.find({}).lean();

    console.log(`\n📊 COMPARAISON DES RECETTES:`);
    console.log(`Ancien modèle: ${oldRecipes.length} recettes`);
    console.log(`Nouveau modèle: ${newRecipes.length} recettes`);

    // Vérifier si les recettes sont identiques
    console.log(`\n🔍 VÉRIFICATION D'IDENTITÉ:`);

    // Comparer par titre/nom
    const oldTitles = oldRecipes.map(r => r.title || r.name).sort();
    const newTitles = newRecipes.map(r => r.name || r.title).sort();

    const identicalTitles = oldTitles.every((title, index) => title === newTitles[index]);
    console.log(`✅ Titres identiques: ${identicalTitles}`);

    // Vérifier les doublons
    const oldUniqueTitles = [...new Set(oldTitles)];
    const newUniqueTitles = [...new Set(newTitles)];
    
    console.log(`📊 Ancien modèle - Titres uniques: ${oldUniqueTitles.length}`);
    console.log(`📊 Nouveau modèle - Titres uniques: ${newUniqueTitles.length}`);

    // Vérifier les recettes manquantes
    const missingInNew = oldTitles.filter(title => !newTitles.includes(title));
    const missingInOld = newTitles.filter(title => !oldTitles.includes(title));

    console.log(`\n❌ Recettes manquantes dans le nouveau modèle: ${missingInNew.length}`);
    if (missingInNew.length > 0) {
      console.log('Premières 5 recettes manquantes:');
      missingInNew.slice(0, 5).forEach(title => console.log(`  - ${title}`));
    }

    console.log(`\n❌ Recettes manquantes dans l'ancien modèle: ${missingInOld.length}`);
    if (missingInOld.length > 0) {
      console.log('Premières 5 recettes manquantes:');
      missingInOld.slice(0, 5).forEach(title => console.log(`  - ${title}`));
    }

    // Vérifier la cohérence des données
    console.log(`\n🔍 VÉRIFICATION DE COHÉRENCE:`);

    // Comparer les champs nutritionnels
    const oldWithNutrition = oldRecipes.filter(r => r.nutrition && r.nutrition.calories > 0);
    const newWithNutrition = newRecipes.filter(r => r.nutritionalProfile && r.nutritionalProfile.kcal > 0);

    console.log(`📊 Ancien modèle - Recettes avec nutrition: ${oldWithNutrition.length}`);
    console.log(`📊 Nouveau modèle - Recettes avec nutrition: ${newWithNutrition.length}`);

    // Comparer les allergènes
    const oldWithAllergens = oldRecipes.filter(r => r.allergens && r.allergens.length > 0);
    const newWithAllergens = newRecipes.filter(r => r.allergens && r.allergens.length > 0);

    console.log(`📊 Ancien modèle - Recettes avec allergènes: ${oldWithAllergens.length}`);
    console.log(`📊 Nouveau modèle - Recettes avec allergènes: ${newWithAllergens.length}`);

    // Vérifier les différences de mapping
    console.log(`\n🔄 VÉRIFICATION DU MAPPING:`);

    // Vérifier si les données ont été correctement mappées
    const sampleOld = oldRecipes[0];
    const sampleNew = newRecipes[0];

    console.log(`\n📋 EXEMPLE DE MAPPING:`);
    console.log(`Ancien - Title: "${sampleOld.title}"`);
    console.log(`Nouveau - Name: "${sampleNew.name}"`);
    console.log(`Ancien - Dietary: ${JSON.stringify(sampleOld.dietaryRestrictions)}`);
    console.log(`Nouveau - Diet: ${JSON.stringify(sampleNew.diet)}`);
    console.log(`Ancien - Medical: ${JSON.stringify(sampleOld.medicalConditions)}`);
    console.log(`Nouveau - Pathologies: ${JSON.stringify(sampleNew.pathologies)}`);

    // Vérifier si les données nutritionnelles sont identiques
    if (sampleOld.nutrition && sampleNew.nutritionalProfile) {
      console.log(`\n📊 NUTRITION COMPARISON:`);
      console.log(`Ancien - Calories: ${sampleOld.nutrition.calories}`);
      console.log(`Nouveau - Kcal: ${sampleNew.nutritionalProfile.kcal}`);
      console.log(`Ancien - Proteins: ${sampleOld.nutrition.proteins}`);
      console.log(`Nouveau - Protein: ${sampleNew.nutritionalProfile.protein}`);
    }

    // Vérifier les recettes avec des données manquantes
    console.log(`\n⚠️ RECETTES AVEC DONNÉES MANQUANTES:`);
    
    const oldMissingData = oldRecipes.filter(r => 
      !r.nutrition || r.nutrition.calories === 0 || 
      !r.allergens || r.allergens.length === 0
    );
    
    const newMissingData = newRecipes.filter(r => 
      !r.nutritionalProfile || r.nutritionalProfile.kcal === 0 || 
      !r.allergens || r.allergens.length === 0
    );

    console.log(`Ancien modèle - Recettes avec données manquantes: ${oldMissingData.length}`);
    console.log(`Nouveau modèle - Recettes avec données manquantes: ${newMissingData.length}`);

    console.log(`\n✅ Comparaison terminée`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

compareRecipes();
