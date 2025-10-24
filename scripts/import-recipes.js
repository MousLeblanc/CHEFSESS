import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import RecipeEnriched from "../models/Recipe.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fichiers JSON à importer
const recipeFiles = [
  "C:\\Users\\artkl\\Downloads\\recettes_ehpad.json",
  "C:\\Users\\artkl\\Downloads\\recettes_protidiques.json",
  "C:\\Users\\artkl\\Downloads\\recettes_ehpad (1).json",
  "C:\\Users\\artkl\\Downloads\\recettes_protidiques (1).json"
];

async function importRecipes() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    console.log(`🔗 Connexion à MongoDB: ${mongoUri}`);
    
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB");

    let totalImported = 0;
    let totalSkipped = 0;
    let totalErrors = 0;

    // Traiter chaque fichier
    for (const filePath of recipeFiles) {
      console.log(`\n📁 Traitement du fichier: ${path.basename(filePath)}`);
      
      // Vérifier si le fichier existe
      if (!fs.existsSync(filePath)) {
        console.log(`⚠️  Fichier non trouvé: ${filePath}`);
        continue;
      }

      // Lire le fichier JSON
      const fileContent = fs.readFileSync(filePath, "utf8");
      const recipes = JSON.parse(fileContent);
      
      console.log(`📊 ${recipes.length} recettes trouvées dans le fichier`);

      // Importer chaque recette
      for (const recipe of recipes) {
        try {
          // Vérifier si la recette existe déjà (par nom)
          const existingRecipe = await RecipeEnriched.findOne({ name: recipe.name });
          
          if (existingRecipe) {
            console.log(`⏭️  Recette déjà existante: ${recipe.name}`);
            totalSkipped++;
            continue;
          }

          // Normaliser les données pour s'assurer de la compatibilité
          const recipeData = {
            name: recipe.name,
            category: recipe.category,
            establishmentType: recipe.establishmentType || [],
            texture: recipe.texture || "normale",
            diet: recipe.diet || [],
            pathologies: recipe.pathologies || [],
            allergens: recipe.allergens || [],
            nutritionalProfile: recipe.nutritionalProfile || {},
            ingredients: recipe.ingredients || [],
            preparationSteps: recipe.preparationSteps || [],
            compatibleFor: recipe.compatibleFor || [],
            aiCompatibilityScore: recipe.aiCompatibilityScore || 1.0
          };

          // Créer la nouvelle recette
          const newRecipe = new RecipeEnriched(recipeData);
          await newRecipe.save();
          
          console.log(`✅ Importée: ${recipe.name}`);
          totalImported++;
          
        } catch (error) {
          console.error(`❌ Erreur lors de l'import de "${recipe.name}":`, error.message);
          totalErrors++;
        }
      }
    }

    // Statistiques finales
    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ DE L'IMPORT");
    console.log("=".repeat(60));
    console.log(`✅ Recettes importées: ${totalImported}`);
    console.log(`⏭️  Recettes déjà existantes: ${totalSkipped}`);
    console.log(`❌ Erreurs: ${totalErrors}`);
    console.log(`📈 Total traité: ${totalImported + totalSkipped + totalErrors}`);
    console.log("=".repeat(60));

    // Afficher le nombre total de recettes dans la base
    const totalInDb = await RecipeEnriched.countDocuments();
    console.log(`\n🗄️  Total de recettes dans la base de données: ${totalInDb}`);

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  } finally {
    // Fermer la connexion
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

// Exécuter l'import
console.log("🚀 Démarrage de l'import des recettes...\n");
importRecipes();

