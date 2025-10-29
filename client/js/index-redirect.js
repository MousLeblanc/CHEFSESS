document.addEventListener('DOMContentLoaded', () => {
  const user = JSON.parse(sessionStorage.getItem('user') || 'null');
  // 🍪 Token géré via cookie HTTP-Only (pas besoin de le récupérer)
  if (token && user) {
    switch (user.role) {
      case 'maison': window.location.href = 'maison-dashboard.html'; break;
      case 'resto': window.location.href = 'accueil.html'; break;
      case 'fournisseur': window.location.href = 'supplier-dashboard.html'; break;
      case 'collectivite': window.location.href = 'collectivite-dashboard.html'; break;
    }
  }
});




