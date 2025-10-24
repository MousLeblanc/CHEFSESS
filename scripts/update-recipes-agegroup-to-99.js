import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function updateRecipesAgeGroupTo99() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    const db = mongoose.connection.db;
    const collection = db.collection('recipes');
    
    const total = await collection.countDocuments();
    console.log(`📊 Total de documents dans 'recipes': ${total}\n`);

    // Trouver toutes les recettes avec ageGroup
    const withAgeGroup = await collection.find({
      ageGroup: { $exists: true, $ne: null, $ne: "" }
    }).toArray();

    console.log(`🔍 Recettes avec ageGroup: ${withAgeGroup.length}\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const recipe of withAgeGroup) {
      try {
        let newAgeGroup = null;
        const oldAgeGroup = recipe.ageGroup;

        console.log(`\n📝 ${recipe.name || 'Sans nom'}`);
        console.log(`   Avant: ${JSON.stringify(oldAgeGroup)}`);

        // Cas 1: ageGroup est un string (ex: "2.5-18", "18+", "0-3")
        if (typeof oldAgeGroup === 'string') {
          // Format "X-Y" (ex: "2.5-18")
          const rangeMatch = oldAgeGroup.match(/(\d+\.?\d*)\s*-\s*(\d+\.?\d*)/);
          if (rangeMatch) {
            const minAge = parseFloat(rangeMatch[1]);
            const maxAge = parseFloat(rangeMatch[2]);
            newAgeGroup = { min: minAge, max: 99 };
            console.log(`   Après: { min: ${minAge}, max: 99 }`);
          }
          // Format "X+" (ex: "18+")
          else if (oldAgeGroup.match(/(\d+\.?\d*)\+/)) {
            const plusMatch = oldAgeGroup.match(/(\d+\.?\d*)\+/);
            const minAge = parseFloat(plusMatch[1]);
            newAgeGroup = { min: minAge, max: 99 };
            console.log(`   Après: { min: ${minAge}, max: 99 }`);
          }
          // Format "X" seul
          else if (oldAgeGroup.match(/^\d+\.?\d*$/)) {
            const minAge = parseFloat(oldAgeGroup);
            newAgeGroup = { min: minAge, max: 99 };
            console.log(`   Après: { min: ${minAge}, max: 99 }`);
          }
          else {
            console.log(`   ⚠️  Format non reconnu, skip`);
            skipped++;
            continue;
          }
        }
        // Cas 2: ageGroup est déjà un objet
        else if (typeof oldAgeGroup === 'object') {
          const minAge = oldAgeGroup.min || 0;
          const maxAge = oldAgeGroup.max || 99;
          
          if (maxAge < 99) {
            newAgeGroup = { min: minAge, max: 99 };
            console.log(`   Après: { min: ${minAge}, max: 99 }`);
          } else {
            console.log(`   ✓ Déjà OK (max >= 99)`);
            skipped++;
            continue;
          }
        }

        // Mettre à jour la recette
        if (newAgeGroup) {
          await collection.updateOne(
            { _id: recipe._id },
            { $set: { ageGroup: newAgeGroup } }
          );
          updated++;
          console.log(`   ✅ Mise à jour effectuée`);
        }

      } catch (error) {
        console.error(`   ❌ Erreur: ${error.message}`);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(60));
    console.log(`✅ Recettes mises à jour: ${updated}`);
    console.log(`⏭️  Recettes déjà OK / ignorées: ${skipped}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log("=".repeat(60));

    // Afficher quelques exemples finaux
    if (updated > 0) {
      console.log("\n📋 Vérification - Exemples de recettes mises à jour:");
      const updatedRecipes = await collection.find({
        "ageGroup.max": 99,
        "ageGroup.min": { $exists: true }
      }).limit(5).toArray();
      
      updatedRecipes.forEach(r => {
        console.log(`  - ${r.name || 'Sans nom'}: ${r.ageGroup.min} → 99 ans`);
      });
    }

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Mise à jour des ageGroup de la collection 'recipes' vers 99 ans...\n");
updateRecipesAgeGroupTo99();

