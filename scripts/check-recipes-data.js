import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import RecipeEnriched from "../models/Recipe.js";

async function checkRecipesData() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    // Vérifier toutes les recettes
    const allRecipes = await RecipeEnriched.find({});
    console.log(`📊 Total de recettes: ${allRecipes.length}\n`);

    // Vérifier les recettes avec ageGroup
    const recipesWithAgeGroup = allRecipes.filter(r => r.ageGroup);
    console.log(`🔍 Recettes avec ageGroup: ${recipesWithAgeGroup.length}`);
    if (recipesWithAgeGroup.length > 0) {
      console.log("\nExemples de recettes avec ageGroup:");
      recipesWithAgeGroup.slice(0, 5).forEach(r => {
        console.log(`  - ${r.name}: ageGroup = ${JSON.stringify(r.ageGroup)}`);
      });
    }

    // Vérifier les recettes avec données nutritionnelles à 0
    const recipesWithZeroNutrition = allRecipes.filter(r => {
      const np = r.nutritionalProfile;
      return np && (np.kcal === 0 || np.protein === 0 || np.carbs === 0 || np.fats === 0);
    });
    console.log(`\n⚠️  Recettes avec données nutritionnelles à 0: ${recipesWithZeroNutrition.length}`);
    
    if (recipesWithZeroNutrition.length > 0) {
      console.log("\nExemples:");
      recipesWithZeroNutrition.slice(0, 10).forEach(r => {
        const np = r.nutritionalProfile;
        console.log(`  - ${r.name}:`);
        console.log(`    kcal: ${np?.kcal || 0}, protein: ${np?.protein || 0}, carbs: ${np?.carbs || 0}, fats: ${np?.fats || np?.lipids || 0}`);
      });
    }

    // Vérifier les recettes sans données nutritionnelles
    const recipesWithoutNutrition = allRecipes.filter(r => {
      return !r.nutritionalProfile || Object.keys(r.nutritionalProfile).length === 0;
    });
    console.log(`\n❌ Recettes sans données nutritionnelles: ${recipesWithoutNutrition.length}`);

    // Vérifier les recettes avec données nutritionnelles complètes
    const recipesWithGoodNutrition = allRecipes.filter(r => {
      const np = r.nutritionalProfile;
      return np && np.kcal > 0 && np.protein > 0;
    });
    console.log(`\n✅ Recettes avec données nutritionnelles valides: ${recipesWithGoodNutrition.length}`);

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

checkRecipesData();

