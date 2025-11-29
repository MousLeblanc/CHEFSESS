/**
 * Script pour corriger TOUTES les recettes qui manquent d'allergènes
 * Détecte les allergènes depuis les ingrédients et les ajoute si manquants
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Détecteur d'allergènes européens
const EU_ALLERGENS = {
  'gluten': { keywords: ['blé', 'wheat', 'gluten', 'farine', 'flour', 'semoule', 'semolina', 'pâtes', 'pasta', 'pain', 'bread', 'boulgour', 'bulgour', 'couscous', 'cannellonis', 'lasagne', 'lasagnes', 'pennes', 'spaghetti', 'vermicelles'] },
  'lait': { keywords: ['lait', 'milk', 'fromage', 'cheese', 'yaourt', 'yogurt', 'crème', 'cream', 'beurre', 'butter', 'lactose', 'dairy', 'laitier', 'ricotta', 'emmental', 'parmesan', 'mozzarella', 'gorgonzola', 'gruyère', 'chèvre', 'béchamel'] },
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

async function fixAllMissingAllergens() {
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
    
    console.log('🔧 Correction des allergènes manquants...\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      try {
        if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
          skipped++;
          continue;
        }
        
        const detectedAllergens = detectEuropeanAllergens(recipe.ingredients);
        const declaredAllergens = (recipe.allergens || []).map(a => a.toLowerCase().trim());
        const detectedNormalized = detectedAllergens.map(a => a.toLowerCase().trim());
        
        // Trouver les allergènes détectés mais non déclarés
        const missing = detectedNormalized.filter(a => !declaredAllergens.includes(a));
        
        if (missing.length > 0) {
          // Ajouter les allergènes manquants
          const updatedAllergens = [...new Set([...(recipe.allergens || []), ...detectedAllergens])].sort();
          recipe.allergens = updatedAllergens;
          await recipe.save();
          
          fixed++;
          if (fixed % 10 === 0) {
            console.log(`[${i + 1}/${allRecipes.length}] ${fixed} recette(s) corrigée(s)...`);
          }
        }
        
      } catch (error) {
        errors++;
        console.error(`   ❌ Erreur pour "${recipe.name}": ${error.message}`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ');
    console.log('='.repeat(80));
    console.log(`✅ Recettes corrigées: ${fixed}`);
    console.log(`⏭️  Recettes ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
  }
}

fixAllMissingAllergens();

