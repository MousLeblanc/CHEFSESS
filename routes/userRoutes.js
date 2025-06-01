// routes/userRoutes.js - Avec export par défaut
import express from 'express';

const router = express.Router();

router.get('/stats', (req, res) => {
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

router.put('/profile', (req, res) => {
  const { name, businessName } = req.body;
  
  // Profil mis à jour
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

export default router;