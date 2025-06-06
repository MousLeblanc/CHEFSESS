// routes/supplierRoutes.js
import express from 'express';
// Supposons que supplierController exporte ses fonctions nommément
import {
  getStats,
  getProducts,
  addProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  updateOrderStatus
} from '../controllers/supplierController.js'; 
// Importer les middlewares d'authentification et d'autorisation
import { protect, authorize } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Protéger toutes les routes de cette section et vérifier le rôle 'fournisseur'
router.use(protect); // Applique la protection JWT
router.use(authorize('fournisseur')); 

// Routes statistiques
router.get('/stats', getStats);

// Routes produits
router.get('/products', getProducts);
router.post('/products', addProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Routes commandes
router.get('/orders', getOrders);
router.put('/orders/:id/status', updateOrderStatus);

export default router;