// controllers/authController.js
import User from '../models/User.js'; 
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler'; // Pour simplifier la gestion des erreurs async

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, businessName } = req.body;

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400); // Bad Request
    throw new Error('Un utilisateur avec cet email existe déjà.');
  }

  // Créer l'utilisateur
  // Le mot de passe sera haché par le middleware pre-save du modèle User.js
  const user = await User.create({
    name,
    email,
    password,
    role: role || 'chef', // 'chef' par défaut si non fourni
    businessName,
  });

  if (user) {
    // Générer le token JWT
    const token = jwt.sign(
      { id: user._id, role: user.role }, // Payload
      process.env.JWT_SECRET,             // Secret depuis .env
      { expiresIn: process.env.JWT_EXPIRE || '1d' } // Expiration depuis .env ou 1 jour par défaut
    );

    res.status(201).json({ // 201 Created
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
      },
    });
  } else {
    res.status(400);
    throw new Error('Données utilisateur invalides.');
  }
});

// @desc    Login user & get token
// @route   POST /api/auth/login
// @access  Public
export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Vérifier l'email et le mot de passe
  if (!email || !password) {
    res.status(400);
    throw new Error('Veuillez fournir un email et un mot de passe.');
  }

  // Vérifier l'utilisateur et inclure le mot de passe pour la comparaison
  const user = await User.findOne({ email }).select('+password');

  if (user && (await user.comparePassword(password))) { // Utilise la méthode du modèle User.js
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1d' }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
      },
    });
  } else {
    res.status(401); // Unauthorized
    throw new Error('Email ou mot de passe incorrect.');
  }
});

// Vous pouvez ajouter d'autres fonctions ici si nécessaire, par exemple :
// export const getMe = asyncHandler(async (req, res) => {
//   // req.user est disponible grâce au middleware `protect`
//   const user = await User.findById(req.user._id);
//   if (user) {
//     res.json({
//       _id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role,
//       businessName: user.businessName,
//     });
//   } else {
//     res.status(404);
//     throw new Error('Utilisateur non trouvé.');
//   }
// });