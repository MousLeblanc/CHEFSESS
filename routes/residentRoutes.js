import express from 'express';
import { 
    createResident,
    getResidentsBySite,
    getResidentById,
    updateResident,
    deleteResident,
    searchResidents,
    getResidentsByGroup,
    getResidentStats
} from '../controllers/residentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes protégées
router.post('/', protect, createResident);
router.get('/site/:siteId', protect, getResidentsBySite);
router.get('/group/:groupId', protect, getResidentsByGroup);
router.get('/search', protect, searchResidents);
router.get('/stats/:siteId', protect, getResidentStats);
router.get('/:id', protect, getResidentById);
router.put('/:id', protect, updateResident);
router.delete('/:id', protect, deleteResident);

export default router;