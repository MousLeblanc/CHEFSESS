// routes/customMenuRoutes.js
// Route pour le générateur de menus personnalisés avec critères nutritionnels

import express from 'express';
import asyncHandler from 'express-async-handler';
import { generateCustomMenu } from '../scripts/generate-custom-menu.js';

const router = express.Router();

/**
 * POST /api/menu/generate-custom
 * Génère un menu personnalisé selon les critères nutritionnels
 */
router.post('/generate-custom', asyncHandler(async (req, res) => {
    const { numberOfPeople, mealType, nutritionalGoals, dietaryRestrictions, avoidMenuName, forceVariation } = req.body;
    
    // Validation
    if (!numberOfPeople || numberOfPeople < 1) {
        return res.status(400).json({ 
            success: false, 
            message: 'Le nombre de personnes est requis et doit être supérieur à 0' 
        });
    }
    
    if (!mealType) {
        return res.status(400).json({ 
            success: false, 
            message: 'Le type de repas est requis' 
        });
    }
    
    if (!nutritionalGoals || nutritionalGoals.length === 0) {
        return res.status(400).json({ 
            success: false, 
            message: 'Au moins un objectif nutritionnel est requis' 
        });
    }
    
    try {
        const result = await generateCustomMenu({
            numberOfPeople,
            mealType,
            nutritionalGoals,
            dietaryRestrictions: dietaryRestrictions || [],
            avoidMenuName,
            forceVariation
        });
        
        res.status(200).json({
            success: true,
            ...result
        });
        
    } catch (error) {
        console.error('Error generating custom menu:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Erreur lors de la génération du menu'
        });
    }
}));

export default router;

