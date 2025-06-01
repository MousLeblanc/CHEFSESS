/**
 * Service d'API pour l'authentification
 */
class AuthAPI {
    constructor() {
        this.baseURL = 'http://localhost:5000/api/auth';
    }

    /**
     * Connexion utilisateur
     * @param {string} email 
     * @param {string} password 
     * @returns {Promise<{token: string, user: Object}>}
     */
    async login(email, password) {
        try {
            const response = await fetch(`${this.baseURL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur de connexion');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de la connexion:', error);
            throw error;
        }
    }

    /**
     * Inscription utilisateur
     * @param {Object} userData 
     * @returns {Promise<{token: string, user: Object}>}
     */
    async register(userData) {
        try {
            const response = await fetch(`${this.baseURL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(userData)
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || 'Erreur lors de l\'inscription');
            }

            return await response.json();
        } catch (error) {
            console.error('Erreur lors de l\'inscription:', error);
            throw error;
        }
    }

    /**
     * Vérifie si le token est valide
     * @returns {Promise<boolean>}
     */
    async verifyToken() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return false;

            const response = await fetch(`${this.baseURL}/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            return response.ok;
        } catch (error) {
            console.error('Erreur lors de la vérification du token:', error);
            return false;
        }
    }

    /**
     * Déconnexion - Supprime le token et les données utilisateur
     */
    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }
}

export { AuthAPI }; 