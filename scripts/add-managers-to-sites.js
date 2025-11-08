import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Site from '../models/Site.js';
import User from '../models/User.js';
import Group from '../models/Group.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function addManagersToSites() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver tous les sites actifs
    const sites = await Site.find({ isActive: true }).populate('groupId', 'name');
    
    console.log(`📊 ${sites.length} site(s) actif(s) trouvé(s)\n`);

    let stats = {
      sitesWithManagers: 0,
      sitesWithoutManagers: 0,
      usersCreated: 0,
      usersUpdated: 0,
      errors: 0
    };

    for (const site of sites) {
      try {
        console.log(`\n📍 Site: ${site.siteName} (${site._id})`);
        console.log(`   Groupe: ${site.groupId?.name || 'N/A'}`);
        console.log(`   Ville: ${site.address?.city || 'N/A'}`);
        
        // Vérifier si le site a des managers
        const hasManagers = site.managers && site.managers.length > 0;
        
        if (hasManagers) {
          // Vérifier que les managers existent et sont actifs
          const managers = await User.find({
            _id: { $in: site.managers },
            isActive: true
          });
          
          if (managers.length > 0) {
            console.log(`   ✅ ${managers.length} manager(s) existant(s):`);
            managers.forEach(m => {
              console.log(`      - ${m.name} (${m.email}) - Roles: ${m.roles?.join(', ') || 'N/A'}`);
            });
            stats.sitesWithManagers++;
            continue;
          } else {
            console.log(`   ⚠️  Managers référencés mais inactifs ou supprimés`);
            // Nettoyer les managers invalides
            site.managers = [];
          }
        }
        
        // Le site n'a pas de managers valides, créons-en un
        stats.sitesWithoutManagers++;
        console.log(`   ⚠️  Aucun manager valide trouvé - Création d'un gérant...`);
        
        // Générer un email et un mot de passe basés sur le nom du site
        const siteNameClean = site.siteName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '')
          .substring(0, 30);
        
        const email = `${siteNameClean}@site.com`;
        const password = `${siteNameClean}2024!`;
        
        // Vérifier si un utilisateur avec cet email existe déjà
        let siteUser = await User.findOne({ email });
        
        if (!siteUser) {
          // Créer un nouvel utilisateur
          siteUser = await User.create({
            name: `Gérant ${site.siteName}`,
            email,
            password, // Sera hashé automatiquement par le pre-save hook
            role: 'collectivite',
            groupId: site.groupId,
            siteId: site._id,
            roles: ['SITE_MANAGER', 'CHEF'],
            businessName: site.siteName,
            establishmentType: site.type?.toLowerCase() || 'ehpad',
            phone: site.contact?.phone || 'À définir',
            address: {
              street: site.address?.street || 'À définir',
              city: site.address?.city || 'À définir',
              postalCode: site.address?.postalCode || '',
              country: site.address?.country || 'Belgique'
            },
            isActive: true
          });
          
          console.log(`   ✅ Utilisateur créé: ${email}`);
          console.log(`   🔑 Mot de passe: ${password}`);
          stats.usersCreated++;
        } else {
          // Mettre à jour l'utilisateur existant
          if (!siteUser.siteId || siteUser.siteId.toString() !== site._id.toString()) {
            siteUser.siteId = site._id;
          }
          if (!siteUser.groupId || siteUser.groupId.toString() !== site.groupId.toString()) {
            siteUser.groupId = site.groupId;
          }
          if (!siteUser.roles || !siteUser.roles.includes('SITE_MANAGER')) {
            siteUser.roles = siteUser.roles || [];
            if (!siteUser.roles.includes('SITE_MANAGER')) {
              siteUser.roles.push('SITE_MANAGER');
            }
            if (!siteUser.roles.includes('CHEF')) {
              siteUser.roles.push('CHEF');
            }
          }
          siteUser.isActive = true;
          await siteUser.save();
          
          console.log(`   ✅ Utilisateur existant mis à jour: ${email}`);
          stats.usersUpdated++;
        }
        
        // Ajouter l'utilisateur aux managers du site
        if (!site.managers) {
          site.managers = [];
        }
        if (!site.managers.includes(siteUser._id)) {
          site.managers.push(siteUser._id);
          await site.save();
          console.log(`   ✅ Manager ajouté au site`);
        }
        
      } catch (error) {
        console.error(`   ❌ Erreur pour le site ${site.siteName}:`, error.message);
        stats.errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Sites avec managers: ${stats.sitesWithManagers}`);
    console.log(`⚠️  Sites sans managers (traités): ${stats.sitesWithoutManagers}`);
    console.log(`🆕 Utilisateurs créés: ${stats.usersCreated}`);
    console.log(`🔄 Utilisateurs mis à jour: ${stats.usersUpdated}`);
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
addManagersToSites();

