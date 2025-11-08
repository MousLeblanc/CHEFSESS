/**
 * Script de diagnostic pour les notifications de promotions
 * Vérifie si les produits ont bien toSave.active = true et si les fournisseurs ont un groupId
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
import User from '../models/User.js';

const diagnosePromotions = async () => {
  try {
    console.log('🔍 Diagnostic des notifications de promotions...\n');
    
    // Connexion à MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    console.log(`🔌 Connexion à MongoDB...`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');
    
    // 1. Trouver tous les produits avec saveProduct: true ou toSave.active: true
    console.log('📦 1. Recherche des produits avec saveProduct: true ou toSave.active: true...');
    const productsWithSave = await Product.find({
      $or: [
        { saveProduct: true },
        { 'toSave.active': true }
      ]
    }).populate('supplier', 'name email businessName groupId');
    
    console.log(`   Trouvé ${productsWithSave.length} produit(s)\n`);
    
    if (productsWithSave.length === 0) {
      console.log('⚠️ Aucun produit trouvé avec saveProduct: true ou toSave.active: true');
      await mongoose.disconnect();
      return;
    }
    
    // 2. Analyser chaque produit
    for (const product of productsWithSave) {
      console.log(`\n📦 Produit: ${product.name} (ID: ${product._id})`);
      console.log(`   - saveProduct: ${product.saveProduct}`);
      console.log(`   - toSave:`, JSON.stringify(product.toSave, null, 2));
      console.log(`   - Fournisseur: ${product.supplier?.name || product.supplier?.email || 'N/A'}`);
      console.log(`   - Fournisseur ID: ${product.supplier?._id || 'N/A'}`);
      console.log(`   - Fournisseur groupId: ${product.supplier?.groupId || 'N/A'}`);
      
      // Vérifier si le fournisseur a un groupId
      if (!product.supplier?.groupId) {
        console.log(`   ⚠️ PROBLÈME: Le fournisseur n'a pas de groupId`);
      } else {
        // Chercher les utilisateurs du groupe (même requête que dans productController.js)
        const users = await User.find({
          groupId: product.supplier.groupId,
          isActive: true,
          $or: [
            { role: { $in: ['collectivite', 'resto'] } },
            { siteId: { $exists: true, $ne: null } } // Utilisateurs avec un siteId (gestionnaires de sites)
          ]
        }).select('_id name email role siteId');
        
        console.log(`   - Utilisateurs du groupe: ${users.length}`);
        if (users.length === 0) {
          console.log(`   ⚠️ PROBLÈME: Aucun utilisateur trouvé dans le groupe pour recevoir les notifications`);
        } else {
          users.forEach(u => {
            console.log(`     - ${u.name || u.email} (${u.role}) - ${u._id}`);
          });
        }
      }
      
      // Vérifier si toSave.active est true
      if (!product.toSave || !product.toSave.active) {
        console.log(`   ⚠️ PROBLÈME: Le produit a saveProduct: true mais toSave.active n'est pas true`);
        console.log(`   💡 Solution: Convertir saveProduct: true en toSave: { active: true }`);
      }
    }
    
    // 3. Résumé
    console.log('\n\n📊 RÉSUMÉ:');
    const productsWithToSave = productsWithSave.filter(p => p.toSave?.active === true);
    const suppliersWithGroupId = productsWithSave.filter(p => p.supplier?.groupId);
    const productsWithUsers = await Promise.all(
      productsWithSave.map(async (p) => {
        if (!p.supplier?.groupId) return false;
        const users = await User.find({
          groupId: p.supplier.groupId,
          isActive: true,
          role: { $in: ['collectivite', 'resto'] }
        });
        return users.length > 0;
      })
    );
    
    console.log(`   - Produits avec saveProduct: true: ${productsWithSave.length}`);
    console.log(`   - Produits avec toSave.active: true: ${productsWithToSave.length}`);
    console.log(`   - Fournisseurs avec groupId: ${suppliersWithGroupId.length}`);
    console.log(`   - Produits avec utilisateurs dans le groupe: ${productsWithUsers.filter(Boolean).length}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Diagnostic terminé');
    
  } catch (error) {
    console.error('❌ Erreur lors du diagnostic:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

diagnosePromotions();

