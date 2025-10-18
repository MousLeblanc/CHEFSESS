// debug-medical-recipes.js
// Script de debug pour vérifier les recettes médicales dans la base de données

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Recipe from './recipe.model.js';

dotenv.config();

async function debugMedicalRecipes() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    console.log('\n🔍 Test des filtres médicaux spécialisés...');

    // Test 1: Recettes avec texture IDDSI 4
    const iddsi4Recipes = await Recipe.find({ texture: 'iddsi_4' });
    console.log(`\n🍽️ Recettes texture IDDSI 4: ${iddsi4Recipes.length}`);
    iddsi4Recipes.forEach(recipe => {
      console.log(`  - ${recipe.title} (${recipe.medicalConditions?.join(', ') || 'Aucune'})`);
    });

    // Test 2: Recettes avec dysphagie
    const dysphagieRecipes = await Recipe.find({ medicalConditions: 'dysphagie' });
    console.log(`\n🥤 Recettes pour dysphagie: ${dysphagieRecipes.length}`);
    dysphagieRecipes.forEach(recipe => {
      console.log(`  - ${recipe.title} (texture: ${recipe.texture})`);
    });

    // Test 3: Recettes avec diabète type 2
    const diabeteRecipes = await Recipe.find({ medicalConditions: 'diabete_type2' });
    console.log(`\n🍯 Recettes pour diabète type 2: ${diabeteRecipes.length}`);
    diabeteRecipes.forEach(recipe => {
      console.log(`  - ${recipe.title} (restrictions: ${recipe.dietaryRestrictions?.join(', ') || 'Aucune'})`);
    });

    // Test 4: Recettes avec hypertension
    const hypertensionRecipes = await Recipe.find({ medicalConditions: 'hypertension' });
    console.log(`\n💓 Recettes pour hypertension: ${hypertensionRecipes.length}`);
    hypertensionRecipes.forEach(recipe => {
      console.log(`  - ${recipe.title} (restrictions: ${recipe.dietaryRestrictions?.join(', ') || 'Aucune'})`);
    });

    // Test 5: Recettes sans lactose
    const sansLactoseRecipes = await Recipe.find({ 
      allergens: { $nin: ['lactose'] },
      medicalConditions: { $in: ['diabete_type2', 'hypertension', 'dysphagie'] }
    });
    console.log(`\n🚫 Recettes sans lactose + conditions médicales: ${sansLactoseRecipes.length}`);
    sansLactoseRecipes.forEach(recipe => {
      console.log(`  - ${recipe.title} (conditions: ${recipe.medicalConditions?.join(', ')})`);
    });

    // Test 6: Filtre complexe
    const complexFilter = {
      allergens: { $nin: ['lactose'] },
      $or: [
        { medicalConditions: { $in: ['diabete_type2', 'hypertension', 'dysphagie'] } },
        { dietaryRestrictions: { $in: ['sans_sel', 'pauvre_en_sucre'] } }
      ],
      texture: 'iddsi_4'
    };
    
    const complexRecipes = await Recipe.find(complexFilter);
    console.log(`\n🎯 Filtre complexe (sans lactose + conditions + texture IDDSI 4): ${complexRecipes.length}`);
    complexRecipes.forEach(recipe => {
      console.log(`  - ${recipe.title}`);
      console.log(`    Conditions: ${recipe.medicalConditions?.join(', ') || 'Aucune'}`);
      console.log(`    Restrictions: ${recipe.dietaryRestrictions?.join(', ') || 'Aucune'}`);
      console.log(`    Texture: ${recipe.texture}`);
    });

    // Test 7: Toutes les recettes
    const totalRecipes = await Recipe.countDocuments();
    console.log(`\n📚 Total recettes dans la base: ${totalRecipes}`);

    // Test 8: Statistiques par type de filtre
    console.log('\n📊 Statistiques par type de filtre:');
    
    const medicalStats = await Recipe.aggregate([
      { $unwind: '$medicalConditions' },
      { $group: { _id: '$medicalConditions', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('  Conditions médicales:');
    medicalStats.forEach(stat => {
      console.log(`    ${stat._id}: ${stat.count} recettes`);
    });

    const textureStats = await Recipe.aggregate([
      { $group: { _id: '$texture', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    console.log('  Textures:');
    textureStats.forEach(stat => {
      console.log(`    ${stat._id}: ${stat.count} recettes`);
    });

  } catch (error) {
    console.error('❌ Erreur lors du debug:', error);
  } finally {
    await mongoose.connection.close();
  }
}

debugMedicalRecipes();
