// routes/userRoutes.js - Avec export par défaut
import express from 'express';
import { getUserProfile, updateUserProfile, getSuppliers } from '../controllers/userController.js';

const router = express.Router();

// Import the authorization middleware
// This middleware checks if the user is authenticated and has the necessary permissions
import { protect as authMiddleware } from '../middleware/authMiddleware.js';

router.get('/stats', authMiddleware, (req, res) => {
  // Données fictives
  const stats = {
    menuCount: 5,

    ingredientCount: 25,
    recipeCount: 12
  };
  
  res.json({
    success: true,
    data: stats
  });
});

// amazonq-ignore-next-line
router.get('/profile', (req, res) => {
  // Profil utilisateur fictif
  const profile = {
    id: '12345',
    name: 'Utilisateur Test',
    email: 'test@example.com',
    role: 'chef',
    businessName: 'Restaurant Test'
  };
  
  res.json({
    success: true,
    data: profile
  });
});

// CSRF protection removed as express-csrf package is not installed
// Simple middleware that just passes through
const csrfProtection = (req, res, next) => next();

router.put('/profile', csrfProtection, (req, res) => {
  const { name, businessName } = req.body;
  
  // Profile update
  const updatedProfile = {
    id: '12345',
    name: name || 'Utilisateur Test',

    email: 'test@example.com',
    role: 'chef',
    businessName: businessName || 'Restaurant Test'
  };
  
  res.json({
    success: true,
    data: updatedProfile
  });
});

// Route pour récupérer tous les fournisseurs
router.get('/suppliers', authMiddleware, getSuppliers);

export default router;