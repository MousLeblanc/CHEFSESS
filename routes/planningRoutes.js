// routes/planningRoutes.js
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { 
    generateWeeklyPlanByAI, 
    getUpcomingMenus,
    getUserPlanning // Ensure getUserPlanning is imported
} from '../controllers/planningController.js'; 

const router = express.Router();

router.post('/generate-weekly-plan', protect, generateWeeklyPlanByAI);
router.get('/upcoming', protect, getUpcomingMenus);

// NEW: Route for getting user planning data
// @desc    Obtenir la planification de l'utilisateur
// @route   GET /api/planning/user-planning (Choose an appropriate path)
// @access  Private
router.get('/user-planning', protect, getUserPlanning);

export default router;