import jwt from 'jsonwebtoken';

export const protect = async (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({
      error: "Token manquant",
      solution: "Veuillez vous reconnecter"
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.userId,
      role: decoded.role
    };
    next();
  } catch (error) {
    console.error("Erreur JWT:", error.message);
    res.status(401).json({
      error: "Session expirée",
      details: error.message
    });
  }
};