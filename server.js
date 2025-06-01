import dotenv from 'dotenv';
dotenv.config();
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';


const app = express(); 

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'client'))); 
// ————————————————————————————————
// Sert les fichiers statiques du dossier "client"

app.use(express.static(path.join(__dirname, 'client')));

// Redirection vers index.html si tu accèdes à /
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client', 'choisir-profil.html'));
});
// ————————————————————————————————

// Middleware
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Modèle Mongoose
const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['maison', 'resto', 'fournisseur', 'admin'], required: true },
  businessName: String
});
const User = mongoose.model('User', UserSchema);

// Connexion MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connecté à MongoDB Atlas'))
  .catch(err => console.error('Erreur MongoDB:', err));

// Middleware d'authentification
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
// POST /api/auth/register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role, businessName } = req.body;
    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, mot de passe et rôle sont requis.' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role, businessName });
    await user.save();
    res.status(201).json({ message: 'Utilisateur créé avec succès. Veuillez vous connecter.' });
  } catch (error) {
    console.error("Erreur d'inscription:", error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Email déjà utilisé' });
    }
    res.status(500).json({ message: 'Erreur serveur lors de l\'inscription' });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe sont requis.' });
    }
    const user = await User.findOne({ email });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }
    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        businessName: user.businessName
      }
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    res.status(500).json({ message: 'Erreur serveur lors de la connexion' });
  }
});

// GET /api/auth/verify (optionnel mais recommandé)
app.get('/api/auth/verify', authenticateToken, (req, res) => {
  res.status(200).json({ message: "Token valide", user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT} et servant les fichiers depuis le dossier 'client'`));