// config/config.js
import dotenv from 'dotenv';

// Charger les variables d'environnement
dotenv.config();

const config = {
  // Serveur
  nodeEnv: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 5000,
  
  // Base de données
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/chaifses',
  
  // JWT
  jwtSecret: process.env.JWT_SECRET,
  jwtExpire: process.env.JWT_EXPIRE || '24h', // Format accepté par jwt.sign
  
  // CORS
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  
  // API externes
  openaiApiKey: process.env.OPENAI_API_KEY,
  
  // Configuration de l'application
  stockAlertThreshold: process.env.STOCK_ALERT_THRESHOLD || 10,
  menuDefaultServings: process.env.MENU_DEFAULT_SERVINGS || 4
};


// Vérification des variables critiques
const requiredEnvVars = ['JWT_SECRET', 'MONGODB_URI', 'OPENAI_API_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Erreur de config : variables manquantes : ${missingEnvVars.join(', ')}`);
  if (config.nodeEnv === 'production') process.exit(1);
}

isProduction: process.env.NODE_ENV === 'production',


export default config;