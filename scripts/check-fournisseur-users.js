import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function checkFournisseurUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const fournisseurs = await User.find({ role: 'fournisseur' });

    console.log(`📦 ${fournisseurs.length} utilisateurs avec role: 'fournisseur'\n`);

    for (const f of fournisseurs) {
      console.log(`${f._id}`);
      console.log(`   Name: ${f.name}`);
      console.log(`   Email: ${f.email}`);
      console.log(`   BusinessName: ${f.businessName || 'N/A'}`);
      console.log(`   Créé le: ${f.createdAt || 'N/A'}`);
      console.log('');
    }

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkFournisseurUsers();


