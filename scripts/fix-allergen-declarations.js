/**
 * Script pour corriger les déclarations d'allergènes
 * Re-détecte automatiquement tous les allergènes et met à jour les déclarations
 * pour assurer la conformité avec la directive européenne UE 1169/2011
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Détecteur d'allergènes européens (14 allergènes majeurs)
const EU_ALLERGENS = {
  'gluten': { keywords: ['blé', 'wheat', 'gluten', 'farine', 'flour', 'semoule', 'semolina', 'pâtes', 'pasta', 'pain', 'bread', 'boulgour', 'bulgur'] },
  'lait': { keywords: ['lait', 'milk', 'fromage', 'cheese', 'yaourt', 'yogurt', 'crème', 'cream', 'beurre', 'butter', 'lactose', 'dairy', 'laitier'] },
  'oeufs': { keywords: ['œuf', 'oeuf', 'egg', 'œufs', 'oeufs', 'eggs', 'jaune', 'yolk', 'blanc d\'œuf', 'blanc d\'oeuf', 'egg white', 'mayonnaise', 'mayo', 'mousse', 'soufflé'] },
  'arachides': { keywords: ['arachide', 'peanut', 'cacahuète', 'cacahuete', 'peanut butter'] },
  'fruits_a_coque': { keywords: ['noix', 'nuts', 'noisette', 'hazelnut', 'amande', 'almond', 'pistache', 'pistachio', 'noix de cajou', 'cashew'] },
  'soja': { keywords: ['soja', 'soy', 'soya', 'tofu', 'miso'] },
  'poisson': { keywords: ['poisson', 'fish', 'saumon', 'salmon', 'cabillaud', 'cod', 'thon', 'tuna', 'truite', 'trout', 'sardine'] },
  'crustaces': { keywords: ['crevette', 'shrimp', 'crabe', 'crab', 'langouste', 'lobster', 'homard', 'langoustine'] },
  'mollusques': { keywords: ['moule', 'mussel', 'huître', 'oyster', 'coquille', 'shell', 'pétoncle', 'scallop'] },
  'celeri': { keywords: ['céleri', 'celery', 'celeri'] },
  'moutarde': { keywords: ['moutarde', 'mustard'] },
  'sesame': { keywords: ['sésame', 'sesame', 'tahini'] },
  'sulfites': { keywords: ['sulfite', 'sulfites', 'anhydride', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'] },
  'lupin': { keywords: ['lupin', 'lupine'] }
};

/**
 * Détecte les allergènes européens dans une liste d'ingrédients
 * @param {Array} ingredients - Liste d'ingrédients
 * @returns {Array} - Liste des allergènes détectés
 */
function detectEuropeanAllergens(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  
  const detected = new Set();
  
  ingredients.forEach(ing => {
    const ingName = (ing.name || '').toLowerCase();
    
    Object.entries(EU_ALLERGENS).forEach(([allergen, { keywords }]) => {
      if (keywords.some(keyword => {
        // Utiliser une regex pour éviter les faux positifs (ex: "blanc" dans "blanc de poulet")
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(ingName);
      })) {
        detected.add(allergen);
      }
    });
  });
  
  return Array.from(detected).sort();
}

/**
 * Normalise le nom d'un allergène pour comparaison
 * @param {string} allergen - Nom de l'allergène
 * @returns {string} - Nom normalisé
 */
function normalizeAllergen(allergen) {
  const normalized = String(allergen).toLowerCase().trim();
  const variants = {
    'oeufs': 'oeufs', 'oeuf': 'oeufs', 'eggs': 'oeufs',
    'lait': 'lait', 'lactose': 'lait', 'dairy': 'lait', 'laitier': 'lait',
    'gluten': 'gluten', 'blé': 'gluten', 'wheat': 'gluten',
    'fruits_a_coque': 'fruits_a_coque', 'fruits à coque': 'fruits_a_coque', 'noix': 'fruits_a_coque',
    'crustaces': 'crustaces', 'crustacés': 'crustaces',
    'mollusques': 'mollusques',
    'celeri': 'celeri', 'céleri': 'celeri', 'celery': 'celeri',
    'sesame': 'sesame', 'sésame': 'sesame'
  };
  return variants[normalized] || normalized;
}

/**
 * Compare les allergènes détectés avec les déclarés
 * @param {Array} detected - Allergènes détectés
 * @param {Array} declared - Allergènes déclarés
 * @returns {Object} - { missing: [], extra: [], all: [] }
 */
function compareAllergens(detected, declared) {
  const detectedNormalized = detected.map(normalizeAllergen);
  const declaredNormalized = (declared || []).map(normalizeAllergen);
  
  const missing = detectedNormalized.filter(a => !declaredNormalized.includes(a));
  const extra = declaredNormalized.filter(a => !detectedNormalized.includes(a));
  const all = Array.from(new Set([...detectedNormalized, ...declaredNormalized])).sort();
  
  return { missing, extra, all };
}

async function fixAllergenDeclarations() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer toutes les recettes
    console.log('📚 Récupération de toutes les recettes...');
    const recipes = await Recipe.find({});
    console.log(`✅ ${recipes.length} recette(s) trouvée(s)\n`);
    
    if (recipes.length === 0) {
      console.log('⚠️  Aucune recette trouvée dans la base de données');
      return;
    }
    
    // Statistiques
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    const fixedRecipes = [];
    
    console.log('🔍 Analyse et correction des déclarations d\'allergènes...\n');
    
    for (const recipe of recipes) {
      try {
        // Ignorer les recettes sans ingrédients
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
          skipped++;
          continue;
        }
        
        // Détecter les allergènes
        const detectedAllergens = detectEuropeanAllergens(recipe.ingredients);
        const declaredAllergens = Array.isArray(recipe.allergens) ? recipe.allergens : [];
        
        // Comparer
        const comparison = compareAllergens(detectedAllergens, declaredAllergens);
        
        // Si des allergènes manquent dans la déclaration, mettre à jour
        if (comparison.missing.length > 0) {
          // Utiliser tous les allergènes détectés (plus sûr pour la sécurité)
          recipe.allergens = comparison.all;
          
          await recipe.save();
          
          fixed++;
          fixedRecipes.push({
            name: recipe.name,
            id: recipe._id,
            detected: detectedAllergens,
            declared: declaredAllergens,
            missing: comparison.missing,
            updated: comparison.all
          });
          
          console.log(`✅ ${recipe.name}`);
          console.log(`   Détectés: ${detectedAllergens.join(', ') || 'Aucun'}`);
          console.log(`   Déclarés avant: ${declaredAllergens.join(', ') || 'Aucun'}`);
          console.log(`   Manquants: ${comparison.missing.join(', ')}`);
          console.log(`   Déclarés après: ${comparison.all.join(', ') || 'Aucun'}\n`);
        } else {
          skipped++;
        }
      } catch (error) {
        errors++;
        console.error(`❌ Erreur pour "${recipe.name}":`, error.message);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE LA CORRECTION');
    console.log('='.repeat(80));
    console.log(`✅ Recettes corrigées: ${fixed}`);
    console.log(`⏭️  Recettes sans modification: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total analysé: ${recipes.length}`);
    
    if (fixedRecipes.length > 0) {
      console.log('\n📋 DÉTAIL DES CORRECTIONS:');
      fixedRecipes.forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        console.log(`   • Allergènes détectés: ${item.detected.join(', ') || 'Aucun'}`);
        console.log(`   • Allergènes déclarés avant: ${item.declared.join(', ') || 'Aucun'}`);
        console.log(`   • Allergènes manquants: ${item.missing.join(', ')}`);
        console.log(`   • Allergènes déclarés après: ${item.updated.join(', ') || 'Aucun'}`);
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Correction terminée avec succès !');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de la correction des déclarations d\'allergènes...\n');
console.log('📋 Ce script va:');
console.log('   1. Analyser toutes les recettes');
console.log('   2. Détecter les allergènes dans les ingrédients');
console.log('   3. Comparer avec les allergènes déclarés');
console.log('   4. Mettre à jour les déclarations pour inclure tous les allergènes détectés');
console.log('   5. Assurer la conformité avec la directive européenne UE 1169/2011\n');
fixAllergenDeclarations();

