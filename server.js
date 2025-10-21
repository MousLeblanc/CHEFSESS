// server.js (Version Finale Intégrée)
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
// DOMPurify import removed - not installed

// Importer les middlewares
import { errorHandler } from './middleware/errorHandler.js';
import { protect as authMiddleware } from './middleware/authMiddleware.js';
// import { languageMiddleware } from './middleware/languageMiddleware.js'; // Décommentez si i18nService est prêt

// Importer les fichiers de routes (s'assurer que les extensions .js sont présentes pour les imports locaux)
import authRoutes from './routes/authRoutes.js'; // Doit pointer vers authRoutes.js et non authRoutes.js.js
import menuRoutes from './routes/menuRoutes.js';   // Doit pointer vers menuRoutes.js et non menuRoutes.js.js
import stockRoutes from './routes/stockRoutes.js';
import planningRoutes from './routes/planningRoutes.js';
import userRoutes from './routes/userRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';
import enhancedAiRoutes from './routes/enhancedAiRoutes.js';
import aiMenuRoutes from './routes/aiMenuRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import intelligentMenuRoutes from './routes/intelligentMenuRoutes.js';
import residentRoutes from './routes/residentRoutes.js';
import recipeGeneratorRoutes from './routes/recipeGeneratorRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import menuSyncRoutes from './routes/menuSyncRoutes.js';
import siteRoutes from './routes/siteRoutes.js';
import openai from './services/openaiClient.js'; // Importer le client OpenAI


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Le client OpenAI est maintenant importé depuis services/openaiClient.js

// --- Middlewares Globaux ---
app.use(cors({ 
  origin: process.env.FRONTEND_URL || 'http://localhost:5000',
  credentials: true // Important pour les cookies
}));
app.use(express.json());
app.use(cookieParser()); // Pour lire les cookies
// app.use(languageMiddleware); // Décommentez si i18nService est prêt

// Middleware pour désactiver le cache sur toutes les requêtes
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  next();
});

// Servir les fichiers statiques du dossier "client"
const clientPath = path.join(__dirname, 'client');
app.use(express.static(clientPath, {
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  }
}));

// ✅ Route de secours universelle pour les fichiers HTML
app.get('/*.html', (req, res) => {
  const filePath = path.join(clientPath, req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`❌ Fichier introuvable : ${filePath}`);
      res.status(404).send('Page non trouvée');
    }
  });
});

// ✅ Route par défaut (ex: / -> accueil.html ou index.html)
app.get('*', (req, res) => {
  res.sendFile(path.join(clientPath, 'index.html'));
});

// --- Monter les Routes API ---
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/ai', enhancedAiRoutes); // Nouvelle route AI améliorée
app.use('/api/ai-menu', aiMenuRoutes); // Route pour la génération de menus avec IA
app.use('/api/recipes', recipeRoutes); // Routes pour les recettes
app.use('/api/intelligent-menu', intelligentMenuRoutes); // Route pour génération intelligente de menus
app.use('/api/residents', residentRoutes);
app.use('/api/recipe-generator', recipeGeneratorRoutes); // Routes pour la génération de recettes par IA
app.use('/api/groups', groupRoutes); // Routes pour la gestion des groupes multi-sites
app.use('/api/menus', menuSyncRoutes); // Routes pour la synchronisation des menus
app.use('/api/sites', siteRoutes); // Routes pour la gestion des sites individuels
app.use('/api/residents', residentRoutes); // Routes pour la gestion des résidents


// Route de vérification de santé du serveur
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// --- Gestion des Routes Non-API et Page d'Accueil ---
// Doit être après les routes API pour ne pas les intercepter

// Route pour les API non trouvées
app.all('/api/*', (req, res, next) => {
  const error = new Error(`API endpoint not found: ${req.method} ${req.originalUrl}`);
  error.statusCode = 404;
  return next(error); // Passe à errorHandler
});

// Routes protégées nécessitant une authentification
const protectedRoutes = [
  '/accueil.html',
  '/menu.html',
  '/planning.html',
  '/stock.html',
  '/suppliers.html',
  '/profile.html',
  '/settings.html'
];

// Middleware pour protéger certaines routes
app.use((req, res, next) => {
  // Si c'est une route protégée, appliquer le middleware d'authentification
  if (protectedRoutes.some(route => req.path === route)) {
    return authMiddleware(req, res, next);
  }
  // Sinon, continuer sans authentification
  next();
});

// Route par défaut pour servir la page d'accueil
app.get('*', (req, res) => {
  // Si c'est une route API non gérée, elle aurait déjà été traitée par le middleware précédent
  // Pour toutes les autres routes, servir la page d'accueil
  res.sendFile(path.join(__dirname, 'client', 'choisir-profil.html'));
});

// --- Route principale pour Bolt ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html")); // ou accueil.html selon ton fichier principal
});

// --- Connexion à MongoDB ---
const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
mongoose.connect(mongoUri)
  .then(() => console.log('Successfully connected to MongoDB.'))
  .catch(err => {
    console.error('MongoDB connection error:', err.message);
  });


// --- Gestionnaire d'Erreurs Global ---
app.use(errorHandler);

// --- Route principale pour test Preview ---
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});


// --- Démarrage du Serveur ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(
  `ChAIf SES server started in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}.`
));
