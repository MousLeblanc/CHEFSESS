// middleware/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  let error = { ...err }; // Crée une copie pour éviter de modifier l'objet err original
  error.message = err.message || 'Erreur Interne du Serveur';
  error.statusCode = err.statusCode || 500;

  // Log amélioré pour le débogage
  console.error('--- GESTIONNAIRE D\'ERREURS ---');
  console.error(`Message: ${error.message}`);
  console.error(`Status Code: ${error.statusCode}`);
  if (err.name) console.error(`Type d'erreur: ${err.name}`);
  if (err.code) console.error(`Code d'erreur: ${err.code}`);
  if (err.keyValue) console.error(`Champ dupliqué: ${JSON.stringify(err.keyValue)}`);
  console.error('Stack trace:', err.stack);
  console.error('--- FIN GESTIONNAIRE D\'ERREURS ---');

  // Erreur Mongoose de Cast (ID mal formaté)
  if (err.name === 'CastError' && err.kind === 'ObjectId') {
    error.message = `Ressource introuvable. L'ID '${err.value}' n'est pas un ObjectId valide.`;
    error.statusCode = 404;
  }

  // Erreur Mongoose de clé dupliquée
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    error.message = `Conflit de données : la valeur '${err.keyValue[field]}' pour le champ '${field}' existe déjà.`;
    error.statusCode = 409; // 409 Conflict
  }

  // Erreur Mongoose de validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error.message = `Erreur de validation : ${messages.join('. ')}`;
    error.statusCode = 400;
  }
  
  // Erreurs JWT ou d'authentification (messages venant de authMiddleware)
  if (error.message.startsWith('Non autorisé')) {
    error.statusCode = 401;
  }
  
  // Erreur d'autorisation de rôle
  if (error.message.includes("n'est pas autorisé à accéder")) {
      error.statusCode = 403; // Forbidden
  }

  res.status(error.statusCode).json({
    success: false,
    error: error.message
  });
};