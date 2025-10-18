import express from 'express';
import multer from 'multer'; // Importation de multer pour la gestion des fichiers
import { protect } from '../middleware/authMiddleware.js';
import {
  getUserStock,
  updateUserStock,
  getStockByCategory,
  getExpiringItems,
  getStockValue,
  addItemToStock,
  updateStockItem,
  deductStockItems 
} from '../controllers/stockController.js';
import { processOcrDeliveryNote } from '../controllers/ocrController.js';
import Stock from '../models/Stock.js';
import mongoose from 'mongoose';

// --- Configuration de multer ---
// On uniformise pour utiliser memoryStorage pour toutes les opérations de fichier
// Cela rendra le buffer (req.file.buffer) disponible dans les contrôleurs
const upload = multer({ storage: multer.memoryStorage() });


const router = express.Router();

// Routes de base
router.get('/', protect, getUserStock);
router.put('/', protect, updateUserStock); // Pour les mises à jour en masse du stock
router.post('/', protect, addItemToStock); // Pour ajouter un seul nouvel ingrédient

// Route OCR
router.post('/ocr', protect, upload.single('file'), processOcrDeliveryNote); // Utilise 'upload' avec memoryStorage

// Routes pour les fonctionnalités avancées
router.get('/category/:category', protect, getStockByCategory);
router.get('/expiring/:days?', protect, getExpiringItems);
router.get('/value', protect, getStockValue);

// Route pour récupérer un ingrédient spécifique par ID
router.get('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;

    const userStock = await Stock.findOne({ createdBy: userId });

    if (!userStock) {
      return res.status(404).json({ success: false, message: 'Stock utilisateur non trouvé.' });
    }

    const item = userStock.items.id(itemId); // Find by subdocument ID

    if (!item) {
      return res.status(404).json({ success: false, message: 'Ingrédient non trouvé dans le stock.' });
    }

    res.status(200).json({ success: true, data: item });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'ingrédient:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour mettre à jour un ingrédient spécifique par ID
router.put('/:id', protect, updateStockItem);

// Route pour déduire des éléments du stock (utilisé après la génération de menu)
router.put('/deduct', protect, deductStockItems); 

// Route pour supprimer un ingrédient spécifique
router.delete('/:id', protect, async (req, res) => {
  try {
    const userId = req.user._id;
    const itemId = req.params.id;

    const userStock = await Stock.findOne({ createdBy: userId });

    if (!userStock) {
      return res.status(404).json({ success: false, message: 'Stock utilisateur non trouvé.' });
    }

    const itemIndex = userStock.items.findIndex(item => item._id.toString() === itemId);

    if (itemIndex === -1) {
      return res.status(404).json({ success: false, message: 'Ingrédient non trouvé dans le stock.' });
    }

    const deletedItem = userStock.items.splice(itemIndex, 1); // Remove the item
    await userStock.save();

    res.status(200).json({ success: true, message: 'Item deleted successfully', deletedItem });
  } catch (error) {
    console.error('Error deleting item:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Route pour le seeding du stock (ajout de données de démonstration)
router.post('/seed', protect, async (req, res) => {
  const stock = await Stock.findOneAndUpdate(
    { createdBy: req.user._id },
    {
      createdBy: req.user._id,
      establishmentType: req.user.establishmentType || 'autre',
      items: [
        { name: 'Tomates', quantity: 10, unit: 'kg', category: 'legumes', price: 2.5, alertThreshold: 3 },
        { name: 'Poulet', quantity: 5, unit: 'kg', category: 'viandes', price: 8.9, alertThreshold: 2 },
        { name: 'Farine', quantity: 20, unit: 'kg', category: 'cereales', price: 1.2, alertThreshold: 5 },
        { name: 'Pommes', quantity: 15, unit: 'kg', category: 'fruits', price: 1.8, alertThreshold: 4 },
        { name: 'Lait', quantity: 8, unit: 'l', category: 'boissons', price: 1.1, alertThreshold: 3 },
        { name: 'Oeufs', quantity: 30, unit: 'pièce', category: 'produits-laitiers', price: 0.2, alertThreshold: 10 },
        { name: 'Pâtes', quantity: 10, unit: 'kg', category: 'cereales', price: 1.5, alertThreshold: 3 },
        { name: 'Riz', quantity: 15, unit: 'kg', category: 'cereales', price: 1.8, alertThreshold: 4 },
        { name: 'Thon en conserve', quantity: 12, unit: 'boîte', category: 'autres', price: 1.0, alertThreshold: 5 },
        { name: 'Huile d\'olive', quantity: 5, unit: 'l', category: 'autres', price: 6.0, alertThreshold: 1 }
      ]
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  res.status(200).json({ success: true, message: 'Stock seeded/updated successfully', data: stock.items });
});


export default router;