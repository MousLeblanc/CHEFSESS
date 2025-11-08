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
    const foodCost = await FoodCost.findById(req.params.id)
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
    
    // 🎯 ÉTAPE 4 : Ajouter les données Food Cost pour les sites qui en ont
    foodCosts.forEach(fc => {
      const siteId = fc.siteId?._id?.toString();
      if (!siteId || !siteStats.has(siteId)) return;
      
      const site = siteStats.get(siteId);
      
      // Ajouter les données de cette période
      site.periods.push({
        period: fc.period,
        startDate: fc.startDate,
        endDate: fc.endDate,
        budget: fc.budget.planned,
        expenses: fc.expenses.total,
        percentUsed: fc.percentUsed,
        hasOverBudget: fc.percentUsed > 100
      });
      
      site.totalBudget += fc.budget.planned;
      site.totalExpenses += fc.expenses.total;
      
      totalBudget += fc.budget.planned;
      totalExpenses += fc.expenses.total;
      
      // Gérer les alertes
      if (fc.alerts && fc.alerts.length > 0) {
        fc.alerts.forEach(alert => {
          if (!alert.acknowledged) {
            site.alerts.push({
              type: alert.type,
              message: alert.message,
              severity: alert.severity,
              createdAt: alert.createdAt
            });
          }
        });
      }
      
      // Vérifier si le site a un dépassement de budget
      if (fc.percentUsed > 100) {
        site.hasOverBudget = true;
      }
    });
    
    // Calculer le pourcentage global pour chaque site
    siteStats.forEach(site => {
      if (site.totalBudget > 0) {
        site.percentUsed = Math.round((site.totalExpenses / site.totalBudget) * 100);
      }
      if (site.hasOverBudget) {
        sitesWithOverBudget++;
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
  getSiteHistory
};

