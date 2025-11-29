// scripts/check-empty-suppliers.js
// Script pour identifier les fournisseurs avec des catalogues vides

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

async function checkEmptySuppliers() {
  try {
    await connectDB();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 VÉRIFICATION DES CATALOGUES VIDES');
    console.log('='.repeat(80) + '\n');
    
    // Récupérer TOUS les fournisseurs (actifs et inactifs)
    const allSuppliers = await Supplier.find({});
    console.log(`📊 ${allSuppliers.length} fournisseur(s) au total\n`);
    
    // Identifier les fournisseurs sans produits
    const emptySuppliers = allSuppliers.filter(s => 
      !s.products || s.products.length === 0
    );
    
    // Identifier les fournisseurs avec produits mais sans stock
    const suppliersWithoutStock = allSuppliers.filter(s => 
      s.products && s.products.length > 0 && 
      s.products.every(p => !p.stock || p.stock === 0)
    );
    
    console.log('📦 FOURNISSEURS SANS PRODUITS:');
    if (emptySuppliers.length === 0) {
      console.log('   ✅ Aucun');
    } else {
      emptySuppliers.forEach(s => {
        console.log(`   ❌ ${s.name} (ID: ${s._id}, Status: ${s.status}, Type: ${s.type || 'non défini'})`);
      });
    }
    
    console.log('\n📦 FOURNISSEURS AVEC PRODUITS MAIS SANS STOCK:');
    if (suppliersWithoutStock.length === 0) {
      console.log('   ✅ Aucun');
    } else {
      suppliersWithoutStock.forEach(s => {
        console.log(`   ⚠️  ${s.name} (${s.products.length} produits, tous sans stock)`);
      });
    }
    
    console.log('\n📊 STATISTIQUES:');
    console.log(`   Total fournisseurs: ${allSuppliers.length}`);
    console.log(`   Fournisseurs actifs: ${allSuppliers.filter(s => s.status === 'active').length}`);
    console.log(`   Fournisseurs inactifs: ${allSuppliers.filter(s => s.status !== 'active').length}`);
    console.log(`   Fournisseurs sans produits: ${emptySuppliers.length}`);
    console.log(`   Fournisseurs avec produits sans stock: ${suppliersWithoutStock.length}`);
    
    const totalWithIssues = emptySuppliers.length + suppliersWithoutStock.length;
    if (totalWithIssues > 0) {
      console.log(`\n⚠️  ${totalWithIssues} fournisseur(s) nécessitent une attention`);
    } else {
      console.log(`\n✅ Tous les fournisseurs ont des produits avec du stock`);
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

checkEmptySuppliers();

