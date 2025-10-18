/**
 * Script pour diagnostiquer et corriger les noms de produits dans le stock
 * Usage: node scripts/fix-stock-names.js
 */

import mongoose from 'mongoose';
import Stock from '../models/Stock.js';
import dotenv from 'dotenv';

dotenv.config();

const fixStockNames = async () => {
  try {
    console.log('🔄 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer tous les stocks
    const stocks = await Stock.find();
    console.log(`📦 ${stocks.length} stock(s) trouvé(s)\n`);

    if (stocks.length === 0) {
      console.log('ℹ️ Aucun stock à vérifier.');
      process.exit(0);
    }

    let totalIssues = 0;
    let totalFixed = 0;

    for (const stock of stocks) {
      console.log(`\n📦 Vérification du stock de l'utilisateur: ${stock.createdBy}`);
      console.log(`   Nombre d'articles: ${stock.items.length}`);

      let hasIssues = false;

      for (let i = 0; i < stock.items.length; i++) {
        const item = stock.items[i];
        const nameType = typeof item.name;
        const nameValue = item.name;

        console.log(`\n   Article ${i + 1}:`);
        console.log(`   - Nom (brut): ${JSON.stringify(nameValue)}`);
        console.log(`   - Type: ${nameType}`);
        console.log(`   - Quantité: ${item.quantity} ${item.unit}`);
        console.log(`   - Catégorie: ${item.category}`);

        if (nameType !== 'string') {
          console.log(`   ⚠️ PROBLÈME DÉTECTÉ: Le nom n'est pas une chaîne !`);
          hasIssues = true;
          totalIssues++;

          // Essayer de corriger
          if (nameType === 'object' && nameValue !== null) {
            // Si c'est un objet, essayer d'extraire une propriété "name" ou "productName"
            const fixedName = nameValue.name || nameValue.productName || nameValue.toString() || 'Produit inconnu';
            console.log(`   🔧 Correction: "${fixedName}"`);
            stock.items[i].name = fixedName;
            totalFixed++;
          } else {
            console.log(`   🔧 Correction: "Produit inconnu"`);
            stock.items[i].name = 'Produit inconnu';
            totalFixed++;
          }
        } else if (!nameValue || nameValue.trim() === '') {
          console.log(`   ⚠️ PROBLÈME DÉTECTÉ: Le nom est vide !`);
          hasIssues = true;
          totalIssues++;
          console.log(`   🔧 Correction: "Produit sans nom"`);
          stock.items[i].name = 'Produit sans nom';
          totalFixed++;
        } else {
          console.log(`   ✅ Nom correct`);
        }
      }

      if (hasIssues) {
        console.log(`\n   💾 Sauvegarde des corrections...`);
        await stock.save();
        console.log(`   ✅ Stock corrigé et sauvegardé`);
      } else {
        console.log(`\n   ✅ Aucun problème détecté pour ce stock`);
      }
    }

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log(`✅ Vérification terminée !`);
    console.log(`   • ${totalIssues} problème(s) détecté(s)`);
    console.log(`   • ${totalFixed} correction(s) appliquée(s)`);
    console.log('═══════════════════════════════════════════════════════════\n');

    if (totalFixed > 0) {
      console.log('💡 Conseil: Rechargez la page ecole-dashboard.html (CTRL+F5)');
      console.log('   pour voir les noms corrigés.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    process.exit(1);
  }
};

fixStockNames();

