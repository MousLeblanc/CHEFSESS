// scripts/inject-italian2-kitchen-recipes-to-mongo.js
// Script pour injecter les recettes Italian2 Kitchen dans MongoDB
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
 * Vérifier si un nom de recette est correct
 */
function isValidRecipeName(name) {
  if (!name || name.length < 3) {
    return false;
  }
  
  // Rejeter les noms qui se terminent par un point seul (fragments)
  if (name.match(/^[A-Z]+\.$/)) {
    return false;
  }
  
  // Rejeter les noms qui sont juste des ingrédients ou des mots isolés
  if (name.match(/^(NERVITT|Parmigiano Reggiano|Reggiano|Parmigiano)$/i)) {
    return false;
  }
  
  // Rejeter les noms qui contiennent des fragments évidents
  if (name.match(/\.\s*[A-Z]/) && name.split('.').length > 2) {
    // Si le nom contient plusieurs points suivis de majuscules, c'est probablement un fragment
    const parts = name.split('.');
    if (parts.length > 2 && parts[parts.length - 1].trim().length < 5) {
      return false;
    }
  }
  
  return true;
}

/**
 * Normaliser les ingrédients pour MongoDB
 */
function normalizeIngredients(ingredients) {
  return ingredients.map(ing => {
    // Nettoyer le nom de l'ingrédient
    let name = (ing.name || '').trim();
    
    // Extraire la quantité et l'unité si elles sont dans le nom
    const quantityMatch = name.match(/^(\d+(?:\/\d+)?(?:\s*&\s*\d+\/\d+)?(?:\s*-\s*\d+)?)\s*/);
    if (quantityMatch) {
      name = name.replace(quantityMatch[0], '').trim();
    }
    
    // Nettoyer les unités communes
    name = name.replace(/\b(cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|clove|cloves|piece|pieces|slice|slices|handful|handfuls|bunch|bunches|stalk|stalks|head|heads|can|cans|package|packages|of|purified|coarse|minced|chopped|sliced|diced|peeled|washed|seeded|trimmed|fresh|dried|frozen|thawed|drained|softened|grated|shredded|cubed|finely|coarsely)\b/gi, '').trim();
    
    // Nettoyer les parenthèses et leurs contenus
    name = name.replace(/\([^)]*\)/g, '').trim();
    
    // Nettoyer les virgules en fin
    name = name.replace(/[,\\.;:!?]+$/, '').trim();
    
    return {
      name: name || 'ingrédient',
      quantity: ing.quantity || '',
      unit: ing.unit || ''
    };
  }).filter(ing => ing.name && ing.name.length > 1);
}

/**
 * Normaliser une recette pour MongoDB
 */
function normalizeRecipeForMongo(recipe) {
  const normalizedIngredients = normalizeIngredients(recipe.ingredients || []);
  
  // Mapper les catégories au format Chef SES
  const categoryMap = {
    'petit-dejeuner': 'petit-déjeuner',
    'entree': 'entrée',
    'dessert': 'dessert',
    'soupe': 'soupe',
    'accompagnement': 'accompagnement',
    'boisson': 'boisson',
    'plat': 'plat'
  };
  
  const modelCategory = categoryMap[recipe.category] || 'plat';
  
  // Combiner les tags existants
  const allTags = [...(recipe.tags || [])];
  
  // Ajouter la catégorie dans les tags
  allTags.push(`catégorie:${modelCategory}`);
  
  // Ajouter les informations de temps dans les tags si nécessaire
  if (recipe.preparationTime || recipe.cookingTime) {
    if (recipe.preparationTime) allTags.push(`préparation:${recipe.preparationTime}min`);
    if (recipe.cookingTime) allTags.push(`cuisson:${recipe.cookingTime}min`);
  }
  
  return {
    name: recipe.name || 'Recette sans nom',
    category: modelCategory,
    ingredients: normalizedIngredients,
    preparationSteps: recipe.preparationSteps || [],
    tags: [...new Set(allTags)], // Supprimer les doublons
    allergens: recipe.allergens || [],
    dietaryRestrictions: recipe.dietaryRestrictions || [],
    nutritionalProfile: recipe.nutrition || {
      calories: 0,
      proteins: 0,
      carbs: 0,
      lipids: 0,
      fibers: 0,
      sodium: 0
    },
    texture: recipe.texture || 'normale',
    establishmentTypes: recipe.establishmentTypes || ['restaurant', 'cantine_scolaire', 'ehpad', 'hopital'],
    compatibleFor: recipe.compatibleFor || [],
    aiCompatibilityScore: recipe.aiCompatibilityScore || 1.0
  };
}

/**
 * Fonction principale
 */
async function injectItalian2KitchenRecipesToMongo(jsonPath) {
  try {
    console.log('🔌 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');
    
    // Lire les recettes
    console.log('\n📖 Lecture des recettes...');
    const recipesData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    console.log(`✅ ${recipesData.length} recettes chargées`);
    
    // Normaliser et classifier
    console.log('\n🔄 Normalisation et classification des recettes...');
    const normalizedRecipes = recipesData.map(normalizeRecipeForMongo);
    
    // Filtrer les recettes avec des noms corrects
    console.log('\n🔍 Filtrage des recettes avec des noms corrects...');
    const validRecipes = normalizedRecipes.filter(recipe => {
      const isValid = isValidRecipeName(recipe.name);
      if (!isValid) {
        console.log(`  ⚠️  Recette ignorée (nom incorrect): "${recipe.name}"`);
      }
      return isValid;
    });
    
    console.log(`✅ ${validRecipes.length} recettes avec des noms corrects (${normalizedRecipes.length - validRecipes.length} recettes ignorées)`);
    
    // Statistiques par catégorie
    const statsByCategory = {};
    validRecipes.forEach(recipe => {
      const cat = recipe.category || 'autre';
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
    
    const newRecipes = validRecipes.filter(recipe => 
      !existingNames.has(recipe.name.toLowerCase())
    );
    
    console.log(`✅ ${newRecipes.length} nouvelles recettes à insérer (${validRecipes.length - newRecipes.length} doublons ignorés)`);
    
    // Insérer par lots
    if (newRecipes.length > 0) {
      const batchSize = 50;
      let inserted = 0;
      
      for (let i = 0; i < newRecipes.length; i += batchSize) {
        const batch = newRecipes.slice(i, i + batchSize);
        await RecipeEnriched.insertMany(batch, { ordered: false });
        inserted += batch.length;
        console.log(`  ✅ Lot ${Math.floor(i / batchSize) + 1}: ${batch.length} recettes insérées (${inserted}/${newRecipes.length})`);
      }
      
      console.log(`\n✅ ${inserted} recettes Italian2 Kitchen injectées avec succès!`);
    } else {
      console.log('\n⚠️  Aucune nouvelle recette à insérer (toutes existent déjà)');
    }
    
    // Statistiques finales
    const totalRecipes = await RecipeEnriched.countDocuments();
    console.log(`\n📊 Total de recettes dans la base: ${totalRecipes}`);
    
    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur lors de l\'injection:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${path.resolve(process.argv[1])}` || 
    import.meta.url.endsWith(process.argv[1].replace(/\\/g, '/'))) {
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'data', 'italian2-kitchen-recipes.json');
  
  injectItalian2KitchenRecipesToMongo(jsonPath)
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default injectItalian2KitchenRecipesToMongo;


