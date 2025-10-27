// routes/proteinMenuRoutes.js
// Routes API pour générer des menus riches en protéines

import express from 'express';
import { generateProteinMenu, getHighProteinIngredients } from '../scripts/generate-protein-menu.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/protein-menu/generate
 * @desc    Générer un menu riche en protéines avec l'IA
 * @access  Private
 */
router.post('/generate', protect, async (req, res) => {
  try {
    const { 
      numberOfPeople = 4, 
      targetProteins = 30, 
      mealType = 'déjeuner',
      dietaryRestrictions = []
    } = req.body;

    console.log(`📊 Génération menu protéiné pour ${req.user.email}`);
    console.log(`   👥 ${numberOfPeople} personnes`);
    console.log(`   🎯 ${targetProteins}g protéines/pers.`);

    const result = await generateProteinMenu({
      numberOfPeople,
      targetProteins,
      mealType,
      dietaryRestrictions
    });

    res.status(200).json({
      success: true,
      data: {
        menu: result.menu,
        nutrition: result.nutrition,
        numberOfPeople: result.numberOfPeople,
        generatedAt: new Date(),
        generatedBy: req.user._id
      }
    });

  } catch (error) {
    console.error('❌ Erreur génération menu protéiné:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la génération du menu',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/protein-menu/ingredients
 * @desc    Récupérer la liste des ingrédients riches en protéines
 * @access  Private
 */
router.get('/ingredients', protect, async (req, res) => {
  try {
    const highProteinIngredients = getHighProteinIngredients();

    res.status(200).json({
      success: true,
      count: highProteinIngredients.length,
      data: highProteinIngredients
    });

  } catch (error) {
    console.error('❌ Erreur récupération ingrédients:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des ingrédients',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/protein-menu/calculate-nutrition
 * @desc    Calculer les valeurs nutritionnelles d'une liste d'ingrédients
 * @access  Private
 */
router.post('/calculate-nutrition', protect, async (req, res) => {
  try {
    const { ingredients } = req.body;

    if (!ingredients || !Array.isArray(ingredients)) {
      return res.status(400).json({
        success: false,
        message: 'Liste d\'ingrédients invalide'
      });
    }

    // Importer la fonction de calcul
    const { calculateMenuNutrition } = await import('../scripts/generate-protein-menu.js');
    const { getIngredientData } = await import('../scripts/ingredients-database.js');

    // Enrichir les ingrédients avec les données nutritionnelles
    const enrichedIngredients = ingredients.map(ing => {
      const data = getIngredientData(ing.nom);
      return {
        ...ing,
        nutritionalValues: data ? data.nutritionalValues : null
      };
    });

    const nutrition = calculateMenuNutrition(enrichedIngredients);

    res.status(200).json({
      success: true,
      data: {
        ingredients: enrichedIngredients,
        nutrition
      }
    });

  } catch (error) {
    console.error('❌ Erreur calcul nutrition:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors du calcul nutritionnel',
      error: error.message
    });
  }
});

export default router;

