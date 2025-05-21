// routes/menuRoutes.js - Avec export par défaut
import express from 'express';

// Créer un routeur Express
const router = express.Router();

// Routes pour les menus
router.post('/generate', (req, res) => {
  try {
    // Extraire les données de la requête
    const {
      mode,
      stock,
      theme,
      nbEntrees,
      nbPlats,
      nbDesserts
    } = req.body;
    
    // Simuler un menu généré
    const menuData = {
      title: theme ? `Menu ${theme}` : "Menu du jour",
      courses: [
        {
          type: "entrée",
          name: "Salade Composée",
          ingredients: [
            { name: "Laitue", quantity: 100, unit: "g" },
            { name: "Tomate", quantity: 2, unit: "unité" }
          ],
          instructions: "Laver et couper les légumes. Assaisonner.",
          preparationTime: 15,
          cookingTime: 0,
          servings: 4
        },
        {
          type: "plat",
          name: "Pâtes à la Bolognaise",
          ingredients: [
            { name: "Pâtes", quantity: 300, unit: "g" },
            { name: "Viande hachée", quantity: 200, unit: "g" }
          ],
          instructions: "Cuire les pâtes et préparer la sauce.",
          preparationTime: 10,
          cookingTime: 25,
          servings: 4
        },
        {
          type: "dessert",
          name: "Mousse au Chocolat",
          ingredients: [
            { name: "Chocolat noir", quantity: 200, unit: "g" },
            { name: "Œufs", quantity: 4, unit: "unité" }
          ],
          instructions: "Préparer la mousse au chocolat.",
          preparationTime: 20,
          cookingTime: 0,
          servings: 4
        }
      ]
    };
    
    // Renvoyer la réponse
    res.json({
      success: true,
      data: menuData
    });
  } catch (error) {
    console.error('Error generating menu:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'An error occurred while generating the menu' 
    });
  }
});

router.get('/', (req, res) => {
  // Simuler une liste de menus
  const menus = [
    {
      id: '1',
      title: 'Menu de test 1',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      title: 'Menu de test 2',
      createdAt: new Date().toISOString()
    }
  ];
  
  res.json(menus);
});

router.post('/:id/save', (req, res) => {
  const id = req.params.id;
  
  res.json({
    success: true,
    data: {
      id,
      saved: true
    }
  });
});

// Exporter le routeur comme export par défaut
export default router;