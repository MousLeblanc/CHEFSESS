// scripts/fix-allergens-standardization.js
// Script pour standardiser les allergènes dans toutes les recettes
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

/**
 * Mapping des allergènes non standardisés vers les standards
 */
const ALLERGEN_MAPPING = {
  'lait': 'lactose',
  'lactose': 'lactose',
  'gluten': 'gluten',
  'oeufs': 'oeufs',
  'oeuf': 'oeufs',
  'poisson': 'poisson',
  'crustaces': 'crustaces',
  'crustacés': 'crustaces',
  'mollusques': 'mollusques',
  'soja': 'soja',
  'fruits_a_coque': 'fruits_a_coque',
  'fruits à coque': 'fruits_a_coque',
  'arachides': 'arachides',
  'sesame': 'sesame',
  'sésame': 'sesame',
  'moutarde': 'moutarde',
  'celeri': 'celeri',
  'céleri': 'celeri',
  'sulfites': 'sulfites',
  'lupin': 'lupin'
};

/**
 * Allergènes standards selon le règlement UE
 */
const STANDARD_ALLERGENS = [
  'gluten', 'lactose', 'oeufs', 'arachides', 'fruits_a_coque',
  'soja', 'poisson', 'crustaces', 'mollusques', 'celeri',
  'moutarde', 'sesame', 'sulfites', 'lupin'
];

/**
 * Standardiser un allergène
 */
function standardizeAllergen(allergen) {
  const normalized = (allergen || '').toLowerCase().trim();
  return ALLERGEN_MAPPING[normalized] || normalized;
}

/**
 * Standardiser la liste des allergènes d'une recette
 */
function standardizeAllergens(allergens) {
  if (!Array.isArray(allergens)) {
    return [];
  }
  
  const standardized = new Set();
  
  allergens.forEach(allergen => {
    const std = standardizeAllergen(allergen);
    // Ne garder que les allergènes standards
    if (STANDARD_ALLERGENS.includes(std)) {
      standardized.add(std);
    }
  });
  
  return Array.from(standardized).sort();
}

/**
 * Fonction principale
 */
async function fixAllergensStandardization() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');
    
    console.log('\n📊 Analyse des allergènes...\n');
    
    // Récupérer toutes les recettes
    const recipes = await RecipeEnriched.find({});
    console.log(`📝 Analyse de ${recipes.length} recettes...\n`);
    
    const stats = {
      total: recipes.length,
      fixed: 0,
      unchanged: 0,
      issues: []
    };
    
    // Analyser et corriger chaque recette
    for (const recipe of recipes) {
      const originalAllergens = [...(recipe.allergens || [])];
      const standardizedAllergens = standardizeAllergens(originalAllergens);
      
      // Vérifier s'il y a des changements
      const originalSorted = [...originalAllergens].sort().join(',');
      const standardizedSorted = standardizedAllergens.join(',');
      
      if (originalSorted !== standardizedSorted) {
        recipe.allergens = standardizedAllergens;
        await recipe.save();
        stats.fixed++;
        
        if (stats.fixed <= 10) {
          stats.issues.push({
            name: recipe.name,
            original: originalAllergens,
            fixed: standardizedAllergens
          });
        }
      } else {
        stats.unchanged++;
      }
    }
    
    // Afficher les résultats
    console.log('📊 Résultats:');
    console.log(`  Total: ${stats.total}`);
    console.log(`  Corrigées: ${stats.fixed} (${Math.round(stats.fixed/stats.total*100)}%)`);
    console.log(`  Déjà correctes: ${stats.unchanged} (${Math.round(stats.unchanged/stats.total*100)}%)`);
    
    if (stats.issues.length > 0) {
      console.log('\n📝 Exemples de corrections:');
      stats.issues.forEach((item, idx) => {
        console.log(`\n  ${idx + 1}. ${item.name}`);
        console.log(`     Avant: ${item.original.join(', ') || 'aucun'}`);
        console.log(`     Après: ${item.fixed.join(', ') || 'aucun'}`);
      });
    }
    
    // Statistiques finales par allergène
    console.log('\n📊 Distribution finale des allergènes:');
    const allergenStats = await RecipeEnriched.aggregate([
      { $unwind: '$allergens' },
      {
        $group: {
          _id: '$allergens',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);
    
    allergenStats.forEach(stat => {
      console.log(`  ${stat._id}: ${stat.count}`);
    });
    
    // Vérifier s'il reste des allergènes non standardisés
    const nonStandard = await RecipeEnriched.find({
      allergens: { $nin: STANDARD_ALLERGENS }
    }).select('name allergens');
    
    if (nonStandard.length > 0) {
      console.log(`\n⚠️  ${nonStandard.length} recette(s) avec des allergènes non standardisés:`);
      nonStandard.slice(0, 10).forEach(recipe => {
        const invalid = recipe.allergens.filter(a => !STANDARD_ALLERGENS.includes(a));
        console.log(`  - ${recipe.name}: ${invalid.join(', ')}`);
      });
    } else {
      console.log('\n✅ Tous les allergènes sont maintenant standardisés!');
    }
    
    await mongoose.disconnect();
    console.log('\n🎉 Standardisation terminée!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter si appelé directement
fixAllergensStandardization();



