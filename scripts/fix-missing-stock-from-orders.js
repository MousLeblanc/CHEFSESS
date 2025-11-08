import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Order from '../models/Order.js';
import Stock from '../models/Stock.js';
import User from '../models/User.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI ou MONGODB_URI non défini dans .env');
  process.exit(1);
}

async function fixMissingStockFromOrders() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver toutes les commandes avec le statut "delivered"
    const deliveredOrders = await Order.find({ status: 'delivered' })
      .populate('customer', 'siteId groupId')
      .populate('supplier', 'businessName name');

    console.log(`\n📦 ${deliveredOrders.length} commande(s) avec le statut "delivered" trouvée(s)`);

    let processedCount = 0;
    let addedCount = 0;
    let skippedCount = 0;

    for (const order of deliveredOrders) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`📦 Commande: ${order.orderNumber}`);
      console.log(`   Client: ${order.customer?._id}`);
      console.log(`   Site ID: ${order.customer?.siteId || order.siteId || 'N/A'}`);
      console.log(`   Articles: ${order.items.length}`);

      if (!order.customer || !order.customer._id) {
        console.log(`   ⚠️ Client non trouvé, skip`);
        skippedCount++;
        continue;
      }

      // Trouver ou créer le stock du client
      let stock = await Stock.findOne({ createdBy: order.customer._id });
      
      // Si pas trouvé et que le client a un siteId, chercher dans les items du site
      if (!stock && (order.customer.siteId || order.siteId)) {
        const siteId = order.customer.siteId || order.siteId;
        stock = await Stock.findOne({ 'items.siteId': siteId });
        if (stock) {
          console.log(`   📦 Stock trouvé via siteId dans les items`);
        }
      }

      if (!stock) {
        // Créer un nouveau stock pour ce client
        stock = new Stock({
          createdBy: order.customer._id,
          establishmentType: order.establishmentType || 'autre',
          items: []
        });
        console.log(`   ✨ Création d'un nouveau stock`);
      }

      const userSiteId = (order.customer.siteId || order.siteId) ? 
        (order.customer.siteId || order.siteId).toString() : null;
      const supplierName = order.supplier?.businessName || order.supplier?.name || 'Fournisseur inconnu';

      let orderAdded = false;
      let itemsAdded = 0;

      // Vérifier chaque article de la commande
      for (const orderItem of order.items) {
        const itemName = orderItem.productName;
        const itemQuantity = typeof orderItem.quantity === 'string' ? 
          parseFloat(orderItem.quantity) : Number(orderItem.quantity);
        const itemUnit = orderItem.unit;
        const itemPrice = typeof orderItem.unitPrice === 'string' ? 
          parseFloat(orderItem.unitPrice) : Number(orderItem.unitPrice);

        if (isNaN(itemQuantity) || itemQuantity <= 0) {
          console.log(`   ⚠️ Quantité invalide pour ${itemName}: ${orderItem.quantity}, skip`);
          continue;
        }

        // Chercher si l'article existe déjà dans le stock
        const existingItemIndex = stock.items.findIndex(
          item => {
            const itemSiteId = item.siteId ? item.siteId.toString() : null;
            return item.name.toLowerCase() === itemName.toLowerCase() && 
                   item.unit === itemUnit &&
                   itemSiteId === userSiteId;
          }
        );

        if (existingItemIndex !== -1) {
          // L'article existe déjà
          const existingItem = stock.items[existingItemIndex];
          console.log(`   ✅ ${itemName} existe déjà (${existingItem.quantity} ${itemUnit})`);
        } else {
          // Nouvel article à ajouter
          const categoryMap = {
            'légumes': 'legumes',
            'viande': 'viandes',
            'poisson': 'poissons',
            'lait': 'produits-laitiers',
            'céréales': 'cereales',
            'épices': 'epices',
            'boisson': 'boissons',
            'fruit': 'fruits'
          };
          
          let category = 'autres';
          const lowerName = itemName.toLowerCase();
          for (const [keyword, cat] of Object.entries(categoryMap)) {
            if (lowerName.includes(keyword)) {
              category = cat;
              break;
            }
          }

          stock.items.push({
            name: itemName,
            category: category,
            quantity: itemQuantity,
            unit: itemUnit,
            price: itemPrice,
            supplier: supplierName,
            purchaseDate: order.delivery?.requestedDate || order.createdAt || new Date(),
            status: 'available',
            notes: `Ajouté automatiquement depuis la commande ${order.orderNumber} (script de correction)`,
            siteId: order.customer.siteId || order.siteId || null,
            groupId: order.customer.groupId || null
          });

          console.log(`   ➕ ${itemName} ajouté: ${itemQuantity} ${itemUnit}`);
          itemsAdded++;
          orderAdded = true;
        }
      }

      if (orderAdded) {
        await stock.save();
        console.log(`   ✅ Stock sauvegardé (${itemsAdded} article(s) ajouté(s))`);
        addedCount++;
      } else {
        console.log(`   ℹ️ Tous les articles sont déjà en stock`);
      }

      processedCount++;
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`✅ Traitement terminé:`);
    console.log(`   - ${processedCount} commande(s) traitée(s)`);
    console.log(`   - ${addedCount} commande(s) avec articles ajoutés`);
    console.log(`   - ${skippedCount} commande(s) ignorée(s)`);

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter le script
fixMissingStockFromOrders();

