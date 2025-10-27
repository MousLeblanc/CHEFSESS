import asyncHandler from 'express-async-handler';
import Stock from '../models/Stock.js'; //

// @desc    Obtenir le stock de l'utilisateur connecté
// @route   GET /api/stock
// @access  Private
export const getUserStock = asyncHandler(async (req, res) => {
  const stock = await Stock.findOne({ createdBy: req.user._id });

  if (!stock) {
    return res.status(200).json({ success: true, data: [] });
  }

  res.status(200).json({ success: true, data: stock.items });
});

// @desc    Obtenir les éléments de stock par catégorie
// @route   GET /api/stock/category/:category
// @access  Private
export const getStockByCategory = asyncHandler(async (req, res) => {
  const stock = await Stock.findOne({ createdBy: req.user._id });

  if (!stock) {
    return res.status(200).json({ success: true, data: [] });
  }

  const categoryItems = stock.items.filter(item => item.category === req.params.category);
  res.status(200).json({ success: true, data: categoryItems });
});

// @desc    Obtenir les éléments de stock qui expirent bientôt
// @route   GET /api/stock/expiring/:days?
// @access  Private
export const getExpiringItems = asyncHandler(async (req, res) => { //
  const stock = await Stock.findOne({ createdBy: req.user._id }); //

  if (!stock) { //
    return res.status(200).json({ success: true, data: [] }); //
  }

  const days = req.params.days ? parseInt(req.params.days) : 7; //
  const expiringItems = stock.getExpiringItems(days); //
  res.status(200).json({ success: true, data: expiringItems }); //
});

// @desc    Obtenir la valeur totale du stock
// @route   GET /api/stock/value
// @access  Private
export const getStockValue = asyncHandler(async (req, res) => { //
  const stock = await Stock.findOne({ createdBy: req.user._id }); //

  if (!stock) { //
    return res.status(200).json({ success: true, value: 0 }); //
  }

  const totalValue = stock.getTotalStockValue(); //
  res.status(200).json({ success: true, value: totalValue }); //
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

  // Clear existing items and add new ones for a full replacement/update
  userStock.items = items.map(item => ({
    name: item.name,
    quantity: item.quantity,
    unit: item.unit,
    category: item.category,
    expirationDate: item.expirationDate || null,
    alertThreshold: item.alertThreshold || 0,
    source: item.source || 'manual',
    price: item.price || 0,
  }));

  await userStock.save();

  res.status(200).json({ success: true, message: 'Stock mis à jour avec succès.', data: userStock.items });
});


// NEW: @desc Add a new item to the user's stock
// @route POST /api/stock
// @access Private
export const addItemToStock = asyncHandler(async (req, res) => {
  const { name, quantity, unit, category, expirationDate, alertThreshold, source, price } = req.body;

  if (!name || typeof quantity !== 'number' || quantity < 0 || !unit || !category) {
    res.status(400);
    throw new Error('Nom, quantité, unité et catégorie sont requis pour ajouter un article.');
  }

  let userStock = await Stock.findOne({ createdBy: req.user._id });

  if (!userStock) {
    userStock = new Stock({ createdBy: req.user._id, establishmentType: req.user.establishmentType || 'autre', items: [] });
  }

  // Check if item already exists to prevent duplicates (optional, based on desired behavior)
  const existingItem = userStock.items.find(item => item.name.toLowerCase() === name.toLowerCase() && item.unit.toLowerCase() === unit.toLowerCase());

  if (existingItem) {
    // If item exists, update its quantity
    existingItem.quantity += quantity;
    existingItem.updatedAt = new Date();
    // You might also want to update other fields if provided, e.g., price, expirationDate
    if (expirationDate) existingItem.expirationDate = expirationDate;
    if (alertThreshold) existingItem.alertThreshold = alertThreshold;
    if (source) existingItem.source = source;
    if (price) existingItem.price = price;

    await userStock.save();
    return res.status(200).json({ success: true, message: 'Quantité de l\'ingrédient mise à jour.', data: existingItem });
  } else {
    // Add new item to the stock
    const newItem = {
      name,
      quantity,
      unit,
      category,
      expirationDate: expirationDate || null,
      alertThreshold: alertThreshold || 0,
      source: source || 'manual',
      price: price || 0,
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

  const itemToUpdate = userStock.items.id(id); // Find the subdocument by its _id

  if (!itemToUpdate) {
    res.status(404);
    throw new Error('Ingrédient non trouvé dans le stock.');
  }

  // Update item fields if provided
  if (name) itemToUpdate.name = name;
  if (typeof quantity === 'number' && quantity >= 0) itemToUpdate.quantity = quantity;
  if (unit) itemToUpdate.unit = unit;
  if (category) itemToUpdate.category = category;
  if (expirationDate) itemToUpdate.expirationDate = expirationDate;
  if (typeof alertThreshold === 'number' && alertThreshold >= 0) itemToUpdate.alertThreshold = alertThreshold;
  if (source) itemToUpdate.source = source;
  if (typeof price === 'number' && price >= 0) itemToUpdate.price = price;

  itemToUpdate.updatedAt = new Date(); // Update timestamp

  await userStock.save();

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
  
  console.log(`📦 Stock chargé: ${userStock.items.length} items disponibles`);
  console.log(`📋 Liste des items en stock:`, userStock.items.map(i => `"${i.name}" (${i.quantity}${i.unit})`).join(', '));

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

    const stockItem = userStock.items.find(item => {
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