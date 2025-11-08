import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function checkSupplierProducts() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const supplierIdFromNotification = '690a6fd364fe04a17452f846';
    console.log(`🔍 Recherche pour supplierId: ${supplierIdFromNotification}\n`);

    // 1. Vérifier si c'est un User
    const user = await User.findById(supplierIdFromNotification).select('_id name email businessName role supplierId');
    if (user) {
      console.log('✅ Trouvé comme User:');
      console.log(`   - ID: ${user._id}`);
      console.log(`   - Nom: ${user.name || user.businessName}`);
      console.log(`   - Email: ${user.email}`);
      console.log(`   - Role: ${user.role}`);
      console.log(`   - supplierId: ${user.supplierId || 'N/A'}`);
      
      // Chercher les produits avec cet ID
      const products = await Product.find({ supplier: user._id, active: true });
      console.log(`\n📦 Produits trouvés avec supplier=${user._id}: ${products.length}`);
      products.forEach(p => {
        console.log(`   - ${p.name} (${p._id})`);
      });
    } else {
      console.log('❌ Non trouvé comme User');
    }

    // 2. Vérifier si c'est un Supplier
    const supplier = await Supplier.findById(supplierIdFromNotification).select('_id name email createdBy');
    if (supplier) {
      console.log('\n✅ Trouvé comme Supplier:');
      console.log(`   - ID: ${supplier._id}`);
      console.log(`   - Nom: ${supplier.name}`);
      console.log(`   - Email: ${supplier.email || 'N/A'}`);
      console.log(`   - createdBy: ${supplier.createdBy || 'N/A'}`);
      
      if (supplier.createdBy) {
        // Chercher les produits avec l'ID du User créateur
        const products = await Product.find({ supplier: supplier.createdBy, active: true });
        console.log(`\n📦 Produits trouvés avec supplier=${supplier.createdBy}: ${products.length}`);
        products.forEach(p => {
          console.log(`   - ${p.name} (${p._id})`);
        });
        
        // Vérifier aussi le User
        const creatorUser = await User.findById(supplier.createdBy).select('_id name email businessName');
        if (creatorUser) {
          console.log(`\n👤 User créateur: ${creatorUser.name || creatorUser.businessName} (${creatorUser._id})`);
        }
      }
    } else {
      console.log('\n❌ Non trouvé comme Supplier');
    }

    // 3. Chercher tous les produits de "Sardine"
    console.log('\n🔍 Recherche de tous les produits avec "Sardine" dans le nom...');
    const allProducts = await Product.find({ active: true }).populate('supplier', '_id name email businessName');
    const sardineProducts = allProducts.filter(p => {
      const supplierName = p.supplier?.name || p.supplier?.businessName || '';
      return supplierName.toLowerCase().includes('sardine');
    });
    
    console.log(`📦 Produits trouvés pour "Sardine": ${sardineProducts.length}`);
    sardineProducts.forEach(p => {
      const supplierName = p.supplier?.name || p.supplier?.businessName || 'N/A';
      console.log(`   - ${p.name} (${p._id})`);
      console.log(`     Supplier: ${supplierName} (${p.supplier?._id})`);
      console.log(`     Product.supplier: ${p.supplier}`);
    });

    // 4. Chercher tous les Users avec "Sardine" dans le nom
    console.log('\n🔍 Recherche de tous les Users avec "Sardine"...');
    const allUsers = await User.find({
      $or: [
        { name: /sardine/i },
        { businessName: /sardine/i },
        { email: /sardine/i }
      ]
    }).select('_id name email businessName role supplierId');
    
    console.log(`👤 Users trouvés: ${allUsers.length}`);
    allUsers.forEach(u => {
      console.log(`   - ${u.name || u.businessName} (${u._id})`);
      console.log(`     Email: ${u.email}`);
      console.log(`     Role: ${u.role}`);
      console.log(`     supplierId: ${u.supplierId || 'N/A'}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
checkSupplierProducts();

