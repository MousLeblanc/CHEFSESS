import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';

dotenv.config();

const removeSuppliersFromGroups = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver tous les fournisseurs qui ont un groupId
    const suppliersWithGroup = await User.find({
      role: 'fournisseur',
      groupId: { $exists: true, $ne: null }
    });

    console.log(`📊 ${suppliersWithGroup.length} fournisseur(s) trouvé(s) avec un groupId\n`);

    if (suppliersWithGroup.length === 0) {
      console.log('✅ Aucun fournisseur à corriger !');
      process.exit(0);
    }

    // Afficher les détails
    console.log('📋 Détails des fournisseurs à corriger:\n');
    for (const supplier of suppliersWithGroup) {
      console.log(`  - ${supplier.businessName || supplier.name} (${supplier.email})`);
      console.log(`    groupId actuel: ${supplier.groupId}`);
      console.log(`    supplierId: ${supplier.supplierId || 'N/A'}`);
      console.log('');
    }

    // Demander confirmation
    console.log('\n⚠️  ACTION: Retirer le groupId de ces fournisseurs\n');
    console.log('Les fournisseurs sont des entités EXTERNES et ne doivent pas');
    console.log('faire partie d\'un groupe de sites.\n');

    // Effectuer la correction
    const result = await User.updateMany(
      { 
        role: 'fournisseur',
        groupId: { $exists: true, $ne: null }
      },
      { 
        $unset: { groupId: "" } // Retirer le champ groupId
      }
    );

    console.log(`\n✅ ${result.modifiedCount} fournisseur(s) corrigé(s)`);
    console.log('');

    // Vérifier le résultat
    const stillHaveGroup = await User.countDocuments({
      role: 'fournisseur',
      groupId: { $exists: true, $ne: null }
    });

    if (stillHaveGroup === 0) {
      console.log('✅ Tous les fournisseurs ont été retirés des groupes !');
    } else {
      console.log(`⚠️  ${stillHaveGroup} fournisseur(s) ont encore un groupId`);
    }

    // Vérifier les supplierId manquants
    const withoutSupplierId = await User.find({
      role: 'fournisseur',
      $or: [
        { supplierId: { $exists: false } },
        { supplierId: null }
      ]
    });

    if (withoutSupplierId.length > 0) {
      console.log(`\n⚠️  ${withoutSupplierId.length} fournisseur(s) sans supplierId:`);
      withoutSupplierId.forEach(s => {
        console.log(`  - ${s.businessName || s.name} (${s.email})`);
      });
      console.log('\nUtilisez fix-missing-suppliers.js pour corriger cela.');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

removeSuppliersFromGroups();

