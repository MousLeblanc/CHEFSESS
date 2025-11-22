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

    // Vérifier si l'utilisateur connecté est le propriétaire du fournisseur
    // Si c'est le cas, il peut voir TOUS ses avis (même non approuvés)
    const isOwner = req.user && (
      req.user._id.toString() === supplierId.toString() ||
      req.user.supplierId?.toString() === supplierId.toString()
    );
    
    // Vérifier aussi via le modèle Supplier
    let isSupplierOwner = false;
    if (req.user && !isOwner) {
      try {
        const Supplier = (await import('../models/Supplier.js')).default;
        const supplier = await Supplier.findOne({ 
          _id: supplierId,
          $or: [
            { createdBy: req.user._id },
            { createdBy: req.user.id }
          ]
        });
        isSupplierOwner = !!supplier;
      } catch (err) {
        console.error('Erreur lors de la vérification du propriétaire:', err);
      }
    }
    
    const canSeeAllRatings = isOwner || isSupplierOwner;
    
    // Vérifier d'abord s'il y a des avis (même non approuvés) pour ce fournisseur
    const allRatingsCount = await SupplierRating.countDocuments({ supplier: supplierId });
    console.log(`📊 [getSupplierRatings] Total d'avis (tous statuts) pour ce fournisseur: ${allRatingsCount}`);
    console.log(`📊 [getSupplierRatings] Utilisateur est propriétaire? ${canSeeAllRatings}`);
    
    // Construire le filtre : si c'est le propriétaire, voir tous les avis, sinon seulement les approuvés
    const filter = { supplier: supplierId };
    if (!canSeeAllRatings) {
      filter.status = 'approved';
    }
    
    const ratings = await SupplierRating.find(filter)
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

    const statusLabel = canSeeAllRatings ? 'tous statuts' : 'approuvé(s)';
    console.log(`📊 [getSupplierRatings] ${ratings.length} avis ${statusLabel} trouvé(s)`);
    
    // Si aucun avis approuvé, vérifier s'il y a des avis en attente
    if (ratings.length === 0 && allRatingsCount > 0 && !canSeeAllRatings) {
      const pendingRatings = await SupplierRating.countDocuments({ 
        supplier: supplierId,
        status: { $ne: 'approved' }
      });
      console.log(`📊 [getSupplierRatings] ${pendingRatings} avis en attente de modération`);
    }

    // Calculer les moyennes
    // Si c'est le propriétaire, on peut calculer avec tous les avis, sinon seulement les approuvés
    // (getAverageRating calcule déjà seulement les approuvés, donc c'est cohérent)
    const averages = await SupplierRating.getAverageRating(supplierId);
    
    console.log('📊 [getSupplierRatings] Moyennes calculées:', averages);
    console.log('📊 [getSupplierRatings] Environnement:', process.env.NODE_ENV || 'dev');
    console.log('📊 [getSupplierRatings] User ID:', req.user?._id || req.user?.id);
    console.log('📊 [getSupplierRatings] Ratings retournés:', ratings.length);
    if (ratings.length > 0) {
      console.log('📊 [getSupplierRatings] Premier avis:', {
        id: ratings[0]._id,
        status: ratings[0].status,
        overallRating: ratings[0].overallRating
      });
    }

    res.json({
      success: true,
      data: {
        ratings: ratings || [],
        averages: averages || {
          averageRating: 0,
          count: 0,
          priceAvg: 0,
          deliveryAvg: 0,
          qualityAvg: 0,
          communicationAvg: 0,
          packagingAvg: 0
        },
        // Indiquer si l'utilisateur peut voir tous les avis
        canSeeAllRatings: canSeeAllRatings
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

