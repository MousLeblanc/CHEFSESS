import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function checkOldUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // IDs des utilisateurs connectés (anciens)
    const connectedUserIds = [
      '68f9679349c6006cf03a9c51', // Responsable Elysia Park
      '68fbfaf7555f8032269fa295'  // Responsable Beukenpark
    ];
    
    for (const userId of connectedUserIds) {
      const user = await User.findById(userId).select('_id name email role siteId roles groupId isActive');
      if (user) {
        console.log(`\n✅ Utilisateur trouvé:`);
        console.log(`   - ID: ${user._id}`);
        console.log(`   - Nom: ${user.name || user.email}`);
        console.log(`   - Email: ${user.email}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Roles: ${user.roles?.join(', ') || 'N/A'}`);
        console.log(`   - siteId: ${user.siteId || 'N/A'} (type: ${typeof user.siteId})`);
        if (user.siteId) {
          console.log(`   - siteId.toString(): ${user.siteId.toString ? user.siteId.toString() : 'N/A'}`);
        }
        console.log(`   - groupId: ${user.groupId || 'N/A'}`);
        console.log(`   - isActive: ${user.isActive}`);
        
        // Vérifier si cet utilisateur serait trouvé par la requête
        if (user.siteId) {
          const siteIdObj = new mongoose.Types.ObjectId(user.siteId);
          const siteIdStr = user.siteId.toString();
          
          const foundByObjectId = await User.find({
            isActive: true,
            siteId: siteIdObj
          }).countDocuments();
          
          const foundByString = await User.find({
            isActive: true,
            siteId: siteIdStr
          }).countDocuments();
          
          const foundByOr = await User.find({
            isActive: true,
            $or: [
              { siteId: siteIdObj },
              { siteId: siteIdStr }
            ]
          }).countDocuments();
          
          console.log(`\n   🔍 Test de recherche:`);
          console.log(`      - Trouvé avec ObjectId: ${foundByObjectId}`);
          console.log(`      - Trouvé avec String: ${foundByString}`);
          console.log(`      - Trouvé avec $or: ${foundByOr}`);
          
          if (foundByObjectId === 0 && foundByString === 0 && foundByOr === 0) {
            console.log(`      ⚠️  PROBLÈME: L'utilisateur ne serait PAS trouvé par la requête !`);
            console.log(`      💡 Raison possible: isActive=${user.isActive}`);
          }
        }
      } else {
        console.log(`\n❌ Utilisateur ${userId} non trouvé`);
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
checkOldUsers();

