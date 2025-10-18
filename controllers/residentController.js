import Resident from '../models/Resident.js';
import Site from '../models/Site.js';
import Group from '../models/Group.js';

/**
 * Créer un nouveau résident
 */
export async function createResident(req, res) {
    try {
        const { siteId, groupId } = req.body;
        
        // Vérifier que le site existe et que l'utilisateur y a accès
        const site = await Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce site
        if (req.user.siteId && req.user.siteId.toString() !== siteId) {
            return res.status(403).json({ message: 'Accès non autorisé à ce site' });
        }
        
        // Créer le résident
        const resident = await Resident.create({
            ...req.body,
            siteId,
            groupId: groupId || site.groupId,
            createdBy: req.user._id
        });
        
        console.log(`✅ Résident créé: ${resident.getFullName()} pour ${site.siteName}`);
        
        res.status(201).json({
            message: 'Résident créé avec succès',
            resident
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la création du résident:', error);
        res.status(400).json({ message: error.message });
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
        if (req.user.siteId && req.user.siteId.toString() !== siteId) {
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
        
        res.json({
            residents,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des résidents:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Récupérer tous les résidents d'un groupe (vue centralisée)
 */
export async function getResidentsByGroup(req, res) {
    try {
        const { groupId } = req.params;
        const { status = 'actif', page = 1, limit = 100, search, siteId } = req.query;
        
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
        
        if (siteId) {
            query.siteId = siteId;
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
            .populate('siteId', 'siteName type')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email')
            .sort({ 'siteId.siteName': 1, lastName: 1, firstName: 1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Resident.countDocuments(query);
        
        res.json({
            residents,
            pagination: {
                current: parseInt(page),
                pages: Math.ceil(total / limit),
                total,
                limit: parseInt(limit)
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des résidents du groupe:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Récupérer un résident par son ID
 */
export async function getResidentById(req, res) {
    try {
        const { id } = req.params;
        
        const resident = await Resident.findById(id)
            .populate('siteId', 'siteName type')
            .populate('createdBy', 'name email')
            .populate('lastUpdatedBy', 'name email');
        
        if (!resident) {
            return res.status(404).json({ message: 'Résident non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce résident
        if (req.user.siteId && req.user.siteId.toString() !== resident.siteId._id.toString()) {
            return res.status(403).json({ message: 'Accès non autorisé à ce résident' });
        }
        
        res.json(resident);
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du résident:', error);
        res.status(500).json({ message: 'Erreur serveur' });
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
            return res.status(403).json({ message: 'Accès non autorisé à ce résident' });
        }
        
        // Ajouter l'historique des modifications
        const changes = Object.keys(req.body).join(', ');
        resident.modificationHistory.push({
            modifiedBy: req.user._id,
            changes,
            reason: req.body.modificationReason || 'Mise à jour'
        });
        
        // Mettre à jour le résident
        Object.assign(resident, req.body);
        resident.lastUpdatedBy = req.user._id;
        
        await resident.save();
        
        console.log(`✅ Résident mis à jour: ${resident.getFullName()}`);
        
        res.json({
            message: 'Résident mis à jour avec succès',
            resident
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour du résident:', error);
        res.status(400).json({ message: error.message });
    }
}

/**
 * Supprimer un résident
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
            return res.status(403).json({ message: 'Accès non autorisé à ce résident' });
        }
        
        // Marquer comme inactif au lieu de supprimer
        resident.status = 'inactif';
        resident.lastUpdatedBy = req.user._id;
        resident.modificationHistory.push({
            modifiedBy: req.user._id,
            changes: 'Suppression (marqué comme inactif)',
            reason: req.body.reason || 'Suppression demandée'
        });
        
        await resident.save();
        
        console.log(`✅ Résident marqué comme inactif: ${resident.getFullName()}`);
        
        res.json({
            message: 'Résident marqué comme inactif avec succès'
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la suppression du résident:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Rechercher des résidents
 */
export async function searchResidents(req, res) {
    try {
        const { q, siteId, groupId, status = 'actif' } = req.query;
        
        if (!q) {
            return res.status(400).json({ message: 'Paramètre de recherche requis' });
        }
        
        let query = {
            $or: [
                { firstName: { $regex: q, $options: 'i' } },
                { lastName: { $regex: q, $options: 'i' } },
                { roomNumber: { $regex: q, $options: 'i' } }
            ]
        };
        
        if (siteId) {
            query.siteId = siteId;
        }
        
        if (groupId) {
            query.groupId = groupId;
        }
        
        if (status !== 'all') {
            query.status = status;
        }
        
        const residents = await Resident.find(query)
            .populate('siteId', 'siteName type')
            .limit(20)
            .sort({ lastName: 1, firstName: 1 });
        
        res.json({ residents });
        
    } catch (error) {
        console.error('❌ Erreur lors de la recherche des résidents:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Récupérer les statistiques des résidents d'un site
 */
export async function getResidentStats(req, res) {
    try {
        const { siteId } = req.params;
        
        const stats = await Resident.aggregate([
            { $match: { siteId: mongoose.Types.ObjectId(siteId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    actifs: {
                        $sum: { $cond: [{ $eq: ['$status', 'actif'] }, 1, 0] }
                    },
                    inactifs: {
                        $sum: { $cond: [{ $eq: ['$status', 'inactif'] }, 1, 0] }
                    },
                    sortis: {
                        $sum: { $cond: [{ $eq: ['$status', 'sorti'] }, 1, 0] }
                    },
                    avecAllergies: {
                        $sum: {
                            $cond: [
                                { $gt: [{ $size: '$nutritionalProfile.allergies' }, 0] },
                                1, 0
                            ]
                        }
                    },
                    avecIntolerances: {
                        $sum: {
                            $cond: [
                                { $gt: [{ $size: '$nutritionalProfile.intolerances' }, 0] },
                                1, 0
                            ]
                        }
                    }
                }
            }
        ]);
        
        res.json(stats[0] || {
            total: 0,
            actifs: 0,
            inactifs: 0,
            sortis: 0,
            avecAllergies: 0,
            avecIntolerances: 0
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}