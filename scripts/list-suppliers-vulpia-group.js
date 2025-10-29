import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function listSuppliersVulpiaGroup() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));

    const vulpiaGroupId = '68f966df9ffbca436a234a28';

    console.log(`🔍 Liste de TOUS les fournisseurs dans Vulpia Group (${vulpiaGroupId}):\n`);

    const suppliers = await Supplier.find({ groupId: vulpiaGroupId }).sort({ createdAt: -1 });

    console.log(`📦 ${suppliers.length} fournisseurs trouvés:\n`);

    for (const supplier of suppliers) {
      console.log(`${supplier._id}`);
      console.log(`   Nom: ${supplier.name}`);
      console.log(`   Email: ${supplier.email}`);
      console.log(`   Produits: ${supplier.products?.length || 0}`);
      console.log(`   Créé le: ${supplier.createdAt || 'N/A'}`);
      console.log('');
    }

    // Vérifier si l'ID problématique existe
    console.log('\n🔍 Recherche de l\'ID problématique: 6900a4ecb1d8f44ec504c49f\n');
    const problematicSupplier = await Supplier.findById('6900a4ecb1d8f44ec504c49f');
    
    if (problematicSupplier) {
      console.log('⚠️  CET ID EXISTE ENCORE !');
      console.log('   Nom:', problematicSupplier.name);
      console.log('   GroupId:', problematicSupplier.groupId);
      console.log('   Produits:', problematicSupplier.products?.length || 0);
    } else {
      console.log('✅ Cet ID n\'existe plus dans MongoDB');
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

listSuppliersVulpiaGroup();


