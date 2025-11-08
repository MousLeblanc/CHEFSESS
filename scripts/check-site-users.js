import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Site from '../models/Site.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function checkSiteUsers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Sites concernés
    const siteIds = [
      '68f9679349c6006cf03a9c4e', // Elysia Park
      '68fbfaf7555f8032269fa292', // Beukenpark
      '68fbfaff555f8032269fa3b8'  // Brussels Living
    ];
    
    for (const siteIdStr of siteIds) {
      const site = await Site.findById(siteIdStr);
      if (!site) {
        console.log(`\n❌ Site ${siteIdStr} non trouvé`);
        continue;
      }
      
      console.log(`\n📍 Site: ${site.siteName} (${site._id})`);
      
      // Chercher avec ObjectId
      const usersByObjectId = await User.find({
        isActive: true,
        siteId: new mongoose.Types.ObjectId(siteIdStr)
      }).select('_id name email role siteId roles');
      
      // Chercher avec string
      const usersByString = await User.find({
        isActive: true,
        siteId: siteIdStr
      }).select('_id name email role siteId roles');
      
      // Chercher avec $or
      const usersByOr = await User.find({
        isActive: true,
        $or: [
          { siteId: new mongoose.Types.ObjectId(siteIdStr) },
          { siteId: siteIdStr }
        ]
      }).select('_id name email role siteId roles');
      
      console.log(`   📍 Utilisateurs trouvés avec ObjectId: ${usersByObjectId.length}`);
      usersByObjectId.forEach(u => {
        console.log(`      - ${u.name || u.email} (${u._id}) - Email: ${u.email}`);
      });
      
      console.log(`   📍 Utilisateurs trouvés avec String: ${usersByString.length}`);
      usersByString.forEach(u => {
        console.log(`      - ${u.name || u.email} (${u._id}) - Email: ${u.email}`);
      });
      
      console.log(`   📍 Utilisateurs trouvés avec $or: ${usersByOr.length}`);
      usersByOr.forEach(u => {
        console.log(`      - ${u.name || u.email} (${u._id}) - Email: ${u.email}`);
      });
      
      // Vérifier les managers du site
      if (site.managers && site.managers.length > 0) {
        console.log(`   👥 Managers du site: ${site.managers.length}`);
        const managers = await User.find({
          _id: { $in: site.managers },
          isActive: true
        }).select('_id name email role siteId roles');
        managers.forEach(m => {
          console.log(`      - ${m.name || m.email} (${m._id}) - Email: ${m.email} - siteId: ${m.siteId}`);
        });
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
checkSiteUsers();

