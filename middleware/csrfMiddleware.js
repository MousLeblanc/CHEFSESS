/**
 * Middleware de protection CSRF
 * 
 * Stratégie : Double Submit Cookie Pattern
 * - Le token CSRF est stocké dans un cookie HttpOnly
 * - Le même token doit être envoyé dans le header X-CSRF-Token
 * - Le serveur compare les deux valeurs
 * 
 * Cette approche fonctionne bien avec les cookies HttpOnly car :
 * - Le cookie est automatiquement envoyé par le navigateur
 * - Le header doit être explicitement ajouté par JavaScript
 * - Un site malveillant ne peut pas lire le cookie (HttpOnly) ni ajouter le header (CORS)
 */

import crypto from 'crypto';

// Stocker les tokens CSRF en mémoire (en production, utiliser Redis)
// Format: { userId: { token: string, expiresAt: number } }
const csrfTokens = new Map();

// Durée de vie du token CSRF (24 heures)
const CSRF_TOKEN_EXPIRY = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

/**
 * Générer un token CSRF sécurisé
 */
export function generateCSRFToken(userId) {
  // Vérifier que userId est valide
  if (!userId) {
    throw new Error('generateCSRFToken: userId est requis');
  }
  
  // Générer un token aléatoire sécurisé
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = Date.now() + CSRF_TOKEN_EXPIRY;
  
  // Stocker le token associé à l'utilisateur
  csrfTokens.set(userId.toString(), {
    token,
    expiresAt
  });
  
  // Nettoyer les tokens expirés (tous les 1000 tokens)
  if (csrfTokens.size % 1000 === 0) {
    cleanupExpiredTokens();
  }
  
  return token;
}

/**
 * Vérifier un token CSRF
 */
export function verifyCSRFToken(userId, token) {
  if (!userId || !token) {
    return false;
  }
  
  const stored = csrfTokens.get(userId.toString());
  
  if (!stored) {
    return false;
  }
  
  // Vérifier l'expiration
  if (Date.now() > stored.expiresAt) {
    csrfTokens.delete(userId.toString());
    return false;
  }
  
  // Comparer les tokens de manière sécurisée (timing-safe)
  return crypto.timingSafeEqual(
    Buffer.from(token),
    Buffer.from(stored.token)
  );
}

/**
 * Supprimer un token CSRF (lors de la déconnexion)
 */
export function revokeCSRFToken(userId) {
  if (userId) {
    csrfTokens.delete(userId.toString());
  }
}

/**
 * Nettoyer les tokens expirés
 */
function cleanupExpiredTokens() {
  const now = Date.now();
  for (const [userId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(userId);
    }
  }
}

/**
 * Middleware de protection CSRF
 * À utiliser sur les routes POST, PUT, DELETE, PATCH
 */
export const csrfProtection = (req, res, next) => {
  // Ignorer les méthodes GET, HEAD, OPTIONS (pas de modification de données)
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }
  
  // Si l'utilisateur n'est pas authentifié, laisser authMiddleware gérer
  if (!req.user || !req.user._id) {
    console.log('🔒 CSRF: Utilisateur non authentifié, passage du middleware');
    return next();
  }
  
  console.log(`🔒 CSRF: Vérification pour ${req.method} ${req.path} - User: ${req.user._id}`);
  
  // Récupérer le token depuis le cookie
  const cookieToken = req.cookies?.['csrf-token'];
  
  // Récupérer le token depuis le header
  const headerToken = req.headers['x-csrf-token'];
  
  console.log(`🔒 CSRF: Cookie token: ${cookieToken ? 'présent' : 'absent'}, Header token: ${headerToken ? 'présent' : 'absent'}`);
  
  // Vérifier que les deux tokens existent et correspondent
  if (!cookieToken || !headerToken) {
    console.warn(`🔒 CSRF: Token manquant - Cookie: ${!!cookieToken}, Header: ${!!headerToken}`);
    return res.status(403).json({
      success: false,
      error: 'CSRF token manquant. Veuillez rafraîchir la page.'
    });
  }
  
  // Vérifier que le token du cookie correspond à celui du header
  // Utiliser une comparaison timing-safe pour éviter les attaques par timing
  try {
    const cookieBuffer = Buffer.from(cookieToken, 'utf8');
    const headerBuffer = Buffer.from(headerToken, 'utf8');
    
    // Comparaison timing-safe (résistant aux attaques par timing)
    if (!crypto.timingSafeEqual(cookieBuffer, headerBuffer)) {
      console.warn(`🔒 CSRF: Tokens ne correspondent pas pour l'utilisateur ${req.user._id}`);
      return res.status(403).json({
        success: false,
        error: 'CSRF token invalide. Veuillez rafraîchir la page.'
      });
    }
  } catch (error) {
    // Si les buffers ont des longueurs différentes, timingSafeEqual lance une erreur
    console.warn(`🔒 CSRF: Erreur lors de la comparaison des tokens pour l'utilisateur ${req.user._id}:`, error.message);
    return res.status(403).json({
      success: false,
      error: 'CSRF token invalide. Veuillez rafraîchir la page.'
    });
  }
  
  // Vérifier que le token est valide pour cet utilisateur (vérifie l'expiration et l'association)
  if (!verifyCSRFToken(req.user._id, cookieToken)) {
    console.warn(`🔒 CSRF: Token invalide ou expiré pour l'utilisateur ${req.user._id}`);
    return res.status(403).json({
      success: false,
      error: 'CSRF token invalide ou expiré. Veuillez vous reconnecter.'
    });
  }
  
  // Token valide, continuer
  next();
};

/**
 * Middleware pour générer et envoyer un token CSRF
 * À utiliser sur les routes GET pour fournir le token au client
 */
export const generateCSRFTokenMiddleware = (req, res, next) => {
  // Si l'utilisateur n'est pas authentifié, ne pas générer de token
  if (!req.user || !req.user._id) {
    return next();
  }
  
  // Générer un nouveau token CSRF
  const token = generateCSRFToken(req.user._id);
  
  // Envoyer le token dans un cookie HttpOnly
  const isProduction = process.env.NODE_ENV === 'production';
  const isRender = process.env.RENDER_SERVICE_ID || process.env.RENDER === 'true';
  
  res.cookie('csrf-token', token, {
    httpOnly: true, // Inaccessible en JavaScript
    secure: isProduction || isRender, // HTTPS uniquement en production
    sameSite: isRender ? 'none' : 'lax', // Protection CSRF
    maxAge: CSRF_TOKEN_EXPIRY, // 24 heures
    path: '/' // Disponible sur tout le site
  });
  
  // Ajouter le token dans le header de réponse pour que le client puisse le lire
  // (le cookie HttpOnly ne peut pas être lu par JavaScript)
  res.setHeader('X-CSRF-Token', token);
  
  next();
};

