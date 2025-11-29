// scripts/check-supplier-id-mismatch.js
// Script pour vérifier si les IDs des fournisseurs correspondent

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/chefses');
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

async function checkSupplierIds() {
  try {
    await connectDB();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 VÉRIFICATION DES IDs DES FOURNISSEURS');
    console.log('='.repeat(80) + '\n');
    
    // ID problématique vu dans les logs
    const problematicId = '6900a4ecb1d8f44ec504c499';
    console.log(`🔍 Recherche du fournisseur avec ID: ${problematicId}`);
    
    const supplier = await Supplier.findById(problematicId);
    if (supplier) {
      console.log(`✅ Fournisseur trouvé: ${supplier.name}`);
      console.log(`   Produits: ${supplier.products?.length || 0}`);
    } else {
      console.log(`❌ Aucun fournisseur trouvé avec cet ID`);
    }
    
    // Vérifier tous les fournisseurs actifs
    const allSuppliers = await Supplier.find({ status: 'active' });
    console.log(`\n📊 ${allSuppliers.length} fournisseur(s) actif(s) dans la base:`);
    
    allSuppliers.forEach((s, index) => {
      console.log(`\n${index + 1}. ${s.name}`);
      console.log(`   ID: ${s._id}`);
      console.log(`   Produits: ${s.products?.length || 0}`);
      if (s._id.toString() === problematicId) {
        console.log(`   ⚠️  C'EST L'ID PROBLÉMATIQUE !`);
      }
    });
    
    // Vérifier si l'ID problématique correspond à un User
    const User = (await import('../models/User.js')).default;
    const user = await User.findById(problematicId);
    if (user) {
      console.log(`\n✅ Un User existe avec cet ID: ${user.email}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   supplierId: ${user.supplierId || 'N/A'}`);
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkSupplierIds();

