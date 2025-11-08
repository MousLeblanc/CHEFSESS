import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Site from '../models/Site.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function fixAllSitesManagers() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver tous les sites actifs
    const sites = await Site.find({ isActive: true }).populate('groupId', 'name');
    
    console.log(`📊 ${sites.length} site(s) actif(s) trouvé(s)\n`);

    let stats = {
      sitesChecked: 0,
      usersAddedToManagers: 0,
      usersFixed: 0,
      errors: 0
    };

    for (const site of sites) {
      try {
        stats.sitesChecked++;
        const siteId = site._id;
        const siteIdStr = siteId.toString();
        
        // Trouver tous les utilisateurs pour ce site (avec ObjectId ET string)
        const usersForSite = await User.find({
          $or: [
            { siteId: siteId },
            { siteId: siteIdStr }
          ],
          isActive: true
        }).select('_id name email role siteId roles groupId');
        
        if (usersForSite.length === 0) {
          continue; // Pas d'utilisateurs pour ce site
        }
        
        // Vérifier chaque utilisateur
        for (const user of usersForSite) {
          // Vérifier si l'utilisateur est dans Site.managers
          const isInManagers = site.managers?.some(m => {
            const managerId = typeof m === 'object' ? m._id?.toString() || m.toString() : m.toString();
            return managerId === user._id.toString();
          });
          
          if (!isInManagers) {
            console.log(`\n📍 Site: ${site.siteName} (${site._id})`);
            console.log(`   ⚠️  Utilisateur ${user.name || user.email} (${user._id}) n'est pas dans Site.managers`);
            console.log(`   🔧 Ajout de l'utilisateur aux managers...`);
            
            if (!site.managers) {
              site.managers = [];
            }
            if (!site.managers.includes(user._id)) {
              site.managers.push(user._id);
              stats.usersAddedToManagers++;
            }
            
            // S'assurer que l'utilisateur a les bons rôles
            if (!user.roles || !user.roles.includes('SITE_MANAGER')) {
              user.roles = user.roles || [];
              if (!user.roles.includes('SITE_MANAGER')) {
                user.roles.push('SITE_MANAGER');
              }
              if (!user.roles.includes('CHEF') && user.role === 'collectivite') {
                user.roles.push('CHEF');
              }
              await user.save();
              stats.usersFixed++;
            }
          }
        }
        
        // Sauvegarder le site si des managers ont été ajoutés
        if (stats.usersAddedToManagers > 0) {
          await site.save();
        }
        
      } catch (error) {
        console.error(`   ❌ Erreur pour le site ${site.siteName}:`, error.message);
        stats.errors++;
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(60));
    console.log(`✅ Sites vérifiés: ${stats.sitesChecked}`);
    console.log(`👥 Utilisateurs ajoutés aux managers: ${stats.usersAddedToManagers}`);
    console.log(`🔧 Utilisateurs corrigés (rôles): ${stats.usersFixed}`);
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
fixAllSitesManagers();

