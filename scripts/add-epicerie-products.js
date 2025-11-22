// scripts/add-epicerie-products.js
// Ajoute des produits d'épicerie (riz, pâtes, sauce tomate, bouillons, vrac) 
// au fournisseur biogros et à d'autres fournisseurs avec des prix différents et promotions

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Product from '../models/Product.js';

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

// Produits d'épicerie à ajouter
// Note: Les catégories doivent correspondre au modèle Product: 'fruits-legumes', 'viandes', 'poissons', 'epicerie', 'boissons', 'produits-laitiers', 'boulangerie', 'autres'
const epicerieProducts = [
  // Riz
  { name: 'Riz basmati', category: 'epicerie', unit: 'kg', basePrice: 4.50, stock: 200 },
  { name: 'Riz long grain', category: 'epicerie', unit: 'kg', basePrice: 3.80, stock: 250 },
  { name: 'Riz complet bio', category: 'epicerie', unit: 'kg', basePrice: 5.20, stock: 150 },
  { name: 'Riz rond', category: 'epicerie', unit: 'kg', basePrice: 3.50, stock: 180 },
  { name: 'Riz thaï', category: 'epicerie', unit: 'kg', basePrice: 4.80, stock: 120 },
  
  // Pâtes de toutes sortes
  { name: 'Pâtes spaghetti', category: 'epicerie', unit: 'kg', basePrice: 2.20, stock: 300 },
  { name: 'Pâtes penne', category: 'epicerie', unit: 'kg', basePrice: 2.30, stock: 280 },
  { name: 'Pâtes fusilli', category: 'epicerie', unit: 'kg', basePrice: 2.40, stock: 250 },
  { name: 'Pâtes tagliatelles', category: 'epicerie', unit: 'kg', basePrice: 2.50, stock: 200 },
  { name: 'Pâtes coquillettes', category: 'epicerie', unit: 'kg', basePrice: 2.20, stock: 300 },
  { name: 'Pâtes complètes', category: 'epicerie', unit: 'kg', basePrice: 2.80, stock: 180 },
  { name: 'Pâtes bio', category: 'epicerie', unit: 'kg', basePrice: 3.50, stock: 150 },
  { name: 'Pâtes sans gluten', category: 'epicerie', unit: 'kg', basePrice: 5.90, stock: 100 },
  
  // Sauce tomate
  { name: 'Sauce tomate (boîte 400g)', category: 'epicerie', unit: 'boîte', basePrice: 1.80, stock: 500 },
  { name: 'Sauce tomate (boîte 800g)', category: 'epicerie', unit: 'boîte', basePrice: 3.20, stock: 400 },
  { name: 'Coulis de tomate', category: 'epicerie', unit: 'L', basePrice: 4.50, stock: 200 },
  { name: 'Tomates pelées (boîte 400g)', category: 'epicerie', unit: 'boîte', basePrice: 2.20, stock: 450 },
  { name: 'Concentré de tomate', category: 'epicerie', unit: 'kg', basePrice: 6.50, stock: 150 },
  
  // Bouillons
  { name: 'Bouillon de légumes (cube)', category: 'epicerie', unit: 'pièce', basePrice: 0.15, stock: 1000 },
  { name: 'Bouillon de volaille (cube)', category: 'epicerie', unit: 'pièce', basePrice: 0.18, stock: 800 },
  { name: 'Bouillon de bœuf (cube)', category: 'epicerie', unit: 'pièce', basePrice: 0.20, stock: 700 },
  { name: 'Bouillon de poisson (cube)', category: 'epicerie', unit: 'pièce', basePrice: 0.22, stock: 500 },
  { name: 'Bouillon de légumes (liquide)', category: 'epicerie', unit: 'L', basePrice: 3.50, stock: 200 },
  { name: 'Bouillon de volaille (liquide)', category: 'epicerie', unit: 'L', basePrice: 4.20, stock: 180 },
  
  // Autres vrac d'épicerie
  { name: 'Lentilles vertes', category: 'epicerie', unit: 'kg', basePrice: 3.50, stock: 200 },
  { name: 'Lentilles corail', category: 'epicerie', unit: 'kg', basePrice: 4.20, stock: 150 },
  { name: 'Pois chiches', category: 'epicerie', unit: 'kg', basePrice: 3.80, stock: 180 },
  { name: 'Haricots rouges', category: 'epicerie', unit: 'kg', basePrice: 4.00, stock: 160 },
  { name: 'Haricots blancs', category: 'epicerie', unit: 'kg', basePrice: 3.90, stock: 170 },
  { name: 'Quinoa', category: 'epicerie', unit: 'kg', basePrice: 8.50, stock: 100 },
  { name: 'Boulgour', category: 'epicerie', unit: 'kg', basePrice: 4.50, stock: 120 },
  { name: 'Semoule', category: 'epicerie', unit: 'kg', basePrice: 2.80, stock: 200 },
  { name: 'Farine T55', category: 'epicerie', unit: 'kg', basePrice: 1.80, stock: 400 },
  { name: 'Farine complète', category: 'epicerie', unit: 'kg', basePrice: 2.50, stock: 250 },
  { name: 'Sucre blanc', category: 'epicerie', unit: 'kg', basePrice: 2.00, stock: 500 },
  { name: 'Sel fin', category: 'epicerie', unit: 'kg', basePrice: 1.50, stock: 600 },
  { name: 'Huile de tournesol', category: 'epicerie', unit: 'L', basePrice: 3.20, stock: 300 },
  { name: 'Huile d\'olive', category: 'epicerie', unit: 'L', basePrice: 8.50, stock: 200 },
  { name: 'Vinaigre blanc', category: 'epicerie', unit: 'L', basePrice: 2.50, stock: 250 }
];

// Configuration des fournisseurs avec variations de prix et promotions
const suppliersConfig = [
  {
    name: 'biogros',
    nameVariations: ['biogros', 'Biogros', 'BIOGROS', 'Bio Gros'],
    priceMultiplier: 1.0, // Prix de base
    stockMultiplier: 1.0,
    promotions: [
      { productName: 'Riz basmati', discountPercent: 15, days: 7 },
      { productName: 'Pâtes spaghetti', discountPercent: 20, days: 5 },
      { productName: 'Sauce tomate (boîte 400g)', discountPercent: 25, days: 3 },
      { productName: 'Bouillon de légumes (cube)', discountPercent: 30, days: 10 },
      { productName: 'Lentilles vertes', discountPercent: 10, days: 7 }
    ]
  },
  {
    name: 'Épicerie Fine Maison Dandoy',
    nameVariations: ['Épicerie Fine Maison Dandoy', 'Maison Dandoy', 'Dandoy'],
    priceMultiplier: 1.15, // +15% plus cher
    stockMultiplier: 0.8,
    promotions: [
      { productName: 'Pâtes bio', discountPercent: 12, days: 14 },
      { productName: 'Huile d\'olive', discountPercent: 15, days: 7 }
    ]
  },
  {
    name: 'Bio Planet',
    nameVariations: ['Bio Planet', 'Bio Planet - Épicerie Biologique', 'BioPlanet'],
    priceMultiplier: 1.25, // +25% plus cher (bio)
    stockMultiplier: 0.7,
    promotions: [
      { productName: 'Riz complet bio', discountPercent: 20, days: 7 },
      { productName: 'Pâtes bio', discountPercent: 18, days: 10 },
      { productName: 'Quinoa', discountPercent: 15, days: 5 }
    ]
  },
  {
    name: 'Grossiste Metro',
    nameVariations: ['Grossiste Metro', 'Metro', 'METRO'],
    priceMultiplier: 0.85, // -15% moins cher (grossiste)
    stockMultiplier: 1.5,
    promotions: [
      { productName: 'Pâtes spaghetti', discountPercent: 10, days: 7 },
      { productName: 'Riz long grain', discountPercent: 12, days: 5 },
      { productName: 'Farine T55', discountPercent: 15, days: 10 }
    ]
  },
  {
    name: 'Épicerie du Marché',
    nameVariations: ['Épicerie du Marché', 'Epicerie du Marche'],
    priceMultiplier: 0.95, // -5% moins cher
    stockMultiplier: 1.2,
    promotions: [
      { productName: 'Bouillon de volaille (cube)', discountPercent: 25, days: 7 },
      { productName: 'Sauce tomate (boîte 800g)', discountPercent: 20, days: 5 }
    ]
  }
];

async function addEpicerieProducts() {
  try {
    await connectDB();
    
    console.log('🛒 Ajout des produits d\'épicerie aux fournisseurs...\n');
    
    for (const supplierConfig of suppliersConfig) {
      // Chercher le fournisseur
      let supplier = null;
      for (const nameVar of supplierConfig.nameVariations) {
        supplier = await Supplier.findOne({ 
          $or: [
            { name: { $regex: new RegExp(nameVar, 'i') } },
            { contact: { $regex: new RegExp(nameVar, 'i') } }
          ]
        });
        if (supplier) break;
      }
      
      if (!supplier) {
        console.log(`⚠️  Fournisseur "${supplierConfig.name}" non trouvé, création...`);
        
        // Créer le fournisseur s'il n'existe pas
        // Normaliser le nom pour l'email (supprimer accents et caractères spéciaux)
        const normalizeForEmail = (str) => {
          return str
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '') // Supprimer les accents
            .replace(/[^a-z0-9]/g, '') // Garder seulement lettres et chiffres
            .substring(0, 30); // Limiter la longueur
        };
        
        const emailBase = normalizeForEmail(supplierConfig.name);
        const email = `${emailBase}@fournisseur.com`;
        
        const user = await User.findOne({ email: email });
        let supplierUser = user;
        
        if (!supplierUser) {
          supplierUser = await User.create({
            name: supplierConfig.name,
            email: email,
            password: emailBase,
            role: 'fournisseur'
          });
        }
        
        supplier = await Supplier.create({
          name: supplierConfig.name,
          contact: supplierConfig.name,
          email: supplierUser.email,
          phone: '+32 2 000 00 00',
          address: {
            street: 'Adresse à compléter',
            city: 'Bruxelles',
            postalCode: '1000',
            country: 'Belgique'
          },
          categories: ['cereales', 'epices'], // Pour Supplier, on garde cereales et epices
          type: supplierConfig.name.includes('Grossiste') || supplierConfig.name.includes('Metro') ? 'grossiste' : 'epicier',
          isBio: supplierConfig.name.includes('Bio'),
          status: 'active',
          createdBy: supplierUser._id
        });
        
        console.log(`✅ Fournisseur "${supplierConfig.name}" créé`);
      }
      
      console.log(`\n📦 Traitement de "${supplier.name}"...`);
      
      // Récupérer l'utilisateur du fournisseur
      const supplierUser = await User.findById(supplier.createdBy) || 
                          await User.findOne({ email: supplier.email });
      
      if (!supplierUser) {
        console.log(`⚠️  Utilisateur non trouvé pour ${supplier.name}, passage au suivant...`);
        continue;
      }
      
      let addedCount = 0;
      let updatedCount = 0;
      
      for (const productData of epicerieProducts) {
        // Calculer le prix avec le multiplicateur
        const price = Math.round((productData.basePrice * supplierConfig.priceMultiplier) * 100) / 100;
        const stock = Math.floor(productData.stock * supplierConfig.stockMultiplier);
        
        // Vérifier si le produit existe déjà dans Supplier.products
        const existingProductIndex = supplier.products.findIndex(
          p => p.name.toLowerCase() === productData.name.toLowerCase()
        );
        
        // Vérifier si une promotion est configurée pour ce produit
        const promotionConfig = supplierConfig.promotions.find(
          p => p.productName === productData.name
        );
        
        let promotion = { active: false };
        if (promotionConfig) {
          promotion = {
            active: true,
            discountPercent: promotionConfig.discountPercent,
            endDate: new Date(Date.now() + promotionConfig.days * 24 * 60 * 60 * 1000)
          };
        }
        
        if (existingProductIndex >= 0) {
          // Mettre à jour le produit existant
          supplier.products[existingProductIndex] = {
            name: productData.name,
            category: productData.category,
            unit: productData.unit,
            price: price,
            stock: stock,
            promotion: promotion
          };
          updatedCount++;
        } else {
          // Ajouter le nouveau produit
          supplier.products.push({
            name: productData.name,
            category: productData.category,
            unit: productData.unit,
            price: price,
            stock: stock,
            promotion: promotion
          });
          addedCount++;
        }
        
        // Créer ou mettre à jour dans le modèle Product
        // Mapping des unités: Product accepte 'kg', 'g', 'litre', 'ml', 'pièce', 'paquet', 'boîte', 'sachet', 'bouteille', 'portion', 'carton'
        const productUnitMap = {
          'kg': 'kg',
          'L': 'litre',
          'boîte': 'boîte',
          'unité': 'pièce',
          'pièce': 'pièce'
        };
        
        const productUnit = productUnitMap[productData.unit] || 'pièce';
        
        // Pour le modèle Product, utiliser 'epicerie' comme catégorie
        const productCategory = 'epicerie'; // Tous les produits d'épicerie utilisent cette catégorie
        
        let product = await Product.findOne({
          name: productData.name,
          supplier: supplierUser._id
        });
        
        if (product) {
          product.price = price;
          product.stock = stock;
          product.active = true;
          product.category = productCategory; // S'assurer que la catégorie est correcte
          if (promotion.active) {
            product.promo = promotion.discountPercent;
            product.superPromo = {
              active: true,
              promoPrice: Math.round((price * (1 - promotion.discountPercent / 100)) * 100) / 100,
              promoQuantity: 1,
              endDate: promotion.endDate
            };
          }
          await product.save();
        } else {
          await Product.create({
            name: productData.name,
            category: productCategory, // Utiliser 'epicerie' pour Product
            price: price,
            unit: productUnit,
            deliveryTime: 2,
            minOrder: productData.unit === 'kg' ? 5 : productData.unit === 'L' ? 10 : 10,
            supplier: supplierUser._id,
            stock: stock,
            stockAlert: Math.floor(stock * 0.2),
            active: true,
            description: `Produit d'épicerie de qualité`,
            promo: promotion.active ? promotion.discountPercent : 0,
            superPromo: promotion.active ? {
              active: true,
              promoPrice: Math.round((price * (1 - promotion.discountPercent / 100)) * 100) / 100,
              promoQuantity: 1,
              endDate: promotion.endDate
            } : { active: false }
          });
        }
      }
      
      // Sauvegarder le fournisseur avec les produits mis à jour
      await supplier.save();
      
      console.log(`   ✅ ${addedCount} produits ajoutés, ${updatedCount} produits mis à jour`);
      console.log(`   💰 Prix moyen: ${(epicerieProducts[0].basePrice * supplierConfig.priceMultiplier).toFixed(2)}€ (x${supplierConfig.priceMultiplier})`);
      if (supplierConfig.promotions.length > 0) {
        console.log(`   🎁 ${supplierConfig.promotions.length} promotion(s) active(s)`);
      }
    }
    
    console.log('\n✅ Ajout des produits d\'épicerie terminé !');
    process.exit(0);
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

addEpicerieProducts();

