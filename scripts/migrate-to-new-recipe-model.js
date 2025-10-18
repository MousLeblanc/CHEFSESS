import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import Recipe from '../recipe.model.js'; // Ancien modèle
import RecipeEnriched from '../models/Recipe.js'; // Nouveau modèle

async function migrateRecipes() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/chef-ses';
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB');

    // Récupérer toutes les recettes de l'ancien modèle
    const oldRecipes = await Recipe.find({});
    console.log(`📚 ${oldRecipes.length} recettes à migrer`);

    let migratedCount = 0;
    let skippedCount = 0;

    for (const oldRecipe of oldRecipes) {
      try {
        // Vérifier si la recette existe déjà dans le nouveau modèle
        const existingRecipe = await RecipeEnriched.findOne({ name: oldRecipe.title });
        if (existingRecipe) {
          console.log(`⏭️  Recette existante ignorée: ${oldRecipe.title}`);
          skippedCount++;
          continue;
        }

        // Mapper l'ancien modèle vers le nouveau
        const newRecipeData = {
          name: oldRecipe.title || 'Recette sans nom',
          category: mapCategory(oldRecipe.category),
          establishmentType: mapEstablishmentType(oldRecipe.establishmentType),
          texture: mapTexture(oldRecipe.texture),
          diet: mapDiet(oldRecipe.dietaryRestrictions),
          pathologies: mapPathologies(oldRecipe.medicalConditions),
          allergens: oldRecipe.allergens || [],
          nutritionalProfile: {
            kcal: oldRecipe.nutrition?.calories || 0,
            protein: oldRecipe.nutrition?.proteins || 0,
            lipids: oldRecipe.nutrition?.fats || 0,
            carbs: oldRecipe.nutrition?.carbs || 0,
            fiber: oldRecipe.nutrition?.fiber || 0,
            sodium: oldRecipe.nutrition?.sodium || 0
          },
          ingredients: oldRecipe.ingredients || [],
          preparationSteps: oldRecipe.instructions || [],
          compatibleFor: generateCompatibleFor(oldRecipe),
          aiCompatibilityScore: 1.0
        };

        const newRecipe = new RecipeEnriched(newRecipeData);
        await newRecipe.save();
        console.log(`✅ Migré: ${newRecipe.name}`);
        migratedCount++;

      } catch (error) {
        console.error(`❌ Erreur migration ${oldRecipe.title}:`, error.message);
      }
    }

    console.log(`\n📊 Résumé de la migration:`);
    console.log(`✅ ${migratedCount} recettes migrées`);
    console.log(`⏭️  ${skippedCount} recettes déjà existantes`);
    console.log(`📚 Total dans le nouveau modèle: ${await RecipeEnriched.countDocuments()}`);

  } catch (error) {
    console.error('❌ Erreur migration:', error);
  } finally {
    await mongoose.connection.close();
  }
}

function mapCategory(category) {
  const mapping = {
    'entree': 'entrée',
    'plat': 'plat',
    'dessert': 'dessert',
    'petit-dejeuner': 'petit-déjeuner'
  };
  return mapping[category] || 'plat';
}

function mapEstablishmentType(establishmentType) {
  if (Array.isArray(establishmentType)) {
    return establishmentType;
  }
  return establishmentType ? [establishmentType] : ['collectivite'];
}

function mapTexture(texture) {
  const mapping = {
    'normale': 'normale',
    'hachée': 'hachée',
    'mixée': 'mixée',
    'lisse': 'lisse',
    'liquide': 'liquide'
  };
  return mapping[texture] || 'normale';
}

function mapDiet(dietaryRestrictions) {
  if (!dietaryRestrictions || !Array.isArray(dietaryRestrictions)) {
    return [];
  }
  
  const mapping = {
    'sans_sel': 'sans sel ajouté',
    'pauvre_en_sucre': 'hypocalorique',
    'pauvre_en_graisse': 'hypolipidique',
    'vegetarien': 'végétarien',
    'vegan': 'végétalien',
    'sans_gluten': 'sans gluten',
    'sans_lactose': 'sans lactose'
  };

  return dietaryRestrictions.map(restriction => 
    mapping[restriction] || restriction
  );
}

function mapPathologies(medicalConditions) {
  if (!medicalConditions || !Array.isArray(medicalConditions)) {
    return [];
  }
  
  const mapping = {
    'diabete': 'diabète',
    'diabete_type1': 'diabète type 1',
    'diabete_type2': 'diabète type 2',
    'hypertension': 'hypertension',
    'insuffisance_renale': 'insuffisance rénale',
    'cholesterol': 'hypercholestérolémie',
    'dysphagie': 'dysphagie',
    'alzheimer': 'alzheimer',
    'parkinson': 'parkinson'
  };

  return medicalConditions.map(condition => 
    mapping[condition] || condition
  );
}

function generateCompatibleFor(recipe) {
  const compatible = [];
  
  // Ajouter les textures
  if (recipe.texture) {
    compatible.push(recipe.texture);
  }
  
  // Ajouter les régimes
  if (recipe.dietaryRestrictions) {
    compatible.push(...recipe.dietaryRestrictions);
  }
  
  // Ajouter les pathologies
  if (recipe.medicalConditions) {
    compatible.push(...recipe.medicalConditions);
  }
  
  // Ajouter des tags génériques selon le type d'établissement
  if (recipe.establishmentType === 'maison_retraite' || recipe.establishmentType === 'ehpad') {
    compatible.push('senior', 'facile_mastication');
  }
  
  return [...new Set(compatible)]; // Supprimer les doublons
}

migrateRecipes();
