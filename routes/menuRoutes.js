// routes/menuRoutes.js - Avec export par défaut
import express from 'express';
import { generateMenu } from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';







// Créer un routeur Express
const router = express.Router();
router.post('/generate', protect, generateMenu);

// Routes pour les menus

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
import { generateWeeklyMenu } from '../controllers/menuController.js';
router.post('/generate', protect, generateWeeklyMenu);


// Exporter le routeur comme export par défaut
export default router;

import { getMenusByWeek } from '../controllers/menuController.js';
router.get('/', protect, getMenusByWeek);
import { getMenuById } from '../controllers/menuController.js';
router.get('/:id', protect, getMenuById);   
