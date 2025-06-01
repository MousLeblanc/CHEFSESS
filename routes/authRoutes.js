import express from 'express';
import asyncHandler from 'express-async-handler';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ✅ Route de vérification du token
router.get('/verify', protect, (req, res) => {
  res.status(200).json({ valid: true });
});

// ✅ Route de login
router.post('/login', asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Veuillez entrer email et mot de passe');
  }

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error('Identifiants invalides');
  }

  const token = jwt.sign(
    { id: user._id },
    process.env.JWT_SECRET || 'dev_secret_key',
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      businessName: user.businessName || ""
    }
  });
}));

// ✅ Route d'inscription
router.post('/register', asyncHandler(async (req, res) => {
  const { name, email, password, role, businessName } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Tous les champs obligatoires ne sont pas remplis');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('Utilisateur déjà existant');
  }

  const user = await User.create({ name, email, password, role, businessName });

  if (user) {
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET || 'dev_secret_key',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName || ""
      }
    });
  } else {
    res.status(400);
    throw new Error('Échec de la création utilisateur');
  }
}));

export default router;
