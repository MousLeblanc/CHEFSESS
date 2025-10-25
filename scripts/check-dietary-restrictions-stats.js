import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkDietaryRestrictionsStats() {
  try {
    const productionURI = process.env.MONGODB_URI;
    await mongoose.connect(productionURI);
    console.log('✅ Connecté à MongoDB PRODUCTION\n');

    const RecipeEnriched = mongoose.model('RecipeEnriched', new mongoose.Schema({}, { strict: false }));

    const total = await RecipeEnriched.countDocuments();
    console.log(`📊 Total recettes: ${total}\n`);

    // Compter les dietaryRestrictions
    const restrictions = await RecipeEnriched.aggregate([
      { $unwind: { path: '$dietaryRestrictions', preserveNullAndEmptyArrays: true } },
      { $group: { _id: '$dietaryRestrictions', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('🚫 DietaryRestrictions (valeurs) :');
    restrictions.forEach(r => {
      console.log(`   ${r._id || '(vide)'}: ${r.count}`);
    });

    // Chercher spécifiquement les valeurs critiques
    console.log('\n🔍 Recherche de valeurs spécifiques:');
    
    const halal = await RecipeEnriched.countDocuments({ dietaryRestrictions: 'halal' });
    const casher = await RecipeEnriched.countDocuments({ dietaryRestrictions: 'casher' });
    const hypoglucidique = await RecipeEnriched.countDocuments({ dietaryRestrictions: 'hypoglucidique' });
    const sans_sel = await RecipeEnriched.countDocuments({ dietaryRestrictions: 'sans_sel' });
    const vegetarien = await RecipeEnriched.countDocuments({ dietaryRestrictions: 'végétarien' });

    console.log(`   halal: ${halal}`);
    console.log(`   casher: ${casher}`);
    console.log(`   hypoglucidique: ${hypoglucidique}`);
    console.log(`   sans_sel: ${sans_sel}`);
    console.log(`   végétarien: ${vegetarien}`);

    // Chercher dans les tags
    console.log('\n🏷️  Recherche dans les tags:');
    const tagHalal = await RecipeEnriched.countDocuments({ tags: '#halal' });
    const tagCasher = await RecipeEnriched.countDocuments({ tags: '#casher' });
    const tagHypoglucidique = await RecipeEnriched.countDocuments({ tags: '#hypoglucidique' });
    const tagSansSel = await RecipeEnriched.countDocuments({ tags: '#sans_sel' });

    console.log(`   #halal: ${tagHalal}`);
    console.log(`   #casher: ${tagCasher}`);
    console.log(`   #hypoglucidique: ${tagHypoglucidique}`);
    console.log(`   #sans_sel: ${tagSansSel}`);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkDietaryRestrictionsStats();

