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

router.route('/:id')
  .get(getSupplier)
  .put(updateSupplier)
  .delete(deleteSupplier);

export default router;