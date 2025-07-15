import express from 'express';
import {
  createProduct,
  getAllProducts,
  getProductsBySupplier,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// --- Fournisseur : créer et gérer ses produits ---
router.post('/', protect, authorize('fournisseur'), createProduct);
router.get('/mine', protect, authorize('fournisseur'), getProductsBySupplier);
router.put('/:id', protect, authorize('fournisseur'), updateProduct);
router.delete('/:id', protect, authorize('fournisseur'), deleteProduct);

// --- Acheteur / Resto : voir tous les produits par fournisseur ---
router.get('/', protect, getAllProducts); // optionnel (si tu veux montrer tous les produits)
router.get('/supplier/:supplierId', protect, getProductsBySupplier); // produits d'un fournisseur

export default router;
