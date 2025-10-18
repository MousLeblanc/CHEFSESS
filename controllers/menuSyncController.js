import MenuMultiSite from "../models/MenuMultiSite.js";
import Site from "../models/Site.js";
import Group from "../models/Group.js";
import mongoose from "mongoose";

/**
 * Créer ou mettre à jour le menu "siège" (origin=group) pour une semaine donnée
 */
export async function upsertGroupMenu(req, res) {
  try {
    const { groupId, yearWeek, label, entries, theme } = req.body;
    
    if (!groupId || !yearWeek) {
      return res.status(400).json({ message: "groupId et yearWeek sont requis" });
    }

    // Vérifier que le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }

    const found = await MenuMultiSite.findOne({ groupId, yearWeek, origin: "group" });
    let menu;

    if (found) {
      // Mettre à jour le menu existant
      found.label = label ?? found.label;
      found.entries = entries ?? found.entries;
      found.theme = theme ?? found.theme;
      found.syncVersion = (found.syncVersion || 1) + 1;
      found.lastSyncedAt = new Date();
      menu = await found.save();
      
      console.log(`✅ Menu siège mis à jour: ${menu.label} (v${menu.syncVersion})`);
    } else {
      // Créer un nouveau menu siège
      menu = await MenuMultiSite.create({
        groupId,
        yearWeek,
        label,
        entries: entries || [],
        theme,
        origin: "group",
        syncVersion: 1,
        createdBy: req.user._id
      });
      
      console.log(`✅ Menu siège créé: ${menu.label} (v${menu.syncVersion})`);
    }

    res.status(200).json({ 
      message: "Menu siège enregistré avec succès", 
      menu,
      version: menu.syncVersion
    });
  } catch (error) {
    console.error('Erreur lors de la création/mise à jour du menu siège:', error);
    res.status(400).json({ message: error.message });
  }
}

/**
 * Synchroniser le menu "siège" vers tous les sites actifs du groupe (idempotent)
 */
export async function syncGroupMenuToSites(req, res) {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { groupId, yearWeek, strategy = "respect-overrides" } = req.body;
    
    if (!groupId || !yearWeek) {
      return res.status(400).json({ message: "groupId et yearWeek sont requis" });
    }

    // Récupérer le menu siège
    const groupMenu = await MenuMultiSite.findOne({ groupId, yearWeek, origin: "group" });
    if (!groupMenu) {
      return res.status(404).json({ message: "Menu siège introuvable pour cette semaine" });
    }

    // Récupérer tous les sites actifs du groupe
    const sites = await Site.find({ groupId, isActive: true });
    if (sites.length === 0) {
      return res.status(404).json({ message: "Aucun site actif trouvé pour ce groupe" });
    }

    let syncedCount = 0;
    let skipped = [];
    let errors = [];

    for (const site of sites) {
      try {
        const where = { siteId: site._id, yearWeek };
        let siteMenu = await MenuMultiSite.findOne(where).session(session);

        if (!siteMenu) {
          // Créer une copie du menu pour ce site
          siteMenu = await MenuMultiSite.create([{
            siteId: site._id,
            yearWeek,
            label: groupMenu.label,
            entries: groupMenu.entries,
            theme: groupMenu.theme,
            origin: "site",
            originMenuId: groupMenu._id,
            syncVersion: groupMenu.syncVersion,
            lastSyncedAt: new Date(),
            localOverrides: false,
            createdBy: req.user._id
          }], { session });
          
          syncedCount++;
          console.log(`✅ Menu synchronisé vers ${site.siteName}`);
        } else {
          // Mise à jour idempotente
          const isOlder = (siteMenu.syncVersion || 0) < groupMenu.syncVersion;
          const shouldUpdate = strategy === "overwrite-all" || (!siteMenu.localOverrides && isOlder);
          
          if (shouldUpdate) {
            siteMenu.label = groupMenu.label;
            siteMenu.entries = groupMenu.entries;
            siteMenu.theme = groupMenu.theme;
            siteMenu.originMenuId = groupMenu._id;
            siteMenu.syncVersion = groupMenu.syncVersion;
            siteMenu.lastSyncedAt = new Date();
            siteMenu.localOverrides = false; // Reset local overrides
            await siteMenu.save({ session });
            
            syncedCount++;
            console.log(`✅ Menu mis à jour pour ${site.siteName}`);
          } else {
            const reason = siteMenu.localOverrides ? "local-overrides" : "already-up-to-date";
            skipped.push({ 
              siteId: site._id, 
              siteName: site.siteName, 
              reason,
              currentVersion: siteMenu.syncVersion,
              groupVersion: groupMenu.syncVersion
            });
            console.log(`⏭️ Menu ignoré pour ${site.siteName}: ${reason}`);
          }
        }
      } catch (siteError) {
        console.error(`Erreur lors de la synchronisation vers ${site.siteName}:`, siteError);
        errors.push({
          siteId: site._id,
          siteName: site.siteName,
          error: siteError.message
        });
      }
    }

    await session.commitTransaction();
    session.endSession();

    console.log(`🎯 Synchronisation terminée: ${syncedCount} sites synchronisés, ${skipped.length} ignorés, ${errors.length} erreurs`);

    res.json({
      message: "Synchronisation terminée",
      groupId,
      yearWeek,
      groupMenuVersion: groupMenu.syncVersion,
      syncedCount,
      skipped,
      errors,
      totalSites: sites.length
    });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Erreur lors de la synchronisation des menus:', error);
    res.status(500).json({ message: "Erreur lors de la synchronisation", error: error.message });
  }
}

/**
 * Marquer un menu site comme modifié localement
 */
export async function markMenuAsLocalOverride(req, res) {
  try {
    const { siteId, yearWeek } = req.params;
    const { modifiedEntries } = req.body;

    const siteMenu = await MenuMultiSite.findOne({ siteId, yearWeek });
    if (!siteMenu) {
      return res.status(404).json({ message: "Menu site non trouvé" });
    }

    // Vérifier que l'utilisateur peut modifier ce site
    if (!req.user.canAccessSite(siteId) && !req.user.isGroupAdmin()) {
      return res.status(403).json({ message: "Permissions insuffisantes pour modifier ce menu" });
    }

    // Mettre à jour les entrées si fournies
    if (modifiedEntries) {
      siteMenu.entries = modifiedEntries;
    }

    // Marquer comme modifié localement
    siteMenu.localOverrides = true;
    siteMenu.lastSyncedAt = new Date();
    await siteMenu.save();

    console.log(`🔧 Menu marqué comme modifié localement: ${siteMenu.label} (${siteId})`);

    res.json({
      message: "Menu marqué comme modifié localement",
      menu: siteMenu,
      localOverrides: true
    });
  } catch (error) {
    console.error('Erreur lors du marquage du menu comme modifié localement:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupérer le statut de synchronisation d'un groupe pour une semaine
 */
export async function getGroupSyncStatus(req, res) {
  try {
    const { groupId } = req.params;
    const { yearWeek } = req.query;

    if (!yearWeek) {
      return res.status(400).json({ message: "yearWeek est requis" });
    }

    // Récupérer le menu siège
    const groupMenu = await MenuMultiSite.findOne({ groupId, yearWeek, origin: "group" });
    if (!groupMenu) {
      return res.status(404).json({ message: "Menu siège non trouvé pour cette semaine" });
    }

    // Récupérer tous les sites et leurs menus
    const sites = await Site.find({ groupId, isActive: true });
    const status = [];

    for (const site of sites) {
      const siteMenu = await MenuMultiSite.findOne({ siteId: site._id, yearWeek });
      
      status.push({
        siteId: site._id,
        siteName: site.siteName,
        siteType: site.type,
        hasMenu: !!siteMenu,
        syncStatus: siteMenu ? siteMenu.getSyncStatus() : 'no_menu',
        syncVersion: siteMenu?.syncVersion || 0,
        groupVersion: groupMenu.syncVersion,
        isUpToDate: siteMenu ? siteMenu.syncVersion >= groupMenu.syncVersion : false,
        localOverrides: siteMenu?.localOverrides || false,
        lastSyncedAt: siteMenu?.lastSyncedAt,
        lastModified: siteMenu?.updatedAt
      });
    }

    res.json({
      groupId,
      yearWeek,
      groupMenu: {
        label: groupMenu.label,
        version: groupMenu.syncVersion,
        lastSyncedAt: groupMenu.lastSyncedAt,
        entriesCount: groupMenu.entries.length
      },
      sites: status,
      summary: {
        totalSites: sites.length,
        syncedSites: status.filter(s => s.isUpToDate).length,
        localOverrides: status.filter(s => s.localOverrides).length,
        noMenu: status.filter(s => !s.hasMenu).length
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération du statut de synchronisation:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Forcer la synchronisation d'un site spécifique
 */
export async function forceSyncSite(req, res) {
  try {
    const { groupId, siteId, yearWeek } = req.params;

    // Récupérer le menu siège
    const groupMenu = await MenuMultiSite.findOne({ groupId, yearWeek, origin: "group" });
    if (!groupMenu) {
      return res.status(404).json({ message: "Menu siège non trouvé" });
    }

    // Récupérer le site
    const site = await Site.findOne({ _id: siteId, groupId, isActive: true });
    if (!site) {
      return res.status(404).json({ message: "Site non trouvé" });
    }

    // Forcer la synchronisation (ignorer les local overrides)
    const siteMenu = await MenuMultiSite.findOneAndUpdate(
      { siteId, yearWeek },
      {
        label: groupMenu.label,
        entries: groupMenu.entries,
        theme: groupMenu.theme,
        originMenuId: groupMenu._id,
        syncVersion: groupMenu.syncVersion,
        lastSyncedAt: new Date(),
        localOverrides: false
      },
      { upsert: true, new: true }
    );

    console.log(`🔄 Synchronisation forcée vers ${site.siteName}`);

    res.json({
      message: "Synchronisation forcée réussie",
      site: {
        id: site._id,
        name: site.siteName
      },
      menu: siteMenu
    });
  } catch (error) {
    console.error('Erreur lors de la synchronisation forcée:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}

/**
 * Récupérer l'historique des synchronisations d'un groupe
 */
export async function getSyncHistory(req, res) {
  try {
    const { groupId } = req.params;
    const { limit = 50 } = req.query;

    const history = await MenuMultiSite.find({ groupId })
      .populate('siteId', 'siteName type')
      .sort({ lastSyncedAt: -1 })
      .limit(parseInt(limit));

    res.json(history);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'historique:', error);
    res.status(500).json({ message: "Erreur serveur" });
  }
}
