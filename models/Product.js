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
  // Image du produit (URL depuis Open Food Facts ou autre source)
  imageUrl: {
    type: String,
    trim: true
  },
  // Code-barres (EAN-13, UPC, etc.)
  barcode: {
    type: String,
    trim: true,
    sparse: true, // Permet plusieurs produits sans code-barres
    validate: {
      validator: function(v) {
        // Valider le format du code-barres (8-13 chiffres)
        return !v || /^\d{8,13}$/.test(v);
      },
      message: 'Le code-barres doit contenir entre 8 et 13 chiffres'
    }
  },
  // Informations de traçabilité (exigences AFSCA)
  traceability: {
    countryOfOrigin: {
      type: String,
      trim: true
    },
    batchNumber: {
      type: String,
      trim: true
    },
    traceabilityNumber: {
      type: String,
      trim: true
    },
    healthStamp: {
      type: String,
      trim: true
    },
    productionDate: {
      type: Date
    },
    useByDate: {
      type: Date
    },
    bestBeforeDate: {
      type: Date
    },
    commercialPresentation: {
      type: String,
      enum: ['réfrigéré', 'surgelé', 'conserve', '4ème gamme', '5ème gamme', 'autre']
    },
    qualityLabel: {
      hasLabel: {
        type: Boolean,
        default: false
      },
      labelType: {
        type: String,
        enum: ['AOC', 'Label Rouge', 'AB', 'autre', '']
      }
    },
    category: {
      type: String,
      trim: true
    },
    class: {
      type: String,
      enum: ['A', 'B', '']
    }
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
  },
  superPromo: {
    active: {
      type: Boolean,
      default: false
    },
    promoPrice: {
      type: Number,
      min: [0, 'Le prix promotionnel ne peut pas être négatif']
    },
    promoQuantity: {
      type: Number,
      min: [0, 'La quantité ne peut pas être négative']
    },
    endDate: {
      type: Date
    }
  },
  toSave: {
    active: {
      type: Boolean,
      default: false
    },
    savePrice: {
      type: Number,
      min: [0, 'Le prix ne peut pas être négatif']
    },
    saveQuantity: {
      type: Number,
      min: [0, 'La quantité ne peut pas être négative']
    },
    expirationDate: {
      type: Date
    }
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
productSchema.index({ barcode: 1 }); // Index pour recherche par code-barres

const Product = mongoose.model('Product', productSchema); // Changé pour définir Product avant d'exporter
export default Product; // Changé de module.exports