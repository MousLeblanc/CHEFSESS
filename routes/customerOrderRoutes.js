// routes/customerOrderRoutes.js
import express from 'express';
import CustomerOrder from '../models/CustomerOrder.js';
import RecipeComponent from '../models/RecipeComponent.js';
import RecipeTemplate from '../models/RecipeTemplate.js';
import RecipeEnriched from '../models/Recipe.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Créer une commande client (depuis tablette)
// @route   POST /api/customer-orders
// @access  Public (pas besoin d'auth pour tablette client)
router.post('/', asyncHandler(async (req, res) => {
  const {
    restaurantId,
    menuId, // Nouveau: ID d'un menu complet (alternative à la sélection modulaire)
    proteinId,
    sauceId,
    accompanimentId,
    restrictions,
    tableNumber,
    guestNumber = 1,
    customerName
  } = req.body;

  // Validation: soit menuId, soit proteinId
  if (!restaurantId || !tableNumber) {
    res.status(400);
    throw new Error('restaurantId et tableNumber sont requis');
  }
  
  if (!menuId && !proteinId) {
    res.status(400);
    throw new Error('menuId ou proteinId est requis');
  }
  
  // Si menuId est fourni, créer une commande simple avec le menu
  if (menuId) {
    const menu = await RecipeEnriched.findById(menuId);
    
    if (!menu) {
      res.status(404);
      throw new Error('Menu non trouvé');
    }
    
    const order = new CustomerOrder({
      restaurantId,
      customer: {
        name: customerName || null,
        tableNumber,
        guestNumber
      },
      menuId: menuId, // Stocker l'ID du menu
      restrictions: {
        allergies: restrictions?.allergies || [],
        intolerances: restrictions?.intolerances || [],
        dietaryRestrictions: restrictions?.dietaryRestrictions || [],
        notes: restrictions?.notes || null
      },
      status: 'pending'
    });
    
    const savedOrder = await order.save();
    
    // Populer le menu pour la réponse
    await savedOrder.populate('menuId', 'name category description frenchTitle allergens dietaryRestrictions diet tags');
    
    res.status(201).json({
      success: true,
      data: savedOrder,
      message: 'Commande créée avec succès'
    });
    return;
  }
  
  // Sinon, continuer avec la logique modulaire existante

  // Vérifier que la protéine existe
  const protein = await RecipeComponent.findById(proteinId);
  if (!protein || protein.type !== 'protein') {
    res.status(400);
    throw new Error('Protéine invalide');
  }

  // Vérifier les compatibilités si sauce/accompagnement fournis
  let sauce = null;
  if (sauceId) {
    sauce = await RecipeComponent.findById(sauceId);
    if (!sauce || sauce.type !== 'sauce') {
      res.status(400);
      throw new Error('Sauce invalide');
    }
    // Vérifier compatibilité (optionnel, peut être flexible)
    if (sauce.compatibleWith && sauce.compatibleWith.proteins && sauce.compatibleWith.proteins.length > 0) {
      const isCompatible = sauce.compatibleWith.proteins.some(p => p.toString() === proteinId);
      if (!isCompatible) {
        console.warn(`⚠️ Sauce ${sauce.name} peut ne pas être compatible avec ${protein.name}`);
      }
    }
  }

  let accompaniment = null;
  if (accompanimentId) {
    accompaniment = await RecipeComponent.findById(accompanimentId);
    if (!accompaniment || accompaniment.type !== 'accompaniment') {
      res.status(400);
      throw new Error('Accompagnement invalide');
    }
    // Vérifier compatibilité (optionnel)
    if (accompaniment.compatibleWith && accompaniment.compatibleWith.proteins && accompaniment.compatibleWith.proteins.length > 0) {
      const isCompatible = accompaniment.compatibleWith.proteins.some(p => p.toString() === proteinId);
      if (!isCompatible) {
        console.warn(`⚠️ Accompagnement ${accompaniment.name} peut ne pas être compatible avec ${protein.name}`);
      }
    }
  }

  // Créer ou trouver un template existant
  let template = null;
  try {
    template = await RecipeTemplate.findOne({
      protein: proteinId,
      sauce: sauceId || null,
      accompaniment: accompanimentId || null
    });

    // Si pas de template, en créer un à la volée (optionnel)
    if (!template) {
      // Pour l'instant, on ne crée pas automatiquement, mais on pourrait
      console.log('Template non trouvé, commande créée sans template');
    }
  } catch (error) {
    console.error('Erreur lors de la recherche du template:', error);
  }

  // Créer la commande
  const order = new CustomerOrder({
    restaurantId,
    customer: {
      name: customerName || null,
      tableNumber,
      guestNumber
    },
    selection: {
      protein: proteinId,
      sauce: sauceId || null,
      accompaniment: accompanimentId || null
    },
    restrictions: {
      allergies: restrictions?.allergies || [],
      intolerances: restrictions?.intolerances || [],
      dietaryRestrictions: restrictions?.dietaryRestrictions || [],
      notes: restrictions?.notes || null
    },
    template: template?._id || null,
    status: 'pending'
  });

  const savedOrder = await order.save();

  // Populer les détails pour la réponse
  await savedOrder.populate([
    { path: 'selection.protein', select: 'name type nutrition allergens tags' },
    { path: 'selection.sauce', select: 'name type nutrition allergens tags' },
    { path: 'selection.accompaniment', select: 'name type nutrition allergens tags' },
    { path: 'template', select: 'name totalNutrition totalIngredients' }
  ]);

  res.status(201).json({
    success: true,
    data: savedOrder,
    message: 'Commande créée avec succès'
  });
}));

// @desc    Récupérer les commandes pour le chef (cuisine)
// @route   GET /api/customer-orders/kitchen
// @access  Private (chef/restaurant)
router.get('/kitchen', protect, asyncHandler(async (req, res) => {
  const { status, limit = 50, skip = 0 } = req.query;
  
  // Vérifier que l'utilisateur est un restaurant
  if (req.user.role !== 'resto') {
    res.status(403);
    throw new Error('Accès réservé aux restaurants');
  }

  const filter = {
    restaurantId: req.user._id
  };

  if (status) {
    filter.status = status;
  }

  const orders = await CustomerOrder.find(filter)
    .populate('selection.protein', 'name type nutrition allergens tags image')
    .populate('selection.sauce', 'name type nutrition allergens tags')
    .populate('selection.accompaniment', 'name type nutrition allergens tags')
    .populate('template', 'name totalNutrition totalIngredients')
    .sort({ createdAt: -1 })
    .limit(parseInt(limit))
    .skip(parseInt(skip));

  const total = await CustomerOrder.countDocuments(filter);

  res.json({
    success: true,
    count: orders.length,
    total,
    data: orders
  });
}));

// @desc    Récupérer une commande spécifique
// @route   GET /api/customer-orders/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const order = await CustomerOrder.findById(req.params.id)
    .populate('selection.protein', 'name type nutrition allergens tags image preparationSteps')
    .populate('selection.sauce', 'name type nutrition allergens tags preparationSteps')
    .populate('selection.accompaniment', 'name type nutrition allergens tags preparationSteps')
    .populate('template', 'name totalNutrition totalIngredients combinedInstructions');

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier que l'utilisateur a accès à cette commande
  if (order.restaurantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Accès non autorisé');
  }

  res.json({
    success: true,
    data: order
  });
}));

// @desc    Mettre à jour le statut d'une commande
// @route   PUT /api/customer-orders/:id/status
// @access  Private (chef/restaurant)
router.put('/:id/status', protect, asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!['pending', 'preparing', 'ready', 'served', 'cancelled'].includes(status)) {
    res.status(400);
    throw new Error('Statut invalide');
  }

  const order = await CustomerOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier que l'utilisateur a accès à cette commande
  if (order.restaurantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Accès non autorisé');
  }

  // Mettre à jour le statut
  await order.updateStatus(status);

  // Populer les détails pour la réponse
  await order.populate([
    { path: 'selection.protein', select: 'name type' },
    { path: 'selection.sauce', select: 'name type' },
    { path: 'selection.accompaniment', select: 'name type' }
  ]);

  res.json({
    success: true,
    data: order,
    message: `Statut mis à jour: ${status}`
  });
}));

// @desc    Ajouter des notes du chef
// @route   PUT /api/customer-orders/:id/notes
// @access  Private (chef/restaurant)
router.put('/:id/notes', protect, asyncHandler(async (req, res) => {
  const { chefNotes } = req.body;

  const order = await CustomerOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier que l'utilisateur a accès à cette commande
  if (order.restaurantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Accès non autorisé');
  }

  order.chefNotes = chefNotes || '';
  await order.save();

  res.json({
    success: true,
    data: order,
    message: 'Notes mises à jour'
  });
}));

// @desc    Supprimer une commande (annulation)
// @route   DELETE /api/customer-orders/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const order = await CustomerOrder.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Commande non trouvée');
  }

  // Vérifier que l'utilisateur a accès à cette commande
  if (order.restaurantId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Accès non autorisé');
  }

  // Au lieu de supprimer, on peut juste changer le statut
  order.status = 'cancelled';
  await order.save();

  res.json({
    success: true,
    message: 'Commande annulée'
  });
}));

export default router;




