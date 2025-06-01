import asyncHandler from 'express-async-handler';
import Stock from '../models/Stock.js';

// @desc    Obtenir le stock de l'utilisateur connecté
// @route   GET /api/stock
// @access  Private
export const getUserStock = asyncHandler(async (req, res) => {
  const stock = await Stock.findOne({ user: req.user._id });

  if (!stock) {
    return res.status(200).json({ success: true, data: [] });
  }

  res.status(200).json({ success: true, data: stock.items });
});

// @desc    Créer ou mettre à jour le stock utilisateur
// @route   PUT /api/stock
// @access  Private
export const updateUserStock = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items || !Array.isArray(items) || items.length === 0) {
    res.status(400);
    throw new Error('Le stock ne peut pas être vide');
  }

  for (const item of items) {
    if (!item.name || typeof item.quantity !== 'number') {
      res.status(400);
      throw new Error('Le nom et la quantité sont requis pour chaque item');
    }
  }

const stock = await Stock.findOneAndUpdate(
  { user: req.user._id },
  {
    user: req.user._id,     // 🟢 Lien explicite avec l'utilisateur
    items: req.body.items
  },
  { new: true, upsert: true }
);

  res.status(200).json({
    success: true,
    message: 'Stock mis à jour avec succès',
    data: stock
  });
});
