import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Site from '../models/Site.js';

dotenv.config();

const checkSiteUserRoles = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver quelques utilisateurs de sites
    const siteUsers = await User.find({ siteId: { $exists: true, $ne: null } }).limit(10);

    console.log(`\n📊 Trouvé ${siteUsers.length} utilisateurs de sites\n`);

    for (const user of siteUsers) {
      console.log('👤 ===== UTILISATEUR =====');
      console.log(`Email: ${user.email}`);
      console.log(`Nom: ${user.name}`);
      console.log(`Role (string): "${user.role}" | Type: ${typeof user.role}`);
      console.log(`Roles (array):`, user.roles, `| IsArray: ${Array.isArray(user.roles)}`);
      console.log(`Site ID: ${user.siteId}`);
      console.log(`Group ID: ${user.groupId}`);
      console.log('');
    }

    // Vérifier aussi les rôles autorisés dans canManageOrders
    const allowedRoles = ['collectivite', 'restaurant', 'resto', 'groupe', 'GROUP_ADMIN', 'SITE_MANAGER', 'CHEF'];
    console.log('\n🔐 Rôles autorisés dans canManageOrders:');
    console.log(allowedRoles.join(', '));

    await mongoose.connection.close();
    console.log('\n✅ Connexion fermée');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
};

checkSiteUserRoles();






