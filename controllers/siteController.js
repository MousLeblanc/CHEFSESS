import Site from '../models/Site.js';
import User from '../models/User.js';
import MenuMultiSite from '../models/MenuMultiSite.js';
import Group from '../models/Group.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

/**
 * Connexion d'un utilisateur de site
 */
export async function siteLogin(req, res) {
    try {
        const { siteCode, username, password } = req.body;
        
        if (!siteCode || !username || !password) {
            return res.status(400).json({ 
                message: 'Code du site, nom d\'utilisateur et mot de passe requis' 
            });
        }
        
        // Trouver le site par code
        const site = await Site.findOne({ 
            siteName: { $regex: new RegExp(siteCode, 'i') },
            isActive: true 
        }).populate('groupId');
        
        if (!site) {
            return res.status(404).json({ 
                message: 'Site non trouvé ou inactif' 
            });
        }
        
        // Trouver l'utilisateur du site
        const user = await User.findOne({ 
            username,
            groupId: site.groupId._id,
            roles: { $in: ['SITE_MANAGER', 'CHEF', 'NUTRITIONIST'] }
        });
        
        if (!user) {
            return res.status(401).json({ 
                message: 'Nom d\'utilisateur ou mot de passe incorrect' 
            });
        }
        
        // Vérifier le mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ 
                message: 'Nom d\'utilisateur ou mot de passe incorrect' 
            });
        }
        
        // Générer le token JWT
        const token = jwt.sign(
            { 
                userId: user._id, 
                siteId: site._id,
                groupId: site.groupId._id,
                roles: user.roles 
            },
            process.env.JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Définir le cookie
        res.cookie('siteToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });
        
        console.log(`✅ Connexion site réussie: ${user.name} sur ${site.siteName}`);
        
        res.json({
            message: 'Connexion réussie',
            siteId: site._id,
            siteName: site.siteName,
            siteType: site.type,
            user: {
                name: user.name,
                roles: user.roles
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la connexion site:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Déconnexion d'un utilisateur de site
 */
export async function siteLogout(req, res) {
    try {
        res.clearCookie('siteToken');
        res.json({ message: 'Déconnexion réussie' });
    } catch (error) {
        console.error('❌ Erreur lors de la déconnexion site:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Récupérer les données d'un site
 */
export async function getSiteData(req, res) {
    try {
        const { siteId } = req.params;
        
        const site = await Site.findById(siteId)
            .populate('groupId', 'name code')
            .populate('managers', 'name email roles');
        
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        
        // Vérifier que l'utilisateur a accès à ce site
        // Les admins de groupe peuvent voir tous les sites de leur groupe
        const isGroupAdmin = req.user.groupId && req.user.groupId.toString() === site.groupId?._id?.toString();
        const isSiteManager = req.user.siteId && req.user.siteId.toString() === siteId;
        
        if (!isGroupAdmin && !isSiteManager && req.user.siteId) {
            return res.status(403).json({ message: 'Accès non autorisé à ce site' });
        }
        
        res.json(site);
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération du site:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Récupérer les menus d'un site pour une semaine donnée
 */
export async function getSiteMenus(req, res) {
    try {
        const { siteId } = req.params;
        const { yearWeek } = req.query;
        
        if (!yearWeek) {
            return res.status(400).json({ message: 'Paramètre yearWeek requis' });
        }
        
        // Récupérer le site pour vérifier l'accès
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
        
        // Récupérer les menus du site pour la semaine donnée
        const menus = await MenuMultiSite.find({
            siteId,
            yearWeek,
            origin: 'site'
        }).sort({ createdAt: -1 });
        
        res.json(menus);
        
    } catch (error) {
        console.error('❌ Erreur lors de la récupération des menus:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Créer un utilisateur pour un site
 */
export async function createSiteUser(req, res) {
    try {
        const { siteId } = req.params;
        const { name, username, email, password, roles = ['SITE_MANAGER'] } = req.body;
        
        if (!name || !username || !email || !password) {
            return res.status(400).json({ 
                message: 'Nom, nom d\'utilisateur, email et mot de passe requis' 
            });
        }
        
        // Vérifier que le site existe
        const site = await Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        
        // Vérifier que l'utilisateur n'existe pas déjà
        const existingUser = await User.findOne({ 
            $or: [{ username }, { email }] 
        });
        
        if (existingUser) {
            return res.status(400).json({ 
                message: 'Un utilisateur avec ce nom d\'utilisateur ou email existe déjà' 
            });
        }
        
        // Hasher le mot de passe
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Créer l'utilisateur
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            groupId: site.groupId,
            roles,
            businessName: site.siteName,
            establishmentType: site.type
        });
        
        // Ajouter l'utilisateur aux gestionnaires du site
        site.managers.push(user._id);
        await site.save();
        
        console.log(`✅ Utilisateur site créé: ${user.name} pour ${site.siteName}`);
        
        res.status(201).json({
            message: 'Utilisateur créé avec succès',
            user: {
                id: user._id,
                name: user.name,
                username: user.username,
                email: user.email,
                roles: user.roles
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la création de l\'utilisateur site:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}

/**
 * Mettre à jour un utilisateur de site
 */
export async function updateSiteUser(req, res) {
    try {
        const { siteId, userId } = req.params;
        const { name, email, roles, password } = req.body;
        
        // Vérifier que le site existe
        const site = await Site.findById(siteId);
        if (!site) {
            return res.status(404).json({ message: 'Site non trouvé' });
        }
        
        // Vérifier que l'utilisateur existe et appartient au site
        const user = await User.findOne({ 
            _id: userId, 
            groupId: site.groupId 
        });
        
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé' });
        }
        
        // Mettre à jour les champs fournis
        if (name) user.name = name;
        if (email) user.email = email;
        if (roles) user.roles = roles;
        
        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }
        
        await user.save();
        
        console.log(`✅ Utilisateur site mis à jour: ${user.name}`);
        
        res.json({
            message: 'Utilisateur mis à jour avec succès',
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                roles: user.roles
            }
        });
        
    } catch (error) {
        console.error('❌ Erreur lors de la mise à jour de l\'utilisateur site:', error);
        res.status(500).json({ message: 'Erreur serveur' });
    }
}
