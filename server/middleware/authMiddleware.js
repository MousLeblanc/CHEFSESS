import { supabase } from '../services/supabase.js';
import asyncHandler from 'express-async-handler';

export const protect = asyncHandler(async (req, res, next) => {
  const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    res.status(401);
    throw new Error('Non autorisé - Aucun token fourni');
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      res.status(401);
      throw new Error('Non autorisé - Token invalide');
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError || !userData) {
      res.status(401);
      throw new Error('Utilisateur non trouvé');
    }

    req.user = userData;
    req.userId = user.id;
    next();
  } catch (error) {
    res.status(401);
    throw new Error('Non autorisé - Token invalide');
  }
});

export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.roles) {
      res.status(403);
      throw new Error('Accès refusé - Rôle insuffisant');
    }

    const hasRole = roles.some(role => req.user.roles.includes(role));

    if (!hasRole) {
      res.status(403);
      throw new Error('Accès refusé - Rôle insuffisant');
    }

    next();
  };
};
