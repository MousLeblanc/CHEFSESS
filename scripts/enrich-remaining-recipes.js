import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import OpenAI from "openai";
import RecipeEnriched from "../models/Recipe.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function enrichRemainingRecipes() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    // Trouver les recettes sans description détaillée
    const recipesToEnrich = await RecipeEnriched.find({
      $or: [
        { description: { $exists: false } },
        { description: "" },
        { description: null }
      ]
    });

    console.log(`📊 Recettes à enrichir: ${recipesToEnrich.length}\n`);

    if (recipesToEnrich.length === 0) {
      console.log("✅ Toutes les recettes sont déjà enrichies !");
      return;
    }

    let enriched = 0;
    let errors = 0;

    for (const recipe of recipesToEnrich) {
      try {
        console.log(`\n🔄 Traitement: ${recipe.name}`);

        // Préparer les informations de la recette
        const ingredientsList = recipe.ingredients && recipe.ingredients.length > 0
          ? recipe.ingredients.map(ing => 
              `${ing.quantity || ''} ${ing.unit || ''} de ${ing.name}`.trim()
            ).join('\n')
          : 'Non spécifié';

        const stepsText = recipe.preparationSteps && recipe.preparationSteps.length > 0
          ? recipe.preparationSteps.join('\n')
          : 'Non spécifié';

        // Demander à l'IA de générer une description et des instructions détaillées
        const prompt = `Tu es un chef cuisinier professionnel. Voici une recette à enrichir:

Nom: ${recipe.name}
Catégorie: ${recipe.category}
Type d'établissement: ${recipe.establishmentType?.join(', ') || 'Général'}
Texture: ${recipe.texture || 'Normale'}
Régimes: ${recipe.diet?.join(', ') || 'Aucun'}
Pathologies: ${recipe.pathologies?.join(', ') || 'Aucune'}
Portions: ${recipe.portions || 4}

Ingrédients actuels:
${ingredientsList}

Instructions actuelles:
${stepsText}

Génère un enrichissement complet de cette recette avec:
1. Une description courte et appétissante (1-2 phrases)
2. Des instructions détaillées étape par étape (si les instructions actuelles sont vagues ou manquantes)
3. Des hashtags pertinents (5-7 tags)

Retourne UNIQUEMENT un objet JSON avec cette structure:
{
  "description": "description courte et appétissante",
  "preparationSteps": ["étape 1 détaillée", "étape 2 détaillée", ...],
  "hashtags": ["#tag1", "#tag2", ...]
}

Important:
- Si les instructions actuelles sont déjà détaillées, garde-les telles quelles
- Si elles sont vagues ou manquantes, améliore-les
- Les hashtags doivent être pertinents pour la recherche (type de plat, régime, pathologie, etc.)`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "Tu es un chef cuisinier expert. Tu réponds UNIQUEMENT avec du JSON valide, sans texte additionnel." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: "json_object" }
        });

        const response = completion.choices[0].message.content.trim();
        
        // Parser la réponse JSON
        let enrichmentData;
        try {
          enrichmentData = JSON.parse(response);
        } catch (parseError) {
          console.log(`❌ Erreur de parsing JSON: ${parseError.message}`);
          errors++;
          continue;
        }

        // Mettre à jour la recette
        const updates = {};
        
        if (enrichmentData.description) {
          updates.description = enrichmentData.description;
        }
        
        // Mettre à jour les instructions seulement si elles sont meilleures
        if (enrichmentData.preparationSteps && enrichmentData.preparationSteps.length > 0) {
          if (!recipe.preparationSteps || recipe.preparationSteps.length === 0) {
            updates.preparationSteps = enrichmentData.preparationSteps;
          } else if (enrichmentData.preparationSteps.length > recipe.preparationSteps.length) {
            // Si l'IA a fourni plus d'étapes, on les utilise
            updates.preparationSteps = enrichmentData.preparationSteps;
          }
        }
        
        if (enrichmentData.hashtags && enrichmentData.hashtags.length > 0) {
          updates.hashtags = enrichmentData.hashtags;
        }

        if (Object.keys(updates).length > 0) {
          await RecipeEnriched.updateOne(
            { _id: recipe._id },
            { $set: updates }
          );
          
          console.log(`✅ Enrichie avec: ${Object.keys(updates).join(', ')}`);
          console.log(`   Description: ${enrichmentData.description?.substring(0, 60)}...`);
          enriched++;
        } else {
          console.log(`⏭️  Aucune amélioration nécessaire`);
        }

        // Pause pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Erreur pour "${recipe.name}":`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ DE L'ENRICHISSEMENT");
    console.log("=".repeat(60));
    console.log(`✅ Recettes enrichies: ${enriched}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log("=".repeat(60));

    // Vérification finale
    console.log("\n🔍 Vérification finale...");
    const totalRecipes = await RecipeEnriched.countDocuments();
    const withDescription = await RecipeEnriched.countDocuments({
      description: { $exists: true, $ne: "", $ne: null }
    });
    const withSteps = await RecipeEnriched.countDocuments({
      preparationSteps: { $exists: true, $ne: [], $not: { $size: 0 } }
    });
    const withHashtags = await RecipeEnriched.countDocuments({
      hashtags: { $exists: true, $ne: [], $not: { $size: 0 } }
    });

    console.log(`\n📈 Statistiques finales:`);
    console.log(`   - Total de recettes: ${totalRecipes}`);
    console.log(`   - Avec description: ${withDescription}/${totalRecipes} (${Math.round(withDescription/totalRecipes*100)}%)`);
    console.log(`   - Avec instructions: ${withSteps}/${totalRecipes} (${Math.round(withSteps/totalRecipes*100)}%)`);
    console.log(`   - Avec hashtags: ${withHashtags}/${totalRecipes} (${Math.round(withHashtags/totalRecipes*100)}%)`);

    if (enriched > 0) {
      console.log("\n✅ Enrichissement terminé avec succès !");
      console.log("🎉 Toutes les recettes ont maintenant un niveau de détail similaire !");
    }

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Enrichissement des recettes restantes avec l'IA...\n");
enrichRemainingRecipes();

