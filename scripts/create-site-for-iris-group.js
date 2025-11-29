import mongoose from 'mongoose';
import User from './models/User.js';
import Site from './models/Site.js';
import Group from './models/Group.js';
import bcrypt from 'bcryptjs';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/chefses';

/**
 * Script pour créer un site et son utilisateur pour le groupe iris@gmail.com
 * 
 * Usage:
 * node scripts/create-site-for-iris-group.js
 * 
 * Ou avec des paramètres:
 * SITE_NAME="EHPAD Exemple" SITE_EMAIL="exemple@group.com" SITE_PASSWORD="MotDePasse123!" node scripts/create-site-for-iris-group.js
 */

async function createSiteForIrisGroup() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Trouver le groupe par email de l'admin
    const groupAdmin = await User.findOne({ email: 'iris@gmail.com' });
    if (!groupAdmin) {
      throw new Error('❌ Utilisateur iris@gmail.com non trouvé. Assurez-vous que le compte groupe existe.');
    }

    if (!groupAdmin.groupId) {
      throw new Error('❌ L\'utilisateur iris@gmail.com n\'a pas de groupId associé. Il doit être un administrateur de groupe.');
    }

    const group = await Group.findById(groupAdmin.groupId);
    if (!group) {
      throw new Error('❌ Groupe non trouvé pour iris@gmail.com');
    }

    console.log(`✅ Groupe trouvé: ${group.name} (${group.code || 'N/A'})\n`);

    // 2. Demander les informations du site (ou utiliser les variables d'environnement)
    const siteName = process.env.SITE_NAME || 'EHPAD Exemple';
    const siteEmail = process.env.SITE_EMAIL || 'exemple@group.com';
    const sitePassword = process.env.SITE_PASSWORD || 'Exemple2024!';
    const siteType = process.env.SITE_TYPE || 'ehpad';

    console.log(`📋 Création du site:`);
    console.log(`   Nom: ${siteName}`);
    console.log(`   Email: ${siteEmail}`);
    console.log(`   Type: ${siteType}\n`);

    // 3. Créer ou récupérer le site
    let site = await Site.findOne({ 
      siteName: siteName,
      groupId: group._id
    });

    if (!site) {
      site = await Site.create({
        groupId: group._id,
        siteName: siteName,
        type: siteType,
        address: {
          street: 'À définir',
          city: 'Bruxelles',
          postalCode: '',
          country: 'Belgique'
        },
        contact: {
          email: siteEmail,
          phone: 'À définir'
        },
        isActive: true,
        settings: {
          timezone: 'Europe/Brussels',
          mealTimes: {
            lunch: { start: '12:00', end: '14:00' },
            dinner: { start: '18:00', end: '20:00' }
          },
          capacity: {
            lunch: 80,
            dinner: 80
          }
        }
      });
      console.log(`✅ Site créé: ${site.siteName} (ID: ${site._id})`);
    } else {
      console.log(`ℹ️  Site existant: ${site.siteName} (ID: ${site._id})`);
    }

    // 4. Créer ou mettre à jour l'utilisateur
    let user = await User.findOne({ email: siteEmail });

    if (!user) {
      const hashedPassword = await bcrypt.hash(sitePassword, 10);
      user = await User.create({
        name: `Responsable ${siteName}`,
        email: siteEmail,
        password: hashedPassword,
        role: 'collectivite',
        groupId: group._id,
        siteId: site._id,
        roles: ['SITE_MANAGER', 'CHEF'],
        businessName: siteName,
        establishmentType: siteType,
        isActive: true
      });
      console.log(`✅ Utilisateur créé: ${user.email} (ID: ${user._id})`);
      console.log(`🔑 Mot de passe: ${sitePassword}`);
    } else {
      // Mettre à jour l'utilisateur existant
      let updated = false;
      
      if (!user.siteId || user.siteId.toString() !== site._id.toString()) {
        user.siteId = site._id;
        updated = true;
      }
      
      if (!user.groupId || user.groupId.toString() !== group._id.toString()) {
        user.groupId = group._id;
        updated = true;
      }
      
      if (!user.roles || user.roles.length === 0) {
        user.roles = ['SITE_MANAGER', 'CHEF'];
        updated = true;
      }
      
      if (user.role !== 'collectivite') {
        user.role = 'collectivite';
        updated = true;
      }

      if (updated) {
        await user.save();
        console.log(`✅ Utilisateur mis à jour: ${user.email}`);
      } else {
        console.log(`ℹ️  Utilisateur existant: ${user.email}`);
      }
    }

    // 5. Ajouter l'utilisateur aux managers du site
    if (!site.managers.includes(user._id)) {
      site.managers.push(user._id);
      await site.save();
      console.log(`✅ Utilisateur ajouté aux managers du site`);
    }

    // 6. Afficher les informations de connexion
    console.log('\n' + '='.repeat(60));
    console.log('✅ CONFIGURATION TERMINÉE !');
    console.log('='.repeat(60));
    console.log(`\n📋 Informations de connexion pour le site:`);
    console.log(`   URL: http://localhost:5000/site-login.html`);
    console.log(`   Email: ${siteEmail}`);
    console.log(`   Mot de passe: ${sitePassword}`);
    console.log(`\n📝 Note: Le site se connecte avec son EMAIL et MOT DE PASSE`);
    console.log(`   Le système trouve automatiquement le site via l'email de l'utilisateur.\n`);

  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  }
}

createSiteForIrisGroup();

