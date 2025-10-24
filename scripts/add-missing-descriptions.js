import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import OpenAI from "openai";
import RecipeEnriched from "../models/Recipe.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function addMissingDescriptions() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    // Trouver les recettes sans description ou sans hashtags
    const recipesNeedingEnrichment = await RecipeEnriched.find({
      $or: [
        { description: { $exists: false } },
        { description: "" },
        { description: null },
        { hashtags: { $exists: false } },
        { hashtags: [] },
        { hashtags: null }
      ]
    });

    console.log(`📊 Recettes à enrichir: ${recipesNeedingEnrichment.length}\n`);

    if (recipesNeedingEnrichment.length === 0) {
      console.log("✅ Toutes les recettes sont déjà enrichies !");
      return;
    }

    let enriched = 0;
    let errors = 0;

    for (const recipe of recipesNeedingEnrichment) {
      try {
        console.log(`\n🔄 ${recipe.name}`);

        // Construire le prompt
        const prompt = `Tu es un chef professionnel. Génère pour cette recette:

Nom: ${recipe.name}
Catégorie: ${recipe.category}
Texture: ${recipe.texture || 'Normale'}
Régimes: ${recipe.diet?.join(', ') || 'Aucun'}

Retourne un objet JSON avec:
{
  "description": "une description courte et appétissante (1-2 phrases)",
  "hashtags": ["5 à 7 hashtags pertinents avec #"]
}`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "Tu es un chef. Réponds UNIQUEMENT avec du JSON valide." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 300,
          response_format: { type: "json_object" }
        });

        const enrichmentData = JSON.parse(completion.choices[0].message.content.trim());

        const updates = {};
        if (!recipe.description && enrichmentData.description) {
          updates.description = enrichmentData.description;
        }
        if ((!recipe.hashtags || recipe.hashtags.length === 0) && enrichmentData.hashtags) {
          updates.hashtags = enrichmentData.hashtags;
        }

        if (Object.keys(updates).length > 0) {
          await RecipeEnriched.updateOne(
            { _id: recipe._id },
            { $set: updates }
          );
          console.log(`✅ ${Object.keys(updates).join(', ')}`);
          enriched++;
        }

        await new Promise(resolve => setTimeout(resolve, 400));

      } catch (error) {
        console.error(`❌ Erreur:`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Enrichies: ${enriched} | ❌ Erreurs: ${errors}`);
    console.log("=".repeat(60));

    // Stats finales
    const total = await RecipeEnriched.countDocuments();
    const withDesc = await RecipeEnriched.countDocuments({
      description: { $exists: true, $ne: "", $ne: null }
    });
    const withHashtags = await RecipeEnriched.countDocuments({
      hashtags: { $exists: true, $ne: [], $not: { $size: 0 } }
    });

    console.log(`\n📊 Descriptions: ${withDesc}/${total} (${Math.round(withDesc/total*100)}%)`);
    console.log(`📊 Hashtags: ${withHashtags}/${total} (${Math.round(withHashtags/total*100)}%)`);

  } catch (error) {
    console.error("❌ Erreur:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion");
  }
}

console.log("🚀 Ajout des descriptions et hashtags manquants...\n");
addMissingDescriptions();

