import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function checkSupplierById() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));

    const supplierId = '6900a4ecb1d8f44ec504c49f';
    console.log(`🔍 Recherche du fournisseur avec ID: ${supplierId}\n`);

    const supplier = await Supplier.findById(supplierId);

    if (supplier) {
      console.log('✅ FOURNISSEUR TROUVÉ !');
      console.log('   ID:', supplier._id);
      console.log('   Nom:', supplier.name);
      console.log('   Email:', supplier.email);
      console.log('   Produits:', supplier.products?.length || 0);
      console.log('   GroupId:', supplier.groupId);
      console.log('   Créé le:', supplier.createdAt);
    } else {
      console.log('❌ FOURNISSEUR NON TROUVÉ avec cet ID !');
      console.log('\n📋 Recherche de fournisseurs similaires...\n');
      
      // Chercher tous les fournisseurs pour voir les IDs disponibles
      const allSuppliers = await Supplier.find({}).limit(5);
      console.log(`Les 5 premiers fournisseurs disponibles:`);
      for (const s of allSuppliers) {
        console.log(`   ${s._id} - ${s.name} (${s.email})`);
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

checkSupplierById();

