import { supabase } from '../services/supabase.js';
import asyncHandler from 'express-async-handler';

export const createResident = asyncHandler(async (req, res) => {
  const { siteId, groupId, ...residentData } = req.body;

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (siteError || !site) {
    res.status(404);
    throw new Error('Site non trouvé');
  }

  if (req.user.site_id && req.user.site_id !== siteId) {
    res.status(403);
    throw new Error('Accès non autorisé à ce site');
  }

  const { data, error } = await supabase
    .from('residents')
    .insert({
      ...residentData,
      site_id: siteId,
      group_id: groupId || site.group_id,
      created_by: req.user.id
    })
    .select()
    .single();

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Résident créé avec succès',
    resident: data
  });
});

export const getResidentsBySite = asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  const { status = 'actif', page = 1, limit = 50, search } = req.query;

  const { data: site, error: siteError } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (siteError || !site) {
    res.status(404);
    throw new Error('Site non trouvé');
  }

  if (req.user.site_id && req.user.site_id !== siteId) {
    res.status(403);
    throw new Error('Accès non autorisé à ce site');
  }

  let query = supabase
    .from('residents')
    .select('*', { count: 'exact' })
    .eq('site_id', siteId);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,room_number.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(from, to);

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json({
    success: true,
    residents: data,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(count / limit),
      total: count,
      limit: parseInt(limit)
    }
  });
});

export const getResidentsByGroup = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { status = 'actif', page = 1, limit = 100, search, siteId } = req.query;

  const { data: group, error: groupError } = await supabase
    .from('groups')
    .select('*')
    .eq('id', groupId)
    .single();

  if (groupError || !group) {
    res.status(404);
    throw new Error('Groupe non trouvé');
  }

  if (req.user.group_id && req.user.group_id !== groupId) {
    res.status(403);
    throw new Error('Accès non autorisé à ce groupe');
  }

  let query = supabase
    .from('residents')
    .select('*, sites(site_name, type)', { count: 'exact' })
    .eq('group_id', groupId);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  if (siteId) {
    query = query.eq('site_id', siteId);
  }

  if (search) {
    query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,room_number.ilike.%${search}%`);
  }

  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await query
    .order('last_name', { ascending: true })
    .order('first_name', { ascending: true })
    .range(from, to);

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json({
    success: true,
    residents: data,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(count / limit),
      total: count,
      limit: parseInt(limit)
    }
  });
});

export const getResidentById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data, error } = await supabase
    .from('residents')
    .select('*, sites(site_name, type)')
    .eq('id', id)
    .single();

  if (error || !data) {
    res.status(404);
    throw new Error('Résident non trouvé');
  }

  if (req.user.site_id && req.user.site_id !== data.site_id) {
    res.status(403);
    throw new Error('Accès non autorisé à ce résident');
  }

  res.json({
    success: true,
    resident: data
  });
});

export const updateResident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: resident, error: residentError } = await supabase
    .from('residents')
    .select('*')
    .eq('id', id)
    .single();

  if (residentError || !resident) {
    res.status(404);
    throw new Error('Résident non trouvé');
  }

  if (req.user.site_id && req.user.site_id !== resident.site_id) {
    res.status(403);
    throw new Error('Accès non autorisé à ce résident');
  }

  const modificationHistory = resident.modification_history || [];
  const changes = Object.keys(req.body).join(', ');

  modificationHistory.push({
    date: new Date().toISOString(),
    modified_by: req.user.id,
    changes,
    reason: req.body.modificationReason || 'Mise à jour'
  });

  const { data, error } = await supabase
    .from('residents')
    .update({
      ...req.body,
      last_updated_by: req.user.id,
      modification_history: modificationHistory,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  res.json({
    success: true,
    message: 'Résident mis à jour avec succès',
    resident: data
  });
});

export const deleteResident = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { data: resident, error: residentError } = await supabase
    .from('residents')
    .select('*')
    .eq('id', id)
    .single();

  if (residentError || !resident) {
    res.status(404);
    throw new Error('Résident non trouvé');
  }

  if (req.user.site_id && req.user.site_id !== resident.site_id) {
    res.status(403);
    throw new Error('Accès non autorisé à ce résident');
  }

  const modificationHistory = resident.modification_history || [];
  modificationHistory.push({
    date: new Date().toISOString(),
    modified_by: req.user.id,
    changes: 'Suppression (marqué comme inactif)',
    reason: req.body.reason || 'Suppression demandée'
  });

  const { error } = await supabase
    .from('residents')
    .update({
      status: 'inactif',
      last_updated_by: req.user.id,
      modification_history: modificationHistory,
      updated_at: new Date().toISOString()
    })
    .eq('id', id);

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json({
    success: true,
    message: 'Résident marqué comme inactif avec succès'
  });
});
