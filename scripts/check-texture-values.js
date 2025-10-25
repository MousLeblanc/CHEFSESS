import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function checkTextureValues() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses');
    console.log('✅ Connecté à MongoDB\n');

    const RecipeEnriched = mongoose.model('RecipeEnriched', new mongoose.Schema({}, { strict: false }));

    const textures = await RecipeEnriched.aggregate([
      { $group: { _id: '$texture', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    console.log('🔍 Valeurs de texture trouvées :');
    textures.forEach(t => {
      console.log(`   ${t._id || '(vide)'}: ${t.count}`);
    });

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkTextureValues();

