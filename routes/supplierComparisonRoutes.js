import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { compareSuppliersProducts, compareAllSuppliersProducts } from '../controllers/supplierComparisonController.js';
import { createRating, getSupplierRatings, getSiteRatings } from '../controllers/supplierRatingController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Comparaison des produits entre fournisseurs
router.get('/compare', compareSuppliersProducts);
router.get('/compare-all', compareAllSuppliersProducts); // Comparaison globale pour admin

// Ratings/Avis
router.post('/ratings', createRating);
router.get('/ratings/supplier/:supplierId', getSupplierRatings);
router.get('/ratings/site', getSiteRatings);

export default router;

