import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Site from '../models/Site.js';
import Group from '../models/Group.js';

const router = express.Router();

/**
 * @route   POST /api/admin/fix-supplier-names
 * @desc    Corriger les businessName des fournisseurs
 * @access  Private (Admin uniquement)
 */
router.post('/fix-supplier-names', protect, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && !req.user.roles?.includes('GROUP_ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      });
    }

    console.log('🔧 Début de la correction des businessName...');

    // Récupérer tous les utilisateurs fournisseurs
    const supplierUsers = await User.find({ role: 'fournisseur' });
    console.log(`📊 ${supplierUsers.length} utilisateur(s) fournisseur(s) trouvé(s)`);

    const results = {
      fixed: [],
      skipped: [],
      errors: []
    };

    for (const user of supplierUsers) {
      try {
        // Vérifier si l'utilisateur a un supplierId
        if (!user.supplierId) {
          results.skipped.push({
            email: user.email,
            reason: 'Pas de supplierId',
            currentName: user.businessName
          });
          continue;
        }

        // Récupérer le fournisseur depuis la collection Supplier
        const supplier = await Supplier.findById(user.supplierId);
        
        if (!supplier) {
          results.errors.push({
            email: user.email,
            error: `Supplier non trouvé (ID: ${user.supplierId})`
          });
          continue;
        }

        // Vérifier si le businessName est déjà correct
        if (user.businessName === supplier.name) {
          results.skipped.push({
            email: user.email,
            reason: 'Déjà correct',
            currentName: supplier.name
          });
          continue;
        }

        // Vérifier si le businessName actuel correspond à un nom de site
        const site = await Site.findOne({ siteName: user.businessName });
        const wasSiteName = !!site;

        // Mettre à jour le businessName
        const oldName = user.businessName;
        user.businessName = supplier.name;
        await user.save();

        results.fixed.push({
          email: user.email,
          oldName: oldName,
          newName: supplier.name,
          wasSiteName: wasSiteName
        });

        console.log(`🔧 ${user.email} | "${oldName}" → "${supplier.name}"${wasSiteName ? ' (était un nom de site)' : ''}`);

      } catch (error) {
        results.errors.push({
          email: user.email,
          error: error.message
        });
      }
    }

    console.log('✅ Correction terminée');

    res.json({
      success: true,
      message: 'Correction des businessName terminée',
      summary: {
        total: supplierUsers.length,
        fixed: results.fixed.length,
        skipped: results.skipped.length,
        errors: results.errors.length
      },
      details: results
    });

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la correction',
      error: error.message
    });
  }
});

/**
 * @route   GET /api/admin/check-supplier-names
 * @desc    Vérifier les businessName des fournisseurs sans les modifier
 * @access  Private (Admin uniquement)
 */
router.get('/check-supplier-names', protect, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && !req.user.roles?.includes('GROUP_ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      });
    }

    const supplierUsers = await User.find({ role: 'fournisseur' });
    
    const results = {
      correct: [],
      incorrect: [],
      noSupplierId: [],
      errors: []
    };

    for (const user of supplierUsers) {
      try {
        if (!user.supplierId) {
          results.noSupplierId.push({
            email: user.email,
            currentName: user.businessName
          });
          continue;
        }

        const supplier = await Supplier.findById(user.supplierId);
        
        if (!supplier) {
          results.errors.push({
            email: user.email,
            error: 'Supplier non trouvé'
          });
          continue;
        }

        const site = await Site.findOne({ siteName: user.businessName });
        
        if (user.businessName === supplier.name) {
          results.correct.push({
            email: user.email,
            name: supplier.name
          });
        } else {
          results.incorrect.push({
            email: user.email,
            currentName: user.businessName,
            correctName: supplier.name,
            isSiteName: !!site
          });
        }

      } catch (error) {
        results.errors.push({
          email: user.email,
          error: error.message
        });
      }
    }

    res.json({
      success: true,
      summary: {
        total: supplierUsers.length,
        correct: results.correct.length,
        incorrect: results.incorrect.length,
        noSupplierId: results.noSupplierId.length,
        errors: results.errors.length
      },
      details: results
    });

  } catch (error) {
    console.error('❌ Erreur lors de la vérification:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification',
      error: error.message
    });
  }
});

/**
 * @route   POST /api/admin/fix-missing-suppliers
 * @desc    Créer les Suppliers manquants pour les utilisateurs fournisseurs
 * @access  Private (Admin uniquement)
 */
router.post('/fix-missing-suppliers', protect, async (req, res) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin' && !req.user.roles?.includes('GROUP_ADMIN')) {
      return res.status(403).json({
        success: false,
        message: 'Accès réservé aux administrateurs'
      });
    }

    console.log('🔧 Début de la correction des Suppliers manquants...');

    // Récupérer le groupe Vulpia
    const group = await Group.findOne({ name: 'Vulpia Group' });
    if (!group) {
      return res.status(404).json({
        success: false,
        message: 'Groupe Vulpia non trouvé'
      });
    }

    // Récupérer tous les utilisateurs fournisseurs
    const supplierUsers = await User.find({ role: 'fournisseur' });

    const results = {
      withValidSupplier: [],
      created: [],
      withoutSupplierId: [],
      errors: []
    };

    for (const user of supplierUsers) {
      try {
        // Cas 1 : Pas de supplierId
        if (!user.supplierId) {
          results.withoutSupplierId.push({
            email: user.email,
            businessName: user.businessName
          });
          continue;
        }

        // Cas 2 : Vérifier si le Supplier existe
        const supplier = await Supplier.findById(user.supplierId);
        
        if (supplier) {
          results.withValidSupplier.push({
            email: user.email,
            supplierName: supplier.name
          });
        } else {
          // Créer un nouveau Supplier basé sur le businessName
          const newSupplier = await Supplier.create({
            name: user.businessName || user.name,
            contact: user.name,
            email: user.email,
            phone: user.phone || '+33 1 00 00 00 00',
            address: user.address || {
              street: 'Adresse à compléter',
              city: 'Ville',
              postalCode: '00000',
              country: 'France'
            },
            categories: ['autres'],
            type: 'grossiste',
            status: 'active',
            groupId: group._id
          });

          // Mettre à jour le supplierId de l'utilisateur
          const oldSupplierId = user.supplierId;
          user.supplierId = newSupplier._id;
          await user.save();

          console.log(`✅ Nouveau Supplier créé: "${newSupplier.name}" pour ${user.email}`);
          
          results.created.push({
            email: user.email,
            oldSupplierId: oldSupplierId.toString(),
            newSupplierId: newSupplier._id.toString(),
            supplierName: newSupplier.name
          });
        }

      } catch (error) {
        results.errors.push({
          email: user.email,
          error: error.message
        });
      }
    }

    console.log('✅ Correction des Suppliers manquants terminée');

    res.json({
      success: true,
      message: 'Correction des Suppliers manquants terminée',
      summary: {
        total: supplierUsers.length,
        withValidSupplier: results.withValidSupplier.length,
        created: results.created.length,
        withoutSupplierId: results.withoutSupplierId.length,
        errors: results.errors.length
      },
      details: results
    });

  } catch (error) {
    console.error('❌ Erreur lors de la correction:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la correction',
      error: error.message
    });
  }
});

export default router;

