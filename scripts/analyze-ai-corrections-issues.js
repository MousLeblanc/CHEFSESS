/**
 * Script pour analyser les problèmes introduits par les corrections IA précédentes
 * Identifie les incohérences et erreurs créées
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Détecteur d'allergènes européens
const EU_ALLERGENS = {
  'gluten': { keywords: ['blé', 'wheat', 'gluten', 'farine', 'flour', 'semoule', 'semolina', 'pâtes', 'pasta', 'pain', 'bread', 'boulgour', 'bulgur', 'couscous'] },
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

function extractMainWords(text) {
  if (!text || typeof text !== 'string') return [];
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2)
    .filter(word => !['de', 'du', 'des', 'la', 'le', 'les', 'aux', 'avec', 'sans', 'pour'].includes(word));
}

function calculateSimilarity(words1, words2) {
  if (words1.length === 0 || words2.length === 0) return 0;
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  return intersection.size / union.size;
}

async function analyzeAICorrectionsIssues() {
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
    
    const issues = {
      titleIngredientMismatch: [],
      allergenMismatch: [],
      categoryMismatch: [],
      restrictionMismatch: [],
      tagMismatch: [],
      genericInstructions: []
    };
    
    console.log('🔍 Analyse des problèmes...\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        continue;
      }
      
      // 1. Vérifier cohérence titre/ingrédients
      const titleWords = extractMainWords(recipe.name);
      const ingredientWords = recipe.ingredients.flatMap(ing => extractMainWords(ing.name || ''));
      const similarity = calculateSimilarity(titleWords, ingredientWords);
      
      if (similarity < 0.1) {
        issues.titleIngredientMismatch.push({
          name: recipe.name,
          id: recipe._id,
          similarity: similarity,
          ingredients: recipe.ingredients.slice(0, 3).map(ing => ing.name)
        });
      }
      
      // 2. Vérifier allergènes
      const detectedAllergens = detectEuropeanAllergens(recipe.ingredients);
      const declaredAllergens = (recipe.allergens || []).map(a => a.toLowerCase());
      const detectedNormalized = detectedAllergens.map(a => a.toLowerCase());
      
      const missing = detectedNormalized.filter(a => !declaredAllergens.includes(a));
      const extra = declaredAllergens.filter(a => !detectedNormalized.includes(a));
      
      if (missing.length > 0 || extra.length > 0) {
        issues.allergenMismatch.push({
          name: recipe.name,
          id: recipe._id,
          detected: detectedAllergens,
          declared: recipe.allergens || [],
          missing: missing,
          extra: extra
        });
      }
      
      // 3. Vérifier restrictions alimentaires
      const restrictions = (recipe.dietaryRestrictions || []).map(r => r.toLowerCase());
      const ingredientsText = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
      
      if (restrictions.includes('végétarien') || restrictions.includes('vegetarien') || restrictions.includes('vegan')) {
        const hasMeat = ingredientsText.includes('poulet') || ingredientsText.includes('boeuf') || 
                       ingredientsText.includes('bœuf') || ingredientsText.includes('viande') || 
                       ingredientsText.includes('porc') || ingredientsText.includes('jambon') ||
                       ingredientsText.includes('poisson') || ingredientsText.includes('saumon');
        
        if (hasMeat) {
          issues.restrictionMismatch.push({
            name: recipe.name,
            id: recipe._id,
            restriction: 'végétarien/vegan',
            hasMeat: true
          });
        }
      }
      
      // 4. Vérifier instructions génériques
      const steps = recipe.preparationSteps || [];
      const hasGeneric = steps.some(step => {
        const stepLower = step.toLowerCase();
        return /préparer.*laver/i.test(stepLower) ||
               /cuire.*protéine/i.test(stepLower) ||
               /cuire.*accompagnement/i.test(stepLower) ||
               /assembler.*assaisonner/i.test(stepLower);
      });
      
      if (hasGeneric) {
        issues.genericInstructions.push({
          name: recipe.name,
          id: recipe._id,
          steps: steps.length
        });
      }
      
      if ((i + 1) % 100 === 0) {
        console.log(`[${i + 1}/${allRecipes.length}] Analysées...`);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT D\'ANALYSE DES PROBLÈMES');
    console.log('='.repeat(80));
    console.log(`\n⚠️  PROBLÈMES DÉTECTÉS:`);
    console.log(`   Incohérences titre/ingrédients: ${issues.titleIngredientMismatch.length}`);
    console.log(`   Incohérences allergènes: ${issues.allergenMismatch.length}`);
    console.log(`   Incohérences restrictions: ${issues.restrictionMismatch.length}`);
    console.log(`   Instructions génériques: ${issues.genericInstructions.length}`);
    
    if (issues.titleIngredientMismatch.length > 0) {
      console.log(`\n📋 EXEMPLES - Titre/Ingrédients (premiers 10):`);
      issues.titleIngredientMismatch.slice(0, 10).forEach((item, idx) => {
        console.log(`   ${idx + 1}. "${item.name}" (similarité: ${(item.similarity * 100).toFixed(1)}%)`);
        console.log(`      Ingrédients: ${item.ingredients.join(', ')}...`);
      });
    }
    
    if (issues.allergenMismatch.length > 0) {
      console.log(`\n📋 EXEMPLES - Allergènes (premiers 10):`);
      issues.allergenMismatch.slice(0, 10).forEach((item, idx) => {
        console.log(`   ${idx + 1}. "${item.name}"`);
        if (item.missing.length > 0) {
          console.log(`      ❌ Manquants: ${item.missing.join(', ')}`);
        }
        if (item.extra.length > 0) {
          console.log(`      ⚠️  En trop: ${item.extra.join(', ')}`);
        }
      });
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Analyse terminée !');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

analyzeAICorrectionsIssues();

