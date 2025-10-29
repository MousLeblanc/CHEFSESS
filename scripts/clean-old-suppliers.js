import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function cleanOldSuppliers() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));

    // 1️⃣ Trouver tous les fournisseurs
    const allSuppliers = await Supplier.find({}).sort({ createdAt: -1 });
    console.log(`📦 ${allSuppliers.length} fournisseurs trouvés au total\n`);

    // 2️⃣ Grouper par nom
    const suppliersByName = {};
    for (const supplier of allSuppliers) {
      if (!suppliersByName[supplier.name]) {
        suppliersByName[supplier.name] = [];
      }
      suppliersByName[supplier.name].push(supplier);
    }

    // 3️⃣ Pour chaque nom, garder le plus récent avec des produits
    let deleted = 0;
    let kept = 0;

    for (const [name, suppliers] of Object.entries(suppliersByName)) {
      console.log(`\n📋 ${name} - ${suppliers.length} occurrence(s)`);

      if (suppliers.length === 1) {
        console.log(`   ✅ Unique - Conservé (${suppliers[0].products?.length || 0} produits)`);
        kept++;
        continue;
      }

      // Trier par date (plus récent en premier) et par nombre de produits
      suppliers.sort((a, b) => {
        const productsA = a.products?.length || 0;
        const productsB = b.products?.length || 0;
        
        if (productsA !== productsB) {
          return productsB - productsA; // Plus de produits en premier
        }
        
        return new Date(b.createdAt) - new Date(a.createdAt); // Plus récent en premier
      });

      // Garder le premier (plus récent avec le plus de produits)
      const toKeep = suppliers[0];
      console.log(`   ✅ Conservé: ${toKeep._id} (${toKeep.products?.length || 0} produits, créé le ${toKeep.createdAt})`);
      kept++;

      // Supprimer les autres
      for (let i = 1; i < suppliers.length; i++) {
        const toDelete = suppliers[i];
        await Supplier.findByIdAndDelete(toDelete._id);
        console.log(`   ❌ Supprimé: ${toDelete._id} (${toDelete.products?.length || 0} produits, créé le ${toDelete.createdAt})`);
        deleted++;
      }
    }

    console.log(`\n\n🎉 Nettoyage terminé :`);
    console.log(`   ✅ ${kept} fournisseurs conservés`);
    console.log(`   ❌ ${deleted} doublons supprimés`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

cleanOldSuppliers();


