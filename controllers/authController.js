// controllers/authController.js
import User from '../models/User.js';
import Group from '../models/Group.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

// Fonction utilitaire pour générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role, 
      name: user.name, 
      email: user.email,
      establishmentType: user.establishmentType
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 jours - aligné avec maxAge du cookie
  );
};

export const register = asyncHandler(async (req, res) => {
  const { 
    name, 
    email, 
    password, 
    role, 
    businessName, 
    establishmentType,
    phone,
    vatNumber,
    siret,
    legalForm,
    address,
    website,
    description,
    capacity
  } = req.body;
  
  // Validation des champs obligatoires
  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Champs obligatoires manquants (nom, email, mot de passe, rôle).');
  }

  // Vérifier si l'utilisateur existe déjà
  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(409).send({ message: 'Un utilisateur avec cet email existe déjà.' });
    return;
  }

  // Déterminer le type d'établissement
  const finalEstablishmentType = ['resto', 'collectivite'].includes(role) ? establishmentType : null;

  let groupId = null;
  let userRoles = [];

  // Si c'est un groupe, créer le groupe d'abord
  if (role === 'groupe') {
    const groupCode = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
    
    const group = await Group.create({
      name: businessName,
      code: groupCode,
      contactEmail: email
    });
    
    groupId = group._id;
    userRoles = ['GROUP_ADMIN'];
  }

  // Créer l'utilisateur avec tous les champs
  const user = await User.create({
    // Informations de base
    name,
    email,
    password,
    role,
    
    // Informations professionnelles
    businessName,
    establishmentType: finalEstablishmentType,
    
    // Informations légales et fiscales
    vatNumber: vatNumber || null,
    siret: siret || null,
    legalForm: legalForm || null,
    
    // Coordonnées
    phone: phone || null,
    address: address || null,
    
    // Informations complémentaires
    website: website || null,
    description: description || null,
    capacity: capacity || null,
    
    // Multi-sites
    groupId: groupId,
    roles: userRoles
  });
  
  if (user) {
    // Générer un token et le définir dans un cookie
    const token = generateToken(user);
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });
    
    res.status(201).json({
      success: true,
      message: 'Compte créé avec succès !',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        businessName: user.businessName,
        establishmentType: user.establishmentType,
        phone: user.phone,
        groupId: user.groupId,
        roles: user.roles
      }
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
    const token = generateToken(user);
    
    // 🔐 Envoyer le token dans un cookie HttpOnly (sécurisé)
    res.cookie('token', token, {
      httpOnly: true,        // Inaccessible en JavaScript (protection XSS)
      secure: process.env.NODE_ENV === 'production', // HTTPS en production
      sameSite: 'lax',       // Plus permissif que 'strict', mais toujours sécurisé
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });
    
    // Envoyer les données utilisateur (pour localStorage côté client)
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        establishmentType: user.establishmentType,
        groupId: user.groupId,
        siteId: user.siteId,
        roles: user.roles
      },
      message: 'Connexion réussie'
    });
  } else {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect.');
  }
});

// Nouvelle fonction pour rafraîchir le token
export const refreshToken = asyncHandler(async (req, res) => {
  try {
    // Récupérer le token depuis l'en-tête Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, error: 'Token non fourni' });
    }
    
    const oldToken = authHeader.split(' ')[1];
    
    // Vérifier et décoder le token
    const decoded = jwt.verify(oldToken, process.env.JWT_SECRET, { ignoreExpiration: true });
    
    // Récupérer l'utilisateur
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ success: false, error: 'Utilisateur non trouvé' });
    }
    
    // Générer un nouveau token
    const newToken = generateToken(user);
    
    res.json({
      success: true,
      token: newToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName,
        establishmentType: user.establishmentType
      }
    });
  } catch (error) {
    res.status(401).json({ success: false, error: 'Échec du rafraîchissement du token' });
  }
});

// Fonction pour vérifier si le token est valide
export const checkToken = asyncHandler(async (req, res) => {
  // Si on arrive ici, c'est que le middleware protect a validé le token
  res.json({ success: true, message: 'Token valide', user: req.user });
});

// Fonction pour obtenir les informations de l'utilisateur connecté
export const getMe = asyncHandler(async (req, res) => {
  // Si on arrive ici, c'est que le middleware protect a validé le token
  res.json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      roles: req.user.roles,
      businessName: req.user.businessName,
      establishmentType: req.user.establishmentType,
      groupId: req.user.groupId,
      siteId: req.user.siteId,
      phone: req.user.phone,
      address: req.user.address
    }
  });
});

// Fonction de déconnexion
export const logout = asyncHandler(async (req, res) => {
  // Supprimer le cookie
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0) // Date passée pour supprimer le cookie
  });
  
  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});
