// models/Product.js
import mongoose from 'mongoose'; // Changé de require à import

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du produit est requis'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['fruits', 'legumes', 'viandes', 'poissons', 'epicerie', 'boissons']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  unit: {
    type: String,
    required: [true, 'L\'unité est requise'],
    enum: ['kg', 'g', 'l', 'piece']
  },
  deliveryTime: {
    type: Number,
    required: [true, 'Le délai de livraison est requis'],
    min: [1, 'Le délai minimum est de 1 jour']
  },
  minOrder: {
    type: Number,
    required: [true, 'La commande minimum est requise'],
    min: [1, 'La commande minimum doit être supérieure à 0']
  },
  supplier: { // Utilisateur qui a le rôle 'fournisseur'
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le fournisseur est requis']
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index pour améliorer les performances des recherches
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ active: 1 });

const Product = mongoose.model('Product', productSchema); // Changé pour définir Product avant d'exporter
export default Product; // Changé de module.exports