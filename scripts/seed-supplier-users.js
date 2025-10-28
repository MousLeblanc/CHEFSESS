// scripts/seed-supplier-users.js
// Crée des comptes utilisateurs pour les fournisseurs

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Group from '../models/Group.js';

async function seedSupplierUsers() {
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

    // Récupérer tous les fournisseurs
    const suppliers = await Supplier.find({ groupId: group._id });
    console.log(`📊 ${suppliers.length} fournisseurs trouvés\n`);

    console.log('👤 Création des comptes utilisateurs pour les fournisseurs...\n');
    console.log('='.repeat(120));

    let created = 0;
    let skipped = 0;

    for (const supplier of suppliers) {
      // Créer un email de connexion basé sur le nom du fournisseur (sans tirets ni espaces)
      const supplierNameSlug = supplier.name
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Enlever les accents
        .replace(/[^a-z0-9]/g, '')       // Enlever tous les caractères spéciaux (espaces, tirets, etc.)
        .trim();

      const userEmail = `${supplierNameSlug}@gmail.com`;
      const password = supplierNameSlug; // Même chose que l'email sans @gmail.com

      // Vérifier si l'utilisateur existe déjà
      const existingUser = await User.findOne({ email: userEmail });

      if (existingUser) {
        skipped++;
        console.log(`⏭️  ${supplier.name.padEnd(45)} | Utilisateur existe déjà`);
        continue;
      }

      // Hasher le mot de passe
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Créer le compte utilisateur
      const user = new User({
        name: supplier.contact || supplier.name.split(' ')[0],
        email: userEmail,
        password: hashedPassword,
        role: 'fournisseur',
        roles: ['SUPPLIER'],
        groupId: group._id,
        supplierId: supplier._id,
        businessName: supplier.name,
        phone: supplier.phone,
        address: supplier.address,
        isActive: true,
        isEmailVerified: true
      });

      await user.save();
      created++;
      console.log(`✅ ${supplier.name.padEnd(45)} | ${userEmail.padEnd(40)} | ${password}`);
    }

    console.log('='.repeat(120));
    console.log('\n📊 RÉSUMÉ :');
    console.log(`   ✅ Comptes créés : ${created}`);
    console.log(`   ⏭️  Comptes existants : ${skipped}`);
    console.log(`   📦 Total : ${created + skipped}`);

    console.log('\n🔐 INFORMATIONS DE CONNEXION :');
    console.log('   📧 Format email : [nomfournisseursansespaces]@gmail.com');
    console.log('   🔑 Format mot de passe : [nomfournisseursansespaces]');
    console.log('\n   Exemples:');
    console.log('   - poissonerielamerdunord@gmail.com / poissonerielamerdunord');
    console.log('   - boucherieartisanaleleroy@gmail.com / boucherieartisanaleleroy');

    await mongoose.disconnect();
    console.log('\n✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

seedSupplierUsers();

