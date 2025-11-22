import Resident from '../models/Resident.js';
import Site from '../models/Site.js';
import Group from '../models/Group.js';
import { isValidObjectId, isValidString, sanitizeString, sanitizeInteger } from '../middleware/validationMiddleware.js';

/**
 * Créer un nouveau résident
 */
export async function createResident(req, res) {
    try {
        const { siteId, groupId, firstName, lastName } = req.body;
        
        // ✅ VALIDATION : Valider les champs obligatoires
        if (!firstName || !isValidString(firstName, 1, 100)) {
            return res.status(400).json({ 
                success: false,
                message: 'Prénom requis et doit être une chaîne valide (1-100 caractères)' 
            });
        }
        
        if (!lastName || !isValidString(lastName, 1, 100)) {
            return res.status(400).json({ 
                success: false,
                message: 'Nom requis et doit être une chaîne valide (1-100 caractères)' 
            });
        }
        
        // ✅ VALIDATION : Sanitizer les chaînes
        req.body.firstName = sanitizeString(firstName, 100);
        req.body.lastName = sanitizeString(lastName, 100);
        
        // Si pas de siteId fourni, utiliser celui de l'utilisateur connecté
        const finalSiteId = siteId || req.user.siteId;
        
        // ✅ VALIDATION : Valider le siteId
        if (!finalSiteId || !isValidObjectId(finalSiteId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Site ID requis et doit être un ObjectId valide' 
            });
        }
        
        // ✅ VALIDATION : Valider le groupId s'il est fourni
        if (groupId && !isValidObjectId(groupId)) {
            return res.status(400).json({ 
                success: false,
                message: 'Group ID invalide (doit être un ObjectId valide)' 
            });
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
 * SÉCURITÉ : Filtrage strict par siteId et vérification d'autorisation
 */
export async function getResidentsBySite(req, res) {
    try {
        const { siteId } = req.params;
        const { status = 'actif', page = 1, limit = 50, search } = req.query;
        
        // Normaliser le siteId pour éviter les problèmes de type
        const normalizedSiteId = String(siteId).trim();
        
        // Vérifier que le site existe
        const site = await Site.findById(normalizedSiteId);
        if (!site) {
            return res.status(404).json({ 
                success: false,
                message: 'Site non trouvé' 
            });
        }
        
        // 🔐 VÉRIFICATION D'AUTORISATION STRICTE
        // 1. Les admins peuvent accéder à tous les sites
        const isAdmin = req.user.role === 'admin' || 
                       (req.user.roles && Array.isArray(req.user.roles) && req.user.roles.includes('admin'));
        
        // 2. Les admins de groupe peuvent voir tous les sites de leur groupe
        const userGroupId = req.user.groupId ? String(req.user.groupId) : null;
        const siteGroupId = site.groupId ? String(site.groupId) : null;
        const isGroupAdmin = userGroupId && siteGroupId && userGroupId === siteGroupId;
        
        // 3. Les gestionnaires de site peuvent voir uniquement leur site
        const userSiteId = req.user.siteId ? String(req.user.siteId) : null;
        const isSiteManager = userSiteId && userSiteId === normalizedSiteId;
        
        // Vérifier l'autorisation : admin OU groupAdmin OU siteManager
        if (!isAdmin && !isGroupAdmin && !isSiteManager) {
            console.warn(`🔒 Accès refusé - User ${req.user._id} (role: ${req.user.role}, siteId: ${userSiteId}) tentant d'accéder au site ${normalizedSiteId}`);
            return res.status(403).json({ 
                success: false,
                message: 'Accès non autorisé à ce site' 
            });
        }
        
        // 🔐 CONSTRUIRE LA REQUÊTE AVEC FILTRAGE STRICT PAR SITEID
        // IMPORTANT : Toujours filtrer par siteId pour garantir la sécurité même si l'autorisation passe
        let query = { 
            siteId: normalizedSiteId  // Filtrer strictement par siteId
        };
        
        // 🔐 VALIDATION ET FILTRAGE PAR STATUS
        // Liste des statuts valides pour éviter l'injection
        const validStatuses = ['actif', 'inactif', 'decede', 'transfere', 'all'];
        const normalizedStatus = String(status).toLowerCase().trim();
        
        if (normalizedStatus !== 'all' && validStatuses.includes(normalizedStatus)) {
            query.status = normalizedStatus;
        } else if (normalizedStatus !== 'all') {
            // Status invalide, utiliser 'actif' par défaut
            query.status = 'actif';
        }
        
        // 🔐 VALIDATION ET FILTRAGE PAR RECHERCHE (protection contre l'injection regex)
        if (search) {
            const sanitizedSearch = String(search).trim();
            // Limiter la longueur de la recherche pour éviter les attaques DoS
            if (sanitizedSearch.length > 0 && sanitizedSearch.length <= 100) {
                query.$or = [
                    { firstName: { $regex: sanitizedSearch, $options: 'i' } },
                    { lastName: { $regex: sanitizedSearch, $options: 'i' } },
                    { roomNumber: { $regex: sanitizedSearch, $options: 'i' } }
                ];
            }
        }
        
        // 🔐 VALIDATION DE LA PAGINATION
        const pageNum = Math.max(1, parseInt(page) || 1);
        const limitNum = Math.min(1000, Math.max(1, parseInt(limit) || 50)); // Limiter à 1000 max
        const skip = (pageNum - 1) * limitNum;
        
        // 🔐 REQUÊTE AVEC FILTRAGE STRICT
        // Le siteId dans la requête est toujours celui autorisé (normalizedSiteId)
        const residents = await Resident.find(query)
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ lastName: 1, firstName: 1 })
            .skip(skip)
            .limit(limitNum);
        
        const total = await Resident.countDocuments(query);
        
        // 🔐 VÉRIFICATION FINALE : S'assurer que tous les résidents retournés appartiennent bien au site
        // (Double sécurité au cas où il y aurait un problème dans la requête)
        const filteredResidents = residents.filter(resident => {
            const residentSiteId = resident.siteId ? 
                (resident.siteId._id ? String(resident.siteId._id) : String(resident.siteId)) : 
                null;
            return residentSiteId === normalizedSiteId;
        });
        
        res.status(200).json({
            success: true,
            data: filteredResidents,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total,
                pages: Math.ceil(total / limitNum)
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des résidents:', error);
        res.status(500).json({ 
            success: false,
            message: error.message || 'Erreur lors de la récupération des résidents'
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
        
        // ✅ VALIDATION : Valider l'ID du résident
        if (!id || !isValidObjectId(id)) {
            return res.status(400).json({ 
                success: false,
                message: 'ID de résident invalide (doit être un ObjectId valide)' 
            });
        }
        
        const resident = await Resident.findById(id);
        
        if (!resident) {
            return res.status(404).json({ 
                success: false,
                message: 'Résident non trouvé' 
            });
        }
        
        // Vérifier que l'utilisateur a accès à ce résident
        if (req.user.siteId && req.user.siteId.toString() !== resident.siteId.toString()) {
            return res.status(403).json({ 
                success: false,
                message: 'Accès non autorisé' 
            });
        }
        
        // ✅ VALIDATION : Sanitizer les champs de texte s'ils sont présents
        if (req.body.firstName) {
            if (!isValidString(req.body.firstName, 1, 100)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Prénom invalide (1-100 caractères)' 
                });
            }
            req.body.firstName = sanitizeString(req.body.firstName, 100);
        }
        
        if (req.body.lastName) {
            if (!isValidString(req.body.lastName, 1, 100)) {
                return res.status(400).json({ 
                    success: false,
                    message: 'Nom invalide (1-100 caractères)' 
                });
            }
            req.body.lastName = sanitizeString(req.body.lastName, 100);
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
 * Récupérer le nombre de portions équivalentes par site pour un groupe
 * Calcule les portions en tenant compte des demi-portions (0.5) et double portions (1.5)
 */
export async function getPortionsCountBySite(req, res) {
    try {
        const { groupId } = req.params;
        
        // Vérifier que le groupe existe
        const group = await Group.findById(groupId);
        if (!group) {
            return res.status(404).json({ message: 'Groupe non trouvé' });
        }
        
        // Récupérer tous les résidents actifs du groupe
        const residents = await Resident.find({
            groupId: group._id,
            status: 'actif'
        }).select('siteId portionSize');
        
        // Calculer les portions par site
        const portionsMap = {};
        
        residents.forEach(resident => {
            const siteId = resident.siteId?.toString();
            if (!siteId) return;
            
            if (!portionsMap[siteId]) {
                portionsMap[siteId] = 0;
            }
            
            // Calculer la portion équivalente
            // Si portionSize n'est pas défini, utiliser 1 (portion normale) par défaut
            const portionSize = resident.portionSize;
            let portionEquivalent = 1; // Par défaut, portion normale
            
            if (portionSize === 0.5 || portionSize === '0.5') {
                portionEquivalent = 0.5; // Demi-portion
            } else if (portionSize === 2 || portionSize === '2' || portionSize === 'double') {
                portionEquivalent = 1.5; // Double portion = 1.5x
            } else if (portionSize === 1 || portionSize === '1' || portionSize === 'normal' || !portionSize) {
                portionEquivalent = 1; // Portion normale (valeur par défaut)
            }
            
            portionsMap[siteId] += portionEquivalent;
        });
        
        console.log('📊 Portions calculées par site:', portionsMap);
        
        res.status(200).json({
            success: true,
            data: portionsMap
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
        const { mode = 'nutritional' } = req.query;
        
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
        .select('firstName lastName roomNumber nutritionalProfile siteId dateOfBirth status')
        .sort({ lastName: 1, firstName: 1 });
        
        // Si le mode n'est pas nutritionnel, utiliser les autres modes
        if (mode !== 'nutritional') {
            return res.status(200).json({
                success: true,
                data: groupResidentsByMode(residents, mode)
            });
        }
        
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

// Fonction helper pour regrouper les résidents par différents modes
function groupResidentsByMode(residents, mode) {
    const result = {
        totalResidents: residents.length
    };
    
    switch(mode) {
        case 'site':
            const sitesMap = {};
            residents.forEach(resident => {
                const siteId = resident.siteId?._id?.toString() || 'unknown';
                const siteName = resident.siteId?.siteName || resident.siteId?.name || 'Site inconnu';
                
                if (!sitesMap[siteId]) {
                    sitesMap[siteId] = {
                        id: siteId,
                        name: siteName,
                        residents: []
                    };
                }
                
                sitesMap[siteId].residents.push({
                    _id: resident._id,
                    name: `${resident.firstName} ${resident.lastName}`,
                    room: resident.roomNumber,
                    site: siteName,
                    siteType: resident.siteId?.type || 'N/A'
                });
            });
            result.sites = Object.values(sitesMap).sort((a, b) => b.residents.length - a.residents.length);
            break;
            
        case 'age':
            const ageGroups = {
                '0-65': { range: '0-65 ans', residents: [] },
                '66-75': { range: '66-75 ans', residents: [] },
                '76-85': { range: '76-85 ans', residents: [] },
                '86-95': { range: '86-95 ans', residents: [] },
                '96+': { range: '96 ans et plus', residents: [] }
            };
            
            residents.forEach(resident => {
                if (!resident.dateOfBirth) {
                    ageGroups['0-65'].residents.push({
                        _id: resident._id,
                        name: `${resident.firstName} ${resident.lastName}`,
                        room: resident.roomNumber,
                        site: resident.siteId?.siteName || 'N/A'
                    });
                    return;
                }
                
                const age = new Date().getFullYear() - new Date(resident.dateOfBirth).getFullYear();
                let group;
                if (age <= 65) group = '0-65';
                else if (age <= 75) group = '66-75';
                else if (age <= 85) group = '76-85';
                else if (age <= 95) group = '86-95';
                else group = '96+';
                
                ageGroups[group].residents.push({
                    _id: resident._id,
                    name: `${resident.firstName} ${resident.lastName}`,
                    room: resident.roomNumber,
                    site: resident.siteId?.siteName || 'N/A'
                });
            });
            
            result.ageGroups = Object.values(ageGroups).filter(g => g.residents.length > 0);
            break;
            
        case 'status':
            const statusGroups = {
                'actif': { name: 'Actifs', residents: [] },
                'inactif': { name: 'Inactifs', residents: [] }
            };
            
            residents.forEach(resident => {
                const status = resident.status || 'actif';
                statusGroups[status] = statusGroups[status] || { name: status, residents: [] };
                statusGroups[status].residents.push({
                    _id: resident._id,
                    name: `${resident.firstName} ${resident.lastName}`,
                    room: resident.roomNumber,
                    site: resident.siteId?.siteName || 'N/A'
                });
            });
            
            result.statusGroups = Object.values(statusGroups).filter(g => g.residents.length > 0);
            break;
            
        case 'room':
            const roomGroups = {};
            residents.forEach(resident => {
                const room = resident.roomNumber || 'Non assigné';
                if (!roomGroups[room]) {
                    roomGroups[room] = {
                        name: `Chambre ${room}`,
                        residents: []
                    };
                }
                roomGroups[room].residents.push({
                    _id: resident._id,
                    name: `${resident.firstName} ${resident.lastName}`,
                    room: resident.roomNumber,
                    site: resident.siteId?.siteName || 'N/A'
                });
            });
            result.roomGroups = Object.values(roomGroups).sort((a, b) => b.residents.length - a.residents.length);
            break;
            
        case 'diet':
            const dietGroups = {};
            residents.forEach(resident => {
                const restrictions = resident.nutritionalProfile?.dietaryRestrictions || [];
                if (restrictions.length === 0) {
                    const key = 'Aucun régime spécifique';
                    if (!dietGroups[key]) {
                        dietGroups[key] = { name: key, residents: [] };
                    }
                    dietGroups[key].residents.push({
                        _id: resident._id,
                        name: `${resident.firstName} ${resident.lastName}`,
                        room: resident.roomNumber,
                        site: resident.siteId?.siteName || 'N/A'
                    });
                } else {
                    restrictions.forEach(restriction => {
                        const key = restriction.restriction || 'Autre';
                        if (!dietGroups[key]) {
                            dietGroups[key] = { name: key, residents: [] };
                        }
                        dietGroups[key].residents.push({
                            _id: resident._id,
                            name: `${resident.firstName} ${resident.lastName}`,
                            room: resident.roomNumber,
                            site: resident.siteId?.siteName || 'N/A'
                        });
                    });
                }
            });
            result.dietGroups = Object.values(dietGroups).sort((a, b) => b.residents.length - a.residents.length);
            break;
            
        default:
            result.error = 'Mode de regroupement non supporté';
    }
    
    return result;
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
    getPortionsCountBySite,
    getResidentsGroupedByNutritionalProfile
};
