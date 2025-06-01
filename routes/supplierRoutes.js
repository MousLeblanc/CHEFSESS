const express = require('express');
const router = express.Router();
const supplierController = require('../controllers/supplierController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protéger toutes les routes et vérifier le rôle fournisseur
router.use(authMiddleware);
router.use(roleMiddleware('supplier'));

// Routes statistiques
router.get('/stats', supplierController.getStats);

// Routes produits
router.get('/products', supplierController.getProducts);
router.post('/products', supplierController.addProduct);
router.put('/products/:id', supplierController.updateProduct);
router.delete('/products/:id', supplierController.deleteProduct);

// Routes commandes
router.get('/orders', supplierController.getOrders);
router.put('/orders/:id/status', supplierController.updateOrderStatus);

module.exports = router; 