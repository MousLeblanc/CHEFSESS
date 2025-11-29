// scripts/fix-witchetty-grubs-category.js
// Script pour corriger la catégorie de Witchetty Grubs
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

async function fixWitchettyGrubsCategory() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    const recipe = await RecipeEnriched.findOne({ name: 'Witchetty Grubs' }).lean();
    
    if (recipe) {
      if (recipe.category !== 'plat') {
        await RecipeEnriched.updateOne(
          { _id: recipe._id },
          { $set: { category: 'plat' } }
        );
        console.log(`✅ Witchetty Grubs déplacé de ${recipe.category} vers PLAT`);
      } else {
        console.log(`ℹ️  Witchetty Grubs est déjà dans la catégorie PLAT`);
      }
    } else {
      console.log('⚠️  Recette "Witchetty Grubs" non trouvée');
    }
    
    // Chercher GEDDE BOLLEN avec différentes variantes
    const variants = ['GEDDE BOLLEN', 'Gedde Bollen', 'Gedde Bollen', 'GEDDE BOLLEN'];
    for (const variant of variants) {
      const found = await RecipeEnriched.findOne({ name: variant }).lean();
      if (found) {
        console.log(`\n✅ Trouvé: "${found.name}" (catégorie: ${found.category})`);
        await RecipeEnriched.updateOne(
          { _id: found._id },
          {
            $set: {
              frenchTitle: 'Boulettes de viande',
              description: 'Boulettes de viande (Pays-Bas).'
            }
          }
        );
        console.log(`   Titre FR et description ajoutés`);
        break;
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

fixWitchettyGrubsCategory();


