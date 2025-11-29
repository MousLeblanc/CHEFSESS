// scripts/debug-supplier-products.js
// Script pour déboguer les produits des fournisseurs et tester l'endpoint API

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import User from '../models/User.js';

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

async function debugSupplierProducts() {
  try {
    await connectDB();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 DÉBOGAGE DES PRODUITS DES FOURNISSEURS');
    console.log('='.repeat(80) + '\n');
    
    // Récupérer tous les fournisseurs
    const suppliers = await Supplier.find({ status: 'active' });
    console.log(`📊 ${suppliers.length} fournisseur(s) actif(s) trouvé(s)\n`);
    
    const suppliersWithIssues = [];
    
    for (const supplier of suppliers) {
      console.log(`\n📦 Fournisseur: ${supplier.name}`);
      console.log(`   ID: ${supplier._id}`);
      console.log(`   createdBy: ${supplier.createdBy || 'N/A'}`);
      
      // Vérifier Supplier.products
      const supplierProducts = supplier.products || [];
      console.log(`   Produits dans Supplier.products: ${supplierProducts.length}`);
      
      if (supplierProducts.length > 0) {
        console.log(`   Exemples de produits:`);
        supplierProducts.slice(0, 3).forEach((p, i) => {
          console.log(`     ${i + 1}. ${p.name} - ${p.category} - ${p.price}€/${p.unit} - Stock: ${p.stock || 0}`);
        });
      }
      
      // Vérifier Product model (via createdBy)
      let productsInProductModel = [];
      if (supplier.createdBy) {
        productsInProductModel = await Product.find({
          supplier: supplier.createdBy,
          active: true
        });
        console.log(`   Produits dans Product model (via createdBy): ${productsInProductModel.length}`);
      }
      
      // Vérifier Product model (via User.supplierId)
      let productsViaUser = [];
      if (supplier._id) {
        const user = await User.findOne({ supplierId: supplier._id });
        if (user) {
          productsViaUser = await Product.find({
            supplier: user._id,
            active: true
          });
          console.log(`   Produits dans Product model (via User.supplierId): ${productsViaUser.length}`);
        }
      }
      
      const totalProducts = supplierProducts.length + productsInProductModel.length + productsViaUser.length;
      console.log(`   📊 TOTAL PRODUITS: ${totalProducts}`);
      
      if (totalProducts === 0) {
        suppliersWithIssues.push({
          name: supplier.name,
          id: supplier._id.toString(),
          supplierProducts: supplierProducts.length,
          productModelProducts: productsInProductModel.length + productsViaUser.length,
          createdBy: supplier.createdBy?.toString() || null
        });
        console.log(`   ⚠️  AUCUN PRODUIT TROUVÉ`);
      } else {
        console.log(`   ✅ Produits disponibles`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DES FOURNISSEURS SANS PRODUITS');
    console.log('='.repeat(80));
    
    if (suppliersWithIssues.length === 0) {
      console.log('✅ Tous les fournisseurs ont des produits !');
    } else {
      console.log(`⚠️  ${suppliersWithIssues.length} fournisseur(s) sans produits:\n`);
      suppliersWithIssues.forEach(s => {
        console.log(`   - ${s.name} (ID: ${s.id})`);
        console.log(`     Supplier.products: ${s.supplierProducts}`);
        console.log(`     Product model: ${s.productModelProducts}`);
        console.log(`     createdBy: ${s.createdBy || 'N/A'}\n`);
      });
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

debugSupplierProducts();

