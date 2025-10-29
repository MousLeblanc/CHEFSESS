// Script pour corriger le businessName des utilisateurs fournisseurs
// Le businessName doit contenir le nom du fournisseur, pas le nom d'un site

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Site from '../models/Site.js';

async function fixSupplierBusinessName() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les utilisateurs fournisseurs
    const supplierUsers = await User.find({ role: 'fournisseur' });
    console.log(`📊 ${supplierUsers.length} utilisateur(s) fournisseur(s) trouvé(s)\n`);

    if (supplierUsers.length === 0) {
      console.log('Aucun fournisseur à traiter.');
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log('🔧 Correction des businessName incorrects...\n');
    console.log('='.repeat(120));

    let fixed = 0;
    let skipped = 0;
    let errors = 0;

    for (const user of supplierUsers) {
      try {
        // Vérifier si l'utilisateur a un supplierId
        if (!user.supplierId) {
          console.log(`⏭️  ${user.email.padEnd(40)} | Pas de supplierId - conservé: "${user.businessName}"`);
          skipped++;
          continue;
        }

        // Récupérer le fournisseur depuis la collection Supplier
        const supplier = await Supplier.findById(user.supplierId);
        
        if (!supplier) {
          console.log(`⚠️  ${user.email.padEnd(40)} | Supplier non trouvé (ID: ${user.supplierId})`);
          errors++;
          continue;
        }

        // Vérifier si le businessName est déjà correct
        if (user.businessName === supplier.name) {
          console.log(`✅ ${user.email.padEnd(40)} | Déjà correct: "${supplier.name}"`);
          skipped++;
          continue;
        }

        // Vérifier si le businessName actuel correspond à un nom de site
        const site = await Site.findOne({ siteName: user.businessName });
        const isSiteName = site ? ' (était un nom de site)' : '';

        // Mettre à jour le businessName
        const oldName = user.businessName;
        user.businessName = supplier.name;
        await user.save();

        console.log(`🔧 ${user.email.padEnd(40)} | "${oldName}" → "${supplier.name}"${isSiteName}`);
        fixed++;

      } catch (error) {
        console.error(`❌ ${user.email.padEnd(40)} | Erreur: ${error.message}`);
        errors++;
      }
    }

    console.log('='.repeat(120));
    console.log('\n📊 RÉSUMÉ :');
    console.log(`   🔧 Corrigés : ${fixed}`);
    console.log(`   ✅ Déjà corrects : ${skipped}`);
    console.log(`   ❌ Erreurs : ${errors}`);
    console.log(`   📦 Total : ${supplierUsers.length}`);

    console.log('\n✅ Script terminé avec succès !');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixSupplierBusinessName();

