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
    enum: ['fruits-legumes', 'viandes', 'poissons', 'epicerie', 'boissons', 'produits-laitiers', 'boulangerie', 'autres']
  },
  price: {
    type: Number,
    required: [true, 'Le prix est requis'],
    min: [0, 'Le prix ne peut pas être négatif']
  },
  unit: {
    type: String,
    required: [true, 'L\'unité est requise'],
    enum: ['kg', 'g', 'litre', 'ml', 'pièce', 'paquet', 'boîte', 'sachet', 'bouteille', 'portion', 'carton']
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
  stock: {
    type: Number,
    default: 0,
    min: [0, 'Le stock ne peut pas être négatif']
  },
  stockAlert: { // Seuil d'alerte de stock bas
    type: Number,
    default: 10
  },
  active: {
    type: Boolean,
    default: true
  },
  description: {
    type: String,
    trim: true
  },
  promo: {
    type: Number,
    default: 0,
    min: [0, 'La promotion ne peut pas être négative'],
    max: [100, 'La promotion ne peut pas dépasser 100%']
  },
  saveProduct: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Méthodes pour gérer le stock
productSchema.methods.decreaseStock = async function(quantity) {
  if (this.stock < quantity) {
    throw new Error(`Stock insuffisant pour ${this.name}. Disponible: ${this.stock}, Demandé: ${quantity}`);
  }
  this.stock -= quantity;
  await this.save();
  console.log(`📉 Stock de ${this.name} diminué: ${this.stock + quantity} → ${this.stock} ${this.unit}`);
  return this;
};

productSchema.methods.increaseStock = async function(quantity) {
  this.stock += quantity;
  await this.save();
  console.log(`📈 Stock de ${this.name} augmenté: ${this.stock - quantity} → ${this.stock} ${this.unit}`);
  return this;
};

productSchema.methods.isLowStock = function() {
  return this.stock <= this.stockAlert;
};

// Index pour améliorer les performances des recherches
productSchema.index({ category: 1 });
productSchema.index({ supplier: 1 });
productSchema.index({ active: 1 });
productSchema.index({ stock: 1 });

const Product = mongoose.model('Product', productSchema); // Changé pour définir Product avant d'exporter
export default Product; // Changé de module.exports