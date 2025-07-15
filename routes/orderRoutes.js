import express from 'express';
import { protect, authorize } from '../middleware/authMiddleware.js';
import { createOrder } from '../controllers/orderController.js';

const router = express.Router();

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Role: 'resto')
router.post('/', protect, authorize('resto', 'collectivite'), createOrder);

// @desc    Get orders for the logged-in user (restaurant or supplier)
// @route   GET /api/orders
// @access  Private
router.get('/', protect);


export default router;