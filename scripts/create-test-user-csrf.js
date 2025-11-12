/**
 * Script pour créer un utilisateur de test pour les tests CSRF
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const TEST_EMAIL = 'test-csrf@example.com';
const TEST_PASSWORD = 'TestCSRF123!';

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier si l'utilisateur existe déjà
    let user = await User.findOne({ email: TEST_EMAIL });

    if (user) {
      console.log('⚠️  Utilisateur de test existe déjà');
      // Réinitialiser le mot de passe
      user.password = TEST_PASSWORD;
      await user.save();
      console.log('✅ Mot de passe réinitialisé\n');
    } else {
      // Créer un nouvel utilisateur
      user = await User.create({
        name: 'Test CSRF User',
        email: TEST_EMAIL,
        password: TEST_PASSWORD,
        role: 'collectivite',
        establishmentType: 'ehpad',
        businessName: 'Test EHPAD CSRF'
      });
      console.log('✅ Utilisateur de test créé\n');
    }

    console.log('📋 Informations de connexion:');
    console.log(`   Email: ${TEST_EMAIL}`);
    console.log(`   Password: ${TEST_PASSWORD}`);
    console.log(`   Role: ${user.role}`);
    console.log('\n✅ Utilisateur de test prêt pour les tests CSRF\n');

    await mongoose.disconnect();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createTestUser();

