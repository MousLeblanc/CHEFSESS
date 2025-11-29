/**
 * Script de correction CONSERVATEUR des recettes
 * Utilise des règles strictes plutôt que l'IA pour éviter d'introduire de nouvelles erreurs
 * Ne modifie QUE ce qui est clairement incorrect
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

async function fixRecipesConservative() {
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
    const corrections = {
      allergens: 0,
      restrictions: 0,
      tags: 0
    };
    const fixedRecipes = [];
    
    console.log('🔧 Correction conservatrice (règles strictes uniquement)...\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      try {
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
          skipped++;
          continue;
        }
        
        let hasChanges = false;
        const changes = [];
        
        // 1. CORRECTION ALLERGÈNES (seulement ajouter les manquants, ne pas retirer)
        const detectedAllergens = detectEuropeanAllergens(recipe.ingredients);
        const declaredAllergens = (recipe.allergens || []).map(normalizeAllergen);
        const detectedNormalized = detectedAllergens.map(normalizeAllergen);
        
        const missing = detectedNormalized.filter(a => !declaredAllergens.includes(a));
        
        if (missing.length > 0) {
          // Ajouter seulement les allergènes manquants
          const currentAllergens = new Set(recipe.allergens || []);
          missing.forEach(a => {
            // Trouver le nom correct de l'allergène
            const correctName = detectedAllergens.find(d => normalizeAllergen(d) === a);
            if (correctName) {
              currentAllergens.add(correctName);
            }
          });
          recipe.allergens = Array.from(currentAllergens).sort();
          changes.push(`Allergènes ajoutés: ${missing.join(', ')}`);
          corrections.allergens++;
          hasChanges = true;
        }
        
        // 2. CORRECTION RESTRICTIONS (retirer seulement si incohérence flagrante)
        const restrictions = (recipe.dietaryRestrictions || []).map(r => r.toLowerCase());
        const ingredientsText = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
        
        if (restrictions.includes('végétarien') || restrictions.includes('vegetarien') || restrictions.includes('vegan')) {
          const hasMeat = ingredientsText.includes('poulet') || ingredientsText.includes('boeuf') || 
                         ingredientsText.includes('bœuf') || ingredientsText.includes('viande') || 
                         ingredientsText.includes('porc') || ingredientsText.includes('jambon') ||
                         ingredientsText.includes('poisson') || ingredientsText.includes('saumon') ||
                         ingredientsText.includes('cabillaud') || ingredientsText.includes('thon');
          
          if (hasMeat) {
            // Retirer la restriction incohérente
            recipe.dietaryRestrictions = (recipe.dietaryRestrictions || []).filter(r => {
              const rLower = r.toLowerCase();
              return !rLower.includes('végétarien') && !rLower.includes('vegetarien') && !rLower.includes('vegan');
            });
            changes.push('Restriction végétarien retirée (présence de viande/poisson)');
            corrections.restrictions++;
            hasChanges = true;
          }
        }
        
        // 3. CORRECTION TAGS (retirer seulement les tags clairement incorrects)
        const tags = recipe.tags || [];
        const tagsToRemove = [];
        
        // Retirer le tag végétarien si présence de viande
        if (tags.some(t => t.toLowerCase().includes('vegetarien') || t.toLowerCase().includes('végétarien'))) {
          if (ingredientsText.includes('poulet') || ingredientsText.includes('boeuf') || 
              ingredientsText.includes('bœuf') || ingredientsText.includes('viande') || 
              ingredientsText.includes('porc') || ingredientsText.includes('jambon') ||
              ingredientsText.includes('poisson') || ingredientsText.includes('saumon')) {
            tagsToRemove.push('#vegetarien', '#végétarien');
          }
        }
        
        if (tagsToRemove.length > 0) {
          recipe.tags = tags.filter(t => !tagsToRemove.includes(t.toLowerCase()));
          changes.push(`Tags retirés: ${tagsToRemove.join(', ')}`);
          corrections.tags++;
          hasChanges = true;
        }
        
        if (hasChanges) {
          await recipe.save();
          fixed++;
          fixedRecipes.push({
            name: recipe.name,
            id: recipe._id,
            changes: changes
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
    console.log('📊 RÉSUMÉ DE LA CORRECTION CONSERVATRICE');
    console.log('='.repeat(80));
    console.log(`✅ Recettes corrigées: ${fixed}`);
    console.log(`⏭️  Recettes ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total: ${allRecipes.length}`);
    
    console.log(`\n📋 DÉTAIL DES CORRECTIONS:`);
    console.log(`   Allergènes ajoutés: ${corrections.allergens}`);
    console.log(`   Restrictions corrigées: ${corrections.restrictions}`);
    console.log(`   Tags corrigés: ${corrections.tags}`);
    
    if (fixedRecipes.length > 0) {
      console.log(`\n📋 EXEMPLES (premiers 10):`);
      fixedRecipes.slice(0, 10).forEach((item, idx) => {
        console.log(`   ${idx + 1}. "${item.name}"`);
        item.changes.forEach(change => console.log(`      - ${change}`));
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

console.log('🚀 Démarrage de la correction conservatrice...\n');
console.log('📋 Ce script va:');
console.log('   1. Ajouter les allergènes manquants (UE 1169/2011)');
console.log('   2. Retirer les restrictions incohérentes (végétarien avec viande)');
console.log('   3. Retirer les tags incorrects');
console.log('   ⚠️  APPROCHE CONSERVATRICE: Ne modifie que ce qui est clairement incorrect\n');
fixRecipesConservative();

