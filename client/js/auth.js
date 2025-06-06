export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
// Pour les redirections :
export function redirectByRole(role) {
  switch (role) {
    case 'maison': 
      window.location.href = 'maison-dashboard.html'; 
      break;
    case 'resto': 
      window.location.href = 'accueil.html'; 
      break;
    case 'collectivite': // AJOUTER CETTE LIGNE
      window.location.href = 'collectivite-dashboard.html'; // Rediriger vers la nouvelle page
      break;
    case 'fournisseur': 
      window.location.href = 'supplier-dashboard.html'; 
      break;
    default: 
      window.location.href = 'index.html';
  }
}
export function redirectToLogin() { window.location.href = 'index.html'; }
export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}


export function isAuthenticated() {
  const token = getToken();
  return !!token; // Renvoie true si token existe, false sinon
}
