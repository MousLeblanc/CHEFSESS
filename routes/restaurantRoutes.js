//routes/restaurantRoutes.js
import express from 'express';
import * as restaurantController from '../controllers/restaurantController.js'; 
import { protect, authorize } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Route publique pour la tablette client (pas d'authentification requise)
router.get('/compatible-menus', restaurantController.getCompatibleMenus);

// Protéger toutes les autres routes de cette section et vérifier le rôle 'resto'
// 'protect' vérifie si l'utilisateur est connecté.
// 'authorize('resto')' vérifie si l'utilisateur connecté a le rôle 'resto'.
router.use(protect);
router.use(authorize('resto')); 

// Routes catalogue
router.get('/catalog', restaurantController.getCatalog);

// Routes commandes
router.post('/orders', restaurantController.createOrder);
router.get('/orders', restaurantController.getOrders);
router.put('/orders/:id/cancel', restaurantController.cancelOrder);

// Routes statistiques
router.get('/stats', restaurantController.getStats);

export default router;