// Script de migration vers l'architecture multi-sites
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import Stock from '../models/Stock.js';
import Order from '../models/Order.js';

dotenv.config();

async function migrateToMultiSite() {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Créer un groupe par défaut pour les utilisateurs existants
    console.log('🔄 Création du groupe par défaut...');
    
    const defaultGroup = await Group.create({
      name: 'Groupe par défaut',
      code: 'default-group',
      contactEmail: 'admin@chefses.com',
      settings: {
        defaultSyncMode: 'auto',
        weekStart: 'monday',
        timezone: 'Europe/Paris',
        currency: 'EUR'
      },
      subscription: {
        plan: 'premium',
        maxSites: 10
      }
    });
    
    console.log(`✅ Groupe par défaut créé: ${defaultGroup._id}`);

    // 2. Créer un site par défaut pour chaque utilisateur existant
    console.log('🔄 Création des sites par défaut...');
    
    const users = await User.find({});
    console.log(`📊 ${users.length} utilisateurs trouvés`);

    for (const user of users) {
      // Mettre à jour l'utilisateur avec le groupe par défaut
      user.groupId = defaultGroup._id;
      
      // Définir les rôles selon le type d'utilisateur existant
      if (user.role === 'admin') {
        user.roles = ['GROUP_ADMIN'];
      } else if (user.role === 'collectivite' || user.role === 'resto') {
        user.roles = ['SITE_MANAGER'];
      } else if (user.role === 'fournisseur') {
        user.roles = ['SUPPLIER'];
      } else {
        user.roles = ['VIEWER'];
      }
      
      await user.save();

      // Créer un site pour cet utilisateur
      const siteType = mapEstablishmentType(user.establishmentType);
      
      const site = await Site.create({
        groupId: defaultGroup._id,
        siteName: user.businessName || `${user.name} - ${siteType}`,
        type: siteType,
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          postalCode: user.address?.postalCode || '',
          country: user.address?.country || 'France'
        },
        contact: {
          phone: user.phone || '',
          email: user.email,
          website: user.website || ''
        },
        managers: [user._id],
        syncMode: 'auto',
        settings: {
          timezone: 'Europe/Paris',
          mealTimes: {
            lunch: { start: '12:00', end: '14:00' },
            dinner: { start: '19:00', end: '21:00' }
          },
          capacity: {
            lunch: user.capacity || 100,
            dinner: Math.floor((user.capacity || 100) * 0.5)
          }
        }
      });

      // Assigner le site à l'utilisateur
      user.siteId = site._id;
      await user.save();

      console.log(`✅ Site créé pour ${user.name}: ${site.siteName}`);
    }

    // 3. Mettre à jour les stocks existants
    console.log('🔄 Mise à jour des stocks...');
    
    const stocks = await Stock.find({});
    console.log(`📊 ${stocks.length} stocks trouvés`);

    for (const stock of stocks) {
      const user = await User.findById(stock.createdBy);
      if (user && user.groupId && user.siteId) {
        stock.groupId = user.groupId;
        stock.siteId = user.siteId;
        await stock.save();
        console.log(`✅ Stock mis à jour pour ${user.name}`);
      }
    }

    // 4. Mettre à jour les commandes existantes
    console.log('🔄 Mise à jour des commandes...');
    
    const orders = await Order.find({});
    console.log(`📊 ${orders.length} commandes trouvées`);

    for (const order of orders) {
      const customer = await User.findById(order.customer);
      if (customer && customer.groupId && customer.siteId) {
        order.groupId = customer.groupId;
        order.siteId = customer.siteId;
        await order.save();
        console.log(`✅ Commande ${order.orderNumber} mise à jour`);
      }
    }

    console.log('🎉 Migration vers l\'architecture multi-sites terminée avec succès !');
    console.log(`📊 Résumé:`);
    console.log(`   - 1 groupe créé`);
    console.log(`   - ${users.length} sites créés`);
    console.log(`   - ${stocks.length} stocks migrés`);
    console.log(`   - ${orders.length} commandes migrées`);

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

function mapEstablishmentType(establishmentType) {
  const mapping = {
    'cantine_scolaire': 'ecole',
    'cantine_entreprise': 'collectivite',
    'ehpad': 'ehpad',
    'hopital': 'hopital',
    'maison_de_retraite': 'maison_retraite',
    'restaurant_traditionnel': 'resto',
    'traiteur': 'resto',
    'autre': 'collectivite'
  };
  
  return mapping[establishmentType] || 'collectivite';
}

// Exécuter la migration
migrateToMultiSite();
