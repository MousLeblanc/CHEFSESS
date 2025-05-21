// routes/stockRoutes.js - Avec export par défaut
import express from 'express';

const router = express.Router();

router.get('/', (req, res) => {
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
  
  res.json({
    success: true,
    data: stockItems
  });
});

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
  
  res.json({
    success: true,
    data: newItem
  });
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
  
  res.json({
    success: true,
    data: updatedItem
  });
});

router.delete('/:id', (req, res) => {
  const id = req.params.id;
  
  res.json({
    success: true,
    message: 'Ingrédient supprimé avec succès'
  });
});

// Ajoutez d'autres routes au besoin

export default router;