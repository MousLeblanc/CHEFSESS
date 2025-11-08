import asyncHandler from 'express-async-handler';
import Stock from '../models/Stock.js'; //

// @desc    Obtenir le stock de l'utilisateur connecté (filtré par site)
// @route   GET /api/stock
// @access  Private
export const getUserStock = asyncHandler(async (req, res) => {
  const stock = await Stock.findOne({ createdBy: req.user._id });

  if (!stock) {
    console.log('📦 Aucun stock trouvé pour l\'utilisateur');
    return res.status(200).json({ success: true, data: [] });
  }

  // Filtrer les items par siteId de l'utilisateur
  const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
  const userGroupId = req.user.groupId ? req.user.groupId.toString() : null;
  
  console.log(`📦 Récupération stock - User ID: ${req.user._id}, Site ID: ${userSiteId}, Group ID: ${userGroupId}`);
  console.log(`📦 Total items avant traitement: ${stock.items.length}`);

  // Initialiser alertThreshold et siteId pour TOUS les items (rétrocompatibilité)
  // AVANT le filtrage, pour que les items sans siteId soient mis à jour
  let needsSave = false;
  stock.items.forEach((item, index) => {
    let itemModified = false;
    if (item.alertThreshold === undefined || item.alertThreshold === null) {
      item.alertThreshold = 0;
      itemModified = true;
      needsSave = true;
    }
    // Si l'item n'a pas de siteId et que l'utilisateur a un siteId, l'ajouter (rétrocompatibilité)
    // Cela permet d'inclure les anciens items qui n'avaient pas de siteId
    if (!item.siteId && userSiteId) {
      item.siteId = req.user.siteId;
      item.groupId = req.user.groupId;
      itemModified = true;
      needsSave = true;
      console.log(`📦 Item "${item.name}" mis à jour avec siteId: ${userSiteId}`);
    }
    // Marquer l'item comme modifié pour que Mongoose détecte les changements
    if (itemModified) {
      stock.markModified(`items.${index}`);
    }
  });

  // Sauvegarder si des mises à jour ont été effectuées
  if (needsSave) {
    await stock.save();
    console.log('✅ alertThreshold et siteId initialisés pour les articles existants');
    // Recharger le stock depuis la base pour avoir les valeurs mises à jour
    const updatedStock = await Stock.findOne({ createdBy: req.user._id });
    if (updatedStock) {
      stock.items = updatedStock.items;
      console.log('✅ Stock rechargé depuis la base après mise à jour');
    }
  }

  // Filtrer les items par siteId APRÈS la mise à jour
  let filteredItems = stock.items;
  if (userSiteId) {
    // Pour la rétrocompatibilité : inclure TOUS les items sans siteId ET ceux avec le bon siteId
    // Cela permet de récupérer les anciens items qui n'avaient pas de siteId
    filteredItems = stock.items.filter(item => {
      const itemSiteId = item.siteId ? item.siteId.toString() : null;
      // Inclure les items qui ont le même siteId OU qui n'ont pas de siteId (rétrocompatibilité)
      const shouldInclude = itemSiteId === userSiteId || !itemSiteId;
      if (!shouldInclude) {
        console.log(`📦 Item "${item.name}" exclu - itemSiteId: ${itemSiteId || 'null'}, userSiteId: ${userSiteId}`);
      } else {
        console.log(`✅ Item "${item.name}" inclus - itemSiteId: ${itemSiteId || 'null'}, userSiteId: ${userSiteId}`);
      }
      return shouldInclude;
    });
    console.log(`📦 Items après filtrage par siteId: ${filteredItems.length} sur ${stock.items.length} total`);
  } else {
    // Si l'utilisateur n'a pas de siteId, retourner tous les items (comportement par défaut)
    filteredItems = stock.items;
    console.log(`📦 Utilisateur sans siteId, retour de tous les items: ${filteredItems.length}`);
  }

  // Log détaillé pour debug
  if (filteredItems.length === 0 && stock.items.length > 0) {
    console.warn('⚠️ ATTENTION: Aucun item ne correspond au siteId après filtrage');
    console.log('📊 Détail de tous les items:', stock.items.map(item => ({
      name: item.name,
      siteId: item.siteId ? item.siteId.toString() : 'null',
      userSiteId,
      hasSiteId: !!item.siteId
    })));
  } else if (filteredItems.length > 0) {
    console.log('✅ Items inclus dans la réponse:', filteredItems.map(item => ({
      name: item.name,
      siteId: item.siteId ? item.siteId.toString() : 'null'
    })));
  }

  res.status(200).json({ success: true, data: filteredItems });
});

// @desc    Obtenir les éléments de stock par catégorie (filtré par site)
// @route   GET /api/stock/category/:category
// @access  Private
export const getStockByCategory = asyncHandler(async (req, res) => {
  const stock = await Stock.findOne({ createdBy: req.user._id });

  if (!stock) {
    return res.status(200).json({ success: true, data: [] });
  }

  // Filtrer par siteId puis par catégorie
  const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
  let filteredItems = stock.items;
  if (userSiteId) {
    filteredItems = stock.items.filter(item => {
      const itemSiteId = item.siteId ? item.siteId.toString() : null;
      return itemSiteId === userSiteId;
    });
  }

  const categoryItems = filteredItems.filter(item => item.category === req.params.category);
  res.status(200).json({ success: true, data: categoryItems });
});

// @desc    Obtenir les éléments de stock qui expirent bientôt (filtré par site)
// @route   GET /api/stock/expiring/:days?
// @access  Private
export const getExpiringItems = asyncHandler(async (req, res) => {
  const stock = await Stock.findOne({ createdBy: req.user._id });

  if (!stock) {
    return res.status(200).json({ success: true, data: [] });
  }

  // Filtrer par siteId
  const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
  let filteredItems = stock.items;
  if (userSiteId) {
    filteredItems = stock.items.filter(item => {
      const itemSiteId = item.siteId ? item.siteId.toString() : null;
      return itemSiteId === userSiteId;
    });
  }

  const days = req.params.days ? parseInt(req.params.days) : 7;
  const today = new Date();
  const expirationDate = new Date(today);
  expirationDate.setDate(today.getDate() + days);

  const expiringItems = filteredItems.filter(item => {
    if (!item.expirationDate) return false;
    const expDate = new Date(item.expirationDate);
    return expDate <= expirationDate && expDate >= today;
  });

  res.status(200).json({ success: true, data: expiringItems });
});

// @desc    Obtenir la valeur totale du stock (filtré par site)
// @route   GET /api/stock/value
// @access  Private
export const getStockValue = asyncHandler(async (req, res) => {
  const stock = await Stock.findOne({ createdBy: req.user._id });

  if (!stock) {
    return res.status(200).json({ success: true, value: 0 });
  }

  // Filtrer par siteId
  const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
  let filteredItems = stock.items;
  if (userSiteId) {
    filteredItems = stock.items.filter(item => {
      const itemSiteId = item.siteId ? item.siteId.toString() : null;
      return itemSiteId === userSiteId;
    });
  }

  // Calculer la valeur totale des items filtrés
  const totalValue = filteredItems.reduce((sum, item) => {
    const price = item.price || 0;
    const quantity = item.quantity || 0;
    return sum + (price * quantity);
  }, 0);

  res.status(200).json({ success: true, value: totalValue });
});

// @desc    Créer ou mettre à jour le stock utilisateur (bulk update/replace)
// @route   PUT /api/stock
// @access  Private
export const updateUserStock = asyncHandler(async (req, res) => { //
  const { items } = req.body; //

  if (!items || !Array.isArray(items) || items.length === 0) { //
    res.status(400); //
    throw new Error('Le stock ne peut pas être vide'); //
  }

  let userStock = await Stock.findOne({ createdBy: req.user._id });

  if (!userStock) {
    userStock = new Stock({ createdBy: req.user._id, establishmentType: req.user.establishmentType || 'autre', items: [] });
  }

  // Clear existing items and add new ones for a full replacement/update (filtré par site)
  const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
  
  // Garder les items des autres sites et remplacer seulement ceux du site actuel
  const itemsFromOtherSites = userStock.items.filter(item => {
    const itemSiteId = item.siteId ? item.siteId.toString() : null;
    return itemSiteId !== userSiteId;
  });
  
  // Ajouter les nouveaux items avec le siteId
  const newItems = items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    expirationDate: item.expirationDate || null,
    alertThreshold: item.alertThreshold || 0,
    source: item.source || 'manual',
    price: item.price || 0,
    siteId: req.user.siteId || null,
    groupId: req.user.groupId || null,
  }));
  
  userStock.items = [...itemsFromOtherSites, ...newItems];

  await userStock.save();

  res.status(200).json({ success: true, message: 'Stock mis à jour avec succès.', data: userStock.items });
});


// NEW: @desc Add a new item to the user's stock
// @route POST /api/stock
// @access Private
export const addItemToStock = asyncHandler(async (req, res) => {
  const { name, quantity, unit, category, expirationDate, alertThreshold, source, price, purchaseDate, store } = req.body;

  // Conversion explicite de la quantité en nombre
  const parsedQuantity = typeof quantity === 'string' ? parseFloat(quantity) : Number(quantity);
  const parsedPrice = price !== undefined && price !== null 
    ? (typeof price === 'string' ? parseFloat(price) : Number(price))
    : 0;

  if (!name || isNaN(parsedQuantity) || parsedQuantity < 0 || !unit || !category) {
    console.error(`❌ Validation échouée - Nom: ${name}, Quantité: ${quantity} (parsed: ${parsedQuantity}), Unité: ${unit}, Catégorie: ${category}`);
    res.status(400);
    throw new Error('Nom, quantité, unité et catégorie sont requis pour ajouter un article.');
  }
  
  console.log(`📦 Ajout manuel au stock: ${name} - ${parsedQuantity} ${unit} (type: ${typeof parsedQuantity})`);

  let userStock = await Stock.findOne({ createdBy: req.user._id });

  if (!userStock) {
    userStock = new Stock({ createdBy: req.user._id, establishmentType: req.user.establishmentType || 'autre', items: [] });
  }

  // Check if item already exists to prevent duplicates (filtrer aussi par siteId)
  const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
  const existingItem = userStock.items.find(item => {
    const itemSiteId = item.siteId ? item.siteId.toString() : null;
    const nameMatch = item.name.toLowerCase() === name.toLowerCase();
    const unitMatch = item.unit.toLowerCase() === unit.toLowerCase();
    const siteMatch = itemSiteId === userSiteId;
    return nameMatch && unitMatch && siteMatch;
  });

  if (existingItem) {
    // If item exists, update its quantity (utiliser la quantité parsée)
    const oldQuantity = existingItem.quantity;
    existingItem.quantity += parsedQuantity;
    console.log(`   ➕ ${name}: ${oldQuantity} → ${existingItem.quantity} ${unit} (ajout de ${parsedQuantity})`);
    existingItem.updatedAt = new Date();
      // You might also want to update other fields if provided, e.g., price, expirationDate
      if (expirationDate) existingItem.expirationDate = expirationDate;
      if (alertThreshold !== undefined && alertThreshold !== null && typeof alertThreshold === 'number' && alertThreshold >= 0) {
        existingItem.alertThreshold = alertThreshold;
      }
      if (source) existingItem.source = source;
      if (price !== undefined && price !== null) existingItem.price = parsedPrice;
      if (purchaseDate) existingItem.purchaseDate = purchaseDate;
      if (store) existingItem.supplier = store; // Utilise le champ supplier pour stocker le magasin
      // S'assurer que le siteId est défini (rétrocompatibilité)
      if (!existingItem.siteId && req.user.siteId) {
        existingItem.siteId = req.user.siteId;
        existingItem.groupId = req.user.groupId;
      }

    await userStock.save();
    return res.status(200).json({ success: true, message: 'Quantité de l\'ingrédient mise à jour.', data: existingItem });
  } else {
    // Add new item to the stock (avec siteId et groupId) - utiliser les valeurs parsées
    const newItem = {
      name,
      quantity: parsedQuantity,
      unit,
      category,
      expirationDate: expirationDate || null,
      alertThreshold: alertThreshold || 0,
      source: source || 'manual',
      price: parsedPrice,
      purchaseDate: purchaseDate || new Date(),
      supplier: store || null, // Utilise le champ supplier pour stocker le magasin
      siteId: req.user.siteId || null, // Ajouter le siteId du site de l'utilisateur
      groupId: req.user.groupId || null, // Ajouter le groupId du groupe de l'utilisateur
    };
    userStock.items.push(newItem);
    await userStock.save();
    return res.status(201).json({ success: true, message: 'Ingrédient ajouté au stock avec succès.', data: newItem });
  }
});

// NEW: @desc Update a specific item in the user's stock by its ID
// @route PUT /api/stock/:id
// @access Private
export const updateStockItem = asyncHandler(async (req, res) => {
  const { id } = req.params; // Item ID
  const { name, quantity, unit, category, expirationDate, alertThreshold, source, price } = req.body;

  let userStock = await Stock.findOne({ createdBy: req.user._id });

  if (!userStock) {
    res.status(404);
    throw new Error('Stock utilisateur non trouvé.');
  }

  // Filtrer par siteId pour ne modifier que les items du site de l'utilisateur
  const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
  let itemToUpdate = userStock.items.id(id); // Find the subdocument by its _id

  if (!itemToUpdate) {
    res.status(404);
    throw new Error('Ingrédient non trouvé dans le stock.');
  }

  // Vérifier que l'item appartient au site de l'utilisateur
  const itemSiteId = itemToUpdate.siteId ? itemToUpdate.siteId.toString() : null;
  if (userSiteId && itemSiteId !== userSiteId) {
    res.status(403);
    throw new Error('Cet article appartient à un autre site.');
  }

  // Mettre à jour le siteId si manquant (rétrocompatibilité)
  if (!itemToUpdate.siteId && userSiteId) {
    itemToUpdate.siteId = req.user.siteId;
    itemToUpdate.groupId = req.user.groupId;
  }

  // Update item fields if provided
  if (name) itemToUpdate.name = name;
  if (typeof quantity === 'number' && quantity >= 0) itemToUpdate.quantity = quantity;
  if (unit) itemToUpdate.unit = unit;
  if (category) itemToUpdate.category = category;
  if (expirationDate) itemToUpdate.expirationDate = expirationDate;
  // Mettre à jour alertThreshold même s'il est 0 (pour permettre de définir un seuil à 0)
  if (alertThreshold !== undefined && alertThreshold !== null && typeof alertThreshold === 'number' && alertThreshold >= 0) {
    itemToUpdate.alertThreshold = alertThreshold;
    console.log('✅ alertThreshold mis à jour:', alertThreshold);
  }
  if (source) itemToUpdate.source = source;
  if (typeof price === 'number' && price >= 0) itemToUpdate.price = price;

  itemToUpdate.updatedAt = new Date(); // Update timestamp

  await userStock.save();

  console.log('✅ Article sauvegardé - alertThreshold:', itemToUpdate.alertThreshold);

  res.status(200).json({ success: true, message: 'Ingrédient mis à jour avec succès.', data: itemToUpdate });
});


// @desc    Déduire des quantités du stock
// @route   PUT /api/stock/deduct
// @access  Private
export const deductStockItems = asyncHandler(async (req, res) => {
  const { itemsToDeduct } = req.body;
  
  console.log('🚀 ===== DÉBUT DÉDUCTION STOCK =====');
  console.log('📥 Items reçus:', JSON.stringify(itemsToDeduct, null, 2));

  if (!itemsToDeduct || !Array.isArray(itemsToDeduct) || itemsToDeduct.length === 0) {
    res.status(400);
    throw new Error('La liste des articles à déduire est requise.');
  }

  const userStock = await Stock.findOne({ createdBy: req.user._id });

  if (!userStock) {
    res.status(404);
    throw new Error('Stock utilisateur non trouvé.');
  }
  
  // Filtrer les items par siteId de l'utilisateur
  const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
  let availableItems = userStock.items;
  if (userSiteId) {
    availableItems = userStock.items.filter(item => {
      const itemSiteId = item.siteId ? item.siteId.toString() : null;
      return itemSiteId === userSiteId;
    });
  }
  
  console.log(`📦 Stock chargé: ${availableItems.length} items disponibles (siteId: ${userSiteId})`);
  console.log(`📋 Liste des items en stock:`, availableItems.map(i => `"${i.name}" (${i.quantity}${i.unit})`).join(', '));

  let notEnoughStock = [];
  let updatedItems = [];

  // Fonction de normalisation (comme dans le frontend)
  const normalizeString = (str) => str.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Enlever accents
    .replace(/œ/g, 'oe')  // œ → oe
    .replace(/æ/g, 'ae')  // æ → ae
    .replace(/['']/g, ' ') // Apostrophes → espace
    .trim();

  for (const deductionItem of itemsToDeduct) {
    const { name, quantity: quantityToDeduct, unit } = deductionItem;
    
    console.log(`🔍 Backend - Recherche: "${name}"`);
    const nameNorm = normalizeString(name);

    const stockItem = availableItems.find(item => {
      const itemNameNorm = normalizeString(item.name);
      const unitMatch = !unit || item.unit.toLowerCase() === unit.toLowerCase();
      
      // Recherche flexible comme le frontend
      const nameMatch = itemNameNorm === nameNorm ||
                       itemNameNorm.includes(nameNorm) ||
                       nameNorm.includes(itemNameNorm) ||
                       // Recherche par mots-clés
                       itemNameNorm.split(/\s+/).some(word => nameNorm.includes(word) && word.length > 3) ||
                       nameNorm.split(/\s+/).some(word => itemNameNorm.includes(word) && word.length > 3);
      
      if (nameMatch && unitMatch) {
        console.log(`   ✅ Match trouvé: "${item.name}"`);
      }
      
      return nameMatch && unitMatch;
    });

    if (stockItem) {
      console.log(`   📦 Item trouvé: ${stockItem.name}, quantité: ${stockItem.quantity}${stockItem.unit}, à déduire: ${quantityToDeduct}${unit}`);
      if (stockItem.quantity >= quantityToDeduct) {
        stockItem.quantity -= quantityToDeduct;
        stockItem.updatedAt = new Date();
        updatedItems.push(name);
        console.log(`   ✅ Déduit avec succès: ${stockItem.name}, nouveau stock: ${stockItem.quantity}${stockItem.unit}`);
      } else {
        console.log(`   ⚠️ Stock insuffisant: ${stockItem.name}, dispo: ${stockItem.quantity}, besoin: ${quantityToDeduct}`);
        notEnoughStock.push({ name, required: quantityToDeduct, available: stockItem.quantity, unit: stockItem.unit, reason: 'insufficient' });
      }
    } else {
      console.log(`   ❌ Pas trouvé dans le stock backend: "${name}"`);
      console.log(`   📋 Ingrédients disponibles dans le stock:`, userStock.items.map(i => i.name).join(', '));
      notEnoughStock.push({ name, required: quantityToDeduct, available: 0, unit: unit, reason: 'not_found' });
    }
  }

  if (notEnoughStock.length > 0) {
    const missingNames = notEnoughStock.map(item => {
      let msg = item.name;
      if (item.reason === 'insufficient') {
        msg += ` (manque ${item.required - item.available} ${item.unit || 'unité(s)'})`;
      } else {
        msg += ` (non trouvé dans le stock)`;
      }
      return msg;
    }).join(', ');
    res.status(400);
    throw new Error(`Stock insuffisant ou ingrédient(s) non trouvé(s) pour: ${missingNames}. Veuillez ajuster votre inventaire.`);
  }

  await userStock.save();

  res.status(200).json({ success: true, message: `Stock mis à jour avec succès pour ${updatedItems.join(', ')}.`, updatedItems });
});


// Note: processOcrDeliveryNote needs to be defined in ocrController.js
// and properly imported. It is not part of this snippet's scope.
// export const processOcrDeliveryNote = asyncHandler(async (req, res) => { ... });