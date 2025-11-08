import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import Supplier from '../models/Supplier.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function testAPIProducts() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const supplierId = '690a6fd364fe04a17452f846';
    console.log(`🔍 Test avec supplierId: ${supplierId}\n`);

    // Simuler exactement ce que fait getProductsBySupplier
    console.log('🔍 Méthode 1 - Recherche directe avec supplierId...');
    let products = await Product.find({ 
      supplier: supplierId,
      active: true 
    }).sort({ createdAt: -1 });
    console.log(`   Résultat: ${products.length} produits\n`);

    if (products.length === 0) {
      console.log('🔍 Méthode 2 - Recherche via Supplier model...');
      const supplier = await Supplier.findById(supplierId);
      
      if (supplier) {
        console.log('   ✅ Supplier trouvé:', {
          _id: supplier._id.toString(),
          name: supplier.name,
          createdBy: supplier.createdBy ? supplier.createdBy.toString() : 'N/A'
        });
        
        if (supplier.createdBy) {
          const userId = typeof supplier.createdBy === 'string' 
            ? new mongoose.Types.ObjectId(supplier.createdBy)
            : supplier.createdBy;
          
          console.log(`   🔍 Recherche produits avec userId: ${userId.toString()}`);
          products = await Product.find({ 
            supplier: userId,
            active: true 
          }).sort({ createdAt: -1 });
          console.log(`   ✅ Résultat: ${products.length} produits\n`);
          
          if (products.length > 0) {
            console.log('   📦 Produits trouvés:');
            products.slice(0, 5).forEach(p => {
              console.log(`      - ${p.name} (${p._id})`);
            });
            if (products.length > 5) {
              console.log(`      ... et ${products.length - 5} autres`);
            }
          }
        }
      } else {
        console.log('   ❌ Supplier non trouvé\n');
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le test
testAPIProducts();

