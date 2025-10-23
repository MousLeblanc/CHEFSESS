// routes/catalogRoutes.js
import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { 
  getSuppliersCatalog, 
  placeOrder, 
  getClientOrders 
} from '../controllers/catalogController.js';

const router = express.Router();

// Middleware pour vérifier si l'utilisateur peut accéder aux catalogues
const canAccessCatalog = (req, res, next) => {
  const allowedRoles = ['resto', 'collectivite'];
  const allowedUserRoles = ['GROUP_ADMIN', 'SITE_MANAGER'];
  
  if (allowedRoles.includes(req.user.role) || 
      (req.user.roles && req.user.roles.some(r => allowedUserRoles.includes(r)))) {
    next();
  } else {
    res.status(403).json({ 
      message: 'Accès refusé. Seuls les restaurants, collectivités et administrateurs peuvent accéder au catalogue.' 
    });
  }
};

// Toutes les routes nécessitent une authentification
router.use(protect);

// Route pour obtenir le catalogue des fournisseurs
router.get('/suppliers', canAccessCatalog, getSuppliersCatalog);

// Route pour passer une commande
router.post('/orders', canAccessCatalog, placeOrder);

// Route pour obtenir les commandes d'un client
router.get('/orders', canAccessCatalog, getClientOrders);

export default router;
