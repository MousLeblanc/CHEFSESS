// scripts/init-tanneurs-stock.js
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';

// Charger les variables d'environnement
dotenv.config();

async function initTanneursStock() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver le fournisseur "tanneurs"
    const tanneurs = await User.findOne({ email: 'tanneurs@gmail.com', role: 'fournisseur' });
    
    if (!tanneurs) {
      console.log('❌ Fournisseur tanneurs@gmail.com non trouvé');
      process.exit(1);
    }

    console.log(`\n📦 Fournisseur trouvé: ${tanneurs.name} (${tanneurs.email})`);

    // Trouver tous les produits de ce fournisseur
    const products = await Product.find({ supplier: tanneurs._id });

    console.log(`\n📊 ${products.length} produit(s) trouvé(s) pour ${tanneurs.name}\n`);

    if (products.length === 0) {
      console.log('ℹ️  Aucun produit à mettre à jour');
      process.exit(0);
    }

    // Mettre à jour le stock de chaque produit
    let updatedCount = 0;
    let alreadyStockedCount = 0;

    for (const product of products) {
      if (product.stock === 0) {
        // Stock par défaut : 100 unités
        const defaultStock = 100;
        product.stock = defaultStock;
        await product.save();
        console.log(`✅ ${product.name}: 0 → ${defaultStock} ${product.unit}`);
        updatedCount++;
      } else {
        console.log(`ℹ️  ${product.name}: ${product.stock} ${product.unit} (déjà stocké)`);
        alreadyStockedCount++;
      }
    }

    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║  ✅ STOCK INITIALISÉ POUR FOURNISSEUR TANNEURS             ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝`);
    console.log(`\n📊 RÉSUMÉ :`);
    console.log(`   • Produits mis à jour : ${updatedCount}`);
    console.log(`   • Produits déjà stockés : ${alreadyStockedCount}`);
    console.log(`   • Total : ${products.length}`);
    console.log(`\n✅ Tous les produits sont maintenant disponibles dans l'onglet Fournisseurs !`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

initTanneursStock();

