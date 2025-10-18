import express from 'express';
import { supabase } from '../services/supabase.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

router.get('/:siteId', protect, asyncHandler(async (req, res) => {
  const { siteId } = req.params;

  const { data, error } = await supabase
    .from('sites')
    .select('*')
    .eq('id', siteId)
    .single();

  if (error || !data) {
    res.status(404);
    throw new Error('Site non trouvé');
  }

  res.json(data);
}));

router.get('/:siteId/menus', protect, asyncHandler(async (req, res) => {
  const { siteId } = req.params;
  const { yearWeek } = req.query;

  let query = supabase
    .from('menus')
    .select('*')
    .eq('site_id', siteId);

  if (yearWeek) {
    query = query.eq('year_week', yearWeek);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    res.status(500);
    throw new Error(error.message);
  }

  res.json(data || []);
}));

export default router;
