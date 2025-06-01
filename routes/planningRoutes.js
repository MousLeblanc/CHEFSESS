// routes/planningRoutes.js
import express from 'express';
import { getUserPlanning } from '../controllers/planningController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/planning - Get current user's planning
router.get('/', protect, getUserPlanning);

export default router;
