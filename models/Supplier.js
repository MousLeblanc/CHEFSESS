import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Le nom du fournisseur est requis'],
    trim: true,
    maxlength: [100, 'Le nom ne peut pas dépasser 100 caractères']
  },
  contact: {
    type: String,
    required: [true, 'Le contact est requis'],
    trim: true,
    maxlength: [100, 'Le contact ne peut pas dépasser 100 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Veuillez entrer un email valide']
  },
  phone: {
    type: String,
    required: [true, 'Le téléphone est requis'],
    trim: true,
    match: [/^[0-9\s\-\+\(\)]+$/, 'Veuillez entrer un numéro de téléphone valide']
  },
  address: {
    street: {
      type: String,
      trim: true,
      maxlength: [200, 'L\'adresse ne peut pas dépasser 200 caractères']
    },
    city: {
      type: String,
      trim: true,
      maxlength: [50, 'La ville ne peut pas dépasser 50 caractères']
    },
    postalCode: {
      type: String,
      trim: true,
      match: [/^[0-9]{5}$/, 'Le code postal doit contenir 5 chiffres']
    },
    country: {
      type: String,
      trim: true,
      default: 'France'
    }
  },
  categories: [{
    type: String,
    enum: ['legumes', 'viandes', 'poissons', 'produits-laitiers', 'cereales', 'epices', 'boissons', 'autres'],
    required: true
  }],
  type: {
    type: String,
    enum: ['poissonnier', 'boucher', 'epicier', 'primeur', 'cremier', 'boulanger', 'grossiste'],
    trim: true
  },
  isBio: {
    type: Boolean,
    default: false
  },
  products: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true
    },
    unit: {
      type: String,
      required: true,
      enum: ['kg', 'L', 'pièce', 'boîte', 'unité']
    },
    price: {
      type: Number,
      required: true,
      min: 0
    },
    stock: {
      type: Number,
      default: 0,
      min: 0
    },
    promotion: {
      active: {
        type: Boolean,
        default: false
      },
      discountPercent: {
        type: Number,
        min: 0,
        max: 100
      },
      endDate: Date
    }
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended'],
    default: 'active'
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, 'Les notes ne peuvent pas dépasser 500 caractères']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  establishmentType: {
    type: String,
    enum: ['cantine_scolaire', 'cantine_entreprise', 'ehpad', 'hopital', 'maison_de_retraite', 'autre'],
    required: false
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group'
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
supplierSchema.index({ name: 'text', contact: 'text', email: 'text' });
supplierSchema.index({ categories: 1 });
supplierSchema.index({ status: 1 });
supplierSchema.index({ createdBy: 1 });

export default mongoose.model('Supplier', supplierSchema);
