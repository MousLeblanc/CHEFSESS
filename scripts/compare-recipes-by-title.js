import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function compareRecipesByTitle() {
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
    
    console.log(`📊 Collection 'recipes': ${oldRecipes.length} recettes (champ: title)`);
    console.log(`📊 Collection 'recipeenricheds': ${newRecipes.length} recettes (champ: name)\n`);

    // Créer des maps pour comparaison
    // Pour newRecipes, utiliser 'name'
    const newRecipesMap = new Map();
    newRecipes.forEach(recipe => {
      const key = recipe.name?.trim().toLowerCase();
      if (key) {
        newRecipesMap.set(key, recipe);
      }
    });

    // Trouver les recettes manquantes
    // Pour oldRecipes, utiliser 'title'
    const missingRecipes = [];
    const presentRecipes = [];

    for (const oldRecipe of oldRecipes) {
      const title = oldRecipe.title?.trim();
      
      if (!title) {
        continue;
      }
      
      const key = title.toLowerCase();
      
      if (newRecipesMap.has(key)) {
        presentRecipes.push({ old: oldRecipe, new: newRecipesMap.get(key) });
      } else {
        missingRecipes.push(oldRecipe);
      }
    }

    console.log("=".repeat(60));
    console.log("📋 RÉSULTAT DE LA COMPARAISON");
    console.log("=".repeat(60));
    console.log(`✅ Recettes présentes dans les deux collections: ${presentRecipes.length}`);
    console.log(`❌ Recettes présentes uniquement dans 'recipes': ${missingRecipes.length}`);
    console.log("=".repeat(60));

    if (presentRecipes.length > 0) {
      console.log(`\n📊 Exemples de correspondances (5 premiers):`);
      presentRecipes.slice(0, 5).forEach(({ old, new: newR }, idx) => {
        console.log(`\n${idx + 1}. "${old.title}"`);
        console.log(`   recipes: type=${old.type}, mealComponent=${old.mealComponent}`);
        console.log(`   recipeenricheds: category=${newR.category}, texture=${newR.texture}`);
      });
    }

    if (missingRecipes.length > 0) {
      console.log(`\n\n❌ Recettes manquantes dans 'recipeenricheds' (${missingRecipes.length} recettes):`);
      console.log("=".repeat(60));
      
      // Grouper par type
      const byType = {};
      missingRecipes.forEach(r => {
        const type = r.type || 'undefined';
        if (!byType[type]) byType[type] = [];
        byType[type].push(r);
      });

      Object.entries(byType).forEach(([type, recipes]) => {
        console.log(`\n📂 Type: ${type} (${recipes.length} recettes)`);
        recipes.forEach((recipe, idx) => {
          console.log(`   ${idx + 1}. ${recipe.title}`);
          if (idx === 0) {
            // Afficher les détails de la première pour exemple
            console.log(`      - Description: ${recipe.description?.substring(0, 80)}...`);
            console.log(`      - MealComponent: ${recipe.mealComponent}`);
            console.log(`      - Texture: ${recipe.texture}`);
            console.log(`      - Ingrédients: ${recipe.ingredients?.length || 0} items`);
          }
        });
      });
      
      console.log("\n" + "=".repeat(60));
      console.log("⚠️  ATTENTION: Ces recettes seraient perdues si vous supprimez 'recipes'");
      console.log("=".repeat(60));
      console.log("\n💡 Recommandation: Copier ces recettes dans 'recipeenricheds' avant suppression");
      
    } else {
      console.log("\n✅ SÉCURISÉ: Toutes les recettes de 'recipes' sont présentes dans 'recipeenricheds'");
      console.log("   Vous pouvez supprimer la collection 'recipes' en toute sécurité.");
    }

    // Statistiques qualité
    console.log("\n" + "=".repeat(60));
    console.log("📊 COMPARAISON QUALITÉ DES DONNÉES");
    console.log("=".repeat(60));
    
    // Compter les recettes avec instructions détaillées
    const oldWithInstructions = oldRecipes.filter(r => 
      r.instructions && r.instructions.length > 0
    ).length;
    
    const newWithInstructions = newRecipes.filter(r => 
      r.preparationSteps && r.preparationSteps.length > 0
    ).length;
    
    console.log(`\nRecettes avec instructions:`);
    console.log(`  - 'recipes': ${oldWithInstructions}/${oldRecipes.length} (${Math.round(oldWithInstructions/oldRecipes.length*100)}%)`);
    console.log(`  - 'recipeenricheds': ${newWithInstructions}/${newRecipes.length} (${Math.round(newWithInstructions/newRecipes.length*100)}%)`);

    // Comparer les ingrédients détaillés
    const oldWithIngredients = oldRecipes.filter(r => 
      r.ingredients && r.ingredients.length > 0
    ).length;
    
    const newWithIngredients = newRecipes.filter(r => 
      r.ingredients && r.ingredients.length > 0
    ).length;
    
    console.log(`\nRecettes avec ingrédients:`);
    console.log(`  - 'recipes': ${oldWithIngredients}/${oldRecipes.length} (${Math.round(oldWithIngredients/oldRecipes.length*100)}%)`);
    console.log(`  - 'recipeenricheds': ${newWithIngredients}/${newRecipes.length} (${Math.round(newWithIngredients/newRecipes.length*100)}%)`);

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🔍 Comparaison des recettes par title vs name...\n");
compareRecipesByTitle();

