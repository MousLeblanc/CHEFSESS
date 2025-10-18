import express from "express";
import * as menuSyncCtrl from "../controllers/menuSyncController.js";
import { 
  requireAuth, 
  loadUser, 
  requireRoles, 
  requireGroupAccess,
  requireSyncPermission,
  requireMenuEditPermission,
  logMultiSiteAccess 
} from "../middleware/multiSiteAuth.js";

const router = express.Router();

// Middleware global pour les routes de synchronisation
router.use(requireAuth, loadUser, logMultiSiteAccess);

// Routes pour les menus de groupe
router.post("/group", requireRoles("GROUP_ADMIN"), menuSyncCtrl.upsertGroupMenu);
router.post("/sync-group", requireSyncPermission(), menuSyncCtrl.syncGroupMenuToSites);

// Routes pour la gestion des menus locaux
router.put("/:siteId/:yearWeek/local-override", requireMenuEditPermission(), menuSyncCtrl.markMenuAsLocalOverride);

// Routes pour le statut et l'historique
router.get("/:groupId/status", requireGroupAccess("groupId"), menuSyncCtrl.getGroupSyncStatus);
router.get("/:groupId/history", requireGroupAccess("groupId"), menuSyncCtrl.getSyncHistory);

// Route pour forcer la synchronisation d'un site spécifique
router.post("/:groupId/:siteId/:yearWeek/force-sync", requireSyncPermission(), menuSyncCtrl.forceSyncSite);

export default router;
