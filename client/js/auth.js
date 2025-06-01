export function getCurrentUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function getToken() {
  return localStorage.getItem('token');
}

export function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}

// Pour les redirections :
export function redirectByRole(role) {
  switch (role) {
    case 'maison': window.location.href = 'maison-dashboard.html'; break;
    case 'resto': window.location.href = 'accueil.html'; break;
    case 'fournisseur': window.location.href = 'supplier-dashboard.html'; break;
    default: window.location.href = 'index.html';
  }
}
