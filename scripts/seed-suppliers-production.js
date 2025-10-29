import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

const suppliersData = [
  {
    name: "Poissonnerie La Mer du Nord",
    contact: "Jean Dupont",
    email: "contact@poissonneriemerdunord.be",
    phone: "+32 2 345 67 89",
    address: {
      street: "15 Quai aux Briques",
      city: "Bruxelles",
      postalCode: "1000",
      country: "Belgique"
    },
    type: "poissonnier",
    isBio: false,
    status: 'active',
    rating: 4,
    products: [
      { name: "Saumon frais", category: "Poisson", unit: "kg", price: 18.50, stock: 150, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-15') } },
      { name: "Cabillaud", category: "Poisson", unit: "kg", price: 14.20, stock: 200, promotion: { active: false } },
      { name: "Moules", category: "Fruits de mer", unit: "kg", price: 4.50, stock: 300, promotion: { active: false } },
      { name: "Crevettes grises", category: "Fruits de mer", unit: "kg", price: 22.00, stock: 80, promotion: { active: true, discountPercent: 15, endDate: new Date('2025-11-10') } },
      { name: "Sole", category: "Poisson", unit: "kg", price: 28.00, stock: 50, promotion: { active: false } },
      { name: "Thon", category: "Poisson", unit: "kg", price: 20.00, stock: 120, promotion: { active: false } }
    ]
  },
  {
    name: "Boucherie de la Ferme",
    contact: "Pierre Martin",
    email: "contact@boucherieferme.be",
    phone: "+32 2 456 78 90",
    address: {
      street: "28 Rue du Marché",
      city: "Liège",
      postalCode: "4000",
      country: "Belgique"
    },
    type: "boucher",
    isBio: false,
    status: 'active',
    rating: 4,
    products: [
      { name: "Bœuf haché", category: "Viande", unit: "kg", price: 12.00, stock: 250, promotion: { active: false } },
      { name: "Poulet fermier", category: "Volaille", unit: "kg", price: 8.50, stock: 200, promotion: { active: true, discountPercent: 5, endDate: new Date('2025-11-20') } },
      { name: "Côtelettes de porc", category: "Viande", unit: "kg", price: 10.00, stock: 180, promotion: { active: false } },
      { name: "Agneau", category: "Viande", unit: "kg", price: 16.00, stock: 100, promotion: { active: false } },
      { name: "Saucisses", category: "Charcuterie", unit: "kg", price: 7.50, stock: 150, promotion: { active: false } },
      { name: "Jambon blanc", category: "Charcuterie", unit: "kg", price: 9.00, stock: 120, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-12') } }
    ]
  },
  {
    name: "Volailles du Brabant",
    contact: "Marie Dubois",
    email: "contact@volaillesbrabant.be",
    phone: "+32 2 567 89 01",
    address: {
      street: "42 Chaussée de Wavre",
      city: "Bruxelles",
      postalCode: "1050",
      country: "Belgique"
    },
    type: "boucher",
    isBio: false,
    status: 'active',
    rating: 4,
    products: [
      { name: "Poulet entier", category: "Volaille", unit: "kg", price: 7.80, stock: 300, promotion: { active: false } },
      { name: "Cuisses de poulet", category: "Volaille", unit: "kg", price: 6.50, stock: 250, promotion: { active: true, discountPercent: 8, endDate: new Date('2025-11-18') } },
      { name: "Dinde", category: "Volaille", unit: "kg", price: 9.00, stock: 150, promotion: { active: false } },
      { name: "Canard", category: "Volaille", unit: "kg", price: 12.00, stock: 80, promotion: { active: false } },
      { name: "Lapin", category: "Viande", unit: "kg", price: 11.00, stock: 100, promotion: { active: false } },
      { name: "Foie gras", category: "Volaille", unit: "kg", price: 45.00, stock: 30, promotion: { active: false } }
    ]
  },
  {
    name: "Épicerie Bio Nature",
    contact: "Sophie Laurent",
    email: "contact@bionature.be",
    phone: "+32 2 678 90 12",
    address: {
      street: "7 Avenue Louise",
      city: "Bruxelles",
      postalCode: "1050",
      country: "Belgique"
    },
    type: "epicier",
    isBio: true,
    status: 'active',
    rating: 4,
    products: [
      { name: "Riz complet bio", category: "Féculents", unit: "kg", price: 3.50, stock: 500, promotion: { active: false } },
      { name: "Quinoa bio", category: "Féculents", unit: "kg", price: 5.00, stock: 200, promotion: { active: true, discountPercent: 12, endDate: new Date('2025-11-25') } },
      { name: "Lentilles bio", category: "Légumineuses", unit: "kg", price: 4.00, stock: 300, promotion: { active: false } },
      { name: "Pâtes complètes bio", category: "Féculents", unit: "kg", price: 2.80, stock: 400, promotion: { active: false } },
      { name: "Huile d'olive bio", category: "Condiments", unit: "L", price: 12.00, stock: 150, promotion: { active: false } },
      { name: "Miel bio", category: "Sucres", unit: "kg", price: 15.00, stock: 80, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-12-01') } }
    ]
  },
  {
    name: "Primeur du Jardin",
    contact: "Luc Petit",
    email: "contact@primeurjardin.be",
    phone: "+32 2 789 01 23",
    address: {
      street: "12 Place Sainte-Catherine",
      city: "Bruxelles",
      postalCode: "1000",
      country: "Belgique"
    },
    type: "primeur",
    isBio: false,
    status: 'active',
    rating: 4,
    products: [
      { name: "Tomates", category: "Légumes", unit: "kg", price: 2.50, stock: 400, promotion: { active: false } },
      { name: "Carottes", category: "Légumes", unit: "kg", price: 1.80, stock: 500, promotion: { active: true, discountPercent: 15, endDate: new Date('2025-11-10') } },
      { name: "Pommes de terre", category: "Féculents", unit: "kg", price: 1.20, stock: 600, promotion: { active: false } },
      { name: "Pommes Golden", category: "Fruits", unit: "kg", price: 2.00, stock: 350, promotion: { active: false } },
      { name: "Oranges", category: "Fruits", unit: "kg", price: 2.80, stock: 300, promotion: { active: false } },
      { name: "Bananes", category: "Fruits", unit: "kg", price: 1.50, stock: 400, promotion: { active: true, discountPercent: 10, endDate: new Date('2025-11-12') } }
    ]
  }
];

async function seedSuppliers() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1️⃣ Trouver le groupe Vulpia
    const Group = mongoose.model('Group', new mongoose.Schema({}, { strict: false }));
    const group = await Group.findOne({ name: /vulpia/i });
    
    if (!group) {
      console.error('❌ Groupe Vulpia non trouvé !');
      console.log('💡 Création du groupe Vulpia...');
      const newGroup = await Group.create({ name: 'Vulpia Group' });
      console.log('✅ Groupe créé:', newGroup._id);
      var groupId = newGroup._id;
    } else {
      console.log('✅ Groupe trouvé:', group.name, '-', group._id);
      var groupId = group._id;
    }

    // 2️⃣ Créer le modèle Supplier
    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));

    // 3️⃣ Créer les fournisseurs
    let created = 0;
    let skipped = 0;

    for (const supplierData of suppliersData) {
      const existing = await Supplier.findOne({ 
        name: supplierData.name,
        groupId: groupId
      });

      if (existing) {
        console.log(`⏭️  ${supplierData.name} - déjà existant`);
        skipped++;
        continue;
      }

      await Supplier.create({
        ...supplierData,
        groupId: groupId
      });

      console.log(`✅ ${supplierData.name} - créé avec ${supplierData.products.length} produits`);
      created++;
    }

    console.log(`\n🎉 Terminé : ${created} créés, ${skipped} ignorés`);

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedSuppliers();


