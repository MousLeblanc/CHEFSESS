import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

// Schéma User simplifié
const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: String,
  establishment: String
});

const User = mongoose.model('User', userSchema);

async function resetAdminPassword() {
  try {
    console.log('🔄 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    const email = 'admin@vulpiagroup.com';
    const newPassword = 'Admin123!'; // Mot de passe par défaut

    console.log('🔍 Recherche de l\'utilisateur:', email);
    let user = await User.findOne({ email });

    if (!user) {
      console.log('❌ Utilisateur non trouvé. Création d\'un nouvel admin...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      user = await User.create({
        name: 'Super Admin',
        email: email,
        password: hashedPassword,
        role: 'groupe',
        establishment: 'VULPIA_GROUP'
      });

      console.log('✅ Nouvel administrateur créé !');
    } else {
      console.log('✅ Utilisateur trouvé. Réinitialisation du mot de passe...');
      
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      user.password = hashedPassword;
      await user.save();
      
      console.log('✅ Mot de passe réinitialisé !');
    }

    console.log('\n📋 INFORMATIONS DE CONNEXION :');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email    :', email);
    console.log('🔑 Password :', newPassword);
    console.log('👤 Rôle     :', user.role);
    console.log('🏢 Site     :', user.establishment);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    console.log('🎯 Utilisez ces identifiants pour vous connecter !');
    
    await mongoose.connection.close();
    console.log('\n✅ Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

resetAdminPassword();

