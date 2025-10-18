// Working auth middleware
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // 🔐 Priorité 1 : Lire le token depuis le cookie HttpOnly
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('🍪 Token lu depuis cookie');
    }
    // Fallback : Lire le token depuis le header Authorization (compatibilité)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      console.log('📋 Token lu depuis header Authorization');
    }
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, no token'
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');
    
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized, user not found'
      });
    }
    
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Not authorized, token failed'
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    console.log(`🔐 Autorisation - Rôle utilisateur: ${req.user?.role}, Rôles autorisés: [${roles.join(', ')}]`);
    
    if (!req.user) {
      console.log(`❌ Accès refusé - Utilisateur non authentifié`);
      return res.status(403).json({
        success: false,
        error: `User not authenticated`
      });
    }

    // Vérifier d'abord le nouveau système multi-sites
    if (req.user.roles && req.user.roles.length > 0) {
      const hasRequiredRole = req.user.roles.some(role => roles.includes(role));
      if (hasRequiredRole) {
        console.log(`✅ Accès autorisé pour le rôle multi-sites ${req.user.roles.join(', ')}`);
        return next();
      }
    }

    // Fallback sur l'ancien système
    if (roles.includes(req.user.role)) {
      console.log(`✅ Accès autorisé pour le rôle ${req.user.role}`);
      return next();
    }

    console.log(`❌ Accès refusé - Rôle ${req.user?.role} non autorisé`);
    return res.status(403).json({
      success: false,
      error: `User role ${req.user?.role} is not authorized to access this resource`
    });
  };
};