// scripts/seed-suppliers.js
// Génère 15 fournisseurs variés avec produits, prix et promotions

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

import Supplier from '../models/Supplier.js';
import Group from '../models/Group.js';

// Données des fournisseurs
const suppliersData = [
  {
    name: "Poissonnerie La Mer du Nord",
    type: "poissonnier",
    contact: "Jean Dupont",
    email: "contact@mersdunord.be",
    phone: "+32 2 456 78 90",
    address: {
      street: "Quai aux Briques 45",
      city: "Bruxelles",
      postalCode: "10000",
      country: "Belgique"
    },
    categories: ['poissons'],
    isBio: false,
    products: [
      { name: "Saumon frais (filet)", category: "poissons", unit: "kg", price: 18.50, stock: 50, promotion: { active: true, discountPercent: 15, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
      { name: "Cabillaud frais", category: "poissons", unit: "kg", price: 14.90, stock: 40 },
      { name: "Truite arc-en-ciel", category: "poissons", unit: "kg", price: 12.50, stock: 30 },
      { name: "Moules fraîches", category: "fruits-de-mer", unit: "kg", price: 3.90, stock: 100, promotion: { active: true, discountPercent: 20, endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } },
      { name: "Crevettes grises", category: "fruits-de-mer", unit: "kg", price: 22.00, stock: 25 },
      { name: "Sole (entière)", category: "poissons", unit: "kg", price: 28.00, stock: 15 },
      { name: "Thon frais", category: "poissons", unit: "kg", price: 19.90, stock: 20 }
    ]
  },
  {
    name: "Boucherie Artisanale Leroy",
    type: "boucher",
    contact: "Marc Leroy",
    email: "info@boucherieleroy.be",
    phone: "+32 2 234 56 78",
    address: {
      street: "Rue de la Boucherie 12",
      city: "Bruxelles",
      postalCode: "10000",
      country: "Belgique"
    },
    categories: ['viandes'],
    isBio: false,
    products: [
      { name: "Bœuf (entrecôte)", category: "viandes", unit: "kg", price: 22.50, stock: 80 },
      { name: "Porc (filet)", category: "viandes", unit: "kg", price: 9.90, stock: 100 },
      { name: "Poulet fermier (entier)", category: "volailles", unit: "kg", price: 7.50, stock: 150, promotion: { active: true, discountPercent: 10, endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) } },
      { name: "Veau (escalope)", category: "viandes", unit: "kg", price: 24.00, stock: 40 },
      { name: "Agneau (gigot)", category: "viandes", unit: "kg", price: 18.50, stock: 35 },
      { name: "Canard (magret)", category: "volailles", unit: "kg", price: 16.90, stock: 25 },
      { name: "Lapin (entier)", category: "viandes", unit: "kg", price: 11.50, stock: 30 }
    ]
  },
  {
    name: "Bio Viandes Delhaize",
    type: "boucher",
    contact: "Sophie Martin",
    email: "bio@viandesdelhaize.be",
    phone: "+32 2 345 67 89",
    address: {
      street: "Avenue Louise 234",
      city: "Bruxelles",
      postalCode: "10500",
      country: "Belgique"
    },
    categories: ['viandes'],
    isBio: true,
    products: [
      { name: "Bœuf bio (bavette)", category: "viandes", unit: "kg", price: 28.00, stock: 50 },
      { name: "Porc bio (côtelettes)", category: "viandes", unit: "kg", price: 14.50, stock: 60 },
      { name: "Poulet bio (filet)", category: "volailles", unit: "kg", price: 13.90, stock: 80, promotion: { active: true, discountPercent: 12, endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) } },
      { name: "Dinde bio (escalope)", category: "volailles", unit: "kg", price: 15.50, stock: 40 },
      { name: "Bœuf bio haché", category: "viandes", unit: "kg", price: 16.90, stock: 70 }
    ]
  },
  {
    name: "Épicerie Fine Maison Dandoy",
    type: "epicier",
    contact: "Pierre Dandoy",
    email: "contact@maisondandoy.be",
    phone: "+32 2 456 12 34",
    address: {
      street: "Rue au Beurre 31",
      city: "Bruxelles",
      postalCode: "10000",
      country: "Belgique"
    },
    categories: ['cereales', 'epices'],
    isBio: false,
    products: [
      { name: "Huile d'olive extra vierge", category: "epicerie", unit: "L", price: 12.50, stock: 100 },
      { name: "Vinaigre balsamique", category: "epicerie", unit: "L", price: 8.90, stock: 80, promotion: { active: true, discountPercent: 15, endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) } },
      { name: "Miel artisanal", category: "epicerie", unit: "kg", price: 15.00, stock: 50 },
      { name: "Confiture maison (fraise)", category: "epicerie", unit: "kg", price: 9.50, stock: 60 },
      { name: "Pâtes italiennes", category: "feculents", unit: "kg", price: 3.50, stock: 200 },
      { name: "Riz basmati", category: "feculents", unit: "kg", price: 4.20, stock: 150 },
      { name: "Farine blanche T55", category: "epicerie", unit: "kg", price: 1.80, stock: 300 }
    ]
  },
  {
    name: "Bio Planet - Épicerie Biologique",
    type: "epicier",
    contact: "Claire Bernard",
    email: "info@bioplanet.be",
    phone: "+32 2 567 89 01",
    address: {
      street: "Chaussée de Wavre 678",
      city: "Bruxelles",
      postalCode: "10400",
      country: "Belgique"
    },
    categories: ['cereales', 'legumes'],
    isBio: true,
    products: [
      { name: "Quinoa bio", category: "feculents", unit: "kg", price: 8.50, stock: 100, promotion: { active: true, discountPercent: 20, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
      { name: "Lentilles bio", category: "legumineuses", unit: "kg", price: 5.90, stock: 120 },
      { name: "Pois chiches bio", category: "legumineuses", unit: "kg", price: 4.50, stock: 100 },
      { name: "Huile de coco bio", category: "epicerie", unit: "L", price: 14.90, stock: 60 },
      { name: "Sucre de canne bio", category: "epicerie", unit: "kg", price: 3.20, stock: 150 },
      { name: "Farine d'épeautre bio", category: "epicerie", unit: "kg", price: 3.80, stock: 80 },
      { name: "Pâtes complètes bio", category: "feculents", unit: "kg", price: 4.50, stock: 90 }
    ]
  },
  {
    name: "Maraîcher des Halles",
    type: "primeur",
    contact: "François Dubois",
    email: "contact@maraicherdeshalles.be",
    phone: "+32 2 678 90 12",
    address: {
      street: "Place Sainte-Catherine 8",
      city: "Bruxelles",
      postalCode: "10000",
      country: "Belgique"
    },
    categories: ['legumes'],
    isBio: false,
    products: [
      { name: "Tomates", category: "legumes", unit: "kg", price: 2.50, stock: 200, promotion: { active: true, discountPercent: 25, endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000) } },
      { name: "Carottes", category: "legumes", unit: "kg", price: 1.80, stock: 250 },
      { name: "Pommes de terre", category: "legumes", unit: "kg", price: 1.20, stock: 500 },
      { name: "Courgettes", category: "legumes", unit: "kg", price: 2.90, stock: 150 },
      { name: "Poivrons", category: "legumes", unit: "kg", price: 3.50, stock: 100 },
      { name: "Pommes (Golden)", category: "fruits", unit: "kg", price: 2.20, stock: 300 },
      { name: "Bananes", category: "fruits", unit: "kg", price: 1.90, stock: 200, promotion: { active: true, discountPercent: 15, endDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000) } },
      { name: "Oranges", category: "fruits", unit: "kg", price: 2.50, stock: 180 }
    ]
  },
  {
    name: "Bio Légumes du Terroir",
    type: "primeur",
    contact: "Marie Lejeune",
    email: "bio@legumesterroir.be",
    phone: "+32 2 789 01 23",
    address: {
      street: "Rue du Marché 45",
      city: "Waterloo",
      postalCode: "14100",
      country: "Belgique"
    },
    categories: ['legumes'],
    isBio: true,
    products: [
      { name: "Tomates bio", category: "legumes", unit: "kg", price: 4.50, stock: 120 },
      { name: "Carottes bio", category: "legumes", unit: "kg", price: 2.80, stock: 150, promotion: { active: true, discountPercent: 10, endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) } },
      { name: "Pommes de terre bio", category: "legumes", unit: "kg", price: 2.20, stock: 300 },
      { name: "Brocoli bio", category: "legumes", unit: "kg", price: 3.90, stock: 80 },
      { name: "Épinards bio", category: "legumes", unit: "kg", price: 4.50, stock: 60 },
      { name: "Salades bio (batavia)", category: "legumes", unit: "pièce", price: 1.50, stock: 100 }
    ]
  },
  {
    name: "Fromagerie Artisanale Dubois",
    type: "cremier",
    contact: "Antoine Dubois",
    email: "info@fromageriedubois.be",
    phone: "+32 2 890 12 34",
    address: {
      street: "Rue des Fromagers 23",
      city: "Bruxelles",
      postalCode: "10000",
      country: "Belgique"
    },
    categories: ['produits-laitiers'],
    isBio: false,
    products: [
      { name: "Brie de Meaux", category: "produits-laitiers", unit: "kg", price: 18.50, stock: 40 },
      { name: "Camembert", category: "produits-laitiers", unit: "kg", price: 16.00, stock: 50, promotion: { active: true, discountPercent: 15, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
      { name: "Comté 12 mois", category: "produits-laitiers", unit: "kg", price: 22.00, stock: 35 },
      { name: "Mozzarella", category: "produits-laitiers", unit: "kg", price: 12.50, stock: 60 },
      { name: "Beurre fermier", category: "produits-laitiers", unit: "kg", price: 8.90, stock: 80 },
      { name: "Crème fraîche", category: "produits-laitiers", unit: "L", price: 4.50, stock: 100 },
      { name: "Yaourt nature", category: "produits-laitiers", unit: "L", price: 3.20, stock: 120 }
    ]
  },
  {
    name: "Boulangerie Pâtisserie Le Fournil",
    type: "boulanger",
    contact: "Thomas Lefèvre",
    email: "contact@lefournil.be",
    phone: "+32 2 901 23 45",
    address: {
      street: "Rue du Pain 56",
      city: "Bruxelles",
      postalCode: "10000",
      country: "Belgique"
    },
    categories: ['cereales'],
    isBio: false,
    products: [
      { name: "Pain blanc (baguette)", category: "boulangerie", unit: "pièce", price: 1.20, stock: 300 },
      { name: "Pain complet", category: "boulangerie", unit: "kg", price: 3.50, stock: 150, promotion: { active: true, discountPercent: 10, endDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) } },
      { name: "Pain de mie", category: "boulangerie", unit: "pièce", price: 2.80, stock: 200 },
      { name: "Croissants", category: "viennoiseries", unit: "pièce", price: 1.50, stock: 250 },
      { name: "Pains au chocolat", category: "viennoiseries", unit: "pièce", price: 1.80, stock: 200 }
    ]
  },
  {
    name: "Saveurs d'Orient",
    type: "epicier",
    contact: "Yasmine El Fassi",
    email: "contact@saveursdorient.be",
    phone: "+32 2 012 34 56",
    address: {
      street: "Rue de la Régence 89",
      city: "Bruxelles",
      postalCode: "10000",
      country: "Belgique"
    },
    categories: ['epices'],
    isBio: false,
    products: [
      { name: "Cumin moulu", category: "epices", unit: "kg", price: 12.00, stock: 50 },
      { name: "Paprika doux", category: "epices", unit: "kg", price: 10.50, stock: 60, promotion: { active: true, discountPercent: 20, endDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) } },
      { name: "Curry en poudre", category: "epices", unit: "kg", price: 14.00, stock: 40 },
      { name: "Poivre noir", category: "epices", unit: "kg", price: 18.50, stock: 45 },
      { name: "Cannelle bâtons", category: "epices", unit: "kg", price: 22.00, stock: 30 },
      { name: "Sel de Guérande", category: "condiments", unit: "kg", price: 3.50, stock: 200 },
      { name: "Moutarde de Dijon", category: "condiments", unit: "kg", price: 6.50, stock: 100 }
    ]
  },
  {
    name: "Conserverie du Sud",
    type: "grossiste",
    contact: "Luc Moreau",
    email: "info@conserveriedusud.be",
    phone: "+32 2 123 45 67",
    address: {
      street: "Boulevard du Midi 234",
      city: "Charleroi",
      postalCode: "60000",
      country: "Belgique"
    },
    categories: ['autres'],
    isBio: false,
    products: [
      { name: "Tomates pelées (conserve)", category: "conserves", unit: "kg", price: 2.50, stock: 500, promotion: { active: true, discountPercent: 18, endDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000) } },
      { name: "Haricots verts (conserve)", category: "conserves", unit: "kg", price: 2.80, stock: 400 },
      { name: "Maïs doux (conserve)", category: "conserves", unit: "kg", price: 2.20, stock: 350 },
      { name: "Pois chiches (conserve)", category: "conserves", unit: "kg", price: 2.90, stock: 300 },
      { name: "Thon au naturel (conserve)", category: "conserves", unit: "kg", price: 8.50, stock: 200 }
    ]
  },
  {
    name: "Fruits Exotiques Import",
    type: "primeur",
    contact: "Ahmed Ben Ali",
    email: "contact@fruitsexotiques.be",
    phone: "+32 2 234 56 78",
    address: {
      street: "Quai du Commerce 12",
      city: "Anvers",
      postalCode: "20000",
      country: "Belgique"
    },
    categories: ['legumes'],
    isBio: false,
    products: [
      { name: "Mangues", category: "fruits", unit: "kg", price: 4.50, stock: 100 },
      { name: "Ananas", category: "fruits", unit: "pièce", price: 2.80, stock: 120, promotion: { active: true, discountPercent: 15, endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000) } },
      { name: "Papayes", category: "fruits", unit: "kg", price: 3.90, stock: 80 },
      { name: "Fruits de la passion", category: "fruits", unit: "kg", price: 12.00, stock: 50 },
      { name: "Litchis", category: "fruits", unit: "kg", price: 8.50, stock: 60 },
      { name: "Noix de coco", category: "fruits", unit: "pièce", price: 2.20, stock: 150 }
    ]
  },
  {
    name: "Boissons & Liquides Premium",
    type: "grossiste",
    contact: "Nicolas Petit",
    email: "info@boissons-premium.be",
    phone: "+32 2 345 67 89",
    address: {
      street: "Avenue des Boissons 45",
      city: "Liège",
      postalCode: "40000",
      country: "Belgique"
    },
    categories: ['boissons'],
    isBio: false,
    products: [
      { name: "Eau minérale", category: "boissons", unit: "L", price: 0.50, stock: 1000, promotion: { active: true, discountPercent: 20, endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) } },
      { name: "Jus d'orange frais", category: "boissons", unit: "L", price: 3.50, stock: 200 },
      { name: "Jus de pomme", category: "boissons", unit: "L", price: 2.80, stock: 250 },
      { name: "Lait entier", category: "boissons", unit: "L", price: 1.20, stock: 500 },
      { name: "Lait demi-écrémé", category: "boissons", unit: "L", price: 1.15, stock: 500 },
      { name: "Thé vert (sachets)", category: "boissons", unit: "boîte", price: 5.50, stock: 100 },
      { name: "Café moulu", category: "boissons", unit: "kg", price: 12.00, stock: 80 }
    ]
  },
  {
    name: "Surgelés Qualité",
    type: "grossiste",
    contact: "Isabelle Durand",
    email: "contact@surgelesqualite.be",
    phone: "+32 2 456 78 90",
    address: {
      street: "Zone Industrielle 78",
      city: "Mons",
      postalCode: "70000",
      country: "Belgique"
    },
    categories: ['autres'],
    isBio: false,
    products: [
      { name: "Légumes mélangés surgelés", category: "surgeles", unit: "kg", price: 3.20, stock: 300 },
      { name: "Frites surgelées", category: "surgeles", unit: "kg", price: 2.50, stock: 500, promotion: { active: true, discountPercent: 12, endDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000) } },
      { name: "Poisson pané surgelé", category: "surgeles", unit: "kg", price: 8.90, stock: 200 },
      { name: "Pizza surgelée", category: "surgeles", unit: "pièce", price: 4.50, stock: 150 },
      { name: "Glace vanille", category: "surgeles", unit: "L", price: 6.50, stock: 100 }
    ]
  },
  {
    name: "Volailles du Brabant",
    type: "boucher",
    contact: "Christophe Maes",
    email: "contact@volaillesbrabant.be",
    phone: "+32 2 567 89 01",
    address: {
      street: "Chaussée de Louvain 123",
      city: "Bruxelles",
      postalCode: "10300",
      country: "Belgique"
    },
    categories: ['viandes'],
    isBio: false,
    products: [
      { name: "Poulet fermier (entier)", category: "volailles", unit: "kg", price: 6.90, stock: 200, promotion: { active: true, discountPercent: 15, endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) } },
      { name: "Poulet (blanc)", category: "volailles", unit: "kg", price: 11.50, stock: 150 },
      { name: "Poulet (cuisse)", category: "volailles", unit: "kg", price: 7.90, stock: 180 },
      { name: "Dinde (escalope)", category: "volailles", unit: "kg", price: 13.50, stock: 100 },
      { name: "Œufs frais (plein air)", category: "oeufs", unit: "pièce", price: 0.35, stock: 1000 },
      { name: "Caille (entière)", category: "volailles", unit: "kg", price: 18.00, stock: 40 }
    ]
  }
];

async function seedSuppliers() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver le groupe Vulpia
    const group = await Group.findOne({ name: 'Vulpia Group' });
    if (!group) {
      console.log('❌ Groupe Vulpia non trouvé !');
      process.exit(1);
    }

    console.log('🏭 Création des fournisseurs...\n');
    console.log('='.repeat(120));

    let created = 0;
    let updated = 0;

    for (const supplierData of suppliersData) {
      // Vérifier si le fournisseur existe déjà
      const existingSupplier = await Supplier.findOne({ 
        name: supplierData.name
      });

      if (existingSupplier) {
        // Mettre à jour le fournisseur existant
        Object.assign(existingSupplier, {
          ...supplierData,
          groupId: group._id,
          status: 'active'
        });
        await existingSupplier.save();
        updated++;
        console.log(`🔄 ${supplierData.name.padEnd(40)} | Mis à jour | ${supplierData.products.length} produits | ${supplierData.isBio ? '🌱 BIO' : '   '}`);
      } else {
        // Créer un nouveau fournisseur
        const supplier = new Supplier({
          ...supplierData,
          groupId: group._id,
          status: 'active'
        });
        await supplier.save();
        created++;
        console.log(`✅ ${supplierData.name.padEnd(40)} | Créé | ${supplierData.products.length} produits | ${supplierData.isBio ? '🌱 BIO' : '   '}`);
      }
    }

    console.log('='.repeat(120));
    console.log('\n📊 RÉSUMÉ :');
    console.log(`   ✅ Fournisseurs créés : ${created}`);
    console.log(`   🔄 Fournisseurs mis à jour : ${updated}`);
    console.log(`   📦 Total fournisseurs : ${created + updated}`);

    // Statistiques
    const totalSuppliers = suppliersData.length;
    const bioSuppliers = suppliersData.filter(s => s.isBio).length;
    const totalProducts = suppliersData.reduce((sum, s) => sum + s.products.length, 0);
    const promotions = suppliersData.reduce((sum, s) => sum + s.products.filter(p => p.promotion?.active).length, 0);

    console.log('\n📈 STATISTIQUES :');
    console.log(`   🏭 Total fournisseurs : ${totalSuppliers}`);
    console.log(`   🌱 Fournisseurs bio : ${bioSuppliers} (${((bioSuppliers/totalSuppliers)*100).toFixed(1)}%)`);
    console.log(`   📦 Total produits : ${totalProducts}`);
    console.log(`   🎁 Produits en promo : ${promotions} (${((promotions/totalProducts)*100).toFixed(1)}%)`);

    console.log('\n📋 CATÉGORIES :');
    const categories = {};
    for (const s of suppliersData) {
      categories[s.type] = (categories[s.type] || 0) + 1;
    }
    Object.entries(categories).forEach(([type, count]) => {
      console.log(`   ${type.padEnd(15)} : ${count}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedSuppliers();
