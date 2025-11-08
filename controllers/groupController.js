import Group from "../models/Group.js";
import Site from "../models/Site.js";
import User from "../models/User.js";
import MenuMultiSite from "../models/MenuMultiSite.js";
import mongoose from "mongoose";

/**
 * Créer un nouveau groupe
 */
export async function createGroup(req, res) {
  try {
    const { name, code, contactEmail, settings } = req.body;
    
    // Vérifier que le code est unique
    const existingGroup = await Group.findOne({ code });
    if (existingGroup) {
      return res.status(400).json({ message: "Un groupe avec ce code existe déjà" });
    }

    const group = await Group.create({ 
      name, 
      code, 
      contactEmail, 
      settings: settings || {}
    });

    // Assigner l'utilisateur créateur comme GROUP_ADMIN
    await User.findByIdAndUpdate(req.user._id, {
      groupId: group._id,
      roles: ['GROUP_ADMIN']
    });

    console.log(`✅ Groupe créé: ${group.name} (${group.code}) par ${req.user.name}`);
    res.status(201).json(group);
  } catch (error) {
    console.error('Erreur lors de la création du groupe:', error);
    res.status(400).json({ message: error.message });
  }
}

/**
 * Lister tous les groupes (pour les super admins)
 */
export async function listGroups(req, res) {
  try {
    const groups = await Group.find({ isActive: true })
      .populate('subscription')
      .sort({ createdAt: -1 });
    
    res.json(groups);
  } catch (error) {
    console.error('Erreur lors de la récupération des groupes:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupérer un groupe spécifique
 */
export async function getGroup(req, res) {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findById(groupId)
      .populate('subscription');
    
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    res.json(group);
  } catch (error) {
    console.error('Erreur lors de la récupération du groupe:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Mettre à jour un groupe
 */
export async function updateGroup(req, res) {
  try {
    const { groupId } = req.params;
    const updates = req.body;
    
    const group = await Group.findByIdAndUpdate(
      groupId, 
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    console.log(`✅ Groupe mis à jour: ${group.name} par ${req.user.name}`);
    res.json(group);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du groupe:', error);
    res.status(400).json({ message: error.message });
  }
}

/**
 * Supprimer un groupe (soft delete)
 */
export async function deleteGroup(req, res) {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findByIdAndUpdate(
      groupId, 
      { isActive: false }, 
      { new: true }
    );
    
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    // Désactiver aussi tous les sites du groupe
    await Site.updateMany(
      { groupId }, 
      { isActive: false }
    );

    console.log(`🗑️ Groupe supprimé: ${group.name} par ${req.user.name}`);
    res.json({ message: "Groupe supprimé avec succès" });
  } catch (error) {
    console.error('Erreur lors de la suppression du groupe:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Créer un nouveau site dans un groupe
 */
export async function createSite(req, res) {
  try {
    const { groupId } = req.params;
    const { siteName, type, address, contact, managers, syncMode, settings } = req.body;
    
    // Vérifier que le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    // Vérifier la limite de sites
    const currentSitesCount = await Site.countDocuments({ groupId, isActive: true });
    if (currentSitesCount >= group.subscription.maxSites) {
      return res.status(400).json({ 
        message: `Limite de sites atteinte (${group.subscription.maxSites})` 
      });
    }

    const site = await Site.create({
      groupId,
      siteName,
      type,
      address,
      contact,
      managers: managers || [],
      syncMode: syncMode || 'auto',
      settings: settings || {}
    });

    console.log(`✅ Site créé: ${site.siteName} dans le groupe ${group.name}`);
    res.status(201).json(site);
  } catch (error) {
    console.error('Erreur lors de la création du site:', error);
    res.status(400).json({ message: error.message });
  }
}

/**
 * Lister tous les sites d'un groupe (actifs ET inactifs)
 */
export async function listSites(req, res) {
  try {
    const { groupId } = req.params;
    
    // Récupérer TOUS les sites (actifs et inactifs) pour que l'admin puisse les gérer
    const sites = await Site.find({ groupId })
      .populate('managers', 'name email roles')
      .sort([['isActive', -1], ['siteName', 1]]); // Actifs en premier, puis par nom
    
    console.log(`📍 Sites récupérés pour groupe ${groupId}: ${sites.length} (${sites.filter(s => s.isActive).length} actifs, ${sites.filter(s => !s.isActive).length} inactifs)`);
    
    res.json(sites);
  } catch (error) {
    console.error('Erreur lors de la récupération des sites:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupérer un site spécifique (actif ou inactif)
 */
export async function getSite(req, res) {
  try {
    const { groupId, siteId } = req.params;
    
    const site = await Site.findOne({ _id: siteId, groupId })
      .populate('managers', 'name email roles');
    
    if (!site) {
      return res.status(404).json({ message: "Site non trouvé" });
    }

    res.json(site);
  } catch (error) {
    console.error('Erreur lors de la récupération du site:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Mettre à jour un site (actif ou inactif)
 */
export async function updateSite(req, res) {
  try {
    const { groupId, siteId } = req.params;
    const updates = req.body;
    
    const site = await Site.findOneAndUpdate(
      { _id: siteId, groupId },
      updates,
      { new: true, runValidators: true }
    );
    
    if (!site) {
      return res.status(404).json({ message: "Site non trouvé" });
    }

    console.log(`✅ Site mis à jour: ${site.siteName} (${site.isActive ? 'ACTIF' : 'INACTIF'}) par ${req.user.name}`);
    res.json(site);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du site:', error);
    res.status(400).json({ message: error.message });
  }
}

/**
 * Supprimer un site (soft delete)
 */
export async function deleteSite(req, res) {
  try {
    const { groupId, siteId } = req.params;
    
    // Vérifier que le site existe et appartient au groupe
    const site = await Site.findOne({ _id: siteId, groupId });
    
    if (!site) {
      return res.status(404).json({ message: "Site non trouvé ou n'appartient pas à ce groupe" });
    }

    // Supprimer réellement le site de la base de données
    // Note: On pourrait aussi supprimer les résidents, menus, etc. associés
    // Pour l'instant, on supprime juste le site
    await Site.findByIdAndDelete(siteId);

    console.log(`🗑️ Site supprimé définitivement: ${site.siteName} par ${req.user.name}`);
    res.json({ 
      success: true,
      message: "Site supprimé avec succès" 
    });
  } catch (error) {
    console.error('Erreur lors de la suppression du site:', error);
    res.status(500).json({ 
      success: false,
      message: "Erreur serveur",
      error: error.message 
    });
  }
}

/**
 * Ajouter un utilisateur à un groupe
 */
export async function addUserToGroup(req, res) {
  try {
    const { groupId } = req.params;
    const { userId, roles } = req.body;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    // Vérifier que l'utilisateur n'est pas déjà dans un autre groupe
    if (user.groupId && user.groupId.toString() !== groupId) {
      return res.status(400).json({ message: "L'utilisateur appartient déjà à un autre groupe" });
    }

    user.groupId = groupId;
    user.roles = roles || ['VIEWER'];
    await user.save();

    console.log(`✅ Utilisateur ${user.name} ajouté au groupe ${groupId} avec les rôles: ${user.roles.join(', ')}`);
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de l\'ajout de l\'utilisateur au groupe:', error);
    res.status(400).json({ message: error.message });
  }
}

/**
 * Lister les utilisateurs d'un groupe
 */
export async function listGroupUsers(req, res) {
  try {
    const { groupId } = req.params;
    console.log('🔍 Looking for users in group:', groupId);
    
    const users = await User.find({ groupId })
      .select('-password')
      .populate('siteId', 'siteName type')
      .sort({ name: 1 });
    
    console.log('👥 Found users:', users.length);
    users.forEach(user => console.log('   -', user.name, user.email));
    
    res.json(users);
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs du groupe:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Mettre à jour les rôles d'un utilisateur
 */
export async function updateUserRoles(req, res) {
  try {
    const { groupId, userId } = req.params;
    const { roles } = req.body;
    
    const user = await User.findOne({ _id: userId, groupId });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé dans ce groupe" });
    }

    user.roles = roles;
    await user.save();

    console.log(`✅ Rôles mis à jour pour ${user.name}: ${roles.join(', ')}`);
    res.json(user);
  } catch (error) {
    console.error('Erreur lors de la mise à jour des rôles:', error);
    res.status(400).json({ message: error.message });
  }
}

/**
 * Retirer un utilisateur d'un groupe
 */
export async function removeUserFromGroup(req, res) {
  try {
    const { groupId, userId } = req.params;
    
    const user = await User.findOne({ _id: userId, groupId });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé dans ce groupe" });
    }

    user.groupId = undefined;
    user.siteId = undefined;
    user.roles = [];
    await user.save();

    console.log(`✅ Utilisateur ${user.name} retiré du groupe ${groupId}`);
    res.json({ message: "Utilisateur retiré du groupe avec succès" });
  } catch (error) {
    console.error('Erreur lors du retrait de l\'utilisateur du groupe:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupérer les statistiques d'un groupe
 */
export async function getGroupStats(req, res) {
  try {
    const { groupId } = req.params;
    
    const stats = {
      sites: await Site.countDocuments({ groupId, isActive: true }),
      users: await User.countDocuments({ groupId }),
      menus: await MenuMultiSite.countDocuments({ groupId }),
      lastSync: await MenuMultiSite.findOne({ groupId })
        .sort({ lastSyncedAt: -1 })
        .select('lastSyncedAt')
    };

    res.json(stats);
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupérer le statut de synchronisation des menus
 */
export async function getMenusSyncStatus(req, res) {
  try {
    const { groupId } = req.params;
    const { yearWeek } = req.query;
    
    const sites = await Site.find({ groupId, isActive: true });
    const status = [];

    for (const site of sites) {
      const menu = await MenuMultiSite.findOne({ 
        siteId: site._id, 
        yearWeek: yearWeek || new Date().toISOString().slice(0, 7) + '-W' + Math.ceil(new Date().getDate() / 7)
      });

      status.push({
        siteId: site._id,
        siteName: site.siteName,
        syncStatus: menu ? menu.getSyncStatus() : 'no_menu',
        lastSyncedAt: menu?.lastSyncedAt,
        localOverrides: menu?.localOverrides || false,
        syncVersion: menu?.syncVersion || 0
      });
    }

    res.json(status);
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de synchronisation:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Synchroniser les menus vers tous les sites
 */
export async function syncMenusToAllSites(req, res) {
  try {
    const { groupId } = req.params;
    const { yearWeek, strategy = "respect-overrides" } = req.body;
    
    // Cette fonction sera implémentée dans le contrôleur de synchronisation des menus
    res.json({ message: "Synchronisation des menus - à implémenter" });
  } catch (error) {
    console.error('Erreur lors de la synchronisation des menus:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Forcer la synchronisation de tous les sites
 */
export async function forceSyncAllSites(req, res) {
  try {
    const { groupId } = req.params;
    
    // Cette fonction sera implémentée dans le contrôleur de synchronisation des menus
    res.json({ message: "Synchronisation forcée - à implémenter" });
  } catch (error) {
    console.error('Erreur lors de la synchronisation forcée:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupérer le rapport nutritionnel du groupe
 */
export async function getNutritionReport(req, res) {
  try {
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Cette fonction calculera les statistiques nutritionnelles consolidées
    res.json({ message: "Rapport nutritionnel - à implémenter" });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport nutritionnel:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupérer le rapport des coûts du groupe
 */
export async function getCostsReport(req, res) {
  try {
    const { groupId } = req.params;
    const { startDate, endDate } = req.query;
    
    // Cette fonction calculera les statistiques de coûts consolidées
    res.json({ message: "Rapport des coûts - à implémenter" });
  } catch (error) {
    console.error('Erreur lors de la génération du rapport des coûts:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
