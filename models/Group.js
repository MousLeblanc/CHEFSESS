import mongoose from "mongoose";

const groupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    unique: true,
    trim: true
  },        // ex: "Vulpia Group"
  code: { 
    type: String, 
    required: true, 
    unique: true,
    lowercase: true,
    trim: true,
    match: /^[a-z0-9-]+$/
  },         // ex: "vulpia-group"
  contactEmail: {
    type: String,
    required: true,
    match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  },
  settings: {
    defaultSyncMode: { 
      type: String, 
      enum: ["auto", "manual"], 
      default: "auto" 
    },
    weekStart: { 
      type: String, 
      enum: ["monday", "sunday"], 
      default: "monday" 
    },
    timezone: {
      type: String,
      default: "Europe/Paris"
    },
    currency: {
      type: String,
      default: "EUR"
    }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  subscription: {
    plan: {
      type: String,
      enum: ["basic", "premium", "enterprise"],
      default: "basic"
    },
    maxSites: {
      type: Number,
      default: 50
    },
    expiresAt: Date
  }
}, { 
  timestamps: true 
});

// Index pour les recherches rapides
groupSchema.index({ code: 1 }, { unique: true });
groupSchema.index({ isActive: 1 });
groupSchema.index({ "subscription.expiresAt": 1 });

// Méthodes utiles
groupSchema.methods.canAddSite = function() {
  return this.isActive && this.subscription.maxSites > 0;
};

groupSchema.methods.getActiveSitesCount = async function() {
  const Site = mongoose.model('Site');
  return await Site.countDocuments({ groupId: this._id, isActive: true });
};

export default mongoose.model("Group", groupSchema);
