import FoodCost from "../models/FoodCost.js";
import Order from "../models/Order.js";
import Resident from "../models/Resident.js";

// @desc    Obtenir les périodes de food cost pour un site
// @route   GET /api/foodcost
// @access  Private (Site managers, Group admins)
export const getFoodCostPeriods = async (req, res) => {
  try {
    const { siteId, period, startDate, endDate } = req.query;
    
    // Récupérer le siteId depuis la query string si fourni (pour gérer les onglets multiples)
    const siteIdFromQuery = req.query.siteId || siteId;
    const userSiteId = siteIdFromQuery || (req.user.siteId ? req.user.siteId.toString() : null);
    
    // Vérifier les rôles dans le tableau roles aussi
    const hasRoleInArray = req.user.roles && Array.isArray(req.user.roles) && (
      req.user.roles.includes('GROUP_ADMIN') || 
      req.user.roles.includes('SITE_MANAGER') ||
      req.user.roles.includes('CHEF')
    );
    
    let query = {};
    
    // Filtrer par site ou groupe selon les permissions
    if (req.user.role === 'SITE_MANAGER' || req.user.role === 'groupe' || hasRoleInArray || req.user.establishmentType) {
      query.siteId = userSiteId || req.user.siteId;
    } else if (req.user.role === 'GROUP_ADMIN') {
      if (siteIdFromQuery) {
        query.siteId = siteIdFromQuery;
      } else {
        query.groupId = req.user.groupId;
      }
    } else if (req.user.role === 'admin') {
      if (siteIdFromQuery) query.siteId = siteIdFromQuery;
    } else if (userSiteId) {
      // Si un siteId est fourni, l'utiliser même si le rôle n'est pas explicite
      query.siteId = userSiteId;
    } else {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
    console.log('🔍 getFoodCostPeriods - Query:', {
      query: query,
      userRole: req.user.role,
      userRoles: req.user.roles,
      userSiteId: userSiteId,
      siteIdFromQuery: siteIdFromQuery
    });
    
    // Filtres optionnels
    if (period) query.period = period;
    if (startDate || endDate) {
      query.startDate = {};
      if (startDate) query.startDate.$gte = new Date(startDate);
      if (endDate) query.startDate.$lte = new Date(endDate);
    }
    
    const foodCosts = await FoodCost.find(query)
      .populate('siteId', 'name establishmentType')
      .populate('groupId', 'name')
      .sort({ startDate: -1 });
    
    res.json({
      success: true,
      count: foodCosts.length,
      data: foodCosts
    });
  } catch (error) {
    console.error('Erreur getFoodCostPeriods:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des périodes de food cost',
      error: error.message 
    });
  }
};

// @desc    Obtenir une période de food cost spécifique
// @route   GET /api/foodcost/:id
// @access  Private
export const getFoodCostById = async (req, res) => {
  try {
    // Valider que l'ID est un ObjectId valide (24 caractères hexadécimaux)
    const { id } = req.params;
    if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID invalide. L\'ID doit être un ObjectId MongoDB valide (24 caractères hexadécimaux).'
      });
    }
    
    const foodCost = await FoodCost.findById(id)
      .populate('siteId', 'name establishmentType')
      .populate('groupId', 'name')
      .populate('expenses.manual.addedBy', 'firstName lastName email');
    
    if (!foodCost) {
      return res.status(404).json({ 
        success: false,
        message: 'Période de food cost non trouvée' 
      });
    }
    
    // Vérifier les permissions
    const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'GROUP_ADMIN' && foodCost.groupId.toString() === req.user.groupId.toString()) ||
      (req.user.siteId && foodCost.siteId._id.toString() === req.user.siteId.toString()) ||
      (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType) && 
       req.user.siteId && foodCost.siteId._id.toString() === req.user.siteId.toString());
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé à cette période' 
      });
    }
    
    res.json({
      success: true,
      data: foodCost
    });
  } catch (error) {
    console.error('Erreur getFoodCostById:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de la période',
      error: error.message 
    });
  }
};

// @desc    Créer une nouvelle période de food cost
// @route   POST /api/foodcost
// @access  Private (Site managers, Group admins)
export const createFoodCost = async (req, res) => {
  try {
    const { siteId, period, startDate, endDate, budget } = req.body;
    
    // Vérifier les permissions
    const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
    
    // Récupérer le siteId depuis la query string ou le body si fourni (pour gérer les onglets multiples)
    const siteIdFromQuery = req.query.siteId || req.body.siteId;
    const userSiteId = siteIdFromQuery || (req.user.siteId ? req.user.siteId.toString() : null);
    
    // Vérifier les rôles dans le tableau roles aussi
    const hasRoleInArray = req.user.roles && Array.isArray(req.user.roles) && (
      req.user.roles.includes('GROUP_ADMIN') || 
      req.user.roles.includes('SITE_MANAGER') ||
      req.user.roles.includes('CHEF')
    );
    
    // Vérifier si l'utilisateur a un siteId (même si le rôle n'est pas explicite)
    const hasSiteId = userSiteId || req.user.siteId;
    
    const hasPermission = 
      req.user.role === 'admin' ||
      req.user.role === 'GROUP_ADMIN' ||
      req.user.role === 'SITE_MANAGER' ||
      req.user.role === 'groupe' ||
      req.user.role === 'collectivite' ||
      hasRoleInArray ||
      (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType) && hasSiteId) ||
      (hasSiteId && req.user.establishmentType);
    
    console.log('🔐 Vérification des permissions pour créer une période:', {
      userId: req.user._id ? req.user._id.toString() : 'undefined',
      role: req.user.role,
      roles: req.user.roles,
      establishmentType: req.user.establishmentType,
      siteId: req.user.siteId ? req.user.siteId.toString() : 'undefined',
      siteIdFromQuery: siteIdFromQuery,
      userSiteId: userSiteId,
      hasSiteId: hasSiteId,
      hasRoleInArray: hasRoleInArray,
      hasPermission: hasPermission,
      check1: req.user.role === 'admin',
      check2: req.user.role === 'GROUP_ADMIN',
      check3: req.user.role === 'SITE_MANAGER',
      check4: req.user.role === 'groupe',
      check5: req.user.role === 'collectivite',
      check6: hasRoleInArray,
      check7: (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType) && hasSiteId),
      check8: (hasSiteId && req.user.establishmentType)
    });
    
    if (!hasPermission) {
      console.log('❌ Permission refusée pour:', { 
        role: req.user.role, 
        roles: req.user.roles,
        establishmentType: req.user.establishmentType,
        siteId: req.user.siteId,
        userSiteId: userSiteId
      });
      return res.status(403).json({ 
        success: false,
        message: 'Vous n\'avez pas la permission de créer une période de food cost' 
      });
    }
    
    console.log('✅ Permission accordée pour:', { 
      role: req.user.role, 
      establishmentType: req.user.establishmentType 
    });
    
    // Déterminer le site et le groupe
    // Utiliser le siteId de la query string/body en priorité, sinon celui de req.user
    let targetSiteId = siteId || userSiteId || req.user.siteId;
    let groupId = req.user.groupId;
    
    // Si l'utilisateur a un siteId mais pas de siteId dans la requête, utiliser celui de l'utilisateur
    if (!targetSiteId && (req.user.role === 'SITE_MANAGER' || req.user.establishmentType || userSiteId)) {
      targetSiteId = userSiteId || req.user.siteId;
    }
    
    console.log('📋 Création de période avec:', {
      targetSiteId: targetSiteId,
      groupId: groupId,
      period: period,
      startDate: startDate,
      endDate: endDate
    });
    
    // Vérifier qu'une période n'existe pas déjà pour ces dates
    const existingPeriod = await FoodCost.findOne({
      siteId: targetSiteId,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }
      ]
    });
    
    if (existingPeriod) {
      return res.status(400).json({ 
        success: false,
        message: 'Une période de food cost existe déjà pour ces dates' 
      });
    }
    
    // Calculer le nombre de jours
    const start = new Date(startDate);
    const end = new Date(endDate);
    const numberOfDays = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Obtenir le nombre de résidents actifs
    const residentsCount = await Resident.countDocuments({
      siteId: targetSiteId,
      status: 'actif'
    });
    
    // Estimer le nombre de repas (3 repas/jour/résident)
    const numberOfMeals = residentsCount * numberOfDays * 3;
    
    // Calculer les dépenses des commandes pour cette période
    // 🎯 Filtrer par date de LIVRAISON, pas date de création !
    console.log(`\n📊 ========== RECHERCHE COMMANDES ==========`);
    console.log(`🗓️  Période: ${start.toLocaleDateString('fr-FR')} - ${end.toLocaleDateString('fr-FR')}`);
    console.log(`🏥 Site ID: ${targetSiteId}`);
    console.log(`🔍 Recherche des commandes livrées entre ces dates...\n`);
    
    // 🎯 STRATÉGIE HYBRIDE : Cherche par dates.delivered si disponible, sinon createdAt
    const orders = await Order.find({
      siteId: targetSiteId,
      status: { $in: ['delivered', 'completed'] },
      $or: [
        {
          // Option 1: dates.delivered existe et dans la période
          'dates.delivered': {
            $gte: start,
            $lte: end,
            $ne: null
          }
        },
        {
          // Option 2: dates.delivered n'existe pas → utiliser createdAt
          'dates.delivered': { $exists: false },
          createdAt: {
            $gte: start,
            $lte: end
          }
        },
        {
          // Option 3: dates.delivered est null → utiliser createdAt
          'dates.delivered': null,
          createdAt: {
            $gte: start,
            $lte: end
          }
        }
      ]
    });
    
    const ordersTotal = orders.reduce((sum, order) => {
      // Utiliser pricing.total car le modèle Order stocke le total dans pricing.total
      const orderTotal = order.pricing?.total || 0;
      const deliveredDate = order.dates?.delivered ? new Date(order.dates.delivered).toLocaleDateString('fr-FR') : 'N/A';
      console.log(`📦 Commande ${order.orderNumber} (livrée le ${deliveredDate}): ${orderTotal}€`);
      return sum + orderTotal;
    }, 0);
    
    console.log(`💰 Total des commandes pour la période: ${ordersTotal}€`);
    
    // 🆕 Récupérer les achats directs du stock pour cette période
    const Stock = (await import('../models/Stock.js')).default;
    let userStock = await Stock.findOne({ createdBy: req.user._id });
    
    // Si pas trouvé par createdBy, chercher par siteId dans les items
    if (!userStock) {
      userStock = await Stock.findOne({ 'items.siteId': targetSiteId });
    }
    
    const stockPurchasesItems = [];
    
    if (userStock && userStock.items && userStock.items.length > 0) {
      console.log(`\n🛒 ========== RECHERCHE ACHATS STOCK ==========`);
      
      userStock.items.forEach((item) => {
        if (item.purchaseDate && item.price && item.price > 0) {
          const purchaseDate = new Date(item.purchaseDate);
          
          if (purchaseDate >= start && purchaseDate <= end) {
            const itemTotal = (item.price || 0) * (item.quantity || 0);
            
            stockPurchasesItems.push({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              price: item.price,
              total: itemTotal,
              purchaseDate: purchaseDate,
              store: item.supplier || 'Magasin inconnu',
              category: item.category || 'autres'
            });
            
            console.log(`   🛒 ${item.name}: ${item.quantity} ${item.unit} × ${item.price}€ = ${itemTotal.toFixed(2)}€ (achat le ${purchaseDate.toLocaleDateString('fr-FR')})`);
          }
        }
      });
      
      if (stockPurchasesItems.length > 0) {
        console.log(`💰 Total achats stock: ${stockPurchasesItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}€`);
      }
    }
    
    // Mapper les achats stock en dépenses manuelles
    const categoryMap = {
      'legumes': 'fruits_legumes',
      'fruits': 'fruits_legumes',
      'viandes': 'viandes_poissons',
      'poissons': 'viandes_poissons',
      'produits-laitiers': 'produits_laitiers',
      'cereales': 'epicerie',
      'epices': 'epicerie',
      'boissons': 'boissons',
      'autres': 'autres'
    };
    
    const manualExpenses = stockPurchasesItems.map(item => ({
      date: item.purchaseDate,
      category: categoryMap[item.category] || 'autres',
      description: `${item.name} (${item.quantity} ${item.unit})`,
      supplier: item.store || 'Magasin',
      amount: item.total,
      notes: `[Achat Stock Auto] Acheté le ${item.purchaseDate.toLocaleDateString('fr-FR')}`,
      addedBy: req.user._id
    }));
    
    const manualTotal = manualExpenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalExpenses = ordersTotal + manualTotal;
    
    console.log(`\n💰 ========== TOTAUX ==========`);
    console.log(`   Commandes fournisseurs: ${ordersTotal.toFixed(2)}€`);
    console.log(`   Achats stock: ${manualTotal.toFixed(2)}€`);
    console.log(`   TOTAL: ${totalExpenses.toFixed(2)}€`);
    
    // Créer la période
    const foodCost = await FoodCost.create({
      siteId: targetSiteId,
      groupId,
      period,
      startDate: start,
      endDate: end,
      budget: budget || { planned: 0 },
      expenses: {
        orders: ordersTotal,
        manual: manualExpenses,
        total: totalExpenses
      },
      metrics: {
        numberOfResidents: residentsCount,
        numberOfMeals,
        numberOfDays
      },
      createdBy: req.user._id
    });
    
    res.status(201).json({
      success: true,
      data: foodCost
    });
  } catch (error) {
    console.error('Erreur createFoodCost:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la création de la période de food cost',
      error: error.message 
    });
  }
};

// @desc    Mettre à jour une période de food cost
// @route   PUT /api/foodcost/:id
// @access  Private
export const updateFoodCost = async (req, res) => {
  try {
    const foodCost = await FoodCost.findById(req.params.id);
    
    if (!foodCost) {
      return res.status(404).json({ 
        success: false,
        message: 'Période de food cost non trouvée' 
      });
    }
    
    // Vérifier les permissions
    const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'GROUP_ADMIN' && foodCost.groupId.toString() === req.user.groupId.toString()) ||
      (req.user.siteId && foodCost.siteId.toString() === req.user.siteId.toString()) ||
      (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType) && 
       req.user.siteId && foodCost.siteId.toString() === req.user.siteId.toString());
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé' 
      });
    }
    
    // Mettre à jour les champs autorisés
    const { budget, notes } = req.body;
    
    if (budget) foodCost.budget = { ...foodCost.budget, ...budget };
    if (notes !== undefined) foodCost.notes = notes;
    
    foodCost.lastUpdatedBy = req.user._id;
    
    await foodCost.save();
    
    res.json({
      success: true,
      data: foodCost
    });
  } catch (error) {
    console.error('Erreur updateFoodCost:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la mise à jour',
      error: error.message 
    });
  }
};

// @desc    Supprimer une période de food cost
// @route   DELETE /api/foodcost/:id
// @access  Private
export const deleteFoodCost = async (req, res) => {
  try {
    const foodCost = await FoodCost.findById(req.params.id);
    
    if (!foodCost) {
      return res.status(404).json({ 
        success: false,
        message: 'Période de food cost non trouvée' 
      });
    }
    
    // Vérifier les permissions
    const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'GROUP_ADMIN' && foodCost.groupId.toString() === req.user.groupId.toString()) ||
      (req.user.siteId && foodCost.siteId.toString() === req.user.siteId.toString()) ||
      (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType) && 
       req.user.siteId && foodCost.siteId.toString() === req.user.siteId.toString());
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé' 
      });
    }
    
    await foodCost.deleteOne();
    
    console.log(`✅ Période Food Cost supprimée: ${foodCost.period} (${foodCost.startDate.toLocaleDateString('fr-FR')} - ${foodCost.endDate.toLocaleDateString('fr-FR')})`);
    
    res.json({
      success: true,
      message: 'Période supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteFoodCost:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression',
      error: error.message 
    });
  }
};

// @desc    Ajouter une dépense manuelle
// @route   POST /api/foodcost/:id/expense
// @access  Private
export const addManualExpense = async (req, res) => {
  try {
    const foodCost = await FoodCost.findById(req.params.id);
    
    if (!foodCost) {
      return res.status(404).json({ 
        success: false,
        message: 'Période de food cost non trouvée' 
      });
    }
    
    // Vérifier les permissions
    const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'GROUP_ADMIN' && foodCost.groupId.toString() === req.user.groupId.toString()) ||
      (req.user.siteId && foodCost.siteId.toString() === req.user.siteId.toString()) ||
      (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType) && 
       req.user.siteId && foodCost.siteId.toString() === req.user.siteId.toString());
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé' 
      });
    }
    
    const { date, category, description, supplier, amount, invoiceNumber, notes } = req.body;
    
    if (!date || !category || !amount) {
      return res.status(400).json({ 
        success: false,
        message: 'Date, catégorie et montant sont requis' 
      });
    }
    
    // Vérifier que la date est dans la période
    const expenseDate = new Date(date);
    if (expenseDate < foodCost.startDate || expenseDate > foodCost.endDate) {
      return res.status(400).json({ 
        success: false,
        message: 'La date doit être dans la période du food cost' 
      });
    }
    
    foodCost.expenses.manual.push({
      date: expenseDate,
      category,
      description,
      supplier,
      amount: parseFloat(amount),
      invoiceNumber,
      notes,
      addedBy: req.user._id
    });
    
    foodCost.lastUpdatedBy = req.user._id;
    
    await foodCost.save();
    
    res.status(201).json({
      success: true,
      data: foodCost
    });
  } catch (error) {
    console.error('Erreur addManualExpense:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de l\'ajout de la dépense',
      error: error.message 
    });
  }
};

// @desc    Supprimer une dépense manuelle
// @route   DELETE /api/foodcost/:id/expense/:expenseId
// @access  Private
export const deleteManualExpense = async (req, res) => {
  try {
    const foodCost = await FoodCost.findById(req.params.id);
    
    if (!foodCost) {
      return res.status(404).json({ 
        success: false,
        message: 'Période de food cost non trouvée' 
      });
    }
    
    // Vérifier les permissions
    const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
    const hasAccess = 
      req.user.role === 'admin' ||
      (req.user.role === 'GROUP_ADMIN' && foodCost.groupId.toString() === req.user.groupId.toString()) ||
      (req.user.siteId && foodCost.siteId.toString() === req.user.siteId.toString()) ||
      (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType) && 
       req.user.siteId && foodCost.siteId.toString() === req.user.siteId.toString());
    
    if (!hasAccess) {
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé' 
      });
    }
    
    foodCost.expenses.manual = foodCost.expenses.manual.filter(
      expense => expense._id.toString() !== req.params.expenseId
    );
    
    foodCost.lastUpdatedBy = req.user._id;
    
    await foodCost.save();
    
    res.json({
      success: true,
      data: foodCost
    });
  } catch (error) {
    console.error('Erreur deleteManualExpense:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la suppression de la dépense',
      error: error.message 
    });
  }
};

// @desc    Recalculer les dépenses de commandes pour une période
// @route   POST /api/foodcost/:id/recalculate
// @access  Private
export const recalculateOrders = async (req, res) => {
  try {
    const foodCost = await FoodCost.findById(req.params.id);
    
    if (!foodCost) {
      return res.status(404).json({ 
        success: false,
        message: 'Période de food cost non trouvée' 
      });
    }
    
    // Recalculer les commandes
    // 🎯 Filtrer par date de LIVRAISON, pas date de création !
    console.log(`\n🔄 ========== RECALCUL FOOD COST ==========`);
    console.log(`📊 Période: ${foodCost.startDate.toLocaleDateString('fr-FR')} - ${foodCost.endDate.toLocaleDateString('fr-FR')}`);
    console.log(`🏥 Site ID: ${foodCost.siteId}`);
    console.log(`🔍 Recherche des commandes livrées entre ces dates...\n`);
    
    // 🎯 STRATÉGIE HYBRIDE : Cherche par dates.delivered si disponible, sinon createdAt
    const orders = await Order.find({
      siteId: foodCost.siteId,
      status: { $in: ['delivered', 'completed'] },
      $or: [
        {
          // Option 1: dates.delivered existe et dans la période
          'dates.delivered': {
            $gte: foodCost.startDate,
            $lte: foodCost.endDate,
            $ne: null
          }
        },
        {
          // Option 2: dates.delivered n'existe pas → utiliser createdAt
          'dates.delivered': { $exists: false },
          createdAt: {
            $gte: foodCost.startDate,
            $lte: foodCost.endDate
          }
        },
        {
          // Option 3: dates.delivered est null → utiliser createdAt
          'dates.delivered': null,
          createdAt: {
            $gte: foodCost.startDate,
            $lte: foodCost.endDate
          }
        }
      ]
    });
    
    console.log(`\n📦 ========== RÉSULTATS COMMANDES ==========`);
    console.log(`✅ ${orders.length} commande(s) trouvée(s)`);
    
    if (orders.length === 0) {
      console.log(`\n⚠️  AUCUNE COMMANDE TROUVÉE !`);
      console.log(`   Vérifiez:`);
      console.log(`   - Site ID: ${foodCost.siteId}`);
      console.log(`   - Période: ${foodCost.startDate.toLocaleDateString('fr-FR')} - ${foodCost.endDate.toLocaleDateString('fr-FR')}`);
      console.log(`   - Status: delivered ou completed`);
    } else {
      console.log(`\n📋 Liste des commandes:`);
    }
    
    foodCost.expenses.orders = orders.reduce((sum, order) => {
      // Utiliser pricing.total car le modèle Order stocke le total dans pricing.total
      const orderTotal = order.pricing?.total || 0;
      const deliveredDate = order.dates?.delivered ? new Date(order.dates.delivered).toLocaleDateString('fr-FR') : 'N/A';
      console.log(`   📦 ${order.orderNumber} (livré le ${deliveredDate}): ${orderTotal}€`);
      return sum + orderTotal;
    }, 0);
    
    console.log(`💰 Total commandes: ${foodCost.expenses.orders}€`);
    
    // 🆕 Récupérer les achats directs du stock pour cette période
    const Stock = (await import('../models/Stock.js')).default;
    // Chercher le stock par utilisateur ET par siteId pour être sûr
    let userStock = await Stock.findOne({ createdBy: req.user._id });
    
    // Si pas trouvé par createdBy, chercher par siteId dans les items
    if (!userStock) {
      userStock = await Stock.findOne({ 'items.siteId': foodCost.siteId });
    }
    
    let stockPurchasesTotal = 0;
    const stockPurchasesItems = [];
    
    if (userStock && userStock.items && userStock.items.length > 0) {
      console.log(`\n🛒 ========== RECHERCHE ACHATS STOCK ==========`);
      
      userStock.items.forEach((item) => {
        // Vérifier si l'item a une date d'achat et un prix dans la période
        if (item.purchaseDate && item.price && item.price > 0) {
          const purchaseDate = new Date(item.purchaseDate);
          
          // Vérifier si la date d'achat est dans la période
          if (purchaseDate >= foodCost.startDate && purchaseDate <= foodCost.endDate) {
            // Calculer le total de l'achat : prix unitaire * quantité
            const itemTotal = (item.price || 0) * (item.quantity || 0);
            stockPurchasesTotal += itemTotal;
            
            stockPurchasesItems.push({
              name: item.name,
              quantity: item.quantity,
              unit: item.unit,
              price: item.price,
              total: itemTotal,
              purchaseDate: purchaseDate,
              store: item.supplier || 'Magasin inconnu',
              category: item.category || 'autres'
            });
            
            console.log(`   🛒 ${item.name}: ${item.quantity} ${item.unit} × ${item.price}€ = ${itemTotal.toFixed(2)}€ (achat le ${purchaseDate.toLocaleDateString('fr-FR')})`);
          }
        }
      });
      
      console.log(`💰 Total achats stock: ${stockPurchasesTotal.toFixed(2)}€`);
    }
    
    // Supprimer les anciennes dépenses auto de stock pour les recalculer (éviter les doublons)
    foodCost.expenses.manual = foodCost.expenses.manual.filter(exp => 
      !(exp.notes && exp.notes.includes('[Achat Stock Auto]'))
    );
    
    // Ajouter les nouveaux achats stock comme dépenses manuelles automatiques
    if (stockPurchasesItems.length > 0) {
      // Mapper la catégorie du stock vers la catégorie Food Cost
      const categoryMap = {
        'legumes': 'fruits_legumes',
        'fruits': 'fruits_legumes',
        'viandes': 'viandes_poissons',
        'poissons': 'viandes_poissons',
        'produits-laitiers': 'produits_laitiers',
        'cereales': 'epicerie',
        'epices': 'epicerie',
        'boissons': 'boissons',
        'autres': 'autres'
      };
      
      stockPurchasesItems.forEach(item => {
        const foodCostCategory = categoryMap[item.category] || 'autres';
        
        foodCost.expenses.manual.push({
          date: item.purchaseDate,
          category: foodCostCategory,
          description: `${item.name} (${item.quantity} ${item.unit})`,
          supplier: item.store || 'Magasin',
          amount: item.total,
          notes: `[Achat Stock Auto] Acheté le ${item.purchaseDate.toLocaleDateString('fr-FR')}`,
          addedBy: req.user._id
        });
      });
      
      console.log(`✅ ${stockPurchasesItems.length} achat(s) stock ajouté(s) comme dépenses`);
    }
    
    // Recalculer le total en incluant les dépenses manuelles (y compris les achats stock)
    const manualTotal = foodCost.expenses.manual.reduce((sum, exp) => sum + exp.amount, 0);
    foodCost.expenses.total = foodCost.expenses.orders + manualTotal;
    
    console.log(`\n💰 ========== TOTAUX FINAUX ==========`);
    console.log(`   Commandes fournisseurs: ${foodCost.expenses.orders.toFixed(2)}€`);
    console.log(`   Achats stock: ${stockPurchasesTotal.toFixed(2)}€`);
    console.log(`   Dépenses manuelles totales: ${manualTotal.toFixed(2)}€`);
    console.log(`   TOTAL: ${foodCost.expenses.total.toFixed(2)}€`);
    
    // Appeler la méthode de calcul pour mettre à jour les métriques
    if (typeof foodCost.calculateTotals === 'function') {
      foodCost.calculateTotals();
    }
    
    foodCost.lastUpdatedBy = req.user._id;
    
    await foodCost.save();
    
    res.json({
      success: true,
      data: foodCost
    });
  } catch (error) {
    console.error('Erreur recalculateOrders:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors du recalcul',
      error: error.message 
    });
  }
};

// @desc    Obtenir les statistiques globales de food cost
// @route   GET /api/foodcost/stats/summary
// @access  Private
export const getFoodCostStats = async (req, res) => {
  try {
    // Récupérer le siteId depuis la query string si fourni (pour gérer les onglets multiples)
    const siteIdFromQuery = req.query.siteId;
    const userSiteId = siteIdFromQuery || (req.user.siteId ? req.user.siteId.toString() : null);
    
    // Vérifier les rôles dans le tableau roles aussi
    const hasRoleInArray = req.user.roles && Array.isArray(req.user.roles) && (
      req.user.roles.includes('GROUP_ADMIN') || 
      req.user.roles.includes('SITE_MANAGER') ||
      req.user.roles.includes('CHEF')
    );
    
    let query = {};
    
    if (req.user.role === 'SITE_MANAGER' || req.user.role === 'groupe' || hasRoleInArray || req.user.establishmentType) {
      query.siteId = userSiteId || req.user.siteId;
    } else if (req.user.role === 'GROUP_ADMIN') {
      if (siteIdFromQuery) {
        query.siteId = siteIdFromQuery;
      } else {
        query.groupId = req.user.groupId;
      }
    } else if (req.user.role === 'admin') {
      if (siteIdFromQuery) query.siteId = siteIdFromQuery;
    } else if (userSiteId) {
      // Si un siteId est fourni, l'utiliser même si le rôle n'est pas explicite
      query.siteId = userSiteId;
    } else {
      console.log('❌ getFoodCostStats - Accès refusé:', {
        role: req.user.role,
        roles: req.user.roles,
        userSiteId: userSiteId,
        siteIdFromQuery: siteIdFromQuery
      });
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé' 
      });
    }
    
    console.log('🔍 getFoodCostStats - Query:', {
      query: query,
      userRole: req.user.role,
      userRoles: req.user.roles,
      userSiteId: userSiteId,
      siteIdFromQuery: siteIdFromQuery
    });
    
    const foodCosts = await FoodCost.find(query);
    
    const stats = {
      totalPeriods: foodCosts.length,
      currentMonth: null,
      alerts: {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      },
      status: {
        ok: 0,
        warning: 0,
        alert: 0,
        critical: 0
      },
      totals: {
        budget: 0,
        spent: 0,
        variance: 0
      }
    };
    
    foodCosts.forEach(fc => {
      // Compter les statuts
      if (fc.analysis?.status) {
        stats.status[fc.analysis.status]++;
      }
      
      // Compter les alertes
      if (fc.analysis?.alerts) {
        fc.analysis.alerts.forEach(alert => {
          if (!alert.acknowledged && stats.alerts[alert.severity] !== undefined) {
            stats.alerts[alert.severity]++;
          }
        });
      }
      
      // Totaux
      stats.totals.budget += fc.budget.planned || 0;
      stats.totals.spent += fc.expenses.total || 0;
    });
    
    stats.totals.variance = stats.totals.spent - stats.totals.budget;
    
    // Période en cours (mois actuel)
    const now = new Date();
    const currentPeriod = foodCosts.find(fc => 
      fc.startDate <= now && fc.endDate >= now
    );
    
    if (currentPeriod) {
      stats.currentMonth = currentPeriod;
    }
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Erreur getFoodCostStats:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération des statistiques',
      error: error.message 
    });
  }
};

// @desc    Marquer une alerte comme lue
// @route   PUT /api/foodcost/:id/alerts/:alertId/acknowledge
// @access  Private
export const acknowledgeAlert = async (req, res) => {
  try {
    const foodCost = await FoodCost.findById(req.params.id);
    
    if (!foodCost) {
      return res.status(404).json({ 
        success: false,
        message: 'Période de food cost non trouvée' 
      });
    }
    
    const alert = foodCost.analysis.alerts.id(req.params.alertId);
    if (!alert) {
      return res.status(404).json({ 
        success: false,
        message: 'Alerte non trouvée' 
      });
    }
    
    alert.acknowledged = true;
    await foodCost.save();
    
    res.json({
      success: true,
      data: foodCost
    });
  } catch (error) {
    console.error('Erreur acknowledgeAlert:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la mise à jour de l\'alerte',
      error: error.message 
    });
  }
};

// @desc    Obtenir les rapports agrégés de tous les sites pour l'admin
// @route   GET /api/foodcost/reports
// @access  Private (Admin, Group Admin)
export const getAdminReports = async (req, res) => {
  try {
    // Vérifier les permissions (role OU roles array)
    const isAdmin = req.user.role === 'admin' || 
                    req.user.role === 'GROUP_ADMIN' ||
                    (req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('GROUP_ADMIN')));
    
    if (!isAdmin) {
      console.log('❌ Accès refusé aux rapports:', {
        role: req.user.role,
        roles: req.user.roles,
        userId: req.user._id
      });
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent voir les rapports.' 
      });
    }
    
    console.log('✅ Accès autorisé aux rapports:', {
      role: req.user.role,
      roles: req.user.roles,
      groupId: req.user.groupId
    });
    
    const { period, startDate, endDate } = req.query;
    
    // Définir la période par défaut (mois en cours)
    const defaultStart = new Date();
    defaultStart.setDate(1);
    defaultStart.setHours(0, 0, 0, 0);
    
    const defaultEnd = new Date();
    defaultEnd.setMonth(defaultEnd.getMonth() + 1, 0);
    defaultEnd.setHours(23, 59, 59, 999);
    
    const periodStart = startDate ? new Date(startDate) : defaultStart;
    const periodEnd = endDate ? new Date(endDate) : defaultEnd;
    
    console.log(`📊 Génération rapport admin pour période: ${periodStart.toLocaleDateString('fr-FR')} - ${periodEnd.toLocaleDateString('fr-FR')}`);
    
    // Déterminer le groupe à afficher
    const isGroupAdmin = req.user.role === 'GROUP_ADMIN' || 
                        (req.user.roles && req.user.roles.includes('GROUP_ADMIN'));
    
    let groupIdFilter = null;
    if (isGroupAdmin && req.user.groupId) {
      groupIdFilter = req.user.groupId;
      console.log(`🔒 Filtrage par groupe: ${req.user.groupId}`);
    } else if (req.user.role === 'admin' || (req.user.roles && req.user.roles.includes('admin'))) {
      console.log(`👑 Admin global - Tous les sites`);
    }
    
    // 🎯 ÉTAPE 1 : Récupérer TOUS les sites du groupe (ou tous les sites si admin global)
    const Site = (await import('../models/Site.js')).default;
    const siteQuery = groupIdFilter ? { groupId: groupIdFilter } : {};
    const allSites = await Site.find(siteQuery)
      .select('_id name siteName establishmentType address groupId')
      .populate('groupId', 'name');
    
    console.log(`📍 ${allSites.length} site(s) total dans le groupe`);
    
    // 🎯 ÉTAPE 2 : Récupérer les périodes Food Cost pour ces sites
    const siteIds = allSites.map(s => s._id);
    const foodCostQuery = {
      siteId: { $in: siteIds },
      startDate: { $gte: periodStart },
      endDate: { $lte: periodEnd }
    };
    
    const foodCosts = await FoodCost.find(foodCostQuery)
      .populate('siteId', 'name siteName establishmentType address')
      .populate('groupId', 'name')
      .sort({ 'siteId.name': 1, startDate: -1 });
    
    console.log(`✅ ${foodCosts.length} période(s) Food Cost trouvée(s)`);
    
    // 🎯 ÉTAPE 3 : Initialiser le Map avec TOUS les sites (même sans Food Cost)
    const siteStats = new Map();
    let totalBudget = 0;
    let totalExpenses = 0;
    let sitesWithOverBudget = 0;
    
    // Pré-remplir avec tous les sites
    allSites.forEach(site => {
      const siteId = site._id.toString();
      siteStats.set(siteId, {
        siteId: siteId,
        siteName: site.siteName || site.name || 'Site inconnu',
        establishmentType: site.establishmentType || 'autre',
        address: site.address || '',
        groupName: site.groupId?.name || '',
        periods: [],
        totalBudget: 0,
        totalExpenses: 0,
        percentUsed: 0,
        alerts: [],
        hasOverBudget: false
      });
    });
    
    console.log(`📊 ${siteStats.size} site(s) initialisé(s) dans le rapport`);
    
    // 🎯 ÉTAPE 4 : Récupérer toutes les périodes de l'année en cours pour calculer les budgets annuels
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59, 999);
    
    const yearlyFoodCosts = await FoodCost.find({
      siteId: { $in: siteIds },
      startDate: { $gte: yearStart },
      endDate: { $lte: yearEnd }
    })
      .populate('siteId', 'name siteName establishmentType address')
      .populate('groupId', 'name')
      .sort({ 'siteId.name': 1, startDate: -1 });
    
    console.log(`📅 ${yearlyFoodCosts.length} période(s) Food Cost trouvée(s) pour l'année ${currentYear}`);
    
    // Calculer les totaux annuels par site
    const yearlyStats = new Map();
    yearlyFoodCosts.forEach(fc => {
      const siteId = fc.siteId?._id?.toString();
      if (!siteId) return;
      
      if (!yearlyStats.has(siteId)) {
        yearlyStats.set(siteId, {
          totalBudget: 0,
          totalExpenses: 0,
          monthlyPeriods: 0
        });
      }
      
      const stats = yearlyStats.get(siteId);
      stats.totalBudget += fc.budget.planned || 0;
      stats.totalExpenses += fc.expenses.total || 0;
      
      // Compter les périodes mensuelles
      if (fc.period === 'mois') {
        stats.monthlyPeriods++;
      }
    });
    
    // 🎯 ÉTAPE 5 : Ajouter les données Food Cost pour les sites qui en ont
    foodCosts.forEach(fc => {
      const siteId = fc.siteId?._id?.toString();
      if (!siteId || !siteStats.has(siteId)) return;
      
      const site = siteStats.get(siteId);
      
      // Calculer le pourcentage utilisé pour cette période
      const periodPercentUsed = fc.budget.planned > 0 
        ? Math.round((fc.expenses.total / fc.budget.planned) * 100) 
        : 0;
      
      // Ajouter les données de cette période
      site.periods.push({
        period: fc.period,
        startDate: fc.startDate,
        endDate: fc.endDate,
        budget: fc.budget.planned,
        expenses: fc.expenses.total,
        percentUsed: periodPercentUsed,
        hasOverBudget: periodPercentUsed > 100
      });
      
      site.totalBudget += fc.budget.planned;
      site.totalExpenses += fc.expenses.total;
      
      totalBudget += fc.budget.planned;
      totalExpenses += fc.expenses.total;
      
      // Gérer les alertes
      if (fc.analysis?.alerts && fc.analysis.alerts.length > 0) {
        fc.analysis.alerts.forEach(alert => {
          if (!alert.acknowledged) {
            site.alerts.push({
              type: alert.type,
              message: alert.message,
              severity: alert.severity,
              createdAt: alert.date || alert.createdAt
            });
          }
        });
      }
      
      // Vérifier si le site a un dépassement de budget
      if (fc.analysis?.variance?.percentage > 0) {
        site.hasOverBudget = true;
      }
    });
    
    // Calculer le pourcentage global pour chaque site et ajouter les données annuelles
    siteStats.forEach(site => {
      if (site.totalBudget > 0) {
        site.percentUsed = Math.round((site.totalExpenses / site.totalBudget) * 100);
      }
      if (site.hasOverBudget) {
        sitesWithOverBudget++;
      }
      
      // Calculer le budget mensuel moyen et annuel
      const yearlyData = yearlyStats.get(site.siteId) || { totalBudget: 0, totalExpenses: 0, monthlyPeriods: 0 };
      
      // Budget mensuel : moyenne des budgets mensuels de l'année, ou budget de la période actuelle si c'est un mois
      let monthlyBudget = 0;
      if (yearlyData.monthlyPeriods > 0) {
        // Calculer la moyenne des budgets mensuels
        const monthlyPeriods = yearlyFoodCosts.filter(fc => 
          fc.siteId?._id?.toString() === site.siteId && fc.period === 'mois'
        );
        if (monthlyPeriods.length > 0) {
          const totalMonthlyBudget = monthlyPeriods.reduce((sum, fc) => sum + (fc.budget.planned || 0), 0);
          monthlyBudget = totalMonthlyBudget / monthlyPeriods.length;
        }
      } else if (site.totalBudget > 0 && site.periods.length > 0) {
        // Si pas de périodes mensuelles dans l'année, utiliser le budget de la période actuelle
        monthlyBudget = site.totalBudget / site.periods.length;
      }
      
      // Budget annuel = budget mensuel * 12
      const annualBudget = monthlyBudget * 12;
      
      // Dépenses annuelles
      const annualExpenses = yearlyData.totalExpenses;
      
      // Pourcentage utilisé sur l'année
      const annualPercentUsed = annualBudget > 0 ? Math.round((annualExpenses / annualBudget) * 100) : 0;
      
      // Ajouter les données annuelles au site
      site.monthlyBudget = Math.round(monthlyBudget * 100) / 100;
      site.annualBudget = Math.round(annualBudget * 100) / 100;
      site.annualExpenses = Math.round(annualExpenses * 100) / 100;
      site.annualPercentUsed = annualPercentUsed;
      
      // Améliorer les alertes pour inclure les informations annuelles
      if (site.alerts.length > 0 || site.hasOverBudget) {
        // Ajouter une alerte contextuelle avec les informations annuelles
        const monthlyOverBudget = site.percentUsed > 100;
        const annualOverBudget = annualPercentUsed > 100;
        
        if (monthlyOverBudget || annualOverBudget) {
          // Créer un message d'alerte enrichi
          const alertMessages = [];
          
          if (monthlyOverBudget) {
            alertMessages.push(`Budget mensuel dépassé de ${site.percentUsed - 100}%`);
          }
          
          if (annualOverBudget) {
            alertMessages.push(`Budget annuel dépassé de ${annualPercentUsed - 100}%`);
          } else if (annualPercentUsed > 0) {
            alertMessages.push(`Budget annuel utilisé à ${annualPercentUsed}%`);
          }
          
          // Ajouter ou mettre à jour l'alerte principale
          const mainAlert = site.alerts.find(a => a.type === 'budget_exceeded') || {
            type: 'budget_exceeded',
            severity: monthlyOverBudget ? 'high' : 'medium',
            message: '',
            createdAt: new Date()
          };
          
          mainAlert.message = alertMessages.join(' | ');
          mainAlert.annualInfo = {
            annualBudget,
            annualExpenses,
            annualPercentUsed,
            monthlyBudget,
            monthlyExpenses: site.totalExpenses,
            monthlyPercentUsed: site.percentUsed
          };
          
          if (!site.alerts.find(a => a.type === 'budget_exceeded')) {
            site.alerts.push(mainAlert);
          }
        }
      }
    });
    
    // Convertir le Map en array et trier par % d'utilisation (décroissant)
    const sitesArray = Array.from(siteStats.values())
      .sort((a, b) => b.percentUsed - a.percentUsed);
    
    const totalPercentUsed = totalBudget > 0 ? Math.round((totalExpenses / totalBudget) * 100) : 0;
    
    // Calculer les statistiques globales
    const summary = {
      totalSites: allSites.length, // ✅ Total réel de sites (pas seulement ceux avec Food Cost)
      totalBudget: Math.round(totalBudget * 100) / 100,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      totalPercentUsed,
      sitesWithOverBudget,
      sitesWithFoodCost: Array.from(siteStats.values()).filter(s => s.periods.length > 0).length,
      period: {
        start: periodStart,
        end: periodEnd,
        label: `${periodStart.toLocaleDateString('fr-FR')} - ${periodEnd.toLocaleDateString('fr-FR')}`
      }
    };
    
    console.log(`📊 Résumé: ${allSites.length} sites total, ${summary.sitesWithFoodCost} avec Food Cost, Budget: ${summary.totalBudget}€, Dépenses: ${summary.totalExpenses}€ (${totalPercentUsed}%)`);
    console.log(`⚠️  ${sitesWithOverBudget} site(s) en dépassement de budget`);
    
    res.json({
      success: true,
      summary,
      sites: sitesArray
    });
    
  } catch (error) {
    console.error('Erreur getAdminReports:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la génération des rapports',
      error: error.message 
    });
  }
};

// @desc    Obtenir l'historique mensuel des dépenses pour un site
// @route   GET /api/foodcost/site/:siteId/history
// @access  Private (Admin, Group Admin, Site Manager)
export const getSiteHistory = async (req, res) => {
  try {
    const { siteId } = req.params;
    const { year } = req.query; // Année optionnelle
    
    // Vérifier les permissions
    const isAdmin = req.user.role === 'admin' || 
                    req.user.role === 'GROUP_ADMIN' ||
                    (req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('GROUP_ADMIN')));
    
    const isSiteManager = req.user.siteId && req.user.siteId.toString() === siteId;
    
    if (!isAdmin && !isSiteManager) {
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé' 
      });
    }
    
    // Construire la requête
    const query = { siteId };
    
    // Si une année est spécifiée, filtrer par année
    if (year) {
      const yearStart = new Date(parseInt(year), 0, 1);
      const yearEnd = new Date(parseInt(year), 11, 31, 23, 59, 59, 999);
      query.startDate = { $gte: yearStart, $lte: yearEnd };
    }
    
    // Récupérer toutes les périodes Food Cost pour ce site
    const foodCosts = await FoodCost.find(query)
      .populate('siteId', 'name siteName establishmentType')
      .sort({ startDate: 1 }); // Trier par date croissante
    
    // Organiser les données par mois et par année
    const monthlyData = {}; // { "2024-01": { expenses: 1000, budget: 1200, ... }, ... }
    const yearlyData = {}; // { "2024": { expenses: 12000, budget: 14400, ... }, ... }
    
    foodCosts.forEach(fc => {
      const date = new Date(fc.startDate);
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const monthKey = `${year}-${String(month).padStart(2, '0')}`;
      const yearKey = String(year);
      
      // Données mensuelles
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: month,
          year: year,
          expenses: 0,
          budget: 0,
          percentUsed: 0,
          periods: []
        };
      }
      monthlyData[monthKey].expenses += fc.expenses.total;
      monthlyData[monthKey].budget += fc.budget.planned;
      monthlyData[monthKey].periods.push({
        startDate: fc.startDate,
        endDate: fc.endDate,
        expenses: fc.expenses.total,
        budget: fc.budget.planned
      });
      
      // Données annuelles
      if (!yearlyData[yearKey]) {
        yearlyData[yearKey] = {
          year: parseInt(yearKey),
          expenses: 0,
          budget: 0,
          percentUsed: 0
        };
      }
      yearlyData[yearKey].expenses += fc.expenses.total;
      yearlyData[yearKey].budget += fc.budget.planned;
    });
    
    // Calculer les pourcentages
    Object.keys(monthlyData).forEach(key => {
      const data = monthlyData[key];
      if (data.budget > 0) {
        data.percentUsed = Math.round((data.expenses / data.budget) * 100);
      }
    });
    
    Object.keys(yearlyData).forEach(key => {
      const data = yearlyData[key];
      if (data.budget > 0) {
        data.percentUsed = Math.round((data.expenses / data.budget) * 100);
      }
    });
    
    // Convertir en arrays triés
    const monthlyArray = Object.values(monthlyData).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });
    
    const yearlyArray = Object.values(yearlyData).sort((a, b) => a.year - b.year);
    
    res.json({
      success: true,
      siteId,
      monthly: monthlyArray,
      yearly: yearlyArray,
      totalPeriods: foodCosts.length
    });
    
  } catch (error) {
    console.error('Erreur getSiteHistory:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la récupération de l\'historique',
      error: error.message 
    });
  }
};

// @desc    Obtenir les analyses financières détaillées avec suggestions d'économies
// @route   GET /api/foodcost/financial-analysis
// @access  Private (Admin, Group Admin)
export const getFinancialAnalysis = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    // Vérifier les permissions
    const isAdmin = req.user.role === 'admin' || 
                    req.user.role === 'GROUP_ADMIN' ||
                    (req.user.roles && (req.user.roles.includes('admin') || req.user.roles.includes('GROUP_ADMIN')));
    
    if (!isAdmin) {
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé. Seuls les administrateurs peuvent voir les analyses financières.' 
      });
    }
    
    // Déterminer la période
    const now = new Date();
    let periodStart, periodEnd;
    
    if (period === 'month') {
      periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
      periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    } else if (period === 'quarter') {
      const quarter = Math.floor(now.getMonth() / 3);
      periodStart = new Date(now.getFullYear(), quarter * 3, 1);
      periodEnd = new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59, 999);
    } else { // year
      periodStart = new Date(now.getFullYear(), 0, 1);
      periodEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    
    // Récupérer les sites du groupe
    const Site = (await import('../models/Site.js')).default;
    const groupIdFilter = req.user.groupId;
    
    // Si pas de groupId, retourner des données vides plutôt qu'une erreur
    if (!groupIdFilter) {
      return res.json({
        success: true,
        overview: {
          totalExpenses: 0,
          totalBudget: 0,
          averageCostPerResident: 0,
          potentialSavings: 0,
          sitesCount: 0
        },
        sites: [],
        evolution: [],
        categories: [],
        suppliers: [],
        suggestions: []
      });
    }
    
    const siteQuery = { groupId: groupIdFilter };
    const allSites = await Site.find(siteQuery).select('_id name siteName');
    
    const siteIds = allSites.map(s => s._id);
    
    // Si aucun site, retourner des données vides
    if (siteIds.length === 0) {
      return res.json({
        success: true,
        overview: {
          totalExpenses: 0,
          totalBudget: 0,
          averageCostPerResident: 0,
          potentialSavings: 0,
          sitesCount: 0
        },
        sites: [],
        evolution: [],
        categories: [],
        suppliers: [],
        suggestions: []
      });
    }
    
    // Récupérer les food costs pour cette période
    const foodCosts = await FoodCost.find({
      siteId: { $in: siteIds },
      $or: [
        { startDate: { $gte: periodStart, $lte: periodEnd } },
        { endDate: { $gte: periodStart, $lte: periodEnd } },
        { startDate: { $lte: periodStart }, endDate: { $gte: periodEnd } }
      ]
    })
      .populate('siteId', 'siteName name')
      .sort({ startDate: -1 });
    
    // Récupérer les commandes pour analyser les fournisseurs
    const orders = await Order.find({
      siteId: { $in: siteIds },
      status: { $in: ['delivered', 'completed'] },
      createdAt: { $gte: periodStart, $lte: periodEnd }
    })
      .populate('supplier', 'firstName lastName email')
      .select('pricing.total supplier createdAt');
    
    // Calculer les statistiques globales
    const totalExpenses = foodCosts.reduce((sum, fc) => sum + (fc.expenses?.total || 0), 0);
    const totalBudget = foodCosts.reduce((sum, fc) => sum + (fc.budget?.planned || 0), 0);
    
    // Récupérer le nombre total de résidents et calculer les portions
    let totalResidents = 0;
    let totalPortions = 0;
    let averageCostPerResident = 0;
    
    try {
      const residents = await Resident.find({
        groupId: groupIdFilter,
        status: 'actif'
      }).select('portionSize');
      
      totalResidents = residents.length;
      
      // Calculer le total de portions équivalentes
      residents.forEach(resident => {
        // Si portionSize n'est pas défini, utiliser 1 (portion normale) par défaut
        const portionSize = resident.portionSize;
        let portionEquivalent = 1; // Par défaut, portion normale
        
        if (portionSize === 0.5 || portionSize === '0.5') {
          portionEquivalent = 0.5; // Demi-portion
        } else if (portionSize === 2 || portionSize === '2' || portionSize === 'double') {
          portionEquivalent = 1.5; // Double portion = 1.5x
        } else if (portionSize === 1 || portionSize === '1' || portionSize === 'normal' || !portionSize) {
          portionEquivalent = 1; // Portion normale (valeur par défaut)
        }
        
        totalPortions += portionEquivalent;
      });
      
      console.log('📊 Total résidents:', totalResidents, 'Total portions:', totalPortions);
      
      // Calculer le coût par résident/jour
      // On suppose une période d'un mois (30 jours) pour le calcul
      const daysInPeriod = Math.ceil((periodEnd - periodStart) / (1000 * 60 * 60 * 24));
      if (totalResidents > 0 && daysInPeriod > 0) {
        averageCostPerResident = totalExpenses / (totalResidents * daysInPeriod);
      }
    } catch (residentError) {
      console.warn('⚠️ Erreur lors du calcul du nombre de résidents:', residentError);
      // Continuer sans cette donnée
    }
    
    // Analyser par site
    const sitesAnalysis = {};
    foodCosts.forEach(fc => {
      const siteId = fc.siteId?._id?.toString();
      if (!siteId) return;
      
      if (!sitesAnalysis[siteId]) {
        sitesAnalysis[siteId] = {
          name: fc.siteId?.siteName || fc.siteId?.name || 'Site inconnu',
          totalCost: 0,
          totalBudget: 0,
          periods: 0
        };
      }
      
      sitesAnalysis[siteId].totalCost += fc.expenses.total || 0;
      sitesAnalysis[siteId].totalBudget += fc.budget.planned || 0;
      sitesAnalysis[siteId].periods++;
    });
    
    // Analyser par catégorie (inclure aussi les commandes)
    const categoriesAnalysis = {
      'fruits_legumes': { name: 'Fruits & Légumes', amount: 0 },
      'viandes_poissons': { name: 'Viandes & Poissons', amount: 0 },
      'produits_laitiers': { name: 'Produits Laitiers', amount: 0 },
      'epicerie': { name: 'Épicerie', amount: 0 },
      'surgeles': { name: 'Surgelés', amount: 0 },
      'boissons': { name: 'Boissons', amount: 0 },
      'pain_patisserie': { name: 'Pain & Pâtisserie', amount: 0 },
      'commandes': { name: 'Commandes Fournisseurs', amount: 0 },
      'autres': { name: 'Autres', amount: 0 }
    };
    
    // Ajouter les dépenses manuelles par catégorie
    foodCosts.forEach(fc => {
      (fc.expenses.manual || []).forEach(expense => {
        const category = expense.category || 'autres';
        if (categoriesAnalysis[category]) {
          categoriesAnalysis[category].amount += expense.amount || 0;
        }
      });
      
      // Ajouter les commandes fournisseurs
      if (fc.expenses.orders && fc.expenses.orders > 0) {
        categoriesAnalysis['commandes'].amount += fc.expenses.orders || 0;
      }
    });
    
    const categories = Object.values(categoriesAnalysis)
      .filter(cat => cat.amount > 0)
      .sort((a, b) => b.amount - a.amount)
      .map(cat => ({
        ...cat,
        percentage: totalExpenses > 0 ? (cat.amount / totalExpenses) * 100 : 0
      }));
    
    // Analyser les fournisseurs
    const suppliersAnalysis = {};
    orders.forEach(order => {
      const supplier = order.supplier;
      if (!supplier) return; // Ignorer les commandes sans fournisseur
      
      const supplierId = supplier._id?.toString() || 'unknown';
      // Construire le nom du fournisseur depuis User (firstName + lastName ou email)
      const supplierName = supplier.firstName && supplier.lastName 
        ? `${supplier.firstName} ${supplier.lastName}`
        : supplier.email || 'Fournisseur inconnu';
      
      if (!suppliersAnalysis[supplierId]) {
        suppliersAnalysis[supplierId] = {
          name: supplierName,
          totalAmount: 0,
          orderCount: 0
        };
      }
      
      suppliersAnalysis[supplierId].totalAmount += order.pricing?.total || 0;
      suppliersAnalysis[supplierId].orderCount++;
    });
    
    const suppliers = Object.values(suppliersAnalysis)
      .map(supplier => ({
        ...supplier,
        averageAmount: supplier.orderCount > 0 ? supplier.totalAmount / supplier.orderCount : 0,
        rating: 4.0 + Math.random() * 1.0 // Note simulée (à remplacer par vraie logique)
      }))
      .sort((a, b) => b.totalAmount - a.totalAmount);
    
    // Générer les suggestions d'économies
    let suggestions = [];
    try {
      suggestions = generateSavingsSuggestions({
        totalExpenses,
        totalBudget,
        sitesAnalysis,
        categories,
        suppliers,
        averageCostPerResident,
        totalResidents,
        totalPortions
      });
    } catch (suggestionsError) {
      console.error('⚠️ Erreur lors de la génération des suggestions:', suggestionsError);
      // Continuer sans suggestions plutôt que de faire échouer toute la requête
      suggestions = [{
        title: 'Analyse en cours',
        description: 'Les suggestions d\'économies seront disponibles une fois que suffisamment de données auront été collectées.',
        potentialSavings: 0,
        icon: 'fa-info-circle',
        actions: []
      }];
    }
    
    // Calculer l'évolution (derniers 6 mois)
    const evolution = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
      
      const monthFoodCosts = foodCosts.filter(fc => 
        fc.startDate >= monthStart && fc.endDate <= monthEnd
      );
      
      const monthExpenses = monthFoodCosts.reduce((sum, fc) => sum + (fc.expenses.total || 0), 0);
      
      evolution.push({
        period: monthStart.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }),
        expenses: monthExpenses
      });
    }
    
    // Calculer les économies potentielles
    const potentialSavings = suggestions.reduce((sum, s) => sum + (s.potentialSavings || 0), 0);
    
    res.json({
      success: true,
      overview: {
        totalExpenses,
        totalBudget,
        averageCostPerResident,
        potentialSavings,
        sitesCount: Object.keys(sitesAnalysis).length
      },
      sites: Object.values(sitesAnalysis).sort((a, b) => b.totalCost - a.totalCost),
      evolution,
      categories,
      suppliers,
      suggestions
    });
    
  } catch (error) {
    console.error('Erreur getFinancialAnalysis:', error);
    res.status(500).json({ 
      success: false,
      message: 'Erreur lors de la génération des analyses financières',
      error: error.message 
    });
  }
};

// Fonction pour générer les suggestions d'économies intelligentes basées sur l'analyse de données
// Cette fonction utilise des algorithmes d'analyse pour identifier les opportunités d'économies
function generateSavingsSuggestions(data) {
  const suggestions = [];
  
  if (!data || !data.totalExpenses || data.totalExpenses === 0) {
    return suggestions;
  }
  
  console.log('💡 Génération de suggestions d\'économies basées sur:', {
    totalExpenses: data.totalExpenses,
    suppliersCount: data.suppliers?.length || 0,
    categoriesCount: data.categories?.length || 0,
    sitesCount: Object.keys(data.sitesAnalysis || {}).length
  });
  
  // Suggestion 1: Optimisation des fournisseurs
  if (data.suppliers && data.suppliers.length > 1) {
    const topSupplier = data.suppliers[0];
    const supplierPercentage = data.totalExpenses > 0 ? (topSupplier.totalAmount / data.totalExpenses) * 100 : 0;
    
    if (supplierPercentage > 30) {
      // Si un fournisseur représente plus de 30% des dépenses
      const avgOrderValue = data.suppliers.reduce((sum, s) => sum + s.averageAmount, 0) / data.suppliers.length;
      const savingsPercent = topSupplier.averageAmount > avgOrderValue * 1.2 ? 0.08 : 0.05;
      
      suggestions.push({
        title: 'Consolidation des commandes avec ' + topSupplier.name,
        description: `Ce fournisseur représente ${supplierPercentage.toFixed(1)}% de vos dépenses totales (${topSupplier.totalAmount.toLocaleString('fr-FR')}€). En consolidant les commandes et en négociant des remises volume, vous pourriez réaliser des économies significatives.`,
        potentialSavings: Math.round(topSupplier.totalAmount * savingsPercent),
        icon: 'fa-handshake',
        actions: [
          `Négocier une remise de ${(savingsPercent * 100).toFixed(0)}% avec ${topSupplier.name} pour les commandes groupées`,
          'Regrouper les commandes de plusieurs sites pour augmenter le volume',
          'Établir un contrat annuel avec tarifs préférentiels basés sur le volume total'
        ]
      });
    }
    
    // Suggestion 2: Diversification des fournisseurs
    if (data.suppliers.length < 3 && supplierPercentage > 50) {
      suggestions.push({
        title: 'Diversification des fournisseurs',
        description: `Vous dépendez fortement d'un seul fournisseur (${supplierPercentage.toFixed(1)}%). En diversifiant vos sources d'approvisionnement, vous pourriez bénéficier de meilleurs prix grâce à la concurrence.`,
        potentialSavings: Math.round(data.totalExpenses * 0.03), // 3% d'économie estimée
        icon: 'fa-balance-scale',
        actions: [
          'Identifier 2-3 fournisseurs alternatifs pour les catégories principales',
          'Comparer les prix entre fournisseurs avant chaque commande importante',
          'Négocier avec plusieurs fournisseurs pour obtenir les meilleurs tarifs'
        ]
      });
    }
  }
  
  // Suggestion 3: Optimisation des catégories
  if (data.categories && data.categories.length > 0) {
    const topCategory = data.categories[0];
    if (topCategory.percentage > 25) {
      // Analyser si cette catégorie peut être optimisée
      const categoryName = topCategory.name;
      let specificActions = [];
      let savingsPercent = 0.08;
      
      if (categoryName.includes('Viandes') || categoryName.includes('Poissons')) {
        specificActions = [
          'Alterner entre viandes coûteuses et moins coûteuses (ex: bœuf vs porc)',
          'Acheter en gros et congeler pour bénéficier de meilleurs prix',
          'Négocier des prix avec les bouchers/poissonniers locaux pour des commandes régulières',
          'Privilégier les morceaux moins nobles mais tout aussi nutritifs'
        ];
        savingsPercent = 0.10;
      } else if (categoryName.includes('Fruits') || categoryName.includes('Légumes')) {
        specificActions = [
          'Acheter des fruits et légumes de saison (jusqu\'à 40% moins cher)',
          'Privilégier les producteurs locaux pour réduire les coûts de transport',
          'Acheter en gros au marché de gros plutôt qu\'au détail',
          'Planifier les menus selon les disponibilités saisonnières'
        ];
        savingsPercent = 0.12;
      } else {
        specificActions = [
          'Comparer les prix entre différents fournisseurs pour cette catégorie',
          'Acheter en gros pour bénéficier de remises volume',
          'Négocier des tarifs préférentiels pour les commandes régulières'
        ];
      }
      
      suggestions.push({
        title: `Optimisation de la catégorie "${topCategory.name}"`,
        description: `Cette catégorie représente ${topCategory.percentage.toFixed(1)}% de vos dépenses totales (${topCategory.amount.toLocaleString('fr-FR')}€). Des économies significatives peuvent être réalisées en optimisant vos achats dans cette catégorie.`,
        potentialSavings: Math.round(topCategory.amount * savingsPercent),
        icon: 'fa-tags',
        actions: specificActions
      });
    }
  }
  
  // Suggestion 4: Écart budgétaire
  if (data.totalBudget > 0) {
    const variance = ((data.totalExpenses - data.totalBudget) / data.totalBudget) * 100;
    if (variance > 5) {
      const overBudget = data.totalExpenses - data.totalBudget;
      suggestions.push({
        title: 'Révision du budget et optimisation',
        description: `Vos dépenses dépassent le budget de ${variance.toFixed(1)}% (${overBudget.toLocaleString('fr-FR')}€ de dépassement). Une analyse approfondie et des ajustements sont nécessaires.`,
        potentialSavings: Math.round(overBudget * 0.4), // 40% de l'écart récupérable avec optimisations
        icon: 'fa-chart-line',
        actions: [
          'Analyser en détail les causes du dépassement (catégories, sites, périodes)',
          'Identifier les postes de dépenses les plus problématiques',
          'Réviser les budgets mensuels pour les prochains mois en tenant compte des tendances',
          'Mettre en place des alertes plus précoces (à 80% du budget au lieu de 90%)',
          'Établir des objectifs de réduction progressive sur 3 mois'
        ]
      });
    } else if (variance < -10) {
      // Budget sous-utilisé (peut indiquer un budget trop élevé)
      suggestions.push({
        title: 'Optimisation du budget alloué',
        description: `Votre budget est sous-utilisé de ${Math.abs(variance).toFixed(1)}%. Cela peut indiquer que le budget est trop élevé ou que des optimisations ont été réalisées.`,
        potentialSavings: 0, // Pas d'économie directe, mais optimisation du budget
        icon: 'fa-check-circle',
        actions: [
          'Analyser si cette sous-utilisation est due à des optimisations réussies',
          'Réviser le budget pour l\'aligner avec les dépenses réelles',
          'Réinvestir les économies dans l\'amélioration de la qualité si nécessaire'
        ]
      });
    }
  }
  
  // Suggestion 5: Coût par résident (analyse intelligente)
  if (data.averageCostPerResident > 0) {
    // Benchmark adaptatif selon le type d'établissement
    const benchmark = 8.5; // Coût de référence par résident/jour pour EHPAD
    const currentCost = data.averageCostPerResident;
    const variance = ((currentCost - benchmark) / benchmark) * 100;
    
    if (variance > 15) {
      // Coût significativement supérieur au benchmark
      const estimatedResidents = data.totalExpenses > 0 ? Math.round(data.totalExpenses / currentCost) : 100;
      const potentialDailySavings = (currentCost - benchmark) * estimatedResidents;
      const monthlySavings = potentialDailySavings * 30;
      
      suggestions.push({
        title: 'Optimisation du coût par résident',
        description: `Le coût moyen par résident est de ${currentCost.toFixed(2)}€/jour, soit ${variance.toFixed(1)}% au-dessus du benchmark de ${benchmark}€/jour. En optimisant les menus, les achats et en réduisant le gaspillage, vous pourriez économiser jusqu'à ${monthlySavings.toLocaleString('fr-FR')}€ par mois.`,
        potentialSavings: Math.round(monthlySavings),
        icon: 'fa-users',
        actions: [
          'Analyser les menus pour identifier les plats les plus coûteux',
          'Optimiser les recettes pour réduire les coûts sans compromettre la qualité nutritionnelle',
          'Réduire le gaspillage alimentaire (objectif: < 5% du total)',
          'Négocier de meilleurs prix avec les fournisseurs pour les ingrédients les plus utilisés',
          'Mettre en place un système de suivi du gaspillage par site'
        ]
      });
    }
  }
  
  // Suggestion 6: Analyse comparative entre sites
  if (data.sitesAnalysis && Object.keys(data.sitesAnalysis).length > 1) {
    const sites = Object.values(data.sitesAnalysis);
    const costs = sites.map(s => s.totalCost);
    const maxCost = Math.max(...costs);
    const minCost = Math.min(...costs);
    const avgCost = costs.reduce((a, b) => a + b, 0) / costs.length;
    
    if (maxCost > avgCost * 1.3) {
      // Un site dépense significativement plus que la moyenne
      const expensiveSite = sites.find(s => s.totalCost === maxCost);
      const savingsPotential = (maxCost - avgCost) * 0.2; // 20% de l'écart récupérable
      
      suggestions.push({
        title: `Optimisation du site "${expensiveSite.name}"`,
        description: `Ce site dépense ${maxCost.toLocaleString('fr-FR')}€, soit ${((maxCost / avgCost - 1) * 100).toFixed(1)}% de plus que la moyenne du groupe (${avgCost.toLocaleString('fr-FR')}€). En appliquant les meilleures pratiques des autres sites, des économies sont possibles.`,
        potentialSavings: Math.round(savingsPotential),
        icon: 'fa-building',
        actions: [
          `Analyser les différences de coûts entre "${expensiveSite.name}" et les autres sites`,
          'Identifier les pratiques des sites les plus performants',
          'Partager les meilleures pratiques entre les sites du groupe',
          'Mettre en place un plan d\'action spécifique pour ce site'
        ]
      });
    }
  }
  
  // Suggestion 7: Achat d'animaux complets pour la viande (économies significatives)
  console.log('🔍 Vérification suggestion animaux complets:', {
    totalPortions: data.totalPortions,
    totalResidents: data.totalResidents,
    hasPortions: !!data.totalPortions,
    portionsGreaterThanZero: data.totalPortions > 0
  });
  
  if (data.totalPortions && data.totalPortions > 0 && data.totalResidents && data.totalResidents > 0) {
    // Estimation : en moyenne, 4-5 repas avec viande par semaine (soit ~64% des repas)
    // data.totalPortions = nombre total de portions par jour pour tous les résidents
    const meatMealsRatio = 4.5 / 7; // 64% des repas contiennent de la viande
    const daysPerYear = 365;
    
    // Calculer le total de portions de viande par année
    // Portions de viande par jour = portions totales/jour * ratio repas avec viande
    const meatPortionsPerDay = data.totalPortions * meatMealsRatio;
    const totalMeatPortionsPerYear = meatPortionsPerDay * daysPerYear;
    
    // Estimation de la quantité de viande par portion (en grammes)
    // - Portion normale (1): 120-150g de viande
    // - Demi-portion (0.5): 60-75g
    // - Double portion (1.5): 180-225g
    // Moyenne pondérée: environ 130g par portion équivalente
    const meatPerPortionGrams = 130;
    const totalMeatKgPerYear = (totalMeatPortionsPerYear * meatPerPortionGrams) / 1000;
    
    // Prix moyen au détail vs prix de l'animal complet
    // Exemple pour le bœuf:
    // - Au détail: 15-25€/kg selon les morceaux
    // - Animal complet (carcasse): 8-12€/kg (rendement ~60-65% de viande)
    // Économie potentielle: 30-40% sur le prix au kg
    const avgRetailPricePerKg = 18; // Prix moyen au détail (€/kg)
    const avgWholeAnimalPricePerKg = 10; // Prix de l'animal complet (€/kg carcasse)
    const yieldPercentage = 0.62; // Rendement moyen (62% de viande utilisable)
    
    // Calculer les coûts
    const retailCost = totalMeatKgPerYear * avgRetailPricePerKg;
    const wholeAnimalKgNeeded = totalMeatKgPerYear / yieldPercentage;
    const wholeAnimalCost = wholeAnimalKgNeeded * avgWholeAnimalPricePerKg;
    const potentialSavings = retailCost - wholeAnimalCost;
    
    console.log('💰 Calcul économies animaux complets:', {
      totalMeatKgPerYear,
      retailCost,
      wholeAnimalCost,
      potentialSavings,
      threshold: 1000
    });
    
    // Baisser le seuil à 500€ pour que la suggestion apparaisse plus facilement
    if (potentialSavings > 500) { // Seulement si les économies sont significatives (>500€)
      // Calculer combien d'animaux complets il faudrait
      // Exemple: un bœuf complet fait environ 300-400kg de carcasse
      const avgAnimalWeight = 350; // kg de carcasse
      const animalsNeeded = Math.ceil(wholeAnimalKgNeeded / avgAnimalWeight);
      
      suggestions.push({
        title: 'Achat d\'animaux complets pour optimiser les coûts de viande',
        description: `Avec ${data.totalResidents.toLocaleString('fr-FR')} résidents (${data.totalPortions.toFixed(1)} portions/jour), vous consommez environ ${totalMeatKgPerYear.toLocaleString('fr-FR')} kg de viande par an (${totalMeatPortionsPerYear.toLocaleString('fr-FR')} portions de viande). L'achat d'animaux complets (bœuf, porc, agneau) au lieu du détail peut générer des économies significatives.`,
        potentialSavings: Math.round(potentialSavings),
        icon: 'fa-drumstick-bite',
        actions: [
          `Acheter ${animalsNeeded} animal${animalsNeeded > 1 ? 'aux' : ''} complet${animalsNeeded > 1 ? 's' : ''} par an (bœuf, porc, agneau) au lieu d'acheter au détail`,
          `Économie estimée: ${potentialSavings.toLocaleString('fr-FR')}€/an (${((potentialSavings / retailCost) * 100).toFixed(1)}% de réduction)`,
          'Négocier avec des éleveurs locaux pour des prix encore plus avantageux',
          'Investir dans un congélateur professionnel pour stocker la viande',
          'Planifier les découpes selon les besoins des menus (rôtis, steaks, hachés, etc.)',
          'Utiliser tous les morceaux (y compris les moins nobles) pour varier les plats',
          'Coordonner les achats entre plusieurs sites pour augmenter le volume et négocier de meilleurs prix'
        ]
      });
    } else {
      console.log('⚠️ Suggestion animaux complets non ajoutée: économies trop faibles', potentialSavings);
    }
  } else {
    console.log('⚠️ Suggestion animaux complets non ajoutée: données manquantes', {
      totalPortions: data.totalPortions,
      totalResidents: data.totalResidents
    });
  }
  
  // Trier les suggestions par économies potentielles (du plus élevé au plus faible)
  suggestions.sort((a, b) => (b.potentialSavings || 0) - (a.potentialSavings || 0));
  
  // Limiter à 5 suggestions les plus pertinentes
  return suggestions.slice(0, 5);
}

/* 
 * COMMENT L'IA PEUT AMÉLIORER LES SUGGESTIONS D'ÉCONOMIES :
 * 
 * 1. Analyse prédictive :
 *    - Utiliser le machine learning pour prédire les tendances de dépenses
 *    - Identifier les patterns saisonniers et anticiper les pics de coûts
 *    - Prédire l'impact des changements de fournisseurs ou de menus
 * 
 * 2. Optimisation automatique :
 *    - Algorithmes d'optimisation pour trouver la meilleure combinaison de fournisseurs
 *    - Optimisation des menus pour minimiser les coûts tout en respectant les contraintes nutritionnelles
 *    - Calcul automatique des meilleures quantités à commander
 * 
 * 3. Analyse comparative intelligente :
 *    - Comparer avec des bases de données de benchmarks du secteur
 *    - Identifier les écarts par rapport aux meilleures pratiques
 *    - Apprendre des succès d'autres établissements similaires
 * 
 * 4. Recommandations personnalisées :
 *    - Adapter les suggestions selon le profil de l'établissement
 *    - Prendre en compte l'historique et les préférences
 *    - Prioriser les actions selon leur impact et leur faisabilité
 * 
 * 5. Détection d'anomalies :
 *    - Identifier automatiquement les dépenses anormales
 *    - Alerter sur les changements significatifs de coûts
 *    - Détecter les opportunités d'économies non évidentes
 */

export default {
  getFoodCostPeriods,
  getFoodCostById,
  createFoodCost,
  updateFoodCost,
  addManualExpense,
  deleteManualExpense,
  recalculateOrders,
  getFoodCostStats,
  acknowledgeAlert,
  getAdminReports,
  deleteFoodCost,
  getSiteHistory,
  getFinancialAnalysis
};

