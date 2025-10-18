// client/js/apiHelper.js

// client/js/apiHelper.js
import { logout, redirectToLogin } from './auth.js';

/**
 * Helper universel pour tous les appels API protégés (JWT).
 * @param {string} url - L'URL de l'API à appeler.
 * @param {object} options - Options fetch (méthode, body, headers...).
 * @returns {Promise<Response>} - L'objet Response (à .json() par l'appelant).
 */
export async function fetchProtectedAPI(url, options = {}) {
options.headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
   options.credentials = 'include';
    const response = await fetch(url, options);

    if (response.status === 401) {
        // Token invalide ou expiré
        logout();
        throw new Error('Session expirée : veuillez vous reconnecter.');
    }

    return response;
}
