import express from 'express';
import { getMySupplierStats } from '../controllers/supplierController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Route pour les statistiques du fournisseur connecté
router.get('/stats', getMySupplierStats);

export default router;

