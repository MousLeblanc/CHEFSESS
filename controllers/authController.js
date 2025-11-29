// controllers/authController.js
import mongoose from 'mongoose';
import User from '../models/User.js';
import Group from '../models/Group.js';
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import { generateCSRFToken } from '../middleware/csrfMiddleware.js';

// Fonction utilitaire pour générer un token JWT
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user._id, 
      role: user.role,
      roles: user.roles || [], // 🔑 Inclure les rôles (array)
      name: user.name, 
      email: user.email,
      establishmentType: user.establishmentType,
      siteId: user.siteId, // 🔑 Inclure le siteId si présent
      groupId: user.groupId // 🔑 Inclure le groupId si présent
    },
    process.env.JWT_SECRET,
    { expiresIn: '7d' } // 7 jours - aligné avec maxAge du cookie
  );
};

export const register = asyncHandler(async (req, res) => {
  // Vérifier que MongoDB est connecté
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ MongoDB non connecté. État:', mongoose.connection.readyState);
    res.status(503);
    throw new Error('Service temporairement indisponible. Connexion à la base de données en cours...');
  }
  
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
    
    // Sur Render, utiliser sameSite: 'none' et secure: true pour les cookies
    // Vérifier si on est sur Render (via RENDER_SERVICE_ID ou hostname)
    const isRender = process.env.RENDER_SERVICE_ID || 
                     process.env.RENDER === 'true' || 
                     process.env.NODE_ENV === 'production';
    
    res.cookie('token', token, {
      httpOnly: true,
      secure: isRender, // HTTPS requis sur Render
      sameSite: isRender ? 'none' : 'lax', // 'none' pour Render (cross-site)
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 jours
      // Ne pas spécifier domain pour laisser le navigateur gérer
    });
    
    // 🔒 Générer et envoyer un token CSRF
    const csrfToken = generateCSRFToken(user._id);
    res.cookie('csrf-token', csrfToken, {
      httpOnly: true,
      secure: isRender,
      sameSite: isRender ? 'none' : 'lax',
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
      path: '/'
    });
    res.setHeader('X-CSRF-Token', csrfToken);
    
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
  // Vérifier que MongoDB est connecté
  if (mongoose.connection.readyState !== 1) {
    console.error('❌ MongoDB non connecté. État:', mongoose.connection.readyState);
    res.status(503);
    throw new Error('Service temporairement indisponible. Connexion à la base de données en cours...');
  }
  try {
    console.log('🔐 Tentative de connexion pour:', req.body.email);
    const { email, password } = req.body;
    
    if (!email || !password) {
      console.error('❌ Email ou mot de passe manquant');
      res.status(400);
      throw new Error('Email et mot de passe requis.');
    }
    
    const user = await User.findOne({ email });
    console.log('👤 Utilisateur trouvé:', user ? 'Oui' : 'Non');
    
    if (!user) {
      console.log('❌ Utilisateur non trouvé pour:', email);
      res.status(401);
      throw new Error('Email ou mot de passe incorrect.');
    }
    
    const isPasswordValid = await user.matchPassword(password);
    console.log('🔑 Mot de passe valide:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Mot de passe incorrect pour:', email);
      res.status(401);
      throw new Error('Email ou mot de passe incorrect.');
    }
    
    // Vérifier que l'utilisateur a un _id valide
    if (!user._id) {
      console.error('❌ Erreur: user._id est undefined lors de la connexion');
      res.status(500);
      throw new Error('Erreur interne: identifiant utilisateur invalide.');
    }
    
    console.log('✅ Génération du token JWT pour user._id:', user._id);
    const token = generateToken(user);
    
    // 🔐 Envoyer le token dans un cookie HttpOnly (sécurisé)
    // Sur Render, utiliser sameSite: 'none' et secure: true pour les cookies
    const isRender = process.env.RENDER_SERVICE_ID || 
                     process.env.RENDER === 'true' || 
                     process.env.NODE_ENV === 'production';
    
    res.cookie('token', token, {
      httpOnly: true,        // Inaccessible en JavaScript (protection XSS)
      secure: isRender, // HTTPS requis sur Render
      sameSite: isRender ? 'none' : 'lax', // 'none' pour Render (cross-site)
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
    });
    
    // 🔒 Générer et envoyer un token CSRF
    console.log('🔒 Génération du token CSRF pour user._id:', user._id);
    try {
      const csrfToken = generateCSRFToken(user._id);
      console.log('✅ Token CSRF généré avec succès');
      res.cookie('csrf-token', csrfToken, {
        httpOnly: true,        // Inaccessible en JavaScript
        secure: isRender,
        sameSite: isRender ? 'none' : 'lax',
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        path: '/'
      });
      // Envoyer aussi dans le header pour que le client puisse le lire
      res.setHeader('X-CSRF-Token', csrfToken);
    } catch (csrfError) {
      console.error('❌ Erreur lors de la génération du token CSRF:', csrfError);
      res.status(500);
      throw new Error('Erreur lors de la génération du token de sécurité.');
    }
    
    // 🔧 Pour les fournisseurs, récupérer le nom depuis Supplier si disponible
    let businessName = user.businessName;
    if (user.role === 'fournisseur' && user.supplierId) {
      try {
        const Supplier = (await import('../models/Supplier.js')).default;
        const supplier = await Supplier.findById(user.supplierId).select('name');
        if (supplier) {
          businessName = supplier.name;
          console.log(`✅ Nom du fournisseur récupéré depuis Supplier: ${businessName}`);
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la récupération du nom du fournisseur:', error.message);
      }
    }
    
    // 🍪 Token envoyé uniquement via cookie HTTP-Only (sécurisé)
    // ❌ Plus de token dans le JSON pour éviter localStorage
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: businessName,
        establishmentType: user.establishmentType,
        groupId: user.groupId,
        siteId: user.siteId,
        roles: user.roles
      },
      message: 'Connexion réussie'
    });
    console.log('✅ Connexion réussie pour:', email);
  } catch (error) {
    console.error('❌ Erreur dans login:', error.message);
    console.error('Stack:', error.stack);
    throw error; // Laisser asyncHandler gérer l'erreur
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
    
    // 🔧 Pour les fournisseurs, récupérer le nom depuis Supplier si disponible
    let businessName = user.businessName;
    if (user.role === 'fournisseur' && user.supplierId) {
      try {
        const Supplier = (await import('../models/Supplier.js')).default;
        const supplier = await Supplier.findById(user.supplierId).select('name');
        if (supplier) {
          businessName = supplier.name;
        }
      } catch (error) {
        console.warn('⚠️ Erreur lors de la récupération du nom du fournisseur:', error.message);
      }
    }
    
    // 🍪 Token envoyé uniquement via cookie HTTP-Only
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: businessName,
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
  
  // 🔧 Pour les fournisseurs, récupérer le nom depuis Supplier si disponible
  let businessName = req.user.businessName;
  if (req.user.role === 'fournisseur' && req.user.supplierId) {
    try {
      const Supplier = (await import('../models/Supplier.js')).default;
      const supplier = await Supplier.findById(req.user.supplierId).select('name');
      if (supplier) {
        businessName = supplier.name;
      }
    } catch (error) {
      console.warn('⚠️ Erreur lors de la récupération du nom du fournisseur:', error.message);
    }
  }
  
  const userData = {
    success: true,
    user: {
      _id: req.user._id, // ✅ Utiliser _id pour être cohérent avec MongoDB
      id: req.user._id, // ✅ Garder aussi id pour compatibilité
      name: req.user.name,
      email: req.user.email,
      role: req.user.role,
      roles: req.user.roles,
      businessName: businessName, // ✅ Utilise le nom du Supplier si disponible
      establishmentType: req.user.establishmentType,
      groupId: req.user.groupId,
      siteId: req.user.siteId,
      phone: req.user.phone,
      address: req.user.address
    }
  };
  
  // 🔒 Générer ou régénérer un token CSRF pour cet utilisateur
  const csrfToken = generateCSRFToken(req.user._id);
  const isRender = process.env.RENDER_SERVICE_ID || 
                   process.env.RENDER === 'true' || 
                   process.env.NODE_ENV === 'production';
  
  res.cookie('csrf-token', csrfToken, {
    httpOnly: true,
    secure: isRender,
    sameSite: isRender ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    path: '/'
  });
  res.setHeader('X-CSRF-Token', csrfToken);
  
  console.log('📤 Envoi réponse /api/auth/me:', JSON.stringify(userData, null, 2));
  res.json(userData);
});

// Fonction pour obtenir le token CSRF
export const getCSRFToken = asyncHandler(async (req, res) => {
  // Si on arrive ici, c'est que le middleware protect a validé le token
  const csrfToken = generateCSRFToken(req.user._id);
  const isRender = process.env.RENDER_SERVICE_ID || 
                   process.env.RENDER === 'true' || 
                   process.env.NODE_ENV === 'production';
  
  res.cookie('csrf-token', csrfToken, {
    httpOnly: true,
    secure: isRender,
    sameSite: isRender ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000, // 24 heures
    path: '/'
  });
  res.setHeader('X-CSRF-Token', csrfToken);
  
  res.json({
    success: true,
    message: 'Token CSRF généré'
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
