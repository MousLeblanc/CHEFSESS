import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function checkFournisseur() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));

    // Chercher tous les fournisseurs avec cet email
    const suppliers = await Supplier.find({ 
      email: { $regex: /fournisseur.*@gmail\.com/i }
    });

    console.log(`🔍 Fournisseurs trouvés avec email contenant "fournisseur@gmail.com": ${suppliers.length}\n`);

    for (const supplier of suppliers) {
      console.log('📦 Fournisseur:');
      console.log(`   ID: ${supplier._id}`);
      console.log(`   Nom: ${supplier.name}`);
      console.log(`   Email: ${supplier.email}`);
      console.log(`   Contact: ${supplier.contact}`);
      console.log(`   Produits: ${supplier.products?.length || 0}`);
      console.log(`   Créé le: ${supplier.createdAt}`);
      console.log(`   Statut: ${supplier.status}`);
      console.log('');
    }

    if (suppliers.length === 0) {
      console.log('⚠️  Aucun fournisseur trouvé avec cet email.');
      console.log('💡 Recherche de tous les fournisseurs pour voir ce qui existe...\n');
      
      const allSuppliers = await Supplier.find({}).limit(10);
      console.log(`📋 Voici les 10 premiers fournisseurs:`);
      for (const s of allSuppliers) {
        console.log(`   - ${s.name} (${s.email}) - ${s.products?.length || 0} produits`);
      }
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkFournisseur();


