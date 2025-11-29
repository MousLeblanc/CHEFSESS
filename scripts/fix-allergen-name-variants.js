import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

// Normaliser les noms d'allergènes
const ALLERGEN_NORMALIZATION = {
  'céléri': 'celeri',
  'celeri': 'celeri',
  'céleri': 'celeri',
  'celery': 'celeri',
  'oeufs': 'oeufs',
  'oeuf': 'oeufs',
  'œufs': 'oeufs',
  'œuf': 'oeufs',
  'eggs': 'oeufs',
  'lait': 'lait',
  'lactose': 'lait',
  'milk': 'lait',
  'dairy': 'lait',
  'gluten': 'gluten',
  'blé': 'gluten',
  'wheat': 'gluten',
  'crustaces': 'crustaces',
  'crustacés': 'crustaces',
  'mollusques': 'mollusques',
  'sesame': 'sesame',
  'sésame': 'sesame'
};

function normalizeAllergenName(name) {
  if (!name) return '';
  const normalized = String(name).toLowerCase().trim();
  return ALLERGEN_NORMALIZATION[normalized] || normalized;
}

async function fixAllergenNameVariants() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses");
    const recipes = await Recipe.find({});
    
    let fixed = 0;
    
    for (const recipe of recipes) {
      if (!recipe.allergens || !Array.isArray(recipe.allergens)) continue;
      
      const normalized = recipe.allergens.map(normalizeAllergenName);
      const unique = [...new Set(normalized)].sort();
      
      if (JSON.stringify(unique) !== JSON.stringify(recipe.allergens.sort())) {
        recipe.allergens = unique;
        await recipe.save();
        fixed++;
      }
    }
    
    console.log(`✅ ${fixed} recette(s) corrigée(s) (normalisation des noms d'allergènes)`);
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

fixAllergenNameVariants();

