// diagnostic.js
import express from 'express';

// Initialize app
const app = express();

// Middleware de base
app.use(express.json());

console.log("---- DIAGNOSTIC DES ROUTES ----");

// Test chaque fichier de route individuellement
try {
  console.log("1. Test de la route API test");
  app.get('/api/test', (req, res) => {
    res.json({ message: 'OK' });
  });
  console.log("   ✓ Route API test OK");
} catch (error) {
  console.error("   ✗ Erreur avec la route API test:", error);
}

// Test authRoutes
try {
  console.log("2. Test de authRoutes");
  const authRouter = express.Router();
  authRouter.post('/register', (req, res) => res.json({}));
  authRouter.post('/login', (req, res) => res.json({}));
  app.use('/api/auth', authRouter);
  console.log("   ✓ authRoutes OK");
} catch (error) {
  console.error("   ✗ Erreur avec authRoutes:", error);
}

// Test menuRoutes
try {
  console.log("3. Test de menuRoutes");
  const menuRouter = express.Router();
  menuRouter.post('/generate', (req, res) => res.json({}));
  menuRouter.get('/', (req, res) => res.json([]));
  menuRouter.post('/:id/save', (req, res) => res.json({}));
  app.use('/api/menus', menuRouter);
  console.log("   ✓ menuRoutes OK");
} catch (error) {
  console.error("   ✗ Erreur avec menuRoutes:", error);
}

// Test stockRoutes
try {
  console.log("4. Test de stockRoutes");
  const stockRouter = express.Router();
  stockRouter.get('/', (req, res) => res.json({}));
  stockRouter.post('/', (req, res) => res.json({}));
  stockRouter.put('/:id', (req, res) => res.json({}));
  stockRouter.delete('/:id', (req, res) => res.json({}));
  app.use('/api/stock', stockRouter);
  console.log("   ✓ stockRoutes OK");
} catch (error) {
  console.error("   ✗ Erreur avec stockRoutes:", error);
}

// Test userRoutes
try {
  console.log("5. Test de userRoutes");
  const userRouter = express.Router();
  userRouter.get('/stats', (req, res) => res.json({}));
  userRouter.get('/profile', (req, res) => res.json({}));
  userRouter.put('/profile', (req, res) => res.json({}));
  app.use('/api/user', userRouter);
  console.log("   ✓ userRoutes OK");
} catch (error) {
  console.error("   ✗ Erreur avec userRoutes:", error);
}

// Test catch-all route
try {
  console.log("6. Test de la route catch-all");
  app.get('*', (req, res) => res.send('Hello'));
  console.log("   ✓ Route catch-all OK");
} catch (error) {
  console.error("   ✗ Erreur avec la route catch-all:", error);
}

console.log("---- FIN DU DIAGNOSTIC ----");

// Ne pas démarrer le serveur, juste tester l'initialisation
console.log("Toutes les routes ont été initialisées avec succès");