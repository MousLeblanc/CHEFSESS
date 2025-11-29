/**
 * Script pour vérifier les allergènes de recettes spécifiques
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

async function verifyRecipesAllergens() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses");
    
    const searchTerms = [
      "Cannellonis",
      "Waterzooi",
      "Cabillaud"
    ];
    
    console.log('🔍 Recherche des recettes...\n');
    
    for (const term of searchTerms) {
      const recipes = await Recipe.find({ 
        name: { $regex: term, $options: 'i' } 
      });
      
      console.log(`\n📋 Recettes contenant "${term}":`);
      recipes.forEach(recipe => {
        console.log(`\n   "${recipe.name}"`);
        console.log(`   Allergènes: ${(recipe.allergens || []).join(', ') || 'AUCUN'}`);
        console.log(`   Ingrédients (premiers 5): ${(recipe.ingredients || []).slice(0, 5).map(ing => ing.name).join(', ')}`);
      });
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

verifyRecipesAllergens();

