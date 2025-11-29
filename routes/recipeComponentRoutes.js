// routes/recipeComponentRoutes.js
import express from 'express';
import RecipeComponent from '../models/RecipeComponent.js';
import { protect } from '../middleware/authMiddleware.js';
import asyncHandler from 'express-async-handler';

const router = express.Router();

// @desc    Créer un composant de recette
// @route   POST /api/recipe-components
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const component = new RecipeComponent({
    ...req.body,
    createdBy: req.user._id
  });
  
  const createdComponent = await component.save();
  res.status(201).json({
    success: true,
    data: createdComponent
  });
}));

// @desc    Récupérer tous les composants avec filtres
// @route   GET /api/recipe-components
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  const {
    type, // 'protein', 'sauce', 'accompaniment', 'garnish'
    proteinCategory, // 'volaille', 'viande', 'poisson', etc.
    compatibleWithProtein, // ID d'une protéine pour trouver ses sauces/accompagnements
    allergens, // Liste d'allergènes à exclure
    dietaryRestrictions, // Restrictions alimentaires
    establishmentType,
    tags, // Tags pour filtrer (séparés par virgule)
    limit = 100,
    skip = 0
  } = req.query;
  
  let filter = {};
  
  // Filtrer par type
  if (type) {
    filter.type = type;
  }
  
  // Filtrer par catégorie de protéine
  if (proteinCategory) {
    filter.proteinCategory = proteinCategory;
  }
  
  // Filtrer par compatibilité avec une protéine
  if (compatibleWithProtein) {
    if (type === 'sauce' || type === 'accompaniment') {
      filter['compatibleWith.proteins'] = compatibleWithProtein;
    } else if (type === 'protein') {
      // Si on cherche une protéine compatible avec une sauce/accompagnement
      filter['compatibleWith.sauces'] = compatibleWithProtein;
    }
  }
  
  // Exclure les allergènes
  if (allergens) {
    const allergensList = Array.isArray(allergens) ? allergens : allergens.split(',');
    filter.allergens = { $nin: allergensList };
  }
  
  // Filtrer par restrictions alimentaires
  if (dietaryRestrictions) {
    const restrictionsList = Array.isArray(dietaryRestrictions) 
      ? dietaryRestrictions 
      : dietaryRestrictions.split(',');
    filter.$or = [
      { dietaryRestrictions: { $in: restrictionsList } },
      { dietaryRestrictions: { $size: 0 } } // Aucune restriction
    ];
  }
  
  // Filtrer par type d'établissement
  if (establishmentType) {
    filter.$or = [
      { establishmentTypes: { $in: [establishmentType] } },
      { establishmentTypes: { $size: 0 } } // Compatible avec tous
    ];
  }
  
  // Filtrer par tags
  if (tags) {
    const tagsList = Array.isArray(tags) ? tags : tags.split(',').map(t => t.trim().toLowerCase());
    filter.tags = { $in: tagsList };
  }
  
  const components = await RecipeComponent.find(filter)
    .limit(parseInt(limit))
    .skip(parseInt(skip))
    .sort({ name: 1 });
  
  res.json({
    success: true,
    count: components.length,
    data: components
  });
}));

// @desc    Récupérer un composant par ID
// @route   GET /api/recipe-components/:id
// @access  Private
router.get('/:id', protect, asyncHandler(async (req, res) => {
  const component = await RecipeComponent.findById(req.params.id);
  
  if (!component) {
    res.status(404);
    throw new Error('Composant non trouvé');
  }
  
  res.json({
    success: true,
    data: component
  });
}));

// @desc    Récupérer les composants compatibles avec un composant donné
// @route   GET /api/recipe-components/:id/compatibilities
// @access  Private
router.get('/:id/compatibilities', protect, asyncHandler(async (req, res) => {
  const { componentType } = req.query; // 'sauce' ou 'accompaniment' si le composant est une protéine
  
  const component = await RecipeComponent.findById(req.params.id);
  
  if (!component) {
    res.status(404);
    throw new Error('Composant non trouvé');
  }
  
  let compatibleComponents = [];
  
  if (component.type === 'protein') {
    // Si c'est une protéine, retourner les sauces/accompagnements compatibles
    const field = componentType === 'sauce' ? 'sauces' : 'accompaniments';
    const compatibleIds = component.compatibleWith[field] || [];
    
    if (compatibleIds.length > 0) {
      compatibleComponents = await RecipeComponent.find({
        _id: { $in: compatibleIds },
        type: componentType || { $in: ['sauce', 'accompaniment'] }
      });
    }
  } else if (component.type === 'sauce' || component.type === 'accompaniment') {
    // Si c'est une sauce/accompagnement, retourner les protéines compatibles
    compatibleComponents = await RecipeComponent.find({
      type: 'protein',
      [`compatibleWith.${component.type === 'sauce' ? 'sauces' : 'accompaniments'}`]: component._id
    });
  }
  
  res.json({
    success: true,
    data: compatibleComponents
  });
}));

// @desc    Mettre à jour un composant
// @route   PUT /api/recipe-components/:id
// @access  Private
router.put('/:id', protect, asyncHandler(async (req, res) => {
  const component = await RecipeComponent.findById(req.params.id);
  
  if (!component) {
    res.status(404);
    throw new Error('Composant non trouvé');
  }
  
  // Mettre à jour les champs
  Object.keys(req.body).forEach(key => {
    if (key !== '_id' && key !== 'createdAt') {
      component[key] = req.body[key];
    }
  });
  
  const updatedComponent = await component.save();
  
  res.json({
    success: true,
    data: updatedComponent
  });
}));

// @desc    Supprimer un composant
// @route   DELETE /api/recipe-components/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const component = await RecipeComponent.findById(req.params.id);
  
  if (!component) {
    res.status(404);
    throw new Error('Composant non trouvé');
  }
  
  await component.deleteOne();
  
  res.json({
    success: true,
    message: 'Composant supprimé'
  });
}));

// @desc    Récupérer les composants par type
// @route   GET /api/recipe-components/type/:type
// @access  Private
router.get('/type/:type', protect, asyncHandler(async (req, res) => {
  const { type } = req.params;
  const { proteinCategory, allergens, dietaryRestrictions } = req.query;
  
  let filter = { type };
  
  if (type === 'protein' && proteinCategory) {
    filter.proteinCategory = proteinCategory;
  }
  
  if (allergens) {
    const allergensList = Array.isArray(allergens) ? allergens : allergens.split(',');
    filter.allergens = { $nin: allergensList };
  }
  
  if (dietaryRestrictions) {
    const restrictionsList = Array.isArray(dietaryRestrictions) 
      ? dietaryRestrictions 
      : dietaryRestrictions.split(',');
    filter.$or = [
      { dietaryRestrictions: { $in: restrictionsList } },
      { dietaryRestrictions: { $size: 0 } }
    ];
  }
  
  const components = await RecipeComponent.find(filter).sort({ name: 1 });
  
  res.json({
    success: true,
    count: components.length,
    data: components
  });
}));

export default router;

