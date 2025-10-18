// routes/retirementHomeRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
  updateRetirementHomeFilters, 
  getRetirementHomeFilters, 
  generateEHPADMenu 
} from '../controllers/retirementHomeController.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// @route   PUT /api/retirement-home/filters
// @desc    Mettre à jour les filtres EHPAD
// @access  Private (Collectivités - Maisons de retraite uniquement)
router.put('/filters', updateRetirementHomeFilters);

// @route   GET /api/retirement-home/filters
// @desc    Obtenir les filtres EHPAD
// @access  Private (Collectivités - Maisons de retraite uniquement)
router.get('/filters', getRetirementHomeFilters);

// @route   POST /api/retirement-home/generate-menu
// @desc    Générer un menu adapté EHPAD
// @access  Private (Collectivités - Maisons de retraite uniquement)
router.post('/generate-menu', generateEHPADMenu);

export default router;
