/**
 * Helper pour gérer les tokens CSRF
 * 
 * Le token CSRF est envoyé par le serveur dans :
 * 1. Un cookie HttpOnly (csrf-token) - automatiquement envoyé par le navigateur
 * 2. Un header de réponse (X-CSRF-Token) - lisible par JavaScript
 * 
 * Pour les requêtes POST/PUT/DELETE, le client doit :
 * 1. Lire le token depuis le header de la dernière réponse
 * 2. L'envoyer dans le header X-CSRF-Token de la requête
 */

// Stocker le token CSRF en mémoire
let csrfToken = null;

/**
 * Récupérer le token CSRF depuis le header de réponse
 * Appelé automatiquement après chaque requête GET
 */
export function extractCSRFTokenFromResponse(response) {
  const token = response.headers.get('X-CSRF-Token');
  if (token) {
    csrfToken = token;
    console.log('🔒 Token CSRF mis à jour depuis la réponse');
  }
  return token;
}

/**
 * Obtenir le token CSRF actuel
 */
export function getCSRFToken() {
  return csrfToken;
}

/**
 * Récupérer le token CSRF depuis le serveur
 * À appeler après la connexion ou si le token est manquant
 */
export async function fetchCSRFToken() {
  try {
    const response = await fetch('/api/auth/csrf-token', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const token = response.headers.get('X-CSRF-Token');
      if (token) {
        csrfToken = token;
        console.log('🔒 Token CSRF récupéré depuis le serveur');
        return token;
      }
    }
  } catch (error) {
    console.error('❌ Erreur lors de la récupération du token CSRF:', error);
  }
  return null;
}

/**
 * Wrapper pour fetch qui ajoute automatiquement le token CSRF
 * Utiliser cette fonction au lieu de fetch() pour les requêtes POST/PUT/DELETE
 */
export async function fetchWithCSRF(url, options = {}) {
  // Si c'est une requête GET/HEAD/OPTIONS, pas besoin de token CSRF
  const method = (options.method || 'GET').toUpperCase();
  if (['GET', 'HEAD', 'OPTIONS'].includes(method)) {
    const response = await fetch(url, options);
    // Extraire le token CSRF de la réponse pour les prochaines requêtes
    extractCSRFTokenFromResponse(response);
    return response;
  }
  
  // Pour POST/PUT/DELETE/PATCH, ajouter le token CSRF
  if (!csrfToken) {
    // Essayer de récupérer le token si on ne l'a pas
    await fetchCSRFToken();
  }
  
  // Ajouter le header CSRF
  const headers = {
    ...options.headers,
    'X-CSRF-Token': csrfToken || ''
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include' // Important pour envoyer les cookies
  });
  
  // Extraire le token CSRF de la réponse (peut être mis à jour)
  extractCSRFTokenFromResponse(response);
  
  // Si erreur 403 avec message CSRF, essayer de récupérer un nouveau token
  if (response.status === 403) {
    const data = await response.clone().json().catch(() => ({}));
    if (data.error && data.error.includes('CSRF')) {
      console.warn('🔒 Token CSRF invalide, tentative de récupération...');
      await fetchCSRFToken();
      // Réessayer une fois avec le nouveau token
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
        return fetch(url, {
          ...options,
          headers,
          credentials: 'include'
        });
      }
    }
  }
  
  return response;
}

/**
 * Initialiser le token CSRF après la connexion
 * À appeler dans les scripts de dashboard après la vérification d'authentification
 */
export async function initCSRFToken() {
  // Récupérer le token CSRF depuis /api/auth/me (qui le génère automatiquement)
  try {
    const response = await fetch('/api/auth/me', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      extractCSRFTokenFromResponse(response);
      console.log('🔒 Token CSRF initialisé');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du token CSRF:', error);
  }
  return false;
}

// Auto-initialisation si on est dans un contexte de navigateur
if (typeof window !== 'undefined') {
  // Exposer les fonctions globalement pour faciliter l'utilisation
  window.fetchWithCSRF = fetchWithCSRF;
  window.getCSRFToken = getCSRFToken;
  window.initCSRFToken = initCSRFToken;
  
  // Écouter les réponses fetch pour extraire automatiquement le token CSRF
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const response = await originalFetch.apply(this, args);
    
    // Extraire le token CSRF de toutes les réponses (GET, POST, etc.)
    extractCSRFTokenFromResponse(response);
    
    return response;
  };
  
  // Initialiser le token CSRF au chargement de la page si l'utilisateur est connecté
  document.addEventListener('DOMContentLoaded', () => {
    const userStr = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (userStr) {
      // Petit délai pour laisser le temps aux autres scripts de s'initialiser
      setTimeout(() => {
        initCSRFToken();
      }, 500);
    }
  });
}

