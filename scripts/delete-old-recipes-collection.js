import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

async function deleteOldRecipesCollection() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    const db = mongoose.connection.db;
    
    // Vérifier que la collection existe
    const collections = await db.listCollections({ name: 'recipes' }).toArray();
    
    if (collections.length === 0) {
      console.log("⚠️  La collection 'recipes' n'existe pas ou a déjà été supprimée.");
      return;
    }

    // Compter les documents avant suppression
    const oldCollection = db.collection('recipes');
    const count = await oldCollection.countDocuments();
    
    console.log(`📊 Collection 'recipes' trouvée: ${count} documents`);
    console.log("\n⚠️  ATTENTION: Cette action est IRRÉVERSIBLE !");
    console.log("   Toutes les données de la collection 'recipes' seront supprimées.\n");
    
    // Vérification de sécurité finale
    console.log("🔍 Vérification finale avant suppression...\n");
    
    const newCollection = db.collection('recipeenricheds');
    const newCount = await newCollection.countDocuments();
    
    console.log(`✅ Collection 'recipeenricheds': ${newCount} documents`);
    console.log(`❌ Collection 'recipes': ${count} documents\n`);
    
    if (newCount < count) {
      console.log("⚠️  AVERTISSEMENT: recipeenricheds a MOINS de documents que recipes !");
      console.log(`   Différence: ${count - newCount} recettes`);
      console.log("\n❌ Suppression annulée par sécurité.");
      console.log("💡 Veuillez vérifier que toutes les recettes ont bien été migrées.");
      return;
    }
    
    // Supprimer la collection
    console.log("🗑️  Suppression de la collection 'recipes'...");
    await oldCollection.drop();
    
    console.log("\n" + "=".repeat(60));
    console.log("✅ Collection 'recipes' supprimée avec succès !");
    console.log("=".repeat(60));
    
    // Vérifier les collections restantes
    const remainingCollections = await db.listCollections().toArray();
    console.log(`\n📚 Collections restantes dans la base de données:`);
    remainingCollections.forEach(col => {
      console.log(`  - ${col.name}`);
    });
    
    console.log(`\n✨ Nettoyage terminé !`);
    console.log(`📊 La collection 'recipeenricheds' contient maintenant ${newCount} recettes.`);

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Suppression de l'ancienne collection 'recipes'...\n");
deleteOldRecipesCollection();

