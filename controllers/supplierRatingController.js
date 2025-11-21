import asyncHandler from 'express-async-handler';
import mongoose from 'mongoose';
import SupplierRating from '../models/SupplierRating.js';
import User from '../models/User.js';
import Site from '../models/Site.js';

/**
 * Créer un avis/note pour un fournisseur
 */
export const createRating = asyncHandler(async (req, res) => {
  try {
    const { supplierId, overallRating, ratings, feedback, orderId } = req.body;
    const reviewerId = req.user._id;
    const siteId = req.user.siteId;

    // Vérifier que le fournisseur existe
    const supplier = await User.findById(supplierId);
    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Fournisseur non trouvé'
      });
    }

    // Vérifier que l'utilisateur n'a pas déjà noté ce fournisseur pour cette commande
    if (orderId) {
      const existingRating = await SupplierRating.findOne({
        supplier: supplierId,
        reviewer: reviewerId,
        order: orderId
      });

      if (existingRating) {
        return res.status(400).json({
          success: false,
          message: 'Vous avez déjà noté ce fournisseur pour cette commande'
        });
      }
    }

    // Créer l'avis
    const rating = new SupplierRating({
      supplier: supplierId,
      reviewer: reviewerId,
      site: siteId,
      overallRating,
      ratings: ratings || {},
      feedback: feedback || {},
      order: orderId || null,
      status: 'approved'
    });

    await rating.save();

    // Populate pour la réponse
    await rating.populate('supplier', 'businessName name');
    await rating.populate('reviewer', 'name');

    res.status(201).json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Erreur lors de la création de l\'avis:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la création de l\'avis',
      error: error.message
    });
  }
});

/**
 * Récupérer les avis d'un fournisseur
 */
export const getSupplierRatings = asyncHandler(async (req, res) => {
  try {
    const { supplierId } = req.params;
    
    console.log('📊 [getSupplierRatings] Récupération des avis pour le fournisseur:', supplierId);

    // Vérifier que supplierId est valide
    if (!supplierId) {
      return res.status(400).json({
        success: false,
        message: 'ID fournisseur requis'
      });
    }

    // Vérifier que l'ID est un ObjectId valide
    if (!mongoose.Types.ObjectId.isValid(supplierId)) {
      return res.status(400).json({
        success: false,
        message: 'ID fournisseur invalide'
      });
    }

    const ratings = await SupplierRating.find({ 
      supplier: supplierId,
      status: 'approved'
    })
      .populate({
        path: 'reviewer',
        select: 'name',
        options: { strictPopulate: false }
      })
      .populate({
        path: 'site',
        select: 'siteName',
        options: { strictPopulate: false }
      })
      .sort({ createdAt: -1 })
      .limit(50);

    console.log(`📊 [getSupplierRatings] ${ratings.length} avis trouvé(s)`);

    // Calculer les moyennes
    const averages = await SupplierRating.getAverageRating(supplierId);
    
    console.log('📊 [getSupplierRatings] Moyennes calculées:', averages);

    res.json({
      success: true,
      data: {
        ratings,
        averages
      }
    });
  } catch (error) {
    console.error('❌ Erreur lors de la récupération des avis:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
});

/**
 * Récupérer les avis d'un site pour tous les fournisseurs
 */
export const getSiteRatings = asyncHandler(async (req, res) => {
  try {
    const siteId = req.user.siteId || req.query.siteId;

    if (!siteId) {
      return res.status(400).json({
        success: false,
        message: 'Site ID requis'
      });
    }

    const ratings = await SupplierRating.find({ 
      site: siteId,
      status: 'approved'
    })
      .populate('supplier', 'businessName name')
      .populate('reviewer', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: ratings
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des avis du site:', error);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des avis',
      error: error.message
    });
  }
});

