import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function checkAllRecipeCollections() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    const db = mongoose.connection.db;
    
    // Lister toutes les collections
    const collections = await db.listCollections().toArray();
    console.log("📚 Collections disponibles:");
    collections.forEach(col => {
      console.log(`  - ${col.name}`);
    });

    // Vérifier spécifiquement les collections de recettes
    const recipeCollections = collections.filter(col => 
      col.name.toLowerCase().includes('recipe')
    );

    console.log(`\n🍳 Collections de recettes trouvées: ${recipeCollections.length}\n`);

    for (const col of recipeCollections) {
      const collection = db.collection(col.name);
      const count = await collection.countDocuments();
      console.log(`📊 ${col.name}: ${count} documents`);

      // Chercher des documents avec ageGroup
      const withAgeGroup = await collection.find({
        ageGroup: { $exists: true, $ne: null, $ne: {} }
      }).limit(3).toArray();

      if (withAgeGroup.length > 0) {
        console.log(`   ✅ ${withAgeGroup.length} documents avec ageGroup:`);
        withAgeGroup.forEach(doc => {
          console.log(`      - ${doc.name}: ageGroup = ${JSON.stringify(doc.ageGroup)}`);
        });
      } else {
        console.log(`   ❌ Aucun document avec ageGroup`);
      }
      console.log();
    }

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("🔌 Déconnexion de MongoDB");
  }
}

console.log("🔍 Vérification de toutes les collections de recettes...\n");
checkAllRecipeCollections();

