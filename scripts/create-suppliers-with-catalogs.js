// Script pour créer 10 fournisseurs avec leurs catalogues de produits
// Produits similaires mais avec prix différents pour permettre la comparaison

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';
import Group from '../models/Group.js';

dotenv.config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chefses', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Erreur de connexion MongoDB: ${error.message}`);
    process.exit(1);
  }
};

// Données des fournisseurs
const suppliersData = [
  // Fruits et Légumes
  {
    businessName: 'André Fruits et Légumes',
    email: 'andre@fournisseur.com',
    password: 'andre',
    contact: 'André',
    phone: '+32 2 123 45 67',
    type: 'primeur',
    categories: ['legumes'],
    address: {
      street: 'Rue des Primeurs 12',
      city: 'Bruxelles',
      postalCode: '1000',
      country: 'Belgique'
    }
  },
  {
    businessName: 'Denver Fruits et Légumes',
    email: 'denver@fournisseur.com',
    password: 'denver',
    contact: 'Denver',
    phone: '+32 2 234 56 78',
    type: 'primeur',
    categories: ['legumes'],
    address: {
      street: 'Avenue des Marchés 45',
      city: 'Anvers',
      postalCode: '2000',
      country: 'Belgique'
    }
  },
  {
    businessName: 'Tanneur Fruits et Légumes',
    email: 'tanneur@fournisseur.com',
    password: 'tanneur',
    contact: 'Tanneur',
    phone: '+32 2 345 67 89',
    type: 'primeur',
    categories: ['legumes'],
    address: {
      street: 'Boulevard des Jardins 78',
      city: 'Gand',
      postalCode: '9000',
      country: 'Belgique'
    }
  },
  // Poissonniers
  {
    businessName: 'La Marée',
    email: 'lamaree@fournisseur.com',
    password: 'lamaree',
    contact: 'La Marée',
    phone: '+32 2 456 78 90',
    type: 'poissonnier',
    categories: ['poissons'],
    address: {
      street: 'Quai du Port 23',
      city: 'Ostende',
      postalCode: '8400',
      country: 'Belgique'
    }
  },
  {
    businessName: 'Sardine',
    email: 'sardine@fournisseur.com',
    password: 'sardine',
    contact: 'Sardine',
    phone: '+32 2 567 89 01',
    type: 'poissonnier',
    categories: ['poissons'],
    address: {
      street: 'Rue des Pêcheurs 56',
      city: 'Zeebrugge',
      postalCode: '8380',
      country: 'Belgique'
    }
  },
  {
    businessName: 'Océan',
    email: 'ocean@fournisseur.com',
    password: 'ocean',
    contact: 'Océan',
    phone: '+32 2 678 90 12',
    type: 'poissonnier',
    categories: ['poissons'],
    address: {
      street: 'Avenue de la Mer 89',
      city: 'Knokke',
      postalCode: '8300',
      country: 'Belgique'
    }
  },
  // Boucheries
  {
    businessName: 'Atelier Boucherie',
    email: 'atelier@fournisseur.com',
    password: 'atelier',
    contact: 'Atelier',
    phone: '+32 2 789 01 23',
    type: 'boucher',
    categories: ['viandes'],
    address: {
      street: 'Rue de la Boucherie 34',
      city: 'Bruxelles',
      postalCode: '1000',
      country: 'Belgique'
    }
  },
  {
    businessName: 'Lahma Boucherie',
    email: 'lahma@fournisseur.com',
    password: 'lahma',
    contact: 'Lahma',
    phone: '+32 2 890 12 34',
    type: 'boucher',
    categories: ['viandes'],
    address: {
      street: 'Boulevard des Abattoirs 67',
      city: 'Charleroi',
      postalCode: '6000',
      country: 'Belgique'
    }
  },
  // Boulangerie
  {
    businessName: 'Boulangerie du Coin',
    email: 'boulangerie@fournisseur.com',
    password: 'boulangerie',
    contact: 'Boulangerie',
    phone: '+32 2 901 23 45',
    type: 'boulanger',
    categories: ['cereales'],
    address: {
      street: 'Rue de la Baguette 12',
      city: 'Bruxelles',
      postalCode: '1000',
      country: 'Belgique'
    }
  },
  // Epicerie
  {
    businessName: 'Épicerie Fine',
    email: 'epicerie@fournisseur.com',
    password: 'epicerie',
    contact: 'Épicerie',
    phone: '+32 2 012 34 56',
    type: 'epicier',
    categories: ['epices', 'cereales'],
    address: {
      street: 'Avenue des Épices 45',
      city: 'Bruxelles',
      postalCode: '1000',
      country: 'Belgique'
    }
  }
];

// Produits par catégorie (avec variations de prix)
const productsByCategory = {
  fruitsLegumes: [
    { name: 'Tomates', category: 'fruits-legumes', unit: 'kg', basePrice: 2.50, stock: 100 },
    { name: 'Carottes', category: 'fruits-legumes', unit: 'kg', basePrice: 1.80, stock: 150 },
    { name: 'Pommes de terre', category: 'fruits-legumes', unit: 'kg', basePrice: 1.20, stock: 200 },
    { name: 'Salade verte', category: 'fruits-legumes', unit: 'pièce', basePrice: 1.50, stock: 80 },
    { name: 'Courgettes', category: 'fruits-legumes', unit: 'kg', basePrice: 2.80, stock: 90 },
    { name: 'Aubergines', category: 'fruits-legumes', unit: 'kg', basePrice: 3.50, stock: 70 },
    { name: 'Poivrons', category: 'fruits-legumes', unit: 'kg', basePrice: 4.00, stock: 60 },
    { name: 'Oignons', category: 'fruits-legumes', unit: 'kg', basePrice: 1.50, stock: 120 },
    { name: 'Ail', category: 'fruits-legumes', unit: 'kg', basePrice: 8.00, stock: 50 },
    { name: 'Échalotes', category: 'fruits-legumes', unit: 'kg', basePrice: 6.50, stock: 40 },
    { name: 'Pommes', category: 'fruits-legumes', unit: 'kg', basePrice: 2.20, stock: 110 },
    { name: 'Poires', category: 'fruits-legumes', unit: 'kg', basePrice: 2.80, stock: 95 },
    { name: 'Oranges', category: 'fruits-legumes', unit: 'kg', basePrice: 3.20, stock: 85 },
    { name: 'Bananes', category: 'fruits-legumes', unit: 'kg', basePrice: 2.50, stock: 100 },
    { name: 'Citrons', category: 'fruits-legumes', unit: 'kg', basePrice: 4.50, stock: 75 }
  ],
  poissons: [
    { name: 'Cabillaud', category: 'poissons', unit: 'kg', basePrice: 18.00, stock: 30 },
    { name: 'Saumon', category: 'poissons', unit: 'kg', basePrice: 22.00, stock: 25 },
    { name: 'Dorade', category: 'poissons', unit: 'kg', basePrice: 16.00, stock: 35 },
    { name: 'Bar', category: 'poissons', unit: 'kg', basePrice: 20.00, stock: 28 },
    { name: 'Merlan', category: 'poissons', unit: 'kg', basePrice: 12.00, stock: 40 },
    { name: 'Sardines', category: 'poissons', unit: 'kg', basePrice: 8.00, stock: 50 },
    { name: 'Maquereau', category: 'poissons', unit: 'kg', basePrice: 9.00, stock: 45 },
    { name: 'Crevettes', category: 'poissons', unit: 'kg', basePrice: 28.00, stock: 20 },
    { name: 'Moules', category: 'poissons', unit: 'kg', basePrice: 6.00, stock: 60 },
    { name: 'Coquilles Saint-Jacques', category: 'poissons', unit: 'kg', basePrice: 35.00, stock: 15 },
    { name: 'Thon', category: 'poissons', unit: 'kg', basePrice: 24.00, stock: 22 },
    { name: 'Sole', category: 'poissons', unit: 'kg', basePrice: 26.00, stock: 18 }
  ],
  viandes: [
    { name: 'Bœuf haché', category: 'viandes', unit: 'kg', basePrice: 15.00, stock: 40 },
    { name: 'Steak de bœuf', category: 'viandes', unit: 'kg', basePrice: 24.00, stock: 30 },
    { name: 'Côte de porc', category: 'viandes', unit: 'kg', basePrice: 12.00, stock: 50 },
    { name: 'Filet de porc', category: 'viandes', unit: 'kg', basePrice: 18.00, stock: 35 },
    { name: 'Poulet entier', category: 'viandes', unit: 'kg', basePrice: 8.00, stock: 60 },
    { name: 'Cuisse de poulet', category: 'viandes', unit: 'kg', basePrice: 7.50, stock: 65 },
    { name: 'Filet de poulet', category: 'viandes', unit: 'kg', basePrice: 11.00, stock: 45 },
    { name: 'Agneau - Gigot', category: 'viandes', unit: 'kg', basePrice: 28.00, stock: 25 },
    { name: 'Côtelette d\'agneau', category: 'viandes', unit: 'kg', basePrice: 26.00, stock: 28 },
    { name: 'Dinde', category: 'viandes', unit: 'kg', basePrice: 9.50, stock: 40 },
    { name: 'Jambon blanc', category: 'viandes', unit: 'kg', basePrice: 14.00, stock: 35 },
    { name: 'Bacon', category: 'viandes', unit: 'kg', basePrice: 16.00, stock: 30 }
  ],
  boulangerie: [
    { name: 'Pain blanc', category: 'boulangerie', unit: 'pièce', basePrice: 2.50, stock: 100 },
    { name: 'Pain complet', category: 'boulangerie', unit: 'pièce', basePrice: 3.00, stock: 80 },
    { name: 'Baguette', category: 'boulangerie', unit: 'pièce', basePrice: 1.20, stock: 150 },
    { name: 'Pain de mie', category: 'boulangerie', unit: 'paquet', basePrice: 2.80, stock: 90 },
    { name: 'Croissants', category: 'boulangerie', unit: 'pièce', basePrice: 1.50, stock: 120 },
    { name: 'Pains au chocolat', category: 'boulangerie', unit: 'pièce', basePrice: 1.60, stock: 110 },
    { name: 'Pain de campagne', category: 'boulangerie', unit: 'pièce', basePrice: 3.50, stock: 70 },
    { name: 'Pain aux céréales', category: 'boulangerie', unit: 'pièce', basePrice: 3.20, stock: 75 }
  ],
  epicerie: [
    { name: 'Riz basmati', category: 'epicerie', unit: 'kg', basePrice: 4.50, stock: 80 },
    { name: 'Pâtes', category: 'epicerie', unit: 'kg', basePrice: 2.20, stock: 120 },
    { name: 'Huile d\'olive', category: 'epicerie', unit: 'litre', basePrice: 8.50, stock: 60 },
    { name: 'Vinaigre balsamique', category: 'epicerie', unit: 'litre', basePrice: 12.00, stock: 40 },
    { name: 'Sel', category: 'epicerie', unit: 'kg', basePrice: 1.50, stock: 200 },
    { name: 'Poivre', category: 'epicerie', unit: 'kg', basePrice: 25.00, stock: 30 },
    { name: 'Sucre', category: 'epicerie', unit: 'kg', basePrice: 2.00, stock: 150 },
    { name: 'Farine', category: 'epicerie', unit: 'kg', basePrice: 1.80, stock: 140 },
    { name: 'Tomates pelées', category: 'epicerie', unit: 'boîte', basePrice: 2.50, stock: 100 },
    { name: 'Lentilles', category: 'epicerie', unit: 'kg', basePrice: 3.50, stock: 90 },
    { name: 'Pois chiches', category: 'epicerie', unit: 'kg', basePrice: 3.80, stock: 85 },
    { name: 'Haricots rouges', category: 'epicerie', unit: 'kg', basePrice: 4.00, stock: 80 }
  ]
};

// Fonction pour obtenir les produits selon la catégorie du fournisseur
function getProductsForSupplier(supplierCategories, supplierIndex) {
  const products = [];
  
  // Variation de prix entre fournisseurs (±10% à ±25%)
  const priceVariation = (supplierIndex % 3) * 0.05 + 0.10; // 10%, 15%, 20%
  const isCheaper = supplierIndex % 2 === 0; // Alternance entre plus cher et moins cher
  
  if (supplierCategories.includes('legumes')) {
    productsByCategory.fruitsLegumes.forEach((prod, idx) => {
      const variation = isCheaper ? (1 - priceVariation) : (1 + priceVariation);
      const finalPrice = (prod.basePrice * variation).toFixed(2);
      products.push({
        ...prod,
        price: parseFloat(finalPrice),
        // Variation de stock
        stock: prod.stock + (idx % 3 === 0 ? 20 : idx % 3 === 1 ? -10 : 0)
      });
    });
  }
  
  if (supplierCategories.includes('poissons')) {
    productsByCategory.poissons.forEach((prod, idx) => {
      const variation = isCheaper ? (1 - priceVariation) : (1 + priceVariation);
      const finalPrice = (prod.basePrice * variation).toFixed(2);
      products.push({
        ...prod,
        price: parseFloat(finalPrice),
        stock: prod.stock + (idx % 3 === 0 ? 10 : idx % 3 === 1 ? -5 : 0)
      });
    });
  }
  
  if (supplierCategories.includes('viandes')) {
    productsByCategory.viandes.forEach((prod, idx) => {
      const variation = isCheaper ? (1 - priceVariation) : (1 + priceVariation);
      const finalPrice = (prod.basePrice * variation).toFixed(2);
      products.push({
        ...prod,
        price: parseFloat(finalPrice),
        stock: prod.stock + (idx % 3 === 0 ? 15 : idx % 3 === 1 ? -8 : 0)
      });
    });
  }
  
  if (supplierCategories.includes('cereales') && supplierIndex === 8) { // Boulangerie
    productsByCategory.boulangerie.forEach((prod, idx) => {
      const variation = isCheaper ? (1 - priceVariation) : (1 + priceVariation);
      const finalPrice = (prod.basePrice * variation).toFixed(2);
      products.push({
        ...prod,
        price: parseFloat(finalPrice),
        stock: prod.stock + (idx % 2 === 0 ? 30 : -10)
      });
    });
  }
  
  if ((supplierCategories.includes('epices') || supplierCategories.includes('cereales')) && supplierIndex === 9) { // Epicerie
    productsByCategory.epicerie.forEach((prod, idx) => {
      const variation = isCheaper ? (1 - priceVariation) : (1 + priceVariation);
      const finalPrice = (prod.basePrice * variation).toFixed(2);
      products.push({
        ...prod,
        price: parseFloat(finalPrice),
        stock: prod.stock + (idx % 2 === 0 ? 40 : -15)
      });
    });
  }
  
  return products;
}

// Fonction principale
async function createSuppliersWithCatalogs() {
  try {
    await connectDB();
    
    // Trouver ou créer un groupe par défaut
    let group = await Group.findOne({ code: 'default' });
    if (!group) {
      group = await Group.create({
        name: 'Groupe par défaut',
        code: 'default',
        contactEmail: 'admin@chefses.com'
      });
      console.log('✅ Groupe par défaut créé');
    }
    
    let createdUsers = 0;
    let createdSuppliers = 0;
    let createdProducts = 0;
    let skipped = 0;
    
    console.log('\n🚀 Création des fournisseurs et catalogues...\n');
    console.log('='.repeat(100));
    
    for (let i = 0; i < suppliersData.length; i++) {
      const supplierData = suppliersData[i];
      
      try {
        // Vérifier si l'utilisateur existe déjà
        let user = await User.findOne({ email: supplierData.email });
        let isNewUser = false;
        
        if (!user) {
          // Créer l'utilisateur
          user = await User.create({
          name: supplierData.contact,
          email: supplierData.email,
          password: supplierData.password, // Sera hashé automatiquement
          role: 'fournisseur',
          roles: ['SUPPLIER'],
          businessName: supplierData.businessName,
          phone: supplierData.phone,
          address: supplierData.address,
          groupId: group._id,
          isActive: true,
          isEmailVerified: true
        });
        createdUsers++;
        isNewUser = true;
        console.log(`✅ ${supplierData.businessName.padEnd(40)} | Utilisateur créé: ${supplierData.email}`);
        } else {
          console.log(`⏭️  ${supplierData.businessName.padEnd(40)} | Utilisateur existe déjà`);
        }
        
        // Vérifier si le Supplier existe déjà
        let supplier = await Supplier.findOne({ email: supplierData.email });
        
        if (!supplier) {
          // Créer le Supplier
          supplier = await Supplier.create({
          name: supplierData.businessName,
          contact: supplierData.contact,
          email: supplierData.email,
          phone: supplierData.phone,
          address: supplierData.address,
          categories: supplierData.categories,
          type: supplierData.type,
          status: 'active',
          groupId: group._id,
          createdBy: user._id
        });
        createdSuppliers++;
        console.log(`   ✅ Supplier créé pour ${supplierData.businessName}`);
        
        // Lier le supplierId à l'utilisateur si nécessaire
        if (!user.supplierId) {
          user.supplierId = supplier._id;
          await user.save();
        }
        } else {
          console.log(`   ⏭️  Supplier existe déjà pour ${supplierData.businessName}`);
        }
        
        // Vérifier combien de produits existent déjà pour ce fournisseur
        const existingProductsCount = await Product.countDocuments({ supplier: user._id });
        
        // Obtenir les produits pour ce fournisseur
        const products = getProductsForSupplier(supplierData.categories, i);
        
        // Créer les produits dans le modèle Product seulement s'ils n'existent pas
        if (existingProductsCount === 0) {
          for (const productData of products) {
            await Product.create({
            name: productData.name,
            category: productData.category,
            price: productData.price,
            unit: productData.unit,
            deliveryTime: 2 + (i % 3), // 2, 3 ou 4 jours
            minOrder: productData.unit === 'kg' ? 5 : productData.unit === 'litre' ? 10 : 10,
            supplier: user._id,
            stock: productData.stock,
            stockAlert: Math.floor(productData.stock * 0.2),
            active: true,
            description: `Produit de qualité ${supplierData.businessName}`
            });
            createdProducts++;
          }
          console.log(`   📦 ${products.length} produits créés pour ${supplierData.businessName}`);
        } else {
          console.log(`   ⏭️  ${existingProductsCount} produits existent déjà pour ${supplierData.businessName}`);
        }
        
        // Mettre à jour les produits dans le champ products du Supplier (pour compatibilité)
        // Mapper les unités vers celles acceptées par le modèle Supplier
        const unitMap = {
          'kg': 'kg',
          'g': 'kg', // Convertir g en kg
          'litre': 'L',
          'ml': 'L', // Convertir ml en L
          'pièce': 'pièce',
          'paquet': 'unité',
          'boîte': 'boîte',
          'sachet': 'unité',
          'bouteille': 'unité',
          'portion': 'unité',
          'carton': 'unité'
        };
        
        if (supplier) {
          supplier.products = products.map(p => ({
            name: p.name,
            category: p.category,
            unit: unitMap[p.unit] || 'unité', // Mapper l'unité
            price: p.price,
            stock: p.stock
          }));
          await supplier.save();
        }
        
      } catch (error) {
        console.error(`❌ Erreur pour ${supplierData.businessName}:`, error.message);
      }
    }
    
    console.log('\n' + '='.repeat(100));
    console.log('\n📊 RÉSUMÉ :');
    console.log(`   ✅ Utilisateurs créés : ${createdUsers}`);
    console.log(`   ✅ Suppliers créés : ${createdSuppliers}`);
    console.log(`   ✅ Produits créés : ${createdProducts}`);
    console.log(`   ⏭️  Fournisseurs existants : ${skipped}`);
    console.log(`   📦 Total fournisseurs : ${createdSuppliers + skipped}`);
    
    console.log('\n🔐 INFORMATIONS DE CONNEXION :');
    console.log('   Format : email / mot de passe\n');
    suppliersData.forEach(s => {
      console.log(`   ${s.email.padEnd(35)} / ${s.password}`);
    });
    
    console.log('\n✅ Terminé !\n');
    
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
createSuppliersWithCatalogs();

