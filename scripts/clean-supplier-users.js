// scripts/clean-supplier-users.js
// Supprime tous les utilisateurs fournisseurs existants

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import User from '../models/User.js';

async function cleanSupplierUsers() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    console.log('🗑️  Suppression des utilisateurs fournisseurs existants...\n');

    // Supprimer tous les utilisateurs avec role 'fournisseur' ou ayant le role SUPPLIER
    const result = await User.deleteMany({ 
      $or: [
        { role: 'fournisseur' },
        { roles: 'SUPPLIER' }
      ]
    });

    console.log(`✅ ${result.deletedCount} utilisateurs fournisseurs supprimés`);

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

cleanSupplierUsers();

