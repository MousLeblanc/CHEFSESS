// controllers/cartController.js - VERSION CORRIGÉE

import Cart from '../models/Cart.js';
import Product from '../models/Product.js'; // <-- 1. IMPORT LE MODÈLE PRODUCT

/**
 * @desc    Get user's shopping cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  const cart = await Cart.findOne({ user: req.user.id }).populate('items.productId', 'name price unit');
  res.json(cart || { user: req.user.id, items: [] });
};

/**
 * @desc    Update or create user's shopping cart
 * @route   PUT /api/cart
 * @access  Private
 */
export const updateCart = async (req, res) => {
  const { items } = req.body;

  if (!Array.isArray(items)) {
    return res.status(400).json({ message: "Le format des articles est invalide." });
  }

  try {
    // 2. VALIDER LES PRODUITS AVANT DE SAUVEGARDER
    if (items.length > 0) {
      const productIds = items.map(item => item.productId);

      // Compter combien de ces IDs existent réellement dans la base de données
      const validProductsCount = await Product.countDocuments({ _id: { $in: productIds } });

      if (validProductsCount !== productIds.length) {
        res.status(400);
        throw new Error("Le panier contient un ou plusieurs produits invalides ou non disponibles.");
      }
    }

    // 3. Nettoyer les données pour ne garder que ce qui est nécessaire
    const sanitizedItems = items.map(item => ({
        productId: item.productId,
        quantity: Math.max(1, parseInt(item.quantity) || 1) // Assure une quantité positive
    }));

    // 4. Mettre à jour le panier uniquement avec des données validées et nettoyées
    const cart = await Cart.findOneAndUpdate(
      { user: req.user.id },
      { items: sanitizedItems },
      { new: true, upsert: true, runValidators: true }
    ).populate('items.productId', 'name price unit');
    
    res.json(cart);

  } catch (error) {
    res.status(500).json({ message: error.message || "Erreur lors de la mise à jour du panier." });
  }
};

/**
 * @desc    Clear user's shopping cart
 * @route   DELETE /api/cart
 * @access  Private
 */
export const clearCart = async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user.id });
  res.json({ success: true, message: "Panier vidé avec succès." });
};