// controllers/nutritionalBalanceController.js
// Contrôleur pour gérer l'équilibre nutritionnel par groupe

import asyncHandler from 'express-async-handler';
import { calculateTotalNutrition, verifyNutritionalBalance } from '../scripts/calculate-menu-nutrition.js';
import MenuMultiSite from '../models/MenuMultiSite.js';
import Resident from '../models/Resident.js';
import Site from '../models/Site.js';

/**
 * Calcule l'équilibre nutritionnel d'un menu pour un groupe de résidents
 * GET /api/nutritional-balance/:menuId?groupId=xxx
 */
export const calculateBalanceForGroup = asyncHandler(async (req, res) => {
  try {
    const { menuId } = req.params;
    const { groupId, siteId } = req.query;
    
    // Récupérer le menu
    let menu;
    if (menuId) {
      menu = await MenuMultiSite.findById(menuId);
      if (!menu) {
        return res.status(404).json({ message: 'Menu non trouvé' });
      }
    } else {
      // Récupérer le dernier menu du groupe/site
      const query = {};
      if (groupId) query.groupId = groupId;
      if (siteId) query.siteId = siteId;
      
      menu = await MenuMultiSite.findOne(query).sort({ createdAt: -1 });
      if (!menu) {
        return res.status(404).json({ message: 'Aucun menu trouvé' });
      }
    }
    
    // Récupérer les groupes de résidents
    const residentsQuery = {};
    if (siteId) {
      residentsQuery.siteId = siteId;
    } else if (groupId) {
      // Récupérer tous les sites du groupe
      const sites = await Site.find({ groupId });
      const siteIds = sites.map(s => s._id);
      residentsQuery.siteId = { $in: siteIds };
    }
    
    const residents = await Resident.find(residentsQuery).populate('siteId');
    
    // Grouper les résidents par caractéristiques
    const residentsGroups = groupResidentsByCharacteristics(residents);
    
    // Calculer les objectifs nutritionnels pour chaque groupe
    const nutritionalGoalsByGroup = {};
    residentsGroups.forEach(group => {
      nutritionalGoalsByGroup[group.id] = calculateNutritionalGoalsForGroup(group);
    });
    
    // Vérifier l'équilibre pour chaque groupe
    const balanceResults = {};
    residentsGroups.forEach(group => {
      const goals = nutritionalGoalsByGroup[group.id];
      const balance = verifyNutritionalBalance(menu, goals, {
        name: group.name,
        ageRange: group.ageRange,
        dependencyLevel: group.dependencyLevel,
        medicalConditions: group.medicalConditions
      });
      
      balanceResults[group.id] = {
        group: {
          name: group.name,
          count: group.count,
          ageRange: group.ageRange,
          dependencyLevel: group.dependencyLevel,
          medicalConditions: group.medicalConditions
        },
        balance: balance,
        goals: goals
      };
    });
    
    res.json({
      success: true,
      menu: {
        id: menu._id,
        name: menu.label || menu.name,
        date: menu.date || menu.createdAt
      },
      groups: balanceResults
    });
    
  } catch (error) {
    console.error('❌ Erreur calculateBalanceForGroup:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Calcule les objectifs nutritionnels recommandés pour un groupe
 * GET /api/nutritional-balance/goals/:groupId
 */
export const getNutritionalGoalsForGroup = asyncHandler(async (req, res) => {
  try {
    const { groupId } = req.params;
    const { siteId } = req.query;
    
    // Récupérer les résidents
    const residentsQuery = {};
    if (siteId) {
      residentsQuery.siteId = siteId;
    } else if (groupId) {
      const sites = await Site.find({ groupId });
      const siteIds = sites.map(s => s._id);
      residentsQuery.siteId = { $in: siteIds };
    }
    
    const residents = await Resident.find(residentsQuery);
    const groups = groupResidentsByCharacteristics(residents);
    
    const goalsByGroup = {};
    groups.forEach(group => {
      goalsByGroup[group.id] = calculateNutritionalGoalsForGroup(group);
    });
    
    res.json({
      success: true,
      groups: goalsByGroup
    });
    
  } catch (error) {
    console.error('❌ Erreur getNutritionalGoalsForGroup:', error);
    res.status(500).json({ message: error.message });
  }
});

/**
 * Groupe les résidents par caractéristiques (âge, pathologie, dépendance)
 */
function groupResidentsByCharacteristics(residents) {
  const groups = new Map();
  
  residents.forEach(resident => {
    // Déterminer la tranche d'âge
    const age = resident.age || 75;
    let ageRange = '65-75';
    if (age >= 85) ageRange = '85+';
    else if (age >= 75) ageRange = '75-85';
    
    // Déterminer le niveau de dépendance
    const dependencyLevel = resident.dependencyLevel || 
                           (resident.texturePreferences?.consistency?.includes('iddsi') ? 'dépendant' : 'autonome');
    
    // Pathologies
    const medicalConditions = [
      ...(resident.pathologies || []),
      ...(resident.allergies || []).map(a => `allergie_${a}`),
      ...(resident.dietaryRestrictions || [])
    ];
    
    // Créer une clé unique pour le groupe
    const groupKey = `${ageRange}_${dependencyLevel}_${medicalConditions.sort().join(',')}`;
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, {
        id: groupKey,
        name: `Groupe ${ageRange} - ${dependencyLevel}`,
        ageRange: ageRange,
        dependencyLevel: dependencyLevel,
        medicalConditions: [...new Set(medicalConditions)],
        count: 0,
        residents: []
      });
    }
    
    const group = groups.get(groupKey);
    group.count++;
    group.residents.push(resident._id);
  });
  
  return Array.from(groups.values());
}

/**
 * Calcule les objectifs nutritionnels recommandés pour un groupe
 */
function calculateNutritionalGoalsForGroup(group) {
  const { ageRange, dependencyLevel, medicalConditions, count } = group;
  
  // Base de calcul selon l'âge
  let baseCalories = 1800; // kcal/jour
  let baseProteins = 60;   // g/jour
  let baseCarbs = 250;     // g/jour
  let baseFats = 60;       // g/jour
  let baseCalcium = 1200;  // mg/jour
  let baseIron = 10;       // mg/jour
  let baseVitaminC = 110;  // mg/jour
  let baseFiber = 25;      // g/jour
  
  // Ajustements selon l'âge
  if (ageRange === '75-85') {
    baseCalories = 1700;
    baseProteins = 65; // Plus de protéines pour préserver la masse musculaire
    baseCalcium = 1200;
  } else if (ageRange === '85+') {
    baseCalories = 1600;
    baseProteins = 70; // Encore plus de protéines
    baseCalcium = 1200;
  }
  
  // Ajustements selon la dépendance
  if (dependencyLevel === 'dépendant') {
    baseCalories *= 0.9; // Moins d'activité physique
    baseProteins *= 1.1; // Plus de protéines pour prévenir la sarcopénie
  }
  
  // Ajustements selon les pathologie
  if (medicalConditions.some(c => c.includes('diabète'))) {
    baseCarbs *= 0.8; // Réduction des glucides
  }
  
  if (medicalConditions.some(c => c.includes('hypertension') || c.includes('hyposodé'))) {
    // Sodium réduit (géré séparément)
  }
  
  if (medicalConditions.some(c => c.includes('insuffisance_rénale'))) {
    baseProteins *= 0.8; // Réduction des protéines
  }
  
  return {
    proteins: {
      target: baseProteins,
      min: baseProteins * 0.8,
      max: baseProteins * 1.2
    },
    carbs: {
      target: baseCarbs,
      min: baseCarbs * 0.7,
      max: baseCarbs * 1.3
    },
    fats: {
      target: baseFats,
      min: baseFats * 0.7,
      max: baseFats * 1.3
    },
    calories: {
      target: baseCalories,
      min: baseCalories * 0.8,
      max: baseCalories * 1.2
    },
    calcium: baseCalcium,
    iron: baseIron,
    vitaminC: baseVitaminC,
    fiber: baseFiber
  };
}

export default {
  calculateBalanceForGroup,
  getNutritionalGoalsForGroup
};

