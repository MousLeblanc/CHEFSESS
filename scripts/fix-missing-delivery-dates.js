import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from '../models/Order.js';

dotenv.config();

const fixMissingDeliveryDates = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver toutes les commandes 'delivered' ou 'completed' SANS date de livraison
    const ordersWithoutDate = await Order.find({
      status: { $in: ['delivered', 'completed'] },
      'dates.delivered': { $exists: false }
    });

    console.log(`\n📦 Commandes livrées SANS date de livraison: ${ordersWithoutDate.length}\n`);

    if (ordersWithoutDate.length === 0) {
      console.log('✅ Toutes les commandes livrées ont une date de livraison !');
      process.exit(0);
    }

    let fixed = 0;
    let errors = 0;

    for (const order of ordersWithoutDate) {
      try {
        // Utiliser la date de mise à jour (updatedAt) comme date de livraison approximative
        // C'est la meilleure estimation qu'on puisse avoir
        order.dates = order.dates || {};
        order.dates.delivered = order.updatedAt || order.createdAt;
        
        await order.save();
        
        console.log(`✅ ${order.orderNumber}: Date de livraison définie à ${order.dates.delivered.toLocaleDateString('fr-FR')}`);
        fixed++;
      } catch (error) {
        console.error(`❌ ${order.orderNumber}: Erreur - ${error.message}`);
        errors++;
      }
    }

    console.log(`\n📊 Résumé:`);
    console.log(`   ✅ Corrigées: ${fixed}`);
    console.log(`   ❌ Erreurs: ${errors}`);
    console.log(`   📦 Total: ${ordersWithoutDate.length}`);

    // Vérification finale
    const stillMissing = await Order.countDocuments({
      status: { $in: ['delivered', 'completed'] },
      'dates.delivered': { $exists: false }
    });

    console.log(`\n🔍 Commandes encore sans date: ${stillMissing}`);

    if (stillMissing === 0) {
      console.log('✅ Toutes les commandes livrées ont maintenant une date de livraison !');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

fixMissingDeliveryDates();

