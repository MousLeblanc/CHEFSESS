// client/js/index.js
import { getCurrentUser, getToken, redirectByRole, logout } from './auth.js';

document.addEventListener('DOMContentLoaded', async () => {
  const token = getToken();
  const userFromStorage = getCurrentUser();

  if (token && userFromStorage) {
    try {
      const response = await fetch('/api/auth/verify', { // Chemin relatif
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const verifiedData = await response.json();
        if (verifiedData.user) {
            localStorage.setItem('user', JSON.stringify(verifiedData.user)); // Mettre à jour user si besoin
        }
        // Si on est toujours sur index.html (pas encore redirigé par script inline)
        if (window.location.pathname.endsWith('index.html') || window.location.pathname === '/') {
            redirectByRole(verifiedData.user.role || userFromStorage.role);
        }
      } else {
        logout(); // Token invalide, déconnexion
      }
    } catch (error) {
      console.error("Erreur lors de la vérification du token:", error);
      // Optionnel: logout(); en cas d'erreur réseau ?
    }
  }
  // Si pas de token, l'utilisateur reste sur index.html pour se connecter/s'inscrire
  // Le formulaire de login sera géré par login.js
});