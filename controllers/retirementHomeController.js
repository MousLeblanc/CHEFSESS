// controllers/retirementHomeController.js
import asyncHandler from 'express-async-handler';
import User from '../models/User.js';

// @desc    Mettre à jour les filtres EHPAD d'un utilisateur
// @route   PUT /api/retirement-home/filters
// @access  Private
export const updateRetirementHomeFilters = asyncHandler(async (req, res) => {
  const { textures, specificNeeds, ageGroups, nutritionalRequirements } = req.body;
  
  // Vérifier que l'utilisateur est une collectivité avec type maison de retraite
  if (req.user.role !== 'collectivite' || req.user.establishmentType !== 'maison_de_retraite') {
    res.status(403);
    throw new Error('Accès refusé. Cette fonctionnalité est réservée aux maisons de retraite.');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé.');
  }

  // Mettre à jour les filtres
  user.retirementHomeFilters = {
    textures: textures || [],
    specificNeeds: specificNeeds || [],
    ageGroups: ageGroups || [],
    nutritionalRequirements: nutritionalRequirements || {}
  };

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Filtres EHPAD mis à jour avec succès.',
    retirementHomeFilters: user.retirementHomeFilters
  });
});

// @desc    Obtenir les filtres EHPAD d'un utilisateur
// @route   GET /api/retirement-home/filters
// @access  Private
export const getRetirementHomeFilters = asyncHandler(async (req, res) => {
  // Vérifier que l'utilisateur est une collectivité avec type maison de retraite
  if (req.user.role !== 'collectivite' || req.user.establishmentType !== 'maison_de_retraite') {
    res.status(403);
    throw new Error('Accès refusé. Cette fonctionnalité est réservée aux maisons de retraite.');
  }

  const user = await User.findById(req.user.id).select('retirementHomeFilters');
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé.');
  }

  res.status(200).json({
    success: true,
    retirementHomeFilters: user.retirementHomeFilters || {
      textures: [],
      specificNeeds: [],
      ageGroups: [],
      nutritionalRequirements: {}
    }
  });
});

// @desc    Générer un menu adapté aux besoins EHPAD
// @route   POST /api/retirement-home/generate-menu
// @access  Private
export const generateEHPADMenu = asyncHandler(async (req, res) => {
  const { preferences, stockItems } = req.body;
  
  // Vérifier que l'utilisateur est une collectivité avec type maison de retraite
  if (req.user.role !== 'collectivite' || req.user.establishmentType !== 'maison_de_retraite') {
    res.status(403);
    throw new Error('Accès refusé. Cette fonctionnalité est réservée aux maisons de retraite.');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    res.status(404);
    throw new Error('Utilisateur non trouvé.');
  }

  const retirementFilters = user.retirementHomeFilters || {};
  
  // Construire le prompt spécialisé pour EHPAD
  const ehpapPrompt = buildEHPADPrompt(retirementFilters, preferences, stockItems);
  
  // Ici, vous pouvez appeler votre service OpenAI avec le prompt spécialisé
  // Pour l'instant, on retourne une structure de menu adaptée
  
  const adaptedMenu = {
    title: "Menu adapté EHPAD",
    description: "Menu spécialement conçu pour les résidents de maison de retraite",
    dishes: [],
    nutritionalInfo: {
      lowSodium: retirementFilters.nutritionalRequirements?.lowSodium || false,
      diabeticFriendly: retirementFilters.nutritionalRequirements?.diabeticFriendly || false,
      highProtein: retirementFilters.nutritionalRequirements?.highProtein || false,
      textures: retirementFilters.textures || []
    },
    ageGroups: retirementFilters.ageGroups || []
  };

  res.status(200).json({
    success: true,
    menu: adaptedMenu,
    filters: retirementFilters
  });
});

// Fonction utilitaire pour construire le prompt EHPAD
function buildEHPADPrompt(filters, preferences, stockItems) {
  let prompt = "Tu es un expert en nutrition pour maisons de retraite (EHPAD). ";
  prompt += "Génère un menu adapté aux besoins spécifiques des personnes âgées.\n\n";
  
  // Ajouter les contraintes de texture
  if (filters.textures && filters.textures.length > 0) {
    prompt += "Textures requises: " + filters.textures.join(', ') + "\n";
  }
  
  // Ajouter les besoins spécifiques
  if (filters.specificNeeds && filters.specificNeeds.length > 0) {
    prompt += "Besoins nutritionnels: " + filters.specificNeeds.join(', ') + "\n";
  }
  
  // Ajouter les groupes d'âge
  if (filters.ageGroups && filters.ageGroups.length > 0) {
    prompt += "Groupes d'âge:\n";
    filters.ageGroups.forEach(group => {
      prompt += `- ${group.ageRange} ans: ${group.count} personnes\n`;
      if (group.restrictions && group.restrictions.length > 0) {
        prompt += `  Restrictions: ${group.restrictions.map(r => `${r.type} (${r.count} pers.)`).join(', ')}\n`;
      }
    });
  }
  
  // Ajouter les ingrédients disponibles
  if (stockItems && stockItems.length > 0) {
    prompt += "\nIngrédients disponibles: " + stockItems.map(item => `${item.name} (${item.quantity} ${item.unit})`).join(', ');
  }
  
  prompt += "\n\nGénère un menu équilibré, facile à mâcher et à digérer, adapté aux personnes âgées.";
  
  return prompt;
}
