import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import RecipeEnriched from "../models/Recipe.js";

async function generateFinalReport() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    const total = await RecipeEnriched.countDocuments();
    
    // Statistiques complètes
    const withDescription = await RecipeEnriched.countDocuments({
      description: { $exists: true, $ne: "", $ne: null }
    });
    
    const withSteps = await RecipeEnriched.countDocuments({
      preparationSteps: { $exists: true, $ne: [], $not: { $size: 0 } }
    });
    
    const withIngredients = await RecipeEnriched.countDocuments({
      ingredients: { $exists: true, $ne: [], $not: { $size: 0 } }
    });
    
    const withHashtags = await RecipeEnriched.countDocuments({
      hashtags: { $exists: true, $ne: [], $not: { $size: 0 } }
    });
    
    const withNutrition = await RecipeEnriched.countDocuments({
      "nutritionalProfile.kcal": { $exists: true, $gt: 0 }
    });
    
    const withAgeGroup = await RecipeEnriched.countDocuments({
      "ageGroup.min": { $exists: true },
      "ageGroup.max": { $exists: true }
    });
    
    const withPortions = await RecipeEnriched.countDocuments({
      portions: { $exists: true, $gt: 0 }
    });

    console.log("=".repeat(70));
    console.log("📊 RAPPORT FINAL - BASE DE DONNÉES RECETTES");
    console.log("=".repeat(70));
    console.log(`\n🗄️  TOTAL DE RECETTES: ${total}\n`);
    
    console.log("📋 COMPLÉTUDE DES DONNÉES:");
    console.log("-".repeat(70));
    console.log(`  ✅ Descriptions         : ${withDescription.toString().padStart(3)}/${total} (${Math.round(withDescription/total*100)}%)`);
    console.log(`  ✅ Instructions         : ${withSteps.toString().padStart(3)}/${total} (${Math.round(withSteps/total*100)}%)`);
    console.log(`  ✅ Ingrédients          : ${withIngredients.toString().padStart(3)}/${total} (${Math.round(withIngredients/total*100)}%)`);
    console.log(`  ✅ Hashtags             : ${withHashtags.toString().padStart(3)}/${total} (${Math.round(withHashtags/total*100)}%)`);
    console.log(`  ✅ Valeurs nutritionnel : ${withNutrition.toString().padStart(3)}/${total} (${Math.round(withNutrition/total*100)}%)`);
    console.log(`  ✅ Tranches d'âge (min-max): ${withAgeGroup.toString().padStart(3)}/${total} (${Math.round(withAgeGroup/total*100)}%)`);
    console.log(`  ✅ Nombre de portions   : ${withPortions.toString().padStart(3)}/${total} (${Math.round(withPortions/total*100)}%)`);
    
    // Statistiques par catégorie
    console.log("\n📂 RÉPARTITION PAR CATÉGORIE:");
    console.log("-".repeat(70));
    const categories = await RecipeEnriched.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    categories.forEach(cat => {
      console.log(`  ${cat._id.padEnd(20)}: ${cat.count.toString().padStart(3)} recettes`);
    });
    
    // Statistiques par texture
    console.log("\n🍽️  RÉPARTITION PAR TEXTURE:");
    console.log("-".repeat(70));
    const textures = await RecipeEnriched.aggregate([
      { $group: { _id: "$texture", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    textures.forEach(tex => {
      console.log(`  ${(tex._id || 'non spécifié').padEnd(20)}: ${tex.count.toString().padStart(3)} recettes`);
    });
    
    // Statistiques par établissement
    console.log("\n🏢 RÉPARTITION PAR TYPE D'ÉTABLISSEMENT:");
    console.log("-".repeat(70));
    const establishments = await RecipeEnriched.aggregate([
      { $unwind: { path: "$establishmentType", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$establishmentType", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    
    establishments.forEach(est => {
      console.log(`  ${(est._id || 'non spécifié').padEnd(20)}: ${est.count.toString().padStart(3)} recettes`);
    });
    
    // Exemple de recette complète
    console.log("\n📝 EXEMPLE DE RECETTE COMPLÈTE:");
    console.log("-".repeat(70));
    const example = await RecipeEnriched.findOne({
      description: { $exists: true, $ne: "", $ne: null },
      preparationSteps: { $exists: true, $ne: [], $not: { $size: 0 } },
      ingredients: { $exists: true, $ne: [], $not: { $size: 0 } },
      hashtags: { $exists: true, $ne: [], $not: { $size: 0 } }
    });
    
    if (example) {
      console.log(`\n  Nom: ${example.name}`);
      console.log(`  Catégorie: ${example.category}`);
      console.log(`  Description: ${example.description?.substring(0, 80)}...`);
      console.log(`  Ingrédients: ${example.ingredients?.length || 0} items`);
      console.log(`  Étapes: ${example.preparationSteps?.length || 0} étapes`);
      console.log(`  Hashtags: ${example.hashtags?.join(', ') || 'Aucun'}`);
      if (example.nutritionalProfile) {
        console.log(`  Nutrition: ${example.nutritionalProfile.kcal}kcal, ${example.nutritionalProfile.protein}g protéines`);
      }
      if (example.ageGroup && example.ageGroup.min && example.ageGroup.max) {
        console.log(`  Âge: ${example.ageGroup.min} - ${example.ageGroup.max} ans`);
      }
    }
    
    console.log("\n" + "=".repeat(70));
    console.log("✨ RÉSUMÉ");
    console.log("=".repeat(70));
    console.log(`  🎉 ${total} recettes enrichies et prêtes pour l'IA`);
    console.log(`  ✅ ${withSteps} recettes avec instructions détaillées`);
    console.log(`  📊 ${withNutrition} recettes avec valeurs nutritionnelles précises`);
    console.log(`  👥 ${withAgeGroup} recettes avec tranches d'âge définies`);
    console.log("=".repeat(70));

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Génération du rapport final...\n");
generateFinalReport();

