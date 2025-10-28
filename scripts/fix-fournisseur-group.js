import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function fixFournisseurGroup() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));

    const correctGroupId = '68f966df9ffbca436a234a28'; // Vulpia Group
    const oldGroupId = '68ef5f724c0f22591641b1be'; // Vulpia (ancien)

    // 1️⃣ Déplacer le fournisseur "fournisseur" vers le bon groupe
    const fournisseur = await Supplier.findOne({ email: 'fournisseur@gmail.com' });
    
    if (fournisseur) {
      console.log('✅ Fournisseur trouvé:', fournisseur.name);
      console.log('   Groupe actuel:', fournisseur.groupId);
      
      if (fournisseur.groupId.toString() === oldGroupId) {
        fournisseur.groupId = correctGroupId;
        await fournisseur.save();
        console.log('   ✅ Déplacé vers Vulpia Group\n');
      } else {
        console.log('   ⚠️  Déjà dans le bon groupe\n');
      }
    }

    // 2️⃣ Mettre à jour l'utilisateur fournisseur aussi
    const userFournisseur = await User.findOne({ email: 'fournisseur@gmail.com' });
    
    if (userFournisseur) {
      console.log('✅ User fournisseur trouvé');
      console.log('   Groupe actuel:', userFournisseur.groupId);
      
      if (userFournisseur.groupId && userFournisseur.groupId.toString() === oldGroupId) {
        userFournisseur.groupId = correctGroupId;
        await userFournisseur.save();
        console.log('   ✅ User déplacé vers Vulpia Group\n');
      } else {
        console.log('   ⚠️  User déjà dans le bon groupe\n');
      }
    }

    // 3️⃣ Lister tous les fournisseurs de chaque groupe
    console.log('📦 Fournisseurs par groupe APRÈS correction:\n');
    
    const suppliersOldGroup = await Supplier.countDocuments({ groupId: oldGroupId });
    const suppliersNewGroup = await Supplier.countDocuments({ groupId: correctGroupId });
    
    console.log(`   Vulpia (ancien): ${suppliersOldGroup} fournisseurs`);
    console.log(`   Vulpia Group: ${suppliersNewGroup} fournisseurs`);

    console.log('\n🎉 Correction terminée !');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixFournisseurGroup();

