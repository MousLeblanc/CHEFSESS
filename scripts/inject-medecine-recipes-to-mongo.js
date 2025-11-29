// scripts/inject-medecine-recipes-to-mongo.js
// Script pour injecter les recettes médicales dans MongoDB classées par catégories
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
 * Classifier la recette médicale par catégorie
 */
function classifyMedicineRecipe(recipe) {
  const name = (recipe.name || '').toLowerCase();
  const tags = (recipe.tags || []).map(t => t.toLowerCase());
  const allTags = tags.join(' ');
  
  // Boisson / Juice
  if (tags.includes('#juice') || tags.includes('#beverage') || name.includes('juice')) {
    return {
      detailedCategory: 'boisson',
      modelCategory: 'boisson',
      tags: ['#boisson', '#juice', '#médical']
    };
  }
  
  // Smoothie
  if (tags.includes('#smoothie') || name.includes('smoothie')) {
    return {
      detailedCategory: 'boisson',
      modelCategory: 'boisson',
      tags: ['#boisson', '#smoothie', '#médical']
    };
  }
  
  // Thé
  if (tags.includes('#tea') || name.includes('tea')) {
    return {
      detailedCategory: 'boisson',
      modelCategory: 'boisson',
      tags: ['#boisson', '#tea', '#médical']
    };
  }
  
  // Soupe
  if (tags.includes('#soup') || name.includes('soup') || name.includes('broth')) {
    return {
      detailedCategory: 'soupe',
      modelCategory: 'soupe',
      tags: ['#soupe', '#médical']
    };
  }
  
  // Salade
  if (tags.includes('#salad') || name.includes('salad')) {
    return {
      detailedCategory: 'salade',
      modelCategory: 'accompagnement',
      tags: ['#salade', '#médical']
    };
  }
  
  // Dessert
  if (tags.includes('#dessert') || name.includes('cake') || name.includes('pudding') || name.includes('dessert')) {
    return {
      detailedCategory: 'dessert',
      modelCategory: 'dessert',
      tags: ['#dessert', '#médical']
    };
  }
  
  // Plat principal (par défaut)
  return {
    detailedCategory: 'plat',
    modelCategory: 'plat',
    tags: ['#plat', '#médical']
  };
}

/**
 * Normaliser les ingrédients pour MongoDB
 */
function normalizeIngredients(ingredients) {
  return ingredients.map(ing => {
    // Nettoyer le nom de l'ingrédient
    let name = (ing.name || '').trim();
    
    // Extraire la quantité et l'unité si elles sont dans le nom
    const quantityMatch = name.match(/^(\d+(?:\/\d+)?(?:\s*-\s*\d+)?)\s*/);
    if (quantityMatch) {
      name = name.replace(quantityMatch[0], '').trim();
    }
    
    // Nettoyer les unités communes
    name = name.replace(/\b(cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|clove|cloves|piece|pieces|slice|slices|handful|handfuls|bunch|bunches|stalk|stalks|head|heads|can|cans|package|packages|of)\b/gi, '').trim();
    
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
    'gluten': ['flour', 'wheat', 'bread', 'pasta', 'noodles', 'semolina', 'couscous', 'barley', 'rye', 'oats'],
    'lactose': ['milk', 'cream', 'cheese', 'butter', 'yogurt', 'yoghurt', 'dairy', 'parmesan', 'mozzarella'],
    'oeufs': ['egg', 'eggs', 'mayonnaise', 'mayo'],
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
  const classification = classifyMedicineRecipe(recipe);
  const normalizedIngredients = normalizeIngredients(recipe.ingredients || []);
  const allergens = detectAllergens(recipe);
  const dietaryRestrictions = determineDietaryRestrictions(recipe);
  
  // Combiner les tags existants avec les tags de classification
  const allTags = [...(recipe.tags || []), ...classification.tags];
  
  // Ajouter les tags médicaux/thérapeutiques
  const medicalTags = (recipe.tags || []).filter(t => 
    t.includes('#cancer') || 
    t.includes('#immune') || 
    t.includes('#anti-inflammatory') || 
    t.includes('#antioxidant') ||
    t.includes('#detox') ||
    t.includes('#turmeric') ||
    t.includes('#blueberry') ||
    t.includes('#broccoli') ||
    t.includes('#garlic') ||
    t.includes('#ginger')
  );
  
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
async function injectMedicineRecipesToMongo(jsonPath) {
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
                     process.argv[1]?.includes('inject-medecine-recipes-to-mongo');

if (isMainModule || process.argv[1]?.includes('inject-medecine-recipes-to-mongo')) {
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'data', 'medecin-receipt-recipes.json');
  
  injectMedicineRecipesToMongo(jsonPath)
    .then(() => {
      console.log('\n✅ Injection terminée!');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Erreur:', error.message);
      process.exit(1);
    });
}

export default injectMedicineRecipesToMongo;

