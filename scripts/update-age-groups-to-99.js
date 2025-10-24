import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import RecipeEnriched from "../models/Recipe.js";

async function updateAgeGroupsTo99() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    // Trouver toutes les recettes
    const allRecipes = await RecipeEnriched.find({});
    console.log(`📊 Total de recettes à vérifier: ${allRecipes.length}\n`);

    let updated = 0;
    let skipped = 0;
    let fixed = 0;

    for (const recipe of allRecipes) {
      let needsUpdate = false;
      let newAgeGroup = { min: 0, max: 99 };

      // Cas 1: ageGroup est un string (ex: "2.5-18")
      if (typeof recipe.ageGroup === 'string' && recipe.ageGroup.trim() !== '') {
        const match = recipe.ageGroup.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
        if (match) {
          const minAge = parseFloat(match[1]);
          const maxAge = parseFloat(match[2]);
          
          if (maxAge < 99) {
            console.log(`📝 ${recipe.name}`);
            console.log(`   Avant: "${recipe.ageGroup}" (string)`);
            newAgeGroup = { min: minAge, max: 99 };
            needsUpdate = true;
            console.log(`   Après: min=${minAge}, max=99 (objet)`);
          }
        }
      }
      // Cas 2: ageGroup est un objet avec min et/ou max
      else if (recipe.ageGroup && typeof recipe.ageGroup === 'object') {
        const ageGroup = recipe.ageGroup;
        
        // Si c'est un objet vide, on le supprime
        if (Object.keys(ageGroup).length === 0) {
          recipe.ageGroup = undefined;
          await recipe.save();
          fixed++;
          continue;
        }
        
        const minAge = ageGroup.min || 0;
        const maxAge = ageGroup.max || 99;
        
        if (maxAge < 99) {
          console.log(`📝 ${recipe.name}`);
          console.log(`   Avant: min=${minAge}, max=${maxAge}`);
          newAgeGroup = { min: minAge, max: 99 };
          needsUpdate = true;
          console.log(`   Après: min=${minAge}, max=99`);
        }
      }

      if (needsUpdate) {
        recipe.ageGroup = newAgeGroup;
        await recipe.save();
        updated++;
      } else {
        skipped++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(60));
    console.log(`✅ Recettes mises à jour (max → 99): ${updated}`);
    console.log(`🧹 Objets ageGroup vides supprimés: ${fixed}`);
    console.log(`⏭️  Recettes déjà OK: ${skipped}`);
    console.log("=".repeat(60));

    // Afficher quelques exemples finaux
    if (updated > 0) {
      console.log("\n📋 Exemples de recettes mises à jour:");
      const updatedRecipes = await RecipeEnriched.find({
        "ageGroup.max": 99,
        "ageGroup.min": { $exists: true }
      }).limit(5);
      
      updatedRecipes.forEach(r => {
        console.log(`  - ${r.name}: ${r.ageGroup.min} → 99 ans`);
      });
    }

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Mise à jour des ageGroup vers 99 ans...\n");
updateAgeGroupsTo99();

