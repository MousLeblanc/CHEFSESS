import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import RecipeEnriched from "../models/Recipe.js";

async function fixAgeRestrictions() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    // Trouver les recettes avec des restrictions d'âge
    const recipesWithAgeGroup = await RecipeEnriched.find({
      "ageGroup.max": { $exists: true, $ne: null }
    });

    console.log(`📊 Recettes avec restrictions d'âge: ${recipesWithAgeGroup.length}\n`);

    if (recipesWithAgeGroup.length === 0) {
      console.log("✅ Aucune restriction d'âge trouvée. Tout est bon !");
      return;
    }

    let fixed = 0;
    let kept = 0;

    for (const recipe of recipesWithAgeGroup) {
      const ageGroup = recipe.ageGroup;
      console.log(`\n🔍 ${recipe.name}`);
      console.log(`   Age actuel: ${ageGroup.min || 0} - ${ageGroup.max || '∞'} ans`);

      // Si la recette est destinée aux EHPAD, hôpitaux ou collectivités
      // et a une restriction d'âge max < 60, on supprime la restriction
      const isForSeniors = recipe.establishmentType?.some(type => 
        ['ehpad', 'hopital', 'collectivite'].includes(type)
      ) || recipe.compatibleFor?.some(type => 
        ['ehpad', 'hopital', 'collectivite'].includes(type)
      );

      if (isForSeniors && ageGroup.max && ageGroup.max < 60) {
        console.log(`   ⚠️  Recette pour seniors mais max age = ${ageGroup.max} ans`);
        console.log(`   ✅ Suppression de la restriction d'âge`);
        
        // Supprimer le champ ageGroup
        recipe.ageGroup = undefined;
        await recipe.save();
        fixed++;
      } else {
        console.log(`   ✓ Restriction d'âge appropriée, conservée`);
        kept++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(60));
    console.log(`✅ Restrictions d'âge supprimées: ${fixed}`);
    console.log(`✓ Restrictions d'âge conservées: ${kept}`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Vérification des restrictions d'âge...\n");
fixAgeRestrictions();

