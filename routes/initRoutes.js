import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Group from '../models/Group.js';
import Site from '../models/Site.js';
import User from '../models/User.js';

const router = express.Router();

// Liste des 12 sites Vulpia
const vulpiaSites = [
  { name: 'Arthur', email: 'arthur@vulpiagroup.com' },
  { name: 'Beukenhof', email: 'beukenhof@vulpiagroup.com' },
  { name: 'De Linde', email: 'delinde@vulpiagroup.com' },
  { name: 'De Nieuwe Kaai', email: 'denieuwkaai@vulpiagroup.com' },
  { name: 'De Veldekens', email: 'develdekens@vulpiagroup.com' },
  { name: 'Driesenhof', email: 'driesenhof@vulpiagroup.com' },
  { name: 'Elysia Park', email: 'elysiapark@vulpiagroup.com' },
  { name: 'Halmolen', email: 'halmolen@vulpiagroup.com' },
  { name: 'Henri Jaspar Premium Living', email: 'henrijaspar@vulpiagroup.com' },
  { name: 'Herenhof', email: 'herenhof@vulpiagroup.com' },
  { name: 'Villa ter Molen', email: 'villatermolen@vulpiagroup.com' },
  { name: 'Vuerenveld', email: 'vuerenveld@vulpiagroup.com' }
];

/**
 * Route d'initialisation du groupe Vulpia
 * POST /api/init/vulpia
 * Body: { secretKey: "votre-cle-secrete" }
 */
router.post('/vulpia', async (req, res) => {
  try {
    const { secretKey } = req.body;
    
    // Vérifier la clé secrète (pour sécuriser l'initialisation)
    const expectedKey = process.env.INIT_SECRET_KEY || 'VulpiaInit2024!';
    if (secretKey !== expectedKey) {
      return res.status(403).json({ 
        success: false,
        message: 'Clé secrète invalide' 
      });
    }

    const results = {
      group: null,
      groupAdmin: null,
      sites: [],
      users: []
    };

    // 1. Créer ou récupérer le groupe Vulpia
    let group = await Group.findOne({ code: 'vulpia-group' });
    
    if (!group) {
      group = await Group.create({
        name: 'Vulpia Group',
        code: 'vulpia-group',
        contactEmail: 'contact@vulpiagroup.com',
        settings: {
          defaultSyncMode: 'auto',
          weekStart: 'monday',
          timezone: 'Europe/Brussels',
          currency: 'EUR'
        },
        isActive: true,
        subscription: {
          plan: 'enterprise',
          maxSites: 100,
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        }
      });
      results.group = 'created';
    } else {
      results.group = 'exists';
    }

    // 2. Créer ou récupérer le compte administrateur du groupe
    let groupAdmin = await User.findOne({ 
      email: 'admin@vulpiagroup.com',
      role: 'groupe'
    });

    if (!groupAdmin) {
      groupAdmin = await User.create({
        name: 'Administrateur Vulpia',
        email: 'admin@vulpiagroup.com',
        password: 'VulpiaAdmin2024!',
        role: 'groupe',
        groupId: group._id,
        roles: ['GROUP_ADMIN'],
        businessName: 'Vulpia Group',
        establishmentType: null
      });
      results.groupAdmin = {
        status: 'created',
        email: 'admin@vulpiagroup.com',
        password: 'VulpiaAdmin2024!'
      };
    } else {
      results.groupAdmin = {
        status: 'exists',
        email: 'admin@vulpiagroup.com'
      };
    }

    // 3. Créer les 12 sites et leurs comptes utilisateurs
    for (const siteData of vulpiaSites) {
      const siteResult = {
        name: siteData.name,
        email: siteData.email,
        siteStatus: null,
        userStatus: null,
        password: null
      };

      // Créer ou récupérer le site
      let site = await Site.findOne({ 
        siteName: siteData.name,
        groupId: group._id
      });

      if (!site) {
        site = await Site.create({
          groupId: group._id,
          siteName: siteData.name,
          type: 'ehpad',
          address: {
            street: 'À définir',
            city: 'Belgique',
            postalCode: '',
            country: 'Belgique'
          },
          contact: {
            email: siteData.email,
            phone: 'À définir'
          },
          managers: [],
          syncMode: 'auto',
          isActive: true,
          settings: {
            timezone: 'Europe/Brussels',
            mealTimes: {
              lunch: { start: '12:00', end: '14:00' },
              dinner: { start: '18:00', end: '20:00' }
            },
            capacity: {
              lunch: 80,
              dinner: 80
            }
          },
          syncStatus: 'synced'
        });
        siteResult.siteStatus = 'created';
      } else {
        siteResult.siteStatus = 'exists';
      }

      // Créer le compte utilisateur pour le site
      let siteUser = await User.findOne({ 
        email: siteData.email
      });

      if (!siteUser) {
        const defaultPassword = `${siteData.name.replace(/\s+/g, '')}2024!`;
        
        siteUser = await User.create({
          name: `Responsable ${siteData.name}`,
          email: siteData.email,
          password: defaultPassword,
          role: 'collectivite',
          establishmentType: 'ehpad',
          groupId: group._id,
          siteId: site._id,
          roles: ['SITE_MANAGER', 'NUTRITIONIST'],
          businessName: siteData.name,
          phone: 'À définir',
          address: {
            street: 'À définir',
            city: 'Belgique',
            postalCode: '',
            country: 'Belgique'
          }
        });

        // Ajouter le manager au site
        if (!site.managers.includes(siteUser._id)) {
          site.managers.push(siteUser._id);
          await site.save();
        }

        siteResult.userStatus = 'created';
        siteResult.password = defaultPassword;
      } else {
        siteResult.userStatus = 'exists';
      }

      results.sites.push(siteResult);
      results.users.push({
        email: siteData.email,
        status: siteResult.userStatus,
        password: siteResult.password
      });
    }

    res.status(200).json({
      success: true,
      message: 'Groupe Vulpia initialisé avec succès',
      results
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error);
    res.status(500).json({
      success: false,
      message: error.message,
      error: error.toString()
    });
  }
});

/**
 * Route de vérification du statut
 * GET /api/init/vulpia/status
 */
router.get('/vulpia/status', async (req, res) => {
  try {
    const group = await Group.findOne({ code: 'vulpia-group' });
    const groupAdmin = await User.findOne({ email: 'admin@vulpiagroup.com' });
    const sites = await Site.find({ groupId: group?._id });
    const siteUsers = await User.find({ 
      groupId: group?._id,
      role: 'collectivite'
    });

    res.status(200).json({
      success: true,
      status: {
        group: group ? 'exists' : 'not_found',
        groupAdmin: groupAdmin ? 'exists' : 'not_found',
        sitesCount: sites.length,
        usersCount: siteUsers.length,
        sites: sites.map(s => ({
          name: s.siteName,
          isActive: s.isActive,
          type: s.type
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;

