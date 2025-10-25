import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkTagsFormat() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses');
    console.log('✅ Connecté à MongoDB\n');

    const RecipeEnriched = mongoose.model('RecipeEnriched', new mongoose.Schema({}, { strict: false }));

    // Récupérer une recette avec tags
    const sample = await RecipeEnriched.findOne({ tags: { $exists: true, $ne: [] } });
    
    console.log('📋 Exemple de recette:');
    console.log(`   Nom: ${sample.name}`);
    console.log(`   tags: ${JSON.stringify(sample.tags)}`);
    console.log(`   dietaryRestrictions: ${JSON.stringify(sample.dietaryRestrictions)}`);
    console.log(`   diet: ${JSON.stringify(sample.diet)}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkTagsFormat();

