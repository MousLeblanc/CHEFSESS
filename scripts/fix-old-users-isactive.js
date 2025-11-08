import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function fixOldUsersIsActive() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver tous les utilisateurs avec isActive undefined ou null
    const usersToFix = await User.find({
      $or: [
        { isActive: { $exists: false } },
        { isActive: null },
        { isActive: undefined }
      ]
    }).select('_id name email role siteId isActive');
    
    console.log(`📊 ${usersToFix.length} utilisateur(s) avec isActive undefined/null trouvé(s)\n`);
    
    let stats = {
      updated: 0,
      errors: 0
    };
    
    for (const user of usersToFix) {
      try {
        console.log(`\n👤 Utilisateur: ${user.name || user.email} (${user._id})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   siteId: ${user.siteId || 'N/A'}`);
        console.log(`   isActive actuel: ${user.isActive}`);
        
        // Mettre à jour isActive à true
        user.isActive = true;
        await user.save();
        
        console.log(`   ✅ isActive mis à jour à: true`);
        stats.updated++;
        
      } catch (error) {
        console.error(`   ❌ Erreur pour ${user.name || user.email}:`, error.message);
        stats.errors++;
      }
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Utilisateurs mis à jour: ${stats.updated}`);
    console.log(`❌ Erreurs: ${stats.errors}`);
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur générale:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
fixOldUsersIsActive();

