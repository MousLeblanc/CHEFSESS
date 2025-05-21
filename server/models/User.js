// models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['chef', 'fournisseur'],
    default: 'chef'
  },
  // Champs complémentaires utiles
  businessName: {
    type: String,
    required: function() { return this.role === 'fournisseur'; }
  },
  address: {
    type: String
  },
  phone: {
    type: String
  },
  // Pour les fournisseurs : zones de livraison
  deliveryZones: [{
    type: String
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Méthode pour comparer les mots de passe (utile pour l'authentification)
UserSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Middleware pour hacher le mot de passe avant de sauvegarder
UserSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

export default mongoose.model('User', UserSchema);