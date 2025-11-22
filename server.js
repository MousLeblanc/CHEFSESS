// server.js (Version Finale Stable pour Render + Local)
// Force redeploy: 2025-01-28 15:30
// Version: 1.0.0 - Notifications WebSocket + Cookies Render
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

import { errorHandler } from "./middleware/errorHandler.js";
import { protect as authMiddleware } from "./middleware/authMiddleware.js";
import { generateCSRFTokenMiddleware } from "./middleware/csrfMiddleware.js";

// --- Import Routes ---
import authRoutes from "./routes/authRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import stockRoutes from "./routes/stockRoutes.js";
import planningRoutes from "./routes/planningRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import supplierRoutes from "./routes/supplierRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import restaurantRoutes from "./routes/restaurantRoutes.js";
import enhancedAiRoutes from "./routes/enhancedAiRoutes.js";
import aiMenuRoutes from "./routes/aiMenuRoutes.js";
import recipeRoutes from "./routes/recipeRoutes.js";
import intelligentMenuRoutes from "./routes/intelligentMenuRoutes.js";
import residentRoutes from "./routes/residentRoutes.js";
import recipeGeneratorRoutes from "./routes/recipeGeneratorRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import menuSyncRoutes from "./routes/menuSyncRoutes.js";
import siteRoutes from "./routes/siteRoutes.js";
import initRoutes from "./routes/initRoutes.js";
import customMenuRoutes from "./routes/customMenuRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import foodCostRoutes from "./routes/foodCostRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

// --- OpenAI client ---
import openai from "./services/openaiClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// === CONFIG GLOBALE ===
app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie', 'X-CSRF-Token'], // 🔒 Ajout du header CSRF
}));
app.use(express.json());
app.use(cookieParser());

// Désactivation du cache
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

// === SERVIR LES FICHIERS STATIQUES ===
const clientPath = path.resolve("client"); // compatible local & Render

// ✅ Servir correctement les sous-dossiers statiques JS / CSS / IMG AVANT la route par défaut
// IMPORTANT: L'ordre est crucial - les routes spécifiques doivent être avant la route générale

app.use('/css', express.static(path.join(clientPath, 'css'), {
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    // Définir le MIME type uniquement si le fichier existe et se termine par .css
    if (filePath && filePath.endsWith('.css')) {
      res.type('text/css');
    }
  }
}));

// Middleware pour gérer les fichiers CSS manquants avec le bon type MIME
app.use('/css', (req, res, next) => {
  // Si on arrive ici, c'est que express.static n'a pas trouvé le fichier
  // Vérifier si c'est une requête pour un fichier CSS
  if (req.path.endsWith('.css')) {
    res.type('text/css');
    res.status(404).send('/* Fichier CSS non trouvé */');
    return;
  }
  next();
});

app.use('/js', express.static(path.join(clientPath, 'js'), {
  etag: false,
  lastModified: false,
  setHeaders: (res, filePath) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    // Définir le MIME type uniquement si le fichier existe et se termine par .js
    if (filePath && filePath.endsWith('.js')) {
      res.type('application/javascript');
    }
  }
}));

// Middleware pour gérer les fichiers JS manquants avec le bon type MIME
app.use('/js', (req, res, next) => {
  // Si on arrive ici, c'est que express.static n'a pas trouvé le fichier
  // Vérifier si c'est une requête pour un fichier JS
  if (req.path.endsWith('.js')) {
    res.type('application/javascript');
    res.status(404).send('// Fichier JavaScript non trouvé');
    return;
  }
  next();
});

app.use('/img', express.static(path.join(clientPath, 'img'), {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  },
}));

// Servir les autres fichiers statiques
app.use(express.static(clientPath, {
  etag: false,
  lastModified: false,
  setHeaders: (res, path) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
    // Définir les MIME types selon l'extension
    if (path.endsWith('.css')) {
      res.type('text/css');
    } else if (path.endsWith('.js')) {
      res.type('application/javascript');
    }
  },
}));

// === MIDDLEWARE CSRF ===
// Générer un token CSRF pour toutes les requêtes GET authentifiées
app.use("/api", generateCSRFTokenMiddleware);

// === ROUTES API ===
app.use("/api/auth", authRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/planning", planningRoutes);
app.use("/api/users", userRoutes);
app.use("/api/suppliers", supplierRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/restaurants", restaurantRoutes);
app.use("/api/ai", enhancedAiRoutes);
app.use("/api/ai-menu", aiMenuRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/intelligent-menu", intelligentMenuRoutes);
app.use("/api/menu", customMenuRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/recipe-generator", recipeGeneratorRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/menus-sync", menuSyncRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/init", initRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/foodcost", foodCostRoutes);
app.use("/api/messages", messageRoutes);

// === HEALTH CHECK ===
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// === ROUTES HTML ===
app.get("/*.html", (req, res) => {
  const filePath = path.join(clientPath, req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      console.error(`❌ Fichier introuvable : ${filePath}`);
      res.status(404).send("Page non trouvée");
    }
  });
});

// === ROUTE PAR DÉFAUT ===
// IMPORTANT: Cette route doit être en dernier pour ne pas intercepter les fichiers statiques
app.get("*", (req, res, next) => {
  const requestPath = req.path || req.url;
  
  // Ne pas intercepter les requêtes vers les fichiers statiques ou API
  // Vérifier à la fois avec et sans slash initial pour gérer les chemins relatifs
  if (requestPath.startsWith('/js/') || 
      requestPath.startsWith('/css/') || 
      requestPath.startsWith('/img/') || 
      requestPath.startsWith('/api/') ||
      requestPath.startsWith('js/') ||
      requestPath.startsWith('css/') ||
      requestPath.startsWith('img/') ||
      requestPath.match(/\.(js|css|json|jpg|jpeg|png|gif|svg|ico|woff|woff2|ttf|eot)$/i)) {
    // Si c'est un fichier statique qui n'a pas été trouvé, retourner 404 avec le bon type MIME
    if (requestPath.endsWith('.css')) {
      res.type('text/css');
      return res.status(404).send('/* Fichier CSS non trouvé */');
    }
    if (requestPath.endsWith('.js')) {
      res.type('application/javascript');
      return res.status(404).send('// Fichier JavaScript non trouvé');
    }
    return next(); // Laisser express.static gérer ces fichiers
  }
  res.sendFile(path.join(clientPath, "index.html"));
});

// === CONNEXION MONGODB ===
const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
mongoose.connect(mongoUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 10000,
})
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB:", err.message));

// === GESTIONNAIRE D’ERREURS ===
app.use(errorHandler);

// === SERVEUR ===
import http from 'http';
import notificationService from './services/notificationService.js';

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

// Initialiser le service de notifications WebSocket
notificationService.initialize(server);

server.listen(PORT, "0.0.0.0", () => {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 CHEF SES - SERVEUR DÉMARRÉ');
  console.log('='.repeat(60));
  console.log(`📅 Date: ${new Date().toISOString()}`);
  console.log(`🌐 Port: ${PORT}`);
  console.log(`🔧 Environnement: ${process.env.NODE_ENV || "dev"}`);
  console.log(`📦 Version: 1.0.0 - Notifications WebSocket + Cookies Render`);
  
  // Afficher la configuration Render
  const isRender = process.env.RENDER_SERVICE_ID || 
                   process.env.RENDER === 'true' || 
                   process.env.NODE_ENV === 'production';
  console.log(`\n📊 Configuration Render:`);
  console.log(`   - RENDER_SERVICE_ID: ${process.env.RENDER_SERVICE_ID || 'non défini'}`);
  console.log(`   - RENDER: ${process.env.RENDER || 'non défini'}`);
  console.log(`   - NODE_ENV: ${process.env.NODE_ENV || 'non défini'}`);
  console.log(`   - isRender détecté: ${isRender}`);
  console.log(`   - Cookies: secure=${isRender}, sameSite=${isRender ? 'none' : 'lax'}`);
  console.log('='.repeat(60) + '\n');
});
