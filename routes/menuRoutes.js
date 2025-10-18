import express from 'express';
import { 
  generateCollectiviteMenu, 
  generateMaisonRetraiteMenu 
} from '../controllers/menuController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour génération de menu collectivité
router.post('/collectivite', protect, generateCollectiviteMenu);

// Route pour génération de menu maison de retraite
router.post('/maison-retraite', protect, generateMaisonRetraiteMenu);

export default router;