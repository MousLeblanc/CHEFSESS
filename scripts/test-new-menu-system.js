import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

async function testNewMenuSystem() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Test 1: Vérifier le nombre de recettes
    const totalRecipes = await RecipeEnriched.countDocuments();
    console.log(`📚 Total recettes dans le nouveau modèle: ${totalRecipes}`);

    // Test 2: Recherche avec filtres seniors
    const seniorRecipes = await RecipeEnriched.find({
      $and: [
        { establishmentType: { $in: ['ehpad', 'collectivite'] } },
        { texture: 'normale' },
        { diet: { $in: ['sans sel ajouté'] } }
      ]
    });
    console.log(`👴 Recettes pour seniors (sans sel): ${seniorRecipes.length}`);

    // Test 3: Recherche avec pathologies
    const diabeticRecipes = await RecipeEnriched.find({
      pathologies: { $in: ['diabète'] }
    });
    console.log(`🍯 Recettes pour diabétiques: ${diabeticRecipes.length}`);

    // Test 4: Recherche avec allergènes
    const glutenFreeRecipes = await RecipeEnriched.find({
      allergens: { $nin: ['gluten'] }
    });
    console.log(`🌾 Recettes sans gluten: ${glutenFreeRecipes.length}`);

    // Test 5: Recherche élargie (fallback)
    const fallbackRecipes = await RecipeEnriched.find({
      $or: [
        { diet: { $in: ['végétarien'] } },
        { pathologies: { $in: ['hypertension'] } },
        { compatibleFor: { $in: ['senior'] } }
      ]
    });
    console.log(`🔄 Recherche élargie: ${fallbackRecipes.length} recettes`);

    // Test 6: Afficher quelques exemples
    console.log('\n📋 Exemples de recettes:');
    const examples = await RecipeEnriched.find({}).limit(3);
    examples.forEach((recipe, index) => {
      console.log(`${index + 1}. ${recipe.name}`);
      console.log(`   - Catégorie: ${recipe.category}`);
      console.log(`   - Texture: ${recipe.texture}`);
      console.log(`   - Régimes: ${recipe.diet?.join(', ') || 'aucun'}`);
      console.log(`   - Pathologies: ${recipe.pathologies?.join(', ') || 'aucune'}`);
      console.log(`   - Compatible pour: ${recipe.compatibleFor?.join(', ') || 'aucun'}`);
      console.log('');
    });

    console.log('✅ Tests du nouveau système terminés');

  } catch (error) {
    console.error('❌ Erreur test:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testNewMenuSystem();
