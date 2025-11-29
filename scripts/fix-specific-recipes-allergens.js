/**
 * Script pour corriger les allergènes de recettes spécifiques
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Détecteur d'allergènes européens
const EU_ALLERGENS = {
  'gluten': { keywords: ['blé', 'wheat', 'gluten', 'farine', 'flour', 'semoule', 'semolina', 'pâtes', 'pasta', 'pain', 'bread', 'boulgour', 'bulgour', 'couscous', 'cannellonis', 'lasagne', 'lasagnes'] },
  'lait': { keywords: ['lait', 'milk', 'fromage', 'cheese', 'yaourt', 'yogurt', 'crème', 'cream', 'beurre', 'butter', 'lactose', 'dairy', 'laitier', 'ricotta', 'emmental', 'parmesan', 'mozzarella', 'gorgonzola', 'gruyère', 'chèvre'] },
  'oeufs': { keywords: ['œuf', 'oeuf', 'egg', 'œufs', 'oeufs', 'eggs', 'jaune', 'yolk', 'blanc d\'œuf', 'blanc d\'oeuf', 'egg white', 'mayonnaise', 'mayo', 'mousse', 'soufflé'] },
  'poisson': { keywords: ['poisson', 'fish', 'saumon', 'salmon', 'cabillaud', 'cod', 'thon', 'tuna', 'truite', 'trout', 'sardine', 'merlan', 'sole'] },
  'crustaces': { keywords: ['crevette', 'shrimp', 'crabe', 'crab', 'langouste', 'lobster', 'homard', 'langoustine'] },
  'mollusques': { keywords: ['moule', 'mussel', 'huître', 'oyster', 'coquille', 'shell', 'pétoncle', 'scallop'] },
  'celeri': { keywords: ['céleri', 'celery', 'celeri'] },
  'moutarde': { keywords: ['moutarde', 'mustard'] },
  'sesame': { keywords: ['sésame', 'sesame', 'tahini'] },
  'sulfites': { keywords: ['sulfite', 'sulfites', 'anhydride', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'] },
  'lupin': { keywords: ['lupin', 'lupine'] },
  'arachides': { keywords: ['arachide', 'peanut', 'cacahuète', 'cacahuete', 'peanut butter'] },
  'fruits_a_coque': { keywords: ['noix', 'nuts', 'noisette', 'hazelnut', 'amande', 'almond', 'pistache', 'pistachio', 'noix de cajou', 'cashew'] },
  'soja': { keywords: ['soja', 'soy', 'soya', 'tofu', 'miso'] }
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

async function fixSpecificRecipesAllergens() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB\n');
    
    const recipesToFix = [
      "Cannellonis à la Ricotta, Épinards et Emmental",
      "Waterzooi de Poulet aux Légumes, Riz et Crème",
      "Poêlée de Cabillaud Haché avec Riz, Aubergines et Brocoli"
    ];
    
    console.log(`📚 Recherche de ${recipesToFix.length} recette(s)...\n`);
    
    let fixed = 0;
    let notFound = 0;
    
    for (const recipeName of recipesToFix) {
      const recipe = await Recipe.findOne({ name: recipeName });
      
      if (!recipe) {
        console.log(`❌ "${recipeName}" non trouvée`);
        notFound++;
        continue;
      }
      
      console.log(`\n📋 "${recipe.name}"`);
      console.log(`   Allergènes actuels: ${(recipe.allergens || []).join(', ') || 'Aucun'}`);
      
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        console.log(`   ⚠️  Pas d'ingrédients, impossible de détecter les allergènes`);
        continue;
      }
      
      const detectedAllergens = detectEuropeanAllergens(recipe.ingredients);
      console.log(`   Allergènes détectés: ${detectedAllergens.join(', ') || 'Aucun'}`);
      
      if (detectedAllergens.length > 0) {
        // Normaliser les allergènes détectés
        const normalizedDetected = detectedAllergens.map(a => a.toLowerCase().trim());
        const currentAllergens = (recipe.allergens || []).map(a => a.toLowerCase().trim());
        
        // Ajouter les allergènes manquants
        const missing = normalizedDetected.filter(a => !currentAllergens.includes(a));
        
        if (missing.length > 0) {
          const updatedAllergens = [...new Set([...(recipe.allergens || []), ...detectedAllergens])].sort();
          recipe.allergens = updatedAllergens;
          await recipe.save();
          console.log(`   ✅ Allergènes ajoutés: ${missing.join(', ')}`);
          console.log(`   ✅ Allergènes finaux: ${recipe.allergens.join(', ')}`);
          fixed++;
        } else {
          console.log(`   ℹ️  Tous les allergènes sont déjà déclarés`);
        }
      } else {
        console.log(`   ⚠️  Aucun allergène détecté (peut-être une erreur de détection)`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(80));
    console.log(`✅ Recettes corrigées: ${fixed}`);
    console.log(`❌ Recettes non trouvées: ${notFound}`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

fixSpecificRecipesAllergens();

