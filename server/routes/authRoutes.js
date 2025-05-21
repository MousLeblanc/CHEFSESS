// routes/authRoutes.js - Avec export par défaut
import express from 'express';

const router = express.Router();

router.post('/register', (req, res) => {
  const { name, email, password, role, businessName } = req.body;
  
  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Veuillez remplir tous les champs obligatoires' 
    });
  }
  
  // Simuler un utilisateur créé
  const user = {
    id: Date.now().toString(),
    name,
    email,
    role: role || 'chef',
    businessName: businessName || ''
  };
  
  // Générer un token fictif
  const token = 'fake_token_' + Math.random().toString(36).substring(7);
  
  res.json({
    success: true,
    token,
    user
  });
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validation
  if (!email || !password) {
    return res.status(400).json({ 
      success: false, 
      error: 'Veuillez remplir tous les champs' 
    });
  }
  
  // Simuler un utilisateur
  const user = {
    id: Date.now().toString(),
    name: 'Utilisateur',
    email,
    role: 'chef',
    businessName: 'Restaurant Test'
  };
  
  // Générer un token fictif
  const token = 'fake_token_' + Math.random().toString(36).substring(7);
  
  res.json({
    success: true,
    token,
    user
  });
});

export default router;