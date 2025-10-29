import FoodCost from "../models/FoodCost.js";
import Order from "../models/Order.js";
import Resident from "../models/Resident.js";

// @desc    Obtenir les périodes de food cost pour un site
// @route   GET /api/foodcost
// @access  Private (Site managers, Group admins)
export const getFoodCostPeriods = async (req, res) => {
  try {
    const { siteId, period, startDate, endDate } = req.query;
    
    let query = {};
    
    // Filtrer par site ou groupe selon les permissions
    if (req.user.role === 'SITE_MANAGER' || req.user.establishmentType) {
      query.siteId = req.user.siteId;
    } else if (req.user.role === 'GROUP_ADMIN') {
      if (siteId) {
        query.siteId = siteId;
      } else {
        query.groupId = req.user.groupId;
      }
    } else if (req.user.role === 'admin') {
      if (siteId) query.siteId = siteId;
    } else {
      return res.status(403).json({ message: 'Accès refusé' });
    }
    
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
    const hasPermission = 
      req.user.role === 'admin' ||
      req.user.role === 'GROUP_ADMIN' ||
      req.user.role === 'SITE_MANAGER' ||
      (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType) && req.user.siteId);
    
    if (!hasPermission) {
      console.log('❌ Permission refusée pour:', { 
        role: req.user.role, 
        establishmentType: req.user.establishmentType,
        siteId: req.user.siteId 
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
    let targetSiteId = siteId;
    let groupId = req.user.groupId;
    
    if (req.user.role === 'SITE_MANAGER' || req.user.establishmentType) {
      targetSiteId = req.user.siteId;
    }
    
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
        manual: [],
        total: ordersTotal
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
    
    console.log(`\n📦 ========== RÉSULTATS ==========`);
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
    
    console.log(`💰 Total recalculé: ${foodCost.expenses.orders}€`);
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
    let query = {};
    
    if (req.user.role === 'SITE_MANAGER' || req.user.establishmentType) {
      query.siteId = req.user.siteId;
    } else if (req.user.role === 'GROUP_ADMIN') {
      query.groupId = req.user.groupId;
    } else if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false,
        message: 'Accès refusé' 
      });
    }
    
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

export default {
  getFoodCostPeriods,
  getFoodCostById,
  createFoodCost,
  updateFoodCost,
  addManualExpense,
  deleteManualExpense,
  recalculateOrders,
  getFoodCostStats,
  acknowledgeAlert
};

