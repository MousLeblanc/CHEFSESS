// scripts/inject-dysphagies-recipes-to-mongo.js
// Injection des recettes dysphagies dans MongoDB au format Chef SES

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// Importer le modèle Recipe
const Recipe = (await import('../models/Recipe.js')).default;

// Fonction pour normaliser les ingrédients
function normalizeIngredients(ingredients) {
  if (!Array.isArray(ingredients)) {
    return [];
  }

  return ingredients.map(ing => {
    if (typeof ing === 'string') {
      return {
        name: ing.trim(),
        quantity: null,
        unit: null
      };
    }
    return {
      name: ing.name ? ing.name.trim() : '',
      quantity: ing.quantity || null,
      unit: ing.unit || null
    };
  }).filter(ing => ing.name && ing.name.length > 0);
}

// Fonction pour normaliser une recette pour MongoDB
function normalizeRecipeForMongo(recipe) {
  // Mapper la texture : "purée" -> "mixée" (pour dysphagie IDDSI Level 4)
  const textureMap = {
    'purée': 'mixée',
    'puree': 'mixée',
    'puré': 'mixée'
  };
  const texture = textureMap[recipe.texture?.toLowerCase()] || 'mixée';

  // Mapper les establishmentTypes aux valeurs valides
  const validEstablishmentTypes = ['cantine_scolaire', 'ehpad', 'hopital', 'cantine_entreprise'];
  const establishmentTypes = (recipe.establishmentTypes || ['ehpad'])
    .filter(et => validEstablishmentTypes.includes(et))
    .length > 0 
      ? (recipe.establishmentTypes || ['ehpad']).filter(et => validEstablishmentTypes.includes(et))
      : ['ehpad'];

  // Mapper le diet (doit être un tableau)
  let diet = [];
  if (recipe.diet) {
    if (Array.isArray(recipe.diet)) {
      diet = recipe.diet;
    } else if (recipe.diet !== 'standard') {
      diet = [recipe.diet];
    }
  }

  return {
    name: recipe.name.trim(),
    category: recipe.category.toLowerCase(),
    establishmentTypes: establishmentTypes,
    ageGroup: recipe.ageGroup?.min && recipe.ageGroup?.max 
      ? { min: recipe.ageGroup.min, max: recipe.ageGroup.max }
      : undefined, // Si pas d'âge spécifique, ne pas inclure le champ
    texture: texture,
    diet: diet,
    dietaryRestrictions: recipe.dietaryRestrictions || [],
    tags: recipe.tags || [],
    pathologies: recipe.pathologies || ['dysphagie'],
    allergens: recipe.allergens || [],
    nutritionalProfile: {
      kcal: recipe.nutritionalProfile?.kcal || undefined,
      protein: recipe.nutritionalProfile?.protein || undefined,
      lipids: recipe.nutritionalProfile?.lipids || undefined,
      carbs: recipe.nutritionalProfile?.carbs || undefined,
      fiber: recipe.nutritionalProfile?.fiber || undefined,
      sodium: recipe.nutritionalProfile?.sodium || undefined
    },
    ingredients: normalizeIngredients(recipe.ingredients),
    preparationSteps: Array.isArray(recipe.preparationSteps) 
      ? recipe.preparationSteps.map(step => step.trim()).filter(step => step.length > 0)
      : [],
    compatibleFor: recipe.compatibleFor || ['mixée', 'dysphagie'],
    aiCompatibilityScore: null
  };
}

// Fonction principale d'injection
async function injectDysphagiesRecipesToMongo() {
  try {
    // Connexion à MongoDB
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/chef-ses';
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(mongoURI);
    console.log('✅ Connecté à MongoDB\n');

    // Lire les recettes
    const recipesFile = path.join(__dirname, '../data/dysphagies-recipes.json');
    console.log(`📖 Lecture du fichier: ${recipesFile}`);
    const recipes = JSON.parse(fs.readFileSync(recipesFile, 'utf-8'));
    console.log(`📋 ${recipes.length} recettes trouvées\n`);

    // Normaliser les recettes
    console.log('🔄 Normalisation des recettes...');
    const normalizedRecipes = recipes.map(normalizeRecipeForMongo);
    console.log(`✅ ${normalizedRecipes.length} recettes normalisées\n`);

    // Vérifier les doublons et injecter
    let inserted = 0;
    let skipped = 0;
    let errors = 0;

    console.log('💾 Injection dans MongoDB...\n');

    for (let i = 0; i < normalizedRecipes.length; i++) {
      const recipe = normalizedRecipes[i];
      
      try {
        // Échapper les caractères spéciaux pour la regex (parenthèses, etc.)
        const escapedName = recipe.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        
        // Vérifier si la recette existe déjà (par nom)
        const existing = await Recipe.findOne({ 
          name: { $regex: new RegExp(`^${escapedName}$`, 'i') }
        });

        if (existing) {
          console.log(`⏭️  [${i + 1}/${normalizedRecipes.length}] "${recipe.name}" - Déjà présente, ignorée`);
          skipped++;
          continue;
        }

        // Créer et sauvegarder la recette
        const recipeDoc = new Recipe(recipe);
        await recipeDoc.save();
        
        console.log(`✅ [${i + 1}/${normalizedRecipes.length}] "${recipe.name}" - Injectée (${recipe.category})`);
        inserted++;

      } catch (error) {
        console.error(`❌ [${i + 1}/${normalizedRecipes.length}] Erreur pour "${recipe.name}":`, error.message);
        errors++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('\n📊 Résumé de l\'injection :\n');
    console.log(`  ✅ Injectées: ${inserted}`);
    console.log(`  ⏭️  Ignorées (doublons): ${skipped}`);
    console.log(`  ❌ Erreurs: ${errors}`);
    console.log(`  📋 Total: ${normalizedRecipes.length}\n`);

    // Fermer la connexion
    await mongoose.connection.close();
    console.log('🔌 Connexion MongoDB fermée\n');

  } catch (error) {
    console.error('❌ Erreur lors de l\'injection:', error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Exécuter l'injection
injectDysphagiesRecipesToMongo();

