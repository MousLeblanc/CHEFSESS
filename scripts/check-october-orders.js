import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const checkOctoberOrders = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Période octobre 2025
    const startDate = new Date('2025-10-01T00:00:00.000Z');
    const endDate = new Date('2025-10-31T23:59:59.999Z');

    console.log('🗓️  PÉRIODE OCTOBRE 2025');
    console.log(`   Du: ${startDate.toLocaleDateString('fr-FR')}`);
    console.log(`   Au: ${endDate.toLocaleDateString('fr-FR')}\n`);

    // 1. Commandes livrées avec dates.delivered dans la période
    const ordersWithDeliveryDate = await Order.find({
      'dates.delivered': {
        $gte: startDate,
        $lte: endDate
      },
      status: { $in: ['delivered', 'completed'] }
    });

    console.log(`✅ Commandes avec dates.delivered en octobre: ${ordersWithDeliveryDate.length}`);
    ordersWithDeliveryDate.forEach(order => {
      const deliveredDate = order.dates?.delivered ? new Date(order.dates.delivered).toLocaleDateString('fr-FR') : 'N/A';
      console.log(`   📦 ${order.orderNumber} - Livré le: ${deliveredDate} - Total: ${order.pricing?.total || 0}€`);
    });

    // 2. Commandes livrées SANS dates.delivered
    console.log('\n❌ Commandes livrées SANS dates.delivered:');
    const ordersWithoutDeliveryDate = await Order.find({
      status: { $in: ['delivered', 'completed'] },
      'dates.delivered': { $exists: false }
    });

    console.log(`   Total: ${ordersWithoutDeliveryDate.length} commande(s)\n`);
    ordersWithoutDeliveryDate.forEach(order => {
      const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A';
      const updatedDate = order.updatedAt ? new Date(order.updatedAt).toLocaleDateString('fr-FR') : 'N/A';
      console.log(`   📦 ${order.orderNumber}`);
      console.log(`      Créé le: ${createdDate}`);
      console.log(`      MAJ le: ${updatedDate}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Total: ${order.pricing?.total || 0}€\n`);
    });

    // 3. Commandes créées en octobre (peu importe le status)
    console.log('🔍 Commandes CRÉÉES en octobre (tous status):');
    const ordersCreatedInOctober = await Order.find({
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });

    console.log(`   Total: ${ordersCreatedInOctober.length} commande(s)\n`);
    ordersCreatedInOctober.forEach(order => {
      const createdDate = order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : 'N/A';
      const deliveredDate = order.dates?.delivered ? new Date(order.dates.delivered).toLocaleDateString('fr-FR') : '❌ PAS DE DATE';
      console.log(`   📦 ${order.orderNumber}`);
      console.log(`      Créé le: ${createdDate}`);
      console.log(`      Livré le: ${deliveredDate}`);
      console.log(`      Status: ${order.status}`);
      console.log(`      Total: ${order.pricing?.total || 0}€\n`);
    });

    console.log('\n📊 RÉSUMÉ:');
    console.log(`   ✅ Avec dates.delivered en octobre: ${ordersWithDeliveryDate.length}`);
    console.log(`   ❌ Livrées mais SANS dates.delivered: ${ordersWithoutDeliveryDate.length}`);
    console.log(`   🔍 Créées en octobre: ${ordersCreatedInOctober.length}`);

    if (ordersWithoutDeliveryDate.length > 0) {
      console.log('\n⚠️  PROBLÈME DÉTECTÉ !');
      console.log('   Des commandes livrées n\'ont pas de dates.delivered');
      console.log('   → Aller sur /admin-tools.html');
      console.log('   → Cliquer "📅 Corriger les dates de livraison"');
      console.log('   → Puis recalculer le Food Cost');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkOctoberOrders();

