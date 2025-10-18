import express from 'express';
import Recipe from '../models/recipe.model.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/recipes - Récupérer les recettes par groupe d'âge
router.get('/', protect, async (req, res) => {
    try {
        const { ageGroup, category } = req.query;
        
        let filter = {};
        if (ageGroup) filter.ageGroup = ageGroup;
        if (category) filter.category = category;
        
        const recipes = await Recipe.find(filter);
        
        res.json({
            success: true,
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

export default router;
