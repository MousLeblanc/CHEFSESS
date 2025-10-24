import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function compareRecipeCollections() {
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
    
    console.log(`📊 Collection 'recipes' (ancienne): ${oldRecipes.length} recettes`);
    console.log(`📊 Collection 'recipeenricheds' (nouvelle): ${newRecipes.length} recettes\n`);

    // Créer des maps pour comparaison
    const newRecipesMap = new Map();
    newRecipes.forEach(recipe => {
      const key = recipe.name?.trim().toLowerCase();
      if (key) {
        newRecipesMap.set(key, recipe);
      }
    });

    // Trouver les recettes manquantes
    const missingRecipes = [];
    const presentRecipes = [];
    const oldRecipesWithoutName = [];

    for (const oldRecipe of oldRecipes) {
      const name = oldRecipe.name?.trim();
      
      if (!name) {
        oldRecipesWithoutName.push(oldRecipe);
        continue;
      }
      
      const key = name.toLowerCase();
      
      if (newRecipesMap.has(key)) {
        presentRecipes.push(oldRecipe);
      } else {
        missingRecipes.push(oldRecipe);
      }
    }

    console.log("=".repeat(60));
    console.log("📋 RÉSULTAT DE LA COMPARAISON");
    console.log("=".repeat(60));
    console.log(`✅ Recettes présentes dans les deux collections: ${presentRecipes.length}`);
    console.log(`❌ Recettes présentes uniquement dans 'recipes': ${missingRecipes.length}`);
    console.log(`⚠️  Recettes sans nom dans 'recipes': ${oldRecipesWithoutName.length}`);
    console.log("=".repeat(60));

    if (oldRecipesWithoutName.length > 0) {
      console.log(`\n⚠️  Recettes sans nom dans 'recipes':`);
      oldRecipesWithoutName.slice(0, 10).forEach((recipe, idx) => {
        console.log(`  ${idx + 1}. ID: ${recipe._id}, Category: ${recipe.category || 'N/A'}, Type: ${recipe.type || 'N/A'}`);
      });
      if (oldRecipesWithoutName.length > 10) {
        console.log(`  ... et ${oldRecipesWithoutName.length - 10} autres`);
      }
    }

    if (missingRecipes.length > 0) {
      console.log(`\n❌ Recettes manquantes dans 'recipeenricheds':`);
      missingRecipes.forEach((recipe, idx) => {
        console.log(`\n${idx + 1}. ${recipe.name}`);
        console.log(`   - Catégorie: ${recipe.category || 'N/A'}`);
        console.log(`   - Type d'établissement: ${recipe.establishmentType?.join(', ') || 'N/A'}`);
        console.log(`   - Texture: ${recipe.texture || 'N/A'}`);
        console.log(`   - ID: ${recipe._id}`);
        
        // Afficher les ingrédients s'ils existent
        if (recipe.ingredients && recipe.ingredients.length > 0) {
          console.log(`   - Ingrédients: ${recipe.ingredients.length} items`);
        }
        
        // Afficher les valeurs nutritionnelles
        if (recipe.nutritionalProfile) {
          const np = recipe.nutritionalProfile;
          console.log(`   - Nutrition: ${np.kcal || 0} kcal, ${np.protein || 0}g protéines`);
        }
      });
      
      console.log("\n" + "=".repeat(60));
      console.log("⚠️  ATTENTION: Des recettes seraient perdues si vous supprimez 'recipes'");
      console.log("=".repeat(60));
      
      // Proposer de copier les recettes manquantes
      console.log("\n💡 Options disponibles:");
      console.log("  1. Exécuter le script 'copy-missing-recipes.js' pour copier les recettes manquantes");
      console.log("  2. Vérifier manuellement les recettes manquantes");
      console.log("  3. Ne rien faire (ne pas supprimer 'recipes')");
      
    } else {
      console.log("\n✅ SÉCURISÉ: Toutes les recettes de 'recipes' sont présentes dans 'recipeenricheds'");
      console.log("   Vous pouvez supprimer la collection 'recipes' en toute sécurité.");
      
      // Analyser les recettes en plus dans newCollection
      const newRecipesOnlyMap = new Map();
      newRecipes.forEach(recipe => {
        const key = recipe.name?.trim().toLowerCase();
        if (key) {
          newRecipesOnlyMap.set(key, recipe);
        }
      });
      
      oldRecipes.forEach(recipe => {
        const key = recipe.name?.trim().toLowerCase();
        if (key && newRecipesOnlyMap.has(key)) {
          newRecipesOnlyMap.delete(key);
        }
      });
      
      console.log(`\n📈 Recettes supplémentaires dans 'recipeenricheds': ${newRecipesOnlyMap.size}`);
      console.log(`   (Ces recettes n'existaient pas dans l'ancienne collection)`);
    }

    // Statistiques supplémentaires
    console.log("\n" + "=".repeat(60));
    console.log("📊 STATISTIQUES DÉTAILLÉES");
    console.log("=".repeat(60));
    
    // Comparer les valeurs nutritionnelles
    let oldWithNutrition = 0;
    let newWithNutrition = 0;
    
    oldRecipes.forEach(r => {
      if (r.nutritionalProfile && (r.nutritionalProfile.kcal > 0 || r.nutritionalProfile.protein > 0)) {
        oldWithNutrition++;
      }
    });
    
    newRecipes.forEach(r => {
      if (r.nutritionalProfile && (r.nutritionalProfile.kcal > 0 || r.nutritionalProfile.protein > 0)) {
        newWithNutrition++;
      }
    });
    
    console.log(`Recettes avec données nutritionnelles:`);
    console.log(`  - 'recipes': ${oldWithNutrition}/${oldRecipes.length} (${Math.round(oldWithNutrition/oldRecipes.length*100)}%)`);
    console.log(`  - 'recipeenricheds': ${newWithNutrition}/${newRecipes.length} (${Math.round(newWithNutrition/newRecipes.length*100)}%)`);

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🔍 Comparaison des collections de recettes...\n");
compareRecipeCollections();

