import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  createOrder, 
  getCustomerOrders, 
  getSupplierOrders, 
  getOrder, 
  updateOrderStatus,
  updateCustomerOrderStatus,
  cancelOrder 
} from '../controllers/orderController.js';

const router = express.Router();

// Middleware pour vérifier si l'utilisateur peut passer des commandes
const canManageOrders = (req, res, next) => {
  console.log('🔐 Vérification des permissions pour les commandes');
  console.log('👤 User role:', req.user.role);
  console.log('👥 User roles:', req.user.roles);
  
  const allowedRoles = ['collectivite', 'restaurant', 'resto', 'GROUP_ADMIN', 'SITE_MANAGER'];
  
  // Vérifier le rôle principal (string)
  if (allowedRoles.includes(req.user.role)) {
    console.log('✅ Accès autorisé via role principal:', req.user.role);
    next();
    return;
  }
  
  // Vérifier les rôles secondaires (array)
  if (req.user.roles && Array.isArray(req.user.roles)) {
    const hasAllowedRole = req.user.roles.some(r => allowedRoles.includes(r));
    if (hasAllowedRole) {
      console.log('✅ Accès autorisé via roles array');
      next();
      return;
    }
  }
  
  console.log('❌ Accès refusé - Rôle non autorisé');
  res.status(403).json({ 
    message: 'Accès refusé. Seuls les restaurants, collectivités et administrateurs peuvent gérer les commandes.' 
  });
};

// Toutes les routes nécessitent une authentification
router.use(protect);

// @desc    Créer une nouvelle commande
// @route   POST /api/orders
// @access  Private (collectivite, restaurant, resto, GROUP_ADMIN, SITE_MANAGER)
router.post('/', canManageOrders, createOrder);

// @desc    Récupérer les commandes du client connecté
// @route   GET /api/orders
// @access  Private (collectivite, restaurant, resto, GROUP_ADMIN, SITE_MANAGER)
router.get('/', canManageOrders, getCustomerOrders);

// @desc    Récupérer les commandes reçues par le fournisseur
// @route   GET /api/orders/supplier
// @access  Private (fournisseur)
router.get('/supplier', authorize('fournisseur'), getSupplierOrders);

// @desc    Récupérer une commande par ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', getOrder);

// @desc    Mettre à jour le statut d'une commande (par le fournisseur)
// @route   PUT /api/orders/:id/status
// @access  Private (fournisseur)
router.put('/:id/status', authorize('fournisseur'), updateOrderStatus);

// @desc    Mettre à jour le statut d'une commande (par le client)
// @route   PUT /api/orders/:id/customer-status
// @access  Private (collectivite, restaurant, resto, GROUP_ADMIN, SITE_MANAGER)
router.put('/:id/customer-status', canManageOrders, updateCustomerOrderStatus);

// @desc    Annuler une commande
// @route   PUT /api/orders/:id/cancel
// @access  Private (client ou fournisseur)
router.put('/:id/cancel', cancelOrder);

export default router;