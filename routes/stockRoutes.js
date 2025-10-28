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

// Route pour déduire des éléments du stock (utilisé après la génération de menu)
// ⚠️ DOIT ÊTRE AVANT /:id pour éviter que "deduct" soit interprété comme un ID
router.put('/deduct', protect, deductStockItems);

// Route pour mettre à jour un ingrédient spécifique par ID
router.put('/:id', protect, updateStockItem);

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

// Route pour le seeding du stock (ajout de données de démonstration enrichies)
router.post('/seed', protect, async (req, res) => {
  // Charger ou créer le stock utilisateur
  let userStock = await Stock.findOne({ createdBy: req.user._id });
  
  if (!userStock) {
    userStock = new Stock({ 
      createdBy: req.user._id,
      establishmentType: req.user.establishmentType || 'autre',
      items: [] 
    });
  }
  
  // Définir les articles du seed
  const seedItems = [
        // ========== VIANDES (quantités > 100 kg) ==========
        { name: 'Bœuf', quantity: 150, unit: 'kg', category: 'viandes', price: 12.5, alertThreshold: 30 },
        { name: 'Porc', quantity: 120, unit: 'kg', category: 'viandes', price: 8.9, alertThreshold: 25 },
        { name: 'Veau', quantity: 110, unit: 'kg', category: 'viandes', price: 15.0, alertThreshold: 20 },
        { name: 'Agneau', quantity: 105, unit: 'kg', category: 'viandes', price: 14.5, alertThreshold: 20 },
        { name: 'Steak haché', quantity: 130, unit: 'kg', category: 'viandes', price: 10.5, alertThreshold: 25 },
        { name: 'Saucisses', quantity: 115, unit: 'kg', category: 'viandes', price: 7.8, alertThreshold: 20 },
        { name: 'Merguez', quantity: 108, unit: 'kg', category: 'viandes', price: 8.2, alertThreshold: 20 },
        
        // ========== VOLAILLES (quantités > 100 kg) ==========
        { name: 'Poulet', quantity: 200, unit: 'kg', category: 'viandes', price: 6.5, alertThreshold: 40 },
        { name: 'Dinde', quantity: 150, unit: 'kg', category: 'viandes', price: 7.2, alertThreshold: 30 },
        { name: 'Canard', quantity: 110, unit: 'kg', category: 'viandes', price: 9.5, alertThreshold: 20 },
        { name: 'Pintade', quantity: 105, unit: 'kg', category: 'viandes', price: 8.8, alertThreshold: 20 },
        
        // ========== POISSONS (quantités > 100 kg) ==========
        { name: 'Saumon', quantity: 125, unit: 'kg', category: 'poissons', price: 18.5, alertThreshold: 25 },
        { name: 'Cabillaud', quantity: 130, unit: 'kg', category: 'poissons', price: 12.0, alertThreshold: 25 },
        { name: 'Thon', quantity: 115, unit: 'kg', category: 'poissons', price: 15.5, alertThreshold: 20 },
        { name: 'Truite', quantity: 110, unit: 'kg', category: 'poissons', price: 11.5, alertThreshold: 20 },
        { name: 'Sardine', quantity: 120, unit: 'kg', category: 'poissons', price: 6.5, alertThreshold: 25 },
        { name: 'Lieu noir', quantity: 105, unit: 'kg', category: 'poissons', price: 8.0, alertThreshold: 20 },
        
        // ========== LÉGUMES (quantités > 100 kg) ==========
        { name: 'Tomates', quantity: 180, unit: 'kg', category: 'legumes', price: 2.5, alertThreshold: 35 },
        { name: 'Carottes', quantity: 200, unit: 'kg', category: 'legumes', price: 1.8, alertThreshold: 40 },
        { name: 'Pommes de terre', quantity: 250, unit: 'kg', category: 'legumes', price: 1.2, alertThreshold: 50 },
        { name: 'Oignons', quantity: 150, unit: 'kg', category: 'legumes', price: 1.5, alertThreshold: 30 },
        { name: 'Poivrons', quantity: 120, unit: 'kg', category: 'legumes', price: 3.2, alertThreshold: 25 },
        { name: 'Courgettes', quantity: 140, unit: 'kg', category: 'legumes', price: 2.0, alertThreshold: 28 },
        { name: 'Aubergines', quantity: 115, unit: 'kg', category: 'legumes', price: 2.8, alertThreshold: 23 },
        { name: 'Brocolis', quantity: 110, unit: 'kg', category: 'legumes', price: 3.5, alertThreshold: 22 },
        { name: 'Chou-fleur', quantity: 125, unit: 'kg', category: 'legumes', price: 2.9, alertThreshold: 25 },
        { name: 'Épinards', quantity: 130, unit: 'kg', category: 'legumes', price: 4.2, alertThreshold: 26 },
        { name: 'Haricots verts', quantity: 135, unit: 'kg', category: 'legumes', price: 3.8, alertThreshold: 27 },
        { name: 'Petits pois', quantity: 145, unit: 'kg', category: 'legumes', price: 3.0, alertThreshold: 29 },
        { name: 'Concombres', quantity: 105, unit: 'kg', category: 'legumes', price: 1.9, alertThreshold: 21 },
        { name: 'Salades', quantity: 115, unit: 'kg', category: 'legumes', price: 2.2, alertThreshold: 23 },
        { name: 'Champignons', quantity: 108, unit: 'kg', category: 'legumes', price: 5.5, alertThreshold: 22 },
        
        // ========== FÉCULENTS (quantités > 100 kg) ==========
        { name: 'Pâtes', quantity: 300, unit: 'kg', category: 'cereales', price: 1.5, alertThreshold: 60 },
        { name: 'Riz blanc', quantity: 280, unit: 'kg', category: 'cereales', price: 1.8, alertThreshold: 56 },
        { name: 'Riz complet', quantity: 200, unit: 'kg', category: 'cereales', price: 2.2, alertThreshold: 40 },
        { name: 'Quinoa', quantity: 150, unit: 'kg', category: 'cereales', price: 5.5, alertThreshold: 30 },
        { name: 'Boulgour', quantity: 140, unit: 'kg', category: 'cereales', price: 2.8, alertThreshold: 28 },
        { name: 'Semoule', quantity: 180, unit: 'kg', category: 'cereales', price: 2.0, alertThreshold: 36 },
        { name: 'Lentilles', quantity: 160, unit: 'kg', category: 'cereales', price: 3.2, alertThreshold: 32 },
        { name: 'Pois chiches', quantity: 145, unit: 'kg', category: 'cereales', price: 3.5, alertThreshold: 29 },
        { name: 'Haricots blancs', quantity: 130, unit: 'kg', category: 'cereales', price: 2.9, alertThreshold: 26 },
        { name: 'Haricots rouges', quantity: 125, unit: 'kg', category: 'cereales', price: 3.0, alertThreshold: 25 },
        { name: 'Farine', quantity: 220, unit: 'kg', category: 'cereales', price: 1.2, alertThreshold: 44 },
        { name: 'Polenta', quantity: 110, unit: 'kg', category: 'cereales', price: 2.5, alertThreshold: 22 },
        
        // ========== PRODUITS LAITIERS ==========
        { name: 'Lait', quantity: 500, unit: 'litre', category: 'produits-laitiers', price: 1.1, alertThreshold: 100 },
        { name: 'Yaourts nature', quantity: 600, unit: 'pièce', category: 'produits-laitiers', price: 0.4, alertThreshold: 120 },
        { name: 'Fromage blanc', quantity: 150, unit: 'kg', category: 'produits-laitiers', price: 3.5, alertThreshold: 30 },
        { name: 'Crème fraîche', quantity: 120, unit: 'litre', category: 'produits-laitiers', price: 2.8, alertThreshold: 24 },
        { name: 'Beurre', quantity: 110, unit: 'kg', category: 'produits-laitiers', price: 8.5, alertThreshold: 22 },
        { name: 'Emmental râpé', quantity: 105, unit: 'kg', category: 'produits-laitiers', price: 12.0, alertThreshold: 21 },
        { name: 'Mozzarella', quantity: 108, unit: 'kg', category: 'produits-laitiers', price: 11.5, alertThreshold: 22 },
        { name: 'Oeufs', quantity: 1500, unit: 'pièce', category: 'produits-laitiers', price: 0.2, alertThreshold: 300 },
        
        // ========== FRUITS (quantités > 100 kg) ==========
        { name: 'Pommes', quantity: 200, unit: 'kg', category: 'fruits', price: 1.8, alertThreshold: 40 },
        { name: 'Oranges', quantity: 180, unit: 'kg', category: 'fruits', price: 2.2, alertThreshold: 36 },
        { name: 'Bananes', quantity: 150, unit: 'kg', category: 'fruits', price: 1.5, alertThreshold: 30 },
        { name: 'Poires', quantity: 120, unit: 'kg', category: 'fruits', price: 2.5, alertThreshold: 24 },
        { name: 'Fraises', quantity: 110, unit: 'kg', category: 'fruits', price: 5.5, alertThreshold: 22 },
        { name: 'Kiwis', quantity: 115, unit: 'kg', category: 'fruits', price: 3.8, alertThreshold: 23 },
        { name: 'Raisin', quantity: 125, unit: 'kg', category: 'fruits', price: 4.2, alertThreshold: 25 },
        { name: 'Melons', quantity: 130, unit: 'kg', category: 'fruits', price: 2.8, alertThreshold: 26 },
        { name: 'Pastèques', quantity: 140, unit: 'kg', category: 'fruits', price: 1.9, alertThreshold: 28 },
        { name: 'Pêches', quantity: 105, unit: 'kg', category: 'fruits', price: 3.5, alertThreshold: 21 },
        
        // ========== HUILES ET CONDIMENTS ==========
        { name: 'Huile d\'olive', quantity: 150, unit: 'litre', category: 'autres', price: 6.0, alertThreshold: 30 },
        { name: 'Huile de tournesol', quantity: 200, unit: 'litre', category: 'autres', price: 3.5, alertThreshold: 40 },
        { name: 'Vinaigre', quantity: 120, unit: 'litre', category: 'autres', price: 2.0, alertThreshold: 24 },
        { name: 'Moutarde', quantity: 50, unit: 'kg', category: 'autres', price: 4.5, alertThreshold: 10 },
        { name: 'Mayonnaise', quantity: 45, unit: 'kg', category: 'autres', price: 5.2, alertThreshold: 9 },
        { name: 'Ketchup', quantity: 40, unit: 'kg', category: 'autres', price: 3.8, alertThreshold: 8 },
        { name: 'Sauce soja', quantity: 35, unit: 'litre', category: 'autres', price: 6.5, alertThreshold: 7 },
        { name: 'Concentré de tomate', quantity: 60, unit: 'kg', category: 'autres', price: 3.2, alertThreshold: 12 },
        
        // ========== ÉPICES ET AROMATES ==========
        { name: 'Sel', quantity: 50, unit: 'kg', category: 'epices', price: 0.8, alertThreshold: 10 },
        { name: 'Poivre', quantity: 25, unit: 'kg', category: 'epices', price: 15.0, alertThreshold: 5 },
        { name: 'Herbes de Provence', quantity: 15, unit: 'kg', category: 'epices', price: 12.0, alertThreshold: 3 },
        { name: 'Paprika', quantity: 12, unit: 'kg', category: 'epices', price: 18.0, alertThreshold: 2 },
        { name: 'Cumin', quantity: 10, unit: 'kg', category: 'epices', price: 20.0, alertThreshold: 2 },
        { name: 'Curry', quantity: 14, unit: 'kg', category: 'epices', price: 16.0, alertThreshold: 3 },
        { name: 'Ail', quantity: 2000, unit: 'pièce', category: 'epices', price: 0.08, alertThreshold: 100 },
        { name: 'Persil', quantity: 20, unit: 'kg', category: 'epices', price: 8.0, alertThreshold: 4 },
        { name: 'Basilic', quantity: 15, unit: 'kg', category: 'epices', price: 12.0, alertThreshold: 3 },
        { name: 'Thym', quantity: 10, unit: 'kg', category: 'epices', price: 15.0, alertThreshold: 2 },
        { name: 'Laurier', quantity: 8, unit: 'kg', category: 'epices', price: 18.0, alertThreshold: 2 },
        { name: 'Coriandre', quantity: 12, unit: 'kg', category: 'epices', price: 14.0, alertThreshold: 2 },
        
        // ========== BOISSONS ==========
        { name: 'Eau minérale', quantity: 1000, unit: 'litre', category: 'boissons', price: 0.3, alertThreshold: 200 },
        { name: 'Jus d\'orange', quantity: 300, unit: 'litre', category: 'boissons', price: 1.8, alertThreshold: 60 },
        { name: 'Jus de pomme', quantity: 250, unit: 'litre', category: 'boissons', price: 1.5, alertThreshold: 50 }
      ];
  
  // Fusionner les items du seed avec les items existants (ne pas écraser les items ajoutés manuellement)
  let addedCount = 0;
  for (const seedItem of seedItems) {
    // Vérifier si l'item existe déjà (par nom et unité)
    const existingItem = userStock.items.find(
      item => item.name.toLowerCase() === seedItem.name.toLowerCase() && 
              item.unit.toLowerCase() === seedItem.unit.toLowerCase()
    );
    
    if (!existingItem) {
      // Ajouter uniquement si l'item n'existe pas
      userStock.items.push(seedItem);
      addedCount++;
    }
  }
  
  // Sauvegarder le stock
  await userStock.save();
  
  res.status(200).json({ 
    success: true, 
    message: `Stock enrichi ! ${addedCount} nouveaux ingrédients ajoutés. Total : ${userStock.items.length} articles.`, 
    data: userStock.items 
  });
});


export default router;