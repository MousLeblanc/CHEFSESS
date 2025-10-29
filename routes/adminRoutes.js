import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import User from '../models/User.js';
import Supplier from '../models/Supplier.js';
import Site from '../models/Site.js';

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

export default router;

