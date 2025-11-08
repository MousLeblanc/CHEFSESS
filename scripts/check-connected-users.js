import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function checkConnectedUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // IDs des utilisateurs connectés selon les logs
    const connectedUserIds = [
      '68f9679349c6006cf03a9c51',
      '68fbfaf7555f8032269fa295'
    ];
    
    // IDs des destinataires trouvés
    const recipientUserIds = [
      '690f88bc67314f6760a89120', // Gérant Henri Jaspar Premium Living
      '690f88bc67314f6760a89132', // Gérant Arthur Résidences-services
      '690f88bd67314f6760a89142', // Gérant Elysia Park
      '690f88c067314f6760a8918b', // Gérant Beukenpark
      '690f88c867314f6760a8924b'  // Gérant Brussels Living
    ];
    
    console.log('🔍 Vérification des utilisateurs connectés:');
    for (const userId of connectedUserIds) {
      const user = await User.findById(userId).select('_id name email role siteId roles groupId');
      if (user) {
        console.log(`\n✅ Utilisateur connecté trouvé:`);
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Nom: ${user.name || user.email}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Roles: ${user.roles?.join(', ') || 'N/A'}`);
        console.log(`   - siteId: ${user.siteId || 'N/A'}`);
        console.log(`   - groupId: ${user.groupId || 'N/A'}`);
      } else {
        console.log(`\n❌ Utilisateur ${userId} non trouvé dans la base de données`);
      }
    }
    
    console.log('\n\n🔍 Vérification des destinataires:');
    for (const userId of recipientUserIds) {
      const user = await User.findById(userId).select('_id name email role siteId roles groupId');
      if (user) {
        console.log(`\n✅ Destinataire trouvé:`);
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Nom: ${user.name || user.email}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Roles: ${user.roles?.join(', ') || 'N/A'}`);
        console.log(`   - siteId: ${user.siteId || 'N/A'}`);
        console.log(`   - groupId: ${user.groupId || 'N/A'}`);
      } else {
        console.log(`\n❌ Destinataire ${userId} non trouvé dans la base de données`);
      }
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
checkConnectedUsers();

