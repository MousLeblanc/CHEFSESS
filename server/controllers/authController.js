import { supabase } from '../services/supabase.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcryptjs';

export const register = asyncHandler(async (req, res) => {
  const {
    name,
    email,
    password,
    role,
    businessName,
    establishmentType,
    phone,
    address
  } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Champs obligatoires manquants');
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });

  if (authError) {
    res.status(400);
    throw new Error(authError.message);
  }

  let groupId = null;
  let userRoles = [];

  if (role === 'groupe') {
    const groupCode = businessName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');

    const { data: groupData, error: groupError } = await supabase
      .from('groups')
      .insert({
        name: businessName,
        code: groupCode,
        contact_email: email
      })
      .select()
      .single();

    if (groupError) {
      res.status(400);
      throw new Error('Erreur lors de la création du groupe');
    }

    groupId = groupData.id;
    userRoles = ['GROUP_ADMIN'];
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert({
      id: authData.user.id,
      name,
      email,
      roles: userRoles,
      group_id: groupId,
      business_name: businessName,
      establishment_type: establishmentType,
      phone,
      address: address || {}
    })
    .select()
    .single();

  if (userError) {
    res.status(400);
    throw new Error('Erreur lors de la création de l\'utilisateur');
  }

  res.status(201).json({
    success: true,
    message: 'Compte créé avec succès',
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      roles: userData.roles,
      groupId: userData.group_id
    },
    session: authData.session
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email et mot de passe requis');
  }

  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    res.status(401);
    throw new Error('Email ou mot de passe incorrect');
  }

  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', authData.user.id)
    .single();

  if (userError || !userData) {
    res.status(401);
    throw new Error('Utilisateur non trouvé');
  }

  res.cookie('token', authData.session.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });

  res.json({
    success: true,
    message: 'Connexion réussie',
    user: {
      id: userData.id,
      name: userData.name,
      email: userData.email,
      roles: userData.roles,
      groupId: userData.group_id,
      siteId: userData.site_id,
      businessName: userData.business_name,
      establishmentType: userData.establishment_type
    },
    session: authData.session
  });
});

export const logout = asyncHandler(async (req, res) => {
  await supabase.auth.signOut();

  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0)
  });

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

export const getMe = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});
