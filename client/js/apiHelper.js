// client/js/apiHelper.js

import auth from './auth.js'; // Attention au chemin selon où tu mets ce fichier !

/**
 * Helper universel pour tous les appels API protégés (JWT).
 * @param {string} url - L'URL de l'API à appeler.
 * @param {object} options - Options fetch (méthode, body, headers...).
 * @returns {Promise<Response>} - L'objet Response (à .json() par l'appelant).
 */
export async function fetchProtectedAPI(url, options = {}) {
    const token = localStorage.getItem('token');
    if (!token) {
        auth.redirectToLogin();
        throw new Error('Session expirée : connectez-vous.');
    }

    // Ajoute les headers nécessaires
    options.headers = {
        ...(options.headers || {}),
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
    };

    const response = await fetch(url, options);

    if (response.status === 401) {
        // Token invalide ou expiré
        auth.logout();
        throw new Error('Session expirée : veuillez vous reconnecter.');
    }

    return response;
}
