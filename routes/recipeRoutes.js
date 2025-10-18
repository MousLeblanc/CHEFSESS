// routes/recipeRoutes.js
import express from 'express';
import Recipe from '../recipe.model.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/recipes - Récupérer les recettes avec filtres
router.get('/', protect, async (req, res) => {
    try {
        const { 
            ageGroup, 
            category, 
            allergens, 
            dietaryRestrictions, 
            medicalConditions,
            texture,
            limit = 50 
        } = req.query;
        
        let filter = {};
        
        // Filtrer par groupe d'âge
        if (ageGroup) {
            filter.ageGroup = ageGroup;
        }
        
        // Filtrer par catégorie
        if (category) {
            filter.category = category;
        }
        
        // Exclure les recettes contenant des allergènes spécifiques
        if (allergens) {
            const allergensList = allergens.split(',');
            filter.allergens = { $nin: allergensList };
        }
        
        // Filtrer par restrictions alimentaires compatibles
        if (dietaryRestrictions) {
            const restrictionsList = dietaryRestrictions.split(',');
            filter.dietaryRestrictions = { $all: restrictionsList };
        }
        
        // Filtrer par pathologies compatibles
        if (medicalConditions) {
            const conditionsList = medicalConditions.split(',');
            filter.medicalConditions = { $all: conditionsList };
        }
        
        // Filtrer par texture
        if (texture) {
            filter.texture = texture;
        }
        
        const recipes = await Recipe.find(filter).limit(parseInt(limit));
        
        res.json({
            success: true,
            count: recipes.length,
            data: recipes
        });
    } catch (error) {
        console.error('Erreur récupération recettes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des recettes'
        });
    }
});

// GET /api/recipes/:id - Récupérer une recette par ID
router.get('/:id', protect, async (req, res) => {
    try {
        const recipe = await Recipe.findById(req.params.id);
        
        if (!recipe) {
            return res.status(404).json({
                success: false,
                message: 'Recette non trouvée'
            });
        }
        
        res.json({
            success: true,
            data: recipe
        });
    } catch (error) {
        console.error('Erreur récupération recette:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération de la recette'
        });
    }
});

// GET /api/recipes/stats - Statistiques sur les recettes
router.get('/stats/overview', protect, async (req, res) => {
    try {
        const totalRecipes = await Recipe.countDocuments();
        
        // Grouper par catégorie
        const byCategory = await Recipe.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]);
        
        // Grouper par tranche d'âge
        const byAgeGroup = await Recipe.aggregate([
            { $group: { _id: '$ageGroup', count: { $sum: 1 } } }
        ]);
        
        res.json({
            success: true,
            data: {
                total: totalRecipes,
                byCategory,
                byAgeGroup
            }
        });
    } catch (error) {
        console.error('Erreur statistiques recettes:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

export default router;

