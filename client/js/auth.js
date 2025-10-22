export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

// Fonction pour rafraîchir les données utilisateur depuis le serveur
export async function refreshUserData() {
  const token = getToken();
  if (!token) return null;

  try {
    const response = await fetch('/api/users/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Cache-Control': 'no-cache'
      }
    });

    if (response.ok) {
      const userData = await response.json();
      localStorage.setItem('user', JSON.stringify(userData));
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
  return localStorage.getItem('token');
}

export async function logout() {
  try {
    // 🔐 Appeler l'API pour supprimer le cookie côté serveur
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include' // Important pour envoyer le cookie
    });
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  }
  
  // Nettoyer localStorage
  localStorage.removeItem('user');
  localStorage.removeItem('token'); // Supprimer le token si utilisé
  localStorage.removeItem('cart'); // Supprimer aussi le panier
  
  // Rediriger vers la page de connexion (chemin absolu)
  window.location.href = '/';
}


export function isAuthenticated() {
  const token = getToken();
  return !!token; // Renvoie true si token existe, false sinon
}
