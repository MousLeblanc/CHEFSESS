import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function inspectAgeGroupData() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    // Accéder directement à la collection sans passer par le modèle
    const db = mongoose.connection.db;
    const collection = db.collection('recipeenricheds');
    
    // Compter le total
    const total = await collection.countDocuments();
    console.log(`📊 Total de documents: ${total}\n`);

    // Chercher des documents avec ageGroup (n'importe quel type)
    const withAgeGroup = await collection.find({ 
      ageGroup: { $exists: true, $ne: null, $ne: {} }
    }).limit(10).toArray();
    
    console.log(`🔍 Documents avec ageGroup (non vide): ${withAgeGroup.length}`);
    
    if (withAgeGroup.length > 0) {
      console.log("\nExemples:");
      withAgeGroup.forEach(doc => {
        console.log(`\n- ${doc.name}`);
        console.log(`  Type de ageGroup: ${typeof doc.ageGroup}`);
        console.log(`  Valeur: ${JSON.stringify(doc.ageGroup)}`);
      });
    }

    // Chercher spécifiquement des strings ageGroup
    const withStringAgeGroup = await collection.find({
      ageGroup: { $type: "string" }
    }).limit(10).toArray();
    
    console.log(`\n📝 Documents avec ageGroup en string: ${withStringAgeGroup.length}`);
    if (withStringAgeGroup.length > 0) {
      withStringAgeGroup.forEach(doc => {
        console.log(`  - ${doc.name}: "${doc.ageGroup}"`);
      });
    }

    // Chercher des objets ageGroup non vides
    const withObjectAgeGroup = await collection.find({
      $or: [
        { "ageGroup.min": { $exists: true } },
        { "ageGroup.max": { $exists: true } }
      ]
    }).limit(10).toArray();
    
    console.log(`\n📦 Documents avec ageGroup objet (min/max): ${withObjectAgeGroup.length}`);
    if (withObjectAgeGroup.length > 0) {
      withObjectAgeGroup.forEach(doc => {
        console.log(`  - ${doc.name}: min=${doc.ageGroup?.min}, max=${doc.ageGroup?.max}`);
      });
    }

    // Compter les ageGroup vides
    const emptyAgeGroup = await collection.countDocuments({
      ageGroup: { $eq: {} }
    });
    console.log(`\n🗑️  Documents avec ageGroup vide ({}): ${emptyAgeGroup}`);

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🔍 Inspection des données ageGroup...\n");
inspectAgeGroupData();

