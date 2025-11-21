import mongoose from 'mongoose';

const supplierRatingSchema = new mongoose.Schema({
  // Référence au fournisseur
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le fournisseur est requis'],
    index: true
  },
  
  // Référence au site/client qui a donné l'avis
  site: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Site',
    required: false
  },
  
  // Référence à l'utilisateur qui a donné l'avis
  reviewer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Le reviewer est requis']
  },
  
  // Note globale (1-5 étoiles)
  overallRating: {
    type: Number,
    required: [true, 'La note globale est requise'],
    min: 1,
    max: 5
  },
  
  // Notes détaillées par critère
  ratings: {
    price: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    deliveryTime: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    productQuality: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    communication: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    },
    packaging: {
      type: Number,
      min: 1,
      max: 5,
      required: false
    }
  },
  
  // Commentaires détaillés
  feedback: {
    positive: {
      type: String,
      trim: true,
      maxlength: [1000, 'Les points positifs ne peuvent pas dépasser 1000 caractères']
    },
    negative: {
      type: String,
      trim: true,
      maxlength: [1000, 'Les points négatifs ne peuvent pas dépasser 1000 caractères']
    },
    suggestions: {
      type: String,
      trim: true,
      maxlength: [1000, 'Les suggestions ne peuvent pas dépasser 1000 caractères']
    }
  },
  
  // Référence à la commande (optionnel)
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  
  // Statut de l'avis
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'approved'
  },
  
  // Date de la commande concernée
  orderDate: {
    type: Date,
    required: false
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
supplierRatingSchema.index({ supplier: 1, createdAt: -1 });
supplierRatingSchema.index({ site: 1, createdAt: -1 });
supplierRatingSchema.index({ reviewer: 1 });

// Méthode statique pour calculer la note moyenne d'un fournisseur
supplierRatingSchema.statics.getAverageRating = async function(supplierId) {
  // Convertir en ObjectId si nécessaire
  let supplierObjectId;
  if (typeof supplierId === 'string') {
    try {
      supplierObjectId = new mongoose.Types.ObjectId(supplierId);
    } catch (error) {
      console.error('Erreur lors de la conversion de supplierId en ObjectId:', error);
      // Retourner des valeurs par défaut si l'ID est invalide
      return {
        averageRating: 0,
        count: 0,
        priceAvg: 0,
        deliveryAvg: 0,
        qualityAvg: 0,
        communicationAvg: 0,
        packagingAvg: 0
      };
    }
  } else {
    supplierObjectId = supplierId;
  }
  
  const result = await this.aggregate([
    { $match: { supplier: supplierObjectId, status: 'approved' } },
    { $group: {
      _id: null,
      averageRating: { $avg: '$overallRating' },
      count: { $sum: 1 },
      priceAvg: { $avg: '$ratings.price' },
      deliveryAvg: { $avg: '$ratings.deliveryTime' },
      qualityAvg: { $avg: '$ratings.productQuality' },
      communicationAvg: { $avg: '$ratings.communication' },
      packagingAvg: { $avg: '$ratings.packaging' }
    }}
  ]);
  
  if (result.length === 0) {
    return {
      averageRating: 0,
      count: 0,
      priceAvg: 0,
      deliveryAvg: 0,
      qualityAvg: 0,
      communicationAvg: 0,
      packagingAvg: 0
    };
  }
  
  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    count: result[0].count,
    priceAvg: Math.round(result[0].priceAvg * 10) / 10 || 0,
    deliveryAvg: Math.round(result[0].deliveryAvg * 10) / 10 || 0,
    qualityAvg: Math.round(result[0].qualityAvg * 10) / 10 || 0,
    communicationAvg: Math.round(result[0].communicationAvg * 10) / 10 || 0,
    packagingAvg: Math.round(result[0].packagingAvg * 10) / 10 || 0
  };
};

const SupplierRating = mongoose.model('SupplierRating', supplierRatingSchema);

export default SupplierRating;

