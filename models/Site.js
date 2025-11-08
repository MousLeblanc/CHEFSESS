import mongoose from "mongoose";

const siteSchema = new mongoose.Schema({
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group", 
    required: true 
  },
  siteName: { 
    type: String, 
    required: true,
    trim: true
  },                 // "EHPAD Saint-Michel"
  type: { 
    type: String, 
    enum: ["EHPAD", "MRS", "RESIDENCE_SENIOR", "COLLECTIVITE", "ehpad", "hopital", "ecole", "collectivite", "resto", "maison_retraite"], 
    required: true 
  },
  address: {
    street: String,
    city: String,
    postalCode: String,
    country: {
      type: String,
      default: "France"
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  contact: {
    phone: String,
    email: String,
    website: String
  },
  responsables: [{
    name: { type: String, required: true },
    phone: String,
    email: String,
    position: String  // Ex: "Directeur", "Responsable cuisine", etc.
  }],
  managers: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
  }],
  syncMode: { 
    type: String, 
    enum: ["auto", "manual"], 
    default: "auto" 
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  settings: {
    timezone: {
      type: String,
      default: "Europe/Paris"
    },
    mealTimes: {
      lunch: {
        start: { type: String, default: "12:00" },
        end: { type: String, default: "14:00" }
      },
      dinner: {
        start: { type: String, default: "19:00" },
        end: { type: String, default: "21:00" }
      }
    },
    capacity: {
      lunch: { type: Number, default: 100 },
      dinner: { type: Number, default: 50 }
    },
    notifications: {
      soundEnabled: {
        type: Boolean,
        default: true
      },
      badgeEnabled: {
        type: Boolean,
        default: true
      },
      soundVolume: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
      },
      soundUrl: {
        type: String,
        default: "/sounds/notification.mp3"
      }
    }
  },
  lastSyncAt: Date,
  syncStatus: {
    type: String,
    enum: ["synced", "pending", "error", "local_override"],
    default: "synced"
  }
}, { 
  timestamps: true 
});

// Index pour les recherches rapides
siteSchema.index({ groupId: 1, siteName: 1 }, { unique: true });
siteSchema.index({ groupId: 1, isActive: 1 });
siteSchema.index({ type: 1 });
siteSchema.index({ "address.city": 1 });

// Validation
siteSchema.pre('save', function(next) {
  if (this.managers && this.managers.length === 0) {
    this.managers = undefined; // Permettre un tableau vide
  }
  next();
});

// Méthodes utiles
siteSchema.methods.getFullAddress = function() {
  const addr = this.address;
  if (!addr) return '';
  
  const parts = [addr.street, addr.postalCode, addr.city, addr.country]
    .filter(Boolean);
  return parts.join(', ');
};

siteSchema.methods.canSync = function() {
  return this.isActive && this.syncMode === 'auto';
};

siteSchema.methods.markAsLocalOverride = function() {
  this.syncStatus = 'local_override';
  return this.save();
};

export default mongoose.model("Site", siteSchema);
