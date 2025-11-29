document.addEventListener('DOMContentLoaded', async () => {
  // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
  const user = typeof getStoredUser === 'function' ? getStoredUser() : null;
  
  // 🍪 Vérifier l'authentification via cookie HTTP-Only au lieu de localStorage
  if (!user) {
    // Vérifier si l'utilisateur est authentifié via l'API
    try {
      const authCheck = await fetch('/api/auth/me', {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!authCheck.ok) {
        return; // Pas authentifié, ne pas rediriger
      }
      
      const authData = await authCheck.json();
      const currentUser = authData?.user || authData;
      
      // Rediriger selon le rôle
      switch (currentUser.role) {
        case 'maison': window.location.href = 'maison-dashboard.html'; break;
        case 'resto': window.location.href = 'accueil.html'; break;
        case 'fournisseur': window.location.href = 'supplier-dashboard.html'; break;
        case 'collectivite': window.location.href = 'collectivite-dashboard.html'; break;
      }
    } catch (error) {
      console.error('Erreur lors de la vérification de l\'authentification:', error);
      return; // En cas d'erreur, ne pas rediriger
    }
  } else {
    // Si l'utilisateur est déjà dans sessionStorage, rediriger selon le rôle
    switch (user.role) {
      case 'maison': window.location.href = 'maison-dashboard.html'; break;
      case 'resto': window.location.href = 'accueil.html'; break;
      case 'fournisseur': window.location.href = 'supplier-dashboard.html'; break;
      case 'collectivite': window.location.href = 'collectivite-dashboard.html'; break;
    }
  }
});




