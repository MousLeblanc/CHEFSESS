/**
 * Script pour vérifier la structure des données dans MongoDB
 * Usage: node scripts/check-mongodb-structure.js
 */

import mongoose from 'mongoose';
import Stock from '../models/Stock.js';
import Order from '../models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const checkMongoDBStructure = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📦 VÉRIFICATION DES STOCKS');
    console.log('═══════════════════════════════════════════════════════════\n');

    const stocks = await Stock.find().limit(3);
    console.log(`Nombre de stocks trouvés: ${stocks.length}\n`);

    stocks.forEach((stock, stockIndex) => {
      console.log(`\n📦 Stock ${stockIndex + 1} (ID: ${stock._id})`);
      console.log(`   Utilisateur: ${stock.createdBy}`);
      console.log(`   Nombre d'articles: ${stock.items.length}`);
      
      if (stock.items.length > 0) {
        console.log(`\n   📋 Premier article (exemple):`);
        const firstItem = stock.items[0];
        console.log(`      name: ${JSON.stringify(firstItem.name)}`);
        console.log(`      type de 'name': ${typeof firstItem.name}`);
        console.log(`      quantity: ${firstItem.quantity}`);
        console.log(`      unit: ${firstItem.unit}`);
        console.log(`      category: ${firstItem.category}`);
        console.log(`\n      🔍 Structure complète:`);
        console.log(JSON.stringify(firstItem, null, 2));
      }
    });

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('📦 VÉRIFICATION DES COMMANDES LIVRÉES');
    console.log('═══════════════════════════════════════════════════════════\n');

    const deliveredOrders = await Order.find({ status: 'delivered' })
      .sort({ updatedAt: -1 })
      .limit(2)
      .populate('customer', 'name email')
      .populate('supplier', 'businessName name');

    console.log(`Nombre de commandes livrées: ${deliveredOrders.length}\n`);

    deliveredOrders.forEach((order, orderIndex) => {
      console.log(`\n📦 Commande ${orderIndex + 1}: ${order.orderNumber}`);
      console.log(`   Client: ${order.customer?.name || order.customer?.email || 'N/A'}`);
      console.log(`   Fournisseur: ${order.supplier?.businessName || order.supplier?.name || 'N/A'}`);
      console.log(`   Status: ${order.status}`);
      console.log(`   Date livraison: ${order.dates?.delivered || 'N/A'}`);
      console.log(`   Nombre d'articles: ${order.items.length}`);
      
      if (order.items.length > 0) {
        console.log(`\n   📋 Premier article (exemple):`);
        const firstItem = order.items[0];
        console.log(`      productName: ${JSON.stringify(firstItem.productName)}`);
        console.log(`      type de 'productName': ${typeof firstItem.productName}`);
        console.log(`      quantity: ${firstItem.quantity}`);
        console.log(`      unit: ${firstItem.unit}`);
        console.log(`\n      🔍 Structure complète:`);
        console.log(JSON.stringify(firstItem, null, 2));
      }
    });

    console.log('\n\n═══════════════════════════════════════════════════════════');
    console.log('✅ Vérification terminée !');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('💡 INTERPRÉTATION:');
    console.log('   • Si "name" ou "productName" affiche: "melon" → ✅ OK');
    console.log('   • Si "name" ou "productName" affiche: {...} ou [Object] → ❌ PROBLÈME');
    console.log('   • Le type devrait TOUJOURS être: "string"\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkMongoDBStructure();

