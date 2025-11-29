// models/CustomerOrder.js
import mongoose from "mongoose";

const customerOrderSchema = new mongoose.Schema({
  // Restaurant qui reçoit la commande
  restaurantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Informations client
  customer: {
    name: { type: String }, // Optionnel si anonyme
    tableNumber: { type: Number, required: true },
    guestNumber: { type: Number, default: 1 } // Numéro de convive à la table
  },
  
  // Menu complet (alternative à la sélection modulaire)
  menuId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecipeEnriched'
  },
  
  // Sélection modulaire (si pas de menuId)
  selection: {
    protein: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipeComponent'
    },
    sauce: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipeComponent'
    },
    accompaniment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RecipeComponent'
    }
  },
  
  // Restrictions du client
  restrictions: {
    allergies: [{ type: String }],
    intolerances: [{ type: String }],
    dietaryRestrictions: [{ type: String }],
    notes: { type: String } // Notes spéciales du client
  },
  
  // Template généré (optionnel, peut être généré à la volée)
  template: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RecipeTemplate'
  },
  
  // Statut de la commande
  status: {
    type: String,
    enum: ['pending', 'preparing', 'ready', 'served', 'cancelled'],
    default: 'pending',
    index: true
  },
  
  // Informations de préparation
  preparation: {
    estimatedTime: { type: Number }, // Temps estimé en minutes
    startedAt: { type: Date },
    readyAt: { type: Date },
    servedAt: { type: Date }
  },
  
  // Notes du chef
  chefNotes: { type: String },
  
  // Timestamps
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
});

// Index pour améliorer les performances
customerOrderSchema.index({ restaurantId: 1, status: 1 });
customerOrderSchema.index({ 'customer.tableNumber': 1 });
customerOrderSchema.index({ createdAt: -1 });

// Middleware pour mettre à jour updatedAt
customerOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Méthode pour mettre à jour le statut
customerOrderSchema.methods.updateStatus = async function(newStatus) {
  this.status = newStatus;
  
  // Mettre à jour les timestamps selon le statut
  const now = new Date();
  switch (newStatus) {
    case 'preparing':
      this.preparation.startedAt = now;
      break;
    case 'ready':
      this.preparation.readyAt = now;
      break;
    case 'served':
      this.preparation.servedAt = now;
      break;
  }
  
  await this.save();
  return this;
};

// Méthode pour calculer le temps d'attente
customerOrderSchema.methods.getWaitingTime = function() {
  if (!this.preparation.startedAt) {
    return Math.floor((new Date() - this.createdAt) / 1000 / 60); // Minutes
  }
  return null;
};

// Méthode pour calculer le temps de préparation
customerOrderSchema.methods.getPreparationTime = function() {
  if (this.preparation.startedAt && this.preparation.readyAt) {
    return Math.floor((this.preparation.readyAt - this.preparation.startedAt) / 1000 / 60); // Minutes
  }
  return null;
};

const CustomerOrder = mongoose.model("CustomerOrder", customerOrderSchema);
export default CustomerOrder;




