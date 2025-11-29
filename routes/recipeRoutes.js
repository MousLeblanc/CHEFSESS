// routes/recipeRoutes.js
import express from 'express';
import Recipe from '../recipe.model.js';
import RecipeEnriched from '../models/Recipe.js';
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

// POST /api/recipes/compatible - Récupérer les menus compatibles avec les restrictions
router.post('/compatible', async (req, res) => {
    try {
        const { allergens = [], dietaryRestrictions = [], intolerances = [] } = req.body;
        
        // Normaliser les allergènes (combiner allergies et intolérances)
        const allAllergens = [...new Set([...allergens, ...intolerances])].map(a => a.toLowerCase());
        
        // Construire le filtre
        let filter = {
            category: { $in: ['plat', 'entrée', 'dessert'] } // Seulement les plats principaux
        };
        
        // Exclure les recettes contenant les allergènes
        if (allAllergens.length > 0) {
            filter.allergens = { $nin: allAllergens };
        }
        
        // Filtrer par restrictions alimentaires
        if (dietaryRestrictions && dietaryRestrictions.length > 0) {
            const restrictionsLower = dietaryRestrictions.map(r => r.toLowerCase());
            
            // Construire des conditions OR pour les restrictions
            const orConditions = [];
            
            // Si végétarien demandé
            if (restrictionsLower.includes('vegetarien') || restrictionsLower.includes('végétarien')) {
                orConditions.push(
                    { dietaryRestrictions: { $in: ['vegetarien', 'végétarien'] } },
                    { diet: { $in: ['vegetarien', 'végétarien'] } }
                );
            }
            
            // Si végétalien/vegan demandé
            if (restrictionsLower.includes('vegan') || restrictionsLower.includes('végétalien')) {
                orConditions.push(
                    { dietaryRestrictions: { $in: ['vegan', 'végétalien'] } },
                    { diet: { $in: ['vegan', 'végétalien'] } }
                );
                // Exclure aussi les allergènes lait et œufs
                if (allAllergens.length > 0) {
                    filter.allergens = { 
                        $nin: [...allAllergens, 'lactose', 'lait', 'oeufs', 'oeuf']
                    };
                } else {
                    filter.allergens = { 
                        $nin: ['lactose', 'lait', 'oeufs', 'oeuf']
                    };
                }
            }
            
            // Si halal demandé
            if (restrictionsLower.includes('halal')) {
                orConditions.push(
                    { dietaryRestrictions: { $in: ['halal'] } },
                    { diet: { $in: ['halal'] } }
                );
            }
            
            // Si casher demandé
            if (restrictionsLower.includes('casher')) {
                orConditions.push(
                    { dietaryRestrictions: { $in: ['casher'] } },
                    { diet: { $in: ['casher'] } }
                );
            }
            
            // Si sans gluten
            if (restrictionsLower.includes('sans_gluten') || restrictionsLower.includes('sans gluten')) {
                if (allAllergens.length > 0) {
                    filter.allergens = { 
                        $nin: [...allAllergens, 'gluten']
                    };
                } else {
                    filter.allergens = { $nin: ['gluten'] };
                }
            }
            
            // Si sans lactose
            if (restrictionsLower.includes('sans_lactose') || restrictionsLower.includes('sans lactose')) {
                if (allAllergens.length > 0) {
                    filter.allergens = { 
                        $nin: [...allAllergens, 'lactose', 'lait']
                    };
                } else {
                    filter.allergens = { $nin: ['lactose', 'lait'] };
                }
            }
            
            // Si on a des conditions OR, les ajouter au filtre
            if (orConditions.length > 0) {
                filter.$or = orConditions;
            }
        }
        
        // Récupérer les recettes compatibles
        const recipes = await RecipeEnriched.find(filter)
            .select('name category description frenchTitle allergens dietaryRestrictions diet tags')
            .limit(50)
            .sort({ name: 1 });
        
        res.json({
            success: true,
            count: recipes.length,
            data: recipes
        });
    } catch (error) {
        console.error('Erreur récupération menus compatibles:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des menus compatibles'
        });
    }
});

export default router;

