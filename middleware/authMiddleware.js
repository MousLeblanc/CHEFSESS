// Working auth middleware
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
  try {
    let token;
    
    // 🔐 Priorité 1 : Lire le token depuis le cookie HttpOnly
    // Support à la fois 'token' (connexion normale) et 'siteToken' (connexion site)
    if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
      console.log('🍪 Token lu depuis cookie "token"');
    } else if (req.cookies && req.cookies.siteToken) {
      token = req.cookies.siteToken;
      console.log('🍪 Token lu depuis cookie "siteToken"');
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
    
    // 🔑 Utiliser le siteId du token décodé si présent (pour les connexions site)
    // Sinon, utiliser le siteId de la base de données
    // Priorité au token, mais fallback sur la base de données
    if (decoded.siteId) {
      req.user.siteId = decoded.siteId;
      console.log('🔧 SiteId ajouté depuis le token:', decoded.siteId);
    } else if (req.user.siteId) {
      // Le siteId existe déjà dans la base de données, le garder
      console.log('🔧 SiteId utilisé depuis la base de données:', req.user.siteId);
    }
    
    // Même chose pour groupId - TOUJOURS utiliser le groupId du token s'il existe
    // Sinon, utiliser celui de la base de données
    if (decoded.groupId) {
      req.user.groupId = decoded.groupId;
      console.log('🔧 GroupId ajouté depuis le token:', decoded.groupId);
    } else if (req.user.groupId) {
      // Le groupId existe déjà dans la base de données, le garder
      console.log('🔧 GroupId utilisé depuis la base de données:', req.user.groupId);
    }
    
    // 🔍 Logs pour diagnostiquer les rôles
    console.log('👤 User chargé:', {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
      roles: req.user.roles,
      siteId: req.user.siteId ? req.user.siteId.toString() : 'undefined',
      groupId: req.user.groupId ? req.user.groupId.toString() : 'undefined',
      supplierId: req.user.supplierId ? req.user.supplierId.toString() : 'undefined',
      siteIdFromToken: decoded.siteId ? decoded.siteId.toString() : 'undefined',
      siteIdFromDB: req.user.siteId ? req.user.siteId.toString() : 'undefined'
    });
    
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