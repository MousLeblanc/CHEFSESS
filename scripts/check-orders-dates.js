import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const checkOrdersDates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver les commandes récentes avec statut delivered
    const orders = await Order.find({ 
      status: { $in: ['delivered', 'completed'] }
    })
    .populate('supplier', 'businessName')
    .populate('customer', 'businessName')
    .sort({ createdAt: -1 })
    .limit(20);

    console.log(`\n📦 ${orders.length} commandes livrées récentes:\n`);

    orders.forEach(order => {
      const createdDate = new Date(order.createdAt);
      const deliveredDate = order.dates?.delivered ? new Date(order.dates.delivered) : null;
      
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 ${order.orderNumber}`);
      console.log(`   Client: ${order.customer?.businessName || 'N/A'}`);
      console.log(`   Fournisseur: ${order.supplier?.businessName || 'N/A'}`);
      console.log(`   Statut: ${order.status}`);
      console.log(`   📅 Date création: ${createdDate.toLocaleDateString('fr-FR')} ${createdDate.toLocaleTimeString('fr-FR')}`);
      console.log(`   📅 Date livraison: ${deliveredDate ? deliveredDate.toLocaleDateString('fr-FR') + ' ' + deliveredDate.toLocaleTimeString('fr-FR') : '❌ NON DÉFINIE'}`);
      console.log(`   💰 Total: ${order.pricing?.total || 0}€`);
      console.log('');
    });

    // Compter les commandes livrées sans date de livraison
    const noDeliveryDate = orders.filter(o => o.status === 'delivered' && !o.dates?.delivered);
    console.log(`\n⚠️  Commandes "delivered" SANS date de livraison: ${noDeliveryDate.length}/${orders.length}`);
    
    if (noDeliveryDate.length > 0) {
      console.log('   ❌ Ces commandes ne seront PAS comptées dans le Food Cost !');
      console.log('   Numéros:');
      noDeliveryDate.forEach(o => console.log(`   - ${o.orderNumber}`));
    }

    // Test pour une période spécifique (novembre 2025)
    const novemberStart = new Date('2025-11-01');
    const novemberEnd = new Date('2025-11-30');
    
    const novemberOrders = await Order.find({
      'dates.delivered': {
        $gte: novemberStart,
        $lte: novemberEnd
      },
      status: { $in: ['delivered', 'completed'] }
    });

    console.log(`\n📊 Test période Novembre 2025:`);
    console.log(`   Commandes livrées en novembre: ${novemberOrders.length}`);
    console.log(`   Total: ${novemberOrders.reduce((sum, o) => sum + (o.pricing?.total || 0), 0).toFixed(2)}€`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkOrdersDates();

