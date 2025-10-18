import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
const router = express.Router();
router.use(protect);
router.get('/', (req, res) => res.json([]));
export default router;
