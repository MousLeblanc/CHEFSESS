/**
 * Script pour tester le processus complet : Commande → Stock
 * Usage: node scripts/test-order-to-stock.js
 */

import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Stock from '../models/Stock.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testOrderToStock = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log('═══════════════════════════════════════════════════════════');
    console.log('📦 TEST COMPLET : COMMANDE → STOCK');
    console.log('═══════════════════════════════════════════════════════════\n');

    // 1. Trouver une commande "delivered"
    console.log('🔍 Recherche d\'une commande livrée...');
    const deliveredOrder = await Order.findOne({ status: 'delivered' })
      .sort({ updatedAt: -1 })
      .populate('customer', 'name email establishmentType')
      .populate('supplier', 'businessName name');

    if (!deliveredOrder) {
      console.log('❌ Aucune commande livrée trouvée.');
      console.log('💡 Passez une commande et confirmez-la pour tester.\n');
      process.exit(0);
    }

    console.log(`✅ Commande trouvée: ${deliveredOrder.orderNumber}`);
    console.log(`   Client: ${deliveredOrder.customer?.name || deliveredOrder.customer?.email}`);
    console.log(`   Client ID: ${deliveredOrder.customer._id}`);
    console.log(`   Fournisseur: ${deliveredOrder.supplier?.businessName || deliveredOrder.supplier?.name}`);
    console.log(`   Status: ${deliveredOrder.status}`);
    console.log(`   Date livraison: ${deliveredOrder.dates?.delivered || 'N/A'}`);
    console.log(`   Nombre d'articles: ${deliveredOrder.items.length}\n`);

    console.log('📋 Articles de la commande:');
    deliveredOrder.items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.productName} - ${item.quantity} ${item.unit}`);
    });

    // 2. Vérifier si le stock existe pour ce client
    console.log(`\n🔍 Vérification du stock pour le client ${deliveredOrder.customer._id}...`);
    const stock = await Stock.findOne({ createdBy: deliveredOrder.customer._id });

    if (!stock) {
      console.log('❌ Aucun stock trouvé pour ce client !');
      console.log('💡 Le stock devrait être créé automatiquement lors de la confirmation.\n');
    } else {
      console.log(`✅ Stock trouvé: ${stock._id}`);
      console.log(`   Nombre d'articles dans le stock: ${stock.items.length}\n`);

      if (stock.items.length === 0) {
        console.log('⚠️ Le stock est VIDE !');
      } else {
        console.log('📦 Articles dans le stock:');
        stock.items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name} - ${item.quantity} ${item.unit} (${item.category})`);
        });

        // 3. Vérifier si les articles de la commande sont dans le stock
        console.log('\n🔍 Vérification de la correspondance Commande → Stock:\n');
        
        let allFound = true;
        deliveredOrder.items.forEach((orderItem) => {
          const foundInStock = stock.items.find(
            stockItem => stockItem.name.toLowerCase() === orderItem.productName.toLowerCase()
          );

          if (foundInStock) {
            console.log(`   ✅ ${orderItem.productName} → Trouvé dans le stock (${foundInStock.quantity} ${foundInStock.unit})`);
          } else {
            console.log(`   ❌ ${orderItem.productName} → NON TROUVÉ dans le stock !`);
            allFound = false;
          }
        });

        if (allFound) {
          console.log('\n🎉 SUCCÈS : Tous les articles de la commande sont dans le stock !');
        } else {
          console.log('\n⚠️ PROBLÈME : Certains articles manquent dans le stock.');
          console.log('   Vérifiez les logs du serveur lors de la confirmation de la commande.');
        }
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('✅ Test terminé !');
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('💡 PROCHAINES ÉTAPES:');
    console.log('   1. Si le stock est vide ou incomplet:');
    console.log('      → Vérifiez les logs du serveur (terminal où npm start tourne)');
    console.log('      → Cherchez: "📦 AJOUT AUTOMATIQUE AU STOCK"');
    console.log('      → Si vous ne voyez pas ces logs, le backend ne s\'exécute pas');
    console.log('   2. Passez une NOUVELLE commande et confirmez-la');
    console.log('   3. Surveillez les logs du serveur en temps réel');
    console.log('   4. Relancez ce script: npm run test-order-stock\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testOrderToStock();

