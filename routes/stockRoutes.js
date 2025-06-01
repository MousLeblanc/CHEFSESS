import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getUserStock, updateUserStock } from '../controllers/stockController.js';
import Stock from '../models/Stock.js';
import mongoose from 'mongoose';

const router = express.Router();

router.get('/', protect, getUserStock);
router.put('/', protect, updateUserStock);

// Données de démonstration
  const stockItems = [
    {
      _id: '1',
      name: 'Tomate',
      quantity: 5,
      unit: 'kg',
      category: 'légume',
      alertThreshold: 2,
      isLow: false
    },
    {
      _id: '2',
      name: 'Farine',
      quantity: 1,
      unit: 'kg',
      category: 'céréale',
      alertThreshold: 2,
      isLow: true
    }
  ];
  

router.post('/', (req, res) => {
  const { name, quantity, unit, category, alertThreshold } = req.body;
  
  // Validation
  if (!name || quantity === undefined) {
    return res.status(400).json({ 
      success: false, 
      error: 'Le nom et la quantité sont requis' 
    });
  }
  
  // Simuler la création d'un élément
  const newItem = {
    _id: Date.now().toString(),
    name,
    quantity,
    unit: unit || '',
    category: category || 'autre',
    alertThreshold: alertThreshold || 0,
    isLow: quantity <= (alertThreshold || 0)
  };
  
});

router.put('/:id', (req, res) => {
  const id = req.params.id;
  const { name, quantity, unit, category, alertThreshold } = req.body;
  
  // Simuler la mise à jour
  const updatedItem = {
    _id: id,
    name: name || 'Item',
    quantity: quantity || 0,
    unit: unit || '',
    category: category || 'autre',
    alertThreshold: alertThreshold || 0,
    isLow: (quantity || 0) <= (alertThreshold || 0)
  };

  // You may want to send a response, e.g.:
  res.status(200).json({ success: true, updatedItem });
});


router.post('/seed', protect, async (req, res) => {
  const stock = await Stock.findOneAndUpdate(
    { user: new mongoose.Types.ObjectId(req.user.id) },
    {
      user: new mongoose.Types.ObjectId(req.user.id),
      items: [
        { name: 'Tomates', quantity: 10, unit: 'kg', category: 'fruits-legumes' },
        { name: 'Poulet', quantity: 5, unit: 'kg', category: 'viandes' },
        { name: 'Farine', quantity: 20, unit: 'kg', category: 'epicerie' },
        { name: 'Pommes', quantity: 15, unit: 'kg', category: 'fruits-legumes' },
        { name: 'Lait', quantity: 8, unit: 'l', category: 'boissons' },
        { name: 'Oeufs', quantity: 30, unit: 'piece', category: 'epicerie' }
      ]
    },
    { new: true, upsert: true }
  );

  res.json({ success: true, stock });
});

export default router;


