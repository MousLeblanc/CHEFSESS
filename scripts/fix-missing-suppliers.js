// Script pour corriger les fournisseurs avec supplierId manquants
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Group from '../models/Group.js';

async function fixMissingSuppliers() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le groupe Vulpia
    const group = await Group.findOne({ name: 'Vulpia Group' });
    if (!group) {
      console.log('❌ Groupe Vulpia non trouvé !');
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Groupe trouvé: ${group.name} (${group._id})\n`);

    // Récupérer tous les utilisateurs fournisseurs
    const supplierUsers = await User.find({ role: 'fournisseur' });
    console.log(`📊 ${supplierUsers.length} utilisateur(s) fournisseur(s) trouvé(s)\n`);

    const results = {
      withValidSupplier: [],
      withMissingSupplier: [],
      withoutSupplierId: [],
      created: [],
      errors: []
    };

    for (const user of supplierUsers) {
      try {
        // Cas 1 : Pas de supplierId
        if (!user.supplierId) {
          console.log(`⚠️  ${user.email.padEnd(45)} | Pas de supplierId`);
          results.withoutSupplierId.push({
            email: user.email,
            businessName: user.businessName
          });
          continue;
        }

        // Cas 2 : Vérifier si le Supplier existe
        const supplier = await Supplier.findById(user.supplierId);
        
        if (supplier) {
          console.log(`✅ ${user.email.padEnd(45)} | Supplier OK: "${supplier.name}"`);
          results.withValidSupplier.push({
            email: user.email,
            supplierName: supplier.name
          });
        } else {
          console.log(`❌ ${user.email.padEnd(45)} | Supplier manquant (ID: ${user.supplierId})`);
          
          // Créer un nouveau Supplier basé sur le businessName
          const newSupplier = await Supplier.create({
            name: user.businessName || user.name,
            contact: user.name,
            email: user.email,
            phone: user.phone || '+33 1 00 00 00 00',
            address: user.address || {
              street: 'Adresse à compléter',
              city: 'Ville',
              postalCode: '00000',
              country: 'France'
            },
            categories: ['autres'],
            type: 'grossiste',
            status: 'active',
            groupId: group._id
          });

          // Mettre à jour le supplierId de l'utilisateur
          user.supplierId = newSupplier._id;
          await user.save();

          console.log(`   ✅ Nouveau Supplier créé: "${newSupplier.name}" (${newSupplier._id})`);
          
          results.created.push({
            email: user.email,
            oldSupplierId: user.supplierId,
            newSupplierId: newSupplier._id,
            supplierName: newSupplier.name
          });
        }

      } catch (error) {
        console.error(`❌ ${user.email.padEnd(45)} | Erreur: ${error.message}`);
        results.errors.push({
          email: user.email,
          error: error.message
        });
      }
    }

    console.log('\n' + '='.repeat(120));
    console.log('\n📊 RÉSUMÉ :');
    console.log(`   ✅ Avec Supplier valide : ${results.withValidSupplier.length}`);
    console.log(`   🆕 Suppliers créés : ${results.created.length}`);
    console.log(`   ⚠️  Sans supplierId : ${results.withoutSupplierId.length}`);
    console.log(`   ❌ Erreurs : ${results.errors.length}`);
    console.log(`   📦 Total : ${supplierUsers.length}`);

    if (results.created.length > 0) {
      console.log('\n✅ Nouveaux Suppliers créés :');
      results.created.forEach(item => {
        console.log(`   - ${item.email} → "${item.supplierName}"`);
      });
    }

    if (results.withoutSupplierId.length > 0) {
      console.log('\n⚠️  Utilisateurs sans supplierId (nécessitent une action manuelle) :');
      results.withoutSupplierId.forEach(item => {
        console.log(`   - ${item.email} (businessName: "${item.businessName}")`);
      });
    }

    console.log('\n✅ Script terminé avec succès !');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur fatale:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

fixMissingSuppliers();

