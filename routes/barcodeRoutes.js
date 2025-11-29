// routes/barcodeRoutes.js
// Routes pour la recherche de produits par code-barres
import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getProductByBarcode } from '../services/barcodeService.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Rechercher un produit par code-barres
// @route   GET /api/barcode/:barcode
// @access  Private
router.get('/:barcode', protect, asyncHandler(async (req, res) => {
  const { barcode } = req.params;
  
  if (!barcode || barcode.length < 8) {
    res.status(400);
    throw new Error('Code-barres invalide (minimum 8 caractères)');
  }
  
  console.log(`🔍 Recherche produit par code-barres: ${barcode}`);
  
  const result = await getProductByBarcode(barcode);
  
  if (result.success) {
    res.json({
      success: true,
      data: result.data
    });
  } else {
    res.status(404).json({
      success: false,
      message: result.message || 'Produit non trouvé'
    });
  }
}));

export default router;

