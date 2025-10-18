import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

async function testRecipeGeneratorSimple() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Test 1: Vérifier que le modèle fonctionne
    console.log('\n🔍 TEST 1: Vérification du modèle RecipeEnriched');
    const recipeCount = await RecipeEnriched.countDocuments();
    console.log(`📊 Nombre de recettes: ${recipeCount}`);

    // Test 2: Vérifier les recettes générées par IA
    console.log('\n🔍 TEST 2: Recettes générées par IA');
    const aiGeneratedCount = await RecipeEnriched.countDocuments({ aiGenerated: true });
    console.log(`📊 Recettes générées par IA: ${aiGeneratedCount}`);

    // Test 3: Vérifier les recettes par établissement
    console.log('\n🔍 TEST 3: Recettes par établissement');
    const stats = await RecipeEnriched.aggregate([
      {
        $match: { aiGenerated: true }
      },
      {
        $group: {
          _id: '$establishmentType',
          count: { $sum: 1 }
        }
      }
    ]);

    console.log('📊 Répartition par établissement:');
    stats.forEach(stat => {
      console.log(`  - ${stat._id.join(', ')}: ${stat.count} recettes`);
    });

    // Test 4: Vérifier les filtres
    console.log('\n🔍 TEST 4: Test des filtres');
    
    // Test texture mixée
    const mixeeRecipes = await RecipeEnriched.find({ texture: 'mixée' });
    console.log(`📊 Recettes mixées: ${mixeeRecipes.length}`);

    // Test pathologies
    const diabeticRecipes = await RecipeEnriched.find({ pathologies: { $in: ['diabète'] } });
    console.log(`📊 Recettes pour diabétiques: ${diabeticRecipes.length}`);

    // Test régimes
    const hyperproteineRecipes = await RecipeEnriched.find({ diet: { $in: ['hyperprotéiné'] } });
    console.log(`📊 Recettes hyperprotéinées: ${hyperproteineRecipes.length}`);

    // Test 5: Simuler la génération d'une recette
    console.log('\n🔍 TEST 5: Simulation de génération');
    
    const sampleRecipe = {
      name: "Test Recette IA",
      category: "plat",
      description: "Recette de test générée par IA",
      texture: "mixée",
      diet: ["sans_sel", "hyperprotéiné"],
      pathologies: ["diabète", "hypertension"],
      allergens: [],
      nutritionalProfile: {
        kcal: 350,
        protein: 25,
        lipids: 15,
        carbs: 30,
        fiber: 5,
        sodium: 100
      },
      ingredients: [
        { name: "Poulet", quantity: 150, unit: "g" },
        { name: "Légumes", quantity: 200, unit: "g" }
      ],
      preparationSteps: [
        "Cuire le poulet à la vapeur",
        "Mixer avec les légumes"
      ],
      establishmentType: ["ehpad"],
      compatibleFor: ["mixée", "diabétique"],
      aiCompatibilityScore: 1.0,
      aiGenerated: true
    };

    try {
      const insertedRecipe = await RecipeEnriched.create(sampleRecipe);
      console.log(`✅ Recette de test insérée: ${insertedRecipe.name}`);
      
      // Supprimer la recette de test
      await RecipeEnriched.deleteOne({ _id: insertedRecipe._id });
      console.log('✅ Recette de test supprimée');
    } catch (error) {
      console.error('❌ Erreur insertion recette de test:', error.message);
    }

    console.log('\n✅ Tests terminés avec succès');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testRecipeGeneratorSimple();
