import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

dotenv.config();

async function fixProductCategories() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Mapping des anciennes valeurs vers les nouvelles
    const categoryMapping = {
      'fruits': 'fruits-legumes',
      'legumes': 'fruits-legumes',
      'viande': 'viandes',
      'poisson': 'poissons',
      'produit-laitier': 'produits-laitiers',
      'produits-laitier': 'produits-laitiers',
    };

    const unitMapping = {
      'caisse': 'carton',
      'caisses': 'carton',
      'L': 'litre',
      'l': 'litre',
      'piece': 'pièce',
      'pieces': 'pièce',
      'boite': 'boîte',
      'boites': 'boîte',
    };

    const validCategories = ['fruits-legumes', 'viandes', 'poissons', 'epicerie', 'boissons', 'produits-laitiers', 'boulangerie', 'autres'];
    const validUnits = ['kg', 'g', 'litre', 'ml', 'pièce', 'paquet', 'boîte', 'sachet', 'bouteille', 'portion', 'carton'];

    // Trouver tous les produits
    const products = await Product.find({});
    console.log(`\n📦 ${products.length} produit(s) trouvé(s)`);

    let correctedCount = 0;

    for (const product of products) {
      let needsSave = false;
      const oldCategory = product.category;
      const oldUnit = product.unit;
      
      // Vérifier et corriger la catégorie
      if (categoryMapping[oldCategory]) {
        const newCategory = categoryMapping[oldCategory];
        console.log(`🔄 ${product.name}: catégorie "${oldCategory}" → "${newCategory}"`);
        product.category = newCategory;
        needsSave = true;
      } else if (!validCategories.includes(oldCategory)) {
        console.log(`⚠️ ${product.name}: catégorie invalide "${oldCategory}" → "autres"`);
        product.category = 'autres';
        needsSave = true;
      }
      
      // Vérifier et corriger l'unité
      if (unitMapping[oldUnit]) {
        const newUnit = unitMapping[oldUnit];
        console.log(`🔄 ${product.name}: unité "${oldUnit}" → "${newUnit}"`);
        product.unit = newUnit;
        needsSave = true;
      } else if (!validUnits.includes(oldUnit)) {
        console.log(`⚠️ ${product.name}: unité invalide "${oldUnit}" → "pièce"`);
        product.unit = 'pièce';
        needsSave = true;
      }
      
      // Sauvegarder si des modifications ont été faites
      if (needsSave) {
        await product.save();
        correctedCount++;
      } else {
        console.log(`✅ ${product.name}: catégorie "${oldCategory}" et unité "${oldUnit}" valides`);
      }
    }

    console.log('\n╔═══════════════════════════════════════════════════════════════╗');
    console.log('║  ✅ MIGRATION TERMINÉE                                       ║');
    console.log('╚═══════════════════════════════════════════════════════════════╝');
    console.log(`\n📊 RÉSUMÉ :`);
    console.log(`   • Total de produits : ${products.length}`);
    console.log(`   • Produits corrigés : ${correctedCount}`);
    console.log(`   • Produits OK : ${products.length - correctedCount}`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB.');
  }
}

fixProductCategories();

