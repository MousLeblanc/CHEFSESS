/**
 * ChAIf SES - Module d'authentification
 */

class Authentication {
    constructor() {
        // Initialiser le gestionnaire d'authentification
        this.initializeAuth();
    }

    /**
     * Initialise le système d'authentification
     */
    initializeAuth() {
        // Vérifier si la structure de données des utilisateurs existe
        if (!localStorage.getItem('chaif-ses-users')) {
            // Créer une structure par défaut avec un utilisateur admin
            const defaultUsers = [
                {
                    id: 1,
                    name: 'Administrateur',
                    email: 'admin@chaifses.fr',
                    password: this.hashPassword('admin123'), // Dans un vrai système, utiliser bcrypt
                    role: 'admin',
                    created: new Date().toISOString(),
                    lastLogin: null
                }
            ];
            
            localStorage.setItem('chaif-ses-users', JSON.stringify(defaultUsers));
        }
    }

    /**
     * Simule un hachage de mot de passe
     * Note: Dans une application réelle, utilisez bcrypt ou un autre algorithme sécurisé
     * @param {string} password - Mot de passe à hacher
     * @returns {string} - Mot de passe haché
     */
    hashPassword(password) {
        // Simple hachage pour la démo (NE PAS UTILISER EN PRODUCTION)
        // En production, utilisez bcrypt ou Argon2
        return btoa(password + "chaifses-salt");
    }

    /**
     * Vérifie si les identifiants sont valides
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Object|null} - Utilisateur si authentifié, null sinon
     */
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('chaif-ses-users'));
        const hashedPassword = this.hashPassword(password);
        
        const user = users.find(u => u.email === email && u.password === hashedPassword);
        
        if (user) {
            // Mise à jour de la date de dernière connexion
            user.lastLogin = new Date().toISOString();
            this.updateUser(user);
            
            // Stocker les informations de session
            localStorage.setItem('chaif-ses-authenticated', 'true');
            localStorage.setItem('chaif-ses-user-id', user.id);
            localStorage.setItem('chaif-ses-user-email', user.email);
            localStorage.setItem('chaif-ses-user-role', user.role);
            localStorage.setItem('chaif-ses-session-start', new Date().toISOString());
            
            return user;
        }
        
        return null;
    }

    /**
     * Vérifie si l'utilisateur est authentifié
     * @returns {boolean} - true si authentifié, false sinon
     */
    isAuthenticated() {
        const isAuth = localStorage.getItem('chaif-ses-authenticated') === 'true';
        const sessionStart = localStorage.getItem('chaif-ses-session-start');
        
        if (isAuth && sessionStart) {
            // Vérifier si la session n'a pas expiré (24h par défaut)
            const sessionStartDate = new Date(sessionStart);
            const currentDate = new Date();
            const sessionDuration = (currentDate - sessionStartDate) / (1000 * 60 * 60); // en heures
            
            // Si la session a duré plus de 24h, la déconnecter
            if (sessionDuration > 24) {
                this.logout();
                return false;
            }
            
            return true;
        }
        
        return false;
    }

    /**
     * Déconnecte l'utilisateur
     */
    logout() {
        localStorage.removeItem('chaif-ses-authenticated');
        localStorage.removeItem('chaif-ses-user-id');
        localStorage.removeItem('chaif-ses-user-email');
        localStorage.removeItem('chaif-ses-user-role');
        localStorage.removeItem('chaif-ses-session-start');
    }

    /**
     * Inscrit un nouvel utilisateur
     * @param {string} name - Nom de l'utilisateur
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Object|string} - Utilisateur créé ou message d'erreur
     */
    register(name, email, password) {
        const users = JSON.parse(localStorage.getItem('chaif-ses-users'));
        
        // Vérifier si l'email existe déjà
        if (users.some(u => u.email === email)) {
            return "Cet email est déjà utilisé";
        }
        
        // Créer un nouvel utilisateur
        const newUser = {
            id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
            name,
            email,
            password: this.hashPassword(password),
            role: 'user', // Par défaut, les nouveaux utilisateurs ont le rôle 'user'
            created: new Date().toISOString(),
            lastLogin: null
        };
        
        // Ajouter l'utilisateur à la liste
        users.push(newUser);
        localStorage.setItem('chaif-ses-users', JSON.stringify(users));
        
        return newUser;
    }

    /**
     * Met à jour un utilisateur dans la base de données
     * @param {Object} updatedUser - Utilisateur mis à jour
     * @returns {boolean} - true si mis à jour, false sinon
     */
    updateUser(updatedUser) {
        const users = JSON.parse(localStorage.getItem('chaif-ses-users'));
        const index = users.findIndex(u => u.id === updatedUser.id);
        
        if (index !== -1) {
            users[index] = updatedUser;
            localStorage.setItem('chaif-ses-users', JSON.stringify(users));
            return true;
        }
        
        return false;
    }

    /**
     * Obtient l'utilisateur actuellement connecté
     * @returns {Object|null} - Utilisateur connecté ou null si non connecté
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        const userId = parseInt(localStorage.getItem('chaif-ses-user-id'));
        const users = JSON.parse(localStorage.getItem('chaif-ses-users'));
        
        return users.find(u => u.id === userId) || null;
    }

    /**
     * Vérifie si l'utilisateur actuel a le rôle spécifié
     * @param {string} role - Rôle à vérifier
     * @returns {boolean} - true si l'utilisateur a le rôle, false sinon
     */
    hasRole(role) {
        if (!this.isAuthenticated()) {
            return false;
        }
        
        const userRole = localStorage.getItem('chaif-ses-user-role');
        return userRole === role;
    }

    /**
     * Vérifie si l'utilisateur actuel est un administrateur
     * @returns {boolean} - true si administrateur, false sinon
     */
    isAdmin() {
        return this.hasRole('admin');
    }

    /**
     * Change le mot de passe de l'utilisateur connecté
     * @param {string} currentPassword - Mot de passe actuel
     * @param {string} newPassword - Nouveau mot de passe
     * @returns {boolean|string} - true si changé, message d'erreur sinon
     */
    changePassword(currentPassword, newPassword) {
        const user = this.getCurrentUser();
        
        if (!user) {
            return "Utilisateur non connecté";
        }
        
        // Vérifier l'ancien mot de passe
        if (user.password !== this.hashPassword(currentPassword)) {
            return "Mot de passe actuel incorrect";
        }
        
        // Mettre à jour le mot de passe
        user.password = this.hashPassword(newPassword);
        this.updateUser(user);
        
        return true;
    }

    /**
     * Protège une page en vérifiant l'authentification
     * Si l'utilisateur n'est pas authentifié, redirige vers la page de login
     */
    protectPage() {
        if (!this.isAuthenticated()) {
            window.location.href = 'login.html';
        }
    }
}

// Créer et exporter une instance du gestionnaire d'authentification
const authManager = new Authentication();
export default authManager;