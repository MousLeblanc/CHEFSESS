/**
 * Script pour reclassifier automatiquement les plats incomplets
 * Reclassifie les recettes mal classées (soupes/accompagnements classés comme "plat")
 * basé sur les ingrédients et le nom de la recette
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Mots-clés pour identifier les soupes
const SOUP_KEYWORDS = [
  'velouté', 'veloute', 'soupe', 'soup', 'consommé', 'consomme', 
  'bouillon', 'broth', 'potage', 'gazpacho', 'minestrone', 'bisque'
];

// Mots-clés pour identifier les accompagnements
const SIDE_DISH_KEYWORDS = [
  'purée', 'puree', 'ratatouille', 'compote', 'légumes', 'legumes',
  'gratin de légumes', 'gratin de legumes', 'légumes vapeur', 'legumes vapeur'
];

// Mots-clés pour identifier les protéines
const PROTEIN_KEYWORDS = [
  'poulet', 'chicken', 'viande', 'meat', 'bœuf', 'boeuf', 'beef', 
  'porc', 'pork', 'jambon', 'ham', 'dinde', 'turkey',
  'poisson', 'fish', 'saumon', 'salmon', 'cabillaud', 'cod', 
  'thon', 'tuna', 'truite', 'trout',
  'œuf', 'oeuf', 'egg', 'fromage', 'cheese'
];

/**
 * Vérifie si une recette est une soupe basée sur son nom
 */
function isSoupByName(name) {
  if (!name || typeof name !== 'string') return false;
  const nameLower = name.toLowerCase();
  return SOUP_KEYWORDS.some(keyword => nameLower.includes(keyword));
}

/**
 * Vérifie si une recette est un accompagnement basé sur son nom
 */
function isSideDishByName(name) {
  if (!name || typeof name !== 'string') return false;
  const nameLower = name.toLowerCase();
  return SIDE_DISH_KEYWORDS.some(keyword => nameLower.includes(keyword));
}

/**
 * Vérifie si une recette contient une protéine
 */
function hasProtein(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return false;
  
  return ingredients.some(ing => {
    const ingName = (ing.name || '').toLowerCase();
    
    // Vérifier les protéines avec des mots-clés plus spécifiques
    return PROTEIN_KEYWORDS.some(keyword => {
      // Utiliser une regex plus précise pour éviter les faux positifs
      // Ex: "purée" ne doit pas matcher "purée de poisson" comme protéine
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(ingName);
    }) || 
    // Vérifier aussi dans le nom de la recette si présent
    /filet|steak|escalope|tranche|morceau|dés|dés de/i.test(ingName) && 
    /poulet|viande|poisson|saumon|cabillaud|thon|bœuf|boeuf|porc|jambon|dinde/i.test(ingName);
  });
}

/**
 * Vérifie si une recette est principalement composée de légumes
 */
function isMainlyVegetables(ingredients) {
  if (!ingredients || !Array.isArray(ingredients)) return false;
  
  const vegetableKeywords = [
    'carotte', 'carrot', 'courgette', 'zucchini', 'tomate', 'tomato',
    'poivron', 'pepper', 'aubergine', 'eggplant', 'chou', 'cabbage',
    'brocoli', 'broccoli', 'haricot', 'bean', 'lentille', 'lentil',
    'pois', 'pea', 'épinard', 'spinach', 'potiron', 'pumpkin',
    'butternut', 'patate', 'potato', 'pomme de terre', 'pomme de terre'
  ];
  
  const hasProtein = ingredients.some(ing => {
    const ingName = (ing.name || '').toLowerCase();
    return PROTEIN_KEYWORDS.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(ingName);
    });
  });
  
  if (hasProtein) return false;
  
  const vegetableCount = ingredients.filter(ing => {
    const ingName = (ing.name || '').toLowerCase();
    return vegetableKeywords.some(keyword => {
      const regex = new RegExp(`\\b${keyword}\\b`, 'i');
      return regex.test(ingName);
    });
  }).length;
  
  // Si plus de 50% des ingrédients sont des légumes et pas de protéine
  return vegetableCount >= Math.ceil(ingredients.length * 0.5);
}

/**
 * Détermine la catégorie correcte d'une recette
 * @param {Object} recipe - La recette à analyser
 * @returns {Object} - { correctCategory: string, reason: string, confidence: 'high'|'medium'|'low' }
 */
function determineCorrectCategory(recipe) {
  const name = recipe.name || '';
  const category = recipe.category || '';
  const ingredients = recipe.ingredients || [];
  
  // Si ce n'est pas classé comme "plat", pas besoin de vérifier
  if (category !== 'plat') {
    return { correctCategory: category, reason: 'Déjà correctement classé', confidence: 'high' };
  }
  
  // 1. Vérifier si c'est une soupe
  if (isSoupByName(name)) {
    return { 
      correctCategory: 'soupe', 
      reason: 'Nom contient un mot-clé de soupe', 
      confidence: 'high' 
    };
  }
  
  // 2. Vérifier si c'est un accompagnement (purée, ratatouille, etc.)
  if (isSideDishByName(name)) {
    // Vérifier d'abord si le nom contient une protéine (ex: "Filet de cabillaud vapeur, purée")
    const nameLower = name.toLowerCase();
    const nameHasProtein = PROTEIN_KEYWORDS.some(keyword => {
      const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      return regex.test(nameLower);
    });
    
    // Si le nom contient une protéine, c'est probablement un plat complet
    if (nameHasProtein) {
      return { 
        correctCategory: 'plat', 
        reason: 'Nom contient une protéine même si le nom suggère un accompagnement', 
        confidence: 'high' 
      };
    }
    
    // Si c'est une purée ou ratatouille sans protéine, c'est un accompagnement
    if (!hasProtein(ingredients)) {
      return { 
        correctCategory: 'accompagnement', 
        reason: 'Nom indique un accompagnement et pas de protéine', 
        confidence: 'high' 
      };
    }
    // Si c'est une purée avec protéine, ça peut rester un plat (ex: "Purée de pommes de terre avec poulet")
    return { 
      correctCategory: 'plat', 
      reason: 'Nom indique accompagnement mais contient une protéine', 
      confidence: 'medium' 
    };
  }
  
  // 3. Vérifier si c'est principalement des légumes sans protéine
  if (isMainlyVegetables(ingredients) && !hasProtein(ingredients)) {
    // Vérifier si le nom suggère un plat complet
    const nameLower = name.toLowerCase();
    const suggestsCompleteMeal = nameLower.includes('avec') || 
                                 nameLower.includes('et') ||
                                 nameLower.includes('au') ||
                                 nameLower.includes('à la');
    
    if (!suggestsCompleteMeal) {
      return { 
        correctCategory: 'accompagnement', 
        reason: 'Principalement des légumes sans protéine', 
        confidence: 'medium' 
      };
    }
  }
  
  // 4. Vérifier les cas spéciaux
  // "Pâtes pommes de terre" ou "Spaghetti de courgette" sans protéine = accompagnement
  const nameLower = name.toLowerCase();
  
  // Vérifier si le nom contient une protéine avant de reclassifier
  const nameHasProtein = PROTEIN_KEYWORDS.some(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(nameLower);
  });
  
  // Cas spéciaux : recettes avec protéine dans le nom mais classées comme accompagnement
  // Ex: "Filet de cabillaud vapeur, purée" ou "Poisson vapeur aux légumes"
  if (nameHasProtein && (nameLower.includes('vapeur') || nameLower.includes('poché') || nameLower.includes('grillé') || nameLower.includes('steak'))) {
    return { 
      correctCategory: 'plat', 
      reason: 'Nom contient une protéine cuite (vapeur, poché, grillé, steak)', 
      confidence: 'high' 
    };
  }
  
  if ((nameLower.includes('pâtes') || nameLower.includes('pates') || nameLower.includes('spaghetti')) && 
      !hasProtein(ingredients) &&
      !nameHasProtein &&
      (nameLower.includes('pomme de terre') || nameLower.includes('courgette'))) {
    return { 
      correctCategory: 'accompagnement', 
      reason: 'Pâtes de légumes sans protéine', 
      confidence: 'high' 
    };
  }
  
  // Si aucune règle ne s'applique, garder la catégorie actuelle
  return { 
    correctCategory: category, 
    reason: 'Aucune règle de reclassification applicable', 
    confidence: 'low' 
  };
}

async function fixIncompleteMealsCategories() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB\n');
    
    // Récupérer toutes les recettes classées comme "plat"
    console.log('📚 Récupération des recettes classées comme "plat"...');
    const recipes = await Recipe.find({ category: 'plat' });
    console.log(`✅ ${recipes.length} recette(s) trouvée(s)\n`);
    
    if (recipes.length === 0) {
      console.log('⚠️  Aucune recette classée comme "plat" trouvée');
      return;
    }
    
    // Statistiques
    let fixed = 0;
    let skipped = 0;
    let errors = 0;
    const fixedRecipes = [];
    const skippedRecipes = [];
    
    console.log('🔍 Analyse et reclassification des plats incomplets...\n');
    
    for (const recipe of recipes) {
      try {
        const analysis = determineCorrectCategory(recipe);
        
        // Ne reclassifier que si la confiance est élevée ou moyenne
        if (analysis.correctCategory !== recipe.category && 
            (analysis.confidence === 'high' || analysis.confidence === 'medium')) {
          
          const oldCategory = recipe.category;
          recipe.category = analysis.correctCategory;
          
          await recipe.save();
          
          fixed++;
          fixedRecipes.push({
            name: recipe.name,
            id: recipe._id,
            oldCategory,
            newCategory: analysis.correctCategory,
            reason: analysis.reason,
            confidence: analysis.confidence
          });
          
          console.log(`✅ ${recipe.name}`);
          console.log(`   Catégorie avant: ${oldCategory}`);
          console.log(`   Catégorie après: ${analysis.correctCategory}`);
          console.log(`   Raison: ${analysis.reason}`);
          console.log(`   Confiance: ${analysis.confidence}\n`);
        } else {
          skipped++;
          if (analysis.confidence === 'low' && analysis.correctCategory !== recipe.category) {
            skippedRecipes.push({
              name: recipe.name,
              id: recipe._id,
              currentCategory: recipe.category,
              suggestedCategory: analysis.correctCategory,
              reason: analysis.reason
            });
          }
        }
      } catch (error) {
        errors++;
        console.error(`❌ Erreur pour "${recipe.name}":`, error.message);
      }
    }
    
    // Résumé
    console.log('\n' + '='.repeat(80));
    console.log('📊 RÉSUMÉ DE LA RECLASSIFICATION');
    console.log('='.repeat(80));
    console.log(`✅ Recettes reclassifiées: ${fixed}`);
    console.log(`⏭️  Recettes sans modification: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log(`📊 Total analysé: ${recipes.length}`);
    
    if (fixedRecipes.length > 0) {
      console.log('\n📋 DÉTAIL DES RECLASSIFICATIONS:');
      
      // Grouper par nouvelle catégorie
      const byCategory = {};
      fixedRecipes.forEach(item => {
        if (!byCategory[item.newCategory]) {
          byCategory[item.newCategory] = [];
        }
        byCategory[item.newCategory].push(item);
      });
      
      Object.entries(byCategory).forEach(([category, items]) => {
        console.log(`\n📁 ${category.toUpperCase()} (${items.length} recette(s)):`);
        items.forEach((item, index) => {
          console.log(`   ${index + 1}. ${item.name}`);
          console.log(`      ${item.oldCategory} → ${item.newCategory}`);
          console.log(`      Raison: ${item.reason} (${item.confidence})`);
        });
      });
    }
    
    if (skippedRecipes.length > 0) {
      console.log('\n⚠️  RECETTES À VÉRIFIER MANUELLEMENT (faible confiance):');
      skippedRecipes.slice(0, 10).forEach((item, index) => {
        console.log(`   ${index + 1}. ${item.name}`);
        console.log(`      Catégorie actuelle: ${item.currentCategory}`);
        console.log(`      Catégorie suggérée: ${item.suggestedCategory}`);
        console.log(`      Raison: ${item.reason}`);
      });
      if (skippedRecipes.length > 10) {
        console.log(`   ... et ${skippedRecipes.length - 10} autre(s) recette(s)`);
      }
    }
    
    console.log('\n' + '='.repeat(80));
    console.log('✅ Reclassification terminée avec succès !');
    console.log('='.repeat(80));
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Déconnexion de MongoDB');
  }
}

console.log('🚀 Démarrage de la reclassification des plats incomplets...\n');
console.log('📋 Ce script va:');
console.log('   1. Analyser toutes les recettes classées comme "plat"');
console.log('   2. Détecter les soupes et accompagnements mal classés');
console.log('   3. Reclassifier automatiquement basé sur:');
console.log('      - Le nom de la recette (mots-clés)');
console.log('      - La présence/absence de protéines');
console.log('      - Le type d\'ingrédients');
console.log('   4. Générer un rapport des modifications\n');
fixIncompleteMealsCategories();

