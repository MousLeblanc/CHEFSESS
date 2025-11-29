/**
 * Script pour vérifier s'il reste des doublons dans la base de données
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import Recipe from "../models/Recipe.js";

function normalizeRecipeName(name) {
  if (!name || typeof name !== 'string') return '';
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

async function checkDuplicates() {
  try {
    console.log('🔗 Connexion à MongoDB...');
    const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/chef-ses";
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
    });
    console.log('✅ Connecté à MongoDB\n');
    
    const recipes = await Recipe.find({});
    console.log(`📚 ${recipes.length} recette(s) trouvée(s)\n`);
    
    const nameMap = new Map();
    recipes.forEach(recipe => {
      if (!recipe.name) return;
      const normalizedName = normalizeRecipeName(recipe.name);
      if (!nameMap.has(normalizedName)) {
        nameMap.set(normalizedName, []);
      }
      nameMap.get(normalizedName).push(recipe);
    });
    
    const duplicates = [];
    nameMap.forEach((recipes, normalizedName) => {
      if (recipes.length > 1) {
        duplicates.push({ normalizedName, recipes, count: recipes.length });
      }
    });
    
    if (duplicates.length === 0) {
      console.log('✅ Aucun doublon trouvé !');
    } else {
      console.log(`⚠️  ${duplicates.length} groupe(s) de doublons trouvé(s):\n`);
      duplicates.forEach((dup, index) => {
        console.log(`${index + 1}. "${dup.recipes[0].name}" (${dup.count} recettes)`);
        dup.recipes.forEach((r, i) => {
          console.log(`   ${i + 1}. ID: ${r._id}, Nom: "${r.name}"`);
        });
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('🔌 Déconnexion de MongoDB');
  }
}

checkDuplicates();

