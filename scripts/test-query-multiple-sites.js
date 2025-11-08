import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function testQueryMultipleSites() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Les siteIds des sites concernés
    const siteIds = [
      '68f9679349c6006cf03a9c4e', // Elysia Park
      '68fbfaf7555f8032269fa292', // Beukenpark
      '68fbfaff555f8032269fa3b8'  // Brussels Living
    ];
    
    // Convertir en ObjectIds
    const siteIdsAsObjectIds = siteIds.map(id => new mongoose.Types.ObjectId(id));
    const siteIdsAsStrings = siteIds.map(id => id.toString());
    
    console.log('🔍 Test avec plusieurs sites:');
    console.log(`   SiteIds (ObjectId): ${siteIdsAsObjectIds.map(id => id.toString()).join(', ')}`);
    console.log(`   SiteIds (String): ${siteIdsAsStrings.join(', ')}\n`);
    
    // Test 1: Avec ObjectIds
    const usersByObjectId = await User.find({
      isActive: true,
      siteId: { $in: siteIdsAsObjectIds }
    }).select('_id name email siteId').lean();
    
    console.log(`📍 Test 1 - Avec ObjectIds ($in): ${usersByObjectId.length} utilisateur(s)`);
    usersByObjectId.forEach(u => {
      const siteIdStr = u.siteId ? (typeof u.siteId === 'object' ? u.siteId.toString() : u.siteId) : 'N/A';
      console.log(`   - ${u.name || u.email} (${u._id}) - siteId: ${siteIdStr} - Email: ${u.email}`);
    });
    
    // Test 2: Avec Strings
    const usersByString = await User.find({
      isActive: true,
      siteId: { $in: siteIdsAsStrings }
    }).select('_id name email siteId').lean();
    
    console.log(`\n📍 Test 2 - Avec Strings ($in): ${usersByString.length} utilisateur(s)`);
    usersByString.forEach(u => {
      const siteIdStr = u.siteId ? (typeof u.siteId === 'object' ? u.siteId.toString() : u.siteId) : 'N/A';
      console.log(`   - ${u.name || u.email} (${u._id}) - siteId: ${siteIdStr} - Email: ${u.email}`);
    });
    
    // Test 3: Avec $or (ObjectId ET String)
    const usersByOr = await User.find({
      isActive: true,
      $or: [
        { siteId: { $in: siteIdsAsObjectIds } },
        { siteId: { $in: siteIdsAsStrings } }
      ]
    }).select('_id name email siteId').lean();
    
    console.log(`\n📍 Test 3 - Avec $or (ObjectId ET String): ${usersByOr.length} utilisateur(s)`);
    usersByOr.forEach(u => {
      const siteIdStr = u.siteId ? (typeof u.siteId === 'object' ? u.siteId.toString() : u.siteId) : 'N/A';
      console.log(`   - ${u.name || u.email} (${u._id}) - siteId: ${siteIdStr} - Email: ${u.email}`);
    });
    
    // Vérifier les utilisateurs attendus
    const expectedUsers = [
      { id: '68f9679349c6006cf03a9c51', name: 'Responsable Elysia Park', email: 'elysiapark@vulpiagroup.com', siteId: '68f9679349c6006cf03a9c4e' },
      { id: '690f88bd67314f6760a89142', name: 'Gérant Elysia Park', email: 'elysiapark@site.com', siteId: '68f9679349c6006cf03a9c4e' },
      { id: '68fbfaf7555f8032269fa295', name: 'Responsable Beukenpark', email: 'beukenpark@vulpiagroup.com', siteId: '68fbfaf7555f8032269fa292' },
      { id: '690f88c067314f6760a8918b', name: 'Gérant Beukenpark', email: 'beukenpark@site.com', siteId: '68fbfaf7555f8032269fa292' }
    ];
    
    console.log(`\n🔍 Vérification des utilisateurs attendus:`);
    expectedUsers.forEach(expected => {
      const found = usersByOr.find(u => u._id.toString() === expected.id);
      if (found) {
        console.log(`   ✅ ${expected.name} (${expected.id}) - TROUVÉ`);
      } else {
        console.log(`   ❌ ${expected.name} (${expected.id}) - NON TROUVÉ`);
      }
    });

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
testQueryMultipleSites();

