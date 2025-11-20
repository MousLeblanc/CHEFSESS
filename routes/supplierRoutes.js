import express from 'express';
import {
  getSuppliers,
  getSupplier,
  getMySupplier,
  createSupplier,
  updateSupplier,
  updateMySupplier,
  deleteSupplier,
  getSupplierStats,
  seedSuppliers
} from '../controllers/supplierController.js';
import { compareSuppliersProducts } from '../controllers/supplierComparisonController.js';
import { createRating, getSupplierRatings, getSiteRatings } from '../controllers/supplierRatingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes pour les fournisseurs
router.route('/')
  .get(getSuppliers)
  .post(createSupplier);

router.route('/stats')
  .get(getSupplierStats);

router.route('/seed')
  .post(seedSuppliers);

router.route('/me')
  .get(getMySupplier)
  .put(updateMySupplier);

// Routes de comparaison et notation (doivent être avant /:id pour éviter les conflits)
router.get('/compare', compareSuppliersProducts);
router.post('/ratings', createRating);
router.get('/ratings/supplier/:supplierId', getSupplierRatings);
router.get('/ratings/site', getSiteRatings);

router.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

export default router;