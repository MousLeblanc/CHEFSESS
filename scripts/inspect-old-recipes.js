import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function inspectOldRecipes() {
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
    
    // Prendre 5 exemples
    const samples = await oldCollection.find({}).limit(5).toArray();
    
    console.log("📋 Exemples de recettes dans la collection 'recipes':\n");
    
    samples.forEach((recipe, idx) => {
      console.log(`\n${"=".repeat(60)}`);
      console.log(`Recette #${idx + 1}:`);
      console.log(`${"=".repeat(60)}`);
      console.log(JSON.stringify(recipe, null, 2));
    });

    // Vérifier quels champs existent
    console.log("\n" + "=".repeat(60));
    console.log("📊 ANALYSE DES CHAMPS");
    console.log("=".repeat(60));
    
    const allRecipes = await oldCollection.find({}).toArray();
    const fieldStats = {};
    
    allRecipes.forEach(recipe => {
      Object.keys(recipe).forEach(key => {
        if (!fieldStats[key]) {
          fieldStats[key] = 0;
        }
        fieldStats[key]++;
      });
    });
    
    console.log("\nChamps présents dans la collection 'recipes':");
    Object.entries(fieldStats)
      .sort((a, b) => b[1] - a[1])
      .forEach(([field, count]) => {
        const percentage = Math.round((count / allRecipes.length) * 100);
        console.log(`  - ${field}: ${count}/${allRecipes.length} (${percentage}%)`);
      });

    // Compter les valeurs uniques de category et type
    console.log("\n" + "=".repeat(60));
    console.log("📊 VALEURS DE CATEGORY");
    console.log("=".repeat(60));
    const categories = {};
    allRecipes.forEach(r => {
      const cat = r.category || 'undefined';
      categories[cat] = (categories[cat] || 0) + 1;
    });
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`  - ${cat}: ${count}`);
    });

    console.log("\n" + "=".repeat(60));
    console.log("📊 VALEURS DE TYPE");
    console.log("=".repeat(60));
    const types = {};
    allRecipes.forEach(r => {
      const type = r.type || 'undefined';
      types[type] = (types[type] || 0) + 1;
    });
    Object.entries(types).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🔍 Inspection de la collection 'recipes'...\n");
inspectOldRecipes();

