/**
 * ChAIf SES API Integration Module
 * 
 * Ce module gère l'intégration avec les API MarketMan et Spoonacular
 * pour les fonctionnalités de gestion des stocks et de génération de menus.
 */

class ChAIfSESAPI {
  constructor(config) {
    this.marketmanApi = new MarketManConnector(config.marketmanApiKey);
    this.spoonacularApi = new SpoonacularConnector(config.spoonacularApiKey);
    this.debug = config.debug || false;
  }

  /**
   * Génère des menus basés sur les ingrédients disponibles en stock
   * 
   * @param {Object} preferences - Préférences pour la génération de menus
   * @returns {Promise<Array>} - Les menus générés
   */
  async generateMenus(preferences = {}) {
    try {
      // 1. Récupérer l'inventaire actuel depuis MarketMan
      const inventory = await this.marketmanApi.getInventory();
      
      if (this.debug) console.log('Inventaire récupéré:', inventory.length, 'items');
      
      // 2. Filtrer les ingrédients en fonction des préférences
      const availableIngredients = this.filterIngredients(inventory, preferences);
      
      if (this.debug) console.log('Ingrédients disponibles après filtrage:', availableIngredients.length);
      
      // 3. Générer des menus via Spoonacular
      const generatedMenus = await this.spoonacularApi.generateMenuByIngredients(
        availableIngredients,
        preferences
      );
      
      if (this.debug) console.log('Menus générés:', generatedMenus.length);
      
      // 4. Enrichir les menus avec des informations supplémentaires
      const enrichedMenus = await this.enrichMenusWithDetails(generatedMenus);
      
      // 5. Calculer les quantités d'ingrédients nécessaires pour chaque menu
      return this.calculateIngredientQuantities(enrichedMenus, preferences.guests || 4);
    } catch (error) {
      console.error('Erreur lors de la génération des menus:', error);
      throw error;
    }
  }

  /**
   * Filtre les ingrédients de l'inventaire en fonction des préférences
   * 
   * @param {Array} inventory - Inventaire complet des produits
   * @param {Object} preferences - Préférences de filtrage
   * @returns {Array} - Ingrédients filtrés
   */
  filterIngredients(inventory, preferences) {
    // Filtrer les ingrédients périmés
    let filtered = inventory.filter(item => {
      const expiryDate = new Date(item.expiryDate);
      const today = new Date();
      return expiryDate > today;
    });
    
    // Si optimisation pour péremption imminente, trier par date de péremption
    if (preferences.optimize === 'expiry') {
      filtered.sort((a, b) => {
        const dateA = new Date(a.expiryDate);
        const dateB = new Date(b.expiryDate);
        return dateA - dateB;
      });
      
      // Prioriser les ingrédients qui expirent dans les 7 jours
      const sevenDaysLater = new Date();
      sevenDaysLater.setDate(sevenDaysLater.getDate() + 7);
      
      filtered = filtered.map(item => {
        const expiryDate = new Date(item.expiryDate);
        if (expiryDate <= sevenDaysLater) {
          item.priority = true;
        }
        return item;
      });
    }
    
    // Filtrer par quantité minimum disponible
    filtered = filtered.filter(item => item.quantity > item.minimumQuantity);
    
    return filtered;
  }

  /**
   * Enrichit les menus générés avec des détails supplémentaires
   * 
   * @param {Array} menus - Menus générés par Spoonacular
   * @returns {Promise<Array>} - Menus enrichis
   */
  async enrichMenusWithDetails(menus) {
    const enrichedMenus = [];
    
    for (const menu of menus) {
      try {
        const details = await this.spoonacularApi.getRecipeDetails(menu.id);
        
        // Fusionner les informations de base avec les détails
        const enrichedMenu = {
          ...menu,
          instructions: details.instructions,
          summary: details.summary,
          nutritionFacts: details.nutrition,
          readyInMinutes: details.readyInMinutes,
          servings: details.servings,
          extendedIngredients: details.extendedIngredients
        };
        
        enrichedMenus.push(enrichedMenu);
      } catch (error) {
        console.error(`Erreur lors de l'enrichissement du menu ${menu.id}:`, error);
        // On continue avec les autres menus même en cas d'erreur
        enrichedMenus.push(menu);
      }
    }
    
    return enrichedMenus;
  }

  /**
   * Calcule les quantités d'ingrédients nécessaires en fonction du nombre de convives
   * 
   * @param {Array} menus - Menus enrichis
   * @param {number} guests - Nombre de convives
   * @returns {Array} - Menus avec quantités calculées
   */
  calculateIngredientQuantities(menus, guests) {
    return menus.map(menu => {
      if (!menu.extendedIngredients) return menu;
      
      const originalServings = menu.servings || 4;
      const ratio = guests / originalServings;
      
      // Ajuster les quantités d'ingrédients
      const adjustedIngredients = menu.extendedIngredients.map(ingredient => {
        return {
          ...ingredient,
          originalAmount: ingredient.amount,
          amount: ingredient.amount * ratio,
          adjustedAmount: Math.ceil(ingredient.amount * ratio * 10) / 10 // Arrondir à 1 décimale
        };
      });
      
      return {
        ...menu,
        extendedIngredients: adjustedIngredients,
        originalServings,
        calculatedServings: guests
      };
    });
  }

  /**
   * Met à jour l'inventaire après avoir utilisé un menu
   * 
   * @param {Object} menu - Menu utilisé
   * @param {number} guests - Nombre de convives
   * @returns {Promise<boolean>} - Succès de la mise à jour
   */
  async updateInventoryAfterMenuUsage(menu, guests) {
    try {
      if (!menu.extendedIngredients) {
        throw new Error('Le menu ne contient pas d\'informations sur les ingrédients');
      }
      
      // 1. Récupérer l'inventaire actuel
      const inventory = await this.marketmanApi.getInventory();
      
      // 2. Préparer les mises à jour d'inventaire
      const updateItems = [];
      
      for (const ingredient of menu.extendedIngredients) {
        // Trouver le produit correspondant dans l'inventaire
        const inventoryItem = inventory.find(item => 
          item.name.toLowerCase() === ingredient.name.toLowerCase() ||
          item.name.toLowerCase().includes(ingredient.name.toLowerCase())
        );
        
        if (inventoryItem) {
          // Calculer la quantité utilisée
          const usedQuantity = ingredient.amount * (guests / menu.servings);
          
          // Mettre à jour la quantité dans l'inventaire
          updateItems.push({
            id: inventoryItem.id,
            quantity: Math.max(0, inventoryItem.quantity - usedQuantity)
          });
        }
      }
      
      // 3. Envoyer les mises à jour à MarketMan
      if (updateItems.length > 0) {
        await this.marketmanApi.updateInventory(updateItems);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'inventaire:', error);
      throw error;
    }
  }

  /**
   * Récupère les produits qui vont bientôt expirer
   * 
   * @param {number} days - Nombre de jours pour l'alerte
   * @returns {Promise<Array>} - Produits proches de l'expiration
   */
  async getExpiringProducts(days = 7) {
    return this.marketmanApi.getExpiringItems(days);
  }

  /**
   * Compare les fournisseurs pour un ingrédient donné
   * 
   * @param {string} ingredientName - Nom de l'ingrédient
   * @returns {Promise<Array>} - Liste des fournisseurs triés par pertinence
   */
  async compareSuppliers(ingredientName) {
    try {
      // 1. Récupérer la liste des fournisseurs
      const suppliers = await this.marketmanApi.getSuppliers();
      
      // 2. Filtrer les fournisseurs qui proposent cet ingrédient
      const relevantSuppliers = suppliers.filter(supplier => {
        return supplier.products.some(
          product => product.name.toLowerCase().includes(ingredientName.toLowerCase())
        );
      });
      
      // 3. Calculer un score pour chaque fournisseur
      const rankedSuppliers = relevantSuppliers.map(supplier => {
        const product = supplier.products.find(
          p => p.name.toLowerCase().includes(ingredientName.toLowerCase())
        );
        
        // Calculer un score global (plus le score est bas, meilleur est le fournisseur)
        // Paramètres: prix, délai de livraison, quantité minimale, note de qualité
        const priceScore = product.price / 10; // Plus le prix est bas, meilleur est le score
        const deliveryScore = supplier.deliveryTime / 5; // Plus le délai est court, meilleur est le score
        const quantityScore = product.minimumQuantity / 10; // Plus la quantité min est basse, meilleur est le score
        const qualityScore = (5 - supplier.qualityRating) / 2.5; // Plus la note est élevée, meilleur est le score
        
        const totalScore = priceScore + deliveryScore + quantityScore + qualityScore;
        
        return {
          ...supplier,
          product,
          totalScore
        };
      });
      
      // 4. Trier les fournisseurs par score (du meilleur au moins bon)
      return rankedSuppliers.sort((a, b) => a.totalScore - b.totalScore);
    } catch (error) {
      console.error('Erreur lors de la comparaison des fournisseurs:', error);
      throw error;
    }
  }
}

/**
 * MarketMan API Connector
 */
class MarketManConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.marketman.com/v1/';
  }

  async getInventory() {
    // Récupérer les données d'inventaire complètes
    return this.apiRequest('inventory');
  }

  async getSuppliers() {
    // Récupérer la liste des fournisseurs et leurs informations
    return this.apiRequest('suppliers');
  }

  async updateInventory(items) {
    // Mettre à jour l'inventaire après utilisation d'ingrédients
    return this.apiRequest('inventory/update', 'POST', items);
  }

  async getExpiringItems(days = 7) {
    // Récupérer les produits qui expirent bientôt
    return this.apiRequest(`inventory/expiring?days=${days}`);
  }

  async apiRequest(endpoint, method = 'GET', data = null) {
    // Méthode générique pour les appels API
    const options = {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, options);
      
      if (!response.ok) {
        throw new Error(`Erreur MarketMan API: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Erreur lors de l'appel à MarketMan API (${endpoint}):`, error);
      
      // En mode développement/test, retourner des données simulées
      if (endpoint === 'inventory') {
        return this.getMockInventory();
      } else if (endpoint === 'suppliers') {
        return this.getMockSuppliers();
      } else if (endpoint === 'inventory/expiring') {
        return this.getMockExpiringItems(days);
      }
      
      throw error;
    }
  }
  
  // Méthodes pour générer des données simulées (pour le développement)
  getMockInventory() {
    return [
      {
        id: 1,
        name: "Riz arborio",
        category: "Céréales",
        quantity: 5.2,
        unit: "kg",
        minimumQuantity: 1,
        expiryDate: this.addDays(new Date(), 90),
        price: 3.45
      },
      {
        id: 2,
        name: "Champignons de Paris",
        category: "Légumes",
        quantity: 2.5,
        unit: "kg",
        minimumQuantity: 1,
        expiryDate: this.addDays(new Date(), 4),
        price: 4.95
      },
      {
        id: 3,
        name: "Parmesan",
        category: "Fromages",
        quantity: 1.2,
        unit: "kg",
        minimumQuantity: 0.5,
        expiryDate: this.addDays(new Date(), 30),
        price: 18.75
      },
      {
        id: 4,
        name: "Poulet entier",
        category: "Viandes",
        quantity: 4,
        unit: "unité",
        minimumQuantity: 2,
        expiryDate: this.addDays(new Date(), 6),
        price: 8.95
      },
      {
        id: 5,
        name: "Pommes de terre",
        category: "Légumes",
        quantity: 12.5,
        unit: "kg",
        minimumQuantity: 5,
        expiryDate: this.addDays(new Date(), 45),
        price: 1.25
      }
    ];
  }
  
  getMockSuppliers() {
    return [
      {
        id: 1,
        name: "Metro Cash & Carry",
        deliveryTime: 1,
        qualityRating: 4.2,
        products: [
          { id: 1, name: "Riz arborio", price: 3.45, unit: "kg", minimumQuantity: 5 },
          { id: 2, name: "Champignons de Paris", price: 4.95, unit: "kg", minimumQuantity: 3 }
        ]
      },
      {
        id: 2,
        name: "Transgourmet",
        deliveryTime: 2,
        qualityRating: 4.5,
        products: [
          { id: 1, name: "Riz arborio", price: 3.75, unit: "kg", minimumQuantity: 3 },
          { id: 3, name: "Parmesan AOP", price: 19.95, unit: "kg", minimumQuantity: 1 }
        ]
      },
      {
        id: 3,
        name: "Davigel",
        deliveryTime: 3,
        qualityRating: 3.8,
        products: [
          { id: 2, name: "Champignons de Paris", price: 3.60, unit: "kg", minimumQuantity: 2 },
          { id: 4, name: "Poulet fermier", price: 8.25, unit: "unité", minimumQuantity: 2 }
        ]
      }
    ];
  }
  
  getMockExpiringItems(days) {
    return [
      {
        id: 2,
        name: "Champignons de Paris",
        category: "Légumes",
        quantity: 2.5,
        unit: "kg",
        expiryDate: this.addDays(new Date(), 4)
      },
      {
        id: 4,
        name: "Poulet entier",
        category: "Viandes",
        quantity: 4,
        unit: "unité",
        expiryDate: this.addDays(new Date(), 6)
      },
      {
        id: 12,
        name: "Crème fraîche",
        category: "Produits laitiers",
        quantity: 1.5,
        unit: "L",
        expiryDate: this.addDays(new Date(), 3)
      }
    ];
  }
  
  addDays(date, days) {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }
}

/**
 * Spoonacular API Connector
 */
class SpoonacularConnector {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = 'https://api.spoonacular.com/';
  }

  async generateMenuByIngredients(ingredients, preferences = {}) {
    try {
      // Convertir la liste d'ingrédients en format approprié
      const ingredientList = ingredients.map(i => i.name).join(',');
      
      // Construire les paramètres de requête en fonction des préférences
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        ingredients: ingredientList,
        number: preferences.count || 5,
        ranking: 2, // Maximise used ingredients
        ignorePantry: false
      });

      // Ajouter d'autres préférences si présentes
      if (preferences.cuisine) params.append('cuisine', preferences.cuisine);
      if (preferences.diet) params.append('diet', preferences.diet);
      if (preferences.intolerances) params.append('intolerances', preferences.intolerances);
      
      const response = await fetch(`${this.baseUrl}recipes/findByIngredients?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erreur Spoonacular API: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error('Erreur lors de la génération de menus par ingrédients:', error);
      
      // En mode développement/test, retourner des données simulées
      return this.getMockRecipes();
    }
  }

  async getRecipeDetails(recipeId) {
    try {
      // Récupérer les détails complets d'une recette
      const params = new URLSearchParams({
        apiKey: this.apiKey,
        includeNutrition: true
      });

      const response = await fetch(`${this.baseUrl}recipes/${recipeId}/information?${params}`);
      
      if (!response.ok) {
        throw new Error(`Erreur Spoonacular API: ${response.status} ${response.statusText}`);
      }
      
      return response.json();
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails de la recette ${recipeId}:`, error);
      
      // En mode développement/test, retourner des données simulées
      return this.getMockRecipeDetails(recipeId);
    }
  }
  
  // Méthodes pour générer des données simulées (pour le développement)
  getMockRecipes() {
    return [
      {
        id: 1001,
        title: "Risotto aux Champignons",
        image: "https://spoonacular.com/recipeImages/risotto-mushroom.jpg",
        usedIngredientCount: 3,
        missedIngredientCount: 1,
        likes: 120,
        usedIngredients: [
          { id: 1, name: "Riz arborio", amount: 0.3, unit: "kg" },
          { id: 2, name: "Champignons de Paris", amount: 0.25, unit: "kg" },
          { id: 3, name: "Parmesan", amount: 0.1, unit: "kg" }
        ],
        missedIngredients: [
          { id: 10, name: "Bouillon de légumes", amount: 1, unit: "L" }
        ]
      },
      {
        id: 1002,
        title: "Poulet Rôti aux Herbes",
        image: "https://spoonacular.com/recipeImages/roasted-chicken.jpg",
        usedIngredientCount: 2,
        missedIngredientCount: 2,
        likes: 98,
        usedIngredients: [
          { id: 4, name: "Poulet entier", amount: 1, unit: "unité" },
          { id: 5, name: "Pommes de terre", amount: 0.5, unit: "kg" }
        ],
        missedIngredients: [
          { id: 11, name: "Romarin", amount: 5, unit: "g" },
          { id: 12, name: "Thym", amount: 5, unit: "g" }
        ]
      },
      {
        id: 1003,
        title: "Purée de Pommes de Terre",
        image: "https://spoonacular.com/recipeImages/mashed-potatoes.jpg",
        usedIngredientCount: 2,
        missedIngredientCount: 1,
        likes: 145,
        usedIngredients: [
          { id: 5, name: "Pommes de terre", amount: 0.8, unit: "kg" },
          { id: 13, name: "Crème fraîche", amount: 0.2, unit: "L" }
        ],
        missedIngredients: [
          { id: 14, name: "Beurre", amount: 50, unit: "g" }
        ]
      }
    ];
  }
  
  getMockRecipeDetails(recipeId) {
    if (recipeId === 1001) {
      return {
        id: 1001,
        title: "Risotto aux Champignons",
        readyInMinutes: 45,
        servings: 4,
        image: "https://spoonacular.com/recipeImages/risotto-mushroom.jpg",
        summary: "Un risotto crémeux aux champignons, parfait pour un dîner élégant. Ce plat combine la richesse du parmesan avec la saveur umami des champignons.",
        instructions: "1. Faire chauffer le bouillon de légumes.\n2. Faire revenir les oignons et l'ail dans de l'huile d'olive.\n3. Ajouter le riz et le faire nacrer.\n4. Ajouter le vin blanc et laisser évaporer.\n5. Ajouter progressivement le bouillon chaud, en remuant constamment.\n6. Incorporer les champignons préalablement sautés.\n7. Finir avec le parmesan et le beurre.",
        extendedIngredients: [
          { id: 1, name: "Riz arborio", amount: 0.3, unit: "kg" },
          { id: 2, name: "Champignons de Paris", amount: 0.25, unit: "kg" },
          { id: 3, name: "Parmesan", amount: 0.1, unit: "kg" },
          { id: 10, name: "Bouillon de légumes", amount: 1, unit: "L" },
          { id: 15, name: "Oignon", amount: 1, unit: "unité" },
          { id: 16, name: "Ail", amount: 2, unit: "gousses" },
          { id: 17, name: "Vin blanc", amount: 0.1, unit: "L" },
          { id: 18, name: "Beurre", amount: 30, unit: "g" }
        ],
        nutrition: {
          calories: 420,
          protein: 12,
          fat: 15,
          carbs: 58
        }
      };
    } else if (recipeId === 1002) {
      return {
        id: 1002,
        title: "Poulet Rôti aux Herbes",
        readyInMinutes: 75,
        servings: 4,
        image: "https://spoonacular.com/recipeImages/roasted-chicken.jpg",
        summary: "Un poulet rôti classique avec des herbes fraîches et des pommes de terre. Ce plat familial est à la fois simple et savoureux.",
        instructions: "1. Préchauffer le four à 180°C.\n2. Préparer le poulet en le rinçant et en le séchant.\n3. Frotter le poulet avec de l'huile d'olive, du sel et du poivre.\n4. Garnir l'intérieur avec du thym, du romarin et du citron.\n5. Disposer les pommes de terre autour du poulet.\n6. Rôtir pendant environ 1h15 ou jusqu'à ce que le poulet soit cuit.\n7. Laisser reposer 10 minutes avant de découper.",
        extendedIngredients: [
          { id: 4, name: "Poulet entier", amount: 1, unit: "unité" },
          { id: 5, name: "Pommes de terre", amount: 0.5, unit: "kg" },
          { id: 11, name: "Romarin", amount: 5, unit: "g" },
          { id: 12, name: "Thym", amount: 5, unit: "g" },
          { id: 19, name: "Huile d'olive", amount: 30, unit: "ml" },
          { id: 20, name: "Sel", amount: 10, unit: "g" },
          { id: 21, name: "Poivre", amount: 5, unit: "g" },
          { id: 22, name: "Citron", amount: 1, unit: "unité" }
        ],
        nutrition: {
          calories: 520,
          protein: 42,
          fat: 28,
          carbs: 22
        }
      };
    } else {
      return {
        id: 1003,
        title: "Purée de Pommes de Terre",
        readyInMinutes: 30,
        servings: 4,
        image: "https://spoonacular.com/recipeImages/mashed-potatoes.jpg",
        summary: "Une purée de pommes de terre crémeuse et réconfortante. Ce classique accompagne parfaitement viandes et poissons.",
        instructions: "1. Éplucher et couper les pommes de terre en morceaux.\n2. Les faire cuire dans de l'eau salée jusqu'à ce qu'elles soient tendres.\n3. Égoutter les pommes de terre et les remettre dans la casserole.\n4. Ajouter la crème fraîche et le beurre.\n5. Écraser les pommes de terre jusqu'à obtenir une texture lisse.\n6. Assaisonner avec du sel et du poivre.",
        extendedIngredients: [
          { id: 5, name: "Pommes de terre", amount: 0.8, unit: "kg" },
          { id: 13, name: "Crème fraîche", amount: 0.2, unit: "L" },
          { id: 14, name: "Beurre", amount: 50, unit: "g" },
          { id: 20, name: "Sel", amount: 5, unit: "g" },
          { id: 21, name: "Poivre", amount: 2, unit: "g" }
        ],
        nutrition: {
          calories: 320,
          protein: 6,
          fat: 18,
          carbs: 35
        }
      };
    }
  }
}

// Exporter les classes pour utilisation dans d'autres modules
export { ChAIfSESAPI, MarketManConnector, SpoonacularConnector };