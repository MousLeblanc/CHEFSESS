import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function deleteAllRecentSuppliers() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));

    // 1️⃣ Lister tous les fournisseurs avant suppression
    const allSuppliers = await Supplier.find({}).sort({ createdAt: 1 });
    
    console.log(`📦 ${allSuppliers.length} fournisseurs trouvés au total\n`);
    console.log('📋 Liste des fournisseurs AVANT suppression :\n');
    
    for (const supplier of allSuppliers) {
      console.log(`${supplier._id} - ${supplier.name} (${supplier.email})`);
      console.log(`   Créé le: ${supplier.createdAt || 'N/A'}`);
      console.log(`   Produits: ${supplier.products?.length || 0}`);
      console.log('');
    }

    // 2️⃣ Supprimer tous les fournisseurs créés aujourd'hui (28 octobre 2025)
    const today = new Date('2025-10-28');
    const tomorrow = new Date('2025-10-29');
    
    console.log('\n🗑️  Suppression des fournisseurs créés le 28 octobre 2025...\n');
    
    const result = await Supplier.deleteMany({
      createdAt: {
        $gte: today,
        $lt: tomorrow
      }
    });

    console.log(`✅ ${result.deletedCount} fournisseurs supprimés\n`);

    // 3️⃣ Lister les fournisseurs restants
    const remainingSuppliers = await Supplier.find({});
    
    console.log(`📦 ${remainingSuppliers.length} fournisseurs restants :\n`);
    
    if (remainingSuppliers.length > 0) {
      for (const supplier of remainingSuppliers) {
        console.log(`${supplier._id} - ${supplier.name} (${supplier.email})`);
        console.log(`   Créé le: ${supplier.createdAt || 'N/A'}`);
        console.log(`   Produits: ${supplier.products?.length || 0}`);
        console.log('');
      }
    } else {
      console.log('⚠️  Aucun fournisseur restant');
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

deleteAllRecentSuppliers();

