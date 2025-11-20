import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // Architecture multi-sites
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group" 
  },
  siteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Site" 
  },
  
  // Informations sur la commande
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Informations sur le client (cuisinier/établissement)
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Informations sur le fournisseur
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Produits commandés
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    unit: {
      type: String,
      required: true
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  
  // Informations de livraison
  delivery: {
    requestedDate: {
      type: Date,
      required: true
    },
    confirmedDate: {
      type: Date
    },
    address: {
      street: String,
      city: String,
      zipCode: String,
      country: {
        type: String,
        default: 'France'
      }
    },
    notes: String
  },
  
  // Statut de la commande
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'issue', 'cancelled'],
    default: 'pending'
  },
  
  // Informations financières
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    tax: {
      type: Number,
      default: 0,
      min: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  
  // Notes et communications
  notes: {
    customer: String, // Notes du client
    supplier: String, // Notes du fournisseur
    internal: String  // Notes internes
  },
  
  // Dates importantes
  dates: {
    ordered: {
      type: Date,
      default: Date.now
    },
    confirmed: Date,
    prepared: Date,
    shipped: Date,
    delivered: Date,
    issue: Date,
    cancelled: Date
  },
  
  // Type d'établissement pour le suivi
  establishmentType: {
    type: String,
    enum: ['cantine_scolaire', 'hopital', 'ehpad', 'maison_de_retraite', 'cantine_entreprise', 'restaurant', 'resto', 'autre'],
    required: true
  }
}, {
  timestamps: true
});

// Index pour optimiser les recherches
// Note: orderNumber a déjà un index unique (ligne 18), pas besoin de le redéfinir
orderSchema.index({ 'delivery.requestedDate': 1 });
orderSchema.index({ establishmentType: 1 });

// Middleware pour générer automatiquement le numéro de commande
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `CMD-${Date.now()}-${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Méthode pour calculer le total
orderSchema.methods.calculateTotal = function() {
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  this.pricing.total = this.pricing.subtotal + this.pricing.tax;
  return this.pricing.total;
};

// Méthode pour mettre à jour le statut avec timestamp
orderSchema.methods.updateStatus = function(newStatus) {
  this.status = newStatus;
  const now = new Date();
  
  switch (newStatus) {
    case 'confirmed':
      this.dates.confirmed = now;
      break;
    case 'preparing':
      this.dates.prepared = now;
      break;
    case 'shipped':
      this.dates.shipped = now;
      break;
    case 'delivered':
      this.dates.delivered = now;
      break;
    case 'issue':
      this.dates.issue = now;
      break;
    case 'cancelled':
      this.dates.cancelled = now;
      break;
  }
  
  return this.save();
};

// Index pour optimiser les recherches multi-sites
orderSchema.index({ groupId: 1 });
orderSchema.index({ siteId: 1 });
orderSchema.index({ groupId: 1, siteId: 1 });
orderSchema.index({ customer: 1 });
orderSchema.index({ supplier: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ createdAt: -1 });
// Note: orderNumber, customer, supplier, status sont déjà indexés ci-dessus ou via unique:true

export default mongoose.model('Order', orderSchema);