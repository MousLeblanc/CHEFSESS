const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

// Protéger toutes les routes et vérifier le rôle restaurateur
router.use(authMiddleware);
router.use(roleMiddleware('restaurant'));

// Routes catalogue
router.get('/catalog', restaurantController.getCatalog);

// Routes commandes
router.post('/orders', restaurantController.createOrder);
router.get('/orders', restaurantController.getOrders);
router.put('/orders/:id/cancel', restaurantController.cancelOrder);

// Routes statistiques
router.get('/stats', restaurantController.getStats);

module.exports = router; 