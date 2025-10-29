import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Stock from '../models/Stock.js';
import User from '../models/User.js';
import notificationService from '../services/notificationService.js';

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Private (collectivite)
export const createOrder = asyncHandler(async (req, res) => {
  console.log('📦 CREATE ORDER - Données reçues:', JSON.stringify(req.body, null, 2));
  console.log('📦 CREATE ORDER - User:', req.user);
  
  const { supplier, items, deliveryDate, notes } = req.body;

  if (!supplier || !items || !Array.isArray(items) || items.length === 0) {
    console.log('❌ CREATE ORDER - Validation échouée:', { supplier, items });
    res.status(400);
    throw new Error('Fournisseur et articles requis');
  }

  // Déterminer si supplier est un ID ou un nom
  let supplierId;
  
  // Vérifier si c'est un ID MongoDB valide (24 caractères hexadécimaux)
  const isObjectId = /^[0-9a-fA-F]{24}$/.test(supplier);
  
  if (isObjectId) {
    // C'est déjà un ID, vérifier qu'il existe
    const supplierUser = await User.findById(supplier);
    if (!supplierUser) {
      res.status(400);
      throw new Error(`Fournisseur non trouvé: ${supplier}`);
    }
    supplierId = supplierUser._id;
    console.log(`✅ Fournisseur trouvé par ID: ${supplierUser.businessName || supplierUser.name}`);
  } else {
    // C'est un nom, chercher par businessName
    const supplierUser = await User.findOne({ businessName: supplier });
    if (!supplierUser) {
      res.status(400);
      throw new Error(`Fournisseur non trouvé: ${supplier}`);
    }
    supplierId = supplierUser._id;
    console.log(`✅ Fournisseur trouvé par nom: ${supplier}`);
  }

  // Vérifier que tous les produits existent et calculer les prix
  const orderItems = [];
  let subtotal = 0;
  const stockWarnings = []; // Pour stocker les alertes de stock bas

  for (const item of items) {
    console.log(`\n🔍 Traitement item:`, {
      productId: item.productId,
      quantity: item.quantity
    });
    
    const product = await Product.findById(item.productId);
    if (!product) {
      console.error(`❌ Produit non trouvé: ${item.productId}`);
      res.status(400);
      throw new Error(`Produit non trouvé: ${item.productId}`);
    }

    console.log(`📦 Produit trouvé: ${product.name}`);
    console.log(`   Prix: ${product.price}€/${product.unit}`);
    console.log(`   Stock: ${product.stock} ${product.unit}`);

    // 🎯 VÉRIFIER LE STOCK DISPONIBLE CHEZ LE FOURNISSEUR
    if (product.stock < item.quantity) {
      console.error(`❌ Stock insuffisant pour ${product.name}`);
      res.status(400);
      throw new Error(`Stock insuffisant pour ${product.name}. Disponible: ${product.stock} ${product.unit}, Demandé: ${item.quantity} ${product.unit}`);
    }

    const totalPrice = product.price * item.quantity;
    subtotal += totalPrice;

    console.log(`💰 Prix unitaire: ${product.price}€, Quantité: ${item.quantity}, Total: ${totalPrice.toFixed(2)}€`);

    orderItems.push({
      product: product._id,
      productName: product.name,
      quantity: item.quantity,
      unit: product.unit,
      unitPrice: product.price,
      totalPrice: totalPrice
    });
  }

  console.log(`📦 Création de commande - ${orderItems.length} produit(s) - Total: ${subtotal.toFixed(2)}€`);

  // Générer le numéro de commande
  const count = await Order.countDocuments();
  const orderNumber = `CMD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;

  const order = new Order({
    orderNumber: orderNumber,
    customer: req.user._id,
    supplier: supplierId,
    items: orderItems,
    delivery: {
      requestedDate: new Date(deliveryDate),
      notes: notes || ''
    },
    pricing: {
      subtotal: subtotal,
      tax: 0, // Pas de TVA pour les collectivités
      total: subtotal
    },
    notes: {
      customer: notes || ''
    },
    establishmentType: req.user.establishmentType || 'restaurant'
  });

  await order.save();
  console.log(`✅ Commande ${orderNumber} créée avec succès`);
  
  // 🔔 NOTIFIER LE FOURNISSEUR DE LA NOUVELLE COMMANDE
  try {
    await order.populate('customer', 'businessName name');
    notificationService.notifyNewOrder(supplierId, order);
    console.log(`📬 Notification envoyée au fournisseur ${supplierId}`);
  } catch (notifError) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', notifError);
    // Ne pas bloquer la création de commande si la notification échoue
  }

  // 🎯 DÉDUIRE LE STOCK DU FOURNISSEUR
  console.log(`📉 Déduction du stock fournisseur pour ${orderItems.length} produit(s)...`);
  const lowStockAlerts = [];
  
  for (const item of items) {
    try {
      const product = await Product.findById(item.productId);
      if (product) {
        await product.decreaseStock(item.quantity);
        
        // Vérifier si le stock est bas après la déduction
        if (product.isLowStock()) {
          lowStockAlerts.push({
            productName: product.name,
            currentStock: product.stock,
            stockAlert: product.stockAlert
          });
          console.log(`⚠️ ALERTE STOCK BAS: ${product.name} - Restant: ${product.stock} ${product.unit}`);
        }
      }
    } catch (error) {
      console.error(`❌ Erreur lors de la déduction du stock pour ${item.productId}:`, error);
      // Ne pas bloquer la commande si la déduction échoue (déjà créée)
    }
  }
  
  // Ajouter les alertes de stock bas à la réponse
  const response = {
    success: true,
    data: order
  };
  
  if (lowStockAlerts.length > 0) {
    response.lowStockAlerts = lowStockAlerts;
    response.message = `Commande créée. Attention: ${lowStockAlerts.length} produit(s) en stock bas`;
  }
  
  console.log('✅ CREATE ORDER - Commande créée avec succès:', orderNumber);
  res.status(201).json(response);
});

// @desc    Récupérer les commandes du client connecté
// @route   GET /api/orders
// @access  Private
export const getCustomerOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate('supplier', 'name businessName email phone')
    .populate('items.product', 'name category')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Récupérer les commandes reçues par le fournisseur
// @route   GET /api/orders/supplier
// @access  Private (fournisseur)
export const getSupplierOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ supplier: req.user._id })
    .populate('customer', 'name businessName email phone')
    .populate('items.product', 'name category')
    .sort({ createdAt: -1 });

  res.json({ success: true, count: orders.length, data: orders });
});

// @desc    Récupérer une commande par ID
// @route   GET /api/orders/:id
// @access  Private
export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'name businessName email phone')
    .populate('supplier', 'name businessName email phone')
    .populate('items.product', 'name category description');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier que l'utilisateur a le droit de voir cette commande
  if (order.customer._id.toString() !== req.user._id.toString() && 
      order.supplier._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé à voir cette commande');
  }

  res.json({ success: true, data: order });
});

// @desc    Mettre à jour le statut d'une commande (par le fournisseur)
// @route   PUT /api/orders/:id/status
// @access  Private (fournisseur)
export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['pending', 'confirmed', 'preparing', 'prepared', 'ready', 'shipped', 'cancelled'];

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Statut invalide');
  }

  // Charger la commande avec les données populate AVANT de modifier
  const order = await Order.findById(req.params.id)
    .populate('customer', 'businessName name email')
    .populate('supplier', 'businessName name email');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier que l'utilisateur est le fournisseur de cette commande
  if (order.supplier._id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Non autorisé à modifier cette commande');
  }

  const oldStatus = order.status;
  console.log(`🔄 Changement de statut: ${oldStatus} → ${status} pour commande ${order.orderNumber}`);
  
  await order.updateStatus(status);
  
  // 🔔 NOTIFIER LE CLIENT DU CHANGEMENT DE STATUT
  try {
    const customerId = order.customer._id || order.customer;
    console.log(`\n📬 ======== ENVOI NOTIFICATION CLIENT ========`);
    console.log(`   Customer ID: ${customerId}`);
    console.log(`   Customer type: ${typeof customerId}`);
    console.log(`   Customer toString: ${customerId.toString()}`);
    console.log(`   Supplier: ${order.supplier?.businessName || 'N/A'}`);
    console.log(`   Customer: ${order.customer?.businessName || 'N/A'}`);
    console.log(`   Order: ${order.orderNumber}`);
    console.log(`   Status: ${oldStatus} → ${status}`);
    
    notificationService.notifyOrderStatusChange(customerId, order, oldStatus, status);
    console.log(`✅ Notification envoyée au service`);
    console.log(`========================================\n`);
  } catch (notifError) {
    console.error('❌ Erreur lors de l\'envoi de la notification:', notifError);
    console.error('   Stack:', notifError.stack);
  }

  res.json({ success: true, data: order });
});

// @desc    Mettre à jour le statut d'une commande (par le client)
// @route   PUT /api/orders/:id/customer-status
// @access  Private (collectivite, restaurant, resto)
export const updateCustomerOrderStatus = asyncHandler(async (req, res) => {
  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  🎯 updateCustomerOrderStatus - DÉBUT               ║');
  console.log('╚══════════════════════════════════════════════════════╝');
  
  const { status, notes } = req.body;
  const validStatuses = ['delivered', 'issue'];

  console.log(`📋 Données reçues:`);
  console.log(`   • Order ID: ${req.params.id}`);
  console.log(`   • Status demandé: ${status}`);
  console.log(`   • User ID: ${req.user._id}`);
  console.log(`   • Notes: ${notes || 'Aucune'}`);

  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Statut invalide. Utilisez "delivered" pour confirmer la réception ou "issue" pour signaler un problème');
  }

  const order = await Order.findById(req.params.id).populate('supplier', 'businessName name');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  console.log(`✅ Commande trouvée: ${order.orderNumber}`);
  console.log(`   • Status actuel: ${order.status}`);
  console.log(`   • Client: ${order.customer}`);
  console.log(`   • Nombre d'articles: ${order.items.length}`);

  // Vérifier que l'utilisateur est le client de cette commande
  if (order.customer.toString() !== req.user._id.toString()) {
    console.log(`❌ Erreur d'autorisation: ${order.customer} !== ${req.user._id}`);
    res.status(403);
    throw new Error('Non autorisé à modifier cette commande');
  }

  console.log(`✅ Autorisation OK`);

  // Vérifier que la commande a bien été confirmée/préparée avant de confirmer la réception
  const validStatusForDelivery = ['confirmed', 'preparing', 'prepared', 'ready', 'shipped'];
  if (status === 'delivered' && !validStatusForDelivery.includes(order.status)) {
    console.log(`❌ Status invalide pour confirmation: ${order.status} (doit être l'un de: ${validStatusForDelivery.join(', ')})`);
    res.status(400);
    throw new Error('La commande doit d\'abord être confirmée et préparée par le fournisseur');
  }

  console.log(`📝 Mise à jour du status vers: ${status}`);
  await order.updateStatus(status);
  console.log(`✅ Status mis à jour avec succès`);
  
  // Ajouter les notes du client si fourni (pour signaler un problème)
  if (notes) {
    order.notes.customer = notes;
    await order.save();
  }
  
  // 🔔 NOTIFIER LE FOURNISSEUR SI UN PROBLÈME EST SIGNALÉ
  if (status === 'issue') {
    try {
      notificationService.notifyOrderIssue(order.supplier._id, order);
      console.log(`📬 Notification de problème envoyée au fournisseur ${order.supplier._id}`);
    } catch (notifError) {
      console.error('❌ Erreur lors de l\'envoi de la notification:', notifError);
    }
  }

  // 🎯 AJOUT AUTOMATIQUE AU STOCK quand la commande est confirmée
  if (status === 'delivered') {
    console.log(`\n🔄 Status est 'delivered' → Ajout au stock activé`);
    try {
      console.log(`\n📦 ========== AJOUT AUTOMATIQUE AU STOCK ==========`);
      console.log(`📦 Commande: ${order.orderNumber}`);
      console.log(`📦 Client ID: ${req.user._id}`);
      console.log(`📦 Nombre d'articles dans la commande: ${order.items.length}`);
      
      console.log(`\n📋 Articles à ajouter:`);
      order.items.forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.productName} - ${item.quantity} ${item.unit} @ ${item.unitPrice}€`);
      });
      
      // Trouver ou créer le stock du client
      let stock = await Stock.findOne({ createdBy: req.user._id });
      
      if (!stock) {
        // Créer un nouveau stock pour ce client
        stock = new Stock({
          createdBy: req.user._id,
          establishmentType: req.user.establishmentType || 'autre',
          items: []
        });
        console.log(`✨ Création d'un nouveau stock pour l'utilisateur ${req.user._id}`);
      } else {
        console.log(`📦 Stock existant trouvé avec ${stock.items.length} article(s)`);
      }
      
      const supplierName = order.supplier?.businessName || order.supplier?.name || 'Fournisseur inconnu';
      
      // Parcourir tous les articles de la commande
      for (const orderItem of order.items) {
        const itemName = orderItem.productName;
        const itemQuantity = orderItem.quantity;
        const itemUnit = orderItem.unit;
        const itemPrice = orderItem.unitPrice;
        
        // Chercher si l'article existe déjà dans le stock (par nom ET unité)
        // On consolide tous les articles avec le même nom et la même unité, peu importe le fournisseur
        const existingItemIndex = stock.items.findIndex(
          item => item.name.toLowerCase() === itemName.toLowerCase() && 
                  item.unit === itemUnit
        );
        
        if (existingItemIndex !== -1) {
          // L'article existe déjà : augmenter la quantité
          const oldQuantity = stock.items[existingItemIndex].quantity;
          stock.items[existingItemIndex].quantity += itemQuantity;
          stock.items[existingItemIndex].price = itemPrice; // Mettre à jour le prix
          stock.items[existingItemIndex].purchaseDate = new Date(); // Mettre à jour la date
          // Mettre à jour le fournisseur avec le plus récent (ou combiner s'ils sont différents)
          if (stock.items[existingItemIndex].supplier !== supplierName && !stock.items[existingItemIndex].supplier.includes(supplierName)) {
            stock.items[existingItemIndex].supplier = `${stock.items[existingItemIndex].supplier}, ${supplierName}`;
          }
          console.log(`   ➕ ${itemName}: ${oldQuantity} → ${stock.items[existingItemIndex].quantity} ${itemUnit} (consolidé)`);
        } else {
          // Nouvel article : l'ajouter au stock
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
          
          // Déterminer la catégorie (basique, peut être amélioré)
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
            purchaseDate: new Date(),
            status: 'available',
            notes: `Ajouté automatiquement depuis la commande ${order.orderNumber}`
          });
          console.log(`   ✨ Nouvel article ajouté: ${itemName} (${itemQuantity} ${itemUnit})`);
        }
      }
      
      // Sauvegarder le stock mis à jour
      console.log(`\n💾 Tentative de sauvegarde du stock...`);
      console.log(`💾 Nombre d'articles à sauvegarder: ${stock.items.length}`);
      console.log(`💾 Est nouveau stock: ${stock.isNew ? 'OUI' : 'NON'}`);
      
      const savedStock = await stock.save();
      
      console.log(`\n✅ ========== SUCCÈS ! STOCK SAUVEGARDÉ ==========`);
      console.log(`✅ ID du stock: ${savedStock._id}`);
      console.log(`✅ Nombre total d'articles: ${savedStock.items.length}`);
      console.log(`✅ Articles dans le stock après sauvegarde:`);
      savedStock.items.slice(-5).forEach((item, index) => {
        console.log(`   ${savedStock.items.length - 4 + index}. ${item.name} - ${item.quantity} ${item.unit}`);
      });
      console.log(`📦 ========== FIN AJOUT AU STOCK ==========\n`);
      
    } catch (stockError) {
      console.error('\n❌ ========== ERREUR LORS DE L\'AJOUT AU STOCK ==========');
      console.error('❌ Type d\'erreur:', stockError.constructor.name);
      console.error('❌ Message:', stockError.message);
      console.error('❌ Stack:', stockError.stack);
      
      if (stockError.errors) {
        console.error('❌ Erreurs de validation:');
        Object.keys(stockError.errors).forEach(key => {
          console.error(`   • ${key}: ${stockError.errors[key].message}`);
        });
      }
      
      console.error('❌ ========== FIN ERREUR ==========\n');
      // Ne pas bloquer la confirmation de livraison si l'ajout au stock échoue
      // L'utilisateur pourra ajouter manuellement si nécessaire
    }
  } else {
    console.log(`\nℹ️ Status n'est pas 'delivered' (${status}) → Pas d'ajout au stock`);
  }

  console.log('\n╔══════════════════════════════════════════════════════╗');
  console.log('║  ✅ updateCustomerOrderStatus - FIN (SUCCESS)       ║');
  console.log('╚══════════════════════════════════════════════════════╝\n');

  res.json({ success: true, data: order });
});

// @desc    Annuler une commande
// @route   PUT /api/orders/:id/cancel
// @access  Private (client ou fournisseur)
export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier que l'utilisateur peut annuler cette commande
  const isCustomer = order.customer.toString() === req.user._id.toString();
  const isSupplier = order.supplier.toString() === req.user._id.toString();

  if (!isCustomer && !isSupplier) {
    res.status(403);
    throw new Error('Non autorisé à annuler cette commande');
  }

  // Ne pas permettre l'annulation si la commande est déjà livrée
  if (order.status === 'delivered') {
    res.status(400);
    throw new Error('Impossible d\'annuler une commande déjà livrée');
  }

  await order.updateStatus('cancelled');
  console.log(`❌ Commande ${order.orderNumber} annulée`);

  // 🎯 REMETTRE LE STOCK AU FOURNISSEUR si la commande est annulée
  if (order.status === 'cancelled') {
    console.log(`📈 Remise du stock fournisseur pour ${order.items.length} produit(s)...`);
    
    for (const item of order.items) {
      try {
        const product = await Product.findById(item.product);
        if (product) {
          await product.increaseStock(item.quantity);
          console.log(`   ↩️ ${item.productName}: +${item.quantity} ${item.unit} remis en stock`);
        }
      } catch (error) {
        console.error(`❌ Erreur lors de la remise du stock pour ${item.productName}:`, error);
        // Ne pas bloquer l'annulation si la remise en stock échoue
      }
    }
    
    console.log(`✅ Stock fournisseur restauré pour la commande ${order.orderNumber}`);
  }

  res.json({ success: true, data: order });
});
