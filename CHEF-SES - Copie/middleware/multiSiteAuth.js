import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Group from '../models/Group.js';
import Site from '../models/Site.js';

/**
 * Middleware d'authentification pour l'architecture multi-sites
 */
export function requireAuth(req, res, next) {
  const token = req.cookies.token || req.headers.authorization?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({ message: "Token d'authentification requis" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id || decoded.userId; // Support both 'id' and 'userId'
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token invalide" });
  }
}

/**
 * Middleware pour charger les informations utilisateur complètes
 */
export async function loadUser(req, res, next) {
  try {
    console.log('🔍 Loading user with ID:', req.userId);
    const user = await User.findById(req.userId)
      .populate('groupId', 'name code')
      .populate('siteId', 'siteName type groupId');
    
    console.log('👤 User found:', user ? 'Yes' : 'No');
    if (user) {
      console.log('   - Name:', user.name);
      console.log('   - Roles:', user.roles);
      console.log('   - GroupId:', user.groupId);
      console.log('   - SiteId:', user.siteId);
    }
    
    if (!user) {
      return res.status(401).json({ message: "Utilisateur non trouvé" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur lors du chargement de l\'utilisateur:', error);
    return res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Middleware pour vérifier les rôles
 */
export function requireRoles(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const hasRequiredRole = req.user.hasAnyRole(roles);
    
    if (!hasRequiredRole) {
      return res.status(403).json({ 
        message: "Permissions insuffisantes",
        required: roles,
        current: req.user.roles || [req.user.role]
      });
    }
    
    next();
  };
}

/**
 * Middleware pour vérifier l'accès à un groupe
 */
export function ensureSameGroup(paramKey = "groupId") {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const userGroup = req.user.groupId?.toString();
    const targetGroup = (req.params[paramKey] || req.body[paramKey] || "").toString();
    
    if (!userGroup || !targetGroup || userGroup !== targetGroup) {
      return res.status(403).json({ 
        message: "Accès interdit - Groupes différents",
        userGroup,
        targetGroup
      });
    }
    
    next();
  };
}

/**
 * Middleware pour vérifier l'accès à un site
 */
export function ensureSameSite(paramKey = "siteId") {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    const userSite = req.user.siteId?.toString();
    const targetSite = (req.params[paramKey] || req.body[paramKey] || "").toString();
    
    if (!userSite || !targetSite || userSite !== targetSite) {
      return res.status(403).json({ 
        message: "Accès interdit - Sites différents",
        userSite,
        targetSite
      });
    }
    
    next();
  };
}

/**
 * Middleware pour vérifier les permissions de groupe (GROUP_ADMIN ou SITE_MANAGER du même groupe)
 */
export function requireGroupAccess(paramKey = "groupId") {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }

      const targetGroupId = req.params[paramKey] || req.body[paramKey];
      
      if (!targetGroupId) {
        return res.status(400).json({ message: "ID de groupe requis" });
      }

      // GROUP_ADMIN peut accéder à tous les groupes
      if (req.user.isGroupAdmin()) {
        return next();
      }

      // SITE_MANAGER peut accéder à son groupe uniquement
      if (req.user.isSiteManager() && req.user.canAccessGroup(targetGroupId)) {
        return next();
      }

      return res.status(403).json({ 
        message: "Accès interdit - Permissions de groupe insuffisantes",
        userRole: req.user.getEffectiveRole(),
        targetGroup: targetGroupId
      });
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions de groupe:', error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
}

/**
 * Middleware pour vérifier les permissions de site
 */
export function requireSiteAccess(paramKey = "siteId") {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Utilisateur non authentifié" });
      }

      const targetSiteId = req.params[paramKey] || req.body[paramKey];
      
      if (!targetSiteId) {
        return res.status(400).json({ message: "ID de site requis" });
      }

      // GROUP_ADMIN peut accéder à tous les sites de son groupe
      if (req.user.isGroupAdmin()) {
        const site = await Site.findById(targetSiteId);
        if (site && req.user.canAccessGroup(site.groupId)) {
          return next();
        }
      }

      // SITE_MANAGER peut accéder à son site uniquement
      if (req.user.isSiteManager() && req.user.canAccessSite(targetSiteId)) {
        return next();
      }

      return res.status(403).json({ 
        message: "Accès interdit - Permissions de site insuffisantes",
        userRole: req.user.getEffectiveRole(),
        targetSite: targetSiteId
      });
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions de site:', error);
      return res.status(500).json({ message: "Erreur serveur" });
    }
  };
}

/**
 * Middleware pour vérifier si l'utilisateur peut synchroniser des menus
 */
export function requireSyncPermission() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // Seuls les GROUP_ADMIN peuvent synchroniser des menus
    if (!req.user.isGroupAdmin()) {
      return res.status(403).json({ 
        message: "Seuls les administrateurs de groupe peuvent synchroniser des menus",
        userRole: req.user.getEffectiveRole()
      });
    }
    
    next();
  };
}

/**
 * Middleware pour vérifier si l'utilisateur peut modifier un menu local
 */
export function requireMenuEditPermission() {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non authentifié" });
    }

    // GROUP_ADMIN, SITE_MANAGER et CHEF peuvent modifier les menus
    const allowedRoles = ['GROUP_ADMIN', 'SITE_MANAGER', 'CHEF'];
    
    if (!req.user.hasAnyRole(allowedRoles)) {
      return res.status(403).json({ 
        message: "Permissions insuffisantes pour modifier les menus",
        userRole: req.user.getEffectiveRole(),
        allowedRoles
      });
    }
    
    next();
  };
}

/**
 * Middleware pour logger les accès multi-sites
 */
export function logMultiSiteAccess(req, res, next) {
  if (req.user) {
    console.log(`🔐 Accès multi-sites - Utilisateur: ${req.user.name} (${req.user.getEffectiveRole()})`);
    console.log(`   GroupId: ${req.user.groupId || 'N/A'}`);
    console.log(`   SiteId: ${req.user.siteId || 'N/A'}`);
    console.log(`   Rôles: ${req.user.roles?.join(', ') || req.user.role}`);
  }
  next();
}
