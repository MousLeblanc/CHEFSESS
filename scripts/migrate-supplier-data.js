#!/usr/bin/env node

/**
 * Script de migration des données fournisseur
 * 
 * Ce script vous aide à :
 * 1. Analyser les données existantes dans MongoDB
 * 2. Migrer les produits des fournisseurs si nécessaire
 * 3. Nettoyer les données obsolètes
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Stock from '../models/Stock.js';
import Supplier from '../models/Supplier.js';
import User from '../models/User.js';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connexion à MongoDB réussie');
  } catch (error) {
    console.error('❌ Erreur de connexion à MongoDB:', error);
    process.exit(1);
  }
};

const analyzeData = async () => {
  console.log('\n📊 ANALYSE DES DONNÉES EXISTANTES\n');
  
  try {
    // Compter les produits
    const productCount = await Product.countDocuments();
    console.log(`📦 Produits (catalogue fournisseurs): ${productCount}`);
    
    // Compter les stocks
    const stockCount = await Stock.countDocuments();
    console.log(`📋 Articles de stock (établissements): ${stockCount}`);
    
    // Compter les fournisseurs
    const supplierCount = await Supplier.countDocuments();
    console.log(`🚚 Fournisseurs: ${supplierCount}`);
    
    // Compter les utilisateurs par rôle
    const userCounts = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } }
    ]);
    console.log('\n👥 Utilisateurs par rôle:');
    userCounts.forEach(user => {
      console.log(`   ${user._id}: ${user.count}`);
    });
    
    // Afficher quelques exemples de produits
    if (productCount > 0) {
      console.log('\n📦 Exemples de produits:');
      const sampleProducts = await Product.find().limit(3).populate('supplier', 'name businessName');
      sampleProducts.forEach(product => {
        console.log(`   - ${product.name} (${product.category}) - ${product.price}€/${product.unit}`);
        console.log(`     Fournisseur: ${product.supplier?.businessName || product.supplier?.name || 'N/A'}`);
      });
    }
    
    // Afficher quelques exemples de stock
    if (stockCount > 0) {
      console.log('\n📋 Exemples d\'articles de stock:');
      const sampleStock = await Stock.find().limit(3).populate('createdBy', 'name businessName');
      sampleStock.forEach(item => {
        console.log(`   - ${item.name} (${item.category}) - ${item.quantity} ${item.unit}`);
        console.log(`     Établissement: ${item.createdBy?.businessName || item.createdBy?.name || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'analyse:', error);
  }
};

const migrateProductsToStock = async () => {
  console.log('\n🔄 MIGRATION DES PRODUITS VERS LE STOCK\n');
  
  try {
    const products = await Product.find().populate('supplier');
    
    if (products.length === 0) {
      console.log('ℹ️  Aucun produit à migrer');
      return;
    }
    
    console.log(`📦 Migration de ${products.length} produits...`);
    
    for (const product of products) {
      // Créer un article de stock basé sur le produit
      const stockItem = new Stock({
        name: product.name,
        category: mapCategory(product.category),
        quantity: 0, // Quantité par défaut
        unit: mapUnit(product.unit),
        expirationDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours par défaut
        price: product.price,
        supplier: product.supplier?.businessName || product.supplier?.name || 'Fournisseur inconnu',
        location: 'Stock principal',
        notes: `Migré depuis le catalogue fournisseur. ${product.description || ''}`,
        status: 'available',
        createdBy: product.supplier?._id,
        establishmentType: 'autre' // Type par défaut
      });
      
      await stockItem.save();
      console.log(`   ✅ Migré: ${product.name}`);
    }
    
    console.log(`\n✅ Migration terminée: ${products.length} produits migrés vers le stock`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  }
};

const mapCategory = (productCategory) => {
  const categoryMap = {
    'fruits-legumes': 'legumes',
    'viandes': 'viandes',
    'poissons': 'poissons',
    'epicerie': 'cereales',
    'boissons': 'boissons',
    'produits-laitiers': 'produits-laitiers',
    'boulangerie': 'cereales',
    'autres': 'autres'
  };
  return categoryMap[productCategory] || 'autres';
};

const mapUnit = (productUnit) => {
  const unitMap = {
    'kg': 'kg',
    'g': 'g',
    'litre': 'L',
    'ml': 'ml',
    'pièce': 'pièces',
    'paquet': 'sachets',
    'boîte': 'boîtes',
    'sachet': 'sachets',
    'bouteille': 'bouteilles',
    'portion': 'pièces',
    'carton': 'boîtes'
  };
  return unitMap[productUnit] || 'pièces';
};

const cleanupOldData = async () => {
  console.log('\n🧹 NETTOYAGE DES DONNÉES OBSOLÈTES\n');
  
  try {
    // Supprimer les produits inactifs
    const inactiveProducts = await Product.countDocuments({ active: false });
    if (inactiveProducts > 0) {
      await Product.deleteMany({ active: false });
      console.log(`🗑️  Supprimé ${inactiveProducts} produits inactifs`);
    }
    
    // Supprimer les stocks expirés
    const expiredStock = await Stock.countDocuments({ 
      expirationDate: { $lt: new Date() },
      status: 'expired'
    });
    if (expiredStock > 0) {
      await Stock.deleteMany({ 
        expirationDate: { $lt: new Date() },
        status: 'expired'
      });
      console.log(`🗑️  Supprimé ${expiredStock} articles de stock expirés`);
    }
    
    console.log('✅ Nettoyage terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
  }
};

const main = async () => {
  console.log('🚀 SCRIPT DE MIGRATION DES DONNÉES FOURNISSEUR\n');
  
  await connectDB();
  
  // Analyser les données existantes
  await analyzeData();
  
  // Demander confirmation pour la migration
  console.log('\n❓ Que souhaitez-vous faire ?');
  console.log('1. Analyser seulement (déjà fait)');
  console.log('2. Migrer les produits vers le stock');
  console.log('3. Nettoyer les données obsolètes');
  console.log('4. Tout faire (migration + nettoyage)');
  console.log('5. Quitter');
  
  // Pour l'instant, on fait juste l'analyse
  // Dans un vrai script interactif, vous pourriez utiliser readline
  
  console.log('\n✅ Analyse terminée. Consultez les résultats ci-dessus.');
  console.log('\n💡 RECOMMANDATIONS:');
  console.log('   - Les produits des fournisseurs restent dans le système Product');
  console.log('   - Les établissements utilisent le système Stock');
  console.log('   - Les deux systèmes coexistent et servent des objectifs différents');
  console.log('   - Pas de migration nécessaire si vous voulez garder les deux systèmes');
  
  await mongoose.disconnect();
  console.log('\n👋 Déconnexion de MongoDB');
};

// Gestion des erreurs non capturées
process.on('unhandledRejection', (err) => {
  console.error('❌ Erreur non gérée:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('❌ Exception non capturée:', err);
  process.exit(1);
});

// Exécuter le script
main().catch(console.error);
