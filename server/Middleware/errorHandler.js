const ErrorResponse = require('../utils/ErrorResponse');

module.exports = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log pour le développement
  console.error(err.stack.red);

  // Erreurs Mongoose
  if (err.name === 'CastError') {
    const message = `Ressource introuvable avec l'ID ${err.value}`;
    error = new ErrorResponse(message, 404);
  }

  // Duplication de clé unique
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    const message = `${field} existe déjà avec cette valeur`;
    error = new ErrorResponse(message, 400);
  }

  // Erreurs de validation
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(val => val.message);
    error = new ErrorResponse(messages, 400);
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erreur serveur'
  });
};