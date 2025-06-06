// routes/menuRoutes.js
import express from 'express';
import {
    generateHomeMenuByAI,
    generateProMenuByAI,
    generateWeeklyPlanByAI,
    getSavedMenus,      
    saveGeneratedMenu   // Si vous avez une fonction pour sauvegarder un menu généré
    // ... importez vos autres fonctions CRUD de menuController.js si besoin (getMenuById, etc.)
} from '../controllers/menuController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

// Route pour maison-dashboard.html
router.post('/generate-home-menu', protect, authorize('maison', 'admin',), generateHomeMenuByAI); // Rôle 'maison' ou 'admin' (ou tous les rôles connectés)

// Route pour menu.html (génération IA pour professionnels)
router.post('/generate-pro-menu', protect, authorize('resto', 'admin'), generateProMenuByAI);

// Route pour planning.html (génération de planning hebdomadaire pour professionnels)
router.post('/generate-weekly-plan', protect, authorize('resto', 'admin'), generateWeeklyPlanByAI);

// Routes pour la gestion des menus sauvegardés (Exemples)
router.get('/saved', protect, getSavedMenus); // Récupère les menus sauvegardés par l'utilisateur
router.post('/save', protect, saveGeneratedMenu); // Sauvegarde un menu généré

// Ajoutez ici vos autres routes CRUD pour les menus si nécessaire, en les important de menuController
// Exemple:
// import { getMenuDetails, updateExistingMenu, deleteExistingMenu } from '../controllers/menuController.js';
// router.get('/:id', protect, getMenuDetails);
// router.put('/:id', protect, authorize('resto', 'admin'), updateExistingMenu);
// router.delete('/:id', protect, authorize('resto', 'admin'), deleteExistingMenu);


export default router;