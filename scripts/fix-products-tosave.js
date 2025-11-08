/**
 * Script pour convertir les produits avec saveProduct: true en toSave: { active: true }
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config();

// Vérifier que MONGO_URI ou MONGODB_URI est défini
const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
if (!mongoUri) {
  console.error('❌ MONGO_URI ou MONGODB_URI n\'est pas défini dans le fichier .env');
  console.error('   Vérifiez que le fichier .env existe à la racine du projet');
  process.exit(1);
}

// Importer les modèles
import Product from '../models/Product.js';

const fixProducts = async () => {
  try {
    console.log('🔧 Correction des produits avec saveProduct: true...\n');
    
    // Connexion à MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log(`🔌 Connexion à MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // Trouver tous les produits avec saveProduct: true mais sans toSave.active: true
    const productsToFix = await Product.find({
      saveProduct: true,
      $or: [
        { 'toSave.active': { $ne: true } },
        { toSave: { $exists: false } }
      ]
    });
    
    console.log(`📦 Trouvé ${productsToFix.length} produit(s) à corriger\n`);
    
    if (productsToFix.length === 0) {
      console.log('✅ Aucun produit à corriger');
      await mongoose.disconnect();
      return;
    }
    
    // Corriger chaque produit
    let fixed = 0;
    for (const product of productsToFix) {
      console.log(`📦 Correction de: ${product.name} (ID: ${product._id})`);
      console.log(`   - saveProduct: ${product.saveProduct}`);
      console.log(`   - toSave avant:`, JSON.stringify(product.toSave, null, 2));
      
      product.toSave = {
        active: true,
        savePrice: product.toSave?.savePrice || null,
        saveQuantity: product.toSave?.saveQuantity || null,
        expirationDate: product.toSave?.expirationDate || null
      };
      
      await product.save();
      fixed++;
      
      console.log(`   - toSave après:`, JSON.stringify(product.toSave, null, 2));
      console.log(`   ✅ Corrigé\n`);
    }
    
    console.log(`\n✅ ${fixed} produit(s) corrigé(s) avec succès`);
    
    await mongoose.disconnect();
    console.log('✅ Correction terminée');
    
  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

fixProducts();

