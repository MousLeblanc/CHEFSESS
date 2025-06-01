// models/Stock.js
import mongoose from 'mongoose';

const StockSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [
    {
      name: {
        type: String,
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 0
      },
      unit: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true
      },
      expirationDate: {
        type: Date
      },
      alertThreshold: {
        type: Number,
        default: 10
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

// Méthode pour vérifier si un produit est en quantité faible
StockSchema.methods.isLowStock = function(itemId) {
  const item = this.items.id(itemId);
  if (!item) return false;
  
  return item.quantity <= item.alertThreshold;
};

// Méthode pour obtenir tous les produits en quantité faible
StockSchema.methods.getAllLowStockItems = function() {
  return this.items.filter(item => item.quantity <= item.alertThreshold);
};

export default mongoose.model('Stock', StockSchema);