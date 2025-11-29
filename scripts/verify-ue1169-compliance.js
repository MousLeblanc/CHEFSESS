/**
 * Script pour vérifier la conformité de toutes les recettes avec la directive UE 1169/2011
 * La directive exige que les 14 allergènes majeurs soient déclarés s'ils sont présents dans les ingrédients
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Les 14 allergènes majeurs selon la directive UE 1169/2011
const EU_ALLERGENS = {
  'gluten': { 
    keywords: ['blé', 'wheat', 'gluten', 'farine', 'flour', 'semoule', 'semolina', 'pâtes', 'pasta', 'pain', 'bread', 'boulgour', 'bulgur', 'couscous'],
    label: 'Céréales contenant du gluten'
  },
  'lait': { 
    keywords: ['lait', 'milk', 'fromage', 'cheese', 'yaourt', 'yogurt', 'crème', 'cream', 'beurre', 'butter', 'lactose', 'dairy', 'laitier'],
    label: 'Lait et produits à base de lait'
  },
  'oeufs': { 
    keywords: ['œuf', 'oeuf', 'egg', 'œufs', 'oeufs', 'eggs', 'jaune', 'yolk', 'blanc d\'œuf', 'blanc d\'oeuf', 'egg white', 'mayonnaise', 'mayo', 'mousse', 'soufflé'],
    label: 'Œufs et produits à base d\'œufs'
  },
  'arachides': { 
    keywords: ['arachide', 'peanut', 'cacahuète', 'cacahuete', 'peanut butter'],
    label: 'Arachides'
  },
  'fruits_a_coque': { 
    keywords: ['noix', 'nuts', 'noisette', 'hazelnut', 'amande', 'almond', 'pistache', 'pistachio', 'noix de cajou', 'cashew'],
    label: 'Fruits à coque'
  },
  'soja': { 
    keywords: ['soja', 'soy', 'soya', 'tofu', 'miso'],
    label: 'Soja'
  },
  'poisson': { 
    keywords: ['poisson', 'fish', 'saumon', 'salmon', 'cabillaud', 'cod', 'thon', 'tuna', 'truite', 'trout', 'sardine', 'merlan', 'sole'],
    label: 'Poisson'
  },
  'crustaces': { 
    keywords: ['crevette', 'shrimp', 'crabe', 'crab', 'langouste', 'lobster', 'homard', 'langoustine'],
    label: 'Crustacés'
  },
  'mollusques': { 
    keywords: ['moule', 'mussel', 'huître', 'oyster', 'coquille', 'shell', 'pétoncle', 'scallop'],
    label: 'Mollusques'
  },
  'celeri': { 
    keywords: ['céleri', 'celery', 'celeri'],
    label: 'Céleri'
  },
  'moutarde': { 
    keywords: ['moutarde', 'mustard'],
    label: 'Moutarde'
  },
  'sesame': { 
    keywords: ['sésame', 'sesame', 'tahini'],
    label: 'Graines de sésame'
  },
  'sulfites': { 
    keywords: ['sulfite', 'sulfites', 'anhydride', 'e220', 'e221', 'e222', 'e223', 'e224', 'e225', 'e226', 'e227', 'e228'],
    label: 'Anhydride sulfureux et sulfites'
  },
  'lupin': { 
    keywords: ['lupin', 'lupine'],
    label: 'Lupin'
  }
};

/**
 * Détecte les allergènes européens dans une liste d'ingrédients
 */
function detectEuropeanAllergens(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return [];
  
  const detected = new Set();
  
  ingredients.forEach(ing => {
    const ingName = (ing.name || '').toLowerCase();
    
    Object.entries(EU_ALLERGENS).forEach(([allergen, { keywords }]) => {
      if (keywords.some(keyword => {
        // Utiliser une regex pour éviter les faux positifs
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
 */
function normalizeAllergen(name) {
  if (!name) return '';
  const normalized = String(name).toLowerCase().trim();
  
  // Variantes communes
  const variants = {
    'oeufs': 'oeufs', 'oeuf': 'oeufs', 'eggs': 'oeufs', 'œufs': 'oeufs', 'œuf': 'oeufs',
    'lait': 'lait', 'lactose': 'lait', 'dairy': 'lait', 'milk': 'lait',
    'gluten': 'gluten', 'blé': 'gluten', 'wheat': 'gluten',
    'fruits à coque': 'fruits_a_coque', 'fruits a coque': 'fruits_a_coque', 'nuts': 'fruits_a_coque',
    'crustacés': 'crustaces', 'crustaces': 'crustaces',
    'mollusques': 'mollusques',
    'céleri': 'celeri', 'celery': 'celeri',
    'sésame': 'sesame', 'sesame': 'sesame',
    'sulfites': 'sulfites', 'sulfite': 'sulfites'
  };
  
  return variants[normalized] || normalized;
}

/**
 * Compare les allergènes détectés avec ceux déclarés
 */
function compareAllergens(detected, declared) {
  const detectedNormalized = detected.map(normalizeAllergen);
  const declaredNormalized = (declared || []).map(normalizeAllergen);
  
  const missing = detectedNormalized.filter(a => !declaredNormalized.includes(a));
  const extra = declaredNormalized.filter(a => !detectedNormalized.includes(a));
  const correct = detectedNormalized.filter(a => declaredNormalized.includes(a));
  
  return { missing, extra, correct, detected, declared };
}

async function verifyUE1169Compliance() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB\n');
    
    console.log('📋 Vérification de la conformité UE 1169/2011\n');
    console.log('La directive UE 1169/2011 exige que les 14 allergènes majeurs soient déclarés');
    console.log('s\'ils sont présents dans les ingrédients.\n');
    
    // Récupérer toutes les recettes
    console.log('📚 Récupération de toutes les recettes...');
    const allRecipes = await Recipe.find({});
    console.log(`✅ ${allRecipes.length} recette(s) trouvée(s)\n`);
    
    // Statistiques
    let compliant = 0;
    let nonCompliant = 0;
    let noIngredients = 0;
    const nonCompliantRecipes = [];
    const allergenStats = {};
    
    // Initialiser les statistiques par allergène
    Object.keys(EU_ALLERGENS).forEach(allergen => {
      allergenStats[allergen] = {
        detected: 0,
        declared: 0,
        missing: 0
      };
    });
    
    console.log('🔍 Analyse de la conformité...\n');
    
    for (let i = 0; i < allRecipes.length; i++) {
      const recipe = allRecipes[i];
      
      // Ignorer les recettes sans ingrédients
      if (!recipe.ingredients || !Array.isArray(recipe.ingredients) || recipe.ingredients.length === 0) {
        noIngredients++;
        continue;
      }
      
      // Détecter les allergènes
      const detectedAllergens = detectEuropeanAllergens(recipe.ingredients);
      const declaredAllergens = Array.isArray(recipe.allergens) ? recipe.allergens : [];
      
      // Comparer
      const comparison = compareAllergens(detectedAllergens, declaredAllergens);
      
      // Mettre à jour les statistiques par allergène
      detectedAllergens.forEach(allergen => {
        if (allergenStats[allergen]) {
          allergenStats[allergen].detected++;
          if (comparison.missing.includes(normalizeAllergen(allergen))) {
            allergenStats[allergen].missing++;
          }
        }
      });
      
      declaredAllergens.forEach(allergen => {
        const normalized = normalizeAllergen(allergen);
        if (allergenStats[normalized]) {
          allergenStats[normalized].declared++;
        }
      });
      
      // Vérifier la conformité
      if (comparison.missing.length === 0) {
        compliant++;
      } else {
        nonCompliant++;
        nonCompliantRecipes.push({
          name: recipe.name,
          id: recipe._id,
          detected: detectedAllergens,
          declared: declaredAllergens,
          missing: comparison.missing.map(a => {
            const key = Object.keys(EU_ALLERGENS).find(k => normalizeAllergen(k) === a);
            return key ? EU_ALLERGENS[key].label : a;
          }),
          ingredients: recipe.ingredients.slice(0, 5).map(ing => ing.name)
        });
      }
      
      if ((i + 1) % 100 === 0) {
        console.log(`[${i + 1}/${allRecipes.length}] Analysées... (${compliant} conformes, ${nonCompliant} non conformes)`);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RAPPORT DE CONFORMITÉ UE 1169/2011');
    console.log('='.repeat(80));
    console.log(`\n📈 STATISTIQUES GLOBALES:`);
    console.log(`   Total de recettes analysées: ${allRecipes.length}`);
    console.log(`   ✅ Recettes conformes: ${compliant} (${((compliant / (allRecipes.length - noIngredients)) * 100).toFixed(1)}%)`);
    console.log(`   ❌ Recettes non conformes: ${nonCompliant} (${((nonCompliant / (allRecipes.length - noIngredients)) * 100).toFixed(1)}%)`);
    console.log(`   ⚠️  Recettes sans ingrédients: ${noIngredients}`);
    
    if (nonCompliant > 0) {
      console.log(`\n⚠️  PROBLÈME DE CONFORMITÉ DÉTECTÉ`);
      console.log(`   ${nonCompliant} recette(s) ne déclare(nt) pas tous les allergènes présents dans leurs ingrédients.`);
      console.log(`   Cela constitue une non-conformité avec la directive UE 1169/2011.\n`);
      
      console.log(`📋 EXEMPLES DE RECETTES NON CONFORMES (premiers 10):`);
      nonCompliantRecipes.slice(0, 10).forEach((item, index) => {
        console.log(`\n${index + 1}. ${item.name}`);
        console.log(`   Allergènes détectés: ${item.detected.length > 0 ? item.detected.join(', ') : 'Aucun'}`);
        console.log(`   Allergènes déclarés: ${item.declared.length > 0 ? item.declared.join(', ') : 'Aucun'}`);
        console.log(`   ❌ Allergènes manquants: ${item.missing.join(', ')}`);
        console.log(`   Ingrédients: ${item.ingredients.join(', ')}...`);
      });
      
      if (nonCompliantRecipes.length > 10) {
        console.log(`\n   ... et ${nonCompliantRecipes.length - 10} autre(s) recette(s) non conforme(s)`);
      }
    } else {
      console.log(`\n✅ EXCELLENT ! Toutes les recettes sont conformes à la directive UE 1169/2011.`);
    }
    
    // Statistiques par allergène
    console.log(`\n📊 STATISTIQUES PAR ALLERGÈNE:`);
    console.log(`\n${'Allergène'.padEnd(35)} | Détecté | Déclaré | Manquant`);
    console.log('-'.repeat(80));
    Object.entries(allergenStats)
      .filter(([_, stats]) => stats.detected > 0 || stats.declared > 0)
      .sort((a, b) => b[1].detected - a[1].detected)
      .forEach(([allergen, stats]) => {
        const label = EU_ALLERGENS[allergen].label;
        console.log(`${label.padEnd(35)} | ${String(stats.detected).padStart(7)} | ${String(stats.declared).padStart(7)} | ${String(stats.missing).padStart(7)}`);
      });
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Vérification terminée !');
    console.log('='.repeat(80));
    
    if (nonCompliant > 0) {
      console.log(`\n💡 RECOMMANDATION:`);
      console.log(`   Exécutez le script "scripts/fix-allergen-declarations.js" pour corriger automatiquement`);
      console.log(`   les déclarations d'allergènes manquantes.`);
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de la vérification de conformité UE 1169/2011...\n');
verifyUE1169Compliance();

