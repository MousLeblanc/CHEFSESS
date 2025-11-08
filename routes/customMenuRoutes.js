// routes/customMenuRoutes.js
// Route pour le générateur de menus personnalisés avec critères nutritionnels

import express from 'express';
import asyncHandler from 'express-async-handler';
import { generateCustomMenu } from '../scripts/generate-custom-menu.js';
import Stock from '../models/Stock.js';

const router = express.Router();

/**
 * POST /api/menu/generate-custom
 * Génère un menu personnalisé selon les critères nutritionnels
 */
router.post('/generate-custom', asyncHandler(async (req, res) => {
    const { 
        numberOfPeople, 
        mealType, 
        nutritionalGoals, 
        dietaryRestrictions, 
        avoidMenuName, 
        forceVariation,
        filtersAsPreferences,
        strictMode,
        prioritizeVariety,
        useFullRecipeCatalog,
        weekdayTheme,
        weeklyProteinPlan,
        antiRepeat,
        dynamicBanProteins,
        periodDays,
        dayIndex,
        useStockOnly = false // Nouvelle option : utiliser uniquement le stock disponible
    } = req.body;
    
    // Récupérer le stock si l'option est activée
    let stockItems = [];
    if (useStockOnly) {
        const stock = await Stock.findOne({ createdBy: req.user._id });
        if (stock) {
            // Filtrer par siteId si l'utilisateur a un siteId
            const userSiteId = req.user.siteId ? req.user.siteId.toString() : null;
            if (userSiteId) {
                stockItems = stock.items.filter(item => {
                    const itemSiteId = item.siteId ? item.siteId.toString() : null;
                    return itemSiteId === userSiteId || !itemSiteId;
                });
            } else {
                stockItems = stock.items;
            }
            console.log(`📦 Mode stock activé: ${stockItems.length} articles disponibles`);
        } else {
            console.log(`⚠️ Mode stock activé mais aucun stock trouvé pour l'utilisateur`);
            if (strictMode) {
                return res.status(400).json({
                    success: false,
                    message: 'Aucun stock disponible. Veuillez ajouter des articles au stock ou désactiver le mode "Stock uniquement".'
                });
            }
        }
    }
    
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
    
    // Les objectifs nutritionnels sont maintenant optionnels pour permettre une variété de menus
    
    try {
        const result = await generateCustomMenu({
            numberOfPeople,
            mealType,
            nutritionalGoals: nutritionalGoals || [],
            dietaryRestrictions: dietaryRestrictions || [],
            avoidMenuName,
            forceVariation,
            filtersAsPreferences,
            strictMode,
            prioritizeVariety,
            useFullRecipeCatalog,
            weekdayTheme,
            weeklyProteinPlan,
            antiRepeat,
            dynamicBanProteins,
            periodDays,
            dayIndex,
            useStockOnly,
            stockItems
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

