import mongoose from 'mongoose';

const stockItemSchema = new mongoose.Schema({
  // Architecture multi-sites
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group" 
  },
  siteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Site" 
  },
  
  name: {
    type: String,
    required: [true, 'Le nom de l\'article est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  category: {
    type: String,
    required: [true, 'La catégorie est requise'],
    enum: ['legumes', 'viandes', 'poissons', 'produits-laitiers', 'cereales', 'epices', 'boissons', 'fruits', 'autres']
  },
  quantity: {
    type: Number,
    required: [true, 'La quantité est requise'],
    min: [0, 'La quantité ne peut pas être négative']
  },
  unit: {
    type: String,
    required: [true, 'L\'unité est requise']
  },
  expirationDate: {
    type: Date
  },
  purchaseDate: {
    type: Date,
    default: Date.now
  },
  price: {
    type: Number,
    min: [0, 'Le prix ne peut pas être négatif']
  },
  supplier: {
    type: String,
    trim: true,
    maxlength: [100, 'Le nom du fournisseur ne peut pas dépasser 100 caractères']
  },
  location: {
    type: String,
    trim: true,
    maxlength: [50, 'L\'emplacement ne peut pas dépasser 50 caractères']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
  },
  status: {
    type: String,
    enum: ['available', 'low_stock', 'expired', 'out_of_stock'],
    default: 'available'
  }
});

// Schéma principal du Stock (contient une liste d'articles)
const stockSchema = new mongoose.Schema({
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true // Un seul stock par utilisateur
  },
  establishmentType: {
    type: String,
    enum: ['cantine_scolaire', 'cantine_entreprise', 'ehpad', 'hopital', 'maison_de_retraite', 'autre'],
    required: true
  },
  items: [stockItemSchema] // Liste des articles en stock
}, {
  timestamps: true
});

// Index pour optimiser les recherches
stockSchema.index({ createdBy: 1 });
stockSchema.index({ establishmentType: 1 });
stockSchema.index({ groupId: 1 });
stockSchema.index({ siteId: 1 });
stockSchema.index({ groupId: 1, siteId: 1 });

export default mongoose.model('Stock', stockSchema);