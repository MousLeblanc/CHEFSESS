// server.js - Avec route catch-all corrigée
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import authRoutes from './routes/authRoutes.js';
import menuRoutes from './routes/menuRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Initialize app
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration CORS
app.use(cors({
  origin: '*'
}));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Serve static files
app.use(express.static(path.join(__dirname, '../client')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/user', userRoutes);

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'API is working correctly!' });
});

// MODIFICATION: Route catch-all remplacée par des routes spécifiques
// Au lieu de app.get('*', ...), nous utilisons:
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/accueil.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/accueil.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

app.get('/index-ajouts.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index-ajouts.html'));
});

app.get('/index-libre.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index-libre.html'));
});

app.get('/stock.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/stock.html'));
});

app.get('/historique.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/historique.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/login.html'));
});

app.get('/register.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/register.html'));
});

// Fallback route - utilise '/' au lieu de '*'
app.use((req, res) => {
  res.redirect('/');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serveur en écoute sur le port ${PORT}`);
  console.log(`Frontend URL: http://localhost:${PORT}`);
  console.log(`API test URL: http://localhost:${PORT}/api/test`);
});

export default app;