// scripts/test-supplier-api.js
// Script pour tester l'endpoint API getProductsBySupplier

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

// Simuler la fonction getProductsBySupplier
async function testGetProductsBySupplier(supplierId) {
  try {
    console.log(`\n🔍 Test pour supplierId: ${supplierId}`);
    
    let products = [];
    let userId = null;
    
    // Méthode 1: Essayer directement avec le supplierId (si c'est un User ID)
    products = await Product.find({ 
      supplier: supplierId,
      active: true 
    }).sort({ createdAt: -1 });
    
    console.log(`   Méthode 1 - Produits trouvés avec supplierId direct: ${products.length}`);
    
    // Méthode 2: Si aucun produit, chercher via Supplier model
    if (products.length === 0) {
      console.log('   Méthode 2 - Recherche via Supplier model...');
      const supplier = await Supplier.findById(supplierId);
      
      if (supplier) {
        console.log(`   ✅ Supplier trouvé: ${supplier.name}`);
        console.log(`   createdBy: ${supplier.createdBy || 'N/A'}`);
        console.log(`   Produits dans Supplier.products: ${supplier.products?.length || 0}`);
        
        // D'abord, vérifier si le Supplier a des produits dans son tableau products
        if (supplier.products && supplier.products.length > 0) {
          console.log(`   📦 Conversion de ${supplier.products.length} produit(s) depuis Supplier.products...`);
          
          // Convertir les produits du Supplier en format compatible avec Product
          products = supplier.products
            .filter(p => p.name && p.category && p.unit && p.price !== undefined)
            .map((p, index) => {
              // Générer un ID unique
              const uniqueId = `${supplier._id.toString()}-${index}-${p.name.replace(/\s+/g, '-').toLowerCase()}`;
              const hashId = Buffer.from(uniqueId).toString('base64').substring(0, 24);
              
              // Normaliser l'unité
              let normalizedUnit = p.unit;
              if (p.unit === 'L') {
                normalizedUnit = 'litre';
              }
              
              // Créer un objet simple
              const productObj = {
                _id: hashId.padEnd(24, '0'),
                name: p.name,
                category: p.category,
                unit: normalizedUnit,
                price: Number(p.price),
                stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0,
                stockAlert: Math.floor((p.stock || 0) * 0.2),
                active: true,
                supplier: supplier.createdBy ? supplier.createdBy.toString() : supplierId.toString(),
                description: `Produit de ${supplier.name}`,
                createdAt: supplier.createdAt || new Date(),
                deliveryTime: 3,
                minOrder: 1,
                promo: p.promotion?.active ? Number(p.promotion.discountPercent) : 0,
                superPromo: { active: false },
                toSave: { active: false },
                fromSupplierCatalog: true
              };
              
              return productObj;
            });
          
          console.log(`   ✅ ${products.length} produit(s) converti(s)`);
          
          if (products.length > 0) {
            console.log(`   📊 Exemple de produit converti:`, JSON.stringify(products[0], null, 2));
          }
        }
        
        // Si toujours pas de produits, chercher via createdBy dans Product
        if (products.length === 0 && supplier.createdBy) {
          userId = typeof supplier.createdBy === 'string' 
            ? new mongoose.Types.ObjectId(supplier.createdBy)
            : supplier.createdBy;
          
          products = await Product.find({ 
            supplier: userId,
            active: true 
          }).sort({ createdAt: -1 });
          console.log(`   ✅ Produits trouvés via createdBy: ${products.length}`);
        }
      } else {
        console.log(`   ⚠️  Aucun Supplier trouvé avec ID: ${supplierId}`);
      }
    }
    
    console.log(`\n📊 RÉSULTAT FINAL: ${products.length} produit(s) trouvé(s)`);
    
    return products;
    
  } catch (error) {
    console.error(`❌ Erreur:`, error);
    return [];
  }
}

async function testMultipleSuppliers() {
  try {
    await connectDB();
    
    console.log('\n' + '='.repeat(80));
    console.log('🧪 TEST DE L\'ENDPOINT API POUR PLUSIEURS FOURNISSEURS');
    console.log('='.repeat(80) + '\n');
    
    // Fournisseurs à tester (ceux qui apparaissent vides dans les images)
    const supplierNames = [
      'Fruits Exotiques Import',
      'Conserverie du Sud',
      'Maraîcher des Halles',
      'Bio Viandes Delhaize'
    ];
    
    for (const supplierName of supplierNames) {
      const supplier = await Supplier.findOne({ name: supplierName });
      if (supplier) {
        console.log(`\n${'='.repeat(80)}`);
        console.log(`📦 Test pour: ${supplierName}`);
        console.log(`   ID: ${supplier._id}`);
        const products = await testGetProductsBySupplier(supplier._id.toString());
        
        if (products.length === 0) {
          console.log(`   ⚠️  PROBLÈME: Aucun produit retourné pour ${supplierName}`);
        } else {
          console.log(`   ✅ ${products.length} produit(s) retourné(s)`);
        }
      } else {
        console.log(`\n⚠️  Fournisseur "${supplierName}" non trouvé`);
      }
    }
    
    await mongoose.connection.close();
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

testMultipleSuppliers();

