// scripts/move-biko-to-dessert.js
// Script pour déplacer Biko de PLAT vers DESSERT
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

async function moveBikoToDessert() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    const result = await RecipeEnriched.updateOne(
      { name: 'Biko' },
      { $set: { category: 'dessert' } }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Biko déplacé de PLAT vers DESSERT');
    } else {
      const recipe = await RecipeEnriched.findOne({ name: 'Biko' }).lean();
      if (recipe) {
        console.log(`ℹ️  Biko est déjà dans la catégorie: ${recipe.category}`);
      } else {
        console.log('⚠️  Recette "Biko" non trouvée');
      }
    }
    
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

moveBikoToDessert();


