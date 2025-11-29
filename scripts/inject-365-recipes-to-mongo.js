// scripts/inject-365-recipes-to-mongo.js
// Script pour injecter les recettes 365 dans MongoDB classées par catégories
import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import RecipeEnriched from '../models/Recipe.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Classifier la recette par catégorie détaillée
 */
function classify365Recipe(recipe) {
  const name = (recipe.name || '').toLowerCase();
  const tags = (recipe.tags || []).map(t => t.toLowerCase());
  const allTags = tags.join(' ');
  
  // Soupe
  if (tags.includes('#soupe') || name.includes('soup') || name.includes('broth') || name.includes('stew')) {
    return {
      detailedCategory: 'soupe',
      modelCategory: 'soupe',
      tags: ['#soupe']
    };
  }
  
  // Salade
  if (tags.includes('#salade') || name.includes('salad')) {
    return {
      detailedCategory: 'salade',
      modelCategory: 'accompagnement',
      tags: ['#salade']
    };
  }
  
  // Dessert
  if (tags.includes('#dessert') || name.includes('cake') || name.includes('cookie') || name.includes('pie') || name.includes('tart') || name.includes('pudding') || name.includes('mousse')) {
    return {
      detailedCategory: 'dessert',
      modelCategory: 'dessert',
      tags: ['#dessert']
    };
  }
  
  // Pain et viennoiseries
  if (tags.includes('#pain') || tags.includes('#viennoiserie') || name.includes('bread') || name.includes('roll') || name.includes('bagel') || name.includes('challah') || name.includes('kugel')) {
    return {
      detailedCategory: 'pain',
      modelCategory: 'petit-déjeuner',
      tags: ['#pain', '#viennoiserie']
    };
  }
  
  // Sauce
  if (tags.includes('#sauce') || name.includes('sauce') || name.includes('dressing') || name.includes('marinade')) {
    return {
      detailedCategory: 'sauce',
      modelCategory: 'accompagnement',
      tags: ['#sauce']
    };
  }
  
  // Pâtes
  if (tags.includes('#pâtes') || name.includes('pasta') || name.includes('noodle') || name.includes('lasagna') || name.includes('ravioli') || name.includes('gnocchi')) {
    return {
      detailedCategory: 'pâtes',
      modelCategory: 'plat',
      tags: ['#pâtes']
    };
  }
  
  // Poisson
  if (tags.includes('#poisson') || name.includes('fish') || name.includes('salmon') || name.includes('tuna') || name.includes('cod') || name.includes('trout')) {
    return {
      detailedCategory: 'poisson',
      modelCategory: 'plat',
      tags: ['#poisson']
    };
  }
  
  // Viande
  if (tags.includes('#viande') || name.includes('meat') || name.includes('beef') || name.includes('pork') || name.includes('lamb') || name.includes('veal') || name.includes('steak')) {
    return {
      detailedCategory: 'viande',
      modelCategory: 'plat',
      tags: ['#viande']
    };
  }
  
  // Volaille
  if (tags.includes('#volaille') || name.includes('chicken') || name.includes('turkey') || name.includes('poultry') || name.includes('duck') || name.includes('wing')) {
    return {
      detailedCategory: 'volaille',
      modelCategory: 'plat',
      tags: ['#volaille']
    };
  }
  
  // Accompagnement
  if (tags.includes('#accompagnement') || name.includes('side') || name.includes('accompaniment') || name.includes('vegetable')) {
    return {
      detailedCategory: 'accompagnement',
      modelCategory: 'accompagnement',
      tags: ['#accompagnement']
    };
  }
  
  // Plat principal (par défaut)
  return {
    detailedCategory: 'plat',
    modelCategory: 'plat',
    tags: ['#plat']
  };
}

/**
 * Normaliser les ingrédients pour MongoDB
 */
function normalizeIngredients(ingredients) {
  return ingredients.map(ing => {
    let name = (ing.name || '').trim();
    
    // Nettoyer les unités communes qui restent dans le nom
    name = name.replace(/\b(ounce|ounces|oz|cup|cups|c|tablespoon|tablespoons|tbsp|teaspoon|teaspoons|tsp|pound|pounds|lb|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|clove|cloves|piece|pieces|slice|slices|handful|handfuls|bunch|bunches|stalk|stalks|head|heads|can|cans|package|packages|envelope|envelopes|stick|sticks|inch|inches|in\.|large|medium|small|of)\b/gi, '').trim();
    
    return {
      name: name || 'ingrédient',
      quantity: ing.quantity || 1,
      unit: ing.unit || 'unit'
    };
  }).filter(ing => ing.name && ing.name.length > 1);
}

/**
 * Détecter les allergènes (version anglaise)
 */
function detectAllergens(recipe) {
  const allergens = new Set();
  const allText = `${recipe.name} ${(recipe.ingredients || []).map(i => i.name).join(' ')}`.toLowerCase();
  
  const allergenMap = {
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats', 'all-purpose'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'parmesan', 'mozzarella', 'cottage cheese', 'sour cream', 'cream cheese', 'half-and-half'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo', 'egg yolk', 'egg white'],
    'poisson': ['fish', 'salmon', 'tuna', 'sardine', 'anchovy', 'cod', 'trout', 'mackerel'],
    'crustaces': ['shrimp', 'crab', 'lobster', 'prawn', 'crayfish'],
    'mollusques': ['mussel', 'oyster', 'clam', 'squid', 'octopus', 'scallop'],
    'soja': ['soy', 'soya', 'tofu', 'tempeh', 'miso', 'edamame'],
    'fruits_a_coque': ['almond', 'walnut', 'hazelnut', 'cashew', 'pistachio', 'pecan', 'macadamia', 'pine nut'],
    'arachides': ['peanut', 'peanuts', 'groundnut'],
    'sesame': ['sesame', 'tahini'],
    'moutarde': ['mustard'],
    'celeri': ['celery', 'celeriac'],
    'sulfites': ['sulfite', 'sulphite'],
    'lupin': ['lupin', 'lupine']
  };
  
  for (const [allergen, keywords] of Object.entries(allergenMap)) {
    for (const keyword of keywords) {
      if (allText.includes(keyword)) {
        allergens.add(allergen);
        break;
      }
    }
  }
  
  return Array.from(allergens);
}

/**
 * Déterminer les restrictions alimentaires
 */
function determineDietaryRestrictions(recipe) {
  const restrictions = [];
  const allText = `${recipe.name} ${(recipe.ingredients || []).map(i => i.name).join(' ')}`.toLowerCase();
  const tags = (recipe.tags || []).map(t => t.toLowerCase()).join(' ');
  
  // Vérifier les tags
  if (tags.includes('#végétarien') || tags.includes('#vegetarian')) {
    restrictions.push('végétarien');
  }
  if (tags.includes('#végétalien') || tags.includes('#vegan')) {
    restrictions.push('végétalien');
  }
  if (tags.includes('#sans-gluten') || tags.includes('#gluten-free')) {
    restrictions.push('sans_gluten');
  }
  if (tags.includes('#sans-lactose') || tags.includes('#dairy-free')) {
    restrictions.push('sans_lactose');
  }
  
  // Détecter automatiquement
  const meatKeywords = ['meat', 'beef', 'pork', 'lamb', 'veal', 'ham', 'bacon', 'sausage', 'steak', 'chicken', 'turkey', 'poultry'];
  const fishKeywords = ['fish', 'salmon', 'tuna', 'cod', 'shrimp', 'crab', 'mussel'];
  const animalProducts = ['milk', 'cream', 'cheese', 'butter', 'egg', 'eggs', 'honey', 'yogurt'];
  
  const hasMeat = meatKeywords.some(kw => allText.includes(kw));
  const hasFish = fishKeywords.some(kw => allText.includes(kw));
  const hasAnimalProducts = animalProducts.some(product => allText.includes(product));
  
  if (!hasMeat && !hasFish && !restrictions.includes('végétarien')) {
    restrictions.push('végétarien');
    if (!hasAnimalProducts && !restrictions.includes('végétalien')) {
      restrictions.push('végétalien');
    }
  }
  
  return restrictions;
}

/**
 * Normaliser une recette pour MongoDB
 */
function normalizeRecipeForMongo(recipe) {
  const classification = classify365Recipe(recipe);
  const normalizedIngredients = normalizeIngredients(recipe.ingredients || []);
  const allergens = detectAllergens(recipe);
  const dietaryRestrictions = determineDietaryRestrictions(recipe);
  
  // Combiner les tags existants avec les tags de classification
  const allTags = [...(recipe.tags || []), ...classification.tags];
  
  // Ajouter le chapitre dans les tags
  if (recipe.chapter) {
    allTags.push(`chapitre:${recipe.chapter.toLowerCase().replace(/\s+/g, '-')}`);
  }
  
  // Ajouter les informations de temps dans les tags si nécessaire
  if (recipe.preparationTime || recipe.cookingTime) {
    const timeInfo = [];
    if (recipe.preparationTime) timeInfo.push(`préparation:${recipe.preparationTime}min`);
    if (recipe.cookingTime) timeInfo.push(`cuisson:${recipe.cookingTime}min`);
    allTags.push(...timeInfo);
  }
  
  // Ajouter la catégorie détaillée dans les tags
  allTags.push(`catégorie:${classification.detailedCategory}`);
  
  return {
    name: recipe.name || 'Recette sans nom',
    category: classification.modelCategory,
    ingredients: normalizedIngredients,
    preparationSteps: recipe.preparationSteps || [],
    tags: [...new Set(allTags)], // Supprimer les doublons
    allergens: allergens,
    dietaryRestrictions: dietaryRestrictions,
    nutritionalProfile: recipe.nutrition || {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    },
    texture: 'normale'
  };
}

/**
 * Fonction principale
 */
async function inject365RecipesToMongo(jsonPath) {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses');
    console.log('✅ Connecté à MongoDB');
    
    // Lire les recettes
    console.log('\n📖 Lecture des recettes...');
    const recipesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ ${recipesData.length} recettes chargées`);
    
    // Normaliser et classifier
    console.log('\n🔄 Normalisation et classification des recettes...');
    const normalizedRecipes = recipesData.map(normalizeRecipeForMongo);
    
    // Statistiques par catégorie
    const statsByCategory = {};
    normalizedRecipes.forEach(recipe => {
      // Extraire la catégorie détaillée depuis les tags
      const categoryTag = recipe.tags.find(t => t.startsWith('catégorie:'));
      const cat = categoryTag ? categoryTag.replace('catégorie:', '') : 'autre';
      statsByCategory[cat] = (statsByCategory[cat] || 0) + 1;
    });
    
    console.log('\n📊 Répartition par catégorie:');
    Object.entries(statsByCategory).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
      console.log(`  ${cat}: ${count}`);
    });
    
    // Vérifier les doublons
    console.log('\n🔍 Vérification des doublons...');
    const existingRecipes = await RecipeEnriched.find({}, { name: 1 }).lean();
    const existingNames = new Set(existingRecipes.map(r => r.name.toLowerCase()));
    
    const newRecipes = normalizedRecipes.filter(recipe => 
      !existingNames.has(recipe.name.toLowerCase())
    );
    
    console.log(`✅ ${newRecipes.length} nouvelles recettes à insérer (${normalizedRecipes.length - newRecipes.length} doublons ignorés)`);
    
    // Insérer par lots
    if (newRecipes.length > 0) {
      console.log('\n💾 Insertion dans MongoDB...');
      const batchSize = 50;
      let inserted = 0;
      
      for (let i = 0; i < newRecipes.length; i += batchSize) {
        const batch = newRecipes.slice(i, i + batchSize);
        await RecipeEnriched.insertMany(batch);
        inserted += batch.length;
        console.log(`  ${inserted}/${newRecipes.length} recettes insérées...`);
      }
      
      console.log(`\n✅ ${inserted} recettes insérées avec succès!`);
    } else {
      console.log('\n⚠️  Aucune nouvelle recette à insérer');
    }
    
    // Statistiques finales
    const totalRecipes = await RecipeEnriched.countDocuments();
    console.log(`\n📊 Total de recettes dans MongoDB: ${totalRecipes}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    await mongoose.disconnect();
    throw error;
  }
}

// Exécution si appelé directement
const isMainModule = import.meta.url === `file://${process.argv[1]}` || 
                     process.argv[1]?.includes('inject-365-recipes-to-mongo');

if (isMainModule || process.argv[1]?.includes('inject-365-recipes-to-mongo')) {
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'data', '365-receipts-recipes.json');
  
  inject365RecipesToMongo(jsonPath)
    .then(() => {
      console.log('\n✅ Injection terminée!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });
}

export default inject365RecipesToMongo;

