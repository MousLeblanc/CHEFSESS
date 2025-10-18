import mongoose from "mongoose";

const dayEntry = new mongoose.Schema({
  date: { 
    type: String, 
    required: true 
  },             // "2025-10-20"
  service: { 
    type: String, 
    enum: ["midi", "soir"], 
    default: "midi" 
  },
  recipeIds: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "RecipeEnriched" 
  }],
  notes: String,
  localModifications: {
    type: Boolean,
    default: false
  },
  modifiedAt: Date,
  modifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
}, { _id: false });

const menuSchema = new mongoose.Schema({
  // Références multi-sites
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group" 
  },     // présent pour un "menu siège"
  siteId:  { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Site" 
  },      // présent pour un "menu site"
  
  // Métadonnées du menu
  label:   { 
    type: String, 
    required: true,
    trim: true
  },                           // "Semaine 42 - Automne"
  yearWeek: { 
    type: String, 
    required: true,
    match: /^\d{4}-W\d{2}$/
  },                          // "2025-W42" (clé de synchro)
  entries: [dayEntry],

  // Synchronisation
  origin: { 
    type: String, 
    enum: ["group", "site"], 
    default: "site" 
  },
  originMenuId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "MenuMultiSite" 
  }, // pointeur vers le menu siège source
  syncVersion: { 
    type: Number, 
    default: 1 
  },                            // incrément à chaque push
  lastSyncedAt: Date,
  localOverrides: { 
    type: Boolean, 
    default: false 
  },                     // le site a modifié localement
  
  // Métadonnées additionnelles
  theme: String,
  totalCost: {
    type: Number,
    default: 0
  },
  nutritionalSummary: {
    avgCalories: Number,
    avgProtein: Number,
    avgCarbs: Number,
    avgLipids: Number
  },
  
  // Statut et validation
  status: {
    type: String,
    enum: ["draft", "validated", "published", "archived"],
    default: "draft"
  },
  validatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  validatedAt: Date,
  
  // Créateur et permissions
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  isTemplate: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index pour les recherches rapides
menuSchema.index({ siteId: 1, yearWeek: 1 }, { 
  unique: true, 
  partialFilterExpression: { siteId: { $exists: true } } 
});
menuSchema.index({ groupId: 1, yearWeek: 1 }, { 
  unique: true, 
  partialFilterExpression: { groupId: { $exists: true } } 
});
menuSchema.index({ origin: 1, yearWeek: 1 });
menuSchema.index({ lastSyncedAt: 1 });
menuSchema.index({ status: 1 });

// Validation
menuSchema.pre('save', function(next) {
  // Un menu doit avoir soit groupId soit siteId, pas les deux
  if (!this.groupId && !this.siteId) {
    return next(new Error('Un menu doit être associé à un groupe ou un site'));
  }
  if (this.groupId && this.siteId) {
    return next(new Error('Un menu ne peut pas être associé à la fois à un groupe et un site'));
  }
  
  // Mettre à jour lastSyncedAt si syncVersion change
  if (this.isModified('syncVersion')) {
    this.lastSyncedAt = new Date();
  }
  
  next();
});

// Méthodes utiles
menuSchema.methods.isGroupMenu = function() {
  return this.origin === 'group' && this.groupId;
};

menuSchema.methods.isSiteMenu = function() {
  return this.origin === 'site' && this.siteId;
};

menuSchema.methods.canSync = function() {
  return this.isGroupMenu() || (this.isSiteMenu() && !this.localOverrides);
};

menuSchema.methods.markAsLocalOverride = function(userId) {
  this.localOverrides = true;
  this.lastSyncedAt = new Date();
  return this.save();
};

menuSchema.methods.getSyncStatus = function() {
  if (this.localOverrides) return 'local_override';
  if (this.lastSyncedAt) return 'synced';
  return 'pending';
};

menuSchema.methods.calculateTotalCost = async function() {
  // Cette méthode calculerait le coût total du menu
  // en fonction des recettes et des prix des ingrédients
  return 0; // Placeholder
};

menuSchema.methods.getNutritionalSummary = async function() {
  // Cette méthode calculerait le résumé nutritionnel
  // en fonction des recettes sélectionnées
  return {
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgLipids: 0
  }; // Placeholder
};

export default mongoose.model("MenuMultiSite", menuSchema);
