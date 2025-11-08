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
  getSiteHistory
} from "../controllers/foodCostController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(protect);

// Routes de statistiques
router.get('/stats/summary', getFoodCostStats);

// Route pour les rapports admin (tous les sites)
router.get('/reports', getAdminReports);

// Route pour l'historique d'un site
router.get('/site/:siteId/history', getSiteHistory);

// Routes CRUD de base
router.route('/')
  .get(getFoodCostPeriods)
  .post(createFoodCost);

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

