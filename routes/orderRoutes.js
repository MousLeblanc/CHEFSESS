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
  console.log('\n🔐 ===== Vérification des permissions pour les commandes =====');
  console.log('👤 User ID:', req.user._id);
  console.log('👤 User email:', req.user.email);
  console.log('👤 User role (string):', req.user.role, '| Type:', typeof req.user.role);
  console.log('👤 User establishmentType:', req.user.establishmentType);
  console.log('👥 User roles (array):', req.user.roles, '| Type:', typeof req.user.roles, '| IsArray:', Array.isArray(req.user.roles));
  
  // Admin peut toujours accéder
  if (req.user.role === 'admin' || (req.user.roles && Array.isArray(req.user.roles) && req.user.roles.includes('admin'))) {
    console.log('✅ Accès autorisé - Admin');
    return next();
  }
  
  const allowedRoles = ['collectivite', 'restaurant', 'resto', 'groupe', 'GROUP_ADMIN', 'SITE_MANAGER', 'CHEF'];
  const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
  
  // Vérifier le rôle principal (string) - avec normalisation de casse
  const userRole = req.user.role ? String(req.user.role).toLowerCase().trim() : '';
  if (allowedRoles.some(role => role.toLowerCase() === userRole)) {
    console.log('✅ Accès autorisé via role principal:', req.user.role);
    return next();
  }
  
  // Vérifier le type d'établissement (pour collectivités et EHPADs)
  // Si l'utilisateur a un establishmentType autorisé, il peut gérer les commandes
  if (req.user.establishmentType) {
    const establishmentType = String(req.user.establishmentType).toLowerCase().trim();
    if (allowedEstablishmentTypes.includes(establishmentType)) {
      console.log('✅ Accès autorisé via establishmentType:', req.user.establishmentType);
      return next();
    }
  }
  
  // Vérifier les rôles secondaires (array)
  if (req.user.roles && Array.isArray(req.user.roles)) {
    const hasAllowedRole = req.user.roles.some(r => {
      const roleStr = String(r).toLowerCase().trim();
      return allowedRoles.some(allowedRole => allowedRole.toLowerCase() === roleStr);
    });
    if (hasAllowedRole) {
      console.log('✅ Accès autorisé via roles array:', req.user.roles);
      return next();
    }
  }
  
  // Si l'utilisateur a un siteId, c'est probablement un utilisateur de site (EHPAD, etc.)
  // et devrait pouvoir gérer les commandes
  if (req.user.siteId) {
    console.log('✅ Accès autorisé - Utilisateur avec siteId (site manager)');
    return next();
  }
  
  // Si l'utilisateur a un groupId, c'est probablement un utilisateur de groupe
  // et devrait pouvoir gérer les commandes
  if (req.user.groupId) {
    console.log('✅ Accès autorisé - Utilisateur avec groupId (groupe)');
    return next();
  }
  
  // Vérifier si le rôle est 'groupe' (même si pas dans allowedRoles)
  if (req.user.role && String(req.user.role).toLowerCase() === 'groupe') {
    console.log('✅ Accès autorisé - Rôle groupe');
    return next();
  }
  
  console.log('❌ Accès refusé - Rôle non autorisé');
  console.log('   Rôle:', req.user.role);
  console.log('   Rôles:', req.user.roles);
  console.log('   EstablishmentType:', req.user.establishmentType);
  console.log('   SiteId:', req.user.siteId);
  console.log('   GroupId:', req.user.groupId);
  res.status(403).json({ 
    success: false,
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
// Middleware pour vérifier si l'utilisateur est un fournisseur (plus flexible)
const isSupplier = (req, res, next) => {
  console.log('\n🔐 ===== Vérification fournisseur =====');
  console.log('👤 User role:', req.user.role);
  console.log('👤 User roles:', req.user.roles);
  console.log('👤 User supplierId:', req.user.supplierId);
  
  // Vérifier le rôle principal
  if (req.user.role === 'fournisseur' || req.user.role === 'SUPPLIER') {
    console.log('✅ Accès autorisé - Rôle fournisseur');
    return next();
  }
  
  // Vérifier les rôles secondaires
  if (req.user.roles && Array.isArray(req.user.roles)) {
    const isSupplierRole = req.user.roles.some(r => 
      r === 'fournisseur' || r === 'SUPPLIER' || r === 'supplier'
    );
    if (isSupplierRole) {
      console.log('✅ Accès autorisé - Rôle fournisseur dans roles array');
      return next();
    }
  }
  
  // Vérifier si l'utilisateur a un supplierId (il est associé à un Supplier)
  if (req.user.supplierId) {
    console.log('✅ Accès autorisé - Utilisateur avec supplierId');
    return next();
  }
  
  console.log('❌ Accès refusé - Utilisateur n\'est pas un fournisseur');
  res.status(403).json({
    success: false,
    error: 'Accès refusé. Seuls les fournisseurs peuvent accéder à cette ressource.'
  });
};

router.get('/supplier', isSupplier, getSupplierOrders);

// @desc    Récupérer une commande par ID
// @route   GET /api/orders/:id
// @access  Private
router.get('/:id', getOrder);

// @desc    Mettre à jour le statut d'une commande (par le fournisseur)
// @route   PUT /api/orders/:id/status
// @access  Private (fournisseur)
router.put('/:id/status', isSupplier, updateOrderStatus);

// @desc    Mettre à jour le statut d'une commande (par le client)
// @route   PUT /api/orders/:id/customer-status
// @access  Private (collectivite, restaurant, resto, GROUP_ADMIN, SITE_MANAGER)
router.put('/:id/customer-status', canManageOrders, updateCustomerOrderStatus);

// @desc    Annuler une commande
// @route   PUT /api/orders/:id/cancel
// @access  Private (client ou fournisseur)
router.put('/:id/cancel', cancelOrder);

export default router;