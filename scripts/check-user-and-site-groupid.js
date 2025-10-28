import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chaif-ses';

async function checkUserAndSiteGroupId() {
  try {
    console.log('🔌 Connexion à MongoDB:', MONGODB_URI.includes('localhost') ? 'LOCAL' : 'PRODUCTION');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const Site = mongoose.model('Site', new mongoose.Schema({}, { strict: false }));
    const Group = mongoose.model('Group', new mongoose.Schema({}, { strict: false }));
    const Supplier = mongoose.model('Supplier', new mongoose.Schema({}, { strict: false }));

    // 1️⃣ Chercher l'utilisateur arthur
    console.log('🔍 Recherche de l\'utilisateur arthur...\n');
    const user = await User.findOne({ email: 'arthur@vulpiagroup.com' });
    
    if (user) {
      console.log('✅ Utilisateur trouvé:');
      console.log('   Email:', user.email);
      console.log('   Role:', user.role);
      console.log('   Roles:', user.roles);
      console.log('   groupId:', user.groupId || 'NON DÉFINI');
      console.log('   siteId:', user.siteId || 'NON DÉFINI');
    } else {
      console.log('❌ Utilisateur arthur non trouvé');
    }

    // 2️⃣ Chercher le site Abdijhof
    console.log('\n🔍 Recherche du site Abdijhof...\n');
    const site = await Site.findOne({ siteName: /abdijhof/i });
    
    if (site) {
      console.log('✅ Site trouvé:');
      console.log('   Nom:', site.siteName);
      console.log('   ID:', site._id);
      console.log('   groupId:', site.groupId || 'NON DÉFINI');
    } else {
      console.log('❌ Site Abdijhof non trouvé');
    }

    // 3️⃣ Lister tous les groupes
    console.log('\n📋 Liste de tous les groupes:\n');
    const groups = await Group.find({});
    for (const group of groups) {
      console.log(`   ${group._id} - ${group.name}`);
    }

    // 4️⃣ Pour chaque groupe, compter les fournisseurs
    console.log('\n📦 Fournisseurs par groupe:\n');
    for (const group of groups) {
      const suppliersCount = await Supplier.countDocuments({ groupId: group._id });
      console.log(`   ${group.name} (${group._id}): ${suppliersCount} fournisseurs`);
      
      if (suppliersCount > 0 && suppliersCount <= 5) {
        const suppliers = await Supplier.find({ groupId: group._id });
        for (const s of suppliers) {
          console.log(`      - ${s._id} - ${s.name}`);
        }
      }
    }

    await mongoose.disconnect();
    process.exit(0);

  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

checkUserAndSiteGroupId();

