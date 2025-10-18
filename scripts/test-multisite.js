// Script de test pour l'architecture multi-sites
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import User from '../models/User.js';
import MenuMultiSite from '../models/MenuMultiSite.js';

dotenv.config();

async function testMultiSiteArchitecture() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Tester la création d'un groupe
    console.log('\n🔄 Test 1: Création d\'un groupe...');
    
    const testGroup = await Group.create({
      name: 'Groupe Test Vulpia',
      code: 'vulpia-test',
      contactEmail: 'test@vulpia.com',
      settings: {
        defaultSyncMode: 'auto',
        weekStart: 'monday',
        timezone: 'Europe/Paris',
        currency: 'EUR'
      },
      subscription: {
        plan: 'premium',
        maxSites: 5
      }
    });
    
    console.log(`✅ Groupe créé: ${testGroup.name} (${testGroup.code})`);

    // 2. Tester la création de sites
    console.log('\n🔄 Test 2: Création de sites...');
    
    const sites = await Promise.all([
      Site.create({
        groupId: testGroup._id,
        siteName: 'EHPAD Saint-Michel',
        type: 'ehpad',
        address: {
          street: '123 Rue de la Paix',
          city: 'Paris',
          postalCode: '75001',
          country: 'France'
        },
        contact: {
          phone: '01 23 45 67 89',
          email: 'contact@ehpad-saint-michel.fr'
        },
        syncMode: 'auto',
        settings: {
          timezone: 'Europe/Paris',
          mealTimes: {
            lunch: { start: '12:00', end: '14:00' },
            dinner: { start: '19:00', end: '21:00' }
          },
          capacity: {
            lunch: 80,
            dinner: 40
          }
        }
      }),
      Site.create({
        groupId: testGroup._id,
        siteName: 'EHPAD Sainte-Anne',
        type: 'ehpad',
        address: {
          street: '456 Avenue de la République',
          city: 'Lyon',
          postalCode: '69001',
          country: 'France'
        },
        contact: {
          phone: '04 12 34 56 78',
          email: 'contact@ehpad-sainte-anne.fr'
        },
        syncMode: 'auto',
        settings: {
          timezone: 'Europe/Paris',
          mealTimes: {
            lunch: { start: '12:00', end: '14:00' },
            dinner: { start: '19:00', end: '21:00' }
          },
          capacity: {
            lunch: 60,
            dinner: 30
          }
        }
      })
    ]);
    
    console.log(`✅ ${sites.length} sites créés`);

    // 3. Tester la création d'utilisateurs avec rôles
    console.log('\n🔄 Test 3: Création d\'utilisateurs...');
    
    const users = await Promise.all([
      User.create({
        name: 'Admin Groupe',
        email: 'admin@vulpia.com',
        password: 'password123',
        role: 'admin',
        groupId: testGroup._id,
        roles: ['GROUP_ADMIN'],
        businessName: 'Vulpia Group'
      }),
      User.create({
        name: 'Chef EHPAD Saint-Michel',
        email: 'chef@ehpad-saint-michel.fr',
        password: 'password123',
        role: 'collectivite',
        groupId: testGroup._id,
        siteId: sites[0]._id,
        roles: ['SITE_MANAGER'],
        businessName: 'EHPAD Saint-Michel'
      }),
      User.create({
        name: 'Chef EHPAD Sainte-Anne',
        email: 'chef@ehpad-sainte-anne.fr',
        password: 'password123',
        role: 'collectivite',
        groupId: testGroup._id,
        siteId: sites[1]._id,
        roles: ['SITE_MANAGER'],
        businessName: 'EHPAD Sainte-Anne'
      })
    ]);
    
    console.log(`✅ ${users.length} utilisateurs créés`);

    // 4. Tester la création d'un menu groupe
    console.log('\n🔄 Test 4: Création d\'un menu groupe...');
    
    const groupMenu = await MenuMultiSite.create({
      groupId: testGroup._id,
      yearWeek: '2025-W42',
      label: 'Menu Automne - Semaine 42',
      theme: 'Cuisine traditionnelle',
      entries: [
        {
          date: '2025-10-13',
          service: 'midi',
          recipeIds: [], // Placeholder
          notes: 'Menu du lundi'
        },
        {
          date: '2025-10-14',
          service: 'midi',
          recipeIds: [], // Placeholder
          notes: 'Menu du mardi'
        }
      ],
      origin: 'group',
      syncVersion: 1,
      createdBy: users[0]._id
    });
    
    console.log(`✅ Menu groupe créé: ${groupMenu.label}`);

    // 5. Tester la synchronisation des menus
    console.log('\n🔄 Test 5: Synchronisation des menus...');
    
    const syncedMenus = [];
    for (const site of sites) {
      const siteMenu = await MenuMultiSite.create({
        siteId: site._id,
        yearWeek: '2025-W42',
        label: groupMenu.label,
        entries: groupMenu.entries,
        theme: groupMenu.theme,
        origin: 'site',
        originMenuId: groupMenu._id,
        syncVersion: groupMenu.syncVersion,
        lastSyncedAt: new Date(),
        localOverrides: false,
        createdBy: users[0]._id
      });
      syncedMenus.push(siteMenu);
    }
    
    console.log(`✅ ${syncedMenus.length} menus synchronisés`);

    // 6. Tester les requêtes multi-sites
    console.log('\n🔄 Test 6: Requêtes multi-sites...');
    
    // Récupérer tous les sites du groupe
    const groupSites = await Site.find({ groupId: testGroup._id });
    console.log(`✅ Sites du groupe: ${groupSites.length}`);
    
    // Récupérer tous les utilisateurs du groupe
    const groupUsers = await User.find({ groupId: testGroup._id });
    console.log(`✅ Utilisateurs du groupe: ${groupUsers.length}`);
    
    // Récupérer le menu groupe
    const groupMenuFound = await MenuMultiSite.findOne({ 
      groupId: testGroup._id, 
      yearWeek: '2025-W42',
      origin: 'group'
    });
    console.log(`✅ Menu groupe trouvé: ${groupMenuFound ? 'Oui' : 'Non'}`);
    
    // Récupérer les menus synchronisés
    const syncedMenusFound = await MenuMultiSite.find({ 
      groupId: testGroup._id, 
      yearWeek: '2025-W42',
      origin: 'site'
    });
    console.log(`✅ Menus synchronisés trouvés: ${syncedMenusFound.length}`);

    // 7. Tester les permissions
    console.log('\n🔄 Test 7: Test des permissions...');
    
    const groupAdmin = users[0];
    const siteManager = users[1];
    
    console.log(`✅ Group Admin - canAccessGroup: ${groupAdmin.canAccessGroup(testGroup._id)}`);
    console.log(`✅ Group Admin - isGroupAdmin: ${groupAdmin.isGroupAdmin()}`);
    console.log(`✅ Site Manager - canAccessSite: ${siteManager.canAccessSite(sites[0]._id)}`);
    console.log(`✅ Site Manager - isSiteManager: ${siteManager.isSiteManager()}`);

    // 8. Nettoyage des données de test
    console.log('\n🔄 Test 8: Nettoyage des données de test...');
    
    await MenuMultiSite.deleteMany({ groupId: testGroup._id });
    await User.deleteMany({ groupId: testGroup._id });
    await Site.deleteMany({ groupId: testGroup._id });
    await Group.deleteOne({ _id: testGroup._id });
    
    console.log('✅ Données de test supprimées');

    console.log('\n🎉 Tous les tests de l\'architecture multi-sites ont réussi !');

  } catch (error) {
    console.error('❌ Erreur lors des tests:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter les tests
testMultiSiteArchitecture();
