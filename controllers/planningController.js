// controllers/planningController.js
import asyncHandler from 'express-async-handler';
import Menu from '../models/Menu.js';   // Assurez-vous d'avoir un modèle Menu ou Planning
// ... (vos autres imports, ex: openai si generateWeeklyPlanByAI est ici)

// @desc    Générer un planning hebdomadaire par IA
// @route   POST /api/planning/generate-weekly-plan
// @access  Private
export const generateWeeklyPlanByAI = asyncHandler(async (req, res) => { // Ensure 'export' is here
    // ... (your existing code for generateWeeklyPlanByAI) ...
});


// @desc    Obtenir les menus à venir
// @route   GET /api/planning/upcoming
// @access  Private
export const getUpcomingMenus = asyncHandler(async (req, res) => { // Ensure 'export' is here
    // ... (your existing code for getUpcomingMenus) ...
});


// @desc    Obtenir la planification de l'utilisateur
// @route   GET /api/planning/user-planning (or whatever route planningRoutes.js uses for it)
// @access  Private
export const getUserPlanning = asyncHandler(async (req, res) => { // ADD export HERE if it's missing
    const userId = req.user.id;

    // This function should fetch the planning data for the current user.
    // Assuming planning data is stored in the 'Menu' model with a 'date' field
    // or in a separate 'Planning' model.
    
    // Example: Fetch all menus related to the user, or specific planning documents.
    const userPlanning = await Menu.find({ user: userId }).sort({ createdAt: -1 }); // Adjust query as per your schema

    if (!userPlanning) {
        return res.status(200).json({ success: true, data: [] });
    }

    res.status(200).json({ success: true, data: userPlanning });
});