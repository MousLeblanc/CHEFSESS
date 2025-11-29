import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

const EU_ALLERGENS = {
  'gluten': { keywords: ['blé', 'wheat', 'gluten', 'farine', 'flour', 'semoule', 'semolina', 'pâtes', 'pasta', 'pain', 'bread', 'boulgour', 'bulgour', 'couscous'] },
  'lait': { keywords: ['lait', 'milk', 'fromage', 'cheese', 'yaourt', 'yogurt', 'crème', 'cream', 'beurre', 'butter', 'lactose', 'dairy', 'laitier'] },
  'oeufs': { keywords: ['œuf', 'oeuf', 'egg', 'œufs', 'oeufs', 'eggs', 'jaune', 'yolk', 'blanc d\'œuf', 'blanc d\'oeuf', 'egg white', 'mayonnaise', 'mayo', 'mousse', 'soufflé'] },
  'poisson': { keywords: ['poisson', 'fish', 'saumon', 'salmon', 'cabillaud', 'cod', 'thon', 'tuna', 'truite', 'trout', 'sardine', 'merlan', 'sole'] },
  'crustaces': { keywords: ['crevette', 'shrimp', 'crabe', 'crab', 'langouste', 'lobster', 'homard', 'langoustine'] },
  'mollusques': { keywords: ['moule', 'mussel', 'huître', 'oyster', 'coquille', 'shell', 'pétoncle', 'scallop'] },
  'celeri': { keywords: ['céleri', 'celery', 'celeri'] }
};

function detectAllergen(ingredients, allergenKey) {
  const keywords = EU_ALLERGENS[allergenKey]?.keywords || [];
  const ingredientsText = ingredients.map(ing => ing.name.toLowerCase()).join(' ');
  return keywords.some(keyword => {
    const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return regex.test(ingredientsText);
  });
}

async function verifyCorrections() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses");
    const recipes = await Recipe.find({ name: /Pad Thaï|crevette|Crevette/i });
    
    recipes.forEach(recipe => {
      console.log(`\n"${recipe.name}"`);
      console.log(`   Ingrédients: ${recipe.ingredients.map(ing => ing.name).join(', ')}`);
      console.log(`   Allergènes déclarés: ${(recipe.allergens || []).join(', ')}`);
      const hasCrustaces = detectAllergen(recipe.ingredients, 'crustaces');
      console.log(`   Crustacés détectés: ${hasCrustaces ? 'OUI' : 'NON'}`);
    });
    
    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

verifyCorrections();

