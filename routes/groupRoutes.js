import express from "express";
import * as groupCtrl from "../controllers/groupController.js";
import { 
  requireAuth, 
  loadUser, 
  requireRoles, 
  requireGroupAccess,
  logMultiSiteAccess 
} from "../middleware/multiSiteAuth.js";

const router = express.Router();

// Middleware global pour les routes de groupes
router.use(requireAuth, loadUser, logMultiSiteAccess);

// Routes pour les groupes
router.post("/", requireRoles("GROUP_ADMIN"), groupCtrl.createGroup);
router.get("/", requireRoles("GROUP_ADMIN"), groupCtrl.listGroups);
router.get("/:groupId", requireGroupAccess("groupId"), groupCtrl.getGroup);
router.put("/:groupId", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.updateGroup);
router.delete("/:groupId", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.deleteGroup);

// Routes pour les sites d'un groupe
router.post("/:groupId/sites", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.createSite);
router.get("/:groupId/sites", requireGroupAccess("groupId"), groupCtrl.listSites);
router.get("/:groupId/sites/:siteId", requireGroupAccess("groupId"), groupCtrl.getSite);
router.put("/:groupId/sites/:siteId", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.updateSite);
router.delete("/:groupId/sites/:siteId", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.deleteSite);

// Routes pour les utilisateurs d'un groupe
router.post("/:groupId/users", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.addUserToGroup);
router.get("/:groupId/users", requireGroupAccess("groupId"), groupCtrl.listGroupUsers);
router.put("/:groupId/users/:userId/roles", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.updateUserRoles);
router.delete("/:groupId/users/:userId", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.removeUserFromGroup);

// Routes pour les statistiques et rapports
router.get("/:groupId/stats", requireGroupAccess("groupId"), groupCtrl.getGroupStats);
router.get("/:groupId/menus/status", requireGroupAccess("groupId"), groupCtrl.getMenusSyncStatus);
router.get("/:groupId/reports/nutrition", requireGroupAccess("groupId"), groupCtrl.getNutritionReport);
router.get("/:groupId/reports/costs", requireGroupAccess("groupId"), groupCtrl.getCostsReport);

// Routes pour la synchronisation
router.post("/:groupId/sync/menus", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.syncMenusToAllSites);
router.post("/:groupId/sync/force", requireGroupAccess("groupId"), requireRoles("GROUP_ADMIN"), groupCtrl.forceSyncAllSites);

export default router;
