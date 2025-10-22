import express from 'express';
import { 
    createResident,
    getResidents,
    getResidentsBySite,
    getResidentById,
    updateResident,
    deleteResident,
    searchResidents,
    getResidentsByGroup,
    getResidentStats,
    getResidentStatsDefault
} from '../controllers/residentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes protégées
router.post('/', protect, createResident);
router.get('/site/:siteId', protect, getResidentsBySite);
router.get('/group/:groupId', protect, getResidentsByGroup);
router.get('/search', protect, searchResidents);
router.get('/stats/:siteId', protect, getResidentStats);
router.get('/stats', protect, getResidentStatsDefault); // Route par défaut utilisant le siteId de l'utilisateur
router.get('/:id', protect, getResidentById);
router.put('/:id', protect, updateResident);
router.delete('/:id', protect, deleteResident);
router.get('/', protect, getResidents); // Route par défaut utilisant le siteId de l'utilisateur

export default router;