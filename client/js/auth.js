export function getCurrentUser() {
  // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
  if (typeof getStoredUser === 'function') {
    return getStoredUser();
  }
  // Fallback si getStoredUser n'est pas disponible
  const user = sessionStorage.getItem('user');
  if (!user) return null;
  if (typeof safeJSONParse === 'function') {
    return safeJSONParse(user, null);
  }
  try {
    return JSON.parse(user);
  } catch {
    return null;
  }
}

// Fonction pour rafraîchir les données utilisateur depuis le serveur
export async function refreshUserData() {
  const token = getToken();

  try {
    const response = await fetch('/api/users/me', {
      credentials: 'include', // 🍪 Cookie HTTP-Only
      method: 'GET',
      headers: {
        // 🍪 Authorization via cookie HTTP-Only (header Authorization supprimé)
'Cache-Control': 'no-cache'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      sessionStorage.setItem('user', JSON.stringify(userData));
      return userData;
    }
  } catch (error) {
    console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
  }
  return getCurrentUser();
}
// Pour les redirections :
export function redirectByRole(role, establishmentType) {
  switch (role) {
    case 'resto': 
      window.location.href = 'accueil.html'; 
      break;
    case 'collectivite':
      switch (establishmentType) {
        case 'cantine_scolaire':
          window.location.href = 'ecole-dashboard.html';
          break;
        case 'hopital':
          window.location.href = 'hopital-dashboard.html';
          break;
        case 'ehpad':
          window.location.href = 'ehpad-dashboard.html';
          break;
        case 'maison_de_retraite':
          window.location.href = 'maison-retraite-dashboard.html';
          break;
        case 'cantine_entreprise':
          window.location.href = 'entreprise-dashboard.html';
          break;
        default:
          window.location.href = 'collectivite-dashboard.html';
      }
      break;
    case 'fournisseur': 
      window.location.href = 'supplier-dashboard.html'; 
      break;
    case 'groupe':
      window.location.href = 'group-dashboard.html';
      break;
    default: 
      window.location.href = '/';
  }
}
export function redirectToLogin() { window.location.href = '/'; }
export function getToken() {
  // ❌ Plus de token dans localStorage - on utilise maintenant les cookies HTTP-only
  // Cette fonction est conservée pour compatibilité mais retourne null
  return null;
}

export async function logout() {
  try {
    // ✅ SÉCURITÉ : Utiliser fetchWithCSRF pour la protection CSRF
    const fetchFn = (typeof window !== 'undefined' && window.fetchWithCSRF) ? window.fetchWithCSRF : fetch;
    
    // 🔐 Appeler l'API pour supprimer le cookie côté serveur
    await fetchFn('/api/auth/logout', {
      method: 'POST',
      credentials: 'include' // Important pour envoyer le cookie
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
  
  // Notifier les autres onglets de la déconnexion
  if (typeof window !== 'undefined' && window.sessionSync) {
    window.sessionSync.notifyLogout();
  }
  
  // Nettoyer sessionStorage
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('currentSiteId'); // Supprimer aussi le siteId spécifique à cet onglet
  // 🍪 Token supprimé via cookie (géré par le backend)
  sessionStorage.removeItem('cart'); // Supprimer aussi le panier
  
  // Rediriger vers la page de connexion (chemin absolu)
  window.location.href = '/';
}


export function isAuthenticated() {
  const token = getToken();
  return !!token; // Renvoie true si token existe, false sinon
}
