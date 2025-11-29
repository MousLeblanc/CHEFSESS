// scripts/check-and-add-supplier-stock.js
// Script pour vérifier que tous les fournisseurs ont du stock et l'ajouter si nécessaire

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';

dotenv.config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/chefses', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Valeurs de stock par défaut selon le type d'unité
const getDefaultStock = (unit) => {
  const defaults = {
    'kg': 100,        // 100 kg par défaut
    'L': 50,          // 50 litres par défaut
    'pièce': 200,     // 200 pièces par défaut
    'boîte': 150,     // 150 boîtes par défaut
    'unité': 100      // 100 unités par défaut
  };
  return defaults[unit] || 100;
};

// Fonction principale
async function checkAndAddSupplierStock() {
  try {
    await connectDB();
    
    console.log('\n' + '='.repeat(80));
    console.log('🔍 VÉRIFICATION DU STOCK DES FOURNISSEURS');
    console.log('='.repeat(80) + '\n');
    
    // Récupérer tous les fournisseurs actifs
    const suppliers = await Supplier.find({ status: 'active' });
    console.log(`📊 ${suppliers.length} fournisseur(s) actif(s) trouvé(s)\n`);
    
    if (suppliers.length === 0) {
      console.log('⚠️  Aucun fournisseur actif trouvé');
      await mongoose.connection.close();
      return;
    }
    
    let totalSuppliersChecked = 0;
    let totalSuppliersUpdated = 0;
    let totalProductsChecked = 0;
    let totalProductsUpdated = 0;
    
    for (const supplier of suppliers) {
      totalSuppliersChecked++;
      console.log(`\n📦 Fournisseur: ${supplier.name}`);
      console.log(`   Produits: ${supplier.products.length}`);
      
      if (supplier.products.length === 0) {
        console.log(`   ⚠️  Aucun produit enregistré pour ce fournisseur`);
        continue;
      }
      
      let supplierNeedsUpdate = false;
      let productsUpdated = 0;
      
      // Vérifier chaque produit
      for (let i = 0; i < supplier.products.length; i++) {
        const product = supplier.products[i];
        totalProductsChecked++;
        
        // Vérifier si le stock est manquant ou à 0
        if (product.stock === undefined || product.stock === null || product.stock === 0) {
          const defaultStock = getDefaultStock(product.unit);
          supplier.products[i].stock = defaultStock;
          supplierNeedsUpdate = true;
          productsUpdated++;
          
          console.log(`   ✅ Stock ajouté: ${product.name} → ${defaultStock} ${product.unit}`);
        }
      }
      
      if (supplierNeedsUpdate) {
        await supplier.save();
        totalSuppliersUpdated++;
        totalProductsUpdated += productsUpdated;
        console.log(`   💾 ${productsUpdated} produit(s) mis à jour pour ${supplier.name}`);
      } else {
        console.log(`   ✅ Tous les produits ont déjà du stock`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(80));
    console.log(`   Fournisseurs vérifiés: ${totalSuppliersChecked}`);
    console.log(`   Fournisseurs mis à jour: ${totalSuppliersUpdated}`);
    console.log(`   Produits vérifiés: ${totalProductsChecked}`);
    console.log(`   Produits mis à jour: ${totalProductsUpdated}`);
    console.log('='.repeat(80) + '\n');
    
    if (totalProductsUpdated > 0) {
      console.log('✅ Stock ajouté avec succès !\n');
    } else {
      console.log('✅ Tous les fournisseurs ont déjà du stock enregistré !\n');
    }
    
    await mongoose.connection.close();
    console.log('✅ Connexion MongoDB fermée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Exécuter le script
checkAndAddSupplierStock();

