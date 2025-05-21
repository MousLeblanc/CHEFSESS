/**
 * ChAIf SES - Module d'authentification
 * Version 2.1 - Correction des problèmes de boucles et amélioration du débogage
 */

class Authentication {
    constructor() {
        // Initialiser le gestionnaire d'authentification
        this.DEBUG = true; // Activer/désactiver les logs de débogage
        this.initialized = false;
        this.initializeAuth();
    }

    /**
     * Méthode de log avec niveau de débogage
     * @param {string} message - Message à logger
     * @param {string} level - Niveau de log (log, warn, error)
     */
    log(message, level = 'log') {
        if (this.DEBUG) {
            const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
            console[level](`[Auth ${timestamp}] ${message}`);
        }
    }

    /**
     * Initialise le système d'authentification
     */
    initializeAuth() {
        if (this.initialized) return;
        
        this.log('Initialisation du système d\'authentification');
        
        try {
            // Vérifier si la structure de données des utilisateurs existe
            if (!localStorage.getItem('chaif-ses-users')) {
                // Créer une structure par défaut avec un utilisateur admin
                const defaultUsers = [
                    {
                        id: 1,
                        name: 'Administrateur',
                        email: 'admin@chaifses.fr',
                        password: this.hashPassword('admin123'),
                        role: 'admin',
                        created: new Date().toISOString(),
                        lastLogin: null
                    }
                ];
                
                localStorage.setItem('chaif-ses-users', JSON.stringify(defaultUsers));
                this.log('Base de données utilisateurs initialisée avec un compte admin par défaut');
            } else {
                this.log('Base de données utilisateurs déjà initialisée');
            }
            
            this.initialized = true;
        } catch (error) {
            this.log(`Erreur lors de l'initialisation: ${error.message}`, 'error');
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
        return btoa(password + "chaifses-salt");
    }

    /**
     * Vérifie si les identifiants sont valides
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Object|null} - Utilisateur si authentifié, null sinon
     */
    login(email, password) {
        this.log(`Tentative de connexion pour: ${email}`);
        
        try {
            // Récupérer la liste des utilisateurs
            const usersJson = localStorage.getItem('chaif-ses-users');
            if (!usersJson) {
                this.log('Aucun utilisateur trouvé dans la base de données', 'warn');
                return null;
            }
            
            const users = JSON.parse(usersJson);
            const hashedPassword = this.hashPassword(password);
            
            // Rechercher l'utilisateur
            const user = users.find(u => u.email === email && u.password === hashedPassword);
            
            if (user) {
                this.log(`Authentification réussie pour: ${email}`);
                
                // Mise à jour de la date de dernière connexion
                user.lastLogin = new Date().toISOString();
                this.updateUser(user);
                
                // Stocker les informations de session
                this._setAuthData(user);
                
                // Récupérer la page de redirection ou utiliser accueil.html par défaut
               // const redirectPage = localStorage.getItem('redirect-after-login') || 'accueil.html';
                t//his.log(`Redirection prévue vers: ${redirectPage}`);
                
                // Effacer la redirection stockée
                //localStorage.removeItem('redirect-after-login');
                
                // Ajouter un délai pour éviter les problèmes de boucle
               // setTimeout(() => {
                 //   this.log(`Redirection effective vers: ${redirectPage}`);
                   // window.location.href = redirectPage;
                //}, 200);
                
                return user;
            }
            
            this.log('Échec de l\'authentification: identifiants incorrects', 'warn');
            return null;
        } catch (error) {
            this.log(`Erreur lors de la tentative de connexion: ${error.message}`, 'error');
            return null;
        }
    }

    /**
     * Définit les données d'authentification dans le localStorage
     * @param {Object} user - Utilisateur authentifié
     * @private
     */
    _setAuthData(user) {
        localStorage.setItem('chaif-ses-authenticated', 'true');
        localStorage.setItem('chaif-ses-user-id', user.id.toString());
        localStorage.setItem('chaif-ses-user-email', user.email);
        localStorage.setItem('chaif-ses-user-name', user.name);
        localStorage.setItem('chaif-ses-user-role', user.role);
        localStorage.setItem('chaif-ses-session-start', new Date().toISOString());
        
        this.log('Données d\'authentification enregistrées');
    }

    /**
     * Vérifie si l'utilisateur est authentifié
     * @returns {boolean} - true si authentifié, false sinon
     */
    isAuthenticated() {
        try {
            // Page actuelle pour le débogage
            const currentPage = window.location.pathname.split('/').pop() || 'accueil.html';
            
            // Récupérer les données d'authentification
            const isAuth = localStorage.getItem('chaif-ses-authenticated');
            const userId = localStorage.getItem('chaif-ses-user-id');
            const sessionStart = localStorage.getItem('chaif-ses-session-start');
            
            this.log(`Vérification d'authentification sur ${currentPage} - Auth: ${isAuth}, UserID: ${userId}`);
            
            // Vérification stricte
            if (isAuth !== 'true' || !userId || !sessionStart) {
                this.log('Authentification invalide: information manquante');
                return false;
            }
            
            // Vérifier l'expiration de session
            const sessionStartDate = new Date(sessionStart);
            const currentDate = new Date();
            const sessionDuration = (currentDate - sessionStartDate) / (1000 * 60 * 60);
            
            // Si la session a duré plus de 24h, la déconnecter
            if (sessionDuration > 24) {
                this.log('Session expirée (> 24h), déconnexion automatique', 'warn');
                this.logout();
                return false;
            }
            
            this.log('Utilisateur authentifié');
            return true;
        } catch (error) {
            this.log(`Erreur lors de la vérification d'authentification: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Déconnecte l'utilisateur
     */
    logout() {
        this.log('Déconnexion de l\'utilisateur');
        
        // Liste des clés d'authentification à supprimer
        const authKeys = [
            'chaif-ses-authenticated',
            'chaif-ses-user-id',
            'chaif-ses-user-email',
            'chaif-ses-user-name',
            'chaif-ses-user-role',
            'chaif-ses-session-start',
            'redirect-after-login'
        ];
        
        // Supprimer toutes les données de session
        authKeys.forEach(key => localStorage.removeItem(key));
        
        this.log('Toutes les données de session ont été supprimées');
    }

    /**
     * Inscrit un nouvel utilisateur
     * @param {string} name - Nom de l'utilisateur
     * @param {string} email - Email de l'utilisateur
     * @param {string} password - Mot de passe
     * @returns {Object|string} - Utilisateur créé ou message d'erreur
     */
    register(name, email, password) {
        this.log(`Tentative d'inscription pour: ${email}`);
        
        try {
            const usersJson = localStorage.getItem('chaif-ses-users');
            const users = usersJson ? JSON.parse(usersJson) : [];
            
            // Vérifier si l'email existe déjà
            if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
                this.log('Email déjà utilisé', 'warn');
                return "Cet email est déjà utilisé";
            }
            
            // Créer un nouvel utilisateur
            const newUser = {
                id: users.length > 0 ? Math.max(...users.map(u => u.id)) + 1 : 1,
                name,
                email,
                password: this.hashPassword(password),
                role: 'user', // Par défaut
                created: new Date().toISOString(),
                lastLogin: null
            };
            
            // Ajouter l'utilisateur à la liste
            users.push(newUser);
            localStorage.setItem('chaif-ses-users', JSON.stringify(users));
            
            this.log(`Utilisateur créé avec succès: ID ${newUser.id} (${email})`);
            
            // Rediriger vers la page de connexion après un court délai
  //          setTimeout(() => {
    //            this.log('Redirection vers la page de connexion');
      //          window.location.href = 'login.html';
        //    }, 300);
            
            return newUser;
        } catch (error) {
            this.log(`Erreur lors de l'inscription: ${error.message}`, 'error');
            return "Une erreur est survenue lors de l'inscription";
        }
    }

    /**
     * Met à jour un utilisateur dans la base de données
     * @param {Object} updatedUser - Utilisateur mis à jour
     * @returns {boolean} - true si mis à jour, false sinon
     */
    updateUser(updatedUser) {
        this.log(`Mise à jour de l'utilisateur ID ${updatedUser.id}`);
        
        try {
            const usersJson = localStorage.getItem('chaif-ses-users');
            if (!usersJson) {
                this.log('Aucun utilisateur trouvé dans la base de données', 'warn');
                return false;
            }
            
            const users = JSON.parse(usersJson);
            const index = users.findIndex(u => u.id === updatedUser.id);
            
            if (index !== -1) {
                users[index] = updatedUser;
                localStorage.setItem('chaif-ses-users', JSON.stringify(users));
                this.log('Utilisateur mis à jour avec succès');
                return true;
            }
            
            this.log(`Utilisateur avec ID ${updatedUser.id} non trouvé`, 'warn');
            return false;
        } catch (error) {
            this.log(`Erreur lors de la mise à jour de l'utilisateur: ${error.message}`, 'error');
            return false;
        }
    }

    /**
     * Obtient l'utilisateur actuellement connecté
     * @returns {Object|null} - Utilisateur connecté ou null si non connecté
     */
    getCurrentUser() {
        if (!this.isAuthenticated()) {
            return null;
        }
        
        try {
            const userId = parseInt(localStorage.getItem('chaif-ses-user-id') || '0');
            const usersJson = localStorage.getItem('chaif-ses-users');
            
            if (!usersJson) {
                this.log('Aucun utilisateur trouvé dans la base de données', 'warn');
                return null;
            }
            
            const users = JSON.parse(usersJson);
            return users.find(u => u.id === userId) || null;
        } catch (error) {
            this.log(`Erreur lors de la récupération de l'utilisateur actuel: ${error.message}`, 'error');
            return null;
        }
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
        this.log('Tentative de changement de mot de passe');
        
        const user = this.getCurrentUser();
        
        if (!user) {
            this.log('Changement de mot de passe échoué: utilisateur non connecté', 'warn');
            return "Utilisateur non connecté";
        }
        
        // Vérifier l'ancien mot de passe
        if (user.password !== this.hashPassword(currentPassword)) {
            this.log('Changement de mot de passe échoué: mot de passe actuel incorrect', 'warn');
            return "Mot de passe actuel incorrect";
        }
        
        // Mettre à jour le mot de passe
        user.password = this.hashPassword(newPassword);
        if (this.updateUser(user)) {
            this.log('Mot de passe changé avec succès');
            return true;
        } else {
            this.log('Erreur lors de la mise à jour du mot de passe', 'error');
            return "Erreur lors de la mise à jour du mot de passe";
        }
    }

    /**
     * Protège une page en vérifiant l'authentification
     * Si l'utilisateur n'est pas authentifié, redirige vers la page de login
     * @returns {boolean} - true si l'utilisateur est authentifié, false sinon
     */
    protectPage() {
        // Vérifier la page actuelle pour éviter les boucles
        const currentPage = window.location.pathname.split('/').pop() || 'accueil.html';
        this.log(`Protection de page: ${currentPage}`);
        
        // Ne pas protéger les pages publiques
        if (currentPage === 'login.html' || currentPage === 'register.html') {
            this.log('Page publique détectée, pas de protection nécessaire');
            return true;
        }
        
        // Vérifier l'authentification
        if (!this.isAuthenticated()) {
            this.log(`Redirection vers login.html depuis ${currentPage}`);
            
            // Stocker la page actuelle pour y revenir après connexion
            localStorage.setItem('redirect-after-login', currentPage);
            
            // Rediriger vers la page de connexion avec un léger délai
            setTimeout(() => {
                window.location.href = 'login.html';
            }, 100);
            
            return false;
        }
        
        this.log('Utilisateur authentifié, accès autorisé à la page');
        return true;
    }
    
    /**
     * Obtient tous les utilisateurs (réservé aux administrateurs)
     * @returns {Array|null} - Liste des utilisateurs ou null si non autorisé
     */
    getAllUsers() {
        if (!this.isAdmin()) {
            this.log('Tentative non autorisée d\'accès à la liste des utilisateurs', 'warn');
            return null;
        }
        
        try {
            const usersJson = localStorage.getItem('chaif-ses-users');
            return usersJson ? JSON.parse(usersJson) : [];
        } catch (error) {
            this.log(`Erreur lors de la récupération des utilisateurs: ${error.message}`, 'error');
            return [];
        }
    }
    
    /**
     * Met à jour le rôle d'un utilisateur (réservé aux administrateurs)
     * @param {number} userId - ID de l'utilisateur à modifier
     * @param {string} newRole - Nouveau rôle ('user', 'admin', etc.)
     * @returns {boolean} - true si mis à jour, false sinon
     */
    updateUserRole(userId, newRole) {
        if (!this.isAdmin()) {
            this.log('Tentative non autorisée de modification de rôle', 'warn');
            return false;
        }
        
        try {
            const usersJson = localStorage.getItem('chaif-ses-users');
            if (!usersJson) return false;
            
            const users = JSON.parse(usersJson);
            const index = users.findIndex(u => u.id === userId);
            
            if (index !== -1) {
                users[index].role = newRole;
                localStorage.setItem('chaif-ses-users', JSON.stringify(users));
                this.log(`Rôle de l'utilisateur ID ${userId} mis à jour vers ${newRole}`);
                return true;
            }
            
            return false;
        } catch (error) {
            this.log(`Erreur lors de la mise à jour du rôle: ${error.message}`, 'error');
            return false;
        }
    }
}

// Créer et exporter une instance du gestionnaire d'authentification
const authManager = new Authentication();
export default authManager;