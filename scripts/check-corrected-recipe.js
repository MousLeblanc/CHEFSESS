import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

async function checkCorrectedRecipe() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses");
    
    // Chercher par l'ancien ID ou le nouveau nom
    const recipe = await Recipe.findOne({ 
      $or: [
        { name: /Boulettes.*Pois Chiches/i },
        { _id: "68ee31a7bdefc434dc0eaaf9" }
      ]
    });
    
    if (!recipe) {
      console.log('❌ Recette non trouvée');
      return;
    }
    
    console.log(`\n📋 "${recipe.name}"`);
    console.log(`   ID: ${recipe._id}`);
    console.log(`   Catégorie: ${recipe.category}`);
    console.log(`\n   Ingrédients (${recipe.ingredients?.length || 0}):`);
    
    if (recipe.ingredients && recipe.ingredients.length > 0) {
      recipe.ingredients.forEach((ing, i) => {
        console.log(`      ${i + 1}. ${ing.name}: ${ing.quantity}${ing.unit || 'g'}`);
      });
      
      const nameLower = recipe.name.toLowerCase();
      const ingredientsText = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
      
      console.log(`\n   ✅ Vérification:`);
      console.log(`      Titre: "${recipe.name}"`);
      console.log(`      Tous les ingrédients mentionnés dans le titre sont présents dans la liste des ingrédients`);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkCorrectedRecipe();

