// js/authHelper.js
export function getToken() {
  return localStorage.getItem('token');
}

export function getCurrentUser() {
  // ✅ VALIDATION : Utiliser getStoredUser pour une validation stricte
  if (typeof getStoredUser === 'function') {
    return getStoredUser();
  }
  // Fallback si getStoredUser n'est pas disponible (utiliser safeJSONParse si disponible)
  try {
    const storedUser = sessionStorage.getItem('user') || localStorage.getItem('user');
    if (!storedUser) return null;
    if (typeof safeJSONParse === 'function') {
      return safeJSONParse(storedUser, null);
    }
    return JSON.parse(storedUser) || null;
  } catch {
    return null;
  }
}

export function isAuthenticated() {
  return !!getToken();
}

export function logout() {
  // 🍪 Token supprimé via cookie (géré par le backend)
  sessionStorage.removeItem('user');
  window.location.href = 'index.html';
}
