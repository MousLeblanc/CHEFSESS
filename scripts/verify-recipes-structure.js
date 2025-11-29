// scripts/verify-recipes-structure.js
// Script pour vérifier que toutes les recettes ont la même structure avec allergènes
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';

/**
 * Allergènes standards selon le règlement UE
 */
const STANDARD_ALLERGENS = [
  'gluten', 'lactose', 'oeufs', 'arachides', 'fruits_a_coque',
  'soja', 'poisson', 'crustaces', 'mollusques', 'celeri',
  'moutarde', 'sesame', 'sulfites', 'lupin'
];

/**
 * Vérifier la structure d'une recette
 */
function verifyRecipeStructure(recipe) {
  const issues = [];
  
  // Vérifier les champs obligatoires
  if (!recipe.name) {
    issues.push('❌ Nom manquant');
  }
  
  if (!recipe.category) {
    issues.push('❌ Catégorie manquante');
  }
  
  // Vérifier les allergènes
  if (!Array.isArray(recipe.allergens)) {
    issues.push('❌ Allergènes: doit être un tableau');
  } else {
    // Vérifier que les allergènes sont valides
    const invalidAllergens = recipe.allergens.filter(a => !STANDARD_ALLERGENS.includes(a));
    if (invalidAllergens.length > 0) {
      issues.push(`⚠️  Allergènes non standardisés: ${invalidAllergens.join(', ')}`);
    }
  }
  
  // Vérifier les ingrédients
  if (!Array.isArray(recipe.ingredients)) {
    issues.push('❌ Ingrédients: doit être un tableau');
  } else if (recipe.ingredients.length === 0) {
    issues.push('⚠️  Aucun ingrédient');
  } else {
    // Vérifier la structure des ingrédients
    recipe.ingredients.forEach((ing, idx) => {
      if (!ing.name) {
        issues.push(`⚠️  Ingrédient ${idx + 1}: nom manquant`);
      }
      if (ing.quantity === undefined || ing.quantity === null) {
        issues.push(`⚠️  Ingrédient ${idx + 1}: quantité manquante`);
      }
    });
  }
  
  // Vérifier les étapes de préparation
  if (!Array.isArray(recipe.preparationSteps)) {
    issues.push('❌ Étapes de préparation: doit être un tableau');
  } else if (recipe.preparationSteps.length === 0) {
    issues.push('⚠️  Aucune étape de préparation');
  }
  
  // Vérifier le profil nutritionnel
  if (recipe.nutritionalProfile) {
    const requiredFields = ['kcal', 'protein', 'lipids', 'carbs', 'fiber', 'sodium'];
    requiredFields.forEach(field => {
      if (recipe.nutritionalProfile[field] === undefined || recipe.nutritionalProfile[field] === null) {
        issues.push(`⚠️  Profil nutritionnel: ${field} manquant`);
      }
    });
  }
  
  // Vérifier les tags
  if (!Array.isArray(recipe.tags)) {
    issues.push('⚠️  Tags: doit être un tableau');
  }
  
  // Vérifier les restrictions alimentaires
  if (!Array.isArray(recipe.dietaryRestrictions)) {
    issues.push('⚠️  Restrictions alimentaires: doit être un tableau');
  }
  
  return issues;
}

/**
 * Fonction principale
 */
async function verifyRecipesStructure() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');
    
    console.log('\n📊 Analyse de la structure des recettes...\n');
    
    // Récupérer toutes les recettes
    const recipes = await RecipeEnriched.find({}).limit(200); // Limiter pour les tests
    console.log(`📝 Analyse de ${recipes.length} recettes...\n`);
    
    const stats = {
      total: recipes.length,
      withAllergens: 0,
      withoutAllergens: 0,
      withNutrition: 0,
      withoutNutrition: 0,
      withTags: 0,
      withoutTags: 0,
      issues: [],
      allergenDistribution: {},
      categoryDistribution: {}
    };
    
    recipes.forEach((recipe, idx) => {
      // Statistiques générales
      if (recipe.allergens && recipe.allergens.length > 0) {
        stats.withAllergens++;
        recipe.allergens.forEach(allergen => {
          stats.allergenDistribution[allergen] = (stats.allergenDistribution[allergen] || 0) + 1;
        });
      } else {
        stats.withoutAllergens++;
      }
      
      if (recipe.nutritionalProfile && recipe.nutritionalProfile.kcal > 0) {
        stats.withNutrition++;
      } else {
        stats.withoutNutrition++;
      }
      
      if (recipe.tags && recipe.tags.length > 0) {
        stats.withTags++;
      } else {
        stats.withoutTags++;
      }
      
      // Distribution par catégorie
      const cat = recipe.category || 'non définie';
      stats.categoryDistribution[cat] = (stats.categoryDistribution[cat] || 0) + 1;
      
      // Vérifier la structure
      const issues = verifyRecipeStructure(recipe);
      if (issues.length > 0) {
        stats.issues.push({
          name: recipe.name,
          issues: issues
        });
      }
    });
    
    // Afficher les résultats
    console.log('📊 Statistiques générales:');
    console.log(`  Total: ${stats.total}`);
    console.log(`  Avec allergènes: ${stats.withAllergens} (${Math.round(stats.withAllergens/stats.total*100)}%)`);
    console.log(`  Sans allergènes: ${stats.withoutAllergens} (${Math.round(stats.withoutAllergens/stats.total*100)}%)`);
    console.log(`  Avec profil nutritionnel: ${stats.withNutrition} (${Math.round(stats.withNutrition/stats.total*100)}%)`);
    console.log(`  Sans profil nutritionnel: ${stats.withoutNutrition} (${Math.round(stats.withoutNutrition/stats.total*100)}%)`);
    console.log(`  Avec tags: ${stats.withTags} (${Math.round(stats.withTags/stats.total*100)}%)`);
    console.log(`  Sans tags: ${stats.withoutTags} (${Math.round(stats.withoutTags/stats.total*100)}%)`);
    
    console.log('\n📊 Distribution par catégorie:');
    Object.entries(stats.categoryDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, count]) => {
        console.log(`  ${cat}: ${count}`);
      });
    
    console.log('\n📊 Distribution des allergènes:');
    Object.entries(stats.allergenDistribution)
      .sort((a, b) => b[1] - a[1])
      .forEach(([allergen, count]) => {
        console.log(`  ${allergen}: ${count}`);
      });
    
    if (stats.issues.length > 0) {
      console.log(`\n⚠️  ${stats.issues.length} recette(s) avec des problèmes de structure:`);
      stats.issues.slice(0, 10).forEach(item => {
        console.log(`\n  📝 ${item.name}:`);
        item.issues.forEach(issue => {
          console.log(`    ${issue}`);
        });
      });
      if (stats.issues.length > 10) {
        console.log(`\n  ... et ${stats.issues.length - 10} autre(s) recette(s) avec des problèmes`);
      }
    } else {
      console.log('\n✅ Toutes les recettes ont une structure valide!');
    }
    
    // Vérifier quelques exemples de recettes récentes
    console.log('\n📝 Exemples de recettes récentes:');
    const recentRecipes = await RecipeEnriched.find({})
      .sort({ _id: -1 })
      .limit(5)
      .select('name category allergens dietaryRestrictions tags nutritionalProfile');
    
    recentRecipes.forEach((recipe, idx) => {
      console.log(`\n  ${idx + 1}. ${recipe.name}`);
      console.log(`     Catégorie: ${recipe.category}`);
      console.log(`     Allergènes: ${recipe.allergens?.length > 0 ? recipe.allergens.join(', ') : 'aucun'}`);
      console.log(`     Restrictions: ${recipe.dietaryRestrictions?.length > 0 ? recipe.dietaryRestrictions.join(', ') : 'aucune'}`);
      console.log(`     Tags: ${recipe.tags?.slice(0, 3).join(', ') || 'aucun'}${recipe.tags?.length > 3 ? '...' : ''}`);
      console.log(`     Nutrition: ${recipe.nutritionalProfile?.kcal ? `${Math.round(recipe.nutritionalProfile.kcal)} kcal` : 'non définie'}`);
    });
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter si appelé directement
verifyRecipesStructure();



