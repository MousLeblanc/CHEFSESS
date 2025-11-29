// routes/complianceRoutes.js
// Routes pour la vérification de conformité AVIQ et Annexe 120

import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import {
  verifyAVIQCompliance,
  verifyAnnexe120Compliance
} from '../controllers/complianceController.js';

const router = express.Router();

// Toutes les routes sont protégées
router.use(protect);

// Vérification conformité AVIQ
router.get('/aviq', verifyAVIQCompliance);

// Vérification conformité Annexe 120
router.get('/annexe120', verifyAnnexe120Compliance);

export default router;

