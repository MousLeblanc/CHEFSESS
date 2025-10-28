import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function restoreFournisseur() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1️⃣ Trouver le groupe Vulpia
    const Group = mongoose.model('Group', new mongoose.Schema({}, { strict: false }));
    const group = await Group.findOne({ name: /vulpia/i });
    
    if (!group) {
      console.error('❌ Groupe Vulpia non trouvé !');
      process.exit(1);
    }

    console.log('✅ Groupe trouvé:', group.name, '-', group._id);

    // 2️⃣ Vérifier si le fournisseur existe déjà
    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));
    const existing = await Supplier.findOne({ email: 'fournisseur@gmail.com' });

    if (existing) {
      console.log('⚠️  Le fournisseur existe déjà !');
      console.log('   ID:', existing._id);
      console.log('   Nom:', existing.name);
      console.log('   Email:', existing.email);
      console.log('   Produits:', existing.products?.length || 0);
      await mongoose.disconnect();
      process.exit(0);
    }

    // 3️⃣ Créer le fournisseur
    const supplierData = {
      name: "fournisseur",
      contact: "Contact Fournisseur",
      email: "fournisseur@gmail.com",
      phone: "+32 2 999 88 77",
      address: {
        street: "Avenue du Commerce",
        city: "Bruxelles",
        postalCode: "1000",
        country: "Belgique"
      },
      type: "grossiste",
      isBio: false,
      status: 'active',
      rating: 5,
      products: [
        { name: "Produit 1", category: "Divers", unit: "kg", price: 10.00, stock: 500, promotion: { active: false } },
        { name: "Produit 2", category: "Divers", unit: "kg", price: 15.00, stock: 300, promotion: { active: false } },
        { name: "Produit 3", category: "Divers", unit: "L", price: 8.00, stock: 400, promotion: { active: false } },
        { name: "Produit 4", category: "Divers", unit: "kg", price: 12.50, stock: 250, promotion: { active: false } },
        { name: "Produit 5", category: "Divers", unit: "unité", price: 5.00, stock: 600, promotion: { active: false } }
      ],
      groupId: group._id
    };

    const newSupplier = await Supplier.create(supplierData);
    console.log('\n✅ Fournisseur créé avec succès !');
    console.log('   ID:', newSupplier._id);
    console.log('   Nom:', newSupplier.name);
    console.log('   Email:', newSupplier.email);
    console.log('   Produits:', newSupplier.products.length);

    // 4️⃣ Créer le compte utilisateur pour se connecter
    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    
    const existingUser = await User.findOne({ email: 'fournisseur@gmail.com' });
    
    if (existingUser) {
      console.log('\n⚠️  Compte utilisateur existe déjà');
      console.log('   Email: fournisseur@gmail.com');
      console.log('   Password: fournisseur');
    } else {
      const newUser = await User.create({
        name: 'fournisseur',
        email: 'fournisseur@gmail.com',
        password: 'fournisseur', // Le hook pre('save') du modèle User va le hasher
        role: 'fournisseur',
        roles: ['SUPPLIER'],
        supplierId: newSupplier._id,
        groupId: group._id,
        isActive: true,
        isEmailVerified: true
      });

      console.log('\n✅ Compte utilisateur créé !');
      console.log('   Email: fournisseur@gmail.com');
      console.log('   Password: fournisseur');
      console.log('   Rôle: SUPPLIER');
    }

    console.log('\n🎉 Restauration terminée avec succès !');
    console.log('\n📝 Le fournisseur peut maintenant :');
    console.log('   - Se connecter sur https://chefsess.onrender.com');
    console.log('   - Email: fournisseur@gmail.com');
    console.log('   - Password: fournisseur');
    console.log('   - Recevoir et gérer les commandes');

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

restoreFournisseur();

