/**
 * Script pour initialiser le stock de tous les produits
 * Usage: node scripts/init-product-stock.js
 */

import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const initProductStock = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les produits
    const products = await Product.find();
    console.log(`📦 ${products.length} produit(s) trouvé(s)\n`);

    if (products.length === 0) {
      console.log('ℹ️ Aucun produit à initialiser. Créez d\'abord des produits.');
      process.exit(0);
    }

    // Initialiser le stock pour chaque produit
    let updatedCount = 0;
    let alreadyInitializedCount = 0;

    for (const product of products) {
      // Ne mettre à jour que si le stock n'est pas déjà défini
      if (product.stock === undefined || product.stock === 0) {
        try {
          // Stock aléatoire entre 50 et 200 unités
          const randomStock = Math.floor(Math.random() * (200 - 50 + 1)) + 50;
          
          // Seuil d'alerte à 10% du stock initial (minimum 10)
          const alertThreshold = Math.max(10, Math.floor(randomStock * 0.1));
          
          // Mettre à jour uniquement les champs de stock (sans validation complète)
          await Product.updateOne(
            { _id: product._id },
            { 
              $set: { 
                stock: randomStock,
                stockAlert: alertThreshold
              }
            }
          );
          
          console.log(`✅ ${product.name.padEnd(30)} → Stock: ${String(randomStock).padStart(3)} ${product.unit.padEnd(8)} | Alerte: ${alertThreshold}`);
          updatedCount++;
        } catch (error) {
          console.error(`❌ Erreur pour ${product.name}:`, error.message);
        }
      } else {
        console.log(`⏭️  ${product.name.padEnd(30)} → Déjà initialisé (${product.stock} ${product.unit})`);
        alreadyInitializedCount++;
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`✅ Initialisation terminée !`);
    console.log(`   • ${updatedCount} produit(s) mis à jour`);
    console.log(`   • ${alreadyInitializedCount} produit(s) déjà initialisé(s)`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('💡 Info: Le stock sera maintenant géré automatiquement :');
    console.log('   - Déduction lors des commandes');
    console.log('   - Ajout au stock client lors de la confirmation');
    console.log('   - Restauration lors des annulations');
    console.log('   - Alertes visuelles (🟢 OK | 🟠 Bas | 🔴 Rupture)\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    process.exit(1);
  }
};

initProductStock();

