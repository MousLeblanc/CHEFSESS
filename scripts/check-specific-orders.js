import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const checkSpecificOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Vos 2 commandes visibles
    const orderNumbers = [
      '#CMD-1761738222986-0054',
      '#CMD-1761737774190-0053'
    ];

    console.log('🔍 VÉRIFICATION DES COMMANDES D\'OCTOBRE\n');
    console.log('=' .repeat(80));

    for (const orderNum of orderNumbers) {
      const order = await Order.findOne({ orderNumber: orderNum });
      
      if (!order) {
        console.log(`\n❌ Commande ${orderNum} NON TROUVÉE dans la base`);
        continue;
      }

      console.log(`\n📦 COMMANDE: ${order.orderNumber}`);
      console.log('   ' + '-'.repeat(76));
      
      console.log(`\n   🏥 Site ID: ${order.siteId}`);
      console.log(`   📊 Status: ${order.status}`);
      
      console.log(`\n   📅 DATES:`);
      console.log(`      • Créée le     : ${order.createdAt?.toLocaleString('fr-FR')}`);
      console.log(`      • MAJ le       : ${order.updatedAt?.toLocaleString('fr-FR')}`);
      console.log(`      • dates.placed : ${order.dates?.placed ? new Date(order.dates.placed).toLocaleString('fr-FR') : '❌ NULL'}`);
      console.log(`      • dates.delivered : ${order.dates?.delivered ? new Date(order.dates.delivered).toLocaleString('fr-FR') : '❌ NULL'}`);
      
      console.log(`\n   💰 PRIX:`);
      console.log(`      • Subtotal : ${order.pricing?.subtotal || 0}€`);
      console.log(`      • Tax      : ${order.pricing?.tax || 0}€`);
      console.log(`      • Shipping : ${order.pricing?.shipping || 0}€`);
      console.log(`      • TOTAL    : ${order.pricing?.total || 0}€`);
      
      console.log(`\n   📋 ARTICLES: ${order.items?.length || 0} article(s)`);
      if (order.items && order.items.length > 0) {
        order.items.forEach((item, i) => {
          console.log(`      ${i+1}. ${item.productName} - ${item.quantity} x ${item.unitPrice}€ = ${item.totalPrice}€`);
        });
      }
      
      // Vérification pour Food Cost
      console.log(`\n   🔍 VISIBILITÉ:`);
      console.log(`      • Dans "Mes Commandes" : ✅ OUI (status="${order.status}")`);
      
      if (order.dates?.delivered) {
        const deliveredDate = new Date(order.dates.delivered);
        const octoberStart = new Date('2025-10-01T00:00:00.000Z');
        const octoberEnd = new Date('2025-10-31T23:59:59.999Z');
        
        if (deliveredDate >= octoberStart && deliveredDate <= octoberEnd) {
          console.log(`      • Dans Food Cost octobre : ✅ OUI (delivered="${deliveredDate.toLocaleDateString('fr-FR')}")`);
        } else {
          console.log(`      • Dans Food Cost octobre : ❌ NON (delivered hors période)`);
        }
      } else {
        console.log(`      • Dans Food Cost octobre : ❌ NON (dates.delivered = NULL)`);
        console.log(`\n   ⚠️  PROBLÈME DÉTECTÉ !`);
        console.log(`      Cette commande a status="delivered" MAIS dates.delivered est NULL`);
        console.log(`      → Le Food Cost ne peut PAS la trouver`);
        console.log(`      → SOLUTION: Corriger via /admin-tools.html`);
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 RÉSUMÉ ET DIAGNOSTIC\n');

    // Compter toutes les commandes livrées sans date
    const allOrdersWithoutDate = await Order.find({
      status: { $in: ['delivered', 'completed'] },
      'dates.delivered': { $exists: false }
    });

    console.log(`❌ Total commandes livrées SANS dates.delivered: ${allOrdersWithoutDate.length}`);
    
    if (allOrdersWithoutDate.length > 0) {
      console.log(`\n💡 ACTION REQUISE:`);
      console.log(`   1. Aller sur: https://chefsess.onrender.com/admin-tools.html`);
      console.log(`   2. Cliquer sur: 4️⃣ "Corriger les dates de livraison"`);
      console.log(`   3. Confirmer l'action`);
      console.log(`   4. ${allOrdersWithoutDate.length} commande(s) seront corrigée(s)`);
      console.log(`   5. Retourner au Food Cost et cliquer "Recalculer les commandes"`);
      console.log(`   6. ✅ Les montants devraient apparaître !`);
    } else {
      console.log(`\n✅ Toutes les commandes livrées ont une date de livraison`);
      console.log(`   Si le Food Cost affiche toujours 0€, vérifier:`);
      console.log(`   - Que le site ID correspond`);
      console.log(`   - Que la période est correcte`);
    }

    console.log('\n');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkSpecificOrders();

