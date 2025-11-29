// models/DeliveryReceipt.js
// Modèle pour les formulaires de réception de marchandises
import mongoose from 'mongoose';

const deliveryReceiptSchema = new mongoose.Schema({
  // Architecture multi-sites
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group" 
  },
  siteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Site" 
  },
  
  // Référence à la commande
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  orderNumber: {
    type: String
  },
  
  // Date et heure de livraison
  deliveryDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  deliveryTime: {
    type: String // Format HH:mm
  },
  
  // IDENTIFICATION DU PRODUIT
  productIdentification: {
    name: String,
    referenceNumber: String,
    commercialPresentation: {
      type: String,
      enum: ['réfrigéré', 'surgelé', 'conserve', '4ème gamme', '5ème gamme', 'autre']
    },
    source: String,
    countryOfOrigin: String,
    batchNumber: String,
    healthStamp: String
  },
  
  // FOURNISSEUR
  supplier: {
    name: String,
    businessName: String,
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: String
    },
    qualityStandards: [{
      type: String,
      enum: ['ISO 9000', 'ISO 9001', 'ISO 22000', 'HACCP', 'IFS', 'BRC', 'autre']
    }],
    approvalNumber: String,
    deliveryDriverName: String,
    transportCompany: String
  },
  
  // EMBALLAGE
  packaging: {
    integrity: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    labellingCompliance: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    }
  },
  
  // TRANSPORT / LIVRAISON
  transport: {
    vehicleCleanliness: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    enclosureTemperature: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    driverCleanliness: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    orderComparison: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    temperature: Number, // Température mesurée
    notes: String
  },
  
  // EXAMEN ORGANOLEPTIQUE
  organolepticExamination: {
    appearance: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    odour: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    colour: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    quality: {
      type: String,
      enum: ['conforme', 'non_conforme'],
      default: 'conforme'
    },
    notes: String
  },
  
  // CRITÈRES D'ACCEPTATION
  acceptanceStatus: {
    type: String,
    enum: ['accepted', 'conditionally_accepted', 'refused'],
    required: true,
    default: 'accepted'
  },
  acceptanceNotes: String,
  
  // ÉTIQUETAGE DU PRODUIT
  productLabelling: {
    totalTraceability: {
      type: Boolean,
      default: false
    },
    qualityLabel: {
      hasLabel: Boolean,
      labelType: {
        type: String,
        enum: ['AOC', 'Label Rouge', 'AB', 'autre', '']
      }
    },
    category: String,
    class: {
      type: String,
      enum: ['A', 'B', '']
    },
    productionDate: Date,
    useByDate: Date,
    remainingShelfLife: Number, // En jours
    bestBeforeDate: Date,
    coreTemperature: Number,
    netWeightAtPacking: Number,
    numberOfPieces: Number
  },
  
  // Informations de contrôle
  checkedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  signature: String, // Base64 ou chemin vers fichier
  
  // Archivage automatique
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,
  
  // Métadonnées
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
deliveryReceiptSchema.index({ siteId: 1, deliveryDate: -1 });
deliveryReceiptSchema.index({ order: 1 });
deliveryReceiptSchema.index({ groupId: 1 });
deliveryReceiptSchema.index({ acceptanceStatus: 1 });
deliveryReceiptSchema.index({ archived: 1, archivedAt: -1 });
deliveryReceiptSchema.index({ checkedBy: 1 });

// Middleware pour archiver automatiquement après 30 jours
deliveryReceiptSchema.pre('save', function(next) {
  if (!this.archived && this.createdAt) {
    const daysSinceCreation = (Date.now() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceCreation >= 30) {
      this.archived = true;
      this.archivedAt = new Date();
    }
  }
  next();
});

export default mongoose.model('DeliveryReceipt', deliveryReceiptSchema);

