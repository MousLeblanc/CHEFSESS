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
  
  // Autoriser si le rôle est dans la liste autorisée
  if (allowedRoles.includes(req.user.role)) {
    return next();
  }
  
  // Autoriser si l'utilisateur a un des rôles autorisés
  if (req.user.roles && req.user.roles.some(r => allowedUserRoles.includes(r))) {
    return next();
  }
  
  // Autoriser si l'utilisateur a un siteId (c'est un utilisateur de site/EHPAD)
  if (req.user.siteId) {
    return next();
  }
  
  // Sinon, refuser l'accès
  res.status(403).json({ 
    success: false,
    message: 'Accès refusé. Vous devez être un site, un groupe ou un fournisseur pour voir les catalogues.' 
  });
};

// --- Fournisseur : créer et gérer ses produits ---
router.post('/', protect, authorize('fournisseur'), createProduct);
router.get('/mine', protect, authorize('fournisseur'), getMyProducts);
router.put('/:id', protect, authorize('fournisseur'), updateProduct);
router.delete('/:id', protect, authorize('fournisseur'), deleteProduct);

// --- Acheteur / Resto : voir tous les produits par fournisseur ---
router.get('/', protect, getAllProducts); // optionnel (si tu veux montrer tous les produits)
router.get('/supplier/:supplierId', protect, canViewProducts, getProductsBySupplier); // produits d'un fournisseur

export default router;
