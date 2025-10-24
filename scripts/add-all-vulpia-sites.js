import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import User from '../models/User.js';

dotenv.config();

// 🏢 LISTE COMPLÈTE DES 72 SITES VULPIA GROUP
// Sites 1-12 (déjà actifs)
const existingSites = [
  { name: 'Arthur', email: 'arthur@vulpiagroup.com', city: 'Brussels', capacity: 85, active: true },
  { name: 'Beukenhof', email: 'beukenhof@vulpiagroup.com', city: 'Antwerpen', capacity: 90, active: true },
  { name: 'De Linde', email: 'delinde@vulpiagroup.com', city: 'Gent', capacity: 78, active: true },
  { name: 'De Nieuwe Kaai', email: 'denieuwkaai@vulpiagroup.com', city: 'Mechelen', capacity: 82, active: true },
  { name: 'De Veldekens', email: 'develdekens@vulpiagroup.com', city: 'Leuven', capacity: 75, active: true },
  { name: 'Driesenhof', email: 'driesenhof@vulpiagroup.com', city: 'Hasselt', capacity: 88, active: true },
  { name: 'Elysia Park', email: 'elysiapark@vulpiagroup.com', city: 'Brugge', capacity: 95, active: true },
  { name: 'Halmolen', email: 'halmolen@vulpiagroup.com', city: 'Genk', capacity: 80, active: true },
  { name: 'Henri Jaspar Premium Living', email: 'henrijaspar@vulpiagroup.com', city: 'Brussels', capacity: 110, active: true },
  { name: 'Herenhof', email: 'herenhof@vulpiagroup.com', city: 'Aalst', capacity: 72, active: true },
  { name: 'Villa ter Molen', email: 'villatermolen@vulpiagroup.com', city: 'Kortrijk', capacity: 85, active: true },
  { name: 'Vuerenveld', email: 'vuerenveld@vulpiagroup.com', city: 'Turnhout', capacity: 78, active: true }
];

// Sites 13-72 (nouveaux à ajouter)
const newSites = [
  // Région Flandre Occidentale
  { name: 'Abdijhof', email: 'abdijhof@vulpiagroup.com', city: 'Brugge', capacity: 65, active: false },
  { name: 'Beukenpark', email: 'beukenpark@vulpiagroup.com', city: 'Oostende', capacity: 70, active: false },
  { name: 'De Boomgaard', email: 'deboomgaard@vulpiagroup.com', city: 'Kortrijk', capacity: 58, active: false },
  { name: 'De Ceder', email: 'deceder@vulpiagroup.com', city: 'Roeselare', capacity: 62, active: false },
  { name: 'De Horizon', email: 'dehorizon@vulpiagroup.com', city: 'Veurne', capacity: 55, active: false },
  { name: 'Duinenhof', email: 'duinenhof@vulpiagroup.com', city: 'Nieuwpoort', capacity: 60, active: false },
  { name: 'Kustpark', email: 'kustpark@vulpiagroup.com', city: 'De Panne', capacity: 52, active: false },
  { name: 'Lindenhof', email: 'lindenhof@vulpiagroup.com', city: 'Ieper', capacity: 68, active: false },
  { name: 'Ons Erf', email: 'onserf@vulpiagroup.com', city: 'Tielt', capacity: 54, active: false },
  { name: 'Zonnepark', email: 'zonnepark@vulpiagroup.com', city: 'Waregem', capacity: 72, active: false },

  // Région Flandre Orientale
  { name: 'Beatrijs', email: 'beatrijs@vulpiagroup.com', city: 'Gent', capacity: 85, active: false },
  { name: 'De Esdoorn', email: 'deesdoorn@vulpiagroup.com', city: 'Sint-Niklaas', capacity: 75, active: false },
  { name: 'De Plataan', email: 'deplataan@vulpiagroup.com', city: 'Dendermonde', capacity: 68, active: false },
  { name: 'De Wingerd', email: 'dewingerd@vulpiagroup.com', city: 'Aalst', capacity: 70, active: false },
  { name: 'Groenhof', email: 'groenhof@vulpiagroup.com', city: 'Eeklo', capacity: 58, active: false },
  { name: 'Kastanjehof', email: 'kastanjehof@vulpiagroup.com', city: 'Wetteren', capacity: 62, active: false },
  { name: 'Parkzicht', email: 'parkzicht@vulpiagroup.com', city: 'Lokeren', capacity: 65, active: false },
  { name: 'Residenz Maria', email: 'residenzmaria@vulpiagroup.com', city: 'Oudenaarde', capacity: 72, active: false },
  { name: 'Ter Beke', email: 'terbeke@vulpiagroup.com', city: 'Zottegem', capacity: 55, active: false },
  { name: 'Volkshuis', email: 'volkshuis@vulpiagroup.com', city: 'Geraardsbergen', capacity: 60, active: false },

  // Région Anvers
  { name: 'De Populier', email: 'depopulier@vulpiagroup.com', city: 'Antwerpen', capacity: 90, active: false },
  { name: 'De Wilg', email: 'dewilg@vulpiagroup.com', city: 'Mechelen', capacity: 78, active: false },
  { name: 'Elzenhof', email: 'elzenhof@vulpiagroup.com', city: 'Heist-op-den-Berg', capacity: 65, active: false },
  { name: 'Kempenrust', email: 'kempenrust@vulpiagroup.com', city: 'Turnhout', capacity: 72, active: false },
  { name: 'Lindeborg', email: 'lindeborg@vulpiagroup.com', city: 'Lier', capacity: 68, active: false },
  { name: 'Notenhof', email: 'notenhof@vulpiagroup.com', city: 'Geel', capacity: 70, active: false },
  { name: 'Scheldehof', email: 'scheldehof@vulpiagroup.com', city: 'Boom', capacity: 62, active: false },
  { name: 'Villa Nova', email: 'villanova@vulpiagroup.com', city: 'Mortsel', capacity: 75, active: false },
  { name: 'Weilandhof', email: 'weilandhof@vulpiagroup.com', city: 'Mol', capacity: 58, active: false },
  { name: 'Zilverberk', email: 'zilverberk@vulpiagroup.com', city: 'Hoogstraten', capacity: 55, active: false },

  // Région Limbourg
  { name: 'De Eik', email: 'deeik@vulpiagroup.com', city: 'Hasselt', capacity: 82, active: false },
  { name: 'De Merel', email: 'demerel@vulpiagroup.com', city: 'Genk', capacity: 85, active: false },
  { name: 'Dennenhof', email: 'dennenhof@vulpiagroup.com', city: 'Tongeren', capacity: 65, active: false },
  { name: 'Hoevehof', email: 'hoevehof@vulpiagroup.com', city: 'Sint-Truiden', capacity: 70, active: false },
  { name: 'Maashof', email: 'maashof@vulpiagroup.com', city: 'Maaseik', capacity: 62, active: false },
  { name: 'Minnehof', email: 'minnehof@vulpiagroup.com', city: 'Beringen', capacity: 68, active: false },
  { name: 'Rustenburgh', email: 'rustenburgh@vulpiagroup.com', city: 'Bilzen', capacity: 58, active: false },
  { name: 'Villa Limburgia', email: 'villalimburgia@vulpiagroup.com', city: 'Lommel', capacity: 72, active: false },
  { name: 'Vredehof', email: 'vredehof@vulpiagroup.com', city: 'Houthalen', capacity: 60, active: false },
  { name: 'Zonnewende', email: 'zonnewende@vulpiagroup.com', city: 'Pelt', capacity: 55, active: false },

  // Région Brabant Flamand
  { name: 'De Akker', email: 'deakker@vulpiagroup.com', city: 'Leuven', capacity: 80, active: false },
  { name: 'De Meiboom', email: 'demeiboom@vulpiagroup.com', city: 'Aarschot', capacity: 65, active: false },
  { name: 'Dijlehof', email: 'dijlehof@vulpiagroup.com', city: 'Tienen', capacity: 70, active: false },
  { name: 'Grebbelinck', email: 'grebbelinck@vulpiagroup.com', city: 'Vilvoorde', capacity: 75, active: false },
  { name: 'Heidehof', email: 'heidehof@vulpiagroup.com', city: 'Diest', capacity: 62, active: false },
  { name: 'Koningshof', email: 'koningshof@vulpiagroup.com', city: 'Zaventem', capacity: 85, active: false },
  { name: 'Leuvenhof', email: 'leuvenhof@vulpiagroup.com', city: 'Heverlee', capacity: 68, active: false },
  { name: 'Parkhof', email: 'parkhof@vulpiagroup.com', city: 'Rotselaar', capacity: 58, active: false },
  { name: 'Sterckxhof', email: 'sterckxhof@vulpiagroup.com', city: 'Haacht', capacity: 55, active: false },
  { name: 'Ter Borcht', email: 'terborcht@vulpiagroup.com', city: 'Machelen', capacity: 72, active: false },

  // Région Bruxelles-Capitale
  { name: 'Brussels Living', email: 'brusselsliving@vulpiagroup.com', city: 'Brussels', capacity: 95, active: false },
  { name: 'Europa Residentie', email: 'europaresidentie@vulpiagroup.com', city: 'Brussels', capacity: 88, active: false },
  { name: 'La Cambre', email: 'lacambre@vulpiagroup.com', city: 'Brussels', capacity: 75, active: false },
  { name: 'Le Chêne', email: 'lechene@vulpiagroup.com', city: 'Brussels', capacity: 80, active: false },
  { name: 'Les Jardins', email: 'lesjardins@vulpiagroup.com', city: 'Brussels', capacity: 72, active: false },
  { name: 'Résidence Royal', email: 'residenceroyal@vulpiagroup.com', city: 'Brussels', capacity: 105, active: false },
  { name: 'Sainte Anne', email: 'sainteanne@vulpiagroup.com', city: 'Brussels', capacity: 68, active: false },
  { name: 'Ter Kameren', email: 'terkameren@vulpiagroup.com', city: 'Brussels', capacity: 90, active: false },
  { name: 'Villa Schuman', email: 'villaschuman@vulpiagroup.com', city: 'Brussels', capacity: 82, active: false },
  { name: 'Zoniënwoud', email: 'zonienwoud@vulpiagroup.com', city: 'Brussels', capacity: 78, active: false }
];

// Tous les sites (72 au total)
const allSites = [...existingSites, ...newSites];

async function addAllVulpiaSites() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le groupe Vulpia
    const group = await Group.findOne({ code: 'vulpia-group' });
    
    if (!group) {
      console.error('❌ Groupe Vulpia non trouvé. Exécutez d\'abord "npm run init-vulpia"');
      process.exit(1);
    }

    console.log(`🏢 Groupe trouvé: ${group.name}`);
    console.log(`📊 Capacité max: ${group.subscription.maxSites} sites\n`);

    // Statistiques
    let stats = {
      existingUpdated: 0,
      newCreated: 0,
      usersCreated: 0,
      usersExisting: 0,
      errors: []
    };

    console.log('📍 Traitement des 72 sites Vulpia...\n');

    for (const siteData of allSites) {
      try {
        console.log(`\n🔄 Traitement: ${siteData.name}`);
        
        // Créer ou récupérer le site
        let site = await Site.findOne({ 
          siteName: siteData.name,
          groupId: group._id
        });

        const siteInfo = {
          groupId: group._id,
          siteName: siteData.name,
          type: 'ehpad',
          address: {
            street: 'À définir',
            city: siteData.city,
            postalCode: '',
            country: 'Belgique'
          },
          contact: {
            email: siteData.email,
            phone: 'À définir'
          },
          managers: [],
          syncMode: 'auto',
          isActive: siteData.active,
          settings: {
            timezone: 'Europe/Brussels',
            mealTimes: {
              lunch: { start: '12:00', end: '14:00' },
              dinner: { start: '18:00', end: '20:00' }
            },
            capacity: {
              lunch: siteData.capacity,
              dinner: siteData.capacity
            }
          },
          syncStatus: 'pending'
        };

        if (!site) {
          site = await Site.create(siteInfo);
          stats.newCreated++;
          console.log(`   ✅ Site créé (${siteData.active ? 'ACTIF' : 'INACTIF'})`);
        } else {
          // Mettre à jour les infos si le site existe déjà
          await Site.updateOne({ _id: site._id }, { 
            $set: {
              isActive: siteData.active,
              'address.city': siteData.city,
              'settings.capacity.lunch': siteData.capacity,
              'settings.capacity.dinner': siteData.capacity
            }
          });
          stats.existingUpdated++;
          console.log(`   ℹ️  Site existant mis à jour (${siteData.active ? 'ACTIF' : 'INACTIF'})`);
        }

        // Créer le compte utilisateur pour le site
        let siteUser = await User.findOne({ email: siteData.email });

        if (!siteUser) {
          // Mot de passe par défaut (format: NomSite2024!)
          const siteName = siteData.name.replace(/\s+/g, '').replace(/[^a-zA-Z0-9]/g, '');
          const defaultPassword = `${siteName}2024!`;
          
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
              city: siteData.city,
              postalCode: '',
              country: 'Belgique'
            }
          });

          // Ajouter le manager au site si pas déjà présent
          if (!site.managers.includes(siteUser._id)) {
            site.managers.push(siteUser._id);
            await site.save();
          }

          stats.usersCreated++;
          console.log(`   📧 Compte créé: ${siteData.email}`);
          console.log(`   🔑 Mot de passe: ${defaultPassword}`);
        } else {
          // Mettre à jour le siteId si nécessaire
          if (!siteUser.siteId || siteUser.siteId.toString() !== site._id.toString()) {
            siteUser.siteId = site._id;
            await siteUser.save();
          }
          
          // Ajouter le manager au site si pas déjà présent
          if (!site.managers.includes(siteUser._id)) {
            site.managers.push(siteUser._id);
            await site.save();
          }
          
          stats.usersExisting++;
          console.log(`   ℹ️  Compte existant: ${siteData.email}`);
        }

        console.log(`   📍 Ville: ${siteData.city}`);
        console.log(`   👥 Capacité: ${siteData.capacity} résidents`);

      } catch (error) {
        console.error(`   ❌ Erreur pour ${siteData.name}:`, error.message);
        stats.errors.push({ site: siteData.name, error: error.message });
      }
    }

    // Résumé final
    console.log('\n' + '='.repeat(70));
    console.log('🎉 TRAITEMENT TERMINÉ !');
    console.log('='.repeat(70));
    console.log(`\n📊 STATISTIQUES :`);
    console.log(`   • Total de sites traités : ${allSites.length}`);
    console.log(`   • Sites actifs : ${existingSites.length}`);
    console.log(`   • Sites inactifs : ${newSites.length}`);
    console.log(`   • Nouveaux sites créés : ${stats.newCreated}`);
    console.log(`   • Sites existants mis à jour : ${stats.existingUpdated}`);
    console.log(`   • Nouveaux comptes utilisateurs : ${stats.usersCreated}`);
    console.log(`   • Comptes existants : ${stats.usersExisting}`);
    console.log(`   • Erreurs : ${stats.errors.length}`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  ERREURS :`);
      stats.errors.forEach(err => {
        console.log(`   - ${err.site}: ${err.error}`);
      });
    }

    // Vérification finale
    const totalSites = await Site.countDocuments({ groupId: group._id });
    const activeSites = await Site.countDocuments({ groupId: group._id, isActive: true });
    const inactiveSites = await Site.countDocuments({ groupId: group._id, isActive: false });

    console.log(`\n✅ VÉRIFICATION BASE DE DONNÉES :`);
    console.log(`   • Total sites en DB : ${totalSites}`);
    console.log(`   • Sites actifs : ${activeSites}`);
    console.log(`   • Sites inactifs : ${inactiveSites}`);

    console.log(`\n🔐 ACCÈS :`);
    console.log(`   • Admin groupe : admin@vulpiagroup.com`);
    console.log(`   • URL admin : https://chefsess.onrender.com`);
    console.log(`   • URL sites : https://chefsess.onrender.com/site-login.html`);
    console.log(`   • Format email site : nomdusite@vulpiagroup.com`);

    console.log(`\n💡 POUR ACTIVER UN SITE INACTIF :`);
    console.log(`   • Connectez-vous en tant qu'admin groupe`);
    console.log(`   • Allez dans la gestion des sites`);
    console.log(`   • Activez le site souhaité`);

  } catch (error) {
    console.error('\n❌ ERREUR CRITIQUE:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n✅ Connexion MongoDB fermée');
  }
}

// Exécuter le script
addAllVulpiaSites();

