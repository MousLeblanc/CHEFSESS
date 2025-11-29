/**
 * Script pour retirer les allergènes incorrectement déclarés
 * Retire seulement les allergènes qui ne sont PAS présents dans les ingrédients
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Détecteur d'allergènes européens
const EU_ALLERGENS = {
  'gluten': { keywords: ['blé', 'wheat', 'gluten', 'farine', 'flour', 'semoule', 'semolina', 'pâtes', 'pasta', 'pain', 'bread', 'boulgour', 'bulgour', 'couscous'] },
  'lait': { keywords: ['lait', 'milk', 'fromage', 'cheese', 'yaourt', 'yogurt', 'crème', 'cream', 'beurre', 'butter', 'lactose', 'dairy', 'laitier'] },
  'oeufs': { keywords: ['œuf', 'oeuf', 'egg', 'œufs', 'oeufs', 'eggs', 'jaune', 'yolk', 'blanc d\'œuf', 'blanc d\'oeuf', 'egg white', 'mayonnaise', 'mayo', 'mousse', 'soufflé'] },
  'arachides': { keywords: ['arachide', 'peanut', 'cacahuète', 'cacahuete', 'peanut butter'] },
  'fruits_a_coque': { keywords: ['noix', 'nuts', 'noisette', 'hazelnut', 'amande', 'almond', 'pistache', 'pistachio', 'noix de cajou', 'cashew'] },
  'soja': { keywords: ['soja', 'soy', 'soya', 'tofu', 'miso'] },
  'poisson': { keywords: ['poisson', 'fish', 'saumon', 'salmon', 'cabillaud', 'cod', 'thon', 'tuna', 'truite', 'trout', 'sardine', 'merlan', 'sole'] },
  'crustaces': { keywords: ['crevette', 'shrimp', 'crabe', 'crab', 'langouste', 'lobster', 'homard', 'langoustine'] },
  'mollusques': { keywords: ['moule', 'mussel', 'huître', 'oyster', 'coquille', 'shell', 'pétoncle', 'scallop'] },
  'celeri': { keywords: ['céleri', 'celery', 'celeri'] },
  'moutarde': { keywords: ['moutarde', 'mustard'] },
  'sesame': { keywords: ['sésame', 'sesame', 'tahini'] },
  'sulfites': { keywords: ['sulfite', 'sulfites', 'anhydride', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'] },
  'lupin': { keywords: ['lupin', 'lupine'] }
};

function detectEuropeanAllergens(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  const detected = new Set();
  ingredients.forEach(ing => {
    const ingName = (ing.name || '').toLowerCase();
    Object.entries(EU_ALLERGENS).forEach(([allergen, { keywords }]) => {
      if (keywords.some(keyword => {
        const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
        return regex.test(ingName);
      })) {
        detected.add(allergen);
      }
    });
  });
  return Array.from(detected).sort();
}

function normalizeAllergen(name) {
  if (!name) return '';
  const normalized = String(name).toLowerCase().trim();
  const variants = {
    'oeufs': 'oeufs', 'oeuf': 'oeufs', 'eggs': 'oeufs', 'œufs': 'oeufs', 'œuf': 'oeufs',
    'lait': 'lait', 'lactose': 'lait', 'dairy': 'lait', 'milk': 'lait',
    'gluten': 'gluten', 'blé': 'gluten', 'wheat': 'gluten',
    'fruits à coque': 'fruits_a_coque', 'fruits a coque': 'fruits_a_coque', 'nuts': 'fruits_a_coque',
    'crustaces': 'crustaces', 'crustacés': 'crustaces',
    'mollusques': 'mollusques',
    'celeri': 'celeri', 'céleri': 'celeri', 'celery': 'celeri', 'céléri': 'celeri',
    'sesame': 'sesame', 'sésame': 'sesame'
  };
  return variants[normalized] || normalized;
}

async function fixIncorrectAllergens() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB\n');
    
    const allRecipes = await Recipe.find({});
    console.log(`📚 ${allRecipes.length} recette(s) trouvée(s)\n`);
    
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    const fixedRecipes = [];
    
    console.log('🔧 Correction des allergènes incorrects...\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      try {
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
          skipped++;
          continue;
        }
        
        const detectedAllergens = detectEuropeanAllergens(recipe.ingredients);
        const declaredAllergens = (recipe.allergens || []).map(normalizeAllergen);
        const detectedNormalized = detectedAllergens.map(normalizeAllergen);
        
        // Trouver les allergènes déclarés mais non détectés (en trop)
        const extra = declaredAllergens.filter(a => !detectedNormalized.includes(a));
        
        if (extra.length > 0) {
          // Retirer les allergènes en trop
          const correctAllergens = (recipe.allergens || []).filter(declared => {
            const normalized = normalizeAllergen(declared);
            return detectedNormalized.includes(normalized);
          });
          
          // Ajouter les allergènes manquants
          detectedAllergens.forEach(detected => {
            const normalized = normalizeAllergen(detected);
            if (!correctAllergens.some(a => normalizeAllergen(a) === normalized)) {
              correctAllergens.push(detected);
            }
          });
          
          recipe.allergens = [...new Set(correctAllergens)].sort();
          await recipe.save();
          
          fixed++;
          fixedRecipes.push({
            name: recipe.name,
            id: recipe._id,
            removed: extra,
            added: detectedNormalized.filter(a => !declaredAllergens.includes(a))
          });
          
          if (fixed % 10 === 0) {
            console.log(`[${i + 1}/${allRecipes.length}] ${fixed} recette(s) corrigée(s)...`);
          }
        }
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Erreur pour "${recipe.name}": ${error.message}`);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE LA CORRECTION DES ALLERGÈNES');
    console.log('='.repeat(80));
    console.log(`✅ Recettes corrigées: ${fixed}`);
    console.log(`⏭️  Recettes ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    
    if (fixedRecipes.length > 0) {
      console.log(`\n📋 EXEMPLES (premiers 15):`);
      fixedRecipes.slice(0, 15).forEach((item, idx) => {
        console.log(`\n${idx + 1}. "${item.name}"`);
        if (item.removed.length > 0) {
          console.log(`   ❌ Allergènes retirés: ${item.removed.join(', ')}`);
        }
        if (item.added.length > 0) {
          console.log(`   ✅ Allergènes ajoutés: ${item.added.join(', ')}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Correction terminée !');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

console.log('🚀 Démarrage de la correction des allergènes incorrects...\n');
console.log('📋 Ce script va:');
console.log('   1. Détecter les allergènes réellement présents dans les ingrédients');
console.log('   2. Retirer les allergènes déclarés mais non présents');
console.log('   3. Ajouter les allergènes présents mais non déclarés');
console.log('   ⚠️  APPROCHE CONSERVATRICE: Basée sur des règles strictes, pas d\'IA\n');
fixIncorrectAllergens();

