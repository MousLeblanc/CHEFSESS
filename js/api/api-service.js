/**
 * ChAIf SES - Service API 
 * Ce fichier contient les fonctions d'accès aux API externes et internes.
 * Il propose deux modes:
 * - Mode simulation: utilise des données fictives pour le développement
 * - Mode production: se connecte aux API réelles
 */

// Configuration de l'environnement (à placer dans un fichier de config en production)
// Mode de fonctionnement: 'simulation' ou 'production'

const API_CONFIG = {
    
    mode: 'simulation',
    
    // Configuration des API externes
    endpoints: {
        marketman: {
            baseUrl: 'https://api.marketman.com/v1',
            apiKey: 'YOUR_MARKETMAN_API_KEY'
        },
        spoonacular: {
            baseUrl: 'https://api.spoonacular.com',
            apiKey: 'YOUR_SPOONACULAR_API_KEY'
        }
    },
    
    // Paramètres de simulation
    simulation: {
        // Délai de réponse simulé (en ms)
        delay: {
            min: 300,
            max: 800
        },
        // Probabilité d'erreur simulée (0-1)
        errorRate: 0.05
    }
};

/**
 * Classe principale pour l'accès aux API
 */
class ApiService {
    constructor(config = API_CONFIG) {
        this.config = config;
        this.simulationData = {}; // Données de simulation
        
        // Initialiser les données de simulation
        if (this.config.mode === 'simulation') {
            this._initSimulationData();
        }
        
        // Exposer les services spécifiques
        this.inventory = new InventoryService(this);
        this.menu = new MenuService(this);
        this.supplier = new SupplierService(this);
        this.planning = new PlanningService(this);
    }
    
    /**
     * Effectue une requête API
     * @param {string} endpoint - Point d'entrée de l'API
     * @param {string} method - Méthode HTTP (GET, POST, PUT, DELETE)
     * @param {Object} data - Données à envoyer
     * @param {Object} options - Options supplémentaires
     * @returns {Promise} - Promesse résolue avec la réponse
     */
    async request(endpoint, method = 'GET', data = null, options = {}) {
        // En mode simulation, utiliser des données simulées
        if (this.config.mode === 'simulation') {
            return this._simulateRequest(endpoint, method, data, options);
        }
        
        // En mode production, effectuer une vraie requête API
        return this._realRequest(endpoint, method, data, options);
    }
    
    /**
     * Simule une requête API avec les données locales
     * @private
     */
    async _simulateRequest(endpoint, method, data, options) {
        // Simuler un délai réseau aléatoire
        const delay = Math.floor(
            Math.random() * 
            (this.config.simulation.delay.max - this.config.simulation.delay.min) + 
            this.config.simulation.delay.min
        );
        
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Simuler une erreur aléatoire
        if (Math.random() < this.config.simulation.errorRate) {
            throw {
                status: 500,
                message: 'Erreur serveur simulée',
                details: 'Cette erreur est générée aléatoirement pour simuler des problèmes réseau'
            };
        }
        
        // Traitement de la demande
        const [resource, action] = endpoint.split('/');
        
        // Vérifier si la ressource existe
        if (!this.simulationData[resource]) {
            throw {
                status: 404,
                message: `Ressource non trouvée: ${resource}`,
                details: `La ressource "${resource}" n'existe pas dans la simulation`
            };
        }
        
        // Gérer les différentes méthodes HTTP
        switch (method) {
            case 'GET':
                return this._handleSimulatedGet(resource, action, data);
            case 'POST':
                return this._handleSimulatedPost(resource, action, data);
            case 'PUT':
                return this._handleSimulatedPut(resource, action, data);
            case 'DELETE':
                return this._handleSimulatedDelete(resource, action, data);
            default:
                throw {
                    status: 405,
                    message: `Méthode non supportée: ${method}`,
                    details: 'Les méthodes supportées sont GET, POST, PUT et DELETE'
                };
        }
    }
    
    /**
     * Gère les requêtes GET simulées
     * @private
     */
    _handleSimulatedGet(resource, action, params) {
        // Obtenir une copie des données pour cette ressource
        const resourceData = JSON.parse(JSON.stringify(this.simulationData[resource]));
        
        // Si une action spécifique est demandée
        if (action) {
            // Récupérer un élément par ID
            if (action.match(/^\d+$/)) {
                const id = parseInt(action);
                const item = resourceData.find(item => item.id === id);
                
                if (!item) {
                    throw {
                        status: 404,
                        message: `Item non trouvé: ${id}`,
                        details: `Aucun élément avec l'ID ${id} dans la ressource ${resource}`
                    };
                }
                
                return { data: item };
            }
            
            // Actions spéciales
            switch(action) {
                case 'search':
                    return this._handleSimulatedSearch(resource, params);
                default:
                    throw {
                        status: 400,
                        message: `Action non supportée: ${action}`,
                        details: `L'action "${action}" n'est pas supportée pour la ressource ${resource}`
                    };
            }
        }
        
        // Appliquer les filtres si des paramètres sont fournis
        let filteredData = resourceData;
        
        if (params) {
            // Filtrer selon les paramètres
            Object.entries(params).forEach(([key, value]) => {
                // Ignorer les paramètres de pagination
                if (['page', 'limit', 'sort'].includes(key)) return;
                
                filteredData = filteredData.filter(item => {
                    // Support pour les valeurs multiples (,)
                    if (typeof value === 'string' && value.includes(',')) {
                        const values = value.split(',');
                        return values.includes(String(item[key]));
                    }
                    
                    return String(item[key]) === String(value);
                });
            });
            
            // Tri des résultats
            if (params.sort) {
                const [field, direction] = params.sort.split(':');
                const sortDir = direction === 'desc' ? -1 : 1;
                
                filteredData.sort((a, b) => {
                    if (a[field] < b[field]) return -1 * sortDir;
                    if (a[field] > b[field]) return 1 * sortDir;
                    return 0;
                });
            }
            
            // Pagination
            if (params.page && params.limit) {
                const page = parseInt(params.page) || 1;
                const limit = parseInt(params.limit) || 20;
                const startIndex = (page - 1) * limit;
                const endIndex = page * limit;
                
                // Données pour la pagination
                const paginationInfo = {
                    total: filteredData.length,
                    page: page,
                    limit: limit,
                    totalPages: Math.ceil(filteredData.length / limit)
                };
                
                // Couper les données selon la pagination
                filteredData = filteredData.slice(startIndex, endIndex);
                
                return {
                    data: filteredData,
                    pagination: paginationInfo
                };
            }
        }
        
        // Retourner les données filtrées
        return { data: filteredData };
    }
    
    /**
     * Gère les requêtes POST simulées
     * @private
     */
    _handleSimulatedPost(resource, action, data) {
        // Vérifier que les données sont fournies
        if (!data) {
            throw {
                status: 400,
                message: 'Données manquantes',
                details: 'Une requête POST nécessite des données'
            };
        }
        
        // Créer un nouvel élément
        const newItem = { ...data };
        
        // Générer un ID unique
        const maxId = Math.max(...this.simulationData[resource].map(item => item.id), 0);
        newItem.id = maxId + 1;
        
        // Ajouter les timestamps
        newItem.createdAt = new Date().toISOString();
        newItem.updatedAt = new Date().toISOString();
        
        // Ajouter à la collection
        this.simulationData[resource].push(newItem);
        
        return { 
            data: newItem,
            message: 'Élément créé avec succès'
        };
    }
    
    /**
     * Gère les requêtes PUT simulées
     * @private
     */
    _handleSimulatedPut(resource, action, data) {
        // Vérifier que l'ID est fourni
        if (!action || !action.match(/^\d+$/)) {
            throw {
                status: 400,
                message: 'ID manquant',
                details: 'Une requête PUT nécessite un ID dans l\'URL'
            };
        }
        
        // Vérifier que les données sont fournies
        if (!data) {
            throw {
                status: 400,
                message: 'Données manquantes',
                details: 'Une requête PUT nécessite des données'
            };
        }
        
        const id = parseInt(action);
        const index = this.simulationData[resource].findIndex(item => item.id === id);
        
        // Vérifier que l'élément existe
        if (index === -1) {
            throw {
                status: 404,
                message: `Item non trouvé: ${id}`,
                details: `Aucun élément avec l'ID ${id} dans la ressource ${resource}`
            };
        }
        
        // Mettre à jour l'élément
        const updatedItem = {
            ...this.simulationData[resource][index],
            ...data,
            id: id, // S'assurer que l'ID ne change pas
            updatedAt: new Date().toISOString()
        };
        
        this.simulationData[resource][index] = updatedItem;
        
        return { 
            data: updatedItem,
            message: 'Élément mis à jour avec succès'
        };
    }
    
    /**
     * Gère les requêtes DELETE simulées
     * @private
     */
    _handleSimulatedDelete(resource, action) {
        // Vérifier que l'ID est fourni
        if (!action || !action.match(/^\d+$/)) {
            throw {
                status: 400,
                message: 'ID manquant',
                details: 'Une requête DELETE nécessite un ID dans l\'URL'
            };
        }
        
        const id = parseInt(action);
        const index = this.simulationData[resource].findIndex(item => item.id === id);
        
        // Vérifier que l'élément existe
        if (index === -1) {
            throw {
                status: 404,
                message: `Item non trouvé: ${id}`,
                details: `Aucun élément avec l'ID ${id} dans la ressource ${resource}`
            };
        }
        
        // Supprimer l'élément
        const deletedItem = this.simulationData[resource][index];
        this.simulationData[resource].splice(index, 1);
        
        return { 
            data: deletedItem,
            message: 'Élément supprimé avec succès'
        };
    }
    
    /**
     * Gère les recherches simulées
     * @private
     */
    _handleSimulatedSearch(resource, params) {
        if (!params || !params.q) {
            throw {
                status: 400,
                message: 'Terme de recherche manquant',
                details: 'Le paramètre "q" est requis pour la recherche'
            };
        }
        
        const searchTerm = params.q.toLowerCase();
        const resourceData = JSON.parse(JSON.stringify(this.simulationData[resource]));
        
        // Recherche simple dans tous les champs
        const results = resourceData.filter(item => {
            return Object.values(item).some(value => {
                if (typeof value === 'string') {
                    return value.toLowerCase().includes(searchTerm);
                }
                return false;
            });
        });
        
        return { 
            data: results,
            count: results.length
        };
    }
    
    /**
     * Effectue une requête API réelle
     * @private
     */
    async _realRequest(endpoint, method, data, options) {
        // Déterminer l'API à utiliser (marketman, spoonacular ou API interne)
        let apiBase, apiKey;
        
        if (endpoint.startsWith('marketman/')) {
            apiBase = this.config.endpoints.marketman.baseUrl;
            apiKey = this.config.endpoints.marketman.apiKey;
            endpoint = endpoint.replace('marketman/', '');
        } else if (endpoint.startsWith('spoonacular/')) {
            apiBase = this.config.endpoints.spoonacular.baseUrl;
            apiKey = this.config.endpoints.spoonacular.apiKey;
            endpoint = endpoint.replace('spoonacular/', '');
        } else {
            // API interne
            apiBase = '/api';
            apiKey = null;
        }
        
        // Construire l'URL complète
        let url = `${apiBase}/${endpoint}`;
        
        // Ajouter les paramètres GET à l'URL
        if (method === 'GET' && data) {
            const params = new URLSearchParams();
            
            for (const key in data) {
                if (data.hasOwnProperty(key)) {
                    params.append(key, data[key]);
                }
            }
            
            // Ajouter la clé API si nécessaire
            if (apiKey) {
                params.append('apiKey', apiKey);
            }
            
            url = `${url}?${params.toString()}`;
        }
        
        // Options de la requête
        const fetchOptions = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                ...options.headers
            }
        };
        
        // Ajouter la clé API dans les en-têtes si nécessaire et si pas en GET
        if (apiKey && method !== 'GET') {
            fetchOptions.headers['X-Api-Key'] = apiKey;
        }
        
        // Ajouter le corps de la requête pour les méthodes non-GET
        if (method !== 'GET' && data) {
            fetchOptions.body = JSON.stringify(data);
        }
        
        try {
            // Effectuer la requête
            const response = await fetch(url, fetchOptions);
            const responseData = await response.json();
            
            // Vérifier si la réponse est en erreur
            if (!response.ok) {
                throw {
                    status: response.status,
                    message: responseData.message || 'Erreur API',
                    details: responseData.details || responseData
                };
            }
            
            return responseData;
        } catch (error) {
            // Améliorer le message d'erreur
            if (!error.status) {
                error = {
                    status: 0,
                    message: 'Erreur de connexion',
                    details: error.message || 'Impossible de se connecter à l\'API'
                };
            }
            
            throw error;
        }
    }
    
    /**
     * Initialise les données de simulation
     * @private
     */
    _initSimulationData() {
        // Charger les données simulées pour chaque ressource
        this.simulationData = {
            // Inventaire/Stocks
            inventory: generateMockInventory(),
            
            // Menus
            menus: generateMockMenus(),
            
            // Fournisseurs
            suppliers: generateMockSuppliers(),
            
            // Planning
            planning: generateMockPlanning()
        };
    }
}

/**
 * Service pour la gestion de l'inventaire
 */
class InventoryService {
    constructor(apiService) {
        this.api = apiService;
    }
    
    /**
     * Récupère la liste des produits en stock
     * @param {Object} params - Paramètres de filtrage et pagination
     * @returns {Promise} - Liste des produits
     */
    async getProducts(params = {}) {
        return this.api.request('inventory', 'GET', params);
    }
    
    /**
     * Récupère un produit par son ID
     * @param {number} id - ID du produit
     * @returns {Promise} - Détails du produit
     */
    async getProductById(id) {
        return this.api.request(`inventory/${id}`, 'GET');
    }
    
    /**
     * Ajoute un produit à l'inventaire
     * @param {Object} productData - Données du produit
     * @returns {Promise} - Produit créé
     */
    async addProduct(productData) {
        return this.api.request('inventory', 'POST', productData);
    }
    
    /**
     * Met à jour un produit
     * @param {number} id - ID du produit
     * @param {Object} productData - Données à mettre à jour
     * @returns {Promise} - Produit mis à jour
     */
    async updateProduct(id, productData) {
        return this.api.request(`inventory/${id}`, 'PUT', productData);
    }
    
    /**
     * Supprime un produit
     * @param {number} id - ID du produit
     * @returns {Promise} - Résultat de la suppression
     */
    async deleteProduct(id) {
        return this.api.request(`inventory/${id}`, 'DELETE');
    }
    
    /**
     * Récupère les mouvements de stock
     * @param {Object} params - Paramètres de filtrage et pagination
     * @returns {Promise} - Liste des mouvements
     */
    async getMovements(params = {}) {
        return this.api.request('inventory/movements', 'GET', params);
    }
    
    /**
     * Enregistre un mouvement de stock
     * @param {Object} movementData - Données du mouvement
     * @returns {Promise} - Mouvement créé
     */
    async addMovement(movementData) {
        return this.api.request('inventory/movements', 'POST', movementData);
    }
    
    /**
     * Récupère les alertes de stock
     * @param {Object} params - Paramètres de filtrage
     * @returns {Promise} - Liste des alertes
     */
    async getAlerts(params = {}) {
        return this.api.request('inventory/alerts', 'GET', params);
    }
}

/**
 * Service pour la gestion des menus
 */
class MenuService {
    constructor(apiService) {
        this.api = apiService;
    }
    
    /**
     * Récupère la liste des menus
     * @param {Object} params - Paramètres de filtrage et pagination
     * @returns {Promise} - Liste des menus
     */
    async getMenus(params = {}) {
        return this.api.request('menus', 'GET', params);
    }
    
    /**
     * Récupère un menu par son ID
     * @param {number} id - ID du menu
     * @returns {Promise} - Détails du menu
     */
    async getMenuById(id) {
        return this.api.request(`menus/${id}`, 'GET');
    }
    
    /**
     * Crée un nouveau menu
     * @param {Object} menuData - Données du menu
     * @returns {Promise} - Menu créé
     */
    async createMenu(menuData) {
        return this.api.request('menus', 'POST', menuData);
    }
    
    /**
     * Met à jour un menu
     * @param {number} id - ID du menu
     * @param {Object} menuData - Données à mettre à jour
     * @returns {Promise} - Menu mis à jour
     */
    async updateMenu(id, menuData) {
        return this.api.request(`menus/${id}`, 'PUT', menuData);
    }
    
    /**
     * Supprime un menu
     * @param {number} id - ID du menu
     * @returns {Promise} - Résultat de la suppression
     */
    async deleteMenu(id) {
        return this.api.request(`menus/${id}`, 'DELETE');
    }
    
    /**
     * Récupère les catégories de menu
     * @returns {Promise} - Liste des catégories
     */
    async getCategories() {
        return this.api.request('menus/categories', 'GET');
    }
    
    /**
     * Crée une nouvelle catégorie
     * @param {Object} categoryData - Données de la catégorie
     * @returns {Promise} - Catégorie créée
     */
    async createCategory(categoryData) {
        return this.api.request('menus/categories', 'POST', categoryData);
    }
    
    /**
     * Recherche des recettes via Spoonacular
     * @param {Object} params - Paramètres de recherche
     * @returns {Promise} - Résultats de la recherche
     */
    async searchRecipes(params) {
        return this.api.request('spoonacular/recipes/complexSearch', 'GET', params);
    }
    
    /**
     * Obtient les informations détaillées d'une recette via Spoonacular
     * @param {number} id - ID de la recette
     * @param {Object} params - Paramètres additionnels
     * @returns {Promise} - Détails de la recette
     */
    async getRecipeInformation(id, params = {}) {
        return this.api.request(`spoonacular/recipes/${id}/information`, 'GET', params);
    }
}

/**
 * Service pour la gestion des fournisseurs
 */
class SupplierService {
    constructor(apiService) {
        this.api = apiService;
    }
    
    /**
     * Récupère la liste des fournisseurs
     * @param {Object} params - Paramètres de filtrage et pagination
     * @returns {Promise} - Liste des fournisseurs
     */
    async getSuppliers(params = {}) {
        return this.api.request('suppliers', 'GET', params);
    }
    
    /**
     * Récupère un fournisseur par son ID
     * @param {number} id - ID du fournisseur
     * @returns {Promise} - Détails du fournisseur
     */
    async getSupplierById(id) {
        return this.api.request(`suppliers/${id}`, 'GET');
    }
    
    /**
     * Ajoute un nouveau fournisseur
     * @param {Object} supplierData - Données du fournisseur
     * @returns {Promise} - Fournisseur créé
     */
    async addSupplier(supplierData) {
        return this.api.request('suppliers', 'POST', supplierData);
    }
    
    /**
     * Met à jour un fournisseur
     * @param {number} id - ID du fournisseur
     * @param {Object} supplierData - Données à mettre à jour
     * @returns {Promise} - Fournisseur mis à jour
     */
    async updateSupplier(id, supplierData) {
        return this.api.request(`suppliers/${id}`, 'PUT', supplierData);
    }
    
    /**
     * Supprime un fournisseur
     * @param {number} id - ID du fournisseur
     * @returns {Promise} - Résultat de la suppression
     */
    async deleteSupplier(id) {
        return this.api.request(`suppliers/${id}`, 'DELETE');
    }
    
    /**
     * Récupère les commandes
     * @param {Object} params - Paramètres de filtrage et pagination
     * @returns {Promise} - Liste des commandes
     */
    async getOrders(params = {}) {
        return this.api.request('suppliers/orders', 'GET', params);
    }
    
    /**
     * Récupère une commande par son ID
     * @param {number} id - ID de la commande
     * @returns {Promise} - Détails de la commande
     */
    async getOrderById(id) {
        return this.api.request(`suppliers/orders/${id}`, 'GET');
    }
    
    /**
     * Crée une nouvelle commande
     * @param {Object} orderData - Données de la commande
     * @returns {Promise} - Commande créée
     */
    async createOrder(orderData) {
        return this.api.request('suppliers/orders', 'POST', orderData);
    }
    
    /**
     * Met à jour le statut d'une commande
     * @param {number} id - ID de la commande
     * @param {Object} statusData - Données de statut
     * @returns {Promise} - Commande mise à jour
     */
    async updateOrderStatus(id, statusData) {
        return this.api.request(`suppliers/orders/${id}/status`, 'PUT', statusData);
    }
    
    /**
     * Récupère le catalogue d'un fournisseur
     * @param {number} supplierId - ID du fournisseur
     * @param {Object} params - Paramètres de filtrage
     * @returns {Promise} - Catalogue du fournisseur
     */
    async getSupplierCatalog(supplierId, params = {}) {
        return this.api.request(`suppliers/${supplierId}/catalog`, 'GET', params);
    }
    
    /**
     * Récupère les données MarketMan (en mode production seulement)
     * @param {string} endpoint - Point d'entrée MarketMan
     * @param {Object} params - Paramètres de requête
     * @returns {Promise} - Données MarketMan
     */
    async getMarketManData(endpoint, params = {}) {
        return this.api.request(`marketman/${endpoint}`, 'GET', params);
    }
}

/**
 * Service pour la gestion du planning
 */
class PlanningService {
    constructor(apiService) {
        this.api = apiService;
    }
    
    /**
     * Récupère le planning pour une période donnée
     * @param {string} startDate - Date de début (YYYY-MM-DD)
     * @param {string} endDate - Date de fin (YYYY-MM-DD)
     * @param {Object} params - Paramètres additionnels
     * @returns {Promise} - Planning pour la période
     */
    async getPlanningByPeriod(startDate, endDate, params = {}) {
        return this.api.request('planning', 'GET', {
            startDate,
            endDate,
            ...params
        });
    }
    
    /**
     * Récupère un élément du planning par son ID
     * @param {number} id - ID de l'élément
     * @returns {Promise} - Détails de l'élément
     */
    async getPlanningItemById(id) {
        return this.api.request(`planning/${id}`, 'GET');
    }
    
    /**
     * Ajoute un élément au planning
     * @param {Object} planningData - Données de l'élément
     * @returns {Promise} - Élément créé
     */
    async addPlanningItem(planningData) {
        return this.api.request('planning', 'POST', planningData);
    }
    
    /**
     * Met à jour un élément du planning
     * @param {number} id - ID de l'élément
     * @param {Object} planningData - Données à mettre à jour
     * @returns {Promise} - Élément mis à jour
     */
    async updatePlanningItem(id, planningData) {
        return this.api.request(`planning/${id}`, 'PUT', planningData);
    }
    
    /**
     * Supprime un élément du planning
     * @param {number} id - ID de l'élément
     * @returns {Promise} - Résultat de la suppression
     */
    async deletePlanningItem(id) {
        return this.api.request(`planning/${id}`, 'DELETE');
    }
    
    /**
     * Génère un planning automatique
     * @param {string} startDate - Date de début (YYYY-MM-DD)
     * @param {string} endDate - Date de fin (YYYY-MM-DD)
     * @param {Object} options - Options de génération
     * @returns {Promise} - Planning généré
     */
    async generatePlanning(startDate, endDate, options = {}) {
        return this.api.request('planning/generate', 'POST', {
            startDate,
            endDate,
            ...options
        });
    }
    
    /**
     * Récupère l'historique des menus utilisés
     * @param {Object} params - Paramètres de filtrage et pagination
     * @returns {Promise} - Historique des menus
     */
    async getMenuHistory(params = {}) {
        return this.api.request('planning/history', 'GET', params);
    }
    
    /**
     * Récupère les statistiques d'utilisation
     * @param {string} period - Période (week, month, quarter, year)
     * @param {Object} params - Paramètres additionnels
     * @returns {Promise} - Statistiques
     */
    async getUsageStats(period = 'month', params = {}) {
        return this.api.request('planning/stats', 'GET', {
            period,
            ...params
        });
    }
}

// =================================================================
// GÉNÉRATION DE DONNÉES SIMULÉES
// =================================================================

/**
 * Génère des données d'inventaire simulées
 */
function generateMockInventory() {
    const products = [
        {
            id: 1,
            name: 'Tomates Bio',
            category: 'fruits-legumes',
            quantity: 28,
            unit: 'kg',
            minStock: 10,
            maxStock: 50,
            price: 2.5,
            supplier_id: 1,
            expiryDate: '2025-05-25',
            status: 'ok', // ok, warning, danger
            createdAt: '2025-05-01T10:00:00Z',
            updatedAt: '2025-05-10T14:30:00Z'
        },
        {
            id: 2,
            name: 'Filet de Bœuf',
            category: 'viande',
            quantity: 5.2,
            unit: 'kg',
            minStock: 8,
            maxStock: 20,
            price: 32.9,
            supplier_id: 2,
            expiryDate: '2025-05-22',
            status: 'warning',
            createdAt: '2025-05-02T09:15:00Z',
            updatedAt: '2025-05-12T11:20:00Z'
        },
        {
            id: 3,
            name: 'Saumon Frais',
            category: 'poisson',
            quantity: 1.8,
            unit: 'kg',
            minStock: 5,
            maxStock: 15,
            price: 29.9,
            supplier_id: 3,
            expiryDate: '2025-05-20',
            status: 'danger',
            createdAt: '2025-05-03T14:45:00Z',
            updatedAt: '2025-05-15T16:10:00Z'
        },
        {
            id: 4,
            name: 'Pommes de Terre',
            category: 'fruits-legumes',
            quantity: 45,
            unit: 'kg',
            minStock: 20,
            maxStock: 80,
            price: 1.2,
            supplier_id: 1,
            expiryDate: '2025-06-05',
            status: 'ok',
            createdAt: '2025-05-01T11:30:00Z',
            updatedAt: '2025-05-11T09:45:00Z'
        },
        {
            id: 5,
            name: 'Huile d\'Olive Extra Vierge',
            category: 'epicerie',
            quantity: 12,
            unit: 'L',
            minStock: 8,
            maxStock: 25,
            price: 9.9,
            supplier_id: 4,
            expiryDate: '2025-12-12',
            status: 'ok',
            createdAt: '2025-04-15T10:20:00Z',
            updatedAt: '2025-05-05T15:40:00Z'
        },
        {
            id: 6,
            name: 'Champignons de Paris',
            category: 'fruits-legumes',
            quantity: 4.5,
            unit: 'kg',
            minStock: 6,
            maxStock: 15,
            price: 4.5,
            supplier_id: 1,
            expiryDate: '2025-05-21',
            status: 'warning',
            createdAt: '2025-05-10T08:50:00Z',
            updatedAt: '2025-05-16T13:30:00Z'
        }
    ];
    
    // Générer des mouvements de stock
    const movements = [
        {
            id: 1,
            product_id: 1,
            type: 'in', // in, out, adjustment
            quantity: 10,
            date: '2025-05-19T09:15:00Z',
            user: 'Sophie Martin',
            note: 'Livraison PrimeurPro'
        },
        {
            id: 2,
            product_id: 2,
            type: 'out',
            quantity: 5,
            date: '2025-05-18T14:30:00Z',
            user: 'Marc Dubois',
            note: 'Préparation service du soir'
        },
        {
            id: 3,
            product_id: 3,
            type: 'out',
            quantity: 2.5,
            date: '2025-05-17T11:45:00Z',
            user: 'Julien Leroy',
            note: 'Préparation service du midi'
        },
        {
            id: 4,
            product_id: 4,
            type: 'adjustment',
            quantity: -2,
            date: '2025-05-17T08:00:00Z',
            user: 'Lucie Bernard',
            note: 'Correction inventaire'
        },
        {
            id: 5,
            product_id: 3,
            type: 'in',
            quantity: 8,
            date: '2025-05-16T16:20:00Z',
            user: 'Thomas Petit',
            note: 'Livraison OcéanFrais'
        }
    ];
    
    // Générer des alertes
    const alerts = [
        {
            id: 1,
            product_id: 3,
            type: 'low_stock',
            status: 'pending', // pending, in-progress, resolved
            priority: 'high', // high, medium, low
            message: 'Le niveau de stock est inférieur au seuil critique. Une commande urgente est recommandée.',
            createdAt: '2025-05-19T08:45:00Z'
        },
        {
            id: 2,
            product_id: 2,
            type: 'low_stock',
            status: 'in-progress',
            priority: 'medium',
            message: 'Le niveau de stock est inférieur au seuil d\'alerte. Pensez à réapprovisionner prochainement.',
            createdAt: '2025-05-19T05:30:00Z'
        },
        {
            id: 3,
            product_id: 6,
            type: 'low_stock',
            status: 'pending',
            priority: 'medium',
            message: 'Le niveau de stock est inférieur au seuil d\'alerte. Pensez à réapprovisionner prochainement.',
            createdAt: '2025-05-19T02:15:00Z'
        },
        {
            id: 4,
            product_id: 8, // Produit qui n'existe plus dans les données simulées
            type: 'expiration',
            status: 'resolved',
            priority: 'low',
            message: 'Ce produit expire bientôt. Utilisez-le en priorité ou vérifiez sa qualité.',
            createdAt: '2025-05-18T12:00:00Z'
        }
    ];
    
    return [...products, ...movements, ...alerts];
}

/**
 * Génère des données de menu simulées
 */
function generateMockMenus() {
    const menus = [
        {
            id: 1001,
            title: 'Risotto aux Champignons',
            category: 'plat',
            price: 12.5,
            description: 'Un risotto crémeux aux champignons, parfait pour un déjeuner élégant.',
            ingredients: [
                {id: 6, name: 'Champignons de Paris', quantity: 0.25, unit: 'kg'},
                {id: 101, name: 'Riz Arborio', quantity: 0.1, unit: 'kg'},
                {id: 102, name: 'Parmesan', quantity: 0.05, unit: 'kg'},
                {id: 103, name: 'Oignon', quantity: 1, unit: 'pièce'},
                {id: 104, name: 'Bouillon de Légumes', quantity: 0.5, unit: 'L'},
                {id: 5, name: 'Huile d\'Olive Extra Vierge', quantity: 0.02, unit: 'L'}
            ],
            tags: ['Végétarien', 'Sans gluten'],
            rating: 4.8,
            image: 'risotto.jpg',
            createdAt: '2025-04-10T09:30:00Z',
            updatedAt: '2025-05-12T11:45:00Z'
        },
        {
            id: 1002,
            title: 'Poulet Rôti aux Herbes',
            category: 'plat',
            price: 14.9,
            description: 'Un poulet rôti classique avec des herbes fraîches et des pommes de terre.',
            ingredients: [
                {id: 201, name: 'Poulet Fermier', quantity: 0.3, unit: 'kg'},
                {id: 4, name: 'Pommes de Terre', quantity: 0.2, unit: 'kg'},
                {id: 202, name: 'Thym', quantity: 0.01, unit: 'kg'},
                {id: 203, name: 'Romarin', quantity: 0.01, unit: 'kg'},
                {id: 204, name: 'Ail', quantity: 2, unit: 'gousses'},
                {id: 5, name: 'Huile d\'Olive Extra Vierge', quantity: 0.02, unit: 'L'}
            ],
            tags: ['Sans lactose', 'Populaire'],
            rating: 4.6,
            image: 'poulet.jpg',
            createdAt: '2025-04-12T10:15:00Z',
            updatedAt: '2025-05-13T14:20:00Z'
        },
        {
            id: 1003,
            title: 'Salade Niçoise',
            category: 'entree',
            price: 9.9,
            description: 'Une salade niçoise traditionnelle avec du thon, des œufs et des olives.',
            ingredients: [
                {id: 301, name: 'Thon', quantity: 0.1, unit: 'kg'},
                {id: 302, name: 'Œufs', quantity: 2, unit: 'pièces'},
                {id: 303, name: 'Olives Noires', quantity: 0.05, unit: 'kg'},
                {id: 1, name: 'Tomates Bio', quantity: 0.1, unit: 'kg'},
                {id: 304, name: 'Salade Verte', quantity: 0.1, unit: 'kg'},
                {id: 5, name: 'Huile d\'Olive Extra Vierge', quantity: 0.03, unit: 'L'}
            ],
            tags: ['Sans gluten', 'Estival'],
            rating: 4.5,
            image: 'salade.jpg',
            createdAt: '2025-04-15T13:40:00Z',
            updatedAt: '2025-05-14T09:10:00Z'
        },
        {
            id: 1004,
            title: 'Spaghetti Carbonara',
            category: 'plat',
            price: 11.5,
            description: 'Des pâtes carbonara crémeuses avec du lard et du parmesan.',
            ingredients: [
                {id: 401, name: 'Spaghetti', quantity: 0.12, unit: 'kg'},
                {id: 402, name: 'Lardons', quantity: 0.08, unit: 'kg'},
                {id: 302, name: 'Œufs', quantity: 2, unit: 'pièces'},
                {id: 102, name: 'Parmesan', quantity: 0.04, unit: 'kg'},
                {id: 403, name: 'Poivre Noir', quantity: 0.002, unit: 'kg'}
            ],
            tags: ['Populaire', 'Italien'],
            rating: 4.7,
            image: 'carbonara.jpg',
            createdAt: '2025-04-18T15:20:00Z',
            updatedAt: '2025-05-15T10:45:00Z'
        }
    ];
    
    // Générer des catégories
    const categories = [
        {
            id: 1,
            name: 'Entrées',
            description: 'Plats servis en début de repas',
            count: 15,
            createdAt: '2025-01-10T09:00:00Z',
            updatedAt: '2025-05-01T13:15:00Z'
        },
        {
            id: 2,
            name: 'Plats principaux',
            description: 'Plats servis comme plat principal',
            count: 28,
            createdAt: '2025-01-10T09:10:00Z',
            updatedAt: '2025-05-01T13:20:00Z'
        },
        {
            id: 3,
            name: 'Desserts',
            description: 'Plats sucrés servis en fin de repas',
            count: 12,
            createdAt: '2025-01-10T09:20:00Z',
            updatedAt: '2025-05-01T13:25:00Z'
        },
        {
            id: 4,
            name: 'Boissons',
            description: 'Boissons servies pendant le repas',
            count: 8,
            createdAt: '2025-01-10T09:30:00Z',
            updatedAt: '2025-05-01T13:30:00Z'
        }
    ];
    
    return [...menus, ...categories];
}

/**
 * Génère des données de fournisseur simulées
 */
function generateMockSuppliers() {
    const suppliers = [
        {
            id: 1,
            name: 'PrimeurPro',
            category: 'fruits-legumes',
            description: 'Fournisseur de fruits et légumes frais, produits locaux et biologiques.',
            contact: {
                phone: '+33 6 12 34 56 78',
                email: 'contact@primeurpro.fr',
                website: 'www.primeurpro.fr',
                address: '123 Avenue des Maraîchers, 75011 Paris'
            },
            rating: 4.8,
            orders_count: 52,
            price_reliability: 'Excellente',
            logo: 'primeurpro.jpg',
            createdAt: '2025-01-05T10:00:00Z',
            updatedAt: '2025-05-01T14:30:00Z'
        },
        {
            id: 2,
            name: 'BoucherieFine',
            category: 'viande',
            description: 'Viandes de qualité supérieure, bœuf, volaille et agneau de producteurs locaux.',
            contact: {
                phone: '+33 6 23 45 67 89',
                email: 'contact@boucheriefine.fr',
                website: 'www.boucheriefine.fr',
                address: '45 Rue des Bouchers, 75015 Paris'
            },
            rating: 4.7,
            orders_count: 38,
            price_reliability: 'Très bonne',
            logo: 'boucheriefine.jpg',
            createdAt: '2025-01-08T11:15:00Z',
            updatedAt: '2025-05-02T09:45:00Z'
        },
        {
            id: 3,
            name: 'OcéanFrais',
            category: 'poisson',
            description: 'Poissons et fruits de mer pêchés en respectant les saisons et la durabilité.',
            contact: {
                phone: '+33 6 34 56 78 90',
                email: 'contact@oceanfrais.fr',
                website: 'www.oceanfrais.fr',
                address: '78 Boulevard Maritime, 13008 Marseille'
            },
            rating: 4.6,
            orders_count: 29,
            price_reliability: 'Bonne',
            logo: 'oceanfrais.jpg',
            createdAt: '2025-01-12T14:30:00Z',
            updatedAt: '2025-05-03T16:20:00Z'
        },
        {
            id: 4,
            name: 'EpicerieGourmet',
            category: 'epicerie',
            description: 'Produits d\'épicerie fine, huiles, vinaigres et condiments de qualité.',
            contact: {
                phone: '+33 6 45 67 89 01',
                email: 'contact@epiceriegourmet.fr',
                website: 'www.epiceriegourmet.fr',
                address: '12 Rue du Commerce, 69002 Lyon'
            },
            rating: 4.5,
            orders_count: 25,
            price_reliability: 'Bonne',
            logo: 'epiceriegourmet.jpg',
            createdAt: '2025-01-15T09:45:00Z',
            updatedAt: '2025-05-04T10:30:00Z'
        }
    ];
    
    // Générer des commandes
    const orders = [
        {
            id: 1,
            ref: 'CMD-2025-0124',
            supplier_id: 1,
            date: '2025-05-18T10:30:00Z',
            amount: 485.60,
            status: 'confirmed', // pending, confirmed, shipped, delivered, cancelled
            delivery_date: '2025-05-20',
            items: [
                {product_id: 1, name: 'Tomates Bio', quantity: 25, unit: 'kg', price: 2.5},
                {product_id: 4, name: 'Pommes de Terre', quantity: 40, unit: 'kg', price: 1.2},
                {product_id: 6, name: 'Champignons de Paris', quantity: 10, unit: 'kg', price: 4.5}
            ],
            createdAt: '2025-05-18T10:30:00Z',
            updatedAt: '2025-05-18T14:15:00Z'
        },
        {
            id: 2,
            ref: 'CMD-2025-0123',
            supplier_id: 2,
            date: '2025-05-17T14:45:00Z',
            amount: 752.30,
            status: 'shipped',
            delivery_date: '2025-05-19',
            items: [
                {product_id: 2, name: 'Filet de Bœuf', quantity: 15, unit: 'kg', price: 32.9},
                {product_id: 201, name: 'Poulet Fermier', quantity: 12, unit: 'kg', price: 12.5},
                {product_id: 402, name: 'Lardons', quantity: 8, unit: 'kg', price: 9.8}
            ],
            createdAt: '2025-05-17T14:45:00Z',
            updatedAt: '2025-05-18T09:20:00Z'
        },
        {
            id: 3,
            ref: 'CMD-2025-0122',
            supplier_id: 3,
            date: '2025-05-15T11:30:00Z',
            amount: 367.90,
            status: 'delivered',
            delivery_date: '2025-05-16',
            items: [
                {product_id: 3, name: 'Saumon Frais', quantity: 8, unit: 'kg', price: 29.9},
                {product_id: 301, name: 'Thon', quantity: 5, unit: 'kg', price: 24.5}
            ],
            createdAt: '2025-05-15T11:30:00Z',
            updatedAt: '2025-05-16T16:20:00Z'
        },
        {
            id: 4,
            ref: 'CMD-2025-0121',
            supplier_id: 1,
            date: '2025-05-14T09:15:00Z',
            amount: 412.75,
            status: 'delivered',
            delivery_date: '2025-05-15',
            items: [
                {product_id: 1, name: 'Tomates Bio', quantity: 20, unit: 'kg', price: 2.5},
                {product_id: 4, name: 'Pommes de Terre', quantity: 35, unit: 'kg', price: 1.2},
                {product_id: 6, name: 'Champignons de Paris', quantity: 8, unit: 'kg', price: 4.5},
                {product_id: 103, name: 'Oignon', quantity: 15, unit: 'kg', price: 1.8},
                {product_id: 304, name: 'Salade Verte', quantity: 12, unit: 'kg', price: 3.2}
            ],
            createdAt: '2025-05-14T09:15:00Z',
            updatedAt: '2025-05-15T13:40:00Z'
        }
    ];
    
    return [...suppliers, ...orders];
}

/**
 * Génère des données de planning simulées
 */
function generateMockPlanning() {
    // Calculer les dates pour la semaine en cours
    const currentDate = new Date();
    const currentDay = currentDate.getDay(); // 0 = dimanche, 1 = lundi, etc.
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(currentDate);
    monday.setDate(currentDate.getDate() + mondayOffset);
    
    // Formater une date en YYYY-MM-DD
    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    
    // Créer les entrées du planning pour chaque jour de la semaine
    const planning = [];
    const menuIds = [1001, 1002, 1003, 1004]; // IDs des menus existants
    
    for (let i = 0; i < 7; i++) {
        const currentDay = new Date(monday);
        currentDay.setDate(monday.getDate() + i);
        const dateStr = formatDate(currentDay);
        
        // Déjeuner
        planning.push({
            id: 2000 + (i * 2),
            menu_id: menuIds[Math.floor(Math.random() * menuIds.length)],
            date: dateStr,
            time: '12:00',
            meal_type: 'lunch',
            covers: 30 + Math.floor(Math.random() * 40),
            notes: '',
            createdAt: '2025-05-10T14:00:00Z',
            updatedAt: '2025-05-15T09:30:00Z'
        });
        
        // Dîner
        planning.push({
            id: 2000 + (i * 2) + 1,
            menu_id: menuIds[Math.floor(Math.random() * menuIds.length)],
            date: dateStr,
            time: '19:00',
            meal_type: 'dinner',
            covers: 40 + Math.floor(Math.random() * 30),
            notes: '',
            createdAt: '2025-05-10T14:15:00Z',
            updatedAt: '2025-05-15T09:45:00Z'
        });
    }
    
    // Historique des menus
    const history = [
        {
            id: 1,
            menu_id: 1001,
            date: '2025-05-17',
            time: '12:00',
            covers: 50,
            rating: 4.8,
            feedback: 'Très apprécié par les clients, à refaire.',
            createdAt: '2025-05-17T14:00:00Z',
            updatedAt: '2025-05-17T14:00:00Z'
        },
        {
            id: 2,
            menu_id: 1002,
            date: '2025-05-17',
            time: '19:00',
            covers: 45,
            rating: 4.6,
            feedback: 'Bonne prestation, cuisson parfaite.',
            createdAt: '2025-05-17T22:00:00Z',
            updatedAt: '2025-05-17T22:00:00Z'
        },
        {
            id: 3,
            menu_id: 1003,
            date: '2025-05-18',
            time: '12:00',
            covers: 40,
            rating: 4.5,
            feedback: 'Fraîcheur des ingrédients très appréciée.',
            createdAt: '2025-05-18T14:30:00Z',
            updatedAt: '2025-05-18T14:30:00Z'
        },
        {
            id: 4,
            menu_id: 1004,
            date: '2025-05-18',
            time: '19:00',
            covers: 55,
            rating: 4.7,
            feedback: 'Grand succès, très demandé par les clients.',
            createdAt: '2025-05-18T22:15:00Z',
            updatedAt: '2025-05-18T22:15:00Z'
        }
    ];
    
    // Statistiques
    const stats = {
        id: 1,
        period: 'month',
        menus_used: 42,
        total_covers: 1250,
        average_rating: 8.2,
        ingredients_saving: 32,
        category_usage: {
            'Entrées': 25,
            'Plats principaux': 42,
            'Desserts': 18,
            'Boissons': 15
        },
        top_ingredients: [
            {name: 'Pommes de Terre', quantity: 120, unit: 'kg'},
            {name: 'Tomates Bio', quantity: 85, unit: 'kg'},
            {name: 'Poulet Fermier', quantity: 65, unit: 'kg'},
            {name: 'Œufs', quantity: 480, unit: 'pièces'},
            {name: 'Champignons de Paris', quantity: 42, unit: 'kg'},
            {name: 'Huile d\'Olive Extra Vierge', quantity: 28, unit: 'L'},
            {name: 'Saumon Frais', quantity: 25, unit: 'kg'},
            {name: 'Filet de Bœuf', quantity: 22, unit: 'kg'},
            {name: 'Parmesan', quantity: 15, unit: 'kg'},
            {name: 'Salade Verte', quantity: 14, unit: 'kg'}
        ],
        createdAt: '2025-05-01T00:00:00Z',
        updatedAt: '2025-05-19T00:00:00Z'
    };
    
    return [...planning, ...history, stats];
}

// =================================================================
// EXPOSITION DE L'API SERVICE
// =================================================================

// Créer et exporter une instance globale du service API
const apiService = new ApiService();

// Exporter les classes pour une utilisation personnalisée
export { 
    ApiService, 
    InventoryService, 
    MenuService, 
    SupplierService, 
    PlanningService 
};

// Exporter l'instance par défaut
export default apiService;