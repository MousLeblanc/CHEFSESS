import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function checkSiteIdStorage() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // IDs des utilisateurs à vérifier
    const userIds = [
      '68f9679349c6006cf03a9c51', // Responsable Elysia Park (ancien)
      '690f88bd67314f6760a89142', // Gérant Elysia Park (nouveau)
      '68fbfaf7555f8032269fa295', // Responsable Beukenpark (ancien)
      '690f88c067314f6760a8918b'  // Gérant Beukenpark (nouveau)
    ];
    
    for (const userId of userIds) {
      // Récupérer l'utilisateur directement depuis MongoDB (sans populate)
      const user = await User.findById(userId).lean();
      
      if (user) {
        console.log(`\n👤 Utilisateur: ${user.name || user.email} (${user._id})`);
        console.log(`   Email: ${user.email}`);
        console.log(`   siteId brut (type: ${typeof user.siteId}):`, user.siteId);
        console.log(`   siteId est ObjectId: ${user.siteId instanceof mongoose.Types.ObjectId}`);
        console.log(`   siteId est string: ${typeof user.siteId === 'string'}`);
        
        if (user.siteId) {
          if (typeof user.siteId === 'object') {
            console.log(`   siteId.toString(): ${user.siteId.toString()}`);
            console.log(`   siteId.constructor.name: ${user.siteId.constructor.name}`);
          } else {
            console.log(`   siteId (string): ${user.siteId}`);
          }
        }
      } else {
        console.log(`\n❌ Utilisateur ${userId} non trouvé`);
      }
    }
    
    // Maintenant tester la requête avec les siteIds réels
    console.log(`\n\n🔍 Test de requête avec les siteIds réels:`);
    
    const siteIds = [
      '68f9679349c6006cf03a9c4e', // Elysia Park
      '68fbfaf7555f8032269fa292'  // Beukenpark
    ];
    
    // Récupérer les utilisateurs avec leurs siteId réels
    const allUsers = await User.find({
      _id: { $in: userIds.map(id => new mongoose.Types.ObjectId(id)) }
    }).lean();
    
    console.log(`\n📋 Utilisateurs récupérés: ${allUsers.length}`);
    allUsers.forEach(u => {
      const siteIdValue = u.siteId;
      const siteIdStr = siteIdValue ? (typeof siteIdValue === 'object' ? siteIdValue.toString() : siteIdValue) : 'N/A';
      console.log(`   - ${u.name || u.email}: siteId = ${siteIdStr} (type: ${typeof siteIdValue})`);
    });
    
    // Tester si on peut les trouver avec une requête
    for (const siteIdStr of siteIds) {
      console.log(`\n🔍 Test pour siteId: ${siteIdStr}`);
      
      // Test avec ObjectId
      const found1 = await User.find({
        isActive: true,
        siteId: new mongoose.Types.ObjectId(siteIdStr)
      }).select('_id name email').lean();
      
      console.log(`   Avec ObjectId: ${found1.length} utilisateur(s)`);
      found1.forEach(u => {
        console.log(`      - ${u.name || u.email} (${u._id})`);
      });
      
      // Test avec string
      const found2 = await User.find({
        isActive: true,
        siteId: siteIdStr
      }).select('_id name email').lean();
      
      console.log(`   Avec String: ${found2.length} utilisateur(s)`);
      found2.forEach(u => {
        console.log(`      - ${u.name || u.email} (${u._id})`);
      });
    }

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
checkSiteIdStorage();

