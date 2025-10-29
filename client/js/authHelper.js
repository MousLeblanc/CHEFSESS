// js/authHelper.js
export function getToken() {
  return localStorage.getItem('token');
}

export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem('user')) || null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  // 🍪 Token supprimé via cookie (géré par le backend)
  localStorage.removeItem('user');
  window.location.href = 'index.html';
}
