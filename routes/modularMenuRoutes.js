// routes/modularMenuRoutes.js
import express from 'express';
import { generateModularMenu } from '../controllers/modularMenuController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// @desc    Générer un menu modulaire
// @route   POST /api/menu/generate-modular
// @access  Private
router.post('/generate-modular', protect, generateModularMenu);

export default router;





