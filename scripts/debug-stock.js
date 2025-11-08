// Script de diagnostic pour vérifier l'état du stock dans MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Stock from '../models/Stock.js';
import User from '../models/User.js';
import Order from '../models/Order.js';
import Site from '../models/Site.js';

dotenv.config({ path: '../.env' });

async function debugStock() {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/chef-ses';
    console.log(`🔌 Connexion à MongoDB: ${mongoUri.replace(/\/\/.*@/, '//***@')}`);
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver le site "Arthur"
    const sites = await Site.find({ name: /arthur/i });
    console.log(`🏢 ${sites.length} site(s) trouvé(s) avec "Arthur":\n`);
    
    for (const site of sites) {
      console.log(`\n🏢 Site: ${site.name}`);
      console.log(`   ID: ${site._id}`);
      console.log(`   Group ID: ${site.groupId}`);
      
      // Trouver les utilisateurs de ce site
      const siteUsers = await User.find({ siteId: site._id });
      console.log(`   👥 ${siteUsers.length} utilisateur(s) associé(s) à ce site\n`);
      
      for (const user of siteUsers) {
        console.log(`   👤 Utilisateur: ${user.name || user.email}`);
        console.log(`      ID: ${user._id}`);
        console.log(`      Site ID: ${user.siteId || 'AUCUN'}`);
        
        // Trouver le stock de cet utilisateur
        const stock = await Stock.findOne({ createdBy: user._id });
        if (stock) {
          console.log(`      ✅ Stock trouvé avec ${stock.items.length} article(s)`);
          if (stock.items.length > 0) {
            stock.items.slice(0, 3).forEach(item => {
              console.log(`         - ${item.name} (${item.quantity} ${item.unit})`);
            });
          }
        } else {
          console.log(`      ❌ Aucun stock trouvé`);
        }
      }
    }
    
    console.log(`\n\n📋 Recherche des utilisateurs avec "Arthur" dans leur nom:\n`);
    
    // Trouver tous les utilisateurs avec "Arthur" dans leur nom
    const users = await User.find({ 
      $or: [
        { name: /arthur/i },
        { email: /arthur/i },
        { businessName: /arthur/i }
      ]
    }).select('name email siteId groupId');

    console.log(`📋 ${users.length} utilisateur(s) trouvé(s) avec "Arthur":\n`);
    
    for (const user of users) {
      console.log(`\n👤 Utilisateur: ${user.name || user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Site ID: ${user.siteId || 'AUCUN'}`);
      console.log(`   Group ID: ${user.groupId || 'AUCUN'}`);

      // Trouver le stock de cet utilisateur
      let stock = await Stock.findOne({ createdBy: user._id });
      
      if (!stock) {
        console.log(`   ❌ Aucun stock trouvé pour cet utilisateur`);
        console.log(`   🔍 Recherche de tous les stocks dans la base...`);
        
        // Chercher tous les stocks pour voir s'il y en a
        const allStocks = await Stock.find({}).limit(10);
        console.log(`   📊 ${allStocks.length} stock(s) trouvé(s) dans la base`);
        
        if (allStocks.length > 0) {
          console.log(`   📋 Détail des stocks:`);
          allStocks.forEach((s, idx) => {
            console.log(`      ${idx + 1}. Stock ID: ${s._id}, createdBy: ${s.createdBy}, items: ${s.items.length}`);
          });
        }
        
        // Vérifier s'il y a des commandes livrées pour cet utilisateur
        console.log(`   🔍 Recherche de commandes livrées pour cet utilisateur...`);
        const deliveredOrders = await Order.find({ 
          customer: user._id,
          status: 'delivered'
        });
        console.log(`   📦 ${deliveredOrders.length} commande(s) livrée(s) trouvée(s)`);
        if (deliveredOrders.length > 0) {
          console.log(`   📋 Détail des commandes:`);
          deliveredOrders.forEach((order, idx) => {
            console.log(`      ${idx + 1}. ${order.orderNumber} - ${order.items.length} article(s) - ${order.createdAt}`);
          });
        }
        console.log();
        continue;
      }

      console.log(`   ✅ Stock trouvé avec ${stock.items.length} article(s) total\n`);
      
      // Analyser les items par siteId
      const itemsBySite = {};
      const itemsWithoutSite = [];
      
      stock.items.forEach(item => {
        const siteId = item.siteId ? item.siteId.toString() : 'null';
        if (siteId === 'null') {
          itemsWithoutSite.push(item);
        } else {
          if (!itemsBySite[siteId]) {
            itemsBySite[siteId] = [];
          }
          itemsBySite[siteId].push(item);
        }
      });

      console.log(`   📊 Répartition des items:`);
      console.log(`      - Items sans siteId: ${itemsWithoutSite.length}`);
      Object.keys(itemsBySite).forEach(siteId => {
        console.log(`      - Items avec siteId ${siteId}: ${itemsBySite[siteId].length}`);
      });

      console.log(`\n   📦 Items sans siteId:`);
      if (itemsWithoutSite.length === 0) {
        console.log(`      Aucun`);
      } else {
        itemsWithoutSite.slice(0, 5).forEach(item => {
          console.log(`      - ${item.name} (${item.quantity} ${item.unit})`);
        });
        if (itemsWithoutSite.length > 5) {
          console.log(`      ... et ${itemsWithoutSite.length - 5} autres`);
        }
      }

      console.log(`\n   📦 Items avec le siteId de l'utilisateur (${user.siteId || 'AUCUN'}):`);
      const userSiteItems = user.siteId ? itemsBySite[user.siteId?.toString()] || [] : [];
      if (userSiteItems.length === 0) {
        console.log(`      Aucun`);
      } else {
        userSiteItems.slice(0, 5).forEach(item => {
          console.log(`      - ${item.name} (${item.quantity} ${item.unit})`);
        });
        if (userSiteItems.length > 5) {
          console.log(`      ... et ${userSiteItems.length - 5} autres`);
        }
      }

      // Calculer ce qui devrait être retourné par getUserStock
      const expectedItems = user.siteId 
        ? stock.items.filter(item => {
            const itemSiteId = item.siteId ? item.siteId.toString() : null;
            return itemSiteId === user.siteId.toString() || !itemSiteId;
          })
        : stock.items;
      
      console.log(`\n   ✅ Items qui DEVRAIENT être retournés: ${expectedItems.length}`);
      if (expectedItems.length > 0) {
        expectedItems.slice(0, 5).forEach(item => {
          const itemSiteId = item.siteId ? item.siteId.toString() : 'null';
          console.log(`      - ${item.name} (${item.quantity} ${item.unit}) - siteId: ${itemSiteId}`);
        });
        if (expectedItems.length > 5) {
          console.log(`      ... et ${expectedItems.length - 5} autres`);
        }
      }
    }

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

debugStock();

