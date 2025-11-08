import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Site from '../models/Site.js';
import User from '../models/User.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';

async function fixBrusselsLivingUser() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver le site "Brussels Living"
    const brusselsLivingSite = await Site.findOne({ 
      siteName: { $regex: /brussels living/i } 
    });
    
    if (!brusselsLivingSite) {
      console.log('❌ Site "Brussels Living" non trouvé');
      await mongoose.disconnect();
      return;
    }
    
    console.log(`📍 Site trouvé: ${brusselsLivingSite.siteName} (${brusselsLivingSite._id})`);
    console.log(`   Groupe: ${brusselsLivingSite.groupId}`);
    console.log(`   Managers actuels: ${brusselsLivingSite.managers?.length || 0}`);
    
    // Trouver tous les utilisateurs pour ce site
    const siteId = brusselsLivingSite._id;
    const siteIdStr = siteId.toString();
    
    // Chercher avec ObjectId et string
    const usersForSite = await User.find({
      $or: [
        { siteId: siteId },
        { siteId: siteIdStr }
      ],
      isActive: true
    }).select('_id name email role siteId roles groupId');
    
    console.log(`\n👥 ${usersForSite.length} utilisateur(s) trouvé(s) pour ce site:`);
    usersForSite.forEach(u => {
      console.log(`   - ${u.name || u.email} (${u._id})`);
      console.log(`     Role: ${u.role}, Roles: ${u.roles?.join(', ') || 'N/A'}`);
      console.log(`     siteId: ${u.siteId}`);
      console.log(`     groupId: ${u.groupId}`);
      console.log(`     Dans Site.managers: ${brusselsLivingSite.managers?.some(m => m.toString() === u._id.toString()) ? '✅ OUI' : '❌ NON'}`);
    });
    
    // Vérifier l'utilisateur connecté spécifique
    const connectedUserId = '68fbfaff555f8032269fa3bb';
    const connectedUser = await User.findById(connectedUserId);
    
    if (connectedUser) {
      console.log(`\n🔍 Utilisateur connecté trouvé:`);
      console.log(`   - ${connectedUser.name || connectedUser.email} (${connectedUser._id})`);
      console.log(`   - siteId: ${connectedUser.siteId}`);
      console.log(`   - groupId: ${connectedUser.groupId}`);
      console.log(`   - Role: ${connectedUser.role}, Roles: ${connectedUser.roles?.join(', ') || 'N/A'}`);
      
      const hasCorrectSiteId = connectedUser.siteId && (
        connectedUser.siteId.toString() === siteIdStr || 
        connectedUser.siteId.toString() === siteId.toString()
      );
      
      if (!hasCorrectSiteId) {
        console.log(`\n⚠️  L'utilisateur connecté n'a pas le bon siteId !`);
        console.log(`   SiteId actuel: ${connectedUser.siteId}`);
        console.log(`   SiteId attendu: ${siteIdStr}`);
        console.log(`\n🔧 Correction du siteId...`);
        
        connectedUser.siteId = siteId;
        if (!connectedUser.groupId || connectedUser.groupId.toString() !== brusselsLivingSite.groupId.toString()) {
          connectedUser.groupId = brusselsLivingSite.groupId;
        }
        if (!connectedUser.roles || !connectedUser.roles.includes('SITE_MANAGER')) {
          connectedUser.roles = connectedUser.roles || [];
          if (!connectedUser.roles.includes('SITE_MANAGER')) {
            connectedUser.roles.push('SITE_MANAGER');
          }
          if (!connectedUser.roles.includes('CHEF')) {
            connectedUser.roles.push('CHEF');
          }
        }
        await connectedUser.save();
        console.log(`✅ Utilisateur connecté mis à jour avec le bon siteId`);
      }
      
      // Vérifier si l'utilisateur est dans Site.managers
      const isInManagers = brusselsLivingSite.managers?.some(m => m.toString() === connectedUserId);
      if (!isInManagers) {
        console.log(`\n⚠️  L'utilisateur connecté n'est pas dans Site.managers !`);
        console.log(`🔧 Ajout de l'utilisateur aux managers...`);
        
        if (!brusselsLivingSite.managers) {
          brusselsLivingSite.managers = [];
        }
        if (!brusselsLivingSite.managers.includes(connectedUser._id)) {
          brusselsLivingSite.managers.push(connectedUser._id);
          await brusselsLivingSite.save();
          console.log(`✅ Utilisateur ajouté aux managers du site`);
        }
      } else {
        console.log(`✅ L'utilisateur connecté est déjà dans Site.managers`);
      }
    } else {
      console.log(`\n❌ Utilisateur connecté (${connectedUserId}) non trouvé dans la base de données`);
    }
    
    // Vérifier l'autre utilisateur
    const otherUserId = '690f88c867314f6760a8924b';
    const otherUser = await User.findById(otherUserId);
    
    if (otherUser) {
      console.log(`\n🔍 Autre utilisateur trouvé:`);
      console.log(`   - ${otherUser.name || otherUser.email} (${otherUser._id})`);
      console.log(`   - siteId: ${otherUser.siteId}`);
      console.log(`   - groupId: ${otherUser.groupId}`);
      console.log(`   - Role: ${otherUser.role}, Roles: ${otherUser.roles?.join(', ') || 'N/A'}`);
      console.log(`   - Dans Site.managers: ${brusselsLivingSite.managers?.some(m => m.toString() === otherUserId) ? '✅ OUI' : '❌ NON'}`);
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Vérification terminée');
    console.log('='.repeat(60));

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
fixBrusselsLivingUser();

