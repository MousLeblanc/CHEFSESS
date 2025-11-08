import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function checkIsActive() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const userIds = [
      '68f9679349c6006cf03a9c51', // Responsable Elysia Park (ancien)
      '690f88bd67314f6760a89142', // Gérant Elysia Park (nouveau)
      '68fbfaf7555f8032269fa295', // Responsable Beukenpark (ancien)
      '690f88c067314f6760a8918b'  // Gérant Beukenpark (nouveau)
    ];
    
    for (const userId of userIds) {
      // Récupérer SANS filtre isActive
      const userAll = await User.findById(userId).lean();
      
      // Récupérer AVEC filtre isActive: true
      const userActive = await User.findOne({
        _id: new mongoose.Types.ObjectId(userId),
        isActive: true
      }).lean();
      
      console.log(`\n👤 Utilisateur: ${userAll?.name || userAll?.email || userId}`);
      console.log(`   isActive dans DB: ${userAll?.isActive}`);
      console.log(`   Trouvé avec isActive: true: ${userActive ? 'OUI' : 'NON'}`);
      
      if (userAll && !userActive) {
        console.log(`   ⚠️  PROBLÈME: L'utilisateur existe mais n'est pas trouvé avec isActive: true !`);
        console.log(`   💡 Vérification: isActive = ${userAll.isActive} (type: ${typeof userAll.isActive})`);
      }
    }
    
    // Maintenant tester la requête complète
    console.log(`\n\n🔍 Test de la requête complète:`);
    
    const siteIds = [
      new mongoose.Types.ObjectId('68f9679349c6006cf03a9c4e'), // Elysia Park
      new mongoose.Types.ObjectId('68fbfaf7555f8032269fa292')  // Beukenpark
    ];
    
    const siteIdsAsStrings = siteIds.map(id => id.toString());
    
    // Requête exacte du code
    const users = await User.find({
      isActive: true,
      $or: [
        { siteId: { $in: siteIds } },
        { siteId: { $in: siteIdsAsStrings } }
      ]
    }).select('_id name email siteId isActive').lean();
    
    console.log(`\n📍 Utilisateurs trouvés: ${users.length}`);
    users.forEach(u => {
      const siteIdStr = u.siteId ? (typeof u.siteId === 'object' ? u.siteId.toString() : u.siteId) : 'N/A';
      console.log(`   - ${u.name || u.email} (${u._id}) - siteId: ${siteIdStr} - isActive: ${u.isActive}`);
    });
    
    // Vérifier manuellement chaque utilisateur
    console.log(`\n🔍 Vérification manuelle:`);
    for (const userId of userIds) {
      const user = await User.findById(userId).lean();
      if (user) {
        const siteIdStr = user.siteId ? (typeof user.siteId === 'object' ? user.siteId.toString() : user.siteId) : 'N/A';
        const matches = siteIds.some(siteId => {
          const siteIdStr2 = siteId.toString();
          return siteIdStr === siteIdStr2;
        });
        console.log(`   - ${user.name || user.email}: siteId=${siteIdStr}, isActive=${user.isActive}, matches=${matches}`);
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
checkIsActive();

