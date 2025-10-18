import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function createFournisseur() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier si le fournisseur existe déjà
    const existingUser = await User.findOne({ email: 'tanneurs@gmail.com' });

    if (existingUser) {
      console.log('⚠️ Un compte existe déjà avec cet email !');
      console.log(`   • Rôle actuel: ${existingUser.role}`);
      
      if (existingUser.role !== 'fournisseur') {
        console.log('\n🔄 Mise à jour du rôle vers "fournisseur"...');
        existingUser.role = 'fournisseur';
        existingUser.establishmentType = undefined; // Les fournisseurs n'ont pas d'establishmentType
      }

      console.log('\n🔄 Réinitialisation du mot de passe...');
      existingUser.password = 'Tanneurs123!'; // Le middleware pre-save va hasher automatiquement
      await existingUser.save();
      console.log('✅ Mot de passe réinitialisé !');
      
      console.log('\n✅ Compte fournisseur mis à jour avec succès !\n');
      console.log('📋 Informations de connexion:');
      console.log('   • Email: tanneurs@gmail.com');
      console.log('   • Mot de passe: Tanneurs123!');
      console.log('   • Rôle: fournisseur');
      console.log('\n🔗 Connexion:');
      console.log('   http://localhost:5000/index.html');
      console.log('\n✨ Vous serez automatiquement redirigé vers supplier-dashboard.html');
      
      return;
    }

    // Créer un nouveau fournisseur
    const fournisseur = new User({
      email: 'tanneurs@gmail.com',
      password: 'Tanneurs123!', // Mot de passe par défaut
      name: 'Les Tanneurs',
      role: 'fournisseur',
      businessName: 'Les Tanneurs - Produits Frais',
      phone: '+33 1 23 45 67 89',
      address: '123 Rue des Tanneurs, 75001 Paris',
      taxNumber: 'FR12345678901'
    });

    await fournisseur.save();

    console.log('✅ Compte fournisseur créé avec succès !\n');
    console.log('📋 Informations de connexion:');
    console.log('   • Email: tanneurs@gmail.com');
    console.log('   • Mot de passe: Tanneurs123!');
    console.log('   • Rôle: fournisseur');
    console.log('\n🔗 Connexion:');
    console.log('   http://localhost:5000/index.html');
    console.log('\n✨ Vous serez automatiquement redirigé vers supplier-dashboard.html');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createFournisseur();

