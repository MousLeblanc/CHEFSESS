// routes/nutritionalBalanceRoutes.js
// Routes pour l'équilibre nutritionnel

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  calculateBalanceForGroup,
  getNutritionalGoalsForGroup
} from '../controllers/nutritionalBalanceController.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

// Calculer l'équilibre nutritionnel pour un groupe
router.get('/', calculateBalanceForGroup);
router.get('/:menuId', calculateBalanceForGroup);

// Obtenir les objectifs nutritionnels recommandés pour un groupe
router.get('/goals/:groupId', getNutritionalGoalsForGroup);

export default router;

