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
    getResidentStatsDefault,
    getResidentsCountBySite,
    getPortionsCountBySite,
    getResidentsGroupedByNutritionalProfile
} from '../controllers/residentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { csrfProtection } from '../middleware/csrfMiddleware.js';

const router = express.Router();

// Routes protégées
router.post('/', protect, csrfProtection, createResident);
router.get('/site/:siteId', protect, getResidentsBySite);
router.get('/group/:groupId', protect, getResidentsByGroup);
router.get('/group/:groupId/counts', protect, getResidentsCountBySite);
router.get('/group/:groupId/portions', protect, getPortionsCountBySite);
router.get('/group/:groupId/grouped', protect, getResidentsGroupedByNutritionalProfile);
router.get('/search', protect, searchResidents);
router.get('/stats/:siteId', protect, getResidentStats);
router.get('/stats', protect, getResidentStatsDefault); // Route par défaut utilisant le siteId de l'utilisateur
router.get('/:id', protect, getResidentById);
router.put('/:id', protect, csrfProtection, updateResident);
router.delete('/:id', protect, csrfProtection, deleteResident);
router.get('/', protect, getResidents); // Route par défaut utilisant le siteId de l'utilisateur

export default router;