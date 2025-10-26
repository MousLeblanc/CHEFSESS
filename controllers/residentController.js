import Resident from '../models/Resident.js';
import Site from '../models/Site.js';
import Group from '../models/Group.js';

/**
 * Créer un nouveau résident
 */
export async function createResident(req, res) {
    try {
        const { siteId, groupId } = req.body;
        
        // Si pas de siteId fourni, utiliser celui de l'utilisateur connecté
        const finalSiteId = siteId || req.user.siteId;
        
        if (!finalSiteId) {
            return res.status(400).json({ message: 'Site ID requis' });
        }
        
        // Vérifier que le site existe et que l'utilisateur y a accès
        const site = await Site.findById(finalSiteId);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce site
        if (req.user.siteId && req.user.siteId.toString() !== finalSiteId.toString()) {
            return res.status(403).json({ message: 'Accès non autorisé à ce site' });
        }
        
        // Créer le résident
        const resident = await Resident.create({
            ...req.body,
            siteId: finalSiteId,
            groupId: groupId || site.groupId,
            createdBy: req.user._id
        });
        
        console.log(`✅ Résident créé: ${resident.getFullName()} pour ${site.siteName}`);
        
        res.status(201).json({
            success: true,
            message: 'Résident créé avec succès',
            data: resident
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du résident:', error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Récupérer tous les résidents (utilise le siteId de l'utilisateur si disponible)
 */
export async function getResidents(req, res) {
    try {
        const { status = 'actif', page = 1, limit = 50, search } = req.query;
        
        // Utiliser le siteId de l'utilisateur connecté
        if (!req.user.siteId) {
            return res.status(400).json({ message: 'Utilisateur non associé à un site' });
        }
        
        const siteId = req.user.siteId;
        
        // Construire la requête
        let query = { siteId };
        
        if (status !== 'all') {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { roomNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        
        const residents = await Resident.find(query)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ lastName: 1, firstName: 1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Resident.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: residents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Récupérer tous les résidents d'un site
 */
export async function getResidentsBySite(req, res) {
    try {
        const { siteId } = req.params;
        const { status = 'actif', page = 1, limit = 50, search } = req.query;
        
        // Vérifier que le site existe
        const site = await Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce site
        // Les admins de groupe peuvent voir tous les sites de leur groupe
        const isGroupAdmin = req.user.groupId && req.user.groupId.toString() === site.groupId?.toString();
        const isSiteManager = req.user.siteId && req.user.siteId.toString() === siteId;
        
        if (!isGroupAdmin && !isSiteManager && req.user.siteId) {
            return res.status(403).json({ message: 'Accès non autorisé à ce site' });
        }
        
        // Construire la requête
        let query = { siteId };
        
        if (status !== 'all') {
            query.status = status;
        }
        
        if (search) {
            query.$or = [
                { firstName: { $regex: search, $options: 'i' } },
                { lastName: { $regex: search, $options: 'i' } },
                { roomNumber: { $regex: search, $options: 'i' } }
            ];
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        
        const residents = await Resident.find(query)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ lastName: 1, firstName: 1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Resident.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: residents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Récupérer les statistiques des résidents (utilise le siteId de l'utilisateur)
 */
export async function getResidentStatsDefault(req, res) {
    try {
        // Utiliser le siteId de l'utilisateur connecté
        if (!req.user.siteId) {
            return res.status(400).json({ message: 'Utilisateur non associé à un site' });
        }
        
        const siteId = req.user.siteId;
        
        // Statistiques générales
        const totalResidents = await Resident.countDocuments({ siteId, status: 'actif' });
        
        // Stats par texture
        const textureStats = await Resident.aggregate([
            { $match: { siteId: siteId, status: 'actif' } },
            {
                $group: {
                    _id: '$nutritionalProfile.texturePreferences.consistency',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Stats par conditions médicales
        const medicalStats = await Resident.aggregate([
            { $match: { siteId: siteId, status: 'actif' } },
            { $unwind: '$nutritionalProfile.medicalConditions' },
            {
                $group: {
                    _id: '$nutritionalProfile.medicalConditions.condition',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        res.status(200).json({
            success: true,
            data: {
                totalResidents,
                textureStats,
                medicalStats
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Récupérer les statistiques des résidents d'un site
 */
export async function getResidentStats(req, res) {
    try {
        const { siteId } = req.params;
        
        // Vérifier que le site existe
        const site = await Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce site
        // Les admins de groupe peuvent voir tous les sites de leur groupe
        const isGroupAdmin = req.user.groupId && req.user.groupId.toString() === site.groupId?.toString();
        const isSiteManager = req.user.siteId && req.user.siteId.toString() === siteId;
        
        if (!isGroupAdmin && !isSiteManager && req.user.siteId) {
            return res.status(403).json({ message: 'Accès non autorisé à ce site' });
        }
        
        // Statistiques pour le dashboard
        const total = await Resident.countDocuments({ siteId });
        const actifs = await Resident.countDocuments({ siteId, status: 'actif' });
        
        // Résidents avec allergies
        const avecAllergies = await Resident.countDocuments({
            siteId,
            status: 'actif',
            'nutritionalProfile.allergies.0': { $exists: true }
        });
        
        // Résidents avec intolérances
        const avecIntolerances = await Resident.countDocuments({
            siteId,
            status: 'actif',
            'nutritionalProfile.intolerances.0': { $exists: true }
        });
        
        res.status(200).json({
            success: true,
            total,
            actifs,
            avecAllergies,
            avecIntolerances
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Récupérer un résident par ID
 */
export async function getResidentById(req, res) {
    try {
        const { id } = req.params;
        
        const resident = await Resident.findById(id)
            .populate('siteId', 'siteName type')
            .populate('groupId', 'name')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');
        
        if (!resident) {
            return res.status(404).json({ message: 'Résident non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce résident
        if (req.user.siteId && req.user.siteId.toString() !== resident.siteId._id.toString()) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }
        
        res.status(200).json({
            success: true,
            data: resident
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Mettre à jour un résident
 */
export async function updateResident(req, res) {
    try {
        const { id } = req.params;
        
        const resident = await Resident.findById(id);
        
        if (!resident) {
            return res.status(404).json({ message: 'Résident non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce résident
        if (req.user.siteId && req.user.siteId.toString() !== resident.siteId.toString()) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }
        
        // Enregistrer la modification dans l'historique
        if (!resident.modificationHistory) {
            resident.modificationHistory = [];
        }
        
        resident.modificationHistory.push({
            date: new Date(),
            modifiedBy: req.user._id,
            changes: 'Modification du profil',
            reason: req.body.reason || 'Mise à jour des informations'
        });
        
        // Mettre à jour les champs
        Object.keys(req.body).forEach(key => {
            if (key !== 'siteId' && key !== 'groupId' && key !== 'createdBy') {
                resident[key] = req.body[key];
            }
        });
        
        resident.lastUpdatedBy = req.user._id;
        
        await resident.save();
        
        console.log(`✅ Résident mis à jour: ${resident.getFullName()}`);
        
        res.status(200).json({
            success: true,
            message: 'Résident mis à jour avec succès',
            data: resident
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(400).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Supprimer un résident (soft delete)
 */
export async function deleteResident(req, res) {
    try {
        const { id } = req.params;
        
        const resident = await Resident.findById(id);
        
        if (!resident) {
            return res.status(404).json({ message: 'Résident non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce résident
        if (req.user.siteId && req.user.siteId.toString() !== resident.siteId.toString()) {
            return res.status(403).json({ message: 'Accès non autorisé' });
        }
        
        // Soft delete : marquer comme inactif
        resident.status = 'sorti';
        resident.lastUpdatedBy = req.user._id;
        await resident.save();
        
        console.log(`✅ Résident marqué comme sorti: ${resident.getFullName()}`);
        
        res.status(200).json({
            success: true,
            message: 'Résident marqué comme sorti'
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Rechercher des résidents
 */
export async function searchResidents(req, res) {
    try {
        const { q, siteId } = req.query;
        
        if (!q || q.length < 2) {
            return res.status(400).json({ message: 'Recherche trop courte (minimum 2 caractères)' });
        }
        
        // Construire la requête
        let query = {
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { roomNumber: { $regex: q, $options: 'i' } }
            ]
        };
        
        // Filtrer par site si fourni, sinon utiliser le siteId de l'utilisateur
        if (siteId) {
            query.siteId = siteId;
        } else if (req.user.siteId) {
            query.siteId = req.user.siteId;
        }
        
        const residents = await Resident.find(query)
            .limit(20)
            .sort({ lastName: 1, firstName: 1 });
        
        res.status(200).json({
            success: true,
            data: residents
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Récupérer tous les résidents d'un groupe
 */
export async function getResidentsByGroup(req, res) {
    try {
        const { groupId } = req.params;
        const { status = 'actif', page = 1, limit = 100 } = req.query;
        
        // Vérifier que le groupe existe
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce groupe
        if (req.user.groupId && req.user.groupId.toString() !== groupId) {
            return res.status(403).json({ message: 'Accès non autorisé à ce groupe' });
        }
        
        // Construire la requête
        let query = { groupId };
        
        if (status !== 'all') {
            query.status = status;
        }
        
        // Pagination
        const skip = (page - 1) * limit;
        
        const residents = await Resident.find(query)
            .populate('siteId', 'siteName type')
            .populate('createdBy', 'name email')
            .sort({ lastName: 1, firstName: 1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Resident.countDocuments(query);
        
        res.status(200).json({
            success: true,
            data: residents,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Récupérer le nombre de résidents par site pour un groupe
 */
export async function getResidentsCountBySite(req, res) {
    try {
        const { groupId } = req.params;
        
        // Vérifier que le groupe existe
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }
        
        // Compter les résidents par site
        const residentsCounts = await Resident.aggregate([
            { $match: { groupId: group._id, status: 'actif' } },
            {
                $group: {
                    _id: '$siteId',
                    count: { $sum: 1 }
                }
            }
        ]);
        
        // Transformer en objet pour faciliter l'accès
        const countsMap = {};
        residentsCounts.forEach(item => {
            countsMap[item._id.toString()] = item.count;
        });
        
        res.status(200).json({
            success: true,
            data: countsMap
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

/**
 * Récupérer les résidents regroupés par profils nutritionnels pour un groupe
 */
export async function getResidentsGroupedByNutritionalProfile(req, res) {
    try {
        const { groupId } = req.params;
        
        // Vérifier que le groupe existe
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce groupe
        if (req.user.groupId && req.user.groupId.toString() !== groupId) {
            return res.status(403).json({ message: 'Accès non autorisé à ce groupe' });
        }
        
        // Récupérer tous les résidents actifs du groupe avec leurs infos
        const residents = await Resident.find({ 
            groupId: group._id, 
            status: 'actif' 
        })
        .populate('siteId', 'siteName type')
        .select('firstName lastName roomNumber nutritionalProfile siteId')
        .sort({ lastName: 1, firstName: 1 });
        
        // Structures pour stocker les groupes
        const allergiesGroups = {};
        const intolerancesGroups = {};
        const restrictionsGroups = {};
        const texturesGroups = {};
        
        // Regrouper les résidents
        residents.forEach(resident => {
            // Grouper par allergies
            const allergies = resident.nutritionalProfile?.allergies || [];
            if (allergies.length > 0) {
                allergies.forEach(allergy => {
                    const key = allergy.allergen;
                    if (!allergiesGroups[key]) {
                        allergiesGroups[key] = {
                            type: 'allergy',
                            name: key,
                            severity: allergy.severity || 'modérée',
                            residents: []
                        };
                    }
                    allergiesGroups[key].residents.push({
                        _id: resident._id,
                        name: `${resident.firstName} ${resident.lastName}`,
                        room: resident.roomNumber,
                        site: resident.siteId?.siteName || 'N/A',
                        siteType: resident.siteId?.type || 'N/A'
                    });
                });
            }
            
            // Grouper par intolérances
            const intolerances = resident.nutritionalProfile?.intolerances || [];
            if (intolerances.length > 0) {
                intolerances.forEach(intolerance => {
                    const key = intolerance.substance;
                    if (!intolerancesGroups[key]) {
                        intolerancesGroups[key] = {
                            type: 'intolerance',
                            name: key,
                            residents: []
                        };
                    }
                    intolerancesGroups[key].residents.push({
                        _id: resident._id,
                        name: `${resident.firstName} ${resident.lastName}`,
                        room: resident.roomNumber,
                        site: resident.siteId?.siteName || 'N/A',
                        siteType: resident.siteId?.type || 'N/A'
                    });
                });
            }
            
            // Grouper par restrictions alimentaires
            const restrictions = resident.nutritionalProfile?.dietaryRestrictions || [];
            if (restrictions.length > 0) {
                restrictions.forEach(restriction => {
                    // ❌ EXCLURE Halal et Casher (gérés au niveau du site, pas comme variantes de menu)
                    const excludedRestrictions = ['Halal', 'halal', 'Casher', 'casher', 'Kasher', 'kasher'];
                    if (excludedRestrictions.includes(restriction.restriction)) {
                        return; // Skip cette restriction
                    }
                    
                    const key = `${restriction.type}: ${restriction.restriction}`;
                    if (!restrictionsGroups[key]) {
                        restrictionsGroups[key] = {
                            type: 'restriction',
                            name: key,
                            restrictionType: restriction.type,
                            restrictionValue: restriction.restriction,  // ✅ Valeur brute pour l'API menu
                            residents: []
                        };
                    }
                    restrictionsGroups[key].residents.push({
                        _id: resident._id,
                        name: `${resident.firstName} ${resident.lastName}`,
                        room: resident.roomNumber,
                        site: resident.siteId?.siteName || 'N/A',
                        siteType: resident.siteId?.type || 'N/A'
                    });
                });
            }
            
            // Grouper par textures
            const texture = resident.nutritionalProfile?.texturePreferences?.consistency;
            if (texture) {
                if (!texturesGroups[texture]) {
                    texturesGroups[texture] = {
                        type: 'texture',
                        name: texture,
                        residents: []
                    };
                }
                texturesGroups[texture].residents.push({
                    _id: resident._id,
                    name: `${resident.firstName} ${resident.lastName}`,
                    room: resident.roomNumber,
                    site: resident.siteId?.siteName || 'N/A',
                    siteType: resident.siteId?.type || 'N/A'
                });
            }
        });
        
        // Convertir les objets en tableaux et trier par nombre de résidents
        const sortByCount = (a, b) => b.residents.length - a.residents.length;
        
        res.status(200).json({
            success: true,
            data: {
                totalResidents: residents.length,
                groups: {
                    allergies: Object.values(allergiesGroups).sort(sortByCount),
                    intolerances: Object.values(intolerancesGroups).sort(sortByCount),
                    restrictions: Object.values(restrictionsGroups).sort(sortByCount),
                    textures: Object.values(texturesGroups).sort(sortByCount)
                }
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
}

export default {
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
    getResidentsGroupedByNutritionalProfile
};
