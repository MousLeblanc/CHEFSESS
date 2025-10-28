import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  // Informations de base
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['resto', 'fournisseur', 'collectivite', 'admin', 'groupe'], required: true },
  
  // Architecture multi-sites
  groupId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Group" 
  },
  siteId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Site" 
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier"
  },
  roles: [{ 
    type: String, 
    enum: ["GROUP_ADMIN", "SITE_MANAGER", "CHEF", "SUPPLIER", "VIEWER", "NUTRITIONIST"] 
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  
  // Informations professionnelles
  businessName: { type: String },
  establishmentType: { 
    type: String,
    enum: [
      // Types pour restaurants
      'restaurant_traditionnel', 'traiteur', 'autre',
      // Types pour collectivités
      'cantine_scolaire', 'hopital', 'ehpad', 'maison_de_retraite', 'cantine_entreprise'
    ],
    default: null
  },
  
  // Informations légales et fiscales
  vatNumber: { type: String }, // Numéro de TVA intracommunautaire
  siret: { type: String }, // Numéro SIRET (France)
  legalForm: { 
    type: String, 
    enum: ['SARL', 'SAS', 'SASU', 'EURL', 'SA', 'SNC', 'EI', 'Auto-entrepreneur', 'Association', 'Autre'],
    default: null
  },
  
  // Coordonnées complètes
  phone: { type: String },
  address: {
    street: { type: String },
    city: { type: String },
    postalCode: { type: String },
    country: { type: String, default: 'France' }
  },
  
  // Informations complémentaires
  website: { type: String },
  description: { type: String }, // Description de l'activité
  capacity: { type: Number }, // Capacité (nombre de couverts/repas par jour)
  
  // Métadonnées
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }

});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();

});

// Verify password
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Méthodes pour l'architecture multi-sites
userSchema.methods.hasRole = function(role) {
  return this.roles && this.roles.includes(role);
};

userSchema.methods.hasAnyRole = function(roles) {
  return this.roles && this.roles.some(role => roles.includes(role));
};

userSchema.methods.isGroupAdmin = function() {
  return this.hasRole('GROUP_ADMIN');
};

userSchema.methods.isSiteManager = function() {
  return this.hasRole('SITE_MANAGER');
};

userSchema.methods.canAccessGroup = function(groupId) {
  return this.groupId && this.groupId.toString() === groupId.toString();
};

userSchema.methods.canAccessSite = function(siteId) {
  return this.siteId && this.siteId.toString() === siteId.toString();
};

userSchema.methods.getEffectiveRole = function() {
  // Retourne le rôle le plus élevé
  const roleHierarchy = {
    'GROUP_ADMIN': 5,
    'SITE_MANAGER': 4,
    'CHEF': 3,
    'NUTRITIONIST': 3,
    'VIEWER': 2,
    'SUPPLIER': 1
  };
  
  if (!this.roles || this.roles.length === 0) {
    return this.role; // Fallback sur l'ancien système
  }
  
  return this.roles.reduce((highest, current) => {
    return (roleHierarchy[current] || 0) > (roleHierarchy[highest] || 0) ? current : highest;
  });
};

const User = mongoose.model('User', userSchema);
export default User;
// models/User.js
