import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function listAllSuppliers() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));

    console.log(`🔍 Liste de TOUS les fournisseurs (sans filtre):\n`);

    const suppliers = await Supplier.find({}).sort({ createdAt: -1 });

    console.log(`📦 ${suppliers.length} fournisseurs trouvés:\n`);

    for (const supplier of suppliers) {
      console.log(`${supplier._id}`);
      console.log(`   Nom: ${supplier.name}`);
      console.log(`   Email: ${supplier.email}`);
      console.log(`   GroupId: ${supplier.groupId} (type: ${typeof supplier.groupId})`);
      console.log(`   Produits: ${supplier.products?.length || 0}`);
      console.log('');
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

listAllSuppliers();


