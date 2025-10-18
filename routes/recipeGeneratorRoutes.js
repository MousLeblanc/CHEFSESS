// routes/recipeGeneratorRoutes.js
import express from 'express';
import { generateRecipes, getGeneratedRecipesStats } from '../controllers/recipeGeneratorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour générer de nouvelles recettes par IA
router.post('/generate', protect, authorize('collectivite', 'restaurant', 'resto'), generateRecipes);

// Route pour obtenir les statistiques des recettes générées
router.get('/stats', protect, getGeneratedRecipesStats);

export default router;
