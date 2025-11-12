// routes/authRoutes.js
import express from 'express';
import { register, login, refreshToken, checkToken, getMe, logout, getCSRFToken } from '../controllers/authController.js'; // Import from controller
import { protect } from '../middleware/authMiddleware.js'; // Protection middleware

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout); // 🔐 Nouvelle route de déconnexion
router.post('/refresh-token', refreshToken);
router.get('/check-token', protect, checkToken);
router.get('/verify', protect, checkToken); // Alias pour check-token
router.get('/me', protect, getMe); // Route pour obtenir les infos de l'utilisateur connecté
router.get('/csrf-token', protect, getCSRFToken); // 🔒 Route pour obtenir le token CSRF

export default router;