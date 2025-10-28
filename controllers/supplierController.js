import asyncHandler from 'express-async-handler';
import Supplier from '../models/Supplier.js';

// @desc    Récupérer tous les fournisseurs
// @route   GET /api/suppliers
// @access  Private
const getSuppliers = asyncHandler(async (req, res) => {
  const { search, category, status, establishmentType } = req.query;
  
  // Construction du filtre
  let filter = {};
  
  // Filtrer par groupe si l'utilisateur a un groupId
  if (req.user.groupId) {
    filter.groupId = req.user.groupId;
  } else if (req.user.siteId && req.user.siteId.groupId) {
    filter.groupId = req.user.siteId.groupId;
  }
  
  // Filtre par type d'établissement
  if (establishmentType) {
    filter.establishmentType = establishmentType;
  }
  
  // Filtre par statut
  if (status) {
    filter.status = status;
  }
  
  // Filtre par catégorie
  if (category) {
    filter.categories = { $in: [category] };
  }
  
  // Recherche textuelle
  if (search) {
    filter.$text = { $search: search };
  }
  
  console.log('🔍 Filtre fournisseurs:', filter);
  
  const suppliers = await Supplier.find(filter)
    .populate('createdBy', 'name email')
    .populate('groupId', 'name')
    .sort({ createdAt: -1 });
  
  console.log(`✅ ${suppliers.length} fournisseurs trouvés`);
  
  res.json({
    success: true,
    count: suppliers.length,
    data: suppliers
  });
});

// @desc    Récupérer un fournisseur par ID
// @route   GET /api/suppliers/:id
// @access  Private
const getSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id)
    .populate('createdBy', 'name email');
  
  if (!supplier) {
    res.status(404);
    throw new Error('Fournisseur non trouvé');
  }

        res.json({
    success: true,
    data: supplier
  });
});

// @desc    Créer un nouveau fournisseur
// @route   POST /api/suppliers
// @access  Private
const createSupplier = asyncHandler(async (req, res) => {
  const {
    name,
    contact,
    email,
    phone,
    address,
    categories,
    status,
    rating,
    notes,
    establishmentType
  } = req.body;
  
  // Vérifier si le fournisseur existe déjà
  const existingSupplier = await Supplier.findOne({ 
    email,
    createdBy: req.user.id 
  });
  
  if (existingSupplier) {
        res.status(400);
    throw new Error('Un fournisseur avec cet email existe déjà');
    }

  const supplier = await Supplier.create({
        name,
    contact,
    email,
    phone,
    address: address || {},
    categories: categories || [],
    status: status || 'active',
    rating: rating || 3,
    notes,
    createdBy: req.user.id,
    establishmentType: establishmentType || req.user.establishmentType
  });
  
  res.status(201).json({
    success: true,
    data: supplier
  });
});

// @desc    Mettre à jour un fournisseur
// @route   PUT /api/suppliers/:id
// @access  Private
const updateSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
  if (!supplier) {
        res.status(404);
    throw new Error('Fournisseur non trouvé');
  }
  
  // Vérifier que l'utilisateur est le créateur du fournisseur
  if (supplier.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Non autorisé à modifier ce fournisseur');
  }
  
  const updatedSupplier = await Supplier.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name email');
  
  res.json({
    success: true,
    data: updatedSupplier
  });
});

// @desc    Supprimer un fournisseur
// @route   DELETE /api/suppliers/:id
// @access  Private
const deleteSupplier = asyncHandler(async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  
    if (!supplier) {
        res.status(404);
    throw new Error('Fournisseur non trouvé');
  }
  
  // Vérifier que l'utilisateur est le créateur du fournisseur
  if (supplier.createdBy.toString() !== req.user.id) {
    res.status(403);
    throw new Error('Non autorisé à supprimer ce fournisseur');
  }
  
  await Supplier.findByIdAndDelete(req.params.id);
  
  res.json({
    success: true,
    message: 'Fournisseur supprimé avec succès'
  });
});

// @desc    Obtenir les statistiques des fournisseurs
// @route   GET /api/suppliers/stats
// @access  Private
const getSupplierStats = asyncHandler(async (req, res) => {
  const { establishmentType } = req.query;
  
  let filter = { createdBy: req.user.id };
  if (establishmentType) {
    filter.establishmentType = establishmentType;
  }
  
  const stats = await Supplier.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        active: {
          $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
        },
        inactive: {
          $sum: { $cond: [{ $eq: ['$status', 'inactive'] }, 1, 0] }
        },
        suspended: {
          $sum: { $cond: [{ $eq: ['$status', 'suspended'] }, 1, 0] }
        },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);
  
  const categoryStats = await Supplier.aggregate([
    { $match: filter },
    { $unwind: '$categories' },
    {
      $group: {
        _id: '$categories',
        count: { $sum: 1 }
      }
    },
    { $sort: { count: -1 } }
  ]);
  
  res.json({
    success: true,
    data: {
      overview: stats[0] || { total: 0, active: 0, inactive: 0, suspended: 0, avgRating: 0 },
      categories: categoryStats
    }
  });
});

export {
  getSuppliers,
  getSupplier,
  createSupplier,
  updateSupplier,
  deleteSupplier,
  getSupplierStats
};