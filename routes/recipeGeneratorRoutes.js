// routes/recipeGeneratorRoutes.js
import express from 'express';
import { generateRecipes, getGeneratedRecipesStats } from '../controllers/recipeGeneratorController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour générer de nouvelles recettes par IA
// Autoriser collectivite, restaurant, resto, et les rôles multi-sites (GROUP_ADMIN, SITE_MANAGER, CHEF)
router.post('/generate', protect, (req, res, next) => {
  const allowedRoles = ['collectivite', 'restaurant', 'resto'];
  const allowedMultiSiteRoles = ['GROUP_ADMIN', 'SITE_MANAGER', 'CHEF'];
  const allowedEstablishmentTypes = ['ehpad', 'hopital', 'maison_de_retraite', 'cantine_scolaire', 'cantine_entreprise'];
  
  // Vérifier le rôle principal
  if (allowedRoles.includes(req.user.role)) {
    return next();
  }
  
  // Vérifier les rôles multi-sites
  if (req.user.roles && req.user.roles.some(role => allowedMultiSiteRoles.includes(role))) {
    return next();
  }
  
  // Vérifier le type d'établissement (pour les collectivités)
  if (req.user.establishmentType && allowedEstablishmentTypes.includes(req.user.establishmentType)) {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: `User role ${req.user?.role} is not authorized to access this resource`
  });
}, generateRecipes);

// Route pour obtenir les statistiques des recettes générées
router.get('/stats', protect, getGeneratedRecipesStats);

export default router;
