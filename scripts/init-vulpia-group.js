import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import User from '../models/User.js';

dotenv.config();

// Liste des 12 sites Vulpia
const vulpiaSites = [
  { name: 'Arthur', email: 'arthur@vulpiagroup.com' },
  { name: 'Beukenhof', email: 'beukenhof@vulpiagroup.com' },
  { name: 'De Linde', email: 'delinde@vulpiagroup.com' },
  { name: 'De Nieuwe Kaai', email: 'denieuwkaai@vulpiagroup.com' },
  { name: 'De Veldekens', email: 'develdekens@vulpiagroup.com' },
  { name: 'Driesenhof', email: 'driesenhof@vulpiagroup.com' },
  { name: 'Elysia Park', email: 'elysiapark@vulpiagroup.com' },
  { name: 'Halmolen', email: 'halmolen@vulpiagroup.com' },
  { name: 'Henri Jaspar Premium Living', email: 'henrijaspar@vulpiagroup.com' },
  { name: 'Herenhof', email: 'herenhof@vulpiagroup.com' },
  { name: 'Villa ter Molen', email: 'villatermolen@vulpiagroup.com' },
  { name: 'Vuerenveld', email: 'vuerenveld@vulpiagroup.com' }
];

async function initVulpiaGroup() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB');

    // 1. Créer ou récupérer le groupe Vulpia
    let group = await Group.findOne({ code: 'vulpia-group' });
    
    if (!group) {
      group = await Group.create({
        name: 'Vulpia Group',
        code: 'vulpia-group',
        contactEmail: 'contact@vulpiagroup.com',
        settings: {
          defaultSyncMode: 'auto',
          weekStart: 'monday',
          timezone: 'Europe/Brussels', // Belgique
          currency: 'EUR'
        },
        isActive: true,
        subscription: {
          plan: 'enterprise',
          maxSites: 100, // Support pour 72+ sites
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 an
        }
      });
      console.log('✅ Groupe Vulpia créé');
    } else {
      console.log('✅ Groupe Vulpia déjà existant');
    }

    // 2. Créer ou récupérer le compte administrateur du groupe
    let groupAdmin = await User.findOne({ 
      email: 'admin@vulpiagroup.com',
      role: 'groupe'
    });

    if (!groupAdmin) {
      groupAdmin = await User.create({
        name: 'Administrateur Vulpia',
        email: 'admin@vulpiagroup.com',
        password: 'VulpiaAdmin2024!', // À changer après la première connexion
        role: 'groupe',
        groupId: group._id,
        roles: ['GROUP_ADMIN'],
        businessName: 'Vulpia Group',
        establishmentType: null
      });
      console.log('✅ Compte administrateur groupe créé');
      console.log('📧 Email: admin@vulpiagroup.com');
      console.log('🔑 Mot de passe: VulpiaAdmin2024!');
    } else {
      console.log('✅ Compte administrateur groupe déjà existant');
    }

    // 3. Créer les 12 sites et leurs comptes utilisateurs
    console.log('\n📍 Création des sites et comptes...\n');
    
    for (const siteData of vulpiaSites) {
      // Créer ou récupérer le site
      let site = await Site.findOne({ 
        siteName: siteData.name,
        groupId: group._id
      });

      if (!site) {
        site = await Site.create({
          groupId: group._id,
          siteName: siteData.name,
          type: 'ehpad',
          address: {
            street: 'À définir',
            city: 'Belgique',
            postalCode: '',
            country: 'Belgique'
          },
          contact: {
            email: siteData.email,
            phone: 'À définir'
          },
          managers: [],
          syncMode: 'auto',
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
          },
          syncStatus: 'synced'
        });
        console.log(`✅ Site créé: ${siteData.name}`);
      } else {
        console.log(`ℹ️  Site existant: ${siteData.name}`);
      }

      // Créer le compte utilisateur pour le site
      let siteUser = await User.findOne({ 
        email: siteData.email
      });

      if (!siteUser) {
        // Mot de passe par défaut (format: NomSite2024!)
        const defaultPassword = `${siteData.name.replace(/\s+/g, '')}2024!`;
        
        siteUser = await User.create({
          name: `Responsable ${siteData.name}`,
          email: siteData.email,
          password: defaultPassword,
          role: 'collectivite',
          establishmentType: 'ehpad',
          groupId: group._id,
          siteId: site._id,
          roles: ['SITE_MANAGER', 'NUTRITIONIST'],
          businessName: siteData.name,
          phone: 'À définir',
          address: {
            street: 'À définir',
            city: 'Belgique',
            postalCode: '',
            country: 'Belgique'
          }
        });

        // Ajouter le manager au site
        site.managers.push(siteUser._id);
        await site.save();

        console.log(`   📧 Email: ${siteData.email}`);
        console.log(`   🔑 Mot de passe: ${defaultPassword}\n`);
      } else {
        console.log(`   ℹ️  Compte existant: ${siteData.email}\n`);
      }
    }

    console.log('\n🎉 Initialisation terminée !');
    console.log(`\n📊 Résumé:`);
    console.log(`   - Groupe: ${group.name}`);
    console.log(`   - Sites créés/vérifiés: ${vulpiaSites.length}`);
    console.log(`   - Capacité max: ${group.subscription.maxSites} sites`);
    console.log(`\n🔐 Compte administrateur groupe:`);
    console.log(`   - Email: admin@vulpiagroup.com`);
    console.log(`   - URL: https://chefsess.onrender.com`);
    console.log(`\n🏢 Comptes des sites:`);
    console.log(`   - Se connectent sur: https://chefsess.onrender.com/site-login.html`);
    console.log(`   - Format email: nomdusite@vulpiagroup.com`);

  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connexion MongoDB fermée');
  }
}

// Exécuter le script
initVulpiaGroup();

