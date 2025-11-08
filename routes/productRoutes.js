import express from 'express';
import {
  createProduct,
  getMyProducts,
  getAllProducts,
  getProductsBySupplier,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Middleware pour vérifier si l'utilisateur peut voir les produits
const canViewProducts = (req, res, next) => {
  const allowedRoles = ['restaurant', 'resto', 'collectivite', 'fournisseur', 'groupe'];
  const allowedUserRoles = ['GROUP_ADMIN', 'SITE_MANAGER', 'CHEF'];
  const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
  
  // Vérifier le rôle principal
  if (allowedRoles.includes(req.user.role)) {
    next();
    return;
  }
  
  // Vérifier le type d'établissement (pour collectivités)
  if (req.user.role === 'collectivite' || (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType))) {
    next();
    return;
  }
  
  // Vérifier les rôles secondaires (array)
  if (req.user.roles && req.user.roles.some(r => allowedUserRoles.includes(r))) {
    next();
    return;
  }
  
  // Sinon, refuser l'accès
  res.status(403).json({ 
    success: false,
    message: 'Accès refusé. Vous devez être un site, un groupe ou un fournisseur pour voir les catalogues.' 
  });
};

// Middleware pour vérifier si l'utilisateur est un fournisseur (plus flexible)
const isSupplier = (req, res, next) => {
  console.log('\n🔐 ===== Vérification fournisseur (produits) =====');
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

// --- Fournisseur : créer et gérer ses produits ---
router.post('/', protect, isSupplier, createProduct);
router.get('/mine', protect, isSupplier, getMyProducts);
router.put('/:id', protect, isSupplier, updateProduct);
router.delete('/:id', protect, isSupplier, deleteProduct);

// --- Acheteur / Resto : voir tous les produits par fournisseur ---
router.get('/', protect, getAllProducts); // optionnel (si tu veux montrer tous les produits)
router.get('/supplier/:supplierId', protect, canViewProducts, getProductsBySupplier); // produits d'un fournisseur

export default router;
