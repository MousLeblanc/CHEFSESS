/**
 * Gestionnaire de chargement lazy des scripts par onglet
 * Charge les scripts uniquement quand l'onglet correspondant est activé
 */

class LazyScriptLoader {
  constructor() {
    this.loadedScripts = new Set();
    this.loadingPromises = new Map();
    
    // Mapping des onglets vers leurs scripts requis
    this.tabScripts = {
      'menus': [
        'js/custom-menu-generator.js',
        'js/resident-utils.js',
        'js/ehpad-menu-calculator.js'
      ],
      'residents': [
        'js/resident-management.js'
      ],
      'recipe-generator': [
        'js/recipe-generator.js'
      ],
      'stock': [
        'js/stock-common.js'
      ],
      'suppliers': [
        'js/supplier-common.js',
        'js/order-tracking.js'
      ],
      'supplier-comparison': [
        'js/supplier-comparison.js'
      ],
      'foodcost': [
        'js/foodcost-manager.js'
      ],
      'settings': [
        // Pas de script spécifique, géré par ehpad-dashboard.js
      ]
    };
  }

  /**
   * Charge un script de manière asynchrone
   * @param {string} src - Chemin du script
   * @returns {Promise<void>}
   */
  async loadScript(src) {
    // Si déjà chargé, retourner immédiatement
    if (this.loadedScripts.has(src)) {
      return Promise.resolve();
    }

    // Si en cours de chargement, retourner la promesse existante
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    // Créer une nouvelle promesse de chargement
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      
      script.onload = () => {
        console.log(`✅ Script chargé: ${src}`);
        this.loadedScripts.add(src);
        this.loadingPromises.delete(src);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`❌ Erreur lors du chargement du script: ${src}`);
        this.loadingPromises.delete(src);
        reject(new Error(`Impossible de charger le script: ${src}`));
      };
      
      document.head.appendChild(script);
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  /**
   * Charge un script de type module
   * @param {string} src - Chemin du script
   * @returns {Promise<void>}
   */
  async loadModule(src) {
    // Si déjà chargé, retourner immédiatement
    if (this.loadedScripts.has(src)) {
      return Promise.resolve();
    }

    // Si en cours de chargement, retourner la promesse existante
    if (this.loadingPromises.has(src)) {
      return this.loadingPromises.get(src);
    }

    // Créer une nouvelle promesse de chargement
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.type = 'module';
      script.async = true;
      
      script.onload = () => {
        console.log(`✅ Module chargé: ${src}`);
        this.loadedScripts.add(src);
        this.loadingPromises.delete(src);
        resolve();
      };
      
      script.onerror = () => {
        console.error(`❌ Erreur lors du chargement du module: ${src}`);
        this.loadingPromises.delete(src);
        reject(new Error(`Impossible de charger le module: ${src}`));
      };
      
      document.head.appendChild(script);
    });

    this.loadingPromises.set(src, promise);
    return promise;
  }

  /**
   * Charge tous les scripts requis pour un onglet
   * @param {string} tabName - Nom de l'onglet
   * @returns {Promise<void>}
   */
  async loadTabScripts(tabName) {
    const scripts = this.tabScripts[tabName] || [];
    
    if (scripts.length === 0) {
      console.log(`📋 Onglet "${tabName}" n'a pas de scripts spécifiques à charger`);
      return Promise.resolve();
    }

    console.log(`📦 Chargement des scripts pour l'onglet "${tabName}"...`);
    
    const loadPromises = scripts.map(src => {
      // Vérifier si le script est déjà présent dans le HTML
      const existingScript = document.querySelector(`script[src="${src}"]`);
      if (existingScript) {
        // Script déjà présent dans le HTML, juste marquer comme chargé
        this.loadedScripts.add(src);
        return Promise.resolve();
      }
      
      // Détecter si c'est un module (fichiers qui étaient chargés en type="module")
      const isModule = src.includes('supplier-common.js') || 
                       src.includes('supplier-comparison.js') || 
                       src.includes('order-tracking.js') || 
                       src.includes('stock-common.js') ||
                       src.includes('resident-management.js');
      
      // Charger le script ou le module
      return isModule ? this.loadModule(src) : this.loadScript(src);
    });

    try {
      await Promise.all(loadPromises);
      console.log(`✅ Tous les scripts pour l'onglet "${tabName}" sont chargés`);
      
      // Initialiser le générateur de recettes si l'onglet recipe-generator est activé
      if (tabName === 'recipe-generator' && typeof window.initRecipeGenerator === 'function') {
        console.log('🔧 Initialisation du générateur de recettes...');
        window.initRecipeGenerator();
      }
    } catch (error) {
      console.error(`❌ Erreur lors du chargement des scripts pour l'onglet "${tabName}":`, error);
      throw error;
    }
  }

  /**
   * Marque un script comme déjà chargé (pour les scripts chargés dans le HTML)
   * @param {string} src - Chemin du script
   */
  markAsLoaded(src) {
    this.loadedScripts.add(src);
  }

  /**
   * Vérifie si un script est déjà chargé
   * @param {string} src - Chemin du script
   * @returns {boolean}
   */
  isLoaded(src) {
    return this.loadedScripts.has(src);
  }

  /**
   * Charge les scripts de l'onglet actif au démarrage
   * @returns {Promise<void>}
   */
  async loadActiveTabScripts() {
    // Trouver l'onglet actif
    const activeTabBtn = document.querySelector('.tab-btn.active');
    if (activeTabBtn) {
      const activeTab = activeTabBtn.dataset.tab;
      console.log(`📋 Chargement des scripts de l'onglet actif: "${activeTab}"`);
      await this.loadTabScripts(activeTab);
    }
  }
}

// Créer une instance globale
if (typeof window !== 'undefined') {
  window.lazyScriptLoader = new LazyScriptLoader();
  
  // Marquer les scripts déjà chargés dans le HTML
  document.addEventListener('DOMContentLoaded', () => {
    const existingScripts = document.querySelectorAll('script[src]');
    existingScripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src) {
        window.lazyScriptLoader.markAsLoaded(src);
      }
    });
    
    // Charger les scripts de l'onglet actif au démarrage
    window.lazyScriptLoader.loadActiveTabScripts().catch(error => {
      console.error('❌ Erreur lors du chargement des scripts de l\'onglet actif:', error);
    });
  });
}

export default LazyScriptLoader;

