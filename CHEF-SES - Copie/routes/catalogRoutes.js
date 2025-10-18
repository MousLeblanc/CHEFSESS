// routes/catalogRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  getSuppliersCatalog, 
  placeOrder, 
  getClientOrders 
} from '../controllers/catalogController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Route pour obtenir le catalogue des fournisseurs (restaurants et collectivités)
router.get('/suppliers', (req, res, next) => {
  // Vérifier que l'utilisateur est un restaurant ou une collectivité
  if (req.user.role === 'resto' || req.user.role === 'collectivite') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Seuls les restaurants et collectivités peuvent accéder au catalogue.' });
  }
}, getSuppliersCatalog);

// Route pour passer une commande (restaurants et collectivités)
router.post('/orders', (req, res, next) => {
  if (req.user.role === 'resto' || req.user.role === 'collectivite') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Seuls les restaurants et collectivités peuvent passer des commandes.' });
  }
}, placeOrder);

// Route pour obtenir les commandes d'un client (restaurants et collectivités)
router.get('/orders', (req, res, next) => {
  if (req.user.role === 'resto' || req.user.role === 'collectivite') {
    next();
  } else {
    res.status(403).json({ message: 'Accès refusé. Seuls les restaurants et collectivités peuvent voir leurs commandes.' });
  }
}, getClientOrders);

export default router;
