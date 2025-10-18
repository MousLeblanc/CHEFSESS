// routes/intelligentMenuRoutes.js
import express from 'express';
import { 
  generateIntelligentMenu, 
  getRecipeSuggestions,
  generateMenuForResidents
} from '../controllers/recipeMenuController.js';
import { generateEnterpriseBuffet } from '../controllers/enterpriseMenuController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/intelligent-menu/generate
 * @desc    Génère un menu intelligent basé sur les recettes de la BDD
 * @access  Private
 */
router.post('/generate', protect, generateIntelligentMenu);

/**
 * @route   POST /api/intelligent-menu/generate-test
 * @desc    Génère un menu intelligent SANS authentification (pour tests)
 * @access  Public
 */
router.post('/generate-test', generateIntelligentMenu);

/**
 * @route   GET /api/intelligent-menu/suggestions
 * @desc    Récupère des suggestions de recettes basées sur les filtres
 * @access  Private
 */
router.get('/suggestions', protect, getRecipeSuggestions);

/**
 * @route   POST /api/intelligent-menu/generate-enterprise-buffet
 * @desc    Génère un menu buffet pour cantine d'entreprise avec choix multiples
 * @access  Private
 */
router.post('/generate-enterprise-buffet', protect, generateEnterpriseBuffet);

/**
 * @route   POST /api/intelligent-menu/generate-enterprise-buffet-test
 * @desc    Génère un menu buffet entreprise SANS authentification (pour tests)
 * @access  Public
 */
router.post('/generate-enterprise-buffet-test', generateEnterpriseBuffet);

/**
 * @route   POST /api/intelligent-menu/generate-for-residents
 * @desc    Génère un menu intelligent basé sur les profils de résidents
 * @access  Private
 */
router.post('/generate-for-residents', protect, generateMenuForResidents);

export default router;

