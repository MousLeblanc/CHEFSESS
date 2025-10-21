// server.js (Version Finale Stable)
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";

// Middlewares
import { errorHandler } from "./middleware/errorHandler.js";
import { protect as authMiddleware } from "./middleware/authMiddleware.js";

// Routes
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

// OpenAI client
import openai from "./services/openaiClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// === CONFIG GLOBALE ===
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5000",
  credentials: true,
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

// === CLIENT STATIC FILES ===
const clientPath = path.join(process.cwd(), 'client');

app.use(express.static(clientPath, {
  etag: false,
  lastModified: false,
  setHeaders: (res) => {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, private");
  },
}));

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
app.use("/api/residents", residentRoutes);
app.use("/api/recipe-generator", recipeGeneratorRoutes);
app.use("/api/groups", groupRoutes);
app.use("/api/menus-sync", menuSyncRoutes);
app.use("/api/sites", siteRoutes);

// === HEALTH CHECK ===
app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok", message: "Server is running" });
});

// === ROUTES PROTÉGÉES ===
const protectedRoutes = [
  "/accueil.html", "/menu.html", "/planning.html", "/stock.html",
  "/suppliers.html", "/profile.html", "/settings.html",
];
app.use((req, res, next) => {
  if (protectedRoutes.includes(req.path)) {
    return authMiddleware(req, res, next);
  }
  next();
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
app.get("*", (req, res) => {
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
const PORT = process.env.PORT || 5000;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Chef SES en ligne sur le port ${PORT} (${process.env.NODE_ENV || "dev"})`)
);
