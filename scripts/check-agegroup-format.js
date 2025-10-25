import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkAgeGroupFormat() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses');
    console.log('✅ Connecté à MongoDB');

    // Récupérer 5 exemples de recettes avec ageGroup
    const samples = await RecipeEnriched.find({ ageGroup: { $exists: true } }).limit(5);
    
    console.log('\n📊 Exemples de format ageGroup:\n');
    samples.forEach((recipe, idx) => {
      console.log(`${idx + 1}. ${recipe.name}`);
      console.log(`   ageGroup:`, JSON.stringify(recipe.ageGroup, null, 2));
      console.log(`   Type:`, typeof recipe.ageGroup);
      console.log();
    });

    // Compter les différents formats
    const total = await RecipeEnriched.countDocuments();
    const withAgeGroup = await RecipeEnriched.countDocuments({ ageGroup: { $exists: true } });
    const withoutAgeGroup = total - withAgeGroup;

    console.log(`📈 Stats:`);
    console.log(`   Total recettes: ${total}`);
    console.log(`   Avec ageGroup: ${withAgeGroup}`);
    console.log(`   Sans ageGroup: ${withoutAgeGroup}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkAgeGroupFormat();

