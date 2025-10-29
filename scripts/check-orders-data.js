import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const checkOrdersData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver les commandes récentes
    const orders = await Order.find()
      .populate('supplier', 'businessName email')
      .populate('customer', 'businessName email')
      .sort({ createdAt: -1 })
      .limit(10);

    console.log(`\n📦 ${orders.length} commandes récentes:\n`);

    for (const order of orders) {
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📋 Commande: ${order.orderNumber}`);
      console.log(`   Statut: ${order.status}`);
      console.log(`   Date: ${order.createdAt}`);
      console.log(`   Client: ${order.customer?.businessName || order.customer?.email || 'NON PEUPLÉ'}`);
      console.log(`   Fournisseur: ${order.supplier?.businessName || order.supplier?.email || 'NON PEUPLÉ (supplierId: ' + order.supplier + ')'}`);
      console.log(`\n   📦 Articles (${order.items.length}):`);
      
      order.items.forEach((item, index) => {
        console.log(`      ${index + 1}. ${item.productName}`);
        console.log(`         Quantité: ${item.quantity} ${item.unit}`);
        console.log(`         Prix unitaire: ${item.unitPrice}€`);
        console.log(`         Total item: ${item.totalPrice}€`);
      });
      
      console.log(`\n   💰 Pricing:`);
      console.log(`      Subtotal: ${order.pricing?.subtotal}€`);
      console.log(`      Tax: ${order.pricing?.tax}€`);
      console.log(`      Total: ${order.pricing?.total}€`);
      console.log('');
    }

    // Compter les commandes avec prix à 0
    const zeroOrders = orders.filter(o => o.pricing?.total === 0 || !o.pricing?.total);
    console.log(`\n⚠️  Commandes avec total à 0€: ${zeroOrders.length}/${orders.length}`);
    
    if (zeroOrders.length > 0) {
      console.log('   Numéros:');
      zeroOrders.forEach(o => console.log(`   - ${o.orderNumber}: ${o.items.length} articles`));
    }

    // Compter les commandes sans fournisseur
    const noSupplier = orders.filter(o => !o.supplier || (!o.supplier.businessName && !o.supplier.email));
    console.log(`\n⚠️  Commandes sans fournisseur peuplé: ${noSupplier.length}/${orders.length}`);
    
    if (noSupplier.length > 0) {
      console.log('   Numéros:');
      noSupplier.forEach(o => console.log(`   - ${o.orderNumber}: supplierId = ${o.supplier}`));
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkOrdersData();

