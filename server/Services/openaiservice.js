// services/openaiService.js - Version simplifiée pour le développement
import config from '../config/config.js';

// Simplified service for development
console.log('Using simplified OpenAI service for development');

/**
 * Generate a menu (simplified mock implementation)
 */
export const generateMenu = async (options) => {
  console.log('Generating menu with options:', options);
  
  const { 
    mode, 
    availableIngredients = [], 
    theme = '', 
    restrictions = [], 
    servings = config.menuDefaultServings 
  } = options;
  
  // Return a mock menu
  return {
    title: theme ? `Menu ${theme}` : "Menu du jour",
    courses: [
      {
        type: "entrée",
        name: "Salade Composée",
        ingredients: [
          { name: "Laitue", quantity: 100, unit: "g" },
          { name: "Tomate", quantity: 2, unit: "unité" },
          { name: "Concombre", quantity: 1, unit: "unité" }
        ],
        instructions: "Laver et couper les légumes. Assaisonner avec huile d'olive, sel et poivre.",
        preparationTime: 15,
        cookingTime: 0,
        servings: servings
      },
      {
        type: "plat",
        name: "Pâtes à la Bolognaise",
        ingredients: [
          { name: "Pâtes", quantity: 300, unit: "g" },
          { name: "Viande hachée", quantity: 200, unit: "g" },
          { name: "Sauce tomate", quantity: 200, unit: "ml" },
          { name: "Oignon", quantity: 1, unit: "unité" }
        ],
        instructions: "Faire revenir l'oignon et la viande. Ajouter la sauce tomate et laisser mijoter. Cuire les pâtes et servir avec la sauce.",
        preparationTime: 10,
        cookingTime: 25,
        servings: servings
      },
      {
        type: "dessert",
        name: "Mousse au Chocolat",
        ingredients: [
          { name: "Chocolat noir", quantity: 200, unit: "g" },
          { name: "Œufs", quantity: 4, unit: "unité" },
          { name: "Sucre", quantity: 50, unit: "g" }
        ],
        instructions: "Faire fondre le chocolat. Séparer les blancs des jaunes. Mélanger les jaunes avec le chocolat fondu. Monter les blancs en neige avec le sucre et incorporer délicatement. Réfrigérer 3 heures.",
        preparationTime: 20,
        cookingTime: 0,
        servings: servings
      }
    ]
  };
};

export default {
  generateMenu
};