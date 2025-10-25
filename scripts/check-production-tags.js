import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkProductionTags() {
  try {
    // Connexion production
    const productionURI = process.env.MONGODB_URI;
    await mongoose.connect(productionURI);
    console.log('✅ Connecté à MongoDB PRODUCTION\n');

    const RecipeEnriched = mongoose.model('RecipeEnriched', new mongoose.Schema({}, { strict: false }));

    // Récupérer 5 exemples
    const samples = await RecipeEnriched.find({ tags: { $exists: true, $ne: [] } }).limit(5);
    
    console.log('📋 Exemples de recettes en PRODUCTION:\n');
    samples.forEach((recipe, idx) => {
      console.log(`${idx + 1}. ${recipe.name}`);
      console.log(`   tags: ${JSON.stringify(recipe.tags)}`);
      console.log(`   dietaryRestrictions: ${JSON.stringify(recipe.dietaryRestrictions)}`);
      console.log(`   diet: ${JSON.stringify(recipe.diet)}`);
      console.log();
    });

    // Compter les tags uniques
    const allTags = await RecipeEnriched.aggregate([
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    console.log('\n🏷️  Top 20 tags en PRODUCTION:');
    allTags.forEach(t => console.log(`   ${t._id}: ${t.count}`));

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkProductionTags();

