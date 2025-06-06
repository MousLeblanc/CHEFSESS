// routes/authRoutes.js
import express from 'express';
import { register, login, verifyToken } from '../controllers/authController.js'; // Importe depuis le controller
import { protect } from '../middleware/authMiddleware.js'; // Middleware de protection

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/verify', protect, verifyToken); // La route verify est protégée

export default router;