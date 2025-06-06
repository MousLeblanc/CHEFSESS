// server.js (Version Finale Intégrée)
import dotenv from 'dotenv';
dotenv.config();

import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import OpenAI from 'openai';

// Importer les fichiers de routes (s'assurer que les extensions .js sont présentes pour les imports locaux)
import authRoutes from './routes/authRoutes.js'; // Doit pointer vers authRoutes.js et non authRoutes.js.js
import menuRoutes from './routes/menuRoutes.js';   // Doit pointer vers menuRoutes.js et non menuRoutes.js.js
import stockRoutes from './routes/stockRoutes.js';
import planningRoutes from './routes/planningRoutes.js';
import userRoutes from './routes/userRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import restaurantRoutes from './routes/restaurantRoutes.js';

// Importer les middlewares
import { errorHandler } from './middleware/errorHandler.js';
// import { languageMiddleware } from './middleware/languageMiddleware.js'; // Décommentez si i18nService est prêt

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Initialisation du client OpenAI
export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// --- Middlewares Globaux ---
app.use(cors({ origin: process.env.FRONTEND_URL || '*' }));
app.use(express.json());
// app.use(languageMiddleware); // Décommentez si i18nService est prêt

// Servir les fichiers statiques du dossier "client"
app.use(express.static(path.join(__dirname, 'client')));

// --- Monter les Routes API ---
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/planning', planningRoutes);
app.use('/api/users', userRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/restaurants', restaurantRoutes);

// --- Gestion des Routes Non-API et Page d'Accueil ---
// Doit être après les routes API pour ne pas les intercepter
app.get('*', (req, res, next) => {
  if (req.originalUrl.startsWith('/api')) {
    const error = new Error(`Endpoint API non trouvé : ${req.method} ${req.originalUrl}`);
    error.statusCode = 404;
    return next(error); // Passe à errorHandler
  }
  res.sendFile(path.join(__dirname, 'client', 'choisir-profil.html')); // Page d'atterrissage par défaut
});

// --- Connexion à MongoDB ---
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté avec succès à MongoDB Atlas.'))
  .catch(err => {
    console.error('Erreur de connexion à MongoDB:', err.message);
  });

// --- Gestionnaire d'Erreurs Global ---
app.use(errorHandler);

// --- Démarrage du Serveur ---
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(
  `Serveur ChAIf SES démarré en mode ${process.env.NODE_ENV || 'development'} sur le port ${PORT}.`
));