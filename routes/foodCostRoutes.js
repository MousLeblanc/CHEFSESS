import express from "express";
import {
  getFoodCostPeriods,
  getFoodCostById,
  createFoodCost,
  updateFoodCost,
  deleteFoodCost,
  addManualExpense,
  deleteManualExpense,
  recalculateOrders,
  getFoodCostStats,
  acknowledgeAlert,
  getAdminReports,
  getSiteHistory,
  getFinancialAnalysis
} from "../controllers/foodCostController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// IMPORTANT: Les routes spécifiques (sans paramètres) doivent être définies AVANT les routes avec paramètres
// pour éviter que des chaînes comme "financial-analysis" soient traitées comme des IDs

// Routes de statistiques
router.get('/stats/summary', getFoodCostStats);

// Route pour les rapports admin (tous les sites)
router.get('/reports', getAdminReports);

// Route pour les analyses financières (DOIT être avant /:id)
router.get('/financial-analysis', getFinancialAnalysis);

// Routes CRUD de base
router.route('/')
  .get(getFoodCostPeriods)
  .post(createFoodCost);

// Route pour l'historique d'un site (avec paramètre, donc après les routes spécifiques)
router.get('/site/:siteId/history', getSiteHistory);

// Routes avec paramètre :id (DOIT être en dernier pour éviter les conflits)
router.route('/:id')
  .get(getFoodCostById)
  .put(updateFoodCost)
  .delete(deleteFoodCost);

// Routes pour les dépenses manuelles
router.post('/:id/expense', addManualExpense);
router.delete('/:id/expense/:expenseId', deleteManualExpense);

// Recalculer les commandes
router.post('/:id/recalculate', recalculateOrders);

// Gérer les alertes
router.put('/:id/alerts/:alertId/acknowledge', acknowledgeAlert);

export default router;

