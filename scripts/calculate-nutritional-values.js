import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import OpenAI from "openai";
import RecipeEnriched from "../models/Recipe.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function calculateNutritionalValues() {
  try {
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    
    console.log("✅ Connecté à MongoDB\n");

    // Trouver les recettes avec données nutritionnelles à 0 ou vides
    const recipesWithZeroNutrition = await RecipeEnriched.find({
      $or: [
        { "nutritionalProfile.kcal": 0 },
        { "nutritionalProfile.protein": 0 },
        { "nutritionalProfile.carbs": 0 },
        { nutritionalProfile: { $exists: false } },
        { nutritionalProfile: {} }
      ]
    });

    console.log(`📊 Recettes à traiter: ${recipesWithZeroNutrition.length}\n`);

    let updated = 0;
    let errors = 0;

    for (const recipe of recipesWithZeroNutrition) {
      try {
        console.log(`\n🔍 Traitement: ${recipe.name}`);
        
        // Préparer les ingrédients pour l'IA
        const ingredientsList = recipe.ingredients.map(ing => 
          `${ing.quantity || ''} ${ing.unit || ''} de ${ing.name}`.trim()
        ).join('\n');

        if (!ingredientsList || ingredientsList.trim() === '') {
          console.log(`⚠️  Pas d'ingrédients, skip`);
          continue;
        }

        // Demander à l'IA de calculer les valeurs nutritionnelles
        const prompt = `En tant que nutritionniste expert, calcule les valeurs nutritionnelles TOTALES pour cette recette (${recipe.portions || 1} portions).

Recette: ${recipe.name}
Ingrédients:
${ingredientsList}

Retourne UNIQUEMENT un objet JSON avec ces valeurs EXACTES par portion:
{
  "kcal": nombre,
  "protein": nombre (en grammes),
  "carbs": nombre (en grammes),
  "lipids": nombre (en grammes),
  "fiber": nombre (en grammes),
  "sodium": nombre (en mg)
}

Important: 
- Calcule pour 1 portion (divise le total par ${recipe.portions || 1})
- Sois précis et réaliste
- Ne retourne QUE le JSON, rien d'autre`;

        const completion = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { 
              role: "system", 
              content: "Tu es un nutritionniste expert. Tu réponds UNIQUEMENT avec du JSON valide, sans texte additionnel." 
            },
            { role: "user", content: prompt }
          ],
          temperature: 0.3,
          max_tokens: 200,
        });

        const response = completion.choices[0].message.content.trim();
        console.log(`📝 Réponse IA: ${response}`);

        // Parser la réponse JSON
        let nutritionalData;
        try {
          // Nettoyer la réponse si elle contient des markdown
          const cleanedResponse = response.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
          nutritionalData = JSON.parse(cleanedResponse);
        } catch (parseError) {
          console.log(`❌ Erreur de parsing JSON: ${parseError.message}`);
          errors++;
          continue;
        }

        // Mettre à jour la recette
        recipe.nutritionalProfile = {
          kcal: Math.round(nutritionalData.kcal || 0),
          protein: Math.round(nutritionalData.protein || 0),
          carbs: Math.round(nutritionalData.carbs || 0),
          lipids: Math.round(nutritionalData.lipids || 0),
          fiber: Math.round(nutritionalData.fiber || 0),
          sodium: Math.round(nutritionalData.sodium || 0),
        };

        await recipe.save();
        
        console.log(`✅ Mise à jour: kcal=${recipe.nutritionalProfile.kcal}, protein=${recipe.nutritionalProfile.protein}g, carbs=${recipe.nutritionalProfile.carbs}g, lipids=${recipe.nutritionalProfile.lipids}g`);
        updated++;

        // Pause pour éviter de surcharger l'API (rate limiting)
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`❌ Erreur pour "${recipe.name}":`, error.message);
        errors++;
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 RÉSUMÉ");
    console.log("=".repeat(60));
    console.log(`✅ Recettes mises à jour: ${updated}`);
    console.log(`❌ Erreurs: ${errors}`);
    console.log("=".repeat(60));

  } catch (error) {
    console.error("❌ Erreur générale:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n🔌 Déconnexion de MongoDB");
  }
}

console.log("🚀 Calcul des valeurs nutritionnelles...\n");
calculateNutritionalValues();

