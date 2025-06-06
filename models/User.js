import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['maison', 'resto', 'fournisseur', 'admin'], required: true },
  businessName: { type: String },
  // NOUVEAU CHAMP
  establishmentType: { 
    type: String,
    enum: ['restaurant_traditionnel', 'cantine_scolaire', 'maison_de_retraite',  'traiteur', 'hopital', 'autre'], // 'null' si ce n'est pas un 'resto'
    default: null
  }

});

// Hash le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

// Vérifie le mot de passe
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
// models/User.js
