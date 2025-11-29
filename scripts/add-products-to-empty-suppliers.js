// scripts/add-products-to-empty-suppliers.js
// Script pour ajouter des produits aux fournisseurs qui n'en ont pas encore

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import Supplier from '../models/Supplier.js';

dotenv.config();

// Connexion à MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/chefses');
    console.log(`✅ MongoDB connecté: ${conn.connection.host}`);
  } catch (error) {
    console.error('❌ Erreur de connexion MongoDB:', error.message);
    process.exit(1);
  }
};

// Produits par type de fournisseur
const productsByType = {
  poissonnier: [
    { name: 'Saumon frais', category: 'poissons', unit: 'kg', price: 18.50, stock: 50 },
    { name: 'Cabillaud', category: 'poissons', unit: 'kg', price: 16.00, stock: 60 },
    { name: 'Merlan', category: 'poissons', unit: 'kg', price: 12.00, stock: 80 },
    { name: 'Daurade', category: 'poissons', unit: 'kg', price: 15.50, stock: 40 },
    { name: 'Bar', category: 'poissons', unit: 'kg', price: 17.00, stock: 35 },
    { name: 'Truite', category: 'poissons', unit: 'kg', price: 14.00, stock: 45 },
    { name: 'Sardines fraîches', category: 'poissons', unit: 'kg', price: 8.50, stock: 100 },
    { name: 'Maquereau', category: 'poissons', unit: 'kg', price: 9.00, stock: 90 },
    { name: 'Thon frais', category: 'poissons', unit: 'kg', price: 20.00, stock: 30 },
    { name: 'Crevettes', category: 'poissons', unit: 'kg', price: 22.00, stock: 40 },
    { name: 'Moules', category: 'poissons', unit: 'kg', price: 6.50, stock: 150 },
    { name: 'Coquilles Saint-Jacques', category: 'poissons', unit: 'kg', price: 28.00, stock: 25 }
  ],
  
  boucher: [
    { name: 'Bœuf haché 5%', category: 'viandes', unit: 'kg', price: 12.00, stock: 100 },
    { name: 'Steak de bœuf', category: 'viandes', unit: 'kg', price: 18.00, stock: 80 },
    { name: 'Rôti de bœuf', category: 'viandes', unit: 'kg', price: 16.50, stock: 60 },
    { name: 'Bœuf braisé', category: 'viandes', unit: 'kg', price: 15.00, stock: 70 },
    { name: 'Porc haché', category: 'viandes', unit: 'kg', price: 10.50, stock: 120 },
    { name: 'Côte de porc', category: 'viandes', unit: 'kg', price: 11.00, stock: 100 },
    { name: 'Rôti de porc', category: 'viandes', unit: 'kg', price: 10.00, stock: 90 },
    { name: 'Épaule d\'agneau', category: 'viandes', unit: 'kg', price: 14.00, stock: 50 },
    { name: 'Gigot d\'agneau', category: 'viandes', unit: 'kg', price: 16.00, stock: 40 },
    { name: 'Veau escalope', category: 'viandes', unit: 'kg', price: 20.00, stock: 45 },
    { name: 'Veau rôti', category: 'viandes', unit: 'kg', price: 18.50, stock: 35 },
    { name: 'Bacon', category: 'viandes', unit: 'kg', price: 13.00, stock: 80 }
  ],
  
  primeur: [
    { name: 'Tomates', category: 'fruits-legumes', unit: 'kg', price: 3.50, stock: 200 },
    { name: 'Carottes', category: 'fruits-legumes', unit: 'kg', price: 2.00, stock: 300 },
    { name: 'Pommes de terre', category: 'fruits-legumes', unit: 'kg', price: 1.80, stock: 500 },
    { name: 'Oignons', category: 'fruits-legumes', unit: 'kg', price: 2.20, stock: 250 },
    { name: 'Courgettes', category: 'fruits-legumes', unit: 'kg', price: 3.00, stock: 150 },
    { name: 'Aubergines', category: 'fruits-legumes', unit: 'kg', price: 4.00, stock: 120 },
    { name: 'Poivrons', category: 'fruits-legumes', unit: 'kg', price: 4.50, stock: 100 },
    { name: 'Brocolis', category: 'fruits-legumes', unit: 'kg', price: 3.80, stock: 180 },
    { name: 'Chou-fleur', category: 'fruits-legumes', unit: 'kg', price: 3.20, stock: 160 },
    { name: 'Épinards', category: 'fruits-legumes', unit: 'kg', price: 4.20, stock: 140 },
    { name: 'Salade verte', category: 'fruits-legumes', unit: 'pièce', price: 1.50, stock: 200 },
    { name: 'Concombres', category: 'fruits-legumes', unit: 'kg', price: 2.80, stock: 180 },
    { name: 'Pommes', category: 'fruits-legumes', unit: 'kg', price: 2.50, stock: 250 },
    { name: 'Poires', category: 'fruits-legumes', unit: 'kg', price: 2.80, stock: 200 },
    { name: 'Oranges', category: 'fruits-legumes', unit: 'kg', price: 2.20, stock: 220 }
  ],
  
  cremier: [
    { name: 'Lait entier', category: 'produits-laitiers', unit: 'L', price: 1.20, stock: 200 },
    { name: 'Lait demi-écrémé', category: 'produits-laitiers', unit: 'L', price: 1.15, stock: 250 },
    { name: 'Crème fraîche 30%', category: 'produits-laitiers', unit: 'L', price: 3.50, stock: 100 },
    { name: 'Crème fraîche 15%', category: 'produits-laitiers', unit: 'L', price: 2.80, stock: 120 },
    { name: 'Beurre', category: 'produits-laitiers', unit: 'kg', price: 6.50, stock: 150 },
    { name: 'Fromage blanc', category: 'produits-laitiers', unit: 'kg', price: 4.50, stock: 120 },
    { name: 'Yaourt nature', category: 'produits-laitiers', unit: 'pièce', price: 0.50, stock: 500 },
    { name: 'Fromage râpé', category: 'produits-laitiers', unit: 'kg', price: 8.00, stock: 80 },
    { name: 'Emmental', category: 'produits-laitiers', unit: 'kg', price: 12.00, stock: 60 },
    { name: 'Camembert', category: 'produits-laitiers', unit: 'pièce', price: 2.50, stock: 100 },
    { name: 'Chèvre', category: 'produits-laitiers', unit: 'pièce', price: 3.00, stock: 80 },
    { name: 'Mozzarella', category: 'produits-laitiers', unit: 'kg', price: 9.50, stock: 70 }
  ],
  
  boulanger: [
    { name: 'Pain de campagne', category: 'boulangerie', unit: 'pièce', price: 2.50, stock: 150 },
    { name: 'Pain blanc', category: 'boulangerie', unit: 'pièce', price: 2.00, stock: 200 },
    { name: 'Pain complet', category: 'boulangerie', unit: 'pièce', price: 2.80, stock: 120 },
    { name: 'Baguette', category: 'boulangerie', unit: 'pièce', price: 1.20, stock: 300 },
    { name: 'Pain de mie', category: 'boulangerie', unit: 'pièce', price: 2.50, stock: 180 },
    { name: 'Croissants', category: 'boulangerie', unit: 'pièce', price: 1.50, stock: 250 },
    { name: 'Pains au chocolat', category: 'boulangerie', unit: 'pièce', price: 1.80, stock: 200 },
    { name: 'Brioches', category: 'boulangerie', unit: 'pièce', price: 2.00, stock: 150 }
  ],
  
  epicier: [
    { name: 'Riz basmati', category: 'epicerie', unit: 'kg', price: 4.50, stock: 200 },
    { name: 'Pâtes spaghetti', category: 'epicerie', unit: 'kg', price: 2.20, stock: 300 },
    { name: 'Huile d\'olive', category: 'epicerie', unit: 'L', price: 8.50, stock: 150 },
    { name: 'Huile de tournesol', category: 'epicerie', unit: 'L', price: 3.20, stock: 200 },
    { name: 'Vinaigre', category: 'epicerie', unit: 'L', price: 2.50, stock: 180 },
    { name: 'Sel', category: 'epicerie', unit: 'kg', price: 1.50, stock: 400 },
    { name: 'Poivre', category: 'epicerie', unit: 'kg', price: 15.00, stock: 50 },
    { name: 'Farine T55', category: 'epicerie', unit: 'kg', price: 1.80, stock: 300 },
    { name: 'Sucre blanc', category: 'epicerie', unit: 'kg', price: 2.20, stock: 250 },
    { name: 'Bouillon cube', category: 'epicerie', unit: 'pièce', price: 0.15, stock: 1000 },
    { name: 'Sauce tomate', category: 'epicerie', unit: 'boîte', price: 1.80, stock: 500 },
    { name: 'Lentilles', category: 'epicerie', unit: 'kg', price: 3.50, stock: 200 }
  ],
  
  grossiste: [
    { name: 'Assortiment viandes', category: 'viandes', unit: 'kg', price: 14.00, stock: 500 },
    { name: 'Assortiment poissons', category: 'poissons', unit: 'kg', price: 15.00, stock: 400 },
    { name: 'Assortiment légumes', category: 'fruits-legumes', unit: 'kg', price: 2.50, stock: 1000 },
    { name: 'Assortiment produits laitiers', category: 'produits-laitiers', unit: 'kg', price: 5.00, stock: 600 },
    { name: 'Assortiment épicerie', category: 'epicerie', unit: 'kg', price: 3.00, stock: 800 },
    { name: 'Assortiment boulangerie', category: 'boulangerie', unit: 'pièce', price: 2.00, stock: 1000 }
  ]
};

// Produits par catégorie (si le type n'est pas défini)
const productsByCategory = {
  'legumes': productsByType.primeur.filter(p => p.category === 'fruits-legumes'),
  'viandes': productsByType.boucher,
  'poissons': productsByType.poissonnier,
  'produits-laitiers': productsByType.cremier,
  'cereales': productsByType.epicier.filter(p => ['Riz basmati', 'Pâtes spaghetti', 'Farine T55'].includes(p.name)),
  'epices': productsByType.epicier.filter(p => ['Sel', 'Poivre'].includes(p.name)),
  'boissons': [
    { name: 'Eau minérale', category: 'boissons', unit: 'L', price: 0.80, stock: 500 },
    { name: 'Jus d\'orange', category: 'boissons', unit: 'L', price: 2.50, stock: 200 },
    { name: 'Jus de pomme', category: 'boissons', unit: 'L', price: 2.20, stock: 180 },
    { name: 'Café', category: 'boissons', unit: 'kg', price: 12.00, stock: 100 },
    { name: 'Thé', category: 'boissons', unit: 'kg', price: 15.00, stock: 80 }
  ]
};

// Fonction pour détecter le type de fournisseur basé sur le nom
function detectSupplierType(supplier) {
  const name = supplier.name.toLowerCase();
  
  // Détection basée sur les mots-clés dans le nom
  if (name.includes('poisson') || name.includes('marée') || name.includes('océan') || name.includes('sardine') || name.includes('mer')) {
    return 'poissonnier';
  }
  if (name.includes('boucher') || name.includes('viande') || name.includes('viandes')) {
    return 'boucher';
  }
  if (name.includes('primeur') || name.includes('maraîcher') || name.includes('maraicher') || name.includes('fruits') || name.includes('légumes') || name.includes('legumes')) {
    return 'primeur';
  }
  if (name.includes('fromager') || name.includes('crémier') || name.includes('cremier') || name.includes('laitier')) {
    return 'cremier';
  }
  if (name.includes('boulang') || name.includes('fournil') || name.includes('pâtiss') || name.includes('patiss')) {
    return 'boulanger';
  }
  if (name.includes('épicerie') || name.includes('epicerie') || name.includes('épicier') || name.includes('epicier')) {
    return 'epicier';
  }
  if (name.includes('grossiste') || name.includes('metro') || name.includes('biogros')) {
    return 'grossiste';
  }
  if (name.includes('volaille') || name.includes('poulet')) {
    return 'boucher'; // Les volaillers sont des bouchers spécialisés
  }
  if (name.includes('surgelé') || name.includes('surgel')) {
    return 'grossiste'; // Les surgelés sont souvent des grossistes
  }
  if (name.includes('boisson')) {
    return 'epicier'; // Les boissons sont souvent dans les épiceries
  }
  
  return null; // Type non détecté
}

// Fonction pour obtenir les produits appropriés pour un fournisseur
function getProductsForSupplier(supplier) {
  // D'abord, essayer d'utiliser le type défini dans la base
  if (supplier.type && productsByType[supplier.type]) {
    return productsByType[supplier.type];
  }
  
  // Ensuite, essayer de détecter le type depuis le nom
  const detectedType = detectSupplierType(supplier);
  if (detectedType && productsByType[detectedType]) {
    console.log(`   🔍 Type détecté depuis le nom: ${detectedType}`);
    return productsByType[detectedType];
  }
  
  // Sinon, utiliser les catégories du fournisseur
  if (supplier.categories && supplier.categories.length > 0) {
    const products = [];
    supplier.categories.forEach(category => {
      if (productsByCategory[category]) {
        products.push(...productsByCategory[category]);
      }
    });
    
    // Si on a trouvé des produits, les retourner (limiter à 15 pour éviter trop de produits)
    if (products.length > 0) {
      return products.slice(0, 15);
    }
  }
  
  // Fallback : produits génériques d'épicerie
  return productsByType.epicier;
}

// Fonction principale
async function addProductsToEmptySuppliers() {
  try {
    await connectDB();
    
    console.log('\n' + '='.repeat(80));
    console.log('📦 AJOUT DE PRODUITS AUX FOURNISSEURS SANS PRODUITS');
    console.log('='.repeat(80) + '\n');
    
    // Récupérer tous les fournisseurs actifs sans produits
    const suppliers = await Supplier.find({ 
      status: 'active',
      $or: [
        { products: { $exists: false } },
        { products: { $size: 0 } }
      ]
    });
    
    console.log(`📊 ${suppliers.length} fournisseur(s) sans produits trouvé(s)\n`);
    
    if (suppliers.length === 0) {
      console.log('✅ Tous les fournisseurs ont déjà des produits !\n');
      await mongoose.connection.close();
      return;
    }
    
    let totalSuppliersUpdated = 0;
    let totalProductsAdded = 0;
    
    for (const supplier of suppliers) {
      console.log(`\n📦 Traitement de: ${supplier.name}`);
      console.log(`   Type enregistré: ${supplier.type || 'non défini'}`);
      console.log(`   Catégories: ${supplier.categories?.join(', ') || 'aucune'}`);
      
      // Obtenir les produits appropriés
      const products = getProductsForSupplier(supplier);
      
      // Mettre à jour le type du fournisseur si détecté et différent
      const detectedType = detectSupplierType(supplier);
      if (detectedType && detectedType !== supplier.type) {
        supplier.type = detectedType;
        console.log(`   ✏️  Type mis à jour: ${detectedType}`);
      }
      
      if (products.length === 0) {
        console.log(`   ⚠️  Aucun produit disponible pour ce type/catégorie`);
        continue;
      }
      
      // Ajouter les produits au fournisseur
      supplier.products = products.map(p => ({
        name: p.name,
        category: p.category,
        unit: p.unit,
        price: p.price,
        stock: p.stock,
        promotion: {
          active: false
        }
      }));
      
      await supplier.save();
      
      totalSuppliersUpdated++;
      totalProductsAdded += products.length;
      
      console.log(`   ✅ ${products.length} produit(s) ajouté(s)`);
      console.log(`   Exemples: ${products.slice(0, 3).map(p => p.name).join(', ')}${products.length > 3 ? '...' : ''}`);
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(80));
    console.log(`   Fournisseurs traités: ${suppliers.length}`);
    console.log(`   Fournisseurs mis à jour: ${totalSuppliersUpdated}`);
    console.log(`   Produits ajoutés: ${totalProductsAdded}`);
    console.log('='.repeat(80) + '\n');
    
    if (totalSuppliersUpdated > 0) {
      console.log('✅ Produits ajoutés avec succès !\n');
    } else {
      console.log('⚠️  Aucun produit n\'a pu être ajouté\n');
    }
    
    await mongoose.connection.close();
    console.log('✅ Connexion MongoDB fermée');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Exécuter le script
addProductsToEmptySuppliers();

