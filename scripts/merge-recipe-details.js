import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function mergeRecipeDetails() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    const db = mongoose.connection.db;
    const oldCollection = db.collection('recipes');
    const newCollection = db.collection('recipeenricheds');
    
    // Récupérer toutes les recettes
    const oldRecipes = await oldCollection.find({}).toArray();
    const newRecipes = await newCollection.find({}).toArray();
    
    console.log(`📊 Collection 'recipes': ${oldRecipes.length} recettes`);
    console.log(`📊 Collection 'recipeenricheds': ${newRecipes.length} recettes\n`);

    // Créer une map des nouvelles recettes par nom
    const newRecipesMap = new Map();
    newRecipes.forEach(recipe => {
      const key = recipe.name?.trim().toLowerCase();
      if (key) {
        newRecipesMap.set(key, recipe);
      }
    });

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    console.log("🔄 Début de la fusion des données...\n");

    for (const oldRecipe of oldRecipes) {
      try {
        const title = oldRecipe.title?.trim();
        if (!title) continue;

        const key = title.toLowerCase();
        const newRecipe = newRecipesMap.get(key);

        if (!newRecipe) {
          console.log(`⚠️  Recette non trouvée dans recipeenricheds: ${title}`);
          skipped++;
          continue;
        }

        // Préparer les mises à jour
        const updates = {};
        let hasUpdates = false;

        // 1. Enrichir les instructions si manquantes ou vides
        if (oldRecipe.instructions && oldRecipe.instructions.length > 0) {
          if (!newRecipe.preparationSteps || newRecipe.preparationSteps.length === 0) {
            updates.preparationSteps = oldRecipe.instructions;
            hasUpdates = true;
          }
        }

        // 2. Ajouter une description si manquante
        if (oldRecipe.description && !newRecipe.description) {
          updates.description = oldRecipe.description;
          hasUpdates = true;
        }

        // 3. Enrichir les ingrédients si plus détaillés dans oldRecipe
        if (oldRecipe.ingredients && oldRecipe.ingredients.length > 0) {
          if (!newRecipe.ingredients || newRecipe.ingredients.length === 0) {
            // Convertir le format des ingrédients
            updates.ingredients = oldRecipe.ingredients.map(ing => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit
            }));
            hasUpdates = true;
          }
        }

        // 4. Ajouter le nombre de portions
        if (oldRecipe.servings && !newRecipe.portions) {
          updates.portions = oldRecipe.servings;
          hasUpdates = true;
        }

        // 5. Mettre à jour les allergènes si plus complets
        if (oldRecipe.allergens && oldRecipe.allergens.length > 0) {
          if (!newRecipe.allergens || newRecipe.allergens.length === 0) {
            updates.allergens = oldRecipe.allergens;
            hasUpdates = true;
          }
        }

        // 6. Ajouter les tags/hashtags
        if (oldRecipe.tags && oldRecipe.tags.length > 0) {
          if (!newRecipe.hashtags) {
            updates.hashtags = oldRecipe.tags.map(tag => `#${tag.replace(/^#/, '')}`);
            hasUpdates = true;
          }
        }

        // 7. Enrichir le profil nutritionnel si meilleur
        if (oldRecipe.nutrition) {
          const oldNutrition = oldRecipe.nutrition;
          const newNutrition = newRecipe.nutritionalProfile || {};
          
          // Vérifier si les données de oldRecipe sont meilleures
          const oldHasData = oldNutrition.calories > 0 || oldNutrition.proteins > 0;
          const newHasData = newNutrition.kcal > 0 || newNutrition.protein > 0;
          
          if (oldHasData && !newHasData) {
            updates.nutritionalProfile = {
              kcal: oldNutrition.calories || 0,
              protein: oldNutrition.proteins || 0,
              carbs: oldNutrition.carbs || 0,
              lipids: oldNutrition.fats || 0,
              fiber: newNutrition.fiber || 0,
              sodium: newNutrition.sodium || 0
            };
            hasUpdates = true;
          }
        }

        // 8. Ajouter le ageGroup s'il manque
        if (oldRecipe.ageGroup && oldRecipe.ageGroup.min !== undefined && oldRecipe.ageGroup.max !== undefined) {
          if (!newRecipe.ageGroup || !newRecipe.ageGroup.min || !newRecipe.ageGroup.max) {
            updates.ageGroup = {
              min: oldRecipe.ageGroup.min,
              max: oldRecipe.ageGroup.max
            };
            hasUpdates = true;
          }
        }

        // 9. Ajouter les restrictions diététiques
        if (oldRecipe.dietaryRestrictions && oldRecipe.dietaryRestrictions.length > 0) {
          const currentDiet = newRecipe.diet || [];
          const newDiet = [...new Set([...currentDiet, ...oldRecipe.dietaryRestrictions])];
          if (newDiet.length > currentDiet.length) {
            updates.diet = newDiet;
            hasUpdates = true;
          }
        }

        // 10. Ajouter les conditions médicales/pathologies
        if (oldRecipe.medicalConditions && oldRecipe.medicalConditions.length > 0) {
          const currentPathologies = newRecipe.pathologies || [];
          const newPathologies = [...new Set([...currentPathologies, ...oldRecipe.medicalConditions])];
          if (newPathologies.length > currentPathologies.length) {
            updates.pathologies = newPathologies;
            hasUpdates = true;
          }
        }

        // 11. Mettre à jour la texture si plus précise
        if (oldRecipe.texture && oldRecipe.texture !== 'normale') {
          if (!newRecipe.texture || newRecipe.texture === 'normale') {
            updates.texture = oldRecipe.texture;
            hasUpdates = true;
          }
        }

        // Appliquer les mises à jour
        if (hasUpdates) {
          await newCollection.updateOne(
            { _id: newRecipe._id },
            { $set: updates }
          );
          
          console.log(`✅ ${title}`);
          const updatesList = Object.keys(updates).join(', ');
          console.log(`   Mis à jour: ${updatesList}`);
          updated++;
        } else {
          skipped++;
        }

      } catch (error) {
        console.error(`❌ Erreur pour "${oldRecipe.title}":`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ DE LA FUSION");
    console.log("=".repeat(60));
    console.log(`✅ Recettes enrichies: ${updated}`);
    console.log(`⏭️  Recettes déjà complètes: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log("=".repeat(60));

    // Vérification finale
    console.log("\n🔍 Vérification post-fusion...");
    const enrichedRecipes = await newCollection.find({}).toArray();
    
    const withInstructions = enrichedRecipes.filter(r => 
      r.preparationSteps && r.preparationSteps.length > 0
    ).length;
    
    const withIngredients = enrichedRecipes.filter(r => 
      r.ingredients && r.ingredients.length > 0
    ).length;

    const withAgeGroup = enrichedRecipes.filter(r => 
      r.ageGroup && r.ageGroup.min !== undefined && r.ageGroup.max !== undefined
    ).length;
    
    console.log(`\n📈 Statistiques finales de 'recipeenricheds':`);
    console.log(`   - Avec instructions: ${withInstructions}/${enrichedRecipes.length} (${Math.round(withInstructions/enrichedRecipes.length*100)}%)`);
    console.log(`   - Avec ingrédients: ${withIngredients}/${enrichedRecipes.length} (${Math.round(withIngredients/enrichedRecipes.length*100)}%)`);
    console.log(`   - Avec ageGroup: ${withAgeGroup}/${enrichedRecipes.length} (${Math.round(withAgeGroup/enrichedRecipes.length*100)}%)`);

    if (updated > 0) {
      console.log("\n✅ Fusion terminée avec succès !");
      console.log("💡 Vous pouvez maintenant supprimer la collection 'recipes' en toute sécurité.");
    }

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Fusion des détails de 'recipes' vers 'recipeenricheds'...\n");
mergeRecipeDetails();

