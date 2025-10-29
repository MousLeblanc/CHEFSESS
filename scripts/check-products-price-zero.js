import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const checkProductsPriceZero = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver tous les produits avec prix à 0
    const productsWithZeroPrice = await Product.find({ 
      price: { $lte: 0 } 
    }).populate('supplier', 'businessName email');

    console.log(`\n🔍 Produits trouvés avec prix à 0€: ${productsWithZeroPrice.length}\n`);

    if (productsWithZeroPrice.length === 0) {
      console.log('✅ Tous les produits ont un prix valide !');
      process.exit(0);
    }

    // Afficher les détails
    for (const product of productsWithZeroPrice) {
      console.log(`❌ Produit: ${product.name}`);
      console.log(`   Fournisseur: ${product.supplier?.businessName || 'Non défini'}`);
      console.log(`   Catégorie: ${product.category}`);
      console.log(`   Prix actuel: ${product.price}€`);
      console.log(`   Stock: ${product.stock} ${product.unit}`);
      console.log(`   Créé le: ${product.createdAt}`);
      console.log(`   ID: ${product._id}`);
      console.log('');
    }

    console.log('\n💡 Recommandation:');
    console.log('Ces produits doivent être mis à jour avec des prix valides.');
    console.log('Contactez les fournisseurs ou utilisez le script fix-products-price-zero.js');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkProductsPriceZero();

