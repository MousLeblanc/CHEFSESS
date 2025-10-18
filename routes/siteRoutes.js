import express from 'express';
import { 
    siteLogin, 
    siteLogout, 
    getSiteData, 
    getSiteMenus,
    createSiteUser,
    updateSiteUser
} from '../controllers/siteController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes publiques
router.post('/login', siteLogin);
router.post('/logout', siteLogout);

// Routes protégées
router.get('/:siteId', protect, getSiteData);
router.get('/:siteId/menus', protect, getSiteMenus);

// Gestion des utilisateurs de site
router.post('/:siteId/users', protect, createSiteUser);
router.put('/:siteId/users/:userId', protect, updateSiteUser);

export default router;
