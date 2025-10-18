import express from 'express';
import { supabase } from '../services/supabase.js';
import { protect, requireRole } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.use(protect);

router.get('/:groupId/sites', asyncHandler(async (req, res) => {
  const { groupId } = req.params;

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('group_id', groupId)
    .order('site_name');

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json(data || []);
}));

router.post('/:groupId/sites', requireRole('GROUP_ADMIN'), asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { siteName, type, address, contact } = req.body;

  const { data, error } = await supabase
    .from('sites')
    .insert({
      group_id: groupId,
      site_name: siteName,
      type,
      address: address || {},
      contact: contact || {}
    })
    .select()
    .single();

  if (error) {
    res.status(400);
    throw new Error(error.message);
  }

  res.status(201).json({
    success: true,
    message: 'Site créé avec succès',
    site: data
  });
}));

export default router;
