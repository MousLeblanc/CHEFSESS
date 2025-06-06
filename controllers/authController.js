// controllers/authController.js
import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role, businessName, establishmentType } = req.body;
  
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Champs obligatoires manquants.');
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409).send({ message: 'Un utilisateur avec cet email existe déjà.' });
    return; // Stop execution
  }

  const finalEstablishmentType = ['resto', 'collectivite'].includes(role) ? establishmentType : null;

  const user = await User.create({
    name, email, password, role, businessName,
    establishmentType: finalEstablishmentType
  });
  
  if (user) {
    res.status(201).json({
      success: true,
      message: 'Utilisateur créé avec succès. Veuillez vous connecter.',
      user: { id: user._id, name: user.name, email: user.email, role: user.role, establishmentType: user.establishmentType }
    });
  } else {
    res.status(400);
    throw new Error('Données utilisateur invalides.');
  }
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role, 
        name: user.name, 
        email: user.email,
        establishmentType: user.establishmentType // Ajouter au payload du token
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        establishmentType: user.establishmentType // Renvoyer dans l'objet user
      },
    });
  } else {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect.');
  }
});
