// scripts/inject-noodles-recipes-to-mongo.js
// Script pour injecter les recettes Noodles dans MongoDB
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
 * Extraire la quantité numérique d'une chaîne
 */
function extractQuantity(quantityStr) {
  if (!quantityStr) return null;
  
  // Essayer de parser directement si c'est un nombre
  const num = parseFloat(quantityStr);
  if (!isNaN(num)) return num;
  
  // Essayer d'extraire un nombre d'une chaîne (ex: "1½" -> 1.5, "2-3" -> 2)
  const match = quantityStr.match(/(\d+)(?:[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?/);
  if (match) {
    let num = parseFloat(match[1]);
    const fraction = quantityStr.match(/[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]/);
    if (fraction) {
      const fractions = {
        '½': 0.5, '⅓': 0.333, '⅔': 0.667, '¼': 0.25, '¾': 0.75,
        '⅕': 0.2, '⅖': 0.4, '⅗': 0.6, '⅘': 0.8, '⅙': 0.167, '⅚': 0.833,
        '⅛': 0.125, '⅜': 0.375, '⅝': 0.625, '⅞': 0.875
      };
      num += fractions[fraction[0]] || 0;
    }
    return num;
  }
  
  return null;
}

/**
 * Normaliser les ingrédients pour MongoDB (format Chef SES)
 */
function normalizeIngredients(ingredients) {
  return ingredients.map(ing => {
    // Nettoyer le nom de l'ingrédient
    let name = (ing.name || '').trim();
    let quantity = null;
    let unit = '';
    
    // Extraire la quantité et l'unité si elles sont dans le nom
    // Format: "12 oz (340 g) dried rigatoni" ou "1½ tbsp (22 ml) extra-virgin olive oil"
    const quantityMatch = name.match(/^(\d+(?:\/\d+)?(?:\s*[½⅓⅔¼¾⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞])?(?:\s*-\s*\d+)?)\s*/);
    if (quantityMatch) {
      quantity = extractQuantity(quantityMatch[1]);
      name = name.replace(quantityMatch[0], '').trim();
    }
    
    // Extraire l'unité (oz, g, ml, tbsp, tsp, cup, etc.)
    const unitMatch = name.match(/^(oz|ounce|ounces|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|cup|cups|lb|pound|pounds|clove|cloves|piece|pieces|slice|slices|handful|handfuls|bunch|bunches|stalk|stalks|head|heads|can|cans|package|packages)\b/i);
    if (unitMatch) {
      unit = unitMatch[1].toLowerCase();
      name = name.replace(unitMatch[0], '').trim();
    }
    
    // Nettoyer les parenthèses et leurs contenus (ex: "(340 g)", "(jarred is ne)")
    name = name.replace(/\([^)]*\)/g, '').trim();
    
    // Nettoyer les unités communes restantes
    name = name.replace(/\b(cup|cups|tablespoon|tablespoons|teaspoon|teaspoons|tbsp|tsp|oz|ounce|ounces|lb|pound|pounds|g|gram|grams|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|clove|cloves|piece|pieces|slice|slices|handful|handfuls|bunch|bunches|stalk|stalks|head|heads|can|cans|package|packages|of|purified|coarse|minced|chopped|sliced|diced|peeled|washed|seeded|trimmed|fresh|dried|frozen|thawed|drained|softened|grated|shredded|cubed|finely|coarsely|nely|small|large|medium|divided)\b/gi, '').trim();
    
    // Nettoyer les virgules en fin
    name = name.replace(/[,\\.;:!?]+$/, '').trim();
    
    return {
      name: name || 'ingrédient',
      quantity: quantity !== null ? quantity : (ing.quantity ? parseFloat(ing.quantity) || null : null),
      unit: unit || ing.unit || ''
    };
  }).filter(ing => ing.name && ing.name.length > 1);
}

/**
 * Normaliser une recette pour MongoDB (format Chef SES)
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
  
  // Convertir le profil nutritionnel au format Chef SES
  const nutrition = recipe.nutrition || {};
  const nutritionalProfile = {
    kcal: nutrition.calories || nutrition.kcal || 0,
    protein: nutrition.proteins || nutrition.protein || 0,
    lipids: nutrition.lipids || 0,
    carbs: nutrition.carbs || 0,
    fiber: nutrition.fibers || nutrition.fiber || 0,
    sodium: nutrition.sodium || 0
  };
  
  // Normaliser les establishmentTypes selon l'enum Chef SES
  const validEstablishmentTypes = ['cantine_scolaire', 'ehpad', 'hopital', 'cantine_entreprise'];
  const establishmentTypes = (recipe.establishmentTypes || [])
    .filter(et => validEstablishmentTypes.includes(et));
  
  // Si aucun type valide, utiliser les valeurs par défaut
  if (establishmentTypes.length === 0) {
    establishmentTypes.push('cantine_scolaire', 'ehpad', 'hopital');
  }
  
  return {
    name: recipe.name || 'Recette sans nom',
    category: modelCategory,
    ingredients: normalizedIngredients,
    preparationSteps: recipe.preparationSteps || [],
    tags: [...new Set(allTags)], // Supprimer les doublons
    allergens: recipe.allergens || [],
    dietaryRestrictions: recipe.dietaryRestrictions || [],
    nutritionalProfile: nutritionalProfile,
    texture: recipe.texture || 'normale',
    establishmentTypes: establishmentTypes,
    compatibleFor: recipe.compatibleFor || [],
    aiCompatibilityScore: recipe.aiCompatibilityScore || 1.0
  };
}

/**
 * Fonction principale
 */
async function injectNoodlesRecipesToMongo(jsonPath) {
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
    
    // Statistiques par catégorie
    const statsByCategory = {};
    normalizedRecipes.forEach(recipe => {
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
    
    const newRecipes = normalizedRecipes.filter(recipe => 
      !existingNames.has(recipe.name.toLowerCase())
    );
    
    console.log(`✅ ${newRecipes.length} nouvelles recettes à insérer (${normalizedRecipes.length - newRecipes.length} doublons ignorés)`);
    
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
      
      console.log(`\n✅ ${inserted} recettes Noodles injectées avec succès!`);
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
  const jsonPath = process.argv[2] || path.join(__dirname, '..', 'data', 'noodles-recipes.json');
  
  injectNoodlesRecipesToMongo(jsonPath)
    .catch(error => {
      console.error('❌ Erreur:', error);
      process.exit(1);
    });
}

export default injectNoodlesRecipesToMongo;

