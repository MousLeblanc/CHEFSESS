// scripts/test-mongodb-connection.js
// Script pour tester la connexion MongoDB
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";

console.log('🔌 Test de connexion MongoDB...');
console.log(`   URI: ${mongoUri.replace(/\/\/[^:]+:[^@]+@/, '//***:***@')}`);

const mongooseOptions = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  maxPoolSize: 10,
  minPoolSize: 1,
};

try {
  await mongoose.connect(mongoUri, mongooseOptions);
  
  console.log('✅ Connecté à MongoDB');
  console.log(`   Base de données: ${mongoose.connection.name}`);
  console.log(`   Host: ${mongoose.connection.host}:${mongoose.connection.port}`);
  console.log(`   État: ${mongoose.connection.readyState === 1 ? 'Connecté' : 'Non connecté'}`);
  
  // Tester une requête simple
  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`\n📚 Collections trouvées: ${collections.length}`);
  collections.forEach(col => {
    console.log(`   - ${col.name}`);
  });
  
  // Tester une requête sur User
  const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
  const userCount = await User.countDocuments();
  console.log(`\n👥 Nombre d'utilisateurs: ${userCount}`);
  
  await mongoose.disconnect();
  console.log('\n✅ Déconnexion réussie');
  process.exit(0);
  
} catch (error) {
  console.error('\n❌ Erreur de connexion MongoDB:');
  console.error(`   Message: ${error.message}`);
  console.error(`   Code: ${error.code || 'N/A'}`);
  console.error(`   Stack: ${error.stack}`);
  process.exit(1);
}

