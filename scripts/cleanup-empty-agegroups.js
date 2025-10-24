import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import RecipeEnriched from "../models/Recipe.js";

async function cleanupEmptyAgeGroups() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    // Supprimer tous les champs ageGroup vides
    const result = await RecipeEnriched.updateMany(
      { 
        $or: [
          { ageGroup: {} },
          { "ageGroup.min": { $exists: false }, "ageGroup.max": { $exists: false } }
        ]
      },
      { $unset: { ageGroup: "" } }
    );

    console.log(`🧹 Champs ageGroup vides supprimés: ${result.modifiedCount}`);

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Nettoyage des champs ageGroup vides...\n");
cleanupEmptyAgeGroups();

