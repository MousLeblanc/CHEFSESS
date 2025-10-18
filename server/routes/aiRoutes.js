import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';
import { generateMenu, generateRecipe } from '../services/openaiService.js';

const router = express.Router();

router.use(protect);

router.post('/generate-menu', asyncHandler(async (req, res) => {
  const result = await generateMenu(req.body);
  res.json(result);
}));

router.post('/generate-recipe', asyncHandler(async (req, res) => {
  const result = await generateRecipe(req.body);
  res.json(result);
}));

export default router;
