import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeDietFields() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses');
    console.log('✅ Connecté à MongoDB\n');

    const total = await RecipeEnriched.countDocuments();
    console.log(`📊 Total recettes: ${total}\n`);

    // 1. Analyser le champ 'diet'
    const diets = await RecipeEnriched.aggregate([
      { $unwind: { path: '$diet', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$diet', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('🍽️  Valeurs du champ "diet" :');
    diets.forEach(d => {
      console.log(`   ${d._id || '(vide)'}: ${d.count}`);
    });

    // 2. Analyser le champ 'dietaryRestrictions'
    const restrictions = await RecipeEnriched.aggregate([
      { $unwind: { path: '$dietaryRestrictions', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$dietaryRestrictions', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('\n🚫 Valeurs du champ "dietaryRestrictions" :');
    restrictions.forEach(r => {
      console.log(`   ${r._id || '(vide)'}: ${r.count}`);
    });

    // 3. Analyser les tags
    const tags = await RecipeEnriched.aggregate([
      { $unwind: { path: '$tags', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 30 }
    ]);

    console.log('\n🏷️  Top 30 tags :');
    tags.forEach(t => {
      console.log(`   ${t._id || '(vide)'}: ${t.count}`);
    });

    // 4. Compter recettes avec champs manquants
    const noDiet = await RecipeEnriched.countDocuments({ $or: [{ diet: { $exists: false } }, { diet: { $size: 0 } }] });
    const noRestrictions = await RecipeEnriched.countDocuments({ $or: [{ dietaryRestrictions: { $exists: false } }, { dietaryRestrictions: { $size: 0 } }] });
    const noTags = await RecipeEnriched.countDocuments({ $or: [{ tags: { $exists: false } }, { tags: { $size: 0 } }] });

    console.log('\n📉 Recettes avec champs manquants :');
    console.log(`   Sans 'diet': ${noDiet}`);
    console.log(`   Sans 'dietaryRestrictions': ${noRestrictions}`);
    console.log(`   Sans 'tags': ${noTags}`);

    // 5. Exemples de recettes
    console.log('\n📖 Exemple de recette complète :');
    const sample = await RecipeEnriched.findOne({ diet: { $exists: true, $ne: [] } });
    if (sample) {
      console.log(`   Nom: ${sample.name}`);
      console.log(`   diet: ${JSON.stringify(sample.diet)}`);
      console.log(`   dietaryRestrictions: ${JSON.stringify(sample.dietaryRestrictions)}`);
      console.log(`   tags: ${JSON.stringify(sample.tags)}`);
    }

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

analyzeDietFields();

