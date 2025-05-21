/**
 * ChAIf SES - Code d'initialisation
 * 
 * Ce fichier initialise l'application ChAIf SES et configure les connexions
 * entre les différents modules (API, planification, etc.)
 */

// Configuration principale de l'application
const ChAIfSESConfig = {
  // Version de l'application
  version: '1.0.0',
  
  // Environnement (development, staging, production)
  environment: 'development',
  
  // Paramètres des API
  api: {
    // Configuration de l'API MarketMan
    marketman: {
      baseUrl: 'https://api.marketman.com/v2',
      apiKey: 'YOUR_MARKETMAN_API_KEY', // À remplacer par votre clé API
      enabled: false // À activer lorsque l'intégration sera prête
    },
    
    // Configuration de l'API Spoonacular
    spoonacular: {
      baseUrl: 'https://api.spoonacular.com',
      apiKey: 'YOUR_SPOONACULAR_API_KEY', // À remplacer par votre clé API
      enabled: false // À activer lorsque l'intégration sera prête
    }
  },
  
  // Paramètres de l'interface utilisateur
  ui: {
    // Thème (light, dark, system)
    theme: 'light',
    
    // Langue par défaut
    language: 'fr',
    
    // Nombre d'éléments par page
    itemsPerPage: 10,
    
    // Afficher les tutoriels pour les nouveaux utilisateurs
    showTutorials: true
  },
  
  // Paramètres de l'application
  app: {
    // Nombre de jours pour considérer un ingrédient comme expirant bientôt
    expiryWarningDays: 5,
    
    // Seuil de stock bas (pourcentage)
    lowStockThreshold: 20,
    
    // Catégories d'ingrédients
    ingredientCategories: [
      { id: 'meat', name: 'Viandes et Poissons' },
      { id: 'vegetables', name: 'Légumes' },
      { id: 'fruits', name: 'Fruits' },
      { id: 'dairy', name: 'Produits Laitiers' },
      { id: 'grains', name: 'Céréales et Féculents' },
      { id: 'spices', name: 'Épices et Condiments' }
    ],
    
    // Catégories de menus
    menuCategories: [
      { id: 'italian', name: 'Italienne' },
      { id: 'french', name: 'Française' },
      { id: 'mediterranean', name: 'Méditerranéenne' },
      { id: 'asian', name: 'Asiatique' },
      { id: 'american', name: 'Américaine' },
      { id: 'mexican', name: 'Mexicaine' },
      { id: 'vegetarian', name: 'Végétarienne' }
    ]
  }
};

/**
 * Classe d'initialisation de ChAIf SES
 */
class ChAIfSESInitializer {
  constructor(config) {
    this.config = config;
    this.modules = {};
  }
  
  /**
   * Initialise l'application
   */
  async initialize() {
    console.log(`Initialisation de ChAIf SES v${this.config.version} (${this.config.environment})`);
    
    try {
      // Démarrer l'indicateur de chargement
      this.showLoadingIndicator();
      
      // Initialiser les connexions aux API
      await this.initializeAPIs();
      
      // Initialiser les modules de l'application
      await this.initializeModules();
      
      // Initialiser l'interface utilisateur
      this.initializeUI();
      
      // Charger les données initiales
      await this.loadInitialData();
      
      // Vérifier les mises à jour de l'application
      this.checkForUpdates();
      
      // Cacher l'indicateur de chargement
      this.hideLoadingIndicator();
      
      // Afficher un message de bienvenue
      this.showWelcomeMessage();
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'initialisation de ChAIf SES:', error);
      this.handleInitializationError(error);
      return false;
    }
  }
  
  /**
   * Affiche l'indicateur de chargement
   */
  showLoadingIndicator() {
    // Créer l'élément overlay de chargement
    const loadingOverlay = document.createElement('div');
    loadingOverlay.className = 'loading-overlay';
    loadingOverlay.innerHTML = `
      <div class="loading-container">
        <div class="spinner"></div>
        <div class="loading-text">Chargement de ChAIf SES...</div>
      </div>
    `;
    
    // Ajouter les styles pour l'indicateur de chargement
    const style = document.createElement('style');
    style.textContent = `
      .loading-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(44, 62, 80, 0.8);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      
      .loading-container {
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        text-align: center;
      }
      
      .spinner {
        border: 4px solid rgba(0, 0, 0, 0.1);
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border-left-color: #e67e22;
        margin: 0 auto 1rem;
        animation: spin 1s linear infinite;
      }
      
      .loading-text {
        font-size: 1.2rem;
        color: #2c3e50;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(loadingOverlay);
  }
  
  /**
   * Cache l'indicateur de chargement
   */
  hideLoadingIndicator() {
    const loadingOverlay = document.querySelector('.loading-overlay');
    if (loadingOverlay) {
      // Ajouter une animation de fondu
      loadingOverlay.style.opacity = '0';
      loadingOverlay.style.transition = 'opacity 0.5s ease';
      
      // Supprimer l'élément après l'animation
      setTimeout(() => {
        loadingOverlay.remove();
      }, 500);
    }
  }
  
  /**
   * Initialise les connexions aux API externes
   */
  async initializeAPIs() {
    console.log('Initialisation des connexions aux API...');
    
    // Initialiser l'API ChAIf SES
    this.modules.api = {
      marketman: null,
      spoonacular: null
    };
    
    // Initialiser l'API MarketMan si activée
    if (this.config.api.marketman.enabled) {
      try {
        // Ici, nous simulons l'API MarketMan puisqu'elle n'est pas encore implémentée
        // Dans une implémentation réelle, vous importeriez le module
        // const { MarketManAPI } = await import('./api/marketman-api.js');
        this.modules.api.marketman = {
          getStockLevels: async () => [],
          getSuppliers: async () => [],
          placeOrder: async () => ({ success: true })
        };
        console.log('API MarketMan initialisée avec succès');
      } catch (error) {
        console.warn('Impossible d\'initialiser l\'API MarketMan:', error);
      }
    }
    
    // Initialiser l'API Spoonacular si activée
    if (this.config.api.spoonacular.enabled) {
      try {
        // Ici, nous simulons l'API Spoonacular puisqu'elle n'est pas encore implémentée
        // Dans une implémentation réelle, vous importeriez le module
        // const { SpoonacularAPI } = await import('./api/spoonacular-api.js');
        this.modules.api.spoonacular = {
          searchRecipes: async () => [],
          getRecipeDetails: async () => ({}),
          generateMealPlan: async () => ({})
        };
        console.log('API Spoonacular initialisée avec succès');
      } catch (error) {
        console.warn('Impossible d\'initialiser l\'API Spoonacular:', error);
      }
    }
    
    // Initialiser l'API ChAIf SES (wrapper pour les autres API)
    // Dans une implémentation réelle, vous importeriez le module
    // const { ChAIfSESAPI } = await import('./api/chaif-ses-api.js');
    this.modules.chaifSesApi = {
      // Méthodes simulées
      getWeeklyPlan: async () => ({}),
      getMenuHistory: async () => ([]),
      getMenuStats: async () => ({}),
      searchMenus: async () => ([]),
      generateMenu: async () => ({}),
      optimizeWeeklyPlan: async () => ({})
    };
    
    console.log('API ChAIf SES initialisée avec succès');
  }
  
  /**
   * Initialise les modules de l'application
   */
  async initializeModules() {
    console.log('Initialisation des modules de l\'application...');
    
    // Déterminer la page active
    const currentPage = this.getCurrentPage();
    
    // Initialiser le module approprié selon la page
    switch (currentPage) {
      case 'planning':
        await this.initializePlanningModule();
        break;
      case 'menu':
        await this.initializeMenuModule();
        break;
      case 'stock':
        await this.initializeStockModule();
        break;
      case 'suppliers':
        await this.initializeSuppliersModule();
        break;
      case 'accueil':
        await this.initializeHomeModule();
        break;
      case 'historique':
        await this.initializeHistoryModule();
        break;
      case 'profile':
        await this.initializeProfileModule();
        break;
      case 'login':
        await this.initializeLoginModule();
        break;
      case 'register':
        await this.initializeRegisterModule();
        break;
      default:
        await this.initializeDashboardModule();
    }
  }
  
  /**
   * Obtient le nom de la page actuelle
   * @returns {string} - Nom de la page
   */
  getCurrentPage() {
    const path = window.location.pathname;
    
    if (path.includes('planning.html')) {
      return 'planning';
    } else if (path.includes('menu.html')) {
      return 'menu';
    } else if (path.includes('stock.html')) {
      return 'stock';
    } else if (path.includes('fournisseurs.html')) {
      return 'suppliers';
    } else if (path.includes('accueil.html')) {
      return 'accueil';
    } else if (path.includes('historique.html')) {
      return 'historique';
    } else if (path.includes('profile.html')) {
      return 'profile';
    } else if (path.includes('login.html')) {
      return 'login';
    } else if (path.includes('register.html')) {
      return 'register';
    } else if (path.includes('settings.html')) {
      return 'settings';
    } else {
      return 'dashboard';
    }
  }
  
  /**
   * Initialise le module de planification des menus
   */
  async initializePlanningModule() {
    console.log('Initialisation du module de planification...');
    
    // NE PAS AJOUTER LES STYLES ICI - C'est ce qui causait l'erreur
    // Les styles seront gérés par planning.js directement
    
    try {
      // Dans une implémentation réelle, vous pourriez importer la classe MenuPlanner
      // const { MenuPlanner } = await import('./planning.js');
      
      // Nous utilisons ici la classe MenuPlanner globale qui est définie dans planning.js
      if (typeof MenuPlanner === 'function') {
        this.modules.menuPlanner = new MenuPlanner(this.modules.chaifSesApi);
        console.log('Module de planification initialisé avec succès');
      } else {
        console.warn('La classe MenuPlanner n\'est pas disponible. Initialisation du module de planification reportée.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du module de planification:', error);
    }
  }
  
  /**
   * Initialise le module de gestion des menus
   */
  async initializeMenuModule() {
    console.log('Initialisation du module de gestion des menus...');
    
    try {
      // Simuler l'initialisation du module de menus
      // Dans une implémentation réelle, vous pourriez importer ce module
      this.modules.menuManager = {
        // Fonctions simulées
        getMenuList: () => [],
        getMenuDetails: () => ({}),
        createMenu: () => ({})
      };
      console.log('Module de gestion des menus initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module de gestion des menus:', error);
    }
  }
  
  /**
   * Initialise le module de gestion des stocks
   */
  async initializeStockModule() {
    console.log('Initialisation du module de gestion des stocks...');
    
    try {
      // Simuler l'initialisation du module de stocks
      // Dans une implémentation réelle, vous pourriez importer ce module
      this.modules.stockManager = {
        // Fonctions simulées
        getStockList: () => [],
        getStockItem: () => ({}),
        updateStock: () => ({})
      };
      console.log('Module de gestion des stocks initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module de gestion des stocks:', error);
    }
  }
  
  /**
   * Initialise le module de gestion des fournisseurs
   */
  async initializeSuppliersModule() {
    console.log('Initialisation du module de gestion des fournisseurs...');
    
    try {
      // Simuler l'initialisation du module de fournisseurs
      // Dans une implémentation réelle, vous pourriez importer ce module
      this.modules.suppliersManager = {
        // Fonctions simulées
        getSuppliersList: () => [],
        getSupplierDetails: () => ({}),
        placeOrder: () => ({})
      };
      console.log('Module de gestion des fournisseurs initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module de gestion des fournisseurs:', error);
    }
  }
  
  /**
   * Initialise le module d'accueil
   */
  async initializeHomeModule() {
    console.log('Initialisation du module d\'accueil...');
    
    try {
      // Simuler l'initialisation du module d'accueil
      this.modules.homeManager = {
        // Fonctions simulées
        getDashboardData: () => ({})
      };
      console.log('Module d\'accueil initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module d\'accueil:', error);
    }
  }
  
  /**
   * Initialise le module d'historique
   */
  async initializeHistoryModule() {
    console.log('Initialisation du module d\'historique...');
    
    try {
      // Simuler l'initialisation du module d'historique
      this.modules.historyManager = {
        // Fonctions simulées
        getHistory: () => ([])
      };
      console.log('Module d\'historique initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module d\'historique:', error);
    }
  }
  
  /**
   * Initialise le module de profil
   */
  async initializeProfileModule() {
    console.log('Initialisation du module de profil...');
    
    try {
      // Simuler l'initialisation du module de profil
      this.modules.profileManager = {
        // Fonctions simulées
        getUserProfile: () => ({}),
        updateProfile: () => ({})
      };
      console.log('Module de profil initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module de profil:', error);
    }
  }
  
  /**
   * Initialise le module de connexion
   */
  async initializeLoginModule() {
    console.log('Initialisation du module de connexion...');
    
    try {
      // Simuler l'initialisation du module de connexion
      this.modules.authManager = {
        // Fonctions simulées
        login: () => ({}),
        logout: () => ({})
      };
      console.log('Module de connexion initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module de connexion:', error);
    }
  }
  
  /**
   * Initialise le module d'inscription
   */
  async initializeRegisterModule() {
    console.log('Initialisation du module d\'inscription...');
    
    try {
      // Simuler l'initialisation du module d'inscription
      this.modules.registerManager = {
        // Fonctions simulées
        register: () => ({})
      };
      console.log('Module d\'inscription initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module d\'inscription:', error);
    }
  }
  
  /**
   * Initialise le module de tableau de bord
   */
  async initializeDashboardModule() {
    console.log('Initialisation du module de tableau de bord...');
    
    try {
      // Simuler l'initialisation du module de tableau de bord
      this.modules.dashboard = {
        // Fonctions simulées
        getDashboardData: () => ({})
      };
      console.log('Module de tableau de bord initialisé avec succès');
    } catch (error) {
      console.warn('Impossible d\'initialiser le module de tableau de bord:', error);
    }
  }
  
  /**
   * Initialise l'interface utilisateur
   */
  initializeUI() {
    console.log('Initialisation de l\'interface utilisateur...');
    
    // Appliquer le thème
    this.applyTheme(this.config.ui.theme);
    
    // Initialiser les gestionnaires d'événements globaux
    this.initializeGlobalEventListeners();
    
    console.log('Interface utilisateur initialisée avec succès');
  }
  
  /**
   * Applique le thème sélectionné
   * @param {string} theme - Thème à appliquer (light, dark, system)
   */
  applyTheme(theme) {
    // Déterminer le thème à appliquer
    let appliedTheme = theme;
    
    if (theme === 'system') {
      // Utiliser le thème du système
      const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)').matches;
      appliedTheme = prefersDarkScheme ? 'dark' : 'light';
    }
    
    // Appliquer le thème
    document.documentElement.setAttribute('data-theme', appliedTheme);
    
    // Stocker le thème sélectionné
    localStorage.setItem('chaif-ses-theme', theme);
  }
  
  /**
   * Initialise les gestionnaires d'événements globaux
   */
  initializeGlobalEventListeners() {
    // Gestionnaire pour les notifications
    document.addEventListener('chaif-ses-notification', (event) => {
      const { message, type } = event.detail;
      this.showNotification(message, type);
    });
    
    // Gestionnaire pour les changements de thème
    document.addEventListener('chaif-ses-theme-change', (event) => {
      const { theme } = event.detail;
      this.applyTheme(theme);
    });
    
    // Gestionnaire pour les erreurs
    window.addEventListener('error', (event) => {
      console.error('Erreur non gérée:', event.error);
      this.showNotification('Une erreur est survenue. Veuillez rafraîchir la page.', 'error');
    });
    
    // Gestionnaire pour les clics sur le menu
    document.querySelectorAll('nav a').forEach(link => {
      link.addEventListener('click', (event) => {
        // Mettre à jour la classe active
        document.querySelectorAll('nav a').forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }
  
  /**
   * Charge les données initiales
   */
  async loadInitialData() {
    console.log('Chargement des données initiales...');
    
    // Simuler un délai de chargement
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('Données initiales chargées avec succès');
  }
  
  /**
   * Vérifie les mises à jour de l'application
   */
  checkForUpdates() {
    console.log('Vérification des mises à jour...');
    
    // Simuler la vérification des mises à jour
    setTimeout(() => {
      console.log('Aucune mise à jour disponible');
    }, 300);
  }
  
  /**
   * Affiche un message de bienvenue
   */
  showWelcomeMessage() {
    // Vérifier si c'est la première visite
    const isFirstVisit = !localStorage.getItem('chaif-ses-visited');
    
    if (isFirstVisit) {
      // Stocker l'information de visite
      localStorage.setItem('chaif-ses-visited', 'true');
      
      // Afficher un message de bienvenue pour les nouveaux utilisateurs
      this.showNotification('Bienvenue dans ChAIf SES ! Découvrez comment optimiser votre gestion de restaurant.', 'info', 5000);
      
      // Afficher un tutoriel si configuré
      if (this.config.ui.showTutorials) {
        setTimeout(() => {
          this.showTutorial();
        }, 2000);
      }
    } else {
      // Afficher un message de bienvenue pour les utilisateurs existants
      this.showNotification(`Bienvenue dans ChAIf SES v${this.config.version}`, 'success', 3000);
    }
  }
  
  /**
   * Affiche un tutoriel pour les nouveaux utilisateurs
   */
  showTutorial() {
    // Obtenir la page actuelle
    const currentPage = this.getCurrentPage();
    
    // Créer une modal pour le tutoriel
    const modal = document.createElement('div');
    modal.className = 'modal tutorial-modal';
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-container">
        <div class="tutorial-content">
          <h2>Bienvenue dans ChAIf SES</h2>
          <p>Découvrez comment ce système peut vous aider à optimiser votre gestion de restaurant.</p>
          
          <div class="tutorial-step active" data-step="1">
            <h3>Planification des Menus</h3>
            <p>Créez et organisez vos menus de manière intuitive. Utilisez l'IA pour générer des suggestions basées sur vos stocks et la saisonnalité des ingrédients.</p>
          </div>
          
          <div class="tutorial-step" data-step="2">
            <h3>Gestion des Stocks</h3>
            <p>Suivez vos inventaires en temps réel. Recevez des alertes pour les ingrédients en fin de stock ou proches de la date de péremption.</p>
          </div>
          
          <div class="tutorial-step" data-step="3">
            <h3>Analyses et Rapports</h3>
            <p>Obtenez des statistiques détaillées sur la popularité de vos plats, les coûts, et la saisonnalité de vos menus.</p>
          </div>
          
          <div class="tutorial-step" data-step="4">
            <h3>Commencez dès maintenant</h3>
            <p>Explorez l'application et découvrez toutes les fonctionnalités disponibles. N'hésitez pas à consulter l'aide si vous avez des questions.</p>
          </div>
          
          <div class="tutorial-navigation">
            <button id="prev-step" class="btn-secondary" disabled>Précédent</button>
            <div class="tutorial-indicators">
              <span class="indicator active" data-step="1"></span>
              <span class="indicator" data-step="2"></span>
              <span class="indicator" data-step="3"></span>
              <span class="indicator" data-step="4"></span>
            </div>
            <button id="next-step" class="btn-primary">Suivant</button>
          </div>
          
          <div class="tutorial-actions">
            <label>
              <input type="checkbox" id="dont-show-again">
              Ne plus afficher ce tutoriel
            </label>
            <button id="close-tutorial" class="btn-secondary">Fermer</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Initialiser les gestionnaires d'événements du tutoriel
    let currentStep = 1;
    const totalSteps = 4;
    
    const updateTutorialStep = (step) => {
      // Mettre à jour les étapes
      document.querySelectorAll('.tutorial-step').forEach(s => s.classList.remove('active'));
      document.querySelector(`.tutorial-step[data-step="${step}"]`).classList.add('active');
      
      // Mettre à jour les indicateurs
      document.querySelectorAll('.indicator').forEach(i => i.classList.remove('active'));
      document.querySelector(`.indicator[data-step="${step}"]`).classList.add('active');
      
      // Mettre à jour les boutons
      document.getElementById('prev-step').disabled = step === 1;
      
      if (step === totalSteps) {
        document.getElementById('next-step').textContent = 'Terminer';
      } else {
        document.getElementById('next-step').textContent = 'Suivant';
      }
    };
    
    // Gestionnaire pour le bouton Suivant
    document.getElementById('next-step').addEventListener('click', () => {
      if (currentStep < totalSteps) {
        currentStep++;
        updateTutorialStep(currentStep);
      } else {
        // Dernière étape, fermer le tutoriel
        document.body.removeChild(modal);
      }
    });
    
    // Gestionnaire pour le bouton Précédent
    document.getElementById('prev-step').addEventListener('click', () => {
      if (currentStep > 1) {
        currentStep--;
        updateTutorialStep(currentStep);
      }
    });
    
    // Gestionnaire pour le bouton Fermer
    document.getElementById('close-tutorial').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    // Gestionnaire pour la case à cocher "Ne plus afficher"
    document.getElementById('dont-show-again').addEventListener('change', (e) => {
      if (e.target.checked) {
        localStorage.setItem('chaif-ses-hide-tutorial', 'true');
      } else {
        localStorage.removeItem('chaif-ses-hide-tutorial');
      }
    });
    
    // Gestionnaire pour les clics sur les indicateurs
    document.querySelectorAll('.indicator').forEach(indicator => {
      indicator.addEventListener('click', () => {
        currentStep = parseInt(indicator.getAttribute('data-step'));
        updateTutorialStep(currentStep);
      });
    });
    
    // Gestionnaire pour la fermeture en cliquant sur l'overlay
    modal.querySelector('.modal-overlay').addEventListener('click', () => {
      document.body.removeChild(modal);
    });
  }
  
  /**
   * Affiche une notification
   * @param {string} message - Message à afficher
   * @param {string} type - Type de notification (success, error, warning, info)
   * @param {number} duration - Durée d'affichage en millisecondes (0 pour ne pas masquer)
   */
  showNotification(message, type = 'info', duration = 3000) {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-message">${message}</span>
        <button class="notification-close">&times;</button>
      </div>
    `;
    
    // Ajouter les styles pour les notifications si nécessaire
    if (!document.getElementById('notification-styles')) {
      const style = document.createElement('style');
      style.id = 'notification-styles';
      style.textContent = `
        .notification-container {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .notification {
          max-width: 400px;
          padding: 10px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          animation: slideIn 0.3s ease forwards;
        }
        
        .notification-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .notification-message {
          flex: 1;
          margin-right: 10px;
        }
        
        .notification-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          opacity: 0.5;
          transition: opacity 0.2s;
        }
        
        .notification-close:hover {
          opacity: 1;
        }
        
        .notification-success {
          background-color: #d4edda;
          color: #155724;
          border-left: 4px solid #28a745;
        }
        
        .notification-error {
          background-color: #f8d7da;
          color: #721c24;
          border-left: 4px solid #dc3545;
        }
        
        .notification-warning {
          background-color: #fff3cd;
          color: #856404;
          border-left: 4px solid #ffc107;
        }
        
        .notification-info {
          background-color: #d1ecf1;
          color: #0c5460;
          border-left: 4px solid #17a2b8;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
      `;
      
      document.head.appendChild(style);
    }
    
    // Créer le conteneur de notifications s'il n'existe pas
    let notificationContainer = document.querySelector('.notification-container');
    if (!notificationContainer) {
      notificationContainer = document.createElement('div');
      notificationContainer.className = 'notification-container';
      document.body.appendChild(notificationContainer);
    }
    
    // Ajouter la notification au conteneur
    notificationContainer.appendChild(notification);
    
    // Gestionnaire pour le bouton de fermeture
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
      this.closeNotification(notification);
    });
    
    // Masquer automatiquement après la durée spécifiée (si > 0)
    if (duration > 0) {
      setTimeout(() => {
        this.closeNotification(notification);
      }, duration);
    }
    
    return notification;
  }
  
  /**
   * Ferme une notification
   * @param {HTMLElement} notification - Élément de notification à fermer
   */
  closeNotification(notification) {
    // Ajouter l'animation de sortie
    notification.style.animation = 'slideOut 0.3s ease forwards';
    
    // Supprimer l'élément après l'animation
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
        
        // Supprimer le conteneur s'il est vide
        const container = document.querySelector('.notification-container');
        if (container && container.children.length === 0) {
          container.remove();
        }
      }
    }, 300);
  }
  
  /**
   * Gère les erreurs d'initialisation
   * @param {Error} error - Erreur survenue
   */
  handleInitializationError(error) {
    // Cacher l'indicateur de chargement
    this.hideLoadingIndicator();
    
    // Afficher un message d'erreur
    const errorMessage = `
      <div class="error-container">
        <h2>Erreur d'initialisation</h2>
        <p>Une erreur est survenue lors de l'initialisation de ChAIf SES :</p>
        <pre class="error-details">${error.message}</pre>
        <button id="retry-init" class="btn-primary">Réessayer</button>
      </div>
    `;
    
    const errorElement = document.createElement('div');
    errorElement.className = 'error-overlay';
    errorElement.innerHTML = errorMessage;
    
    // Ajouter les styles pour l'erreur
    const style = document.createElement('style');
    style.textContent = `
      .error-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(44, 62, 80, 0.9);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 9999;
      }
      
      .error-container {
        background-color: white;
        padding: 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
        text-align: center;
        max-width: 80%;
      }
      
      .error-details {
        background-color: #f8d7da;
        color: #721c24;
        padding: 1rem;
        border-radius: 4px;
        margin: 1rem 0;
        text-align: left;
        overflow-x: auto;
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(errorElement);
    
    // Gestionnaire pour le bouton Réessayer
    document.getElementById('retry-init').addEventListener('click', () => {
      // Supprimer le message d'erreur
      document.body.removeChild(errorElement);
      
      // Réessayer l'initialisation
      this.initialize();
    });
    
    // Enregistrer l'erreur dans la console
    console.error('Erreur d\'initialisation:', error);
  }
}

// Initialiser l'application au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
  const initializer = new ChAIfSESInitializer(ChAIfSESConfig);
  initializer.initialize()
    .then(success => {
      if (success) {
        console.log('ChAIf SES initialisé avec succès');
      } else {
        console.error('Échec de l\'initialisation de ChAIf SES');
      }
    });
});

// Exposer l'initializer et la configuration globalement (utile pour le débogage et les scripts externes)
window.ChAIfSESInitializer = ChAIfSESInitializer;
window.chaifSesConfig = ChAIfSESConfig;