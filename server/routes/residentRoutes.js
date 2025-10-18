import express from 'express';
import {
  createResident,
  getResidentsBySite,
  getResidentsByGroup,
  getResidentById,
  updateResident,
  deleteResident
} from '../controllers/residentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.post('/', createResident);
router.get('/site/:siteId', getResidentsBySite);
router.get('/group/:groupId', getResidentsByGroup);
router.get('/:id', getResidentById);
router.put('/:id', updateResident);
router.delete('/:id', deleteResident);

export default router;
