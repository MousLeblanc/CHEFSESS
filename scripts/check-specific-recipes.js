import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

async function checkSpecificRecipes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses");
    
    const recipeNames = [
      "Boulettes de Dinde aux Légumes et Pois Chiches",
      "Cannellonis à la Ricotta, Épinards et Sauce Tomate Râpée"
    ];
    
    for (const name of recipeNames) {
      const recipe = await Recipe.findOne({ name: name });
      
      if (!recipe) {
        console.log(`❌ Recette non trouvée: "${name}"`);
        continue;
      }
      
      console.log(`\n📋 "${recipe.name}"`);
      console.log(`   ID: ${recipe._id}`);
      console.log(`   Catégorie: ${recipe.category}`);
      console.log(`   Texture: ${recipe.texture}`);
      console.log(`\n   Ingrédients (${recipe.ingredients?.length || 0}):`);
      
      if (recipe.ingredients && recipe.ingredients.length > 0) {
        recipe.ingredients.forEach((ing, i) => {
          console.log(`      ${i + 1}. ${ing.name}: ${ing.quantity}${ing.unit || 'g'}`);
        });
        
        // Vérifier la cohérence
        const nameLower = recipe.name.toLowerCase();
        const ingredientsText = recipe.ingredients.map(ing => ing.name.toLowerCase()).join(' ');
        
        console.log(`\n   Vérification:`);
        
        if (nameLower.includes('dinde')) {
          const hasDinde = ingredientsText.includes('dinde');
          console.log(`      ${hasDinde ? '✅' : '❌'} Dinde dans le titre: ${hasDinde ? 'Trouvée' : 'MANQUANTE'} dans les ingrédients`);
        }
        
        if (nameLower.includes('ricotta')) {
          const hasRicotta = ingredientsText.includes('ricotta');
          console.log(`      ${hasRicotta ? '✅' : '❌'} Ricotta dans le titre: ${hasRicotta ? 'Trouvée' : 'MANQUANTE'} dans les ingrédients`);
        }
        
        if (nameLower.includes('épinard') || nameLower.includes('epinard')) {
          const hasEpinards = ingredientsText.includes('épinard') || ingredientsText.includes('epinard');
          console.log(`      ${hasEpinards ? '✅' : '❌'} Épinards dans le titre: ${hasEpinards ? 'Trouvés' : 'MANQUANTS'} dans les ingrédients`);
        }
        
        if (nameLower.includes('tomate')) {
          const hasTomate = ingredientsText.includes('tomate');
          console.log(`      ${hasTomate ? '✅' : '❌'} Tomate dans le titre: ${hasTomate ? 'Trouvée' : 'MANQUANTE'} dans les ingrédients`);
        }
        
        if (nameLower.includes('pois chiche')) {
          const hasPoisChiches = ingredientsText.includes('pois chiche');
          console.log(`      ${hasPoisChiches ? '✅' : '❌'} Pois chiches dans le titre: ${hasPoisChiches ? 'Trouvés' : 'MANQUANTS'} dans les ingrédients`);
        }
        
      } else {
        console.log(`      ❌ Aucun ingrédient trouvé`);
      }
      
      console.log(`\n   Instructions: ${recipe.preparationSteps?.length || 0} étapes`);
    }
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

checkSpecificRecipes();

