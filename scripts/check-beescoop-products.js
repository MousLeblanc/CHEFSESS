import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';
import User from '../models/User.js';

dotenv.config();

const checkBeescoopProducts = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver le fournisseur beescoop
    const beescoop = await User.findOne({ businessName: 'beescoop' });
    
    if (!beescoop) {
      console.log('❌ Fournisseur beescoop non trouvé');
      process.exit(1);
    }

    console.log(`\n📦 Fournisseur trouvé: ${beescoop.businessName}`);
    console.log(`   Email: ${beescoop.email}`);
    console.log(`   ID: ${beescoop._id}\n`);

    // Trouver tous les produits de beescoop
    const products = await Product.find({ supplier: beescoop._id });

    console.log(`🔍 Produits trouvés: ${products.length}\n`);

    for (const product of products) {
      console.log(`📦 ${product.name}`);
      console.log(`   Prix: ${product.price}€ /${product.unit}`);
      console.log(`   Stock: ${product.stock} ${product.unit}`);
      console.log(`   Commande min: ${product.minOrder} ${product.unit}`);
      console.log(`   Actif: ${product.active ? 'Oui' : 'Non'}`);
      console.log(`   ID: ${product._id}`);
      console.log('');
    }

    if (products.some(p => p.price === 0)) {
      console.log('\n⚠️  ATTENTION: Certains produits ont un prix de 0€ !');
      const zeroProducts = products.filter(p => p.price === 0);
      console.log(`   ${zeroProducts.length} produit(s) concerné(s):`);
      zeroProducts.forEach(p => console.log(`   - ${p.name}`));
    } else {
      console.log('\n✅ Tous les produits ont un prix valide');
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkBeescoopProducts();

