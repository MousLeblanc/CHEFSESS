// middleware/authMiddleware.js
import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import User from '../models/User.js'; 

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization; // Standardisé en minuscule

  if (authHeader && authHeader.startsWith('Bearer')) {
    try {
      token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Récupérer l'utilisateur depuis la base de données sans le mot de passe
      // Et ajouter les informations de l'utilisateur à l'objet req
      req.user = await User.findById(decoded.id).select('-password');
      
      if (!req.user) {
        res.status(401);
        throw new Error('Non autorisé, utilisateur non trouvé avec ce token.');
      }
      next();
    } catch (error) {
      console.error('Erreur d\'authentification du token:', error.message);
      res.status(401); // Non autorisé
      throw new Error('Non autorisé, token invalide ou expiré.');
    }
  } else {
    res.status(401);
    throw new Error('Non autorisé, pas de token fourni.');
  }
});

// Optionnel: Middleware pour vérifier les rôles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403); // Forbidden
      throw new Error(`Rôle utilisateur (${req.user ? req.user.role : 'aucun'}) non autorisé à accéder à cette ressource.`);
    }
    next();
  };
};