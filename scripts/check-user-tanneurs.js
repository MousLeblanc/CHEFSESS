import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

async function checkUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const user = await User.findOne({ email: 'tanneurs@gmail.com' });

    if (!user) {
      console.log('❌ Aucun utilisateur trouvé avec cet email !');
      console.log('\n💡 Vous devez créer ce compte via register.html');
      return;
    }

    console.log('✅ Utilisateur trouvé !\n');
    console.log('📋 Informations du compte:');
    console.log(`   • Email: ${user.email}`);
    console.log(`   • Nom: ${user.name || 'Non défini'}`);
    console.log(`   • Rôle: ${user.role}`);
    console.log(`   • Établissement: ${user.establishmentType || 'Non défini'}`);
    console.log(`   • Entreprise: ${user.businessName || 'Non défini'}`);
    console.log(`   • Téléphone: ${user.phone || 'Non défini'}`);
    console.log(`   • Adresse: ${user.address || 'Non défini'}`);
    console.log(`   • TVA: ${user.taxNumber || 'Non défini'}`);
    console.log(`   • Date création: ${user.createdAt || 'Non défini'}`);
    console.log('\n⚠️ Note: Le mot de passe est hashé pour la sécurité');

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkUser();

